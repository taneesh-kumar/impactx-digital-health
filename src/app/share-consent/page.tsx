'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDemoContext } from '@/lib/state/demo-context';
import { SEED_PATIENT, SEED_PROFILES } from '@/lib/data/seed-data';
import { ConsentGrant, RecordCategory } from '@/lib/supabase/types';
import {
  Share2,
  Shield,
  Lock,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  KeyRound,
  AlertTriangle,
  FileText,
  UserCheck,
  Calendar,
  XCircle,
  Eye,
  Info,
  ShieldAlert,
  ArrowRight,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Dialog } from '@/components/ui/Dialog';

export default function ShareConsentPage() {
  const { consents, records, createConsentGrant, revokeConsentGrant, logAuditEvent, currentProfile } = useDemoContext();

  // Dialog states
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<ConsentGrant | null>(null);
  const [revokingGrant, setRevokingGrant] = useState<ConsentGrant | null>(null);
  const [revokeReason, setRevokeReason] = useState('Consultation completed / Revocation requested by patient');

  // Form states for New Grant Creation
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('22222222-2222-2222-2222-222222222222'); // Dr. Ananya Iyer
  const [purpose, setPurpose] = useState('Specialist Cardiac Evaluation & Second Opinion on Hypertension');
  const [durationDays, setDurationDays] = useState<'7' | '14' | '30'>('7'); // Default 7-day sharing scenario
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([
    'r0111111-1111-1111-1111-111111111111', // Lipid Profile
    'r0333333-3333-3333-3333-333333333333', // Cardio Follow-up
    'r0999999-9999-9999-9999-999999999999', // 12-Lead ECG
  ]);
  const [includeSensitive, setIncludeSensitive] = useState(false);
  const [confirmedSensitiveExclusion, setConfirmedSensitiveExclusion] = useState(true);
  const [step, setStep] = useState<'configure' | 'receipt_preview'>('configure');

  // Filter sensitive records
  const sensitiveRecords = records.filter((r) => r.is_sensitive);
  const standardRecords = records.filter((r) => !r.is_sensitive);

  const toggleRecordSelection = (id: string) => {
    setSelectedRecordIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const selectedRecipient =
    SEED_PROFILES.find((p) => p.id === selectedRecipientId) || SEED_PROFILES[1];

  const handleOpenGrantModal = () => {
    setStep('configure');
    setIsGrantModalOpen(true);
  };

  const handleConfirmGrant = () => {
    const validFrom = new Date().toISOString();
    const days = parseInt(durationDays, 10);
    const validUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    const created = createConsentGrant({
      grantee_type: 'provider',
      grantee_id: selectedRecipient.id,
      grantee_name: `${selectedRecipient.full_name} (${selectedRecipient.role === 'specialist' ? 'Cardiology' : 'Hospital'})`,
      purpose: purpose,
      valid_from: validFrom,
      valid_until: validUntil,
      selected_record_ids: selectedRecordIds,
      include_sensitive: includeSensitive,
      scope: 'time_bounded',
      permissions: ['read'],
    });

    setIsGrantModalOpen(false);
    setActiveReceipt(created);
  };

  const handleExecuteRevocation = () => {
    if (!revokingGrant) return;
    revokeConsentGrant(revokingGrant.id, revokeReason);
    setRevokingGrant(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#173567]">
            Share Records & Consent Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Patient-controlled authorization: specify recipient, individual record scope, and time limits backed by verified receipts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="gov-orange" size="sm" onClick={handleOpenGrantModal}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Specialist Share
          </Button>
        </div>
      </div>

      {/* Security Context Banner */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-xs text-blue-900 flex items-start gap-3">
        <Shield className="h-5 w-5 text-[#244783] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-blue-950">
            Consent Policy & Revocation Boundaries
          </p>
          <p className="text-blue-900/90 leading-relaxed">
            Grants enforce record-level scopes and automatic expiration. When access is revoked, subsequent requests are immediately blocked. Notice: External physical or local PDF files previously downloaded by the recipient cannot be deleted remotely.
          </p>
        </div>
      </div>

      {/* Active Grants List */}
      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Persisted Consent Grants & Sharing Contracts ({consents.length})
            </h2>
            <p className="text-xs text-slate-500">
              Active, expired, and revoked grants governing healthcare provider access.
            </p>
          </div>
          <span className="text-[11px] text-slate-400">
            Active: {consents.filter((c) => c.status === 'active').length} | Revoked:{' '}
            {consents.filter((c) => c.status === 'revoked').length}
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Authorized Specialist / Entity</TableHead>
              <TableHead>Declared Clinical Purpose</TableHead>
              <TableHead>Record Scope</TableHead>
              <TableHead>Sharing Duration & Expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Receipt & Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consents.map((grant) => {
              const isExpired = new Date(grant.valid_until) < new Date();
              const displayStatus =
                grant.status === 'revoked'
                  ? 'revoked'
                  : isExpired
                  ? 'expired'
                  : 'active';

              return (
                <TableRow key={grant.id}>
                  <TableCell>
                    <div className="font-bold text-slate-900">{grant.grantee_name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <UserCheck className="h-3 w-3 text-slate-400" />
                      ABHA Verified Recipient
                    </div>
                  </TableCell>

                  <TableCell className="max-w-xs text-xs text-slate-700">
                    <p className="truncate font-medium">{grant.purpose}</p>
                    {grant.include_sensitive && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        Sensitive Records Included
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="text-xs font-semibold text-slate-800">
                      {grant.selected_record_ids ? `${grant.selected_record_ids.length} Selected Records` : 'All Records'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Granular ID Enforcement
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-slate-700">
                    <div className="flex items-center gap-1 font-medium">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Until {new Date(grant.valid_until).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Started: {new Date(grant.valid_from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        displayStatus === 'active'
                          ? 'success'
                          : displayStatus === 'revoked'
                          ? 'danger'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {displayStatus === 'active'
                        ? 'Active (7-Day Share)'
                        : displayStatus === 'revoked'
                        ? 'Revoked by Patient'
                        : 'Expired Window'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs flex items-center gap-1"
                        onClick={() => setActiveReceipt(grant)}
                      >
                        <FileText className="h-3 w-3" />
                        Receipt
                      </Button>

                      {displayStatus === 'active' && (
                        <Button
                          variant="danger"
                          size="sm"
                          className="text-xs flex items-center gap-1"
                          onClick={() => setRevokingGrant(grant)}
                        >
                          <XCircle className="h-3 w-3" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Recipient View Link */}
      <div className="rounded-xl bg-slate-50 p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-[#244783]" />
            Specialist Access & Verification
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Recipients can only view health records that have been explicitly granted in an active consent grant.
          </p>
        </div>
        <Link href="/records">
          <Button variant="primary" size="sm" className="whitespace-nowrap">
            View Records <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      {/* CREATE GRANT DIALOG (Two-Step: Configure -> Receipt Preview) */}
      <Dialog
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        title={step === 'configure' ? 'Create Granular 7-Day Consent Grant' : 'Plain-Language Consent Receipt Preview'}
        description={
          step === 'configure'
            ? 'Select authorized recipient, time boundary, and granular health records.'
            : 'Review all terms before signing and persisting this consent grant.'
        }
      >
        {step === 'configure' ? (
          <div className="space-y-4 text-xs">
            {/* Recipient */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Authorized Recipient (Clinician or Facility)
              </label>
              <select
                value={selectedRecipientId}
                onChange={(e) => setSelectedRecipientId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs font-medium"
              >
                <option value="22222222-2222-2222-2222-222222222222">
                  Dr. Ananya Iyer, MD (AIIMS Cardiology Center)
                </option>
                <option value="44444444-4444-4444-4444-444444444444">
                  Dr. Vikram Malhotra (Apollo Emergency & Trauma)
                </option>
                <option value="facility-apollo">Apollo Specialty Hospital Network</option>
              </select>
            </div>

            {/* Purpose */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Clinical Purpose of Sharing
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                placeholder="e.g. Cardiology Second Opinion Consultation"
              />
            </div>

            {/* Duration (7-Day default) */}
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Access Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDurationDays('7')}
                  className={`p-2 rounded-lg border font-bold text-xs text-center transition-colors ${
                    durationDays === '7'
                      ? 'bg-[#244783] text-white border-[#244783]'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  7 Days (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setDurationDays('14')}
                  className={`p-2 rounded-lg border font-bold text-xs text-center transition-colors ${
                    durationDays === '14'
                      ? 'bg-[#244783] text-white border-[#244783]'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  14 Days
                </button>
                <button
                  type="button"
                  onClick={() => setDurationDays('30')}
                  className={`p-2 rounded-lg border font-bold text-xs text-center transition-colors ${
                    durationDays === '30'
                      ? 'bg-[#244783] text-white border-[#244783]'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  30 Days
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Grants will automatically expire after the selected duration unless renewed.
              </p>
            </div>

            {/* Granular Record Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-800 block">
                  Select Permitted Health Records ({selectedRecordIds.length} of {standardRecords.length})
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedRecordIds(standardRecords.map((r) => r.id))}
                  className="text-[11px] text-[#244783] hover:underline font-semibold"
                >
                  Select All Standard
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                {standardRecords.map((r) => {
                  const isChecked = selectedRecordIds.includes(r.id);
                  return (
                    <label
                      key={r.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-white cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRecordSelection(r.id)}
                        className="rounded text-[#244783]"
                      />
                      <span className="font-medium text-slate-800 truncate flex-1">{r.title}</span>
                      <span className="text-[10px] text-slate-400 capitalize">{r.category.replace('_', ' ')}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Sensitive Category Isolation */}
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-900 block">
                    Sensitive Health Categories (Excluded by Default)
                  </span>
                  <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                    Mental health notes and psychotherapy records are strictly excluded from ordinary shares and require explicit patient confirmation.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSensitive}
                  onChange={(e) => setIncludeSensitive(e.target.checked)}
                  className="rounded text-rose-700"
                />
                <span className="font-semibold text-rose-950">
                  Explicitly permit confidential mental health records in this grant
                </span>
              </label>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsGrantModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={selectedRecordIds.length === 0}
                onClick={() => setStep('receipt_preview')}
              >
                Preview Plain-Language Receipt <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          /* STEP 2: Plain-Language Receipt Preview */
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                <span className="font-bold uppercase tracking-wider text-[#244783] text-[10px]">
                  Consent Receipt Preview (Before Signature)
                </span>
                <Badge variant="info" size="sm">Pre-Authorization</Badge>
              </div>

              <div className="space-y-2 text-slate-700">
                <p>
                  <strong className="text-slate-900">What is being shared:</strong>{' '}
                  {selectedRecordIds.length} explicitly chosen medical documents.
                  {includeSensitive ? ' (Includes confidential mental health)' : ' (Sensitive records excluded)'}
                </p>
                <p>
                  <strong className="text-slate-900">Who will receive it:</strong>{' '}
                  {selectedRecipient.full_name} ({selectedRecipient.role})
                </p>
                <p>
                  <strong className="text-slate-900">Why it is being shared:</strong> {purpose}
                </p>
                <p>
                  <strong className="text-slate-900">Sharing window:</strong> {durationDays} Days (Starting immediately)
                </p>
                <p>
                  <strong className="text-slate-900">What happens on Revocation:</strong> You can revoke this grant at any moment. Revocation immediately terminates all online access and logs an audit event.
                </p>
                <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                  <strong>Notice regarding external copies:</strong> If the clinician has already printed or downloaded a local copy of a record during active sharing, that file cannot be erased from their physical possession.
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep('configure')}
                className="text-[#244783] hover:underline font-semibold"
              >
                ← Back to Edit Selection
              </button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsGrantModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="gov-orange" size="sm" onClick={handleConfirmGrant}>
                  Sign & Authorize 7-Day Grant
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* VIEW RECEIPT DIALOG */}
      {activeReceipt && (
        <Dialog
          isOpen={Boolean(activeReceipt)}
          onClose={() => setActiveReceipt(null)}
          title="Cryptographic Consent Receipt"
          description="Stable receipt record reflecting exact stored grant parameters."
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 font-sans">
              <div className="flex justify-between items-start pb-2 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#244783]">
                    Receipt Reference
                  </span>
                  <p className="font-mono font-bold text-slate-900 text-sm">
                    {activeReceipt.receipt_id || 'REC-ABDM-2026-9041'}
                  </p>
                </div>
                <Badge variant={activeReceipt.status === 'active' ? 'success' : 'danger'} size="sm">
                  {activeReceipt.status.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Authorized Recipient:</span>
                  <span className="font-semibold text-slate-900">{activeReceipt.grantee_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Declared Purpose:</span>
                  <span className="font-medium text-slate-900">{activeReceipt.purpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Access Period:</span>
                  <span className="font-medium text-slate-800">
                    {new Date(activeReceipt.valid_from).toLocaleDateString()} to{' '}
                    {new Date(activeReceipt.valid_until).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shared Record Scope:</span>
                  <span className="font-medium text-slate-900">
                    {activeReceipt.selected_record_ids ? `${activeReceipt.selected_record_ids.length} Records` : 'All'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sensitive Categories:</span>
                  <span className="font-medium text-slate-900">
                    {activeReceipt.include_sensitive ? 'Included (Confirmed)' : 'Excluded by Default'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">Cryptographic Hash Signature:</span>
                  <p className="font-mono text-[10px] bg-white p-2 rounded border border-slate-200 break-all text-slate-600">
                    {activeReceipt.receipt_hash || '7e2b19f864e2920fbbad9e0344d67e5a1b38f8cf622c1b489a691456bc384df9'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px]">
              <strong>Revocation Guarantee:</strong> Revoking this grant permanently disables recipient queries. External copies downloaded prior to revocation cannot be remotely erased.
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-3.5 w-3.5 mr-1" /> Print Receipt
              </Button>
              <Button variant="primary" size="sm" onClick={() => setActiveReceipt(null)}>
                Close Receipt
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* REVOCATION CONFIRMATION DIALOG */}
      {revokingGrant && (
        <Dialog
          isOpen={Boolean(revokingGrant)}
          onClose={() => setRevokingGrant(null)}
          title="Revoke Specialist Consent Grant Immediately?"
          description="Access to protected health records will be terminated with immediate effect."
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-900 space-y-1">
              <p className="font-bold">Target Grant: {revokingGrant.grantee_name}</p>
              <p className="text-[11px]">
                Receipt: <span className="font-mono">{revokingGrant.receipt_id || revokingGrant.id}</span>
              </p>
              <p className="text-[11px] mt-1 text-rose-800">
                Future API queries by this recipient will return <strong>403 Access Denied</strong> and be recorded in the access history log.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Reason for Revocation
              </label>
              <input
                type="text"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                placeholder="Reason for early access termination"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setRevokingGrant(null)}>
                Keep Active
              </Button>
              <Button variant="danger" size="sm" onClick={handleExecuteRevocation}>
                Confirm Immediate Revocation
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
