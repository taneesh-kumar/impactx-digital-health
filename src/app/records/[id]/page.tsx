'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDemoContext } from '@/lib/state/demo-context';
import {
  FileText,
  Calendar,
  Building,
  Upload,
  ShieldCheck,
  AlertTriangle,
  FileQuestion,
  Copy,
  Clock,
  Download,
  Share2,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  Eye,
  History,
  Lock,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';

export default function RecordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const recordId = unwrappedParams.id;
  const router = useRouter();

  const { records, duplicates, consents, updateRecordVerification, logAuditEvent, currentProfile } = useDemoContext();
  const [activeTab, setActiveTab] = useState<'extracted' | 'preview' | 'provenance' | 'history'>('extracted');

  const record = records.find((r) => r.id === recordId);
  const duplicatePair = duplicates.find((d) => d.primary_record_id === recordId || d.candidate_record_id === recordId);
  const relevantConsents = consents.filter((c) => c.status === 'active');

  if (!record) {
    return (
      <EmptyState
        title="Health Record Not Found"
        description="The requested record identifier does not exist or has been archived."
        actionLabel="Return to Timeline"
        onAction={() => router.push('/timeline')}
      />
    );
  }

  const handleVerifyManually = () => {
    updateRecordVerification(record.id, 'verified');
    logAuditEvent({
      user_id: currentProfile.id,
      actor_role: currentProfile.role,
      action: 'clinical_verify',
      resource_type: 'health_record',
      resource_id: record.id,
      patient_id: record.patient_id,
      details: { verified_by_name: currentProfile.full_name, previous_status: record.verification_status },
      severity: 'info',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link href="/timeline" className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#0d5ca8]">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Timeline
        </Link>

        <div className="flex items-center gap-2">
          {record.verification_status !== 'verified' && (
            <Button variant="primary" size="sm" onClick={handleVerifyManually}>
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Mark as Clinically Verified
            </Button>
          )}
          <Link href="/share-consent">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-1.5" />
              Manage Access
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Dossier Header Card */}
      <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" size="md" className="uppercase font-bold tracking-wider">
                {record.category.replace('_', ' ')}
              </Badge>

              <Badge
                size="md"
                variant={
                  record.verification_status === 'verified'
                    ? 'success'
                    : record.verification_status === 'date_conflict'
                    ? 'warning'
                    : record.verification_status === 'ocr_uncertain'
                    ? 'orange'
                    : 'neutral'
                }
              >
                {record.verification_status === 'date_conflict'
                  ? 'Date Conflict Detected'
                  : record.verification_status === 'ocr_uncertain'
                  ? 'OCR Ambiguity Flag'
                  : record.verification_status === 'pending_review'
                  ? 'Duplicate Review Pending'
                  : 'Verified Clinical Record'}
              </Badge>

              <span className="text-xs text-slate-500 font-mono">
                Extraction: {record.extraction_method.replace('_', ' ')}
              </span>
            </div>

            <h1 className="text-2xl font-black text-[#0a1f38]">{record.title}</h1>

            {record.description && (
              <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">{record.description}</p>
            )}
          </div>

          {/* Quick Meta Badge Box */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3.5 space-y-2 text-xs min-w-[240px]">
            <div className="flex justify-between items-center text-slate-600">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">File Format:</span>
              <span className="font-mono font-medium">{record.file_type || 'PDF'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">File Size:</span>
              <span className="font-mono font-medium">{record.file_size ? `${Math.round(record.file_size / 1024)} KB` : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Integrity:</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> SHA-256 Verified
              </span>
            </div>
          </div>
        </div>

        {/* DATE CONFLICT WARNING BANNER (When present) */}
        {record.has_date_conflict && (
          <div className="rounded-lg border border-orange-300 bg-orange-50 p-4 text-xs text-orange-950 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[#d9531e] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm">Chronology Conflict Notice</p>
              <p className="text-orange-900 leading-relaxed">
                {record.date_conflict_details ||
                  'The recorded specimen collection timestamp does not align with the physical laboratory report sign-off date. Both timestamps are preserved to prevent clinical misinterpretation.'}
              </p>
              <div className="pt-2 flex items-center gap-4 text-xs font-semibold">
                <span>Specimen Draw: {record.clinical_event_date}</span>
                <span>•</span>
                <span>Lab Release Stamp: {record.report_date}</span>
              </div>
            </div>
          </div>
        )}

        {/* OCR UNCERTAINTY NOTICE (When present) */}
        {record.verification_status === 'ocr_uncertain' && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 flex items-start gap-3">
            <FileQuestion className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm">Handwritten Script Ambiguity</p>
              <p className="text-amber-900 leading-relaxed">
                This document contains handwritten cursive handwriting. The OCR parser detected uncertain confidence (54.0%) on medication dosage. In accordance with safety rules, uncertain text has not been promoted to verified clinical data without human review.
              </p>
            </div>
          </div>
        )}

        {/* DUPLICATE RELATIONSHIP BANNER (When linked in duplicate detection) */}
        {duplicatePair && (
          <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Copy className="h-4 w-4 text-[#0d5ca8]" />
              <div>
                <span className="font-bold">Reconciliation Alert: </span>
                <span>
                  This record is flagged in a candidate pair ({duplicatePair.match_tier.replace('_', ' ')} - {duplicatePair.similarity_score}% match).
                </span>
              </div>
            </div>
            <Link href="/duplicate-review">
              <Button variant="outline" size="sm" className="text-xs bg-white">
                Inspect Side-by-Side Review →
              </Button>
            </Link>
          </div>
        )}

        {/* Strict Chronological Triad (Clinical Event Date vs Report Date vs Upload Timestamp) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3 rounded bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Clinical Event Date</span>
            <div className="text-sm font-bold text-slate-900">
              {record.clinical_event_date || 'Unknown (Preserved)'}
            </div>
            <span className="text-[10px] text-slate-400">Date patient encounter/draw occurred</span>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Report Release Date</span>
            <div className="text-sm font-bold text-slate-900">
              {record.report_date || 'Unknown (Preserved)'}
            </div>
            <span className="text-[10px] text-slate-400">Date diagnostic facility stamped record</span>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Upload & Ingestion Timestamp</span>
            <div className="text-sm font-bold text-slate-900">
              {new Date(record.upload_timestamp).toLocaleDateString()} {new Date(record.upload_timestamp).toLocaleTimeString()}
            </div>
            <span className="text-[10px] text-slate-400">Time recorded in SwasthyaSetu dossier</span>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="border-b border-slate-200 flex space-x-6">
        <button
          onClick={() => setActiveTab('extracted')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === 'extracted'
              ? 'text-[#0d5ca8] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0d5ca8]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Extracted Clinical Fields ({record.extracted_fields?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === 'preview'
              ? 'text-[#0d5ca8] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0d5ca8]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Original Document Preview
        </button>

        <button
          onClick={() => setActiveTab('provenance')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === 'provenance'
              ? 'text-[#0d5ca8] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0d5ca8]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Provenance & Origin Attribution
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === 'history'
              ? 'text-[#0d5ca8] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0d5ca8]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Version History & Access Controls
        </button>
      </div>

      {/* Tab 1: Extracted Clinical Fields */}
      {activeTab === 'extracted' && (
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Extracted Diagnostic Parameters</h3>
            <span className="text-xs text-slate-500">Source-linked field provenance</span>
          </div>

          {!record.extracted_fields || record.extracted_fields.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">No extracted tabular fields available for this narrative record.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field / Test Name</TableHead>
                  <TableHead>Extracted Value</TableHead>
                  <TableHead>Reference Range</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Verification Status</TableHead>
                  <TableHead>Provenance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {record.extracted_fields.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell className="font-semibold text-slate-900">{field.field_name}</TableCell>
                    <TableCell>
                      <span className="font-bold text-[#0d5ca8]">
                        {field.field_value} {field.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{field.reference_range || 'N/A'}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{field.confidence ? `${field.confidence}%` : 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        size="sm"
                        variant={
                          field.status === 'verified'
                            ? 'success'
                            : field.status === 'uncertain'
                            ? 'orange'
                            : 'neutral'
                        }
                      >
                        {field.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{field.provenance_note || 'Auto-extracted'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Tab 2: Original Document Preview */}
      {activeTab === 'preview' && (
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Original Document Preview</h3>
              <p className="text-xs text-slate-500">Rendered via short-lived authenticated read token</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                alert(`Generated authenticated time-limited signed URL: ${record.storage_file_path}`);
              }}
            >
              <Download className="h-4 w-4 mr-1.5" />
              Download Original File
            </Button>
          </div>

          {/* Secure Document Viewer Frame */}
          <div className="rounded-lg border border-slate-300 bg-slate-900/5 p-6 flex flex-col items-center justify-center min-h-[380px]">
            <div className="w-full max-w-lg bg-white rounded-lg shadow-md border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-blue-50 text-[#0d5ca8] flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{record.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{record.storage_file_path}</p>
                  </div>
                </div>
                <Badge variant="neutral" size="sm">
                  Protected Document
                </Badge>
              </div>

              <div className="p-4 rounded bg-slate-50 text-xs font-mono text-slate-700 space-y-2">
                <p>PATIENT: RAJESH SHARMA | MRN-2026-90412</p>
                <p>FACILITY: {record.provider?.facility_name || 'AIIMS NEW DELHI'}</p>
                <p>EVENT DATE: {record.clinical_event_date || 'N/A'}</p>
                <p>REPORT DATE: {record.report_date || 'N/A'}</p>
                <hr className="border-slate-200 my-2" />
                <p className="font-sans text-slate-800 text-xs leading-relaxed">
                  {record.description || 'Clinical observation and laboratory report parameters.'}
                </p>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>SHA-256 Checksum:</span>
                <span className="font-mono">{record.sha256_hash ? `${record.sha256_hash.slice(0, 20)}...` : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Provenance Information */}
      {activeTab === 'provenance' && (
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Ingestion Provenance & Origin Attribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block text-sm">Source Ingestion Channel</span>
              <p><span className="text-slate-500 font-semibold">Source Name: </span>{record.source?.name || 'Self-Uploaded'}</p>
              <p><span className="text-slate-500 font-semibold">Channel Type: </span><span className="font-mono">{record.source?.source_type || 'manual_upload'}</span></p>
              <p><span className="text-slate-500 font-semibold">Source Identifier: </span><span className="font-mono">{record.source?.identifier || 'N/A'}</span></p>
              <p><span className="text-slate-500 font-semibold">Trusted Registry: </span>{record.source?.is_trusted ? 'Yes (NABL / ABDM Certified)' : 'No (Patient Device Upload)'}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block text-sm">Treating Provider & Facility</span>
              <p><span className="text-slate-500 font-semibold">Physician: </span>{record.provider ? 'Dr. Ananya Iyer, MD' : 'Self-declared'}</p>
              <p><span className="text-slate-500 font-semibold">License Number: </span><span className="font-mono">{record.provider?.license_number || 'N/A'}</span></p>
              <p><span className="text-slate-500 font-semibold">Facility: </span>{record.provider?.facility_name || 'AIIMS Cardiology Center'}</p>
              <p><span className="text-slate-500 font-semibold">Specialization: </span>{record.provider?.specialization || 'Cardiology'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Version History & Access Controls */}
      {activeTab === 'history' && (
        <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Record Version History & Active Consent Grants</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">Version 1.0 (Current Canonical Version)</span>
                <p className="text-slate-500 mt-0.5">Ingested via {record.source?.name} at {new Date(record.upload_timestamp).toLocaleString()}</p>
              </div>
              <Badge variant="success" size="sm">Active</Badge>
            </div>

            <div className="pt-3">
              <h4 className="font-bold text-slate-800 mb-2">Active Consent Grants Permitting Access:</h4>
              <div className="space-y-2">
                {relevantConsents.map((c) => (
                  <div key={c.id} className="p-3 rounded border border-blue-200 bg-blue-50/50 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{c.grantee_name}</p>
                      <p className="text-[11px] text-slate-500">Scope: {c.scope.replace('_', ' ')} • Purpose: {c.purpose}</p>
                    </div>
                    <Badge variant="default" size="sm">Valid till {new Date(c.valid_until).toLocaleDateString()}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
