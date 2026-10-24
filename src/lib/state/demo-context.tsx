'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Profile,
  HealthRecord,
  DuplicateRelationship,
  ConsentGrant,
  CaregiverDelegation,
  EmergencyAccessSession,
  AuditEvent,
  Role,
  DuplicateReviewStatus,
  CorrectionEvent,
  NotificationEvent,
  RecordVersion,
} from '@/lib/supabase/types';
import {
  SEED_PROFILES,
  SEED_PATIENT,
  SEED_RECORDS,
  SEED_DUPLICATES,
  SEED_CONSENTS,
  SEED_CAREGIVER,
  SEED_EMERGENCY_SESSIONS,
  SEED_AUDIT_EVENTS,
  SEED_CORRECTIONS,
  SEED_NOTIFICATIONS,
  SEED_RECORD_VERSIONS,
} from '@/lib/data/seed-data';

interface DemoContextType {
  currentProfile: Profile;
  setCurrentProfileId: (id: string) => void;
  allProfiles: Profile[];
  records: HealthRecord[];
  duplicates: DuplicateRelationship[];
  consents: ConsentGrant[];
  caregiver: CaregiverDelegation;
  emergencySessions: EmergencyAccessSession[];
  auditEvents: AuditEvent[];
  corrections: CorrectionEvent[];
  notifications: NotificationEvent[];
  recordVersions: RecordVersion[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  // Actions
  resolveDuplicate: (duplicateId: string, decision: DuplicateReviewStatus, notes?: string) => void;
  addRecord: (newRecord: Partial<HealthRecord>) => HealthRecord;
  updateRecordVerification: (recordId: string, status: HealthRecord['verification_status']) => void;
  createConsentGrant: (grantData: Partial<ConsentGrant>) => ConsentGrant;
  revokeConsentGrant: (grantId: string, reason?: string) => void;
  updateCaregiverDelegation: (delegation: Partial<CaregiverDelegation>) => void;
  revokeCaregiverDelegation: (reason?: string) => void;
  startEmergencySession: (reason: string, justification: string, hospitalUnit?: string) => EmergencyAccessSession;
  closeEmergencySession: (sessionId: string) => void;
  proposeCorrection: (data: {
    recordId: string;
    proposedValue: string;
    previousValue: string;
    reason: string;
  }) => CorrectionEvent;
  publishProviderCorrection: (params: {
    recordId: string;
    fieldName: string;
    correctedValue: string;
    previousValue: string;
    clinicalRationale: string;
  }) => {
    success: boolean;
    newRecord?: HealthRecord;
    previousRecord?: HealthRecord;
    notifiedGrants: ConsentGrant[];
    blockedGrants: ConsentGrant[];
    error?: string;
  };
  reviewCorrection: (correctionId: string, status: 'approved' | 'rejected', notes?: string) => void;
  markNotificationRead: (notificationId: string) => void;
  logAuditEvent: (event: Omit<AuditEvent, 'id' | 'created_at'>) => void;
  // Computed Counts (Strictly Data-Driven)
  counts: {
    totalRecords: number;
    needReviewCount: number;
    potentialDuplicatesCount: number;
    ocrUncertainCount: number;
    activeSharesCount: number;
    caregiverCount: number;
    unreadNotificationsCount: number;
    pendingCorrectionsCount: number;
  };
  resetAllData: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [currentProfileId, setCurrentProfileId] = useState<string>('11111111-1111-1111-1111-111111111111');
  const [records, setRecords] = useState<HealthRecord[]>(SEED_RECORDS);
  const [duplicates, setDuplicates] = useState<DuplicateRelationship[]>(SEED_DUPLICATES);
  const [consents, setConsents] = useState<ConsentGrant[]>(SEED_CONSENTS);
  const [caregiver, setCaregiver] = useState<CaregiverDelegation>(SEED_CAREGIVER);
  const [emergencySessions, setEmergencySessions] = useState<EmergencyAccessSession[]>(SEED_EMERGENCY_SESSIONS);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(SEED_AUDIT_EVENTS);
  const [corrections, setCorrections] = useState<CorrectionEvent[]>(SEED_CORRECTIONS);
  const [notifications, setNotifications] = useState<NotificationEvent[]>(SEED_NOTIFICATIONS);
  const [recordVersions, setRecordVersions] = useState<RecordVersion[]>(SEED_RECORD_VERSIONS);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Synchronize from localStorage if previously stored
  useEffect(() => {
    try {
      const savedProfileId = localStorage.getItem('swasthya_profile_id');
      if (savedProfileId && SEED_PROFILES.some((p) => p.id === savedProfileId)) {
        setCurrentProfileId(savedProfileId);
      }
      const savedRecords = localStorage.getItem('swasthya_records');
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords));
      }
      const savedDuplicates = localStorage.getItem('swasthya_duplicates');
      if (savedDuplicates) {
        setDuplicates(JSON.parse(savedDuplicates));
      }
      const savedConsents = localStorage.getItem('swasthya_consents');
      if (savedConsents) {
        setConsents(JSON.parse(savedConsents));
      }
      const savedCaregiver = localStorage.getItem('swasthya_caregiver');
      if (savedCaregiver) {
        setCaregiver(JSON.parse(savedCaregiver));
      }
      const savedEmergency = localStorage.getItem('swasthya_emergency_sessions');
      if (savedEmergency) {
        setEmergencySessions(JSON.parse(savedEmergency));
      }
      const savedAudit = localStorage.getItem('swasthya_audit');
      if (savedAudit) {
        setAuditEvents(JSON.parse(savedAudit));
      }
      const savedCorrections = localStorage.getItem('swasthya_corrections');
      if (savedCorrections) {
        setCorrections(JSON.parse(savedCorrections));
      }
      const savedNotifications = localStorage.getItem('swasthya_notifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
      const savedVersions = localStorage.getItem('swasthya_record_versions');
      if (savedVersions) {
        setRecordVersions(JSON.parse(savedVersions));
      }
    } catch {
      // Local storage fallback
    }
  }, []);

  const handleProfileSwitch = (id: string) => {
    setCurrentProfileId(id);
    try {
      localStorage.setItem('swasthya_profile_id', id);
    } catch {}
    const p = SEED_PROFILES.find((x) => x.id === id);
    if (p) {
      logAuditEvent({
        user_id: p.id,
        actor_role: p.role,
        action: 'role_switch',
        resource_type: 'identity_session',
        patient_id: SEED_PATIENT.id,
        details: { switched_to_role: p.role, name: p.full_name },
        severity: 'info',
      });
    }
  };

  const currentProfile =
    SEED_PROFILES.find((p) => p.id === currentProfileId) || SEED_PROFILES[0];

  const logAuditEvent = (event: Omit<AuditEvent, 'id' | 'created_at'>) => {
    const newEvent: AuditEvent = {
      ...event,
      id: `audit-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setAuditEvents((prev) => {
      const updated = [newEvent, ...prev];
      try {
        localStorage.setItem('swasthya_audit', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const resolveDuplicate = (duplicateId: string, decision: DuplicateReviewStatus, notes = '') => {
    setDuplicates((prev) => {
      const updated = prev.map((dup) => {
        if (dup.id === duplicateId) {
          return {
            ...dup,
            status: decision,
            reviewer_id: currentProfile.id,
            review_notes: notes,
            reviewed_at: new Date().toISOString(),
          };
        }
        return dup;
      });
      try {
        localStorage.setItem('swasthya_duplicates', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    logAuditEvent({
      user_id: currentProfile.id,
      actor_role: currentProfile.role,
      action: 'duplicate_resolve',
      resource_type: 'duplicate_relationship',
      resource_id: duplicateId,
      patient_id: SEED_PATIENT.id,
      details: { decision, notes },
      severity: 'info',
    });
  };

  const addRecord = (newRecordData: Partial<HealthRecord>): HealthRecord => {
    const newRecord: HealthRecord = {
      id: `r-${Date.now()}`,
      patient_id: SEED_PATIENT.id,
      uploaded_by: currentProfile.id,
      category: newRecordData.category || 'lab_result',
      title: newRecordData.title || 'Untitled Health Record',
      description: newRecordData.description || '',
      clinical_event_date: newRecordData.clinical_event_date || null,
      report_date: newRecordData.report_date || null,
      upload_timestamp: new Date().toISOString(),
      storage_file_path: newRecordData.storage_file_path || `uploads/doc-${Date.now()}.pdf`,
      file_type: newRecordData.file_type || 'application/pdf',
      file_size: newRecordData.file_size || 350000,
      sha256_hash: newRecordData.sha256_hash || `hash-${Date.now()}`,
      verification_status: newRecordData.verification_status || 'unverified',
      extraction_method: newRecordData.extraction_method || 'manual_entry',
      ocr_confidence: newRecordData.ocr_confidence ?? null,
      has_date_conflict: Boolean(newRecordData.has_date_conflict),
      date_conflict_details: newRecordData.date_conflict_details || null,
      is_superseded: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      extracted_fields: newRecordData.extracted_fields || [],
    };

    setRecords((prev) => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem('swasthya_records', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    logAuditEvent({
      user_id: currentProfile.id,
      actor_role: currentProfile.role,
      action: 'write',
      resource_type: 'health_record',
      resource_id: newRecord.id,
      patient_id: SEED_PATIENT.id,
      details: { title: newRecord.title, category: newRecord.category },
      severity: 'info',
    });

    return newRecord;
  };

  const updateRecordVerification = (recordId: string, status: HealthRecord['verification_status']) => {
    setRecords((prev) => {
      const updated = prev.map((r) => (r.id === recordId ? { ...r, verification_status: status } : r));
      try {
        localStorage.setItem('swasthya_records', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const createConsentGrant = (grantData: Partial<ConsentGrant>): ConsentGrant => {
    const grantId = `cg-${Date.now()}`;
    const receiptNum = `REC-ABDM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newGrant: ConsentGrant = {
      id: grantId,
      patient_id: SEED_PATIENT.id,
      grantee_type: grantData.grantee_type || 'provider',
      grantee_id: grantData.grantee_id || null,
      grantee_name: grantData.grantee_name || 'Authorized Healthcare Specialist',
      scope: grantData.scope || 'time_bounded',
      permissions: grantData.permissions || ['read'],
      valid_from: grantData.valid_from || new Date().toISOString(),
      valid_until: grantData.valid_until || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      purpose: grantData.purpose || 'Clinical consultation & diagnostic second opinion',
      status: 'active',
      selected_record_ids: grantData.selected_record_ids || [],
      permitted_categories: grantData.permitted_categories || [],
      include_sensitive: Boolean(grantData.include_sensitive),
      receipt_id: receiptNum,
      receipt_hash: `hash-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString(),
    };

    setConsents((prev) => {
      const updated = [newGrant, ...prev];
      try {
        localStorage.setItem('swasthya_consents', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    logAuditEvent({
      user_id: currentProfile.id,
      actor_role: currentProfile.role,
      action: 'consent_grant_create',
      resource_type: 'consent_grant',
      resource_id: newGrant.id,
      patient_id: SEED_PATIENT.id,
      details: {
        grantee_name: newGrant.grantee_name,
        records_count: newGrant.selected_record_ids?.length || 0,
        valid_until: newGrant.valid_until,
        receipt_id: newGrant.receipt_id,
        include_sensitive: newGrant.include_sensitive,
      },
      severity: 'info',
    });

    return newGrant;
  };

  const revokeConsentGrant = (grantId: string, reason = 'Patient initiated revocation') => {
    setConsents((prev) => {
      const updated = prev.map((c) =>
        c.id === grantId
          ? {
              ...c,
              status: 'revoked' as const,
              revoked_at: new Date().toISOString(),
              revoke_reason: reason,
            }
          : c
      );
      try {
        localStorage.setItem('swasthya_consents', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    logAuditEvent({
      user_id: currentProfile.id,
      actor_role: currentProfile.role,
      action: 'consent_grant_revoke',
      resource_type: 'consent_grant',
      resource_id: grantId,
      patient_id: SEED_PATIENT.id,
      details: { grant_id: grantId, revocation_reason: reason },
      severity: 'warning',
    });
  };

  const updateCaregiverDelegation = (delegationData: Partial<CaregiverDelegation>) => {
    setCaregiver((prev) => {
      const updated: CaregiverDelegation = {
        ...prev,
        ...delegationData,
        status: 'active',
      };
      try {
        localStorage.setItem('swasthya_caregiver', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    logAuditEvent({
      user_id: currentProfile.id,
      actor_role: currentProfile.role,
      action: 'caregiver_delegation_update',
      resource_type: 'caregiver_delegation',
      resource_id: caregiver.id,
      patient_id: SEED_PATIENT.id,
      details: {
        permitted_categories: delegationData.permitted_categories || caregiver.permitted_categories,
        can_upload: delegationData.can_upload ?? caregiver.can_upload,
        include_sensitive: delegationData.include_sensitive_categories ?? caregiver.include_sensitive_categories,
      },
      severity: 'info',
    });
  };

  const revokeCaregiverDelegation = (reason = 'Patient revoked caregiver proxy access') => {
    setCaregiver((prev) => {
      const updated: CaregiverDelegation = {
        ...prev,
        status: 'revoked',
        revoked_at: new Date().toISOString(),
        revocation_reason: reason,
      };
      try {
        localStorage.setItem('swasthya_caregiver', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    logAuditEvent({
      user_id: currentProfile.id,
      actor_role: currentProfile.role,
      action: 'caregiver_delegation_revoke',
      resource_type: 'caregiver_delegation',
      resource_id: caregiver.id,
      patient_id: SEED_PATIENT.id,
      details: { revocation_reason: reason },
      severity: 'warning',
    });
  };

  const startEmergencySession = (
    reason: string,
    justification: string,
    hospitalUnit = 'Safdarjung Hospital Emergency Trauma Resuscitation'
  ): EmergencyAccessSession => {
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + 30 * 60 * 1000); // 30-minute demonstration window
    const newSession: EmergencyAccessSession = {
      id: `es-${Date.now()}`,
      patient_id: SEED_PATIENT.id,
      accessor_provider_id: currentProfile.id,
      clinician_name: currentProfile.full_name,
      hospital_unit: hospitalUnit,
      reason: reason || 'Acute Medical Emergency / Unresponsive Patient Protocol',
      justification_notes: justification || 'Patient presents in critical status; surrogate consent unavailable.',
      duration_minutes: 30,
      scope_description: 'Life-safety records: allergies, blood group, chronic conditions, and recent summaries',
      status: 'active',
      access_started_at: startedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      audit_logged: true,
      notification_sent: true,
      created_at: startedAt.toISOString(),
    };

    setEmergencySessions((prev) => {
      const updated = [newSession, ...prev];
      try {
        localStorage.setItem('swasthya_emergency_sessions', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    logAuditEvent({
      user_id: currentProfile.id,
      actor_role: currentProfile.role,
      action: 'emergency_break_glass_invoke',
      resource_type: 'emergency_access_session',
      resource_id: newSession.id,
      patient_id: SEED_PATIENT.id,
      details: {
        reason: newSession.reason,
        clinician: currentProfile.full_name,
        expires_at: newSession.expires_at,
        unit: hospitalUnit,
      },
      severity: 'critical',
    });

    return newSession;
  };

  const closeEmergencySession = (sessionId: string) => {
    setEmergencySessions((prev) => {
      const updated = prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'closed' as const,
              access_ended_at: new Date().toISOString(),
            }
          : s
      );
      try {
        localStorage.setItem('swasthya_emergency_sessions', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    logAuditEvent({
      user_id: currentProfile.id,
      actor_role: currentProfile.role,
      action: 'emergency_break_glass_close',
      resource_type: 'emergency_access_session',
      resource_id: sessionId,
      patient_id: SEED_PATIENT.id,
      details: { session_id: sessionId },
      severity: 'info',
    });
  };

  const proposeCorrection = (data: {
    recordId: string;
    proposedValue: string;
    previousValue: string;
    reason: string;
  }): CorrectionEvent => {
    const target = records.find((r) => r.id === data.recordId);
    const newCorrection: CorrectionEvent = {
      id: `cor-${Date.now()}`,
      record_id: data.recordId,
      patient_id: SEED_PATIENT.id,
      requester_id: currentProfile.id,
      proposed_value: data.proposedValue,
      previous_value: data.previousValue,
      reason: data.reason,
      status: 'in_review',
      reviewer_id: null,
      reviewer_notes: 'Pending provider clinical review and signoff',
      created_at: new Date().toISOString(),
      record_title: target?.title || 'Clinical Health Record',
    };

    setCorrections((prev) => {
      const updated = [newCorrection, ...prev];
      try {
        localStorage.setItem('swasthya_corrections', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    logAuditEvent({
      user_id: currentProfile.id,
      actor_role: currentProfile.role,
      action: 'correction_inquiry_submitted',
      resource_type: 'correction_request',
      resource_id: newCorrection.id,
      patient_id: SEED_PATIENT.id,
      details: {
        record_id: data.recordId,
        proposed_value: data.proposedValue,
        reason: data.reason,
      },
      severity: 'info',
    });

    return newCorrection;
  };

  const publishProviderCorrection = (params: {
    recordId: string;
    fieldName: string;
    correctedValue: string;
    previousValue: string;
    clinicalRationale: string;
  }): {
    success: boolean;
    newRecord?: HealthRecord;
    previousRecord?: HealthRecord;
    notifiedGrants: ConsentGrant[];
    blockedGrants: ConsentGrant[];
    error?: string;
  } => {
    // 1. Role Authorization Check: Only licensed medical providers can amend clinical records
    if (currentProfile.role !== 'specialist' && currentProfile.role !== 'emergency_clinician') {
      return {
        success: false,
        notifiedGrants: [],
        blockedGrants: [],
        error: 'Security Policy: Only licensed healthcare providers can publish clinical corrections. Patients and caregivers may submit correction requests for review.',
      };
    }

    const target = records.find((r) => r.id === params.recordId);
    if (!target) {
      return {
        success: false,
        notifiedGrants: [],
        blockedGrants: [],
        error: `Target clinical record (${params.recordId}) not found.`,
      };
    }

    const timestamp = new Date().toISOString();
    const newRecordId = `r-corr-${Date.now().toString().slice(-8)}`;

    // 2. Clone and update target record to create amended version
    const updatedFields = (target.extracted_fields || []).map((f) => {
      if (f.field_name.toLowerCase().includes(params.fieldName.toLowerCase()) || f.field_name === params.fieldName) {
        return {
          ...f,
          field_value: params.correctedValue,
          provenance_note: `Amended by ${currentProfile.full_name} (${currentProfile.role}) on ${new Date().toLocaleDateString()}: ${params.clinicalRationale}`,
          status: 'verified' as const,
        };
      }
      return f;
    });

    const newRecord: HealthRecord = {
      ...target,
      id: newRecordId,
      title: `${target.title.replace(' (Amended v2)', '')} (Amended v2)`,
      description: `${target.description || ''} [Clinically amended by ${currentProfile.full_name}: ${params.clinicalRationale}]`.trim(),
      is_superseded: false,
      superseded_by: null,
      verification_status: 'verified',
      upload_timestamp: timestamp,
      created_at: timestamp,
      updated_at: timestamp,
      extracted_fields: updatedFields,
      metadata: {
        ...(target.metadata || {}),
        amended_by: currentProfile.full_name,
        previous_record_id: target.id,
        amendment_rationale: params.clinicalRationale,
        version: 2,
      },
    };

    // 3. Mark original target record as superseded (Zero silent deletion - immutable audit preservation)
    const supersededTarget: HealthRecord = {
      ...target,
      is_superseded: true,
      superseded_by: newRecordId,
      updated_at: timestamp,
    };

    // Update records state
    const nextRecords = records.map((r) => (r.id === target.id ? supersededTarget : r)).concat(newRecord);
    setRecords(nextRecords);
    try {
      localStorage.setItem('swasthya_records', JSON.stringify(nextRecords));
    } catch {}

    // 4. Create RecordVersion entry
    const newVersion: RecordVersion = {
      id: `rv-${Date.now()}`,
      record_id: newRecordId,
      version_number: 2,
      change_reason: params.clinicalRationale,
      changed_by: currentProfile.full_name,
      created_at: timestamp,
    };
    setRecordVersions((prev) => {
      const updated = [newVersion, ...prev];
      try {
        localStorage.setItem('swasthya_record_versions', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 5. Consent-Bound Propagation Engine: Notify ACTIVE shares ONLY; Block EXPIRED/REVOKED
    const nowTime = new Date();
    const notifiedGrants: ConsentGrant[] = [];
    const blockedGrants: ConsentGrant[] = [];

    const updatedConsents = consents.map((grant) => {
      const isTimeValid = new Date(grant.valid_from) <= nowTime && nowTime <= new Date(grant.valid_until);
      const isActive = grant.status === 'active' && isTimeValid;

      const coversRecord =
        grant.scope === 'all_records' ||
        (grant.selected_record_ids && grant.selected_record_ids.includes(target.id)) ||
        (grant.permitted_categories && grant.permitted_categories.includes(target.category));

      if (coversRecord) {
        if (isActive) {
          notifiedGrants.push(grant);
          // If granularly scoped, propagate access to the corrected record
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

    setConsents(updatedConsents);
    try {
      localStorage.setItem('swasthya_consents', JSON.stringify(updatedConsents));
    } catch {}

    // 6. Generate Notification Events for active grantees and the patient
    const newNotifications: NotificationEvent[] = [];

    notifiedGrants.forEach((grant) => {
      newNotifications.push({
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        recipient_user_id: grant.grantee_id || currentProfile.id,
        event_type: 'record_corrected',
        title: `Clinical Correction: ${target.title}`,
        message: `${currentProfile.full_name} published an amended version for ${target.title} (${params.fieldName} updated to ${params.correctedValue}). The previous version is now superseded.`,
        link_url: `/records/${newRecordId}`,
        is_read: false,
        created_at: timestamp,
      });
    });

    // Also notify patient
    newNotifications.push({
      id: `notif-pat-${Date.now()}`,
      recipient_user_id: target.patient_id,
      event_type: 'record_corrected',
      title: `Lab Report Amended: ${target.title}`,
      message: `${currentProfile.full_name} issued a verified amendment for ${params.fieldName} (${params.previousValue} -> ${params.correctedValue}). Rationale: ${params.clinicalRationale}`,
      link_url: `/records/${newRecordId}`,
      is_read: false,
      created_at: timestamp,
    });

    setNotifications((prev) => {
      const updated = [...newNotifications, ...prev];
      try {
        localStorage.setItem('swasthya_notifications', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 7. Auto-approve any pending correction request for this record
    setCorrections((prev) => {
      const updated = prev.map((c) =>
        c.record_id === target.id && c.status === 'in_review'
          ? {
              ...c,
              status: 'approved' as const,
              reviewer_id: currentProfile.id,
              reviewer_notes: `Approved and published by ${currentProfile.full_name}: ${params.clinicalRationale}`,
              resolved_at: timestamp,
            }
          : c
      );
      try {
        localStorage.setItem('swasthya_corrections', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 8. Immutable Audit Trail
    logAuditEvent({
      user_id: currentProfile.id,
      actor_role: currentProfile.role,
      action: 'provider_correction_published',
      resource_type: 'health_record',
      resource_id: newRecordId,
      patient_id: target.patient_id,
      details: {
        previous_record_id: target.id,
        field_amended: params.fieldName,
        previous_val: params.previousValue,
        corrected_val: params.correctedValue,
        clinical_rationale: params.clinicalRationale,
        notified_active_shares: notifiedGrants.map((g) => ({ id: g.id, grantee: g.grantee_name })),
        blocked_expired_shares: blockedGrants.map((g) => ({ id: g.id, grantee: g.grantee_name, status: g.status })),
      },
      severity: 'info',
    });

    return {
      success: true,
      newRecord,
      previousRecord: supersededTarget,
      notifiedGrants,
      blockedGrants,
    };
  };

  const reviewCorrection = (correctionId: string, status: 'approved' | 'rejected', notes?: string) => {
    setCorrections((prev) => {
      const updated = prev.map((c) =>
        c.id === correctionId
          ? {
              ...c,
              status,
              reviewer_id: currentProfile.id,
              reviewer_notes: notes || `Reviewed by ${currentProfile.full_name}`,
              resolved_at: new Date().toISOString(),
            }
          : c
      );
      try {
        localStorage.setItem('swasthya_corrections', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      );
      try {
        localStorage.setItem('swasthya_notifications', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const resetAllData = () => {
    localStorage.removeItem('swasthya_records');
    localStorage.removeItem('swasthya_duplicates');
    localStorage.removeItem('swasthya_consents');
    localStorage.removeItem('swasthya_caregiver');
    localStorage.removeItem('swasthya_emergency_sessions');
    localStorage.removeItem('swasthya_audit');
    localStorage.removeItem('swasthya_corrections');
    localStorage.removeItem('swasthya_notifications');
    localStorage.removeItem('swasthya_record_versions');
    localStorage.removeItem('swasthya_profile_id');
    setRecords(SEED_RECORDS);
    setDuplicates(SEED_DUPLICATES);
    setConsents(SEED_CONSENTS);
    setCaregiver(SEED_CAREGIVER);
    setEmergencySessions(SEED_EMERGENCY_SESSIONS);
    setAuditEvents(SEED_AUDIT_EVENTS);
    setCorrections(SEED_CORRECTIONS);
    setNotifications(SEED_NOTIFICATIONS);
    setRecordVersions(SEED_RECORD_VERSIONS);
    setCurrentProfileId('11111111-1111-1111-1111-111111111111');
  };

  // Strictly Data-Driven Counts
  const counts = {
    totalRecords: records.length,
    needReviewCount: records.filter((r) => r.has_date_conflict || r.verification_status === 'date_conflict').length,
    potentialDuplicatesCount: duplicates.filter((d) => d.status === 'detected').length,
    ocrUncertainCount: records.filter((r) => r.verification_status === 'ocr_uncertain').length,
    activeSharesCount: consents.filter((c) => c.status === 'active').length,
    caregiverCount: caregiver.status === 'active' ? 1 : 0,
    unreadNotificationsCount: notifications.filter((n) => !n.is_read).length,
    pendingCorrectionsCount: corrections.filter((c) => c.status === 'in_review').length,
  };

  return (
    <DemoContext.Provider
      value={{
        currentProfile,
        setCurrentProfileId: handleProfileSwitch,
        allProfiles: SEED_PROFILES,
        records,
        duplicates,
        consents,
        caregiver,
        emergencySessions,
        auditEvents,
        corrections,
        notifications,
        recordVersions,
        searchQuery,
        setSearchQuery,
        resolveDuplicate,
        addRecord,
        updateRecordVerification,
        createConsentGrant,
        revokeConsentGrant,
        updateCaregiverDelegation,
        revokeCaregiverDelegation,
        startEmergencySession,
        closeEmergencySession,
        proposeCorrection,
        publishProviderCorrection,
        reviewCorrection,
        markNotificationRead,
        logAuditEvent,
        counts,
        resetAllData,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoContext() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoContext must be used within a DemoProvider');
  }
  return context;
}
