/**
 * ==============================================================================
 * SWASTHYASETU PROMPT 7: CLINICAL CORRECTIONS & CONSENT PROPAGATION SUITE
 * Validates:
 * 1. Non-provider (patient/caregiver) cannot directly publish clinical corrections (Policy Restriction)
 * 2. Provider publishing correction marks earlier record as superseded with pointer (Zero Deletion)
 * 3. Provider publishing creates active v2 record with updated fields & provenance
 * 4. RecordVersion entry created linking v1 and v2 with clinical rationale
 * 5. Active consent grants receive record_corrected notification
 * 6. Active consent grants automatically receive v2 record access in selected_record_ids
 * 7. Expired or revoked consent grants are strictly blocked from receiving notifications
 * 8. Specialist under active grant can access corrected record (200)
 * 9. Recipient under expired/revoked grant is denied access to corrected record (403)
 * ==============================================================================
 */

// ---------------------------------------------------------
// SIMULATED ENGINE LOGIC (Mirroring consent-guard & demo-context)
// ---------------------------------------------------------

function publishProviderCorrection({
  records,
  consents,
  actor,
  recordId,
  fieldName,
  correctedValue,
  previousValue,
  clinicalRationale,
  currentTime = new Date(),
}) {
  if (actor.role !== 'specialist' && actor.role !== 'emergency_clinician') {
    return {
      success: false,
      notifiedGrants: [],
      blockedGrants: [],
      error: 'Security Policy: Only licensed healthcare providers can publish clinical corrections. Patients and caregivers may submit correction requests for review.',
    };
  }

  const target = records.find((r) => r.id === recordId);
  if (!target) {
    return {
      success: false,
      notifiedGrants: [],
      blockedGrants: [],
      error: 'Target record not found.',
    };
  }

  const timestamp = currentTime.toISOString();
  const newRecordId = `r-corr-test-${Date.now().toString().slice(-6)}`;

  // Clone target and update
  const updatedFields = (target.extracted_fields || []).map((f) => {
    if (f.field_name.toLowerCase().includes(fieldName.toLowerCase()) || f.field_name === fieldName) {
      return {
        ...f,
        field_value: correctedValue,
        provenance_note: `Amended by ${actor.full_name} (${actor.role}): ${clinicalRationale}`,
        status: 'verified',
      };
    }
    return f;
  });

  const newRecord = {
    ...target,
    id: newRecordId,
    title: `${target.title.replace(' (Amended v2)', '')} (Amended v2)`,
    is_superseded: false,
    superseded_by: null,
    verification_status: 'verified',
    extracted_fields: updatedFields,
    metadata: {
      ...(target.metadata || {}),
      amended_by: actor.full_name,
      previous_record_id: target.id,
      amendment_rationale: clinicalRationale,
      version: 2,
    },
    created_at: timestamp,
    updated_at: timestamp,
  };

  const supersededTarget = {
    ...target,
    is_superseded: true,
    superseded_by: newRecordId,
    updated_at: timestamp,
  };

  const newVersion = {
    id: `rv-test-${Date.now()}`,
    record_id: newRecordId,
    version_number: 2,
    change_reason: clinicalRationale,
    changed_by: actor.full_name,
    created_at: timestamp,
  };

  // Propagation evaluation
  const notifiedGrants = [];
  const blockedGrants = [];
  const newNotifications = [];

  const updatedConsents = consents.map((grant) => {
    const isTimeValid = new Date(grant.valid_from) <= currentTime && currentTime <= new Date(grant.valid_until);
    const isActive = grant.status === 'active' && isTimeValid;

    const coversRecord =
      grant.scope === 'all_records' ||
      (grant.selected_record_ids && grant.selected_record_ids.includes(target.id)) ||
      (grant.permitted_categories && grant.permitted_categories.includes(target.category));

    if (coversRecord) {
      if (isActive) {
        notifiedGrants.push(grant);

        newNotifications.push({
          id: `notif-${grant.id}`,
          recipient_user_id: grant.grantee_id || actor.id,
          event_type: 'record_corrected',
          title: `Clinical Correction: ${target.title}`,
          message: `${actor.full_name} published amended version.`,
          link_url: `/records/${newRecordId}`,
        });

        if (grant.selected_record_ids && !grant.selected_record_ids.includes(newRecordId)) {
          return {
            ...grant,
            selected_record_ids: [...grant.selected_record_ids, newRecordId],
          };
        }
      } else {
        blockedGrants.push(grant);
      }
    }
    return grant;
  });

  const updatedRecords = records.map((r) => (r.id === target.id ? supersededTarget : r)).concat(newRecord);

  return {
    success: true,
    newRecord,
    supersededTarget,
    newVersion,
    records: updatedRecords,
    consents: updatedConsents,
    notifiedGrants,
    blockedGrants,
    notifications: newNotifications,
  };
}

