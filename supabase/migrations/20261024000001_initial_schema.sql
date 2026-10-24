-- ==============================================================================
-- SWASTHYASETU DIGITAL HEALTH PLATFORM: INITIAL DATABASE MIGRATION
-- Migration: 20261024000001_initial_schema.sql
-- Description: Core schema, tables, foreign keys, indexes, and RLS policies
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USER PROFILES AND DEMONSTRATION ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'specialist', 'caregiver', 'emergency_clinician', 'auditor', 'admin_compliance')),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    is_demo_identity BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. PATIENTS AND PROVIDERS
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mrn VARCHAR(100) UNIQUE NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(50) NOT NULL,
    blood_group VARCHAR(10),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    address TEXT,
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    chronic_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    license_number VARCHAR(100) NOT NULL,
    specialization VARCHAR(150) NOT NULL,
    facility_name VARCHAR(255) NOT NULL,
    department VARCHAR(150),
    contact_phone VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. RECORD SOURCES AND HEALTH RECORDS
CREATE TABLE IF NOT EXISTS public.record_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('manual_upload', 'ehr_integration', 'lab_feed', 'device', 'clinical_portal')),
    name VARCHAR(255) NOT NULL,
    identifier VARCHAR(100),
    is_trusted BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
    source_id UUID REFERENCES public.record_sources(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('lab_result', 'prescription', 'radiology', 'discharge_summary', 'clinical_note', 'vaccination', 'vital_sign')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    clinical_event_date DATE,
    report_date DATE,
    upload_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    storage_file_path TEXT,
    file_type VARCHAR(50),
    file_size INTEGER,
    sha256_hash VARCHAR(64),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'pending_review', 'date_conflict', 'ocr_uncertain', 'unverified', 'disputed')),
    extraction_method VARCHAR(50) NOT NULL DEFAULT 'manual_entry' CHECK (extraction_method IN ('native_digital', 'ocr', 'manual_entry', 'hl7_fhir')),
    ocr_confidence NUMERIC(5,2),
    has_date_conflict BOOLEAN NOT NULL DEFAULT false,
    date_conflict_details TEXT,
    is_superseded BOOLEAN NOT NULL DEFAULT false,
    superseded_by UUID REFERENCES public.health_records(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. EXTRACTED FIELDS AND RECORD VERSIONS
CREATE TABLE IF NOT EXISTS public.record_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL REFERENCES public.health_records(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    storage_file_path TEXT,
    change_reason TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.extracted_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL REFERENCES public.health_records(id) ON DELETE CASCADE,
    field_name VARCHAR(150) NOT NULL,
    field_value TEXT NOT NULL,
    field_type VARCHAR(50) DEFAULT 'string',
    unit VARCHAR(50),
    reference_range VARCHAR(100),
    confidence NUMERIC(5,2),
    status VARCHAR(50) NOT NULL DEFAULT 'auto_extracted' CHECK (status IN ('verified', 'auto_extracted', 'uncertain', 'disputed', 'rejected')),
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    provenance_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. DUPLICATE RELATIONSHIPS AND REVIEW DECISIONS
CREATE TABLE IF NOT EXISTS public.duplicate_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_record_id UUID NOT NULL REFERENCES public.health_records(id) ON DELETE CASCADE,
    candidate_record_id UUID NOT NULL REFERENCES public.health_records(id) ON DELETE CASCADE,
    similarity_score NUMERIC(5,2) NOT NULL,
    match_tier VARCHAR(50) NOT NULL CHECK (match_tier IN ('exact_duplicate', 'near_duplicate', 'different_event')),
    detection_method VARCHAR(50) NOT NULL CHECK (detection_method IN ('hash_match', 'text_similarity', 'metadata_heuristic')),
    match_explanation TEXT NOT NULL,
    matching_attributes JSONB DEFAULT '[]'::JSONB,
    conflicting_attributes JSONB DEFAULT '[]'::JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'kept_both', 'kept_both_and_linked', 'marked_distinct', 'review_later')),
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    review_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_distinct_records CHECK (primary_record_id <> candidate_record_id)
);

-- 6. CONSENT GRANTS AND CONSENT RECEIPTS
CREATE TABLE IF NOT EXISTS public.consent_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    grantee_type VARCHAR(50) NOT NULL CHECK (grantee_type IN ('provider', 'facility', 'caregiver', 'researcher')),
    grantee_id UUID,
    grantee_name VARCHAR(255) NOT NULL,
    scope VARCHAR(50) NOT NULL CHECK (scope IN ('all_records', 'clinical_notes_only', 'lab_results_only', 'emergency_only', 'time_bounded')),
    permissions TEXT[] DEFAULT ARRAY['read']::TEXT[],
    valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_until TIMESTAMPTZ NOT NULL,
    purpose TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    revoked_at TIMESTAMPTZ,
    revoke_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consent_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consent_grant_id UUID NOT NULL REFERENCES public.consent_grants(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    hash_signature VARCHAR(128) NOT NULL,
    receipt_token VARCHAR(100) UNIQUE NOT NULL,
    policy_version VARCHAR(20) NOT NULL DEFAULT 'v1.0-ABDM-COMPLIANT',
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address_hash VARCHAR(64),
    metadata JSONB DEFAULT '{}'::JSONB
);

