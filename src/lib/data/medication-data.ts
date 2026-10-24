// Medication and Visit Preparation Types for Prompt 4

export interface SourceMedication {
  id: string;
  record_id: string;
  source_document_name: string;
  source_page?: number;
  medication_name: string;
  dose_and_unit: string;
  frequency_instructions: string;
  prescribing_provider: string;
  prescription_date: string;
  verification_status: 'verified' | 'auto_extracted' | 'ocr_uncertain' | 'disputed';
  is_uncertain: boolean;
  uncertainty_reason?: string;
}

export interface MedicationDiscrepancyGroup {
  id: string;
  medication_name: string;
  sources: SourceMedication[];
  has_dosage_difference: boolean;
  has_frequency_difference: boolean;
  has_ocr_ambiguity: boolean;
  neutral_notice: string; // "These records contain different medication information. Please ask your clinician to clarify."
}

export interface PatientPreparedQuestion {
  id: string;
  source_record_id?: string;
  source_record_title?: string;
  question_text: string;
  category: 'date_discrepancy' | 'medication_clarification' | 'ocr_uncertainty' | 'version_replacement' | 'custom';
  context_note?: string;
  created_at: string;
}

export interface StructuredVisitDossier {
  patient_id: string;
  generated_at: string;
  selected_record_ids: string[];
  medication_discrepancy_count: number;
  date_conflict_count: number;
  duplicate_count: number;
  ocr_uncertainty_count: number;
  prepared_questions: PatientPreparedQuestion[];
}

// Synthetic Medication Records faithfully transcribed from Source Documents
export const SEED_SOURCE_MEDICATIONS: SourceMedication[] = [
  {
    id: 'sm-1',
    record_id: 'r0333333-3333-3333-3333-333333333333',
    source_document_name: 'Cardiology Outpatient Follow-up Note',
    source_page: 1,
    medication_name: 'Telmisartan',
    dose_and_unit: '40 mg',
    frequency_instructions: 'Once daily in morning (OD)',
    prescribing_provider: 'Dr. Ananya Iyer, MD (AIIMS Cardiology)',
    prescription_date: '2026-03-05',
    verification_status: 'verified',
    is_uncertain: false,
  },
  {
    id: 'sm-2',
    record_id: 'r0888888-8888-8888-8888-888888888888',
    source_document_name: 'Handwritten Cardiology Prescription & Dosage Sheet',
    source_page: 1,
    medication_name: 'Telmisartan',
    dose_and_unit: '40 mg [Uncertain: handwritten loop resembles 20mg or 40mg]',
    frequency_instructions: 'Once daily after breakfast',
    prescribing_provider: 'Dr. Ananya Iyer, MD (AIIMS Cardiology)',
    prescription_date: '2026-03-10',
    verification_status: 'ocr_uncertain',
    is_uncertain: true,
    uncertainty_reason: 'Cursive numeral dosage is ambiguous on handwritten prescription scan. Flagged for clinician verification.',
  },
  {
    id: 'sm-3',
    record_id: 'r1010101-1010-1010-1010-101010101010',
    source_document_name: 'Hospital Inpatient Discharge Summary',
    source_page: 2,
    medication_name: 'Atorvastatin',
    dose_and_unit: '10 mg',
    frequency_instructions: 'Once daily at bedtime (HS)',
    prescribing_provider: 'Dr. Vikram Malhotra (Apollo Inpatient Team)',
    prescription_date: '2025-11-17',
    verification_status: 'verified',
    is_uncertain: false,
  },
  {
    id: 'sm-4',
    record_id: 'r0333333-3333-3333-3333-333333333333',
    source_document_name: 'Cardiology Outpatient Follow-up Note',
    source_page: 1,
    medication_name: 'Atorvastatin',
    dose_and_unit: '20 mg',
    frequency_instructions: 'Once daily at bedtime (HS) with lipid monitoring',
    prescribing_provider: 'Dr. Ananya Iyer, MD (AIIMS Cardiology)',
    prescription_date: '2026-03-05',
    verification_status: 'verified',
    is_uncertain: false,
  },
  {
    id: 'sm-5',
    record_id: 'r0888888-8888-8888-8888-888888888888',
    source_document_name: 'Handwritten Cardiology Prescription & Dosage Sheet',
    source_page: 1,
    medication_name: 'Metformin',
    dose_and_unit: '500 mg SR',
    frequency_instructions: 'Once daily after dinner',
    prescribing_provider: 'Dr. Ananya Iyer, MD (AIIMS Cardiology)',
    prescription_date: '2026-03-10',
    verification_status: 'auto_extracted',
    is_uncertain: false,
  },
];

export const SEED_MEDICATION_DISCREPANCIES: MedicationDiscrepancyGroup[] = [
  {
    id: 'disc-telmisartan',
    medication_name: 'Telmisartan',
    sources: [SEED_SOURCE_MEDICATIONS[0], SEED_SOURCE_MEDICATIONS[1]],
    has_dosage_difference: true,
    has_frequency_difference: false,
    has_ocr_ambiguity: true,
    neutral_notice: 'These records contain different medication information. Please ask your clinician to clarify.',
  },
  {
    id: 'disc-atorvastatin',
    medication_name: 'Atorvastatin',
    sources: [SEED_SOURCE_MEDICATIONS[2], SEED_SOURCE_MEDICATIONS[3]],
    has_dosage_difference: true,
    has_frequency_difference: false,
    has_ocr_ambiguity: false,
    neutral_notice: 'These records contain different medication information. Please ask your clinician to clarify.',
  },
];

export const INITIAL_PREPARED_QUESTIONS: PatientPreparedQuestion[] = [
  {
    id: 'q1',
    source_record_id: 'r0222222-2222-2222-2222-222222222222',
    source_record_title: 'Hepatic Function & Bilirubin Panel (Date Discrepancy)',
    question_text: 'Can you clarify the date difference between these reports? Sample draw says 12 Feb 2026, but report release says 28 Feb 2026.',
    category: 'date_discrepancy',
    context_note: 'Specimen collected 16 days prior to stamped report date.',
    created_at: '2026-03-21T09:00:00Z',
  },
  {
    id: 'q2',
    source_record_id: 'r0888888-8888-8888-8888-888888888888',
    source_record_title: 'Handwritten Cardiology Prescription & Dosage Sheet',
    question_text: 'Which prescription should I follow for Telmisartan? Follow-up note says 40mg, but handwritten sheet has ambiguous loop (20mg vs 40mg).',
    category: 'medication_clarification',
    context_note: 'Prescription sheet dated 2026-03-10 has cursive ambiguity.',
    created_at: '2026-03-21T09:05:00Z',
  },
  {
    id: 'q3',
    source_record_id: 'r0888888-8888-8888-8888-888888888888',
    source_record_title: 'Handwritten Cardiology Prescription & Dosage Sheet',
    question_text: 'Can you confirm the unclear handwritten text in this document regarding Metformin timing?',
    category: 'ocr_uncertainty',
    context_note: 'Handwritten note extracted with moderate confidence.',
    created_at: '2026-03-21T09:10:00Z',
  },
  {
    id: 'q4',
    source_record_id: 'r0333333-3333-3333-3333-333333333333',
    source_record_title: 'Cardiology Outpatient Follow-up Note',
    question_text: 'Does the 20mg Atorvastatin in the March note replace the earlier 10mg discharge prescription from November?',
    category: 'version_replacement',
    context_note: 'Hospital discharge was 10mg; outpatient clinic increased to 20mg.',
    created_at: '2026-03-21T09:15:00Z',
  },
];
