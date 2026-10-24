export type Role =
  | 'patient'
  | 'specialist'
  | 'caregiver'
  | 'emergency_clinician'
  | 'auditor'
  | 'admin_compliance';

export type RecordCategory =
  | 'lab_result'
  | 'prescription'
  | 'radiology'
  | 'discharge_summary'
  | 'clinical_note'
  | 'vaccination'
  | 'vital_sign';

export type VerificationStatus =
  | 'verified'
  | 'pending_review'
  | 'date_conflict'
  | 'ocr_uncertain'
  | 'unverified'
  | 'disputed';

export type ExtractionMethod =
  | 'native_digital'
  | 'ocr'
  | 'manual_entry'
  | 'hl7_fhir';

export type DuplicateMatchTier =
  | 'exact_duplicate'
  | 'near_duplicate'
  | 'different_event';

export type DuplicateDetectionMethod =
  | 'hash_match'
  | 'text_similarity'
  | 'metadata_heuristic';

export type DuplicateReviewStatus =
  | 'detected'
  | 'kept_both'
  | 'kept_both_and_linked'
  | 'marked_distinct'
  | 'review_later';

export type ConsentStatus = 'active' | 'revoked' | 'expired';

export type ConsentScope =
  | 'all_records'
  | 'clinical_notes_only'
  | 'lab_results_only'
  | 'emergency_only'
  | 'time_bounded';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  is_demo_identity: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  profile_id: string;
  mrn: string;
  dob: string;
  gender: string;
  blood_group: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  address: string;
  allergies: string[];
  chronic_conditions: string[];
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  profile_id: string;
  license_number: string;
  specialization: string;
  facility_name: string;
  department?: string;
  contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface RecordSource {
  id: string;
  source_type: 'manual_upload' | 'ehr_integration' | 'lab_feed' | 'device' | 'clinical_portal';
  name: string;
  identifier?: string;
  is_trusted: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface HealthRecord {
  id: string;
  patient_id: string;
  provider_id?: string | null;
  source_id?: string | null;
  uploaded_by?: string | null;
  category: RecordCategory;
  title: string;
  description?: string;
  clinical_event_date?: string | null;
  report_date?: string | null;
  upload_timestamp: string;
  storage_file_path?: string;
  file_type?: string;
  file_size?: number;
  sha256_hash?: string;
  verification_status: VerificationStatus;
  extraction_method: ExtractionMethod;
  ocr_confidence?: number | null;
  has_date_conflict: boolean;
  date_conflict_details?: string | null;
  is_superseded: boolean;
  superseded_by?: string | null;
  is_sensitive?: boolean; // Mental health, psychotherapy, HIV, reproductive health
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Join extensions
  provider?: Provider;
  source?: RecordSource;
  extracted_fields?: ExtractedField[];
}

export interface ExtractedField {
  id: string;
  record_id: string;
  field_name: string;
  field_value: string;
  field_type: string;
  unit?: string;
  reference_range?: string;
  confidence?: number;
  status: 'verified' | 'auto_extracted' | 'uncertain' | 'disputed' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  provenance_note?: string;
  created_at: string;
}

export interface RecordVersion {
  id: string;
  record_id: string;
  version_number: number;
  storage_file_path?: string;
  change_reason: string;
  changed_by?: string;
  created_at: string;
}

export interface AttributeMatch {
  attribute: string;
  value?: string;
  primary?: string;
  candidate?: string;
}

export interface DuplicateRelationship {
  id: string;
  primary_record_id: string;
  candidate_record_id: string;
  similarity_score: number;
  match_tier: DuplicateMatchTier;
  detection_method: DuplicateDetectionMethod;
  match_explanation: string;
  matching_attributes: AttributeMatch[];
  conflicting_attributes: AttributeMatch[];
  status: DuplicateReviewStatus;
  reviewer_id?: string | null;
  review_notes?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  // Joined record references
  primary_record?: HealthRecord;
  candidate_record?: HealthRecord;
}

export interface ConsentGrant {
  id: string;
  patient_id: string;
  grantee_type: 'provider' | 'facility' | 'caregiver' | 'researcher';
  grantee_id?: string | null;
  grantee_name: string;
  scope: ConsentScope;
  permissions: string[];
  valid_from: string;
  valid_until: string;
  purpose: string;
  status: ConsentStatus;
  revoked_at?: string | null;
  revoke_reason?: string | null;
  // Granular Prompt 5 Fields
  selected_record_ids?: string[];
  permitted_categories?: RecordCategory[];
  include_sensitive?: boolean;
  receipt_id?: string;
  receipt_hash?: string;
  created_at: string;
}

export interface ConsentReceipt {
  id: string;
  consent_grant_id: string;
  patient_id: string;
  receipt_number: string;
  grantee_name: string;
  purpose: string;
  valid_from: string;
  valid_until: string;
  shared_items_count: number;
  shared_record_titles: string[];
  include_sensitive: boolean;
  revocation_policy: string;
  external_copies_notice: string;
  hash_signature: string;
  receipt_token: string;
  policy_version: string;
  captured_at: string;
  ip_address_hash?: string;
  metadata?: Record<string, unknown>;
}

export interface CaregiverDelegation {
  id: string;
  patient_id: string;
  caregiver_profile_id: string;
  caregiver_name?: string;
  relationship: string; // e.g. 'Spouse & Proxy', 'Daughter'
  permitted_categories: RecordCategory[];
  can_upload: boolean;
  can_share_records: boolean; // Caregiver cannot share records with third parties by default
  can_manage_consents: boolean; // Caregiver cannot revoke patient's grants
  include_sensitive_categories: boolean; // Excluded by default
  start_time: string;
  valid_until: string;
  status: 'pending' | 'active' | 'rejected' | 'terminated' | 'revoked';
  revoked_at?: string | null;
  revocation_reason?: string | null;
  approved_at?: string;
  created_at: string;
  caregiver_profile?: Profile;
}

export interface EmergencyAccessSession {
  id: string;
  patient_id: string;
  accessor_provider_id: string;
  clinician_name: string;
  hospital_unit: string; // e.g. 'Safdarjung Hospital Emergency Trauma'
  reason: string;
  justification_notes: string;
  duration_minutes: number; // e.g. 30-minute demonstration session
  scope_description: string; // e.g. 'Critical allergies, blood group, medications, recent diagnostic summaries'
  status: 'active' | 'closed' | 'expired' | 'flagged_for_review';
  access_started_at: string;
  access_ended_at?: string | null;
  expires_at: string;
  audit_logged: boolean;
  notification_sent: boolean;
  created_at: string;
  provider?: Provider;
}

export interface AuditEvent {
  id: string;
  user_id?: string | null;
  actor_role: string;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  patient_id: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  severity: 'info' | 'warning' | 'critical';
  created_at: string;
}

export interface VisitSummary {
  id: string;
  patient_id: string;
  provider_id?: string | null;
  visit_date: string;
  reason_for_visit: string;
  diagnosis?: string;
  clinical_summary: string;
  follow_up_instructions?: string;
  vital_signs_summary?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface CorrectionEvent {
  id: string;
  record_id: string;
  patient_id: string;
  requester_id: string;
  field_id?: string | null;
  proposed_value: string;
  previous_value: string;
  reason: string;
  status: 'requested' | 'in_review' | 'approved' | 'rejected';
  reviewer_id?: string | null;
  reviewer_notes?: string | null;
  resolved_at?: string | null;
  created_at: string;
  record_title?: string;
}

export interface NotificationEvent {
  id: string;
  recipient_user_id: string;
  event_type: string;
  title: string;
  message: string;
  link_url?: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}
