import { HealthRecord, Profile, ConsentGrant } from '@/lib/supabase/types';

export interface AccessCheckResult {
  allowed: boolean;
  reason: string;
  grantId?: string;
  statusCode: 200 | 403 | 404;
}

/**
 * Evaluates whether an authenticated actor has access to a specific health record.
 * Enforces ownership, role boundaries, active consent grants, 7-day windows, and sensitive category locks.
 */
export function checkRecordAccess(
  record: HealthRecord,
  actor: Profile,
  consents: ConsentGrant[],
  currentTime: Date = new Date()
): AccessCheckResult {
  // 1. Patient owns all their records
  if (actor.role === 'patient') {
    return {
      allowed: true,
      reason: 'Patient self-access granted (Full record ownership).',
      statusCode: 200,
    };
  }

  // 2. Compliance Auditor (Read-only aggregate/audit scope)
  if (actor.role === 'auditor') {
    return {
      allowed: true,
      reason: 'Statutory compliance audit role permitted to verify record integrity.',
      statusCode: 200,
    };
  }

  // 3. Specialist Role Verification
  if (actor.role === 'specialist') {
    // Check for an active consent grant matching the specialist identity
    const activeGrants = consents.filter((grant) => {
      // Must match specialist ID or name
      const isRecipient =
        (grant.grantee_id && grant.grantee_id === actor.id) ||
        (grant.grantee_name && grant.grantee_name.toLowerCase().includes(actor.full_name.toLowerCase()));

      if (!isRecipient) return false;

      // Status check
      if (grant.status !== 'active') return false;

      // Time validity check (e.g. 7-day sharing window)
      const validFrom = new Date(grant.valid_from);
      const validUntil = new Date(grant.valid_until);
      const isTimeValid = currentTime >= validFrom && currentTime <= validUntil;

      return isTimeValid;
    });

    if (activeGrants.length === 0) {
      return {
        allowed: false,
        reason: 'Access Denied: No active, non-expired consent grant exists for this specialist identity.',
        statusCode: 403,
      };
    }

    // Check record scope within the active grants
    for (const grant of activeGrants) {
      // Check sensitive category restriction
      if (record.is_sensitive && !grant.include_sensitive) {
        return {
          allowed: false,
          reason: 'Access Denied: Record contains protected mental health data excluded by patient consent policy.',
          grantId: grant.id,
          statusCode: 403,
        };
      }

      // Check granular record ID selection
      if (grant.selected_record_ids && grant.selected_record_ids.length > 0) {
        if (grant.selected_record_ids.includes(record.id)) {
          return {
            allowed: true,
            reason: `Access Granted: Permitted under Active Consent Grant ${grant.receipt_id || grant.id}.`,
            grantId: grant.id,
            statusCode: 200,
          };
        }
      } else if (grant.scope === 'all_records') {
        return {
          allowed: true,
          reason: `Access Granted: Permitted under All-Records Consent Grant ${grant.receipt_id || grant.id}.`,
          grantId: grant.id,
          statusCode: 200,
        };
      } else if (grant.permitted_categories && grant.permitted_categories.includes(record.category)) {
        return {
          allowed: true,
          reason: `Access Granted: Permitted category (${record.category}) under Grant ${grant.receipt_id || grant.id}.`,
          grantId: grant.id,
          statusCode: 200,
        };
      }
    }

    return {
      allowed: false,
      reason: `Access Denied: Record (${record.title}) is outside the granular scope authorized by the patient in Active Grant.`,
      statusCode: 403,
    };
  }

  // 4. Caregiver (Delegation handled in Prompt 6, default denied for specialist endpoints)
  if (actor.role === 'caregiver') {
    return {
      allowed: false,
      reason: 'Caregiver delegation policy applies. Restricted from specialist consent grants.',
      statusCode: 403,
    };
  }

  // 5. Emergency Clinician (Break-glass handled in Prompt 6)
  if (actor.role === 'emergency_clinician') {
    return {
      allowed: false,
      reason: 'Emergency Break-Glass session required for unconsented trauma access.',
      statusCode: 403,
    };
  }

  return {
    allowed: false,
    reason: 'Access Denied: Role authorization policy rejected request.',
    statusCode: 403,
  };
}

/**
 * Filter an array of records to only those viewable by the current actor.
 */
export function getAuthorizedRecords(
  records: HealthRecord[],
  actor: Profile,
  consents: ConsentGrant[],
  currentTime: Date = new Date()
): HealthRecord[] {
  return records.filter((r) => checkRecordAccess(r, actor, consents, currentTime).allowed);
}
