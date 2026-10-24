'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDemoContext } from '@/lib/state/demo-context';
import { SEED_PATIENT, SEED_PROFILES } from '@/lib/data/seed-data';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Lock,
  CheckCircle2,
  History,
  PhoneCall,
  Bell,
  Building,
  UserCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Input';

export default function EmergencyAccessPage() {
  const { currentProfile, emergencySessions, startEmergencySession, closeEmergencySession, logAuditEvent } = useDemoContext();

  const [isBreakGlassOpen, setIsBreakGlassOpen] = useState(false);
  const [breakGlassReason, setBreakGlassReason] = useState('Acute syncope, unresponsive trauma patient in resuscitation bay');
  const [justificationNotes, setJustificationNotes] = useState('Patient brought in unconscious by bystanders; surrogate consent unavailable; immediate allergy/cardiac history needed.');
  const [hospitalUnit, setHospitalUnit] = useState('Safdarjung Hospital Emergency Trauma Resuscitation Bay 2');

  // Check if there is an active session
  const activeSession = emergencySessions.find((s) => s.status === 'active');
  const isEmergencyClinician = currentProfile.role === 'emergency_clinician';

  const handleInvokeBreakGlass = () => {
    if (!isEmergencyClinician) {
      alert('Security Policy: Only authorized Emergency Clinicians can initiate Break-Glass sessions.');
      return;
    }

    startEmergencySession(breakGlassReason, justificationNotes, hospitalUnit);
    setIsBreakGlassOpen(false);
  };

  const handleCloseSession = (id: string) => {
    closeEmergencySession(id);
  };

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
              Emergency Access Simulation (Break-Glass Protocol)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Time-bounded (30-minute), audited emergency override strictly reserved for licensed emergency clinicians during acute life-safety emergencies.
          </p>
        </div>

        {activeSession ? (
          <Button variant="outline" size="sm" onClick={() => handleCloseSession(activeSession.id)}>
            Terminate Emergency Session
          </Button>
        ) : (
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (!isEmergencyClinician) {
                alert('Role Policy: Only Dr. Vikram Malhotra (Emergency Clinician) can invoke Break-Glass. Switch identity in top-right demo selector.');
                return;
              }
              setIsBreakGlassOpen(true);
            }}
          >
            <ShieldAlert className="h-4 w-4 mr-1.5" />
            Invoke 30-Min Break-Glass Session
          </Button>
        )}
      </div>

      {/* Role Policy Reminder */}
      {!isEmergencyClinician && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Role Policy Restriction:</p>
            <p className="leading-relaxed">
              You are currently authenticated as <strong>{currentProfile.full_name} ({currentProfile.role})</strong>.
              Break-Glass invocation is strictly restricted to emergency clinicians. Switch to <strong>Dr. Vikram Malhotra (Emergency Clinician)</strong> in the top header to test emergency access simulation.
            </p>
          </div>
        </div>
      )}

      {/* ACTIVE EMERGENCY SESSION BANNER */}
      {activeSession && (
        <div className="rounded-xl border-2 border-rose-500 bg-rose-50/80 p-5 space-y-3 shadow-sm animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-950 font-black text-sm">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
              <span>ACTIVE EMERGENCY BREAK-GLASS SESSION (TIMED 30-MIN WINDOW)</span>
            </div>
            <Badge variant="danger" size="sm">Emergency Status</Badge>
          </div>
          <div className="text-xs text-rose-900 space-y-1 font-medium">
            <p>
              Invoked By: <span className="font-bold">{activeSession.clinician_name}</span> • Unit: {activeSession.hospital_unit}
            </p>
            <p>
              Clinical Justification: "{activeSession.reason}"
            </p>
            <p className="text-[11px] text-rose-800">
              Session window expires automatically at <strong>{new Date(activeSession.expires_at).toLocaleTimeString('en-IN')}</strong>. All accessed records are anchored to the immutable hospital audit trail.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Link href="/records">
              <Button variant="danger" size="sm">
                Access Emergency Records Now <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => handleCloseSession(activeSession.id)}>
              Close Session Early
            </Button>
          </div>
        </div>
      )}

      {/* SIMULATED PATIENT NOTIFICATION BANNER */}
      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Bell className="h-4 w-4 text-[#244783]" />
          <h2 className="text-sm font-bold text-slate-900">
            Privacy-Safe Patient & Proxy Notification Dispatch
          </h2>
        </div>
        <p className="text-xs text-slate-600">
          Whenever a break-glass event occurs, SwasthyaSetu broadcasts a privacy-safe SMS and push alert to the patient and registered healthcare proxy.
        </p>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
          <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block">
            SMS Broadcast Template (Lock-Screen Safe — Zero Clinical Facts Exposed)
          </span>
          <p className="text-slate-900 font-semibold">
            "SwasthyaSetu Alert: Emergency Break-Glass access was invoked for Rajesh Sharma at Safdarjung Hospital Emergency Trauma by Dr. Vikram Malhotra. If this was unauthorized, contact 1075 immediately."
          </p>
        </div>
      </div>

      {/* EMERGENCY CARE CRITICAL DOSSIER */}
      <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            Life-Safety Emergency Dossier Summary ({SEED_PATIENT.mrn})
          </h2>
          <span className="text-[11px] text-slate-400">
            Rapid Triage Reference (Non-Sensitive)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-500 block text-[10px] uppercase">Blood Group & Rh</span>
            <span className="text-xl font-black text-rose-600 block">B+ (Rh Positive)</span>
            <span className="text-[10px] text-slate-400">Verified by AIIMS Lab</span>
          </div>

          <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 space-y-1">
            <span className="font-bold text-rose-900 block text-[10px] uppercase">Critical Drug Allergies</span>
            <span className="text-sm font-bold text-rose-800 block">Penicillin, Sulfa drugs</span>
            <span className="text-[10px] text-rose-700">Strict anaphylaxis precaution</span>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-1">
            <span className="font-bold text-blue-900 block text-[10px] uppercase">Primary Healthcare Proxy</span>
            <span className="text-sm font-bold text-blue-900 block">Pooja Sharma (Spouse)</span>
            <span className="text-[10px] text-blue-700 font-mono">+91 98765 43211</span>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px]">
          <strong>Notice:</strong> Emergency break-glass automatically unlocks general clinical notes, medications, and vitals. Confidential mental health psychotherapy records remain strictly excluded to protect patient dignity.
        </div>
      </div>

      {/* BREAK-GLASS INVOCATION MODAL */}
      <Dialog
        isOpen={isBreakGlassOpen}
        onClose={() => setIsBreakGlassOpen(false)}
        title="Invoke 30-Minute Emergency Break-Glass Protocol"
        description="This action is strictly audited and subject to statutory clinical review."
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded bg-rose-50 border border-rose-300 text-rose-900 space-y-1">
            <p className="font-bold">Statutory Medical Ethics Notice:</p>
            <p className="text-[11px] leading-relaxed">
              Under ABDM and Indian DPDP guidelines, break-glass invocation without bona fide clinical emergency constitutes a reportable regulatory violation.
            </p>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Emergency Clinical Reason
            </label>
            <input
              type="text"
              value={breakGlassReason}
              onChange={(e) => setBreakGlassReason(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-medium"
              placeholder="e.g. Acute syncope, unarousable patient"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Clinical Justification & Case Details
            </label>
            <Textarea
              value={justificationNotes}
              onChange={(e) => setJustificationNotes(e.target.value)}
              rows={3}
              placeholder="Clinical status of patient, unavailability of surrogate consent, and required records."
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">
              Emergency Department / Hospital Unit
            </label>
            <input
              type="text"
              value={hospitalUnit}
              onChange={(e) => setHospitalUnit(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsBreakGlassOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleInvokeBreakGlass}>
              Confirm Break-Glass Invocation
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
