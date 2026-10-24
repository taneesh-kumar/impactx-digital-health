'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDemoContext } from '@/lib/state/demo-context';
import {
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  History,
  Send,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Building,
  RefreshCw,
  XCircle,
  Bell,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Textarea } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

export default function CorrectionsPage() {
  const {
    currentProfile,
    records,
    consents,
    corrections,
    recordVersions,
    proposeCorrection,
    publishProviderCorrection,
    reviewCorrection,
  } = useDemoContext();

  const [activeTab, setActiveTab] = useState<'corrections' | 'propagation' | 'versions'>('corrections');

  // Modal States
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  // Form State for Provider Correction
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    records.find((r) => !r.is_superseded)?.id || records[0]?.id || ''
  );
  const [fieldName, setFieldName] = useState('Total Cholesterol');
  const [previousValue, setPreviousValue] = useState('194 mg/dL');
  const [correctedValue, setCorrectedValue] = useState('168 mg/dL');
  const [clinicalRationale, setClinicalRationale] = useState(
    'Fasting blood chemistry re-analyzed after initial serum dilution. Laboratory verified amended result.'
  );

  // Form State for Patient Inquiry
  const [patientTargetRecordId, setPatientTargetRecordId] = useState<string>(
    records.find((r) => r.has_date_conflict)?.id || records[0]?.id || ''
  );
  const [patientProposedValue, setPatientProposedValue] = useState('Specimen Date: 2026-02-12');
  const [patientPreviousValue, setPatientPreviousValue] = useState('Specimen Date: 2026-02-28');
  const [patientReason, setPatientReason] = useState(
    'Specimen was physically collected at AIIMS phlebotomy on 12 Feb 2026; billing statement shows 28 Feb.'
  );

  // Simulation Feedback
  const [simulationResult, setSimulationResult] = useState<{
    success: boolean;
    targetTitle: string;
    newRecordId: string;
    notifiedCount: number;
    blockedCount: number;
    notifiedGrants: { id: string; name: string }[];
    blockedGrants: { id: string; name: string; reason: string }[];
  } | null>(null);

  const isProvider = currentProfile.role === 'specialist' || currentProfile.role === 'emergency_clinician';

  // Handle Provider Amendment Submission
  const handlePublishCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    const res = publishProviderCorrection({
      recordId: selectedRecordId,
      fieldName,
      correctedValue,
      previousValue,
      clinicalRationale,
    });

    if (res.success && res.newRecord && res.previousRecord) {
      setSimulationResult({
        success: true,
        targetTitle: res.previousRecord.title,
        newRecordId: res.newRecord.id,
        notifiedCount: res.notifiedGrants.length,
        blockedCount: res.blockedGrants.length,
        notifiedGrants: res.notifiedGrants.map((g) => ({ id: g.id, name: g.grantee_name })),
        blockedGrants: res.blockedGrants.map((g) => ({
          id: g.id,
          name: g.grantee_name,
          reason: g.status === 'revoked' ? 'Grant Revoked by Patient' : '7-Day Window Expired',
        })),
      });
      setIsProviderModalOpen(false);
    } else {
      alert(res.error || 'Failed to publish clinical correction.');
    }
  };

  // Handle Quick 1-Click Demo Simulation
  const handleQuickDemoSimulation = () => {
    const targetRecord = records.find((r) => r.id === 'r0111111-1111-1111-1111-111111111111') || records[0];
    if (!targetRecord) return;

    const res = publishProviderCorrection({
      recordId: targetRecord.id,
      fieldName: 'Total Cholesterol',
      correctedValue: '168 mg/dL',
      previousValue: '194 mg/dL',
      clinicalRationale:
        'Phlebotomy assay re-calibrated. Verified normal total cholesterol of 168 mg/dL after automated dilution correction.',
    });

    if (res.success && res.newRecord && res.previousRecord) {
      setSimulationResult({
        success: true,
        targetTitle: res.previousRecord.title,
        newRecordId: res.newRecord.id,
        notifiedCount: res.notifiedGrants.length,
        blockedCount: res.blockedGrants.length,
        notifiedGrants: res.notifiedGrants.map((g) => ({ id: g.id, name: g.grantee_name })),
        blockedGrants: res.blockedGrants.map((g) => ({
          id: g.id,
          name: g.grantee_name,
          reason: g.status === 'revoked' ? 'Grant Revoked by Patient' : '7-Day Window Expired',
        })),
      });
    }
  };

  // Handle Patient Inquiry Submission
  const handleProposeCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    proposeCorrection({
      recordId: patientTargetRecordId,
      proposedValue: patientProposedValue,
      previousValue: patientPreviousValue,
      reason: patientReason,
    });
    setIsPatientModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#244783] text-white text-[11px] font-bold px-2 py-0.5 rounded">
              PROMPT 7
            </span>
            <h1 className="text-xl font-bold text-[#173567]">
              Clinical Corrections & Active Share Propagation
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provider-originated clinical corrections, version history with superseded preservation, and ABDM consent-bound propagation to active specialist shares.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isProvider ? (
            <Button variant="gov-orange" size="sm" onClick={() => setIsProviderModalOpen(true)}>
              <Sparkles className="h-4 w-4 mr-1.5" />
              Publish Clinical Correction
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setIsPatientModalOpen(true)}>
              <Send className="h-4 w-4 mr-1.5" />
              Submit Patient Correction Inquiry
            </Button>
          )}
        </div>
      </div>

      {/* Role Policy Notice */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-[#244783] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-900">
            Current Authenticated Persona: {currentProfile.full_name} ({currentProfile.role.replace('_', ' ')})
          </p>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            {isProvider ? (
              <span>
                As a licensed healthcare provider, you possess clinical authority to amend diagnostic findings.
                When you publish an amendment, the previous record is preserved and marked <strong>superseded</strong> (never deleted).
                All specialists holding <strong>active, non-expired consent grants</strong> receive automated propagation notices.
              </span>
            ) : (
              <span>
                Under healthcare regulatory compliance, patients and caregivers cannot directly alter medical records.
                You can submit formal correction inquiries. Once reviewed and signed off by a licensed clinician, an amended version is published.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Quick 1-Click Simulation Banner */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#173567]">Prompt 7 Live Demonstration:</span>
            <Badge variant="info" size="sm">1-Click Simulation</Badge>
          </div>
          <p className="text-xs text-slate-700">
            Simulate <strong>Dr. Ananya Iyer</strong> publishing an amended Fasting Lipid Profile (Total Cholesterol: 194 -&gt; 168 mg/dL).
            Watch the system supersede v1, notify active specialist shares, and strictly block expired shares.
          </p>
        </div>

        <Button
          variant="gov-orange"
          size="sm"
          onClick={handleQuickDemoSimulation}
          className="whitespace-nowrap self-start md:self-auto"
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Simulate Provider Amendment & Propagation
        </Button>
      </div>

      {/* Live Simulation Feedback Banner */}
      {simulationResult && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-900">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-sm">
              Clinical Correction Published & Propagated Successfully!
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg bg-white p-3 border border-emerald-200 space-y-1">
              <span className="font-semibold text-slate-500 uppercase text-[10px]">Version History:</span>
              <p className="font-bold text-slate-900">v1 Superseded -&gt; v2 Active</p>
              <p className="text-slate-600 text-[11px]">Original record preserved with audit link.</p>
              <Link href={`/records/${simulationResult.newRecordId}`}>
                <span className="text-[#244783] font-semibold hover:underline flex items-center gap-1 mt-1">
                  View v2 Corrected Record <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </div>

            <div className="rounded-lg bg-white p-3 border border-emerald-200 space-y-1">
              <span className="font-semibold text-emerald-700 uppercase text-[10px] flex items-center gap-1">
                <Bell className="h-3 w-3" /> Active Shares Notified ({simulationResult.notifiedCount}):
              </span>
              {simulationResult.notifiedGrants.length > 0 ? (
                simulationResult.notifiedGrants.map((g) => (
                  <p key={g.id} className="font-medium text-emerald-800 text-[11px]">
                    ✓ {g.name}
                  </p>
                ))
              ) : (
                <p className="text-slate-500 text-[11px]">No active shares covered this record.</p>
              )}
            </div>

            <div className="rounded-lg bg-white p-3 border border-amber-200 space-y-1">
              <span className="font-semibold text-amber-700 uppercase text-[10px] flex items-center gap-1">
                <Lock className="h-3 w-3" /> Expired/Revoked Blocked ({simulationResult.blockedCount}):
              </span>
              {simulationResult.blockedGrants.length > 0 ? (
                simulationResult.blockedGrants.map((g) => (
                  <p key={g.id} className="font-medium text-amber-800 text-[11px]">
                    ✕ {g.name} ({g.reason})
                  </p>
                ))
              ) : (
                <p className="text-slate-500 text-[11px]">No expired shares found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('corrections')}
          className={`pb-2.5 flex items-center gap-1.5 transition-colors ${
            activeTab === 'corrections'
              ? 'border-b-2 border-[#244783] text-[#244783]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="h-4 w-4" />
          Correction Requests & Ledger ({corrections.length})
        </button>

        <button
          onClick={() => setActiveTab('propagation')}
          className={`pb-2.5 flex items-center gap-1.5 transition-colors ${
            activeTab === 'propagation'
              ? 'border-b-2 border-[#244783] text-[#244783]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="h-4 w-4" />
          Consent Propagation Engine ({consents.length} Grants)
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          className={`pb-2.5 flex items-center gap-1.5 transition-colors ${
            activeTab === 'versions'
              ? 'border-b-2 border-[#244783] text-[#244783]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="h-4 w-4" />
          Version History & Superseded Records ({recordVersions.length + records.filter((r) => r.is_superseded).length})
        </button>
      </div>

      {/* TAB 1: CORRECTIONS LEDGER */}
      {activeTab === 'corrections' && (
        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Clinical Correction Proposals & Resolved Amendments
            </h3>
            <span className="text-xs text-slate-500">
              Zero silent overwrites — All proposals require physician signoff
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target Health Record</TableHead>
                <TableHead>Proposed / Corrected Value</TableHead>
                <TableHead>Previous Value</TableHead>
                <TableHead>Clinical / Patient Rationale</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Reviewer Signoff / Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {corrections.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold text-slate-900">
                    <Link href={`/records/${c.record_id}`} className="hover:text-[#244783] hover:underline">
                      {c.record_title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-[#244783] font-bold">
                    {c.proposed_value}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 line-through">
                    {c.previous_value}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-xs leading-relaxed">
                    {c.reason}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={c.status === 'approved' ? 'success' : c.status === 'in_review' ? 'warning' : 'danger'}
                      size="sm"
                    >
                      {c.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {c.status === 'approved' ? (
                      <span className="text-emerald-700 font-medium">
                        ✓ {c.reviewer_notes || 'Approved & Published'}
                      </span>
                    ) : isProvider ? (
                      <Button
                        variant="gov-orange"
                        size="sm"
                        onClick={() => {
                          publishProviderCorrection({
                            recordId: c.record_id,
                            fieldName: 'Clinical Event Date',
                            correctedValue: c.proposed_value,
                            previousValue: c.previous_value,
                            clinicalRationale: `Physician verified correction: ${c.reason}`,
                          });
                        }}
                      >
                        Sign Off & Publish v2
                      </Button>
                    ) : (
                      <span className="text-slate-500">
                        {c.reviewer_notes || 'Pending Physician Review'}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* TAB 2: CONSENT PROPAGATION ENGINE MONITOR */}
      {activeTab === 'propagation' && (
        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                ABDM Consent-Bound Propagation Engine Status
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates active vs expired/revoked shares. Only authorized, non-expired shares receive amendment notices.
              </p>
            </div>
            <span className="font-mono text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded font-semibold">
              Data Minimization Active
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grantee / Organization</TableHead>
                <TableHead>Consent Receipt ID</TableHead>
                <TableHead>Consent Status</TableHead>
                <TableHead>Validity Window</TableHead>
                <TableHead>Propagation Action</TableHead>
                <TableHead className="text-right">Policy Enforcement Rationale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consents.map((grant) => {
                const now = new Date();
                const isTimeValid = new Date(grant.valid_from) <= now && now <= new Date(grant.valid_until);
                const isActive = grant.status === 'active' && isTimeValid;

                return (
                  <TableRow key={grant.id}>
                    <TableCell className="font-bold text-slate-900">
                      {grant.grantee_name}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {grant.receipt_id || grant.id}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isActive ? 'success' : grant.status === 'revoked' ? 'danger' : 'warning'} size="sm">
                        {grant.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 font-mono">
                      {new Date(grant.valid_from).toLocaleDateString()} -&gt; {new Date(grant.valid_until).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {isActive ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1.5 text-xs">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Notified & Granted v2 Access
                        </span>
                      ) : (
                        <span className="text-rose-700 font-semibold flex items-center gap-1.5 text-xs">
                          <Lock className="h-4 w-4 text-rose-600" />
                          Propagation Blocked
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs text-slate-500">
                      {isActive
                        ? 'Active consent covers record category'
                        : grant.status === 'revoked'
                        ? 'Consent revoked by patient; no notifications permitted'
                        : '7-Day sharing window lapsed; data access frozen'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* TAB 3: VERSION HISTORY & SUPERSEDED RECORDS LEDGER */}
      {activeTab === 'versions' && (
        <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Immutable Health Record Version Ledger
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every clinical change spawns a new version. Preceding versions are archived as superseded and never purged.
              </p>
            </div>
            <span className="font-mono text-xs bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1 rounded font-semibold">
              WORM Compliance (Write Once, Read Many)
            </span>
          </div>

          <div className="space-y-4">
            {records
              .filter((r) => r.is_superseded || r.title.includes('(Amended v2)'))
              .map((rec) => (
                <div
                  key={rec.id}
                  className={`rounded-lg border p-4 text-xs space-y-2 ${
                    rec.is_superseded
                      ? 'border-amber-300 bg-amber-50/50'
                      : 'border-emerald-300 bg-emerald-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{rec.title}</span>
                      <Badge variant={rec.is_superseded ? 'warning' : 'success'} size="sm">
                        {rec.is_superseded ? 'Superseded (v1)' : 'Active (v2)'}
                      </Badge>
                    </div>

                    <Link href={`/records/${rec.id}`}>
                      <Button variant="outline" size="sm">
                        Inspect Record <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {rec.description || 'Clinical record preserved under SwasthyaSetu audit integrity.'}
                  </p>

                  <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-slate-500 text-[11px]">
                    <span>Record ID: <span className="font-mono">{rec.id}</span></span>
                    {rec.is_superseded && rec.superseded_by && (
                      <span className="text-amber-800 font-semibold">
                        Superseded by: <span className="font-mono">{rec.superseded_by}</span>
                      </span>
                    )}
                    <span>Last Updated: {new Date(rec.updated_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}

            {records.filter((r) => r.is_superseded || r.title.includes('(Amended v2)')).length === 0 && (
              <p className="text-center py-6 text-slate-500 text-xs">
                No amended or superseded records in current session. Use the 1-Click Simulation above to generate one!
              </p>
            )}
          </div>
        </div>
      )}

      {/* MODAL: PROVIDER PUBLISH CLINICAL CORRECTION */}
      <Dialog
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
        title="Publish Provider Clinical Correction (v2)"
      >
        <form onSubmit={handlePublishCorrection} className="space-y-4">
          <div className="rounded bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 space-y-1">
            <span className="font-bold">Clinical Provider Signoff Authority:</span>
            <p className="text-[11px] leading-relaxed">
              Authenticated as <strong>{currentProfile.full_name} ({currentProfile.role})</strong>.
              Publishing this amendment will preserve the target document as <strong>superseded</strong> and dispatch propagation alerts to all active ABDM specialist shares.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Target Health Record</label>
            <select
              value={selectedRecordId}
              onChange={(e) => setSelectedRecordId(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-[#244783] focus:outline-none"
            >
              {records
                .filter((r) => !r.is_superseded)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.category})
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Field Name</label>
              <Input
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="e.g. Total Cholesterol"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Previous Value</label>
              <Input
                value={previousValue}
                onChange={(e) => setPreviousValue(e.target.value)}
                placeholder="e.g. 194 mg/dL"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Amended / Corrected Value</label>
            <Input
              value={correctedValue}
              onChange={(e) => setCorrectedValue(e.target.value)}
              placeholder="e.g. 168 mg/dL"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Clinical Rationale & Laboratory Notes</label>
            <Textarea
              value={clinicalRationale}
              onChange={(e) => setClinicalRationale(e.target.value)}
              placeholder="Detailed reason for amending finding..."
              rows={3}
              required
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsProviderModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gov-orange" size="sm" type="submit">
              Publish & Propagate Amendment
            </Button>
          </div>
        </form>
      </Dialog>

      {/* MODAL: PATIENT CORRECTION INQUIRY */}
      <Dialog
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        title="Submit Patient Correction Inquiry"
      >
        <form onSubmit={handleProposeCorrection} className="space-y-4">
          <div className="rounded bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 space-y-1">
            <span className="font-bold">Patient Transparency Policy:</span>
            <p className="text-[11px] leading-relaxed">
              Patients cannot directly modify clinical notes or laboratory panels. Your inquiry will be logged in the immutable audit trail and routed to the ordering physician for review.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Select Document</label>
            <select
              value={patientTargetRecordId}
              onChange={(e) => setPatientTargetRecordId(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-[#244783] focus:outline-none"
            >
              {records
                .filter((r) => !r.is_superseded)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Current / Recorded Value</label>
              <Input
                value={patientPreviousValue}
                onChange={(e) => setPatientPreviousValue(e.target.value)}
                placeholder="e.g. Specimen Date: Feb 28"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Proposed Correct Value</label>
              <Input
                value={patientProposedValue}
                onChange={(e) => setPatientProposedValue(e.target.value)}
                placeholder="e.g. Specimen Date: Feb 12"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Patient Rationale / Explanation</label>
            <Textarea
              value={patientReason}
              onChange={(e) => setPatientReason(e.target.value)}
              placeholder="Why is this recorded value incorrect? Include receipt or specimen slip numbers if applicable..."
              rows={3}
              required
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsPatientModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit Inquiry for Doctor Review
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