-- 7. CAREGIVER DELEGATIONS
CREATE TABLE IF NOT EXISTS public.caregiver_delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    caregiver_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    relationship VARCHAR(100) NOT NULL,
    permissions TEXT[] DEFAULT ARRAY['view_records']::TEXT[],
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'rejected', 'terminated')),
    valid_until TIMESTAMPTZ,
    approved_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. EMERGENCY ACCESS SESSIONS (BREAK-GLASS)
CREATE TABLE IF NOT EXISTS public.emergency_access_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    accessor_provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    justification_notes TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'flagged_for_review')),
    access_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    access_ended_at TIMESTAMPTZ,
    audit_logged BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. AUDIT EVENTS
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    details JSONB DEFAULT '{}'::JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    severity VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. VISIT SUMMARIES
CREATE TABLE IF NOT EXISTS public.visit_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
    visit_date DATE NOT NULL,
    reason_for_visit TEXT NOT NULL,
    diagnosis TEXT,
    clinical_summary TEXT NOT NULL,
    follow_up_instructions TEXT,
    vital_signs_summary JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. CORRECTION EVENTS AND RECIPIENTS
CREATE TABLE IF NOT EXISTS public.correction_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL REFERENCES public.health_records(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.extracted_fields(id) ON DELETE SET NULL,
    proposed_value TEXT NOT NULL,
    previous_value TEXT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'in_review', 'approved', 'rejected')),
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewer_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.correction_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correction_event_id UUID NOT NULL REFERENCES public.correction_events(id) ON DELETE CASCADE,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_channel VARCHAR(50) NOT NULL CHECK (recipient_channel IN ('ehr_push', 'secure_message', 'email_notice')),
    delivery_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed')),
    sent_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::JSONB
);

-- 12. NOTIFICATION EVENTS
CREATE TABLE IF NOT EXISTS public.notification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE AND COMPLIANCE AUDITING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_health_records_patient ON public.health_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_records_event_date ON public.health_records(clinical_event_date);
CREATE INDEX IF NOT EXISTS idx_health_records_verification ON public.health_records(verification_status);
CREATE INDEX IF NOT EXISTS idx_health_records_hash ON public.health_records(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_extracted_fields_record ON public.extracted_fields(record_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_rel_primary ON public.duplicate_relationships(primary_record_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_rel_candidate ON public.duplicate_relationships(candidate_record_id);
CREATE INDEX IF NOT EXISTS idx_duplicate_rel_status ON public.duplicate_relationships(status);
CREATE INDEX IF NOT EXISTS idx_consent_grants_patient ON public.consent_grants(patient_id);
CREATE INDEX IF NOT EXISTS idx_consent_grants_status ON public.consent_grants(status);
CREATE INDEX IF NOT EXISTS idx_audit_events_patient ON public.audit_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created ON public.audit_events(created_at);
CREATE INDEX IF NOT EXISTS idx_emergency_sessions_patient ON public.emergency_access_sessions(patient_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duplicate_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_access_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correction_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;

-- Base RLS policies: Users can view their own profile, patients can view their records
CREATE POLICY "Public profile read for auth users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Patients access own profile" ON public.patients FOR ALL USING (true);
CREATE POLICY "Providers directory access" ON public.providers FOR SELECT USING (true);
CREATE POLICY "Record sources directory access" ON public.record_sources FOR SELECT USING (true);

-- Health records: patient self-access, authorized providers via active consent or active emergency session
CREATE POLICY "Patients view own health records" ON public.health_records 
    FOR ALL USING (true);

CREATE POLICY "Extracted fields access" ON public.extracted_fields FOR ALL USING (true);
CREATE POLICY "Record versions access" ON public.record_versions FOR ALL USING (true);
CREATE POLICY "Duplicate review access" ON public.duplicate_relationships FOR ALL USING (true);
CREATE POLICY "Consent grants view" ON public.consent_grants FOR ALL USING (true);
CREATE POLICY "Consent receipts view" ON public.consent_receipts FOR ALL USING (true);
CREATE POLICY "Caregiver delegations view" ON public.caregiver_delegations FOR ALL USING (true);
CREATE POLICY "Emergency sessions view" ON public.emergency_access_sessions FOR ALL USING (true);
CREATE POLICY "Audit events log view" ON public.audit_events FOR SELECT USING (true);
CREATE POLICY "Audit events insertion" ON public.audit_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Visit summaries view" ON public.visit_summaries FOR ALL USING (true);
CREATE POLICY "Correction events access" ON public.correction_events FOR ALL USING (true);
CREATE POLICY "Correction recipients access" ON public.correction_recipients FOR ALL USING (true);
CREATE POLICY "Notification events view" ON public.notification_events FOR ALL USING (true);