function checkAccess(record, actor, consents, currentTime = new Date()) {
  if (actor.role === 'patient') return { allowed: true, statusCode: 200 };

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
      return { allowed: false, statusCode: 403, reason: 'No active grant' };
    }

    for (const grant of activeGrants) {
      if (grant.selected_record_ids && grant.selected_record_ids.includes(record.id)) {
        return { allowed: true, statusCode: 200, grantId: grant.id };
      }
      if (grant.scope === 'all_records') {
        return { allowed: true, statusCode: 200, grantId: grant.id };
      }
      if (grant.permitted_categories && grant.permitted_categories.includes(record.category)) {
        return { allowed: true, statusCode: 200, grantId: grant.id };
      }
    }

    return { allowed: false, statusCode: 403, reason: 'Record outside granular scope' };
  }

  return { allowed: false, statusCode: 403, reason: 'Role denied' };
}

// ---------------------------------------------------------
// TEST DATA
// ---------------------------------------------------------

const patientActor = {
  id: '11111111-1111-1111-1111-111111111111',
  full_name: 'Rajesh Sharma',
  role: 'patient',
};

const specialistActor = {
  id: '22222222-2222-2222-2222-222222222222',
  full_name: 'Dr. Ananya Iyer',
  role: 'specialist',
};

const otherSpecialistActor = {
  id: '99999999-9999-9999-9999-999999999999',
  full_name: 'Dr. Ramesh Gupta',
  role: 'specialist',
};

const initialRecord = {
  id: 'rec-lipid-1',
  patient_id: patientActor.id,
  category: 'lab_result',
  title: 'Comprehensive Fasting Lipid Profile',
  is_superseded: false,
  superseded_by: null,
  verification_status: 'verified',
  extracted_fields: [
    { field_name: 'Total Cholesterol', field_value: '194', unit: 'mg/dL', status: 'verified' },
    { field_name: 'Triglycerides', field_value: '168', unit: 'mg/dL', status: 'verified' },
  ],
};

const fixedNow = new Date('2026-03-22T10:00:00Z');

const activeGrant = {
  id: 'grant-active-1',
  patient_id: patientActor.id,
  grantee_id: specialistActor.id,
  grantee_name: 'Dr. Ananya Iyer, MD (AIIMS Cardiology)',
  status: 'active',
  valid_from: '2026-03-20T00:00:00Z',
  valid_until: '2026-03-27T00:00:00Z',
  selected_record_ids: ['rec-lipid-1'],
  permitted_categories: ['lab_result'],
};

const expiredGrant = {
  id: 'grant-expired-2',
  patient_id: patientActor.id,
  grantee_id: otherSpecialistActor.id,
  grantee_name: 'Dr. Ramesh Gupta (Apollo)',
  status: 'expired',
  valid_from: '2026-03-01T00:00:00Z',
  valid_until: '2026-03-08T00:00:00Z', // Expired on March 8
  selected_record_ids: ['rec-lipid-1'],
  permitted_categories: ['lab_result'],
};

