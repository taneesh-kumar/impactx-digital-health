'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDemoContext } from '@/lib/state/demo-context';
import { RecordCategory } from '@/lib/supabase/types';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  UserPlus,
  ShieldAlert,
  AlertTriangle,
  Lock,
  XCircle,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';

export default function CaregiverAccessPage() {
  const { caregiver, records, updateCaregiverDelegation, revokeCaregiverDelegation, currentProfile } = useDemoContext();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState('Patient requested revocation of caregiver proxy rights');

  // Form states for caregiver delegation editing
  const [permittedCategories, setPermittedCategories] = useState<RecordCategory[]>(
    caregiver.permitted_categories || ['lab_result', 'vital_sign', 'prescription']
  );
  const [canUpload, setCanUpload] = useState<boolean>(caregiver.can_upload);
  const [includeSensitive, setIncludeSensitive] = useState<boolean>(caregiver.include_sensitive_categories);

  const allCategories: { value: RecordCategory; label: string }[] = [
    { value: 'prescription', label: 'Prescriptions & Medication Sheets' },
    { value: 'lab_result', label: 'Diagnostic Laboratory Panels' },
    { value: 'vital_sign', label: 'Vital Signs & Telemetry Logs' },
    { value: 'radiology', label: 'Radiology & Imaging Scans' },
    { value: 'discharge_summary', label: 'Hospital Discharge Summaries' },
    { value: 'clinical_note', label: 'Outpatient Clinical Consultation Notes' },
    { value: 'vaccination', label: 'Immunization Certificates' },
  ];

  const toggleCategory = (cat: RecordCategory) => {
    setPermittedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSaveDelegation = () => {
    updateCaregiverDelegation({
      permitted_categories: permittedCategories,
      can_upload: canUpload,
      include_sensitive_categories: includeSensitive,
    });
    setIsEditModalOpen(false);
  };

  const handleConfirmRevoke = () => {
    revokeCaregiverDelegation(revokeReason);
    setIsRevokeModalOpen(false);
  };

  const isCaregiverActive = caregiver.status === 'active';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#244783] text-white text-[11px] font-bold px-2 py-0.5 rounded">
              PROMPT 6
            </span>
            <h1 className="text-xl font-bold text-[#173567]">
              Caregiver Access & Healthcare Proxy Delegation
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authorize trusted family members or proxies with bounded record-viewing rights. Caregivers cannot share records or revoke patient grants.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isCaregiverActive ? (
            <Button variant="danger" size="sm" onClick={() => setIsRevokeModalOpen(true)}>
              <XCircle className="h-4 w-4 mr-1.5" />
              Revoke Caregiver Proxy
            </Button>
          ) : (
            <Button
              variant="gov-orange"
              size="sm"
              onClick={() => {
                updateCaregiverDelegation({ status: 'active' });
              }}
            >
              <UserPlus className="h-4 w-4 mr-1.5" />
              Re-activate Caregiver Proxy
            </Button>
          )}
        </div>
      </div>

      {/* Security Separation Banner */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-xs text-blue-900 flex items-start gap-3">
        <Lock className="h-5 w-5 text-[#244783] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-blue-950">
            Caregiver Permission Separation & Security Baseline:
          </p>
          <p className="text-blue-900/90 leading-relaxed">
            Caregiver permissions are decoupled from patient permissions. A designated caregiver <strong>cannot</strong> share records with external specialists, <strong>cannot</strong> revoke the patient's existing consent grants, and <strong>cannot</strong> access sensitive mental health categories by default.
          </p>
        </div>
      </div>

      {/* Active Caregiver Profile Card */}
      <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Active Healthcare Proxy Record
            </h2>
            <p className="text-xs text-slate-500">
              Designated family caregiver managing daily outpatient health tasks.
            </p>
          </div>
          <Badge
            variant={isCaregiverActive ? 'success' : 'danger'}
            size="sm"
          >
            {isCaregiverActive ? 'Active Proxy Delegation' : 'Revoked by Patient'}
          </Badge>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-14 w-14 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={caregiver.caregiver_profile?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {caregiver.caregiver_name || caregiver.caregiver_profile?.full_name}
                </span>
                <span className="text-[11px] font-semibold text-[#244783] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {caregiver.relationship}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                ABHA ID: <span className="font-mono">91-3312-7744-9988</span> • Contact: +91 98765 43211
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                <Clock className="h-3.5 w-3.5" />
                Valid Until: {new Date(caregiver.valid_until).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            {isCaregiverActive && (
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                Modify Permissions
              </Button>
            )}
          </div>
        </div>

        {/* Granted Categories & Permissions Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
              Delegated Record Categories ({caregiver.permitted_categories?.length || 0})
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {caregiver.permitted_categories?.map((cat) => (
                <span
                  key={cat}
                  className="bg-blue-50 text-blue-900 border border-blue-200 px-2 py-1 rounded text-[11px] font-semibold capitalize"
                >
                  {cat.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
              Administrative & Action Rights
            </span>
            <div className="space-y-1.5 text-slate-700 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Upload receipts & mobile prescription scans</span>
              </div>
              <div className="flex items-center gap-2 text-rose-700">
                <XCircle className="h-4 w-4 text-rose-600" />
                <span className="font-medium">Cannot share patient records with third parties</span>
              </div>
              <div className="flex items-center gap-2 text-rose-700">
                <XCircle className="h-4 w-4 text-rose-600" />
                <span className="font-medium">Cannot revoke or modify patient consent grants</span>
              </div>
              <div className="flex items-center gap-2 text-rose-700">
                <XCircle className="h-4 w-4 text-rose-600" />
                <span className="font-medium">Sensitive mental health records excluded</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Switching Simulation Card */}
      <div className="rounded-xl bg-slate-50 p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-[#244783]" />
            Caregiver Access Simulation
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Switch identity to <strong>Pooja Sharma (Caregiver)</strong> to verify that only permitted categories are visible, upload works, and sensitive records return 403.
          </p>
        </div>
        <Link href="/records">
          <Button variant="primary" size="sm" className="whitespace-nowrap">
            View Documents as Caregiver <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      {/* MODIFY PERMISSIONS MODAL */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Configure Caregiver Proxy Scope"
        description="Select the specific clinical categories the caregiver is authorized to inspect."
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-800 block mb-2">
              Permitted Document Categories
            </label>
            <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
              {allCategories.map((c) => {
                const isChecked = permittedCategories.includes(c.value);
                return (
                  <label key={c.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCategory(c.value)}
                      className="rounded text-[#244783]"
                    />
                    <span className="font-medium text-slate-800">{c.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={canUpload}
                onChange={(e) => setCanUpload(e.target.checked)}
                className="rounded text-[#244783]"
              />
              <span className="font-semibold text-slate-800">
                Allow caregiver to upload new diagnostic slips & documents
              </span>
            </label>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-900 space-y-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={includeSensitive}
                  onChange={(e) => setIncludeSensitive(e.target.checked)}
                  className="rounded text-rose-700"
                />
                <span>Include confidential mental health psychotherapy records</span>
              </label>
              <p className="text-[10px] text-rose-800 ml-5">
                Requires explicit patient authorization. Excluded by default.
              </p>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gov-orange" size="sm" onClick={handleSaveDelegation}>
              Save Delegated Scope
            </Button>
          </div>
        </div>
      </Dialog>

      {/* REVOCATION CONFIRMATION MODAL */}
      <Dialog
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        title="Revoke Caregiver Proxy Access?"
        description="Caregiver access to medical records will be immediately terminated."
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-900">
            <strong>Security Action: </strong>
            Revoking this delegation will deny all subsequent record access attempts by Pooja Sharma.
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
              placeholder="e.g. Proxy delegation no longer required"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsRevokeModalOpen(false)}>
              Keep Active
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmRevoke}>
              Confirm Revocation
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
