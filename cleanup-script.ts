#!/usr/bin/env node

/**
 * CLI Script: Cleanup Temporary Extracted Entities
 * 
 * Run this script to clean up extracted entities from abstracts
 * created before the temporary storage implementation.
 * 
 * Usage:
 *   node cleanup-script.js inspect         # See what you have
 *   node cleanup-script.js clear           # Clear non-approved (recommended)
 *   node cleanup-script.js clear-rejected  # Clear rejected only
 *   node cleanup-script.js clear-all       # Clear everything
 *   node cleanup-script.js verify          # Verify results
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

// Initialize Supabase client
// You'll need to set these environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log('\n📊 Inspecting extracted entities...\n');

  const { data, error } = await supabase
    .from('abstracts')
    .select('id, title, status, created_at, extracted_entities')
    .not('extracted_entities', 'is', null);

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  const stats = {
    total: data.length,
    pending: data.filter(a => a.status === 'pending').length,
    approved: data.filter(a => a.status === 'approved').length,
    rejected: data.filter(a => a.status === 'rejected').length,
  };

  console.log(`Total abstracts with entities: ${stats.total}`);
  console.log(`  • Pending: ${stats.pending}`);
  console.log(`  • Approved: ${stats.approved}`);
  console.log(`  • Rejected: ${stats.rejected}\n`);

  if (data.length > 0) {
    console.log('Sample abstracts:');
    data.slice(0, 5).forEach(a => {
      console.log(`  [${a.status}] ${a.title.substring(0, 60)}...`);
    });
  }
}

async function clearTemporary() {
  console.log('\n🧹 Clearing temporary extracted entities...');
  console.log('This will clear entities from pending and rejected abstracts.');
  console.log('Approved abstracts will be preserved.\n');

  const answer = await question('Continue? (yes/no): ');
  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Cancelled');
    return;
  }

  const { data: toClean, error: fetchError } = await supabase
    .from('abstracts')
    .select('id, status')
    .not('extracted_entities', 'is', null)
    .neq('status', 'approved');

  if (fetchError) {
    console.error('❌ Error:', fetchError.message);
    return;
  }

  console.log(`\nFound ${toClean.length} abstracts to clean...`);

  if (toClean.length === 0) {
    console.log('✅ Nothing to clean!');
    return;
  }

  const { error: updateError } = await supabase
    .from('abstracts')
    .update({ extracted_entities: null })
    .not('extracted_entities', 'is', null)
    .neq('status', 'approved');

  if (updateError) {
    console.error('❌ Error during cleanup:', updateError.message);
    return;
  }

  console.log(`✅ Successfully cleared ${toClean.length} abstracts!`);
}

async function clearRejected() {
  console.log('\n🧹 Clearing entities from rejected abstracts...\n');

  const answer = await question('Continue? (yes/no): ');
  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Cancelled');
    return;
  }

  const { data: toClean, error: fetchError } = await supabase
    .from('abstracts')
    .select('id')
    .not('extracted_entities', 'is', null)
    .eq('status', 'rejected');

  if (fetchError) {
    console.error('❌ Error:', fetchError.message);
    return;
  }

  if (toClean.length === 0) {
    console.log('✅ No rejected abstracts with entities found!');
    return;
  }

  const { error: updateError } = await supabase
    .from('abstracts')
    .update({ extracted_entities: null })
    .not('extracted_entities', 'is', null)
    .eq('status', 'rejected');

  if (updateError) {
    console.error('❌ Error during cleanup:', updateError.message);
    return;
  }

  console.log(`✅ Cleared ${toClean.length} rejected abstracts!`);
}

async function clearAll() {
  console.log('\n⚠️  WARNING: AGGRESSIVE CLEANUP');
  console.log('This will clear ALL extracted entities, including from approved abstracts!');
  console.log('Only use this if you want everyone to re-extract with new rules.\n');

  const answer = await question('Are you SURE? Type "yes I am sure": ');
  if (answer !== 'yes I am sure') {
    console.log('❌ Cancelled');
    return;
  }

  const { data: toClean, error: fetchError } = await supabase
    .from('abstracts')
    .select('id')
    .not('extracted_entities', 'is', null);

  if (fetchError) {
    console.error('❌ Error:', fetchError.message);
    return;
  }

  const { error: updateError } = await supabase
    .from('abstracts')
    .update({ extracted_entities: null })
    .not('extracted_entities', 'is', null);

  if (updateError) {
    console.error('❌ Error during cleanup:', updateError.message);
    return;
  }

  console.log(`✅ Cleared ALL ${toClean.length} abstracts!`);
}

async function verify() {
  console.log('\n📊 Verification Results...\n');

  const { data, error } = await supabase
    .from('abstracts')
    .select('status, extracted_entities');

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  const stats: Record<string, { total: number; with: number; without: number }> = {};

  data.forEach(a => {
    if (!stats[a.status]) {
      stats[a.status] = { total: 0, with: 0, without: 0 };
    }
    stats[a.status].total++;
    if (a.extracted_entities) {
      stats[a.status].with++;
    } else {
      stats[a.status].without++;
    }
  });

  console.log('Status      | Total | With Entities | Without Entities');
  console.log('----------- | ----- | ------------- | ----------------');
  Object.entries(stats).forEach(([status, s]) => {
    console.log(`${status.padEnd(11)} | ${s.total.toString().padStart(5)} | ${s.with.toString().padStart(13)} | ${s.without.toString().padStart(16)}`);
  });
}

async function main() {
  const command = process.argv[2];

  console.log('\n🛠️  Entity Cleanup Tool\n');

  switch (command) {
    case 'inspect':
      await inspect();
      break;
    case 'clear':
      await clearTemporary();
      break;
    case 'clear-rejected':
      await clearRejected();
      break;
    case 'clear-all':
      await clearAll();
      break;
    case 'verify':
      await verify();
      break;
    default:
      console.log('Usage:');
      console.log('  node cleanup-script.js inspect         # See what you have');
      console.log('  node cleanup-script.js clear           # Clear non-approved (recommended)');
      console.log('  node cleanup-script.js clear-rejected  # Clear rejected only');
      console.log('  node cleanup-script.js clear-all       # Clear everything');
      console.log('  node cleanup-script.js verify          # Verify results');
  }

  rl.close();
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
