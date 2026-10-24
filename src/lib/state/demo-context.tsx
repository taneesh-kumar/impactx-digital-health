'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Profile,
  HealthRecord,
  DuplicateRelationship,
  ConsentGrant,
  CaregiverDelegation,
  AuditEvent,
  Role,
  DuplicateReviewStatus,
} from '@/lib/supabase/types';
import {
  SEED_PROFILES,
  SEED_PATIENT,
  SEED_RECORDS,
  SEED_DUPLICATES,
  SEED_CONSENTS,
  SEED_CAREGIVER,
  SEED_AUDIT_EVENTS,
} from '@/lib/data/seed-data';

interface DemoContextType {
  currentProfile: Profile;
  setCurrentProfileId: (id: string) => void;
  allProfiles: Profile[];
  records: HealthRecord[];
  duplicates: DuplicateRelationship[];
  consents: ConsentGrant[];
  caregiver: CaregiverDelegation;
  auditEvents: AuditEvent[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  // Actions
  resolveDuplicate: (duplicateId: string, decision: DuplicateReviewStatus, notes?: string) => void;
  addRecord: (newRecord: Partial<HealthRecord>) => HealthRecord;
  updateRecordVerification: (recordId: string, status: HealthRecord['verification_status']) => void;
  logAuditEvent: (event: Omit<AuditEvent, 'id' | 'created_at'>) => void;
  // Computed Counts (Strictly Data-Driven)
  counts: {
    totalRecords: number;
    needReviewCount: number;
    potentialDuplicatesCount: number;
    ocrUncertainCount: number;
    activeSharesCount: number;
    caregiverCount: number;
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
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(SEED_AUDIT_EVENTS);
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
      const savedAudit = localStorage.getItem('swasthya_audit');
      if (savedAudit) {
        setAuditEvents(JSON.parse(savedAudit));
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

  const resetAllData = () => {
    localStorage.removeItem('swasthya_records');
    localStorage.removeItem('swasthya_duplicates');
    localStorage.removeItem('swasthya_audit');
    localStorage.removeItem('swasthya_profile_id');
    setRecords(SEED_RECORDS);
    setDuplicates(SEED_DUPLICATES);
    setConsents(SEED_CONSENTS);
    setCaregiver(SEED_CAREGIVER);
    setAuditEvents(SEED_AUDIT_EVENTS);
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
        auditEvents,
        searchQuery,
        setSearchQuery,
        resolveDuplicate,
        addRecord,
        updateRecordVerification,
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
