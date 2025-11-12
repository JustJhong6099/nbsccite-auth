/**
 * Activity Logger Utility
 * Logs faculty actions for audit trail
 */

import { supabase } from './supabase';

export interface LogActivityParams {
  action: 'approve' | 'reject' | 'edit' | 'delete' | 'publish' | 'create' | 'status_change';
  targetType: 'abstract' | 'user' | 'entity';
  targetId: string;
  targetTitle: string;
  details?: {
    old_status?: string;
    new_status?: string;
    fields_changed?: string[];
    [key: string]: any;
  };
}

/**
 * Log a faculty activity
 * Automatically captures user info from current session
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    // Get current user session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Cannot log activity: No authenticated user');
      return;
    }

    // Get user profile details
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      console.warn('Cannot log activity: User profile not found');
      return;
    }

    // Only log activities for faculty members
    if (profile.role !== 'faculty') {
      return;
    }

    // Insert activity log
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        user_email: profile.email,
        user_name: profile.full_name,
        user_role: profile.role,
        action: params.action,
        action_type: 'abstract_management',
        target_type: params.targetType,
        target_id: params.targetId,
        target_title: params.targetTitle,
        details: params.details || {},
      });

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Error in logActivity:', error);
  }
}

/**
 * Log abstract approval
 */
export async function logAbstractApproval(abstractId: string, title: string, feedback?: string): Promise<void> {
  return logActivity({
    action: 'approve',
    targetType: 'abstract',
    targetId: abstractId,
    targetTitle: title,
    details: {
      old_status: 'pending',
      new_status: 'approved',
      feedback
    }
  });
}

/**
 * Log abstract rejection
 */
export async function logAbstractRejection(abstractId: string, title: string, reason?: string): Promise<void> {
  return logActivity({
    action: 'reject',
    targetType: 'abstract',
    targetId: abstractId,
    targetTitle: title,
    details: {
      old_status: 'pending',
      new_status: 'rejected',
      reason
    }
  });
}

/**
 * Log abstract edit
 */
export async function logAbstractEdit(abstractId: string, title: string, fieldsChanged: string[]): Promise<void> {
  return logActivity({
    action: 'edit',
    targetType: 'abstract',
    targetId: abstractId,
    targetTitle: title,
    details: {
      fields_changed: fieldsChanged
    }
  });
}

/**
 * Log abstract deletion
 */
export async function logAbstractDeletion(abstractId: string, title: string, status: string): Promise<void> {
  return logActivity({
    action: 'delete',
    targetType: 'abstract',
    targetId: abstractId,
    targetTitle: title,
    details: {
      previous_status: status
    }
  });
}

/**
 * Log abstract publication (faculty publishing their own)
 */
export async function logAbstractPublication(abstractId: string, title: string): Promise<void> {
  return logActivity({
    action: 'publish',
    targetType: 'abstract',
    targetId: abstractId,
    targetTitle: title,
    details: {
      status: 'approved'
    }
  });
}
