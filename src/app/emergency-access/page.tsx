'use client';

import React, { useState } from 'react';
import { useDemoContext } from '@/lib/state/demo-context';
import { ShieldAlert, AlertTriangle, Clock, Lock, CheckCircle2, History } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Input';

export default function EmergencyAccessPage() {
  const { currentProfile, logAuditEvent } = useDemoContext();
  const [isBreakGlassOpen, setIsBreakGlassOpen] = useState(false);
  const [breakGlassReason, setBreakGlassReason] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);

  const handleBreakGlass = () => {
    setIsSessionActive(true);
    setIsBreakGlassOpen(false);
    logAuditEvent({
      user_id: currentProfile.id,
      actor_role: currentProfile.role,
      action: 'emergency_break_glass',
      resource_type: 'patient_emergency_dossier',
      patient_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      details: { reason: breakGlassReason || 'Emergency Resuscitation Protocol' },
      severity: 'critical',
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0a1f38]">Emergency Access (Break-Glass Protocol)</h1>
            <Badge variant="danger" size="sm">Critical Care Audit</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Allows licensed emergency clinicians immediate access to critical life-safety records during acute emergencies.
          </p>
        </div>

        {!isSessionActive ? (
          <Button variant="danger" size="sm" onClick={() => setIsBreakGlassOpen(true)}>
            <ShieldAlert className="h-4 w-4 mr-1.5" />
            Invoke Break-Glass Access
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setIsSessionActive(false)}>
            Close Emergency Session
          </Button>
        )}
      </div>

      {isSessionActive && (
        <div className="rounded-xl border-2 border-red-400 bg-red-50/80 p-5 space-y-3">
          <div className="flex items-center gap-2 text-red-900 font-bold">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>ACTIVE EMERGENCY BREAK-GLASS SESSION (AUDITED)</span>
          </div>
          <p className="text-xs text-red-800 leading-relaxed">
            Emergency session invoked by {currentProfile.full_name}. Real-time notifications have been broadcasted to the patient and legal proxy. All query events are permanently anchored to the hospital ABDM audit ledger.
          </p>
        </div>
      )}

      {/* Emergency Care Record Preview */}
      <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Patient Emergency Dossier Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border space-y-1">
            <span className="font-bold text-slate-800 block">Blood Group</span>
            <span className="text-lg font-black text-rose-600">B+ (Rh Positive)</span>
          </div>

          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 space-y-1">
            <span className="font-bold text-rose-900 block">Known Drug Allergies</span>
            <span className="font-bold text-rose-800">Penicillin, Sulfa drugs</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border space-y-1">
            <span className="font-bold text-slate-800 block">Emergency Proxy</span>
            <span className="font-bold text-slate-900">Pooja Sharma (+91 98765 43211)</span>
          </div>
        </div>
      </div>

      <Dialog
        isOpen={isBreakGlassOpen}
        onClose={() => setIsBreakGlassOpen(false)}
        title="Invoke Emergency Clinical Break-Glass"
        description="This action is strictly restricted to life-safety emergencies. Every query will be audited."
      >
        <div className="space-y-4">
          <div className="p-3 rounded bg-amber-50 border border-amber-300 text-xs text-amber-900">
            <strong>Legal Notice: </strong>Unjustified break-glass access violates Indian Digital Personal Data Protection (DPDP) Act and medical ethics guidelines.
          </div>

          <Textarea
            label="Clinical Justification & Triage Case Number"
            placeholder="e.g. Acute syncope, unarousable patient in trauma resuscitation bay."
            value={breakGlassReason}
            onChange={(e) => setBreakGlassReason(e.target.value)}
            required
          />

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsBreakGlassOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleBreakGlass}>
              Confirm Emergency Access
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
