/**
 * Utility to re-extract entities for existing abstracts with new classification rules
 * Run this script once to update all existing abstracts
 */

import { supabase } from './supabase';
import { performEntityExtraction } from './dandelion-api';

export async function reExtractAllEntities() {
  console.log('Starting re-extraction of entities for all abstracts...');
  
  try {
    // Fetch all abstracts that have extracted_entities
    const { data: abstracts, error } = await supabase
      .from('abstracts')
      .select('id, title, abstract, keywords')
      .not('extracted_entities', 'is', null);

    if (error) {
      console.error('Error fetching abstracts:', error);
      return { success: false, error };
    }

    if (!abstracts || abstracts.length === 0) {
      console.log('No abstracts found with extracted entities');
      return { success: true, updated: 0 };
    }

    console.log(`Found ${abstracts.length} abstracts to re-extract`);

    let updated = 0;
    let failed = 0;

    // Process each abstract
    for (const abstract of abstracts) {
      try {
        console.log(`Re-extracting entities for: ${abstract.title}`);
        
        // Parse keywords if they're stored as a string
        let keywordsArray: string[] = [];
        if (typeof abstract.keywords === 'string') {
          keywordsArray = abstract.keywords.split(',').map((k: string) => k.trim());
        } else if (Array.isArray(abstract.keywords)) {
          keywordsArray = abstract.keywords;
        }

        // Re-extract entities with new classification rules
        const entities = await performEntityExtraction(
          abstract.abstract || '',
          keywordsArray
        );

        // Update the abstract with new entities
        const { error: updateError } = await supabase
          .from('abstracts')
          .update({ extracted_entities: entities })
          .eq('id', abstract.id);

        if (updateError) {
          console.error(`Error updating abstract ${abstract.id}:`, updateError);
          failed++;
        } else {
          console.log(`✓ Updated: ${abstract.title}`);
          updated++;
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (err) {
        console.error(`Error processing abstract ${abstract.id}:`, err);
        failed++;
      }
    }

    console.log(`\n✅ Re-extraction complete!`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total: ${abstracts.length}`);

    return { success: true, updated, failed, total: abstracts.length };

  } catch (error) {
    console.error('Fatal error during re-extraction:', error);
    return { success: false, error };
  }
}

/**
 * Re-extract entities for a specific abstract by ID
 */
export async function reExtractSingleAbstract(abstractId: string) {
  console.log(`Re-extracting entities for abstract ID: ${abstractId}`);
  
  try {
    // Fetch the abstract
    const { data: abstract, error } = await supabase
      .from('abstracts')
      .select('id, title, abstract, keywords')
      .eq('id', abstractId)
      .single();

    if (error || !abstract) {
      console.error('Error fetching abstract:', error);
      return { success: false, error };
    }

    // Parse keywords
    let keywordsArray: string[] = [];
    if (typeof abstract.keywords === 'string') {
      keywordsArray = abstract.keywords.split(',').map((k: string) => k.trim());
    } else if (Array.isArray(abstract.keywords)) {
      keywordsArray = abstract.keywords;
    }

    // Re-extract entities
    const entities = await performEntityExtraction(
      abstract.abstract || '',
      keywordsArray
    );

    // Update the abstract
    const { error: updateError } = await supabase
      .from('abstracts')
      .update({ extracted_entities: entities })
      .eq('id', abstractId);

    if (updateError) {
      console.error('Error updating abstract:', updateError);
      return { success: false, error: updateError };
    }

    console.log(`✅ Successfully re-extracted entities for: ${abstract.title}`);
    return { success: true, entities };

  } catch (error) {
    console.error('Error during re-extraction:', error);
    return { success: false, error };
  }
}

// Example usage:
// import { reExtractAllEntities } from '@/lib/re-extract-entities';
// await reExtractAllEntities();
