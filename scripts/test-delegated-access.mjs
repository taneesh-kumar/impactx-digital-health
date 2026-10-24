/**
 * ==============================================================================
 * SWASTHYASETU PROMPT 6: CAREGIVER DELEGATION, BREAK-GLASS & AUDIT LEDGER SUITE
 * Validates:
 * 1. Caregiver access within permitted categories (e.g. lab_result, vital_sign, prescription) -> ALLOWED (200)
 * 2. Caregiver access outside delegated categories -> DENIED (403)
 * 3. Caregiver access to sensitive mental health records when excluded -> DENIED (403)
 * 4. Revoked caregiver delegation blocking subsequent access -> DENIED (403)
 * 5. Non-emergency roles attempting break-glass access -> DENIED (403)
 * 6. Emergency Clinician with active 30-min break-glass session -> ALLOWED (200) for life-safety clinical records
 * 7. Emergency Clinician access to sensitive mental health records during break-glass -> DENIED (403)
 * 8. Expired emergency break-glass session (> 30 minutes) -> DENIED (403)
 * 9. Closed/Terminated break-glass session -> DENIED (403)
 * ==============================================================================
 */

function checkRecordAccess(
  record,
  actor,
  consents = [],
  caregiver = null,
  emergencySessions = [],
  currentTime = new Date()
) {
  // 1. Patient self-access
  if (actor.role === 'patient') {
    return {
      allowed: true,
      reason: 'Patient self-access granted (Full record ownership).',
      statusCode: 200,
    };
  }

  // 2. Compliance Auditor
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

// ---------------------------------------------------------
// TEST DATA
// ---------------------------------------------------------

const caregiverActor = {
  id: 'u3333333-3333-3333-3333-333333333333',
  full_name: 'Sunita Sharma',
  email: 'sunita.sharma@example.com',
  role: 'caregiver',
};

const emergencyClinicianActor = {
  id: 'u4444444-4444-4444-4444-444444444444',
  full_name: 'Dr. Vikram Malhotra',
  email: 'dr.malhotra@safdarjung.demo.gov.in',
  role: 'emergency_clinician',
};

const specialistActor = {
  id: 'u2222222-2222-2222-2222-222222222222',
  full_name: 'Dr. Ananya Iyer',
  email: 'dr.iyer@apollo.demo.in',
  role: 'specialist',
};

const labRecord = {
  id: 'rec-lab-1',
  title: 'Comprehensive Metabolic Panel',
  category: 'lab_result',
  is_sensitive: false,
};

const clinicalNoteRecord = {
  id: 'rec-note-1',
  title: 'Psychiatric Outpatient Intake & Clinical Evaluation',
  category: 'clinical_note',
  is_sensitive: true,
};

const generalDischargeRecord = {
  id: 'rec-disch-1',
  title: 'Inpatient Ward Discharge Summary',
  category: 'discharge_summary',
  is_sensitive: false,
};

const now = new Date('2026-10-24T12:00:00Z');

const activeCaregiverDelegation = {
  id: 'cg-1',
  caregiver_id: caregiverActor.id,
  caregiver_name: 'Sunita Sharma',
  relationship: 'Daughter / Designated Healthcare Proxy',
  permitted_categories: ['lab_result', 'vital_sign', 'prescription'],
  can_upload: true,
  can_view_audit: true,
  include_sensitive_categories: false,
  status: 'active',
  created_at: '2026-09-01T00:00:00Z',
  revoked_at: null,
};

const revokedCaregiverDelegation = {
  ...activeCaregiverDelegation,
  status: 'revoked',
  revoked_at: '2026-10-20T10:00:00Z',
  revocation_reason: 'Patient requested revocation of caregiver proxy rights',
};

const activeEmergencySession = {
  id: 'em-session-active',
  session_token: 'EMG-DEMO-9912',
  clinician_id: emergencyClinicianActor.id,
  clinician_name: 'Dr. Vikram Malhotra',
  facility_name: 'Safdarjung Hospital Emergency Trauma Resuscitation Bay 2',
  access_started_at: '2026-10-24T11:45:00Z',
  expires_at: '2026-10-24T12:15:00Z', // Active at 12:00:00Z
  status: 'active',
  reason: 'Acute syncope, unresponsive trauma patient in resuscitation bay',
};

const expiredEmergencySession = {
  id: 'em-session-expired',
  session_token: 'EMG-DEMO-OLD',
  clinician_id: emergencyClinicianActor.id,
  clinician_name: 'Dr. Vikram Malhotra',
  facility_name: 'Safdarjung Hospital',
  access_started_at: '2026-10-24T10:00:00Z',
  expires_at: '2026-10-24T10:30:00Z', // Expired at 12:00:00Z
  status: 'active', // Time-expired
  reason: 'Prior ER evaluation',
};

const closedEmergencySession = {
  id: 'em-session-closed',
  session_token: 'EMG-DEMO-CLOSED',
  clinician_id: emergencyClinicianActor.id,
  clinician_name: 'Dr. Vikram Malhotra',
  facility_name: 'Safdarjung Hospital',
  access_started_at: '2026-10-24T11:45:00Z',
  expires_at: '2026-10-24T12:15:00Z',
  status: 'closed', // Terminated by clinician
  reason: 'Resuscitation complete, transferred to ICU',
};

// ---------------------------------------------------------
// TEST EXECUTION
// ---------------------------------------------------------

console.log('\n================================================================');
console.log(' SWASTHYASETU PROMPT 6: CAREGIVER & EMERGENCY ACCESS BENCHMARK');
console.log('================================================================\n');

const testCases = [
  {
    name: '1. Caregiver access to permitted category (lab_result)',
    fn: () => checkRecordAccess(labRecord, caregiverActor, [], activeCaregiverDelegation, [], now),
    expectedAllowed: true,
    expectedStatus: 200,
  },
  {
    name: '2. Caregiver access blocked for non-delegated category (discharge_summary)',
    fn: () => checkRecordAccess(generalDischargeRecord, caregiverActor, [], activeCaregiverDelegation, [], now),
    expectedAllowed: false,
    expectedStatus: 403,
  },
  {
    name: '3. Caregiver access blocked for sensitive mental health record',
    fn: () => checkRecordAccess(clinicalNoteRecord, caregiverActor, [], activeCaregiverDelegation, [], now),
    expectedAllowed: false,
    expectedStatus: 403,
  },
  {
    name: '4. Revoked caregiver delegation denies all access',
    fn: () => checkRecordAccess(labRecord, caregiverActor, [], revokedCaregiverDelegation, [], now),
    expectedAllowed: false,
    expectedStatus: 403,
  },
  {
    name: '5. Non-emergency specialist denied break-glass access without consent',
    fn: () => checkRecordAccess(labRecord, specialistActor, [], null, [activeEmergencySession], now),
    expectedAllowed: false,
    expectedStatus: 403,
  },
  {
    name: '6. Emergency Clinician granted life-safety lab access during active 30-min window',
    fn: () => checkRecordAccess(labRecord, emergencyClinicianActor, [], null, [activeEmergencySession], now),
    expectedAllowed: true,
    expectedStatus: 200,
  },
  {
    name: '7. Emergency Clinician denied sensitive mental health record during break-glass',
    fn: () => checkRecordAccess(clinicalNoteRecord, emergencyClinicianActor, [], null, [activeEmergencySession], now),
    expectedAllowed: false,
    expectedStatus: 403,
  },
  {
    name: '8. Emergency Clinician denied access after 30-min session expiry',
    fn: () => checkRecordAccess(labRecord, emergencyClinicianActor, [], null, [expiredEmergencySession], now),
    expectedAllowed: false,
    expectedStatus: 403,
  },
  {
    name: '9. Emergency Clinician denied access when session is closed/terminated',
    fn: () => checkRecordAccess(labRecord, emergencyClinicianActor, [], null, [closedEmergencySession], now),
    expectedAllowed: false,
    expectedStatus: 403,
  },
];

let passed = 0;
let failed = 0;

testCases.forEach((tc, idx) => {
  const result = tc.fn();
  const pass = result.allowed === tc.expectedAllowed && result.statusCode === tc.expectedStatus;

  if (pass) {
    passed++;
    console.log(`[\x1b[32mPASS\x1b[0m] ${tc.name}`);
    console.log(`       Reason: ${result.reason}`);
  } else {
    failed++;
    console.error(`[\x1b[31mFAIL\x1b[0m] ${tc.name}`);
    console.error(`       Expected: allowed=${tc.expectedAllowed}, status=${tc.expectedStatus}`);
    console.error(`       Received: allowed=${result.allowed}, status=${result.statusCode} (${result.reason})`);
  }
});

console.log('\n----------------------------------------------------------------');
console.log(`SUMMARY: ${passed}/${testCases.length} Passed, ${failed} Failed`);
console.log('----------------------------------------------------------------\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL PROMPT 6 CAREGIVER & EMERGENCY ACCESS TESTS PASSED SUCCESSFULLY.\n');
  process.exit(0);
}
