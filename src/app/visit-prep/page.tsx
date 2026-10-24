'use client';

import React, { useState } from 'react';
import { useDemoContext } from '@/lib/state/demo-context';
import { SEED_PATIENT, SEED_VISIT_SUMMARY } from '@/lib/data/seed-data';
import { Stethoscope, FileText, Printer, CheckCircle2, Calendar, Activity, Pill } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function VisitPrepPage() {
  const { records } = useDemoContext();
  const [includeVitals, setIncludeVitals] = useState(true);
  const [includeLabs, setIncludeLabs] = useState(true);
  const [includeMeds, setIncludeMeds] = useState(true);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0a1f38]">Outpatient Visit Preparation Dossier</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-generate a concise, structured 1-page clinical briefing for upcoming medical consultations.
          </p>
        </div>
        <Button variant="gov-orange" size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-1.5" />
          Print / Export PDF Brief
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-4 rounded-xl bg-white p-5 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Summary Sections</h3>
          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeVitals}
                onChange={(e) => setIncludeVitals(e.target.checked)}
                className="rounded text-[#0d5ca8]"
              />
              <span className="font-medium text-slate-800">Recent Vital Signs Telemetry</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeLabs}
                onChange={(e) => setIncludeLabs(e.target.checked)}
                className="rounded text-[#0d5ca8]"
              />
              <span className="font-medium text-slate-800">Key Diagnostic Lab Panels (HbA1c, Lipids)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMeds}
                onChange={(e) => setIncludeMeds(e.target.checked)}
                className="rounded text-[#0d5ca8]"
              />
              <span className="font-medium text-slate-800">Active Prescriptions & Allergies</span>
            </label>
          </div>
        </div>

        {/* Printable 1-Page Summary View */}
        <div className="lg:col-span-8 rounded-xl bg-white p-6 border border-slate-200 shadow-sm space-y-5 print:shadow-none print:border-none">
          <div className="border-b border-slate-200 pb-4 flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d5ca8]">SwasthyaSetu Clinical Brief</span>
              <h2 className="text-lg font-black text-slate-900">{SEED_PATIENT.mrn} • Rajesh Sharma (43Y/M)</h2>
              <p className="text-xs text-slate-500">Blood Group: {SEED_PATIENT.blood_group} • Primary Contact: {SEED_PATIENT.emergency_contact_phone}</p>
            </div>
            <Badge variant="success" size="sm">Ready for Clinician</Badge>
          </div>

          <div className="space-y-4 text-xs">
            {/* Allergies & Chronic Conditions */}
            <div className="p-3.5 rounded-lg bg-rose-50/60 border border-rose-200 text-rose-950">
              <p className="font-bold text-xs text-rose-900 mb-1">CRITICAL ALLERGIES & CHRONIC CONDITIONS:</p>
              <p><span className="font-semibold">Allergies: </span>{SEED_PATIENT.allergies.join(', ')}</p>
              <p><span className="font-semibold">Chronic: </span>{SEED_PATIENT.chronic_conditions.join(', ')}</p>
            </div>

            {/* Recent Vitals */}
            {includeVitals && (
              <div>
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-[#0d5ca8]" /> Latest Recorded Vitals (2026-03-05)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded bg-slate-50 border">
                    <span className="text-[10px] text-slate-500 block">BP</span>
                    <span className="font-bold text-slate-900 text-sm">128/82 mmHg</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border">
                    <span className="text-[10px] text-slate-500 block">Heart Rate</span>
                    <span className="font-bold text-slate-900 text-sm">72 bpm</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border">
                    <span className="text-[10px] text-slate-500 block">BMI</span>
                    <span className="font-bold text-slate-900 text-sm">24.6 kg/m²</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border">
                    <span className="text-[10px] text-slate-500 block">SpO2</span>
                    <span className="font-bold text-slate-900 text-sm">98%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Consultation Summary */}
            <div className="pt-2">
              <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-[#0d5ca8]" /> Last Specialist Encounter Note
              </h4>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border">
                {SEED_VISIT_SUMMARY.clinical_summary}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
