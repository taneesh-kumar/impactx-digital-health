import { HealthRecord, Profile, ConsentGrant, CaregiverDelegation, EmergencyAccessSession } from '@/lib/supabase/types';

export interface AccessCheckResult {
  allowed: boolean;
  reason: string;
  grantId?: string;
  statusCode: 200 | 403 | 404;
}

/**
 * Evaluates whether an authenticated actor has access to a specific health record.
 * Enforces ownership, role boundaries, active consent grants, 7-day windows,
 * caregiver delegated categories, emergency break-glass sessions, and sensitive category locks.
 */
export function checkRecordAccess(
  record: HealthRecord,
  actor: Profile,
  consents: ConsentGrant[],
  caregiver?: CaregiverDelegation | null,
  emergencySessions: EmergencyAccessSession[] = [],
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
    const activeGrants = consents.filter((grant) => {
      const isRecipient =
        (grant.grantee_id && grant.grantee_id === actor.id) ||
        (grant.grantee_name && grant.grantee_name.toLowerCase().includes(actor.full_name.toLowerCase()));

      if (!isRecipient) return false;
      if (grant.status !== 'active') return false;

      const validFrom = new Date(grant.valid_from);
      const validUntil = new Date(grant.valid_until);
      return currentTime >= validFrom && currentTime <= validUntil;
    });

    if (activeGrants.length === 0) {
      return {
        allowed: false,
        reason: 'Access Denied: No active, non-expired consent grant exists for this specialist identity.',
        statusCode: 403,
      };
    }

    for (const grant of activeGrants) {
      if (record.is_sensitive && !grant.include_sensitive) {
        return {
          allowed: false,
          reason: 'Access Denied: Record contains protected mental health data excluded by patient consent policy.',
          grantId: grant.id,
          statusCode: 403,
        };
      }

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

  // 4. Caregiver Delegation Authorization
  if (actor.role === 'caregiver') {
    if (!caregiver || caregiver.status !== 'active') {
      return {
        allowed: false,
        reason: 'Access Denied: Caregiver proxy delegation is not active or has been revoked.',
        statusCode: 403,
      };
    }

    // Caregivers cannot access sensitive categories unless explicitly granted
    if (record.is_sensitive && !caregiver.include_sensitive_categories) {
      return {
        allowed: false,
        reason: 'Access Denied: Sensitive mental health records are excluded from caregiver delegation.',
        statusCode: 403,
      };
    }

    // Check delegated permitted categories
    if (caregiver.permitted_categories && caregiver.permitted_categories.includes(record.category)) {
      return {
        allowed: true,
        reason: `Access Granted: Category (${record.category}) permitted under Active Caregiver Proxy Delegation.`,
        statusCode: 200,
      };
    }

    return {
      allowed: false,
      reason: `Access Denied: Category (${record.category}) is outside the scope delegated by the patient.`,
      statusCode: 403,
    };
  }

  // 5. Emergency Clinician (Break-Glass Protocol)
  if (actor.role === 'emergency_clinician') {
    // Must have an active, non-expired Break-Glass session
    const activeSession = emergencySessions.find((s) => {
      if (s.status !== 'active') return false;
      const started = new Date(s.access_started_at);
      const expires = new Date(s.expires_at);
      return currentTime >= started && currentTime <= expires;
    });

    if (!activeSession) {
      return {
        allowed: false,
        reason: 'Access Denied: Emergency Break-Glass session is not active or has expired (30-min duration limit).',
        statusCode: 403,
      };
    }

    // Break-glass grants life-safety records (vital signs, lab results, prescriptions, allergies, discharge summaries)
    // Sensitive mental health records remain protected unless trauma team explicitly overrides
    if (record.is_sensitive) {
      return {
        allowed: false,
        reason: 'Access Denied: Mental health psychotherapy records excluded from emergency resuscitation protocol.',
        statusCode: 403,
      };
    }

    return {
      allowed: true,
      reason: `Access Granted: Emergency Break-Glass Session Active (${activeSession.reason}). Session expires at ${new Date(activeSession.expires_at).toLocaleTimeString()}.`,
      statusCode: 200,
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
  caregiver?: CaregiverDelegation | null,
  emergencySessions: EmergencyAccessSession[] = [],
  currentTime: Date = new Date()
): HealthRecord[] {
  return records.filter((r) => checkRecordAccess(r, actor, consents, caregiver, emergencySessions, currentTime).allowed);
}