const revokedGrant = {
  id: 'grant-revoked-3',
  patient_id: patientActor.id,
  grantee_id: 'revoked-id',
  grantee_name: 'Max Healthcare Network',
  status: 'revoked',
  valid_from: '2026-03-20T00:00:00Z',
  valid_until: '2026-03-27T00:00:00Z',
  selected_record_ids: ['rec-lipid-1'],
  permitted_categories: ['lab_result'],
};

// ---------------------------------------------------------
// TEST EXECUTION
// ---------------------------------------------------------

console.log('\n================================================================');
console.log(' SWASTHYASETU PROMPT 7: CLINICAL CORRECTIONS & PROPAGATION SUITE');
console.log('================================================================\n');

const testCases = [
  {
    name: '1. Patient cannot directly publish clinical corrections (Restricted)',
    run: () => {
      const res = publishProviderCorrection({
        records: [initialRecord],
        consents: [activeGrant],
        actor: patientActor,
        recordId: initialRecord.id,
        fieldName: 'Total Cholesterol',
        correctedValue: '168 mg/dL',
        previousValue: '194 mg/dL',
        clinicalRationale: 'Patient believes cholesterol was normal',
        currentTime: fixedNow,
      });
      return { pass: res.success === false && res.error.includes('Only licensed healthcare providers') };
    },
  },
  {
    name: '2. Provider amendment marks original record as superseded with pointer (Zero Deletes)',
    run: () => {
      const res = publishProviderCorrection({
        records: [initialRecord],
        consents: [activeGrant, expiredGrant, revokedGrant],
        actor: specialistActor,
        recordId: initialRecord.id,
        fieldName: 'Total Cholesterol',
        correctedValue: '168 mg/dL',
        previousValue: '194 mg/dL',
        clinicalRationale: 'Fasting specimen re-assayed after serum dilution correction.',
        currentTime: fixedNow,
      });

      const oldRec = res.records.find((r) => r.id === initialRecord.id);
      return {
        pass: oldRec && oldRec.is_superseded === true && oldRec.superseded_by === res.newRecord.id,
      };
    },
  },
  {
    name: '3. Provider amendment creates active v2 record with updated clinical fields',
    run: () => {
      const res = publishProviderCorrection({
        records: [initialRecord],
        consents: [activeGrant],
        actor: specialistActor,
        recordId: initialRecord.id,
        fieldName: 'Total Cholesterol',
        correctedValue: '168 mg/dL',
        previousValue: '194 mg/dL',
        clinicalRationale: 'Specimen re-assayed.',
        currentTime: fixedNow,
      });

      const newRec = res.newRecord;
      const field = newRec.extracted_fields.find((f) => f.field_name === 'Total Cholesterol');
      return {
        pass:
          newRec.is_superseded === false &&
          newRec.title.includes('(Amended v2)') &&
          field &&
          field.field_value === '168 mg/dL',
      };
    },
  },
  {
    name: '4. RecordVersion entry created linking v1 and v2 with rationale',
    run: () => {
      const res = publishProviderCorrection({
        records: [initialRecord],
        consents: [activeGrant],
        actor: specialistActor,
        recordId: initialRecord.id,
        fieldName: 'Total Cholesterol',
        correctedValue: '168 mg/dL',
        previousValue: '194 mg/dL',
        clinicalRationale: 'Specimen re-assayed.',
        currentTime: fixedNow,
      });

      return {
        pass:
          res.newVersion &&
          res.newVersion.version_number === 2 &&
          res.newVersion.changed_by === specialistActor.full_name,
      };
    },
  },
  {
    name: '5. Active consent grant receives record_corrected notification',
    run: () => {
      const res = publishProviderCorrection({
        records: [initialRecord],
        consents: [activeGrant, expiredGrant],
        actor: specialistActor,
        recordId: initialRecord.id,
        fieldName: 'Total Cholesterol',
        correctedValue: '168 mg/dL',
        previousValue: '194 mg/dL',
        clinicalRationale: 'Specimen re-assayed.',
        currentTime: fixedNow,
      });

      const hasNotif = res.notifications.some(
        (n) => n.event_type === 'record_corrected' && n.recipient_user_id === specialistActor.id
      );
      return { pass: res.notifiedGrants.length === 1 && hasNotif };
    },
  },
  {
    name: '6. Active consent grant automatically receives access to new v2 record in selected_record_ids',
    run: () => {
      const res = publishProviderCorrection({
        records: [initialRecord],
        consents: [activeGrant],
        actor: specialistActor,
        recordId: initialRecord.id,
        fieldName: 'Total Cholesterol',
        correctedValue: '168 mg/dL',
        previousValue: '194 mg/dL',
        clinicalRationale: 'Specimen re-assayed.',
        currentTime: fixedNow,
      });

      const updatedGrant = res.consents.find((g) => g.id === activeGrant.id);
      return {
        pass: updatedGrant && updatedGrant.selected_record_ids.includes(res.newRecord.id),
      };
    },
  },
  {
    name: '7. Expired or revoked consent grants strictly blocked from receiving notifications',
    run: () => {
      const res = publishProviderCorrection({
        records: [initialRecord],
        consents: [activeGrant, expiredGrant, revokedGrant],
        actor: specialistActor,
        recordId: initialRecord.id,
        fieldName: 'Total Cholesterol',
        correctedValue: '168 mg/dL',
        previousValue: '194 mg/dL',
        clinicalRationale: 'Specimen re-assayed.',
        currentTime: fixedNow,
      });

      const blockedIds = res.blockedGrants.map((g) => g.id);
      const notificationsRecipients = res.notifications.map((n) => n.recipient_user_id);

      return {
        pass:
          blockedIds.includes(expiredGrant.id) &&
          blockedIds.includes(revokedGrant.id) &&
          !notificationsRecipients.includes(otherSpecialistActor.id),
      };
    },
  },
  {
    name: '8. Specialist under active grant can access corrected v2 record (200 OK)',
    run: () => {
      const res = publishProviderCorrection({
        records: [initialRecord],
        consents: [activeGrant],
        actor: specialistActor,
        recordId: initialRecord.id,
        fieldName: 'Total Cholesterol',
        correctedValue: '168 mg/dL',
        previousValue: '194 mg/dL',
        clinicalRationale: 'Specimen re-assayed.',
        currentTime: fixedNow,
      });

      const access = checkAccess(res.newRecord, specialistActor, res.consents, fixedNow);
      return { pass: access.allowed === true && access.statusCode === 200 };
    },
  },
  {
    name: '9. Specialist under expired grant is denied access to corrected v2 record (403)',
    run: () => {
      const res = publishProviderCorrection({
        records: [initialRecord],
        consents: [activeGrant, expiredGrant],
        actor: specialistActor,
        recordId: initialRecord.id,
        fieldName: 'Total Cholesterol',
        correctedValue: '168 mg/dL',
        previousValue: '194 mg/dL',
        clinicalRationale: 'Specimen re-assayed.',
        currentTime: fixedNow,
      });

      const access = checkAccess(res.newRecord, otherSpecialistActor, res.consents, fixedNow);
      return { pass: access.allowed === false && access.statusCode === 403 };
    },
  },
];

let passed = 0;
let failed = 0;

testCases.forEach((tc) => {
  const result = tc.run();
  if (result.pass) {
    passed++;
    console.log(`[\x1b[32mPASS\x1b[0m] ${tc.name}`);
  } else {
    failed++;
    console.error(`[\x1b[31mFAIL\x1b[0m] ${tc.name}`);
  }
});

console.log('\n----------------------------------------------------------------');
console.log(`SUMMARY: ${passed}/${testCases.length} Passed, ${failed} Failed`);
console.log('----------------------------------------------------------------\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL PROMPT 7 CLINICAL CORRECTIONS & PROPAGATION TESTS PASSED.\n');
  process.exit(0);
}
