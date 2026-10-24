'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoContext } from '@/lib/state/demo-context';
import { ocrAdapter } from '@/lib/ocr/adapter';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  Shield,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { RecordCategory } from '@/lib/supabase/types';

export default function DocumentUploadPage() {
  const router = useRouter();
  const { addRecord } = useDemoContext();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RecordCategory>('lab_result');
  const [clinicalEventDate, setClinicalEventDate] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [description, setDescription] = useState('');
  const [facilityName, setFacilityName] = useState('AIIMS Central OPD');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ocrNotice, setOcrNotice] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setOcrNotice(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const selected = e.target.files[0];

    // File validation: PDF and Images up to 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(selected.type)) {
      setErrorMessage('Invalid file format. Please upload a PDF, JPEG, or PNG clinical document.');
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10 MB limit for secure clinical storage.');
      return;
    }

    setFile(selected);
    if (!title) {
      setTitle(selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select a clinical document file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      // Simulate secure private Supabase Storage upload
      setUploadProgress(45);
      await new Promise((r) => setTimeout(r, 400));

      setUploadProgress(70);
      // Process through replaceable OCR adapter
      const ocrResult = await ocrAdapter.processDocument(file.name, file.type);

      setUploadProgress(90);
      await new Promise((r) => setTimeout(r, 200));

      // Check for clinical date discrepancy if both dates provided
      let hasDateConflict = false;
      let dateConflictDetails = null;
      if (clinicalEventDate && reportDate && clinicalEventDate !== reportDate) {
        hasDateConflict = true;
        dateConflictDetails = `Encounter specimen date (${clinicalEventDate}) does not match report sign-off date (${reportDate}). Preserved separately.`;
      }

      // Verification status decision
      let verificationStatus: 'verified' | 'date_conflict' | 'ocr_uncertain' | 'unverified' = 'unverified';
      if (hasDateConflict) {
        verificationStatus = 'date_conflict';
      } else if (ocrResult.hasUncertainHandwriting) {
        verificationStatus = 'ocr_uncertain';
      } else if (ocrResult.overallConfidence >= 95) {
        verificationStatus = 'verified';
      }

      const created = addRecord({
        title,
        category,
        clinical_event_date: clinicalEventDate || null,
        report_date: reportDate || null,
        description: description || ocrResult.rawText.slice(0, 200),
        storage_file_path: `private-vault/patient-MRN-2026-90412/${file.name}`,
        file_type: file.type,
        file_size: file.size,
        verification_status: verificationStatus,
        extraction_method: ocrResult.extractionMethod,
        ocr_confidence: ocrResult.overallConfidence,
        has_date_conflict: hasDateConflict,
        date_conflict_details: dateConflictDetails,
        extracted_fields: ocrResult.extractedFields.map((f, i) => ({
          id: `field-${Date.now()}-${i}`,
          record_id: '',
          field_name: f.fieldName,
          field_value: f.fieldValue,
          field_type: 'string',
          unit: f.unit,
          reference_range: f.referenceRange,
          confidence: f.confidence,
          status: f.isUncertain ? 'uncertain' : 'auto_extracted',
          provenance_note: f.provenance,
          created_at: new Date().toISOString(),
        })),
      });

      setUploadProgress(100);
      router.push(`/records/${created.id}`);
    } catch {
      setErrorMessage('Upload failed. Please check network connectivity or try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#0d5ca8]"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-xl font-bold text-[#0a1f38]">Upload Health Record & Clinical Document</h1>
          <p className="text-xs text-slate-500 mt-1">
            Documents are encrypted and stored in private storage vaults. Extracted parameters undergo explainable verification.
          </p>
        </div>

        {errorMessage && (
          <Alert variant="danger" title="Upload Validation Error" onDismiss={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Select Document (PDF, JPEG, PNG • Max 10MB) <span className="text-red-500">*</span>
            </label>
            <div className="rounded-lg border-2 border-dashed border-slate-300 hover:border-[#0d5ca8] p-6 text-center transition-colors bg-slate-50/50">
              <input
                type="file"
                id="file-upload"
                accept=".pdf,image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-8 w-8 text-[#0d5ca8] mb-2" />
                <span className="text-sm font-semibold text-slate-800">
                  {file ? file.name : 'Click to select or drag and drop health file'}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  {file ? `${(file.size / 1024).toFixed(1)} KB • ${file.type}` : 'Hospital discharge, lab slips, prescription scans'}
                </span>
              </label>
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Document Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fasting Blood Glucose & Lipid Panel"
              required
            />

            <Select
              label="Clinical Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as RecordCategory)}
              options={[
                { value: 'lab_result', label: 'Laboratory Result' },
                { value: 'prescription', label: 'Doctor Prescription' },
                { value: 'radiology', label: 'Radiology / Imaging' },
                { value: 'clinical_note', label: 'Clinical OPD Note' },
                { value: 'discharge_summary', label: 'Discharge Summary' },
                { value: 'vaccination', label: 'Vaccination Certificate' },
                { value: 'vital_sign', label: 'Vital Signs Telemetry' },
              ]}
              required
            />
          </div>

          {/* Chronological Independence: Event Date vs Report Release Date */}
          <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#0d5ca8]" />
              <span className="text-xs font-bold text-[#0a1f38] uppercase tracking-wide">
                Chronological Segregation (Strict ABDM Audit Rule)
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Clinical dates must remain distinct from upload timestamps. If specimen date differs from lab release stamp, specify both so discrepancies can be audited.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <Input
                label="Clinical Event / Specimen Date"
                type="date"
                value={clinicalEventDate}
                onChange={(e) => setClinicalEventDate(e.target.value)}
                helperText="When the sample was drawn or encounter occurred"
              />

              <Input
                label="Report Release Date"
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                helperText="Physical print or sign-off stamp date on paper slip"
              />
            </div>
          </div>

          {/* Facility Name & Description */}
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Issuing Healthcare Facility / Clinic"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
              placeholder="e.g. AIIMS Delhi, Apollo Hospitals, Dr. Lal PathLabs"
            />

            <Textarea
              label="Clinical Summary / Notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, ordering doctor notes, or key symptoms..."
            />
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Encrypting and parsing document...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-[#0d5ca8] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="gov-orange" isLoading={isUploading} disabled={!file}>
              <Shield className="h-4 w-4 mr-1.5" />
              Upload & Extract Safely
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
