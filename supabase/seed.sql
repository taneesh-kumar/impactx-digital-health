-- ==============================================================================
-- SWASTHYASETU DIGITAL HEALTH PLATFORM: SYNTHETIC DATA SEED
-- Dataset: Complete Indian Digital Health Journey (12 Records, 2 Conflicts, 3 Duplicates, 1 OCR Uncertainty)
-- ==============================================================================

-- Clean existing data in dependency order
TRUNCATE TABLE public.notification_events CASCADE;
TRUNCATE TABLE public.correction_recipients CASCADE;
TRUNCATE TABLE public.correction_events CASCADE;
TRUNCATE TABLE public.visit_summaries CASCADE;
TRUNCATE TABLE public.audit_events CASCADE;
TRUNCATE TABLE public.emergency_access_sessions CASCADE;
TRUNCATE TABLE public.caregiver_delegations CASCADE;
TRUNCATE TABLE public.consent_receipts CASCADE;
TRUNCATE TABLE public.consent_grants CASCADE;
TRUNCATE TABLE public.duplicate_relationships CASCADE;
TRUNCATE TABLE public.extracted_fields CASCADE;
TRUNCATE TABLE public.record_versions CASCADE;
TRUNCATE TABLE public.health_records CASCADE;
TRUNCATE TABLE public.record_sources CASCADE;
TRUNCATE TABLE public.providers CASCADE;
TRUNCATE TABLE public.patients CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- 1. PROFILES FOR SYNTHETIC DEMONSTRATION IDENTITIES
INSERT INTO public.profiles (id, role, full_name, email, phone, avatar_url, is_demo_identity) VALUES
('11111111-1111-1111-1111-111111111111', 'patient', 'Rajesh Sharma', 'rajesh.sharma@demo.swasthyasetu.in', '+91 98765 43210', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', true),
('22222222-2222-2222-2222-222222222222', 'specialist', 'Dr. Ananya Iyer, MD', 'dr.iyer@demo.aiims.edu.in', '+91 94440 12345', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150', true),
('33333333-3333-3333-3333-333333333333', 'caregiver', 'Pooja Sharma', 'pooja.sharma@demo.swasthyasetu.in', '+91 98765 43211', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', true),
('44444444-4444-4444-4444-444444444444', 'emergency_clinician', 'Dr. Vikram Malhotra, MBBS, DEM', 'dr.malhotra@demo.apollo.in', '+91 98111 22233', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150', true),
('55555555-5555-5555-5555-555555555555', 'auditor', 'Suresh Menon', 'suresh.menon@demo.abdm.gov.in', '+91 99000 88776', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', true);

-- 2. PATIENT ENTITY
INSERT INTO public.patients (id, profile_id, mrn, dob, gender, blood_group, emergency_contact_name, emergency_contact_phone, address, allergies, chronic_conditions) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'MRN-2026-90412', '1982-06-15', 'Male', 'B+', 'Pooja Sharma (Wife)', '+91 98765 43211', 'Flat 402, Nilgiri Heights, Sector 14, Dwarka, New Delhi 110075', ARRAY['Penicillin', 'Sulfa drugs']::TEXT[], ARRAY['Hypertension', 'Type 2 Diabetes (Controlled)']::TEXT[]);

-- PROVIDER ENTITIES
INSERT INTO public.providers (id, profile_id, license_number, specialization, facility_name, department, contact_phone) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'MCI-DEL-2012-88741', 'Cardiology & Preventive Medicine', 'AIIMS Cardiology Center', 'Department of Cardiology', '+91 11 2658 8500'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'DMC-2018-49210', 'Emergency Medicine & Trauma', 'Apollo Emergency Center', 'Acute Resuscitation Unit', '+91 11 2692 5858');

-- 3. RECORD SOURCES
INSERT INTO public.record_sources (id, source_type, name, identifier, is_trusted, metadata) VALUES
('s1111111-1111-1111-1111-111111111111', 'ehr_integration', 'AIIMS Central Clinical Registry', 'AIIMS-HL7-GATEWAY', true, '{"gateway_version": "2.4", "abdm_bridge": true}'),
('s2222222-2222-2222-2222-222222222222', 'lab_feed', 'Dr. Lal PathLabs Diagnostic Feed', 'LALPATH-DELHI-SOUTH', true, '{"lis_protocol": "REST/JSON", "nabl_accredited": true}'),
('s3333333-3333-3333-3333-333333333333', 'clinical_portal', 'Max Super Speciality Portal', 'MAX-SAKET-EHR', true, '{"portal_api": "FHIR-R4"}'),
('s4444444-4444-4444-4444-444444444444', 'manual_upload', 'Patient Manual Mobile Upload', 'MOBILE-CAM-UPLOAD', false, '{"client_device": "Android 14 Chrome"}');

-- 4. 12 HEALTH RECORDS (Carefully constructed to match exact overview stats)
-- Record 1: Comprehensive Lipid Profile (Normal, Verified)
INSERT INTO public.health_records (
    id, patient_id, provider_id, source_id, uploaded_by, category, title, description,
    clinical_event_date, report_date, upload_timestamp, storage_file_path, file_type, file_size, sha256_hash,
    verification_status, extraction_method, ocr_confidence, has_date_conflict, date_conflict_details, is_superseded
) VALUES (
    'r0111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 's2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
    'lab_result', 'Comprehensive Fasting Lipid Profile', 'Complete cholesterol, triglycerides, HDL, LDL assessment after 12-hour fast',
    '2026-01-15', '2026-01-16', '2026-01-16 10:30:00+00', 'records/r01-lipid-panel-jan2026.pdf', 'application/pdf', 348200, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'verified', 'native_digital', 100.0, false, null, false
);

-- Record 2: DATE CONFLICT 1 - Liver Function Panel (Lab specimen taken vs stamped report date discrepancy)
INSERT INTO public.health_records (
    id, patient_id, provider_id, source_id, uploaded_by, category, title, description,
    clinical_event_date, report_date, upload_timestamp, storage_file_path, file_type, file_size, sha256_hash,
    verification_status, extraction_method, ocr_confidence, has_date_conflict, date_conflict_details, is_superseded
) VALUES (
    'r0222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 's4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111',
    'lab_result', 'Hepatic Function & Bilirubin Panel', 'Routine liver enzyme evaluation showing discrepancy between specimen draw and report date',
    '2026-02-12', '2026-02-28', '2026-03-01 14:15:00+00', 'records/r02-lft-panel-feb2026.pdf', 'application/pdf', 412900, 'a8f5f167f44f4964e6c998dee827110c01759f37754d9fa2463e8a49c9ad64b1',
    'date_conflict', 'ocr', 88.5, true, 'Sample collection timestamp (2026-02-12) conflicts with printed physical report release header (2026-02-28) by 16 days. Requires clinical verification before relying on enzymatic trend.', false
);

-- Record 3: DATE CONFLICT 2 - Cardiology Consultation & Medication Re-evaluation
INSERT INTO public.health_records (
    id, patient_id, provider_id, source_id, uploaded_by, category, title, description,
    clinical_event_date, report_date, upload_timestamp, storage_file_path, file_type, file_size, sha256_hash,
    verification_status, extraction_method, ocr_confidence, has_date_conflict, date_conflict_details, is_superseded
) VALUES (
    'r0333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 's3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
    'clinical_note', 'Cardiology Outpatient Follow-up Note', 'Quarterly hypertension and lipid review with Dr. Ananya Iyer',
    '2026-03-05', '2026-03-19', '2026-03-20 09:00:00+00', 'records/r03-cardio-followup.pdf', 'application/pdf', 285400, '7d793037a0760186574b0282f2f435e708c697843477ba91f7d5ec92f3900be4',
    'date_conflict', 'native_digital', 95.0, true, 'Encounter record notes visit occurred 2026-03-05 but clinic discharge sign-off stamp reads 2026-03-19.', false
);

-- Record 4: POTENTIAL DUPLICATE 1 (Primary: Chest X-Ray PA View from Apollo Diagnostics)
INSERT INTO public.health_records (
    id, patient_id, provider_id, source_id, uploaded_by, category, title, description,
    clinical_event_date, report_date, upload_timestamp, storage_file_path, file_type, file_size, sha256_hash,
    verification_status, extraction_method, ocr_confidence, has_date_conflict, date_conflict_details, is_superseded
) VALUES (
    'r0444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 's1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
    'radiology', 'Chest X-Ray PA View (Digital Diagnostic)', 'Digital radiograph demonstrating clear lung fields, cardiothoracic ratio normal',
    '2026-02-18', '2026-02-18', '2026-02-19 11:20:00+00', 'records/r04-chest-xray-apollo.pdf', 'application/pdf', 849200, 'bc68a60965e69e46a7cb81e97dc2184e49ee7c8b02fc0f930e1814e5f72cf936',
    'verified', 'native_digital', 99.0, false, null, false
);

-- Record 5: POTENTIAL DUPLICATE 1 (Candidate Exact Duplicate - Same file uploaded via patient portal)
INSERT INTO public.health_records (
    id, patient_id, provider_id, source_id, uploaded_by, category, title, description,
    clinical_event_date, report_date, upload_timestamp, storage_file_path, file_type, file_size, sha256_hash,
    verification_status, extraction_method, ocr_confidence, has_date_conflict, date_conflict_details, is_superseded
) VALUES (
    'r0555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 's4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111',
    'radiology', 'Chest X-Ray PA View (Patient Mobile Copy)', 'Uploaded duplicate copy of Apollo chest X-ray received via WhatsApp/Email',
    '2026-02-18', '2026-02-18', '2026-02-22 16:45:00+00', 'records/r05-chest-xray-mobile-copy.pdf', 'application/pdf', 849200, 'bc68a60965e69e46a7cb81e97dc2184e49ee7c8b02fc0f930e1814e5f72cf936',
    'pending_review', 'ocr', 99.0, false, null, false
);

-- Record 6: POTENTIAL DUPLICATE 2 (Primary: Glycated Hemoglobin HbA1c Lab Report)
INSERT INTO public.health_records (
    id, patient_id, provider_id, source_id, uploaded_by, category, title, description,
    clinical_event_date, report_date, upload_timestamp, storage_file_path, file_type, file_size, sha256_hash,
    verification_status, extraction_method, ocr_confidence, has_date_conflict, date_conflict_details, is_superseded
) VALUES (
    'r0666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 's2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
    'lab_result', 'Glycated Hemoglobin (HbA1c) & Fasting Plasma Glucose', 'HbA1c measured at 6.4%, Estimated Average Glucose 137 mg/dL',
    '2026-03-01', '2026-03-02', '2026-03-02 08:30:00+00', 'records/r06-hba1c-lalpath.pdf', 'application/pdf', 290100, '31b816a1c1d0446979603513dd54803ea406b7d2f94bfa23f7c9e7fa3ee2ef12',
    'verified', 'native_digital', 98.5, false, null, false
);

-- Record 7: POTENTIAL DUPLICATE 2 (Candidate Near-Duplicate: Scanned Xerox of same HbA1c report with OCR noise)
INSERT INTO public.health_records (
    id, patient_id, provider_id, source_id, uploaded_by, category, title, description,
    clinical_event_date, report_date, upload_timestamp, storage_file_path, file_type, file_size, sha256_hash,
    verification_status, extraction_method, ocr_confidence, has_date_conflict, date_conflict_details, is_superseded
) VALUES (
    'r0777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 's4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111',
    'lab_result', 'Scanned Blood Sugar & HbA1c Slip', 'Camera scan of paper physical printout of HbA1c',
    '2026-03-01', '2026-03-02', '2026-03-04 18:10:00+00', 'records/r07-hba1c-camscan.jpg', 'image/jpeg', 1240500, '49d60882e382d33454b38d35ff64b8a4f9408b0222a014a5b4819d2fcb64005b',
    'pending_review', 'ocr', 82.0, false, null, false
);

-- Record 8: OCR UNCERTAINTY 1 (Handwritten Outpatient Prescription with Unclear Dosage)
INSERT INTO public.health_records (
    id, patient_id, provider_id, source_id, uploaded_by, category, title, description,
    clinical_event_date, report_date, upload_timestamp, storage_file_path, file_type, file_size, sha256_hash,
    verification_status, extraction_method, ocr_confidence, has_date_conflict, date_conflict_details, is_superseded
) VALUES (
    'r0888888-8888-8888-8888-888888888888', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 's4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111',
    'prescription', 'Handwritten Cardiology Prescription & Dosage Sheet', 'Doctor handwritten prescription containing Telmisartan and Metformin dosage',
    '2026-03-10', '2026-03-10', '2026-03-11 12:00:00+00', 'records/r08-handwritten-rx.jpg', 'image/jpeg', 1894200, '82c0ef854203ae09825b4122d287a9332ea70087192c7ca67c29b2824fa2efc1',
    'ocr_uncertain', 'ocr', 54.0, false, null, false
);

-- Record 9: 12-Lead Electrocardiogram (ECG) Report
INSERT INTO public.health_records (
    id, patient_id, provider_id, source_id, uploaded_by, category, title, description,
    clinical_event_date, report_date, upload_timestamp, storage_file_path, file_type, file_size, sha256_hash,
    verification_status, extraction_method, ocr_confidence, has_date_conflict, date_conflict_details, is_superseded
) VALUES (
    'r0999999-9999-9999-9999-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 's1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
    'clinical_note', 'Standard 12-Lead Resting Electrocardiogram (ECG)', 'Normal sinus rhythm, heart rate 72 bpm, PR interval 160ms, no ST-elevation',
    '2026-01-20', '2026-01-20', '2026-01-21 09:15:00+00', 'records/r09-ecg-resting.pdf', 'application/pdf', 512000, '99f8d16719b441a1c97042898f5a278d655f41249b6574f14532aa879c5c24a9',
    'verified', 'native_digital', 100.0, false, null, false
);

-- Record 10: Discharge Summary (2025 Acute Bronchitis Admission)
INSERT INTO public.health_records (
    id, patient_id, provider_id, source_id, uploaded_by, category, title, description,
    clinical_event_date, report_date, upload_timestamp, storage_file_path, file_type, file_size, sha256_hash,
    verification_status, extraction_method, ocr_confidence, has_date_conflict, date_conflict_details, is_superseded
) VALUES (
    'r1010101-1010-1010-1010-101010101010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 's3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
    'discharge_summary', 'Hospital Inpatient Discharge Summary', 'Admission for acute bronchitis with complete clinical resolution on nebulization & oral antibiotics',
    '2025-11-14', '2025-11-17', '2025-11-18 10:00:00+00', 'records/r10-discharge-summary.pdf', 'application/pdf', 678000, '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    'verified', 'native_digital', 100.0, false, null, false
);

-- Record 11: Adult COVID-19 Booster & Influenza Vaccination Certificate
INSERT INTO public.health_records (
    id, patient_id, provider_id, source_id, uploaded_by, category, title, description,
    clinical_event_date, report_date, upload_timestamp, storage_file_path, file_type, file_size, sha256_hash,
    verification_status, extraction_method, ocr_confidence, has_date_conflict, date_conflict_details, is_superseded
) VALUES (
    'r1111111-1111-1111-1111-111111111112', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 's1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
    'vaccination', 'Annual Influenza & COVID-19 Precaution Dose Certificate', 'Quadrivalent Influenza Vaccine administered in left deltoid',
    '2025-10-05', '2025-10-05', '2025-10-06 14:00:00+00', 'records/r11-vaccination-cert.pdf', 'application/pdf', 198000, '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    'verified', 'native_digital', 100.0, false, null, false
);

-- Record 12: Continuous Ambulatory Blood Pressure Monitoring (ABPM) Log
INSERT INTO public.health_records (
    id, patient_id, provider_id, source_id, uploaded_by, category, title, description,
    clinical_event_date, report_date, upload_timestamp, storage_file_path, file_type, file_size, sha256_hash,
    verification_status, extraction_method, ocr_confidence, has_date_conflict, date_conflict_details, is_superseded
) VALUES (
    'r1212121-1212-1212-1212-121212121212', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 's3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
    'vital_sign', '24-Hour Ambulatory Blood Pressure Telemetry Log', 'Average daytime BP 128/82 mmHg, nighttime dip 12%, diurnal variation preserved',
    '2026-02-05', '2026-02-06', '2026-02-07 10:00:00+00', 'records/r12-abpm-24hr.pdf', 'application/pdf', 445000, 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    'verified', 'native_digital', 99.0, false, null, false
);

-- 5. EXTRACTED FIELDS FOR HEALTH RECORDS
INSERT INTO public.extracted_fields (id, record_id, field_name, field_value, field_type, unit, reference_range, confidence, status, provenance_note) VALUES
(gen_random_uuid(), 'r0111111-1111-1111-1111-111111111111', 'Total Cholesterol', '194', 'numeric', 'mg/dL', '< 200 mg/dL', 99.0, 'verified', 'AIIMS Central Lab Digital Auto-Extraction'),
(gen_random_uuid(), 'r0111111-1111-1111-1111-111111111111', 'Serum Triglycerides', '168', 'numeric', 'mg/dL', '< 150 mg/dL (Borderline)', 99.0, 'verified', 'AIIMS Central Lab Digital Auto-Extraction'),
(gen_random_uuid(), 'r0111111-1111-1111-1111-111111111111', 'HDL Cholesterol (Direct)', '44', 'numeric', 'mg/dL', '> 40 mg/dL', 98.0, 'verified', 'AIIMS Central Lab Digital Auto-Extraction'),
(gen_random_uuid(), 'r0111111-1111-1111-1111-111111111111', 'LDL Cholesterol (Calculated)', '116', 'numeric', 'mg/dL', '< 100 mg/dL', 98.0, 'verified', 'AIIMS Central Lab Digital Auto-Extraction'),
(gen_random_uuid(), 'r0222222-2222-2222-2222-222222222222', 'Serum Bilirubin Total', '0.9', 'numeric', 'mg/dL', '0.2 - 1.2 mg/dL', 88.0, 'auto_extracted', 'Extracted via OCR with date conflict warning'),
(gen_random_uuid(), 'r0222222-2222-2222-2222-222222222222', 'SGPT / ALT', '38', 'numeric', 'U/L', '< 45 U/L', 87.0, 'auto_extracted', 'Extracted via OCR with date conflict warning'),
(gen_random_uuid(), 'r0666666-6666-6666-6666-666666666666', 'Glycated Hemoglobin (HbA1c)', '6.4', 'numeric', '%', '4.0 - 5.6 % (Prediabetes: 5.7 - 6.4%)', 99.0, 'verified', 'Dr. Lal PathLabs LIS Feed'),
(gen_random_uuid(), 'r0666666-6666-6666-6666-666666666666', 'Fasting Blood Glucose', '112', 'numeric', 'mg/dL', '70 - 99 mg/dL', 99.0, 'verified', 'Dr. Lal PathLabs LIS Feed'),
(gen_random_uuid(), 'r0888888-8888-8888-8888-888888888888', 'Prescribed Drug 1', 'Telmisartan [40mg vs 20mg uncertain]', 'string', 'mg', 'Unclear handwritten line', 52.0, 'uncertain', 'Handwritten doctor script. Requires pharmacist / clinician verification.'),
(gen_random_uuid(), 'r0888888-8888-8888-8888-888888888888', 'Prescribed Drug 2', 'Metformin 500mg SR OD', 'string', 'mg', 'Twice daily after meals', 76.0, 'auto_extracted', 'Semi-legible handwriting extracted with moderate confidence');

-- 6. DUPLICATE RELATIONSHIPS (3 Candidates)
INSERT INTO public.duplicate_relationships (
    id, primary_record_id, candidate_record_id, similarity_score, match_tier,
    detection_method, match_explanation, matching_attributes, conflicting_attributes, status
) VALUES 
-- Case 1: Exact Hash Duplicate (100% SHA-256 match)
(
    'd1111111-1111-1111-1111-111111111111',
    'r0444444-4444-4444-4444-444444444444',
    'r0555555-5555-5555-5555-555555555555',
    100.0,
    'exact_duplicate',
    'hash_match',
    'Identical SHA-256 binary hash found across both records (bc68a60965...). The second record was uploaded manually by the patient 3 days after the hospital EHR auto-synced the primary document.',
    '[{"attribute": "SHA-256 Checksum", "value": "bc68a60965e69e46..."}, {"attribute": "Clinical Event Date", "value": "2026-02-18"}, {"attribute": "Category", "value": "Radiology / Chest X-Ray"}]'::JSONB,
    '[{"attribute": "Upload Timestamp", "primary": "2026-02-19 11:20:00", "candidate": "2026-02-22 16:45:00"}, {"attribute": "Source Channel", "primary": "AIIMS-HL7-GATEWAY", "candidate": "MOBILE-CAM-UPLOAD"}]'::JSONB,
    'detected'
),
-- Case 2: Near Duplicate (89% Text & Clinical Metadata match - digital vs physical scan of HbA1c)
(
    'd2222222-2222-2222-2222-222222222222',
    'r0666666-6666-6666-6666-666666666666',
    'r0777777-7777-7777-7777-777777777777',
    89.4,
    'near_duplicate',
    'text_similarity',
    'Extracted test names, specimen collection date (2026-03-01), patient MRN and clinical values match Dr. Lal PathLabs report. Candidate is a smartphone camera capture of the printed lab report containing minor scanner blur and lighting artifacts.',
    '[{"attribute": "Patient MRN", "value": "MRN-2026-90412"}, {"attribute": "Specimen Date", "value": "2026-03-01"}, {"attribute": "Test Name", "value": "Glycated Hemoglobin (HbA1c)"}, {"attribute": "Reported HbA1c", "value": "6.4%"}]'::JSONB,
    '[{"attribute": "Format", "primary": "Native Digital PDF (290 KB)", "candidate": "JPEG Camera Photograph (1.2 MB)"}, {"attribute": "OCR Confidence", "primary": "98.5%", "candidate": "82.0%"}]'::JSONB,
    'detected'
),
-- Case 3: Similar Event but Distinct Clinical Event (Different date - Must NOT merge silently)
(
    'd3333333-3333-3333-3333-333333333333',
    'r0111111-1111-1111-1111-111111111111',
    'r0222222-2222-2222-2222-222222222222',
    64.2,
    'different_event',
    'metadata_heuristic',
    'Both records represent outpatient blood chemistry panels ordered by Dr. Ananya Iyer. However, specimen dates (Jan 15 vs Feb 12) confirm these are separate monitoring encounters across consecutive months.',
    '[{"attribute": "Ordering Physician", "value": "Dr. Ananya Iyer"}, {"attribute": "Facility", "value": "AIIMS Cardiology Center"}, {"attribute": "Category", "value": "Lab Result"}]'::JSONB,
    '[{"attribute": "Clinical Event Date", "primary": "2026-01-15 (January)", "candidate": "2026-02-12 (February)"}, {"attribute": "Assay Panel", "primary": "Lipid Profile", "candidate": "Hepatic Function (LFT)"}]'::JSONB,
    'detected'
);

-- 7. CONSENT GRANTS (2 Active Shares)
INSERT INTO public.consent_grants (
    id, patient_id, grantee_type, grantee_id, grantee_name, scope, permissions, valid_from, valid_until, purpose, status
) VALUES
(
    'c1111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'provider',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Dr. Ananya Iyer, MD (AIIMS Cardiology)',
    'all_records',
    ARRAY['read', 'delegate']::TEXT[],
    now() - INTERVAL '30 days',
    now() + INTERVAL '180 days',
    'Comprehensive cardiac risk assessment, chronic hypertension management and medication monitoring',
    'active'
),
(
    'c2222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'facility',
    null,
    'Apollo Specialty Hospital Network',
    'lab_results_only',
    ARRAY['read']::TEXT[],
    now() - INTERVAL '10 days',
    now() + INTERVAL '20 days',
    'Outpatient pathology verification and radiologist second opinion review',
    'active'
);

-- CONSENT RECEIPTS (ABDM Cryptographic Integrity Token)
INSERT INTO public.consent_receipts (
    id, consent_grant_id, patient_id, hash_signature, receipt_token, policy_version, captured_at, ip_address_hash
) VALUES
(
    gen_random_uuid(),
    'c1111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    'CR-ABDM-2026-094182',
    'v1.0-ABDM-COMPLIANT',
    now() - INTERVAL '30 days',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
),
(
    gen_random_uuid(),
    'c2222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'sha256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    'CR-ABDM-2026-104921',
    'v1.0-ABDM-COMPLIANT',
    now() - INTERVAL '10 days',
    'bc68a60965e69e46a7cb81e97dc2184e49ee7c8b02fc0f930e1814e5f72cf936'
);

-- 8. CAREGIVER DELEGATIONS (1 Active Caregiver)
INSERT INTO public.caregiver_delegations (
    id, patient_id, caregiver_profile_id, relationship, permissions, status, valid_until, approved_at
) VALUES (
    'g1111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    'Spouse & Legal Healthcare Proxy',
    ARRAY['view_records', 'upload_records', 'manage_consents', 'emergency_contact']::TEXT[],
    'active',
    now() + INTERVAL '365 days',
    now() - INTERVAL '90 days'
);

-- 9. EMERGENCY ACCESS SESSIONS (Break-Glass Audit)
INSERT INTO public.emergency_access_sessions (
    id, patient_id, accessor_provider_id, reason, justification_notes, status, access_started_at, access_ended_at, audit_logged
) VALUES (
    'e1111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Acute Syncope & Suspected Hypertensive Crisis in Emergency Triage',
    'Patient presented with acute lightheadedness and diaphoresis. Immediate break-glass record retrieval invoked to evaluate drug-drug allergy risk prior to intravenous antihypertensive administration.',
    'closed',
    now() - INTERVAL '14 days 2 hours',
    now() - INTERVAL '14 days 1 hour',
    true
);

-- 10. AUDIT EVENTS
INSERT INTO public.audit_events (
    id, user_id, actor_role, action, resource_type, resource_id, patient_id, details, ip_address, user_agent, severity, created_at
) VALUES
(
    gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'specialist', 'read', 'health_record', 'r0111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"purpose": "Pre-consultation cardiac risk evaluation", "consent_id": "c1111111-1111-1111-1111-111111111111"}'::JSONB,
    '14.139.60.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0', 'info', now() - INTERVAL '2 days'
),
(
    gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'emergency_clinician', 'emergency_break_glass', 'patient_emergency_dossier', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"reason": "Acute Syncope Protocol", "session_id": "e1111111-1111-1111-1111-111111111111"}'::JSONB,
    '122.161.49.201', 'Apollo Hospital Emergency Tablet Terminal OS 14.1', 'critical', now() - INTERVAL '14 days 2 hours'
),
(
    gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'patient', 'consent_grant', 'consent_grant', 'c2222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"granted_to": "Apollo Specialty Hospital Network", "scope": "lab_results_only"}'::JSONB,
    '49.36.12.88', 'SwasthyaSetu Mobile App v2.1 (Android)', 'info', now() - INTERVAL '10 days'
);

-- 11. VISIT SUMMARIES
INSERT INTO public.visit_summaries (
    id, patient_id, provider_id, visit_date, reason_for_visit, diagnosis, clinical_summary, follow_up_instructions, vital_signs_summary
) VALUES (
    gen_random_uuid(),
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '2026-03-05',
    'Quarterly Hypertension and Dyslipidemia Evaluation',
    'Essential Hypertension (Grade 1, controlled); Borderline Dyslipidemia',
    'Blood pressure currently stable at 128/82 mmHg on Telmisartan. Fasting lipids show slight triglyceride elevation (168 mg/dL) while HDL is acceptable at 44 mg/dL. ECG unremarkable with normal sinus rhythm.',
    'Continue Telmisartan 40mg once daily in morning. Maintain low sodium diet (< 2g/day) and 30 minutes of aerobic walking 5 days a week. Repeat lipid profile in 3 months.',
    '{"blood_pressure": "128/82 mmHg", "heart_rate": "72 bpm", "bmi": "24.6 kg/m2", "spO2": "98%"}'::JSONB
);

-- 12. CORRECTION EVENTS
INSERT INTO public.correction_events (
    id, record_id, patient_id, requester_id, field_id, proposed_value, previous_value, reason, status, reviewer_id, reviewer_notes
) VALUES (
    gen_random_uuid(),
    'r0222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    null,
    'Clinical Event Date: 2026-02-12',
    'Clinical Event Date: 2026-02-28',
    'Specimen was physically collected at AIIMS phlebotomy on 12 Feb 2026; 28 Feb is the administrative billing finalization date.',
    'in_review',
    '22222222-2222-2222-2222-222222222222',
    'Reviewing phlebotomy laboratory barcode logs to re-align clinical chronology.'
);

-- 13. NOTIFICATION EVENTS
INSERT INTO public.notification_events (
    id, recipient_user_id, event_type, title, message, link_url, is_read
) VALUES
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'duplicate_detected',
    '3 Duplicate Records Flagged',
    'Our explainable reconciliation engine detected 1 exact hash match and 2 near-duplicate records awaiting your review.',
    '/duplicate-review',
    false
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'date_conflict',
    '2 Records Have Conflicting Chronology',
    'Liver Function Panel and Cardiology note have conflicting collection vs report stamps requiring verification.',
    '/timeline?filter=date_conflict',
    false
),
(
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'ocr_uncertain',
    'OCR Flag: Handwritten Prescription',
    'A handwritten prescription from Dr. Ananya Iyer requires confirmation for dosage ambiguity.',
    '/records/r0888888-8888-8888-8888-888888888888',
    false
);
