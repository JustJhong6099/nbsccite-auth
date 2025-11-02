/**
 * Database Cleanup Utility
 * Remove temporary extracted entities from abstracts created before
 * the temporary storage implementation
 * 
 * Usage: Run this once from browser console or as a script
 */

import { supabase } from './supabase';

interface CleanupStats {
  totalInspected: number;
  totalCleared: number;
  byStatus: {
    status: string;
    cleared: number;
  }[];
}

/**
 * Inspect how many abstracts have extracted entities
 */
export async function inspectExtractedEntities() {
  try {
    const { data, error } = await supabase
      .from('abstracts')
      .select('id, title, status, created_at, extracted_entities')
      .not('extracted_entities', 'is', null);

    if (error) throw error;

    const stats = {
      total: data.length,
      byStatus: {
        pending: data.filter(a => a.status === 'pending').length,
        approved: data.filter(a => a.status === 'approved').length,
        rejected: data.filter(a => a.status === 'rejected').length,
      },
    };

    console.log('📊 Extracted Entities Inspection:');
    console.log(`Total abstracts with entities: ${stats.total}`);
    console.log(`  • Pending: ${stats.byStatus.pending}`);
    console.log(`  • Approved: ${stats.byStatus.approved}`);
    console.log(`  • Rejected: ${stats.byStatus.rejected}`);
    console.log('\nSample abstracts:');
    console.table(data.slice(0, 10).map(a => ({
      id: a.id,
      title: a.title.substring(0, 50) + '...',
      status: a.status,
      created: new Date(a.created_at).toLocaleDateString(),
    })));

    return stats;
  } catch (error) {
    console.error('❌ Error inspecting entities:', error);
    throw error;
  }
}

/**
 * Clear extracted entities from non-approved abstracts
 * (Recommended approach)
 */
export async function clearTemporaryEntities(): Promise<CleanupStats> {
  try {
    console.log('🧹 Starting cleanup of temporary extracted entities...');

    // First, get the abstracts that will be affected
    const { data: toClean, error: fetchError } = await supabase
      .from('abstracts')
      .select('id, status')
      .not('extracted_entities', 'is', null)
      .neq('status', 'approved');

    if (fetchError) throw fetchError;

    console.log(`Found ${toClean.length} abstracts with temporary entities`);

    if (toClean.length === 0) {
      console.log('✅ No temporary entities to clean up!');
      return {
        totalInspected: 0,
        totalCleared: 0,
        byStatus: [],
      };
    }

    // Perform the cleanup
    const { error: updateError } = await supabase
      .from('abstracts')
      .update({ extracted_entities: null })
      .not('extracted_entities', 'is', null)
      .neq('status', 'approved');

    if (updateError) throw updateError;

    // Calculate stats
    const byStatus = Object.entries(
      toClean.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([status, cleared]) => ({ status, cleared }));

    const stats: CleanupStats = {
      totalInspected: toClean.length,
      totalCleared: toClean.length,
      byStatus,
    };

    console.log('\n✅ Cleanup complete!');
    console.log(`Cleared extracted_entities from ${stats.totalCleared} abstracts:`);
    stats.byStatus.forEach(({ status, cleared }) => {
      console.log(`  • ${status}: ${cleared} abstracts`);
    });

    return stats;
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

/**
 * Clear entities from rejected abstracts only (Conservative approach)
 */
export async function clearRejectedOnly(): Promise<CleanupStats> {
  try {
    console.log('🧹 Clearing entities from rejected abstracts only...');

    const { data: toClean, error: fetchError } = await supabase
      .from('abstracts')
      .select('id, status')
      .not('extracted_entities', 'is', null)
      .eq('status', 'rejected');

    if (fetchError) throw fetchError;

    if (toClean.length === 0) {
      console.log('✅ No rejected abstracts with entities found!');
      return { totalInspected: 0, totalCleared: 0, byStatus: [] };
    }

    const { error: updateError } = await supabase
      .from('abstracts')
      .update({ extracted_entities: null })
      .not('extracted_entities', 'is', null)
      .eq('status', 'rejected');

    if (updateError) throw updateError;

    console.log(`✅ Cleared entities from ${toClean.length} rejected abstracts`);

    return {
      totalInspected: toClean.length,
      totalCleared: toClean.length,
      byStatus: [{ status: 'rejected', cleared: toClean.length }],
    };
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

/**
 * Clear ALL extracted entities (Aggressive approach)
 * Use this only if you want everyone to re-extract with new rules
 */
export async function clearAllEntities(): Promise<CleanupStats> {
  try {
    console.log('🧹 AGGRESSIVE: Clearing ALL extracted entities...');
    console.warn('⚠️  This will affect approved abstracts too!');

    const { data: toClean, error: fetchError } = await supabase
      .from('abstracts')
      .select('id, status')
      .not('extracted_entities', 'is', null);

    if (fetchError) throw fetchError;

    if (toClean.length === 0) {
      console.log('✅ No entities to clear!');
      return { totalInspected: 0, totalCleared: 0, byStatus: [] };
    }

    const { error: updateError } = await supabase
      .from('abstracts')
      .update({ extracted_entities: null })
      .not('extracted_entities', 'is', null);

    if (updateError) throw updateError;

    const byStatus = Object.entries(
      toClean.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([status, cleared]) => ({ status, cleared }));

    console.log(`✅ Cleared ALL ${toClean.length} extracted entities`);

    return {
      totalInspected: toClean.length,
      totalCleared: toClean.length,
      byStatus,
    };
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

/**
 * Verify cleanup results
 */
export async function verifyCleanup() {
  try {
    const { data, error } = await supabase
      .from('abstracts')
      .select('status, extracted_entities');

    if (error) throw error;

    const stats = data.reduce((acc, a) => {
      const status = a.status as string;
      if (!acc[status]) {
        acc[status] = { total: 0, withEntities: 0, withoutEntities: 0 };
      }
      acc[status].total++;
      if (a.extracted_entities) {
        acc[status].withEntities++;
      } else {
        acc[status].withoutEntities++;
      }
      return acc;
    }, {} as Record<string, { total: number; withEntities: number; withoutEntities: number }>);

    console.log('\n📊 Verification Results:');
    console.table(stats);

    return stats;
  } catch (error) {
    console.error('❌ Error verifying cleanup:', error);
    throw error;
  }
}

// Browser console helpers
if (typeof window !== 'undefined') {
  (window as any).cleanupEntities = {
    inspect: inspectExtractedEntities,
    clearTemporary: clearTemporaryEntities,
    clearRejected: clearRejectedOnly,
    clearAll: clearAllEntities,
    verify: verifyCleanup,
  };

  console.log('🛠️  Entity cleanup utilities loaded!');
  console.log('Available commands:');
  console.log('  • cleanupEntities.inspect() - See what you have');
  console.log('  • cleanupEntities.clearTemporary() - Clear non-approved (RECOMMENDED)');
  console.log('  • cleanupEntities.clearRejected() - Clear rejected only');
  console.log('  • cleanupEntities.clearAll() - Clear everything');
  console.log('  • cleanupEntities.verify() - Verify results');
}
