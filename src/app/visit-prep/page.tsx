'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDemoContext } from '@/lib/state/demo-context';
import { SEED_PATIENT, SEED_VISIT_SUMMARY } from '@/lib/data/seed-data';
import {
  SEED_MEDICATION_DISCREPANCIES,
  INITIAL_PREPARED_QUESTIONS,
  PatientPreparedQuestion,
} from '@/lib/data/medication-data';
import {
  AlertTriangle,
  Pill,
  FileText,
  Printer,
  CheckCircle2,
  Calendar,
  Activity,
  PlusCircle,
  HelpCircle,
  ExternalLink,
  Info,
  Clock,
  Layers,
  FileQuestion,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function VisitPrepPage() {
  const { records } = useDemoContext();

  // Selected records for inclusion in the visit summary
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([
    'r0111111-1111-1111-1111-111111111111', // Lipid Profile
    'r0222222-2222-2222-2222-222222222222', // LFT (Date Discrepancy)
    'r0333333-3333-3333-3333-333333333333', // Cardio Follow-up
    'r0666666-6666-6666-6666-666666666666', // HbA1c
    'r0888888-8888-8888-8888-888888888888', // Handwritten Prescription (OCR Uncertain)
  ]);

  // Section visibility toggles
  const [includeVitals, setIncludeVitals] = useState(true);
  const [includeLabs, setIncludeLabs] = useState(true);
  const [includeDiscrepancies, setIncludeDiscrepancies] = useState(true);
  const [includeQuestions, setIncludeQuestions] = useState(true);
  const [activeTab, setActiveTab] = useState<'dossier' | 'medications' | 'questions'>('dossier');

  // Question builder state
  const [questions, setQuestions] = useState<PatientPreparedQuestion[]>(INITIAL_PREPARED_QUESTIONS);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [selectedQuestionRecordId, setSelectedQuestionRecordId] = useState<string>('r0333333-3333-3333-3333-333333333333');
  const [questionCategory, setQuestionCategory] = useState<PatientPreparedQuestion['category']>('medication_clarification');

  const toggleRecordSelection = (id: string) => {
    setSelectedRecordIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const sourceRec = records.find((r) => r.id === selectedQuestionRecordId);
    const newQ: PatientPreparedQuestion = {
      id: `q-${Date.now()}`,
      source_record_id: selectedQuestionRecordId,
      source_record_title: sourceRec?.title || 'General Consultation Question',
      question_text: newQuestionText.trim(),
      category: questionCategory,
      context_note: `Linked to ${sourceRec?.title || 'Consultation'}`,
      created_at: new Date().toISOString(),
    };

    setQuestions((prev) => [...prev, newQ]);
    setNewQuestionText('');
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const selectedRecords = records.filter((r) => selectedRecordIds.includes(r.id));
  const selectedDateConflicts = selectedRecords.filter((r) => r.has_date_conflict);
  const selectedOCRUncertain = selectedRecords.filter((r) => r.verification_status === 'ocr_uncertain');

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#173567]">
            Visit Preparation & Medication Discrepancy Review
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Empower patients to prepare for clinical appointments with source-cited facts, medication divergence flags, and doctor clarification questions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="gov-orange" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1.5" />
            Print / Export Dossier
          </Button>
        </div>
      </div>

      {/* Neutral Clinical Non-Diagnostic Banner */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-900">
            Clinical Neutrality & Non-Diagnostic Guarantee:
          </p>
          <p className="mt-0.5 text-amber-800 leading-relaxed">
            This system surfaces factual differences recorded in patient documents without determining which prescription or date is medically correct. It does not provide medical diagnoses, treatment recommendations, or medication adjustments. Please ask your treating clinician to clarify divergences.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-lg px-4 pt-2 gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('dossier')}
          className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'dossier'
              ? 'border-[#244783] text-[#244783]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="h-4 w-4" />
          Structured Visit Dossier ({selectedRecords.length} Records)
        </button>
        <button
          onClick={() => setActiveTab('medications')}
          className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'medications'
              ? 'border-[#244783] text-[#244783]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Pill className="h-4 w-4 text-[#C65317]" />
          Medication Discrepancies ({SEED_MEDICATION_DISCREPANCIES.length} Flagged)
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'questions'
              ? 'border-[#244783] text-[#244783]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileQuestion className="h-4 w-4 text-blue-600" />
          Patient Question Builder ({questions.length} Prepared)
        </button>
      </div>

      {/* TAB 1: Structured Visit Dossier */}
      {activeTab === 'dossier' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls & Record Selector */}
          <div className="lg:col-span-4 space-y-4 print:hidden">
            <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-[#244783]" />
                Select Records for Visit Dossier
              </h3>
              <p className="text-xs text-slate-500">
                Choose the clinical records you wish to present to the doctor:
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {records.map((r) => {
                  const isChecked = selectedRecordIds.includes(r.id);
                  return (
                    <label
                      key={r.id}
                      className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-blue-50/50 border-blue-200'
                          : 'bg-white border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRecordSelection(r.id)}
                        className="mt-0.5 rounded text-[#244783]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{r.title}</p>
                        <p className="text-[10px] text-slate-500">
                          {r.category} • {r.clinical_event_date || 'Date Unspecified'}
                        </p>
                      </div>
                      {r.has_date_conflict && (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1 py-0.5 rounded">
                          Date Divergence
                        </span>
                      )}
                      {r.verification_status === 'ocr_uncertain' && (
                        <span className="text-[9px] font-bold bg-purple-100 text-purple-800 px-1 py-0.5 rounded">
                          OCR Ambiguity
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800">Dossier Visibility Sections</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeVitals}
                    onChange={(e) => setIncludeVitals(e.target.checked)}
                    className="rounded text-[#244783]"
                  />
                  <span>Vital Signs Telemetry</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLabs}
                    onChange={(e) => setIncludeLabs(e.target.checked)}
                    className="rounded text-[#244783]"
                  />
                  <span>Diagnostic Lab Parameters</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDiscrepancies}
                    onChange={(e) => setIncludeDiscrepancies(e.target.checked)}
                    className="rounded text-[#244783]"
                  />
                  <span>Medication Discrepancy Warnings</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeQuestions}
                    onChange={(e) => setIncludeQuestions(e.target.checked)}
                    className="rounded text-[#244783]"
                  />
                  <span>Prepared Patient Questions</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Printable Dossier Output */}
          <div className="lg:col-span-8 rounded-xl bg-white p-6 border border-slate-200 shadow-sm space-y-5 print:shadow-none print:border-none print:p-0">
            {/* Dossier Header */}
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#244783] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  SwasthyaSetu Outpatient Clinical Brief • Synthetic Data
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {SEED_PATIENT.mrn} • Rajesh Sharma (43Y / Male)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ABHA ID: <span className="font-mono">91-8842-1920-4411</span> • Blood Group: {SEED_PATIENT.blood_group} • Dwarka, New Delhi
                </p>
              </div>
              <div className="text-right text-xs">
                <Badge variant="success" size="sm">Dossier Generated</Badge>
                <p className="text-[10px] text-slate-400 mt-1">
                  {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Critical Patient Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-950">
                <span className="font-bold text-rose-900 block mb-1">ALLERGIES (VERIFIED):</span>
                <p>{SEED_PATIENT.allergies.join(', ')}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-950">
                <span className="font-bold text-blue-900 block mb-1">CHRONIC CONDITIONS:</span>
                <p>{SEED_PATIENT.chronic_conditions.join(', ')}</p>
              </div>
            </div>

            {/* Vital Signs */}
            {includeVitals && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-[#244783]" />
                  Latest Recorded Vital Signs (2026-03-05 • Source: AIIMS Follow-up)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Blood Pressure</span>
                    <span className="font-bold text-slate-900 text-sm">128/82 mmHg</span>
                    <span className="text-[9px] text-emerald-600 block">Controlled</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Heart Rate</span>
                    <span className="font-bold text-slate-900 text-sm">72 bpm</span>
                    <span className="text-[9px] text-slate-500 block">Normal Sinus</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Body Mass Index</span>
                    <span className="font-bold text-slate-900 text-sm">24.6 kg/m²</span>
                    <span className="text-[9px] text-slate-500 block">Normal Range</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">SpO2 Oxygen</span>
                    <span className="font-bold text-slate-900 text-sm">98%</span>
                    <span className="text-[9px] text-emerald-600 block">Room Air</span>
                  </div>
                </div>
              </div>
            )}

            {/* Medication Divergence Warning in Dossier */}
            {includeDiscrepancies && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Pill className="h-4 w-4 text-[#C65317]" />
                  Active Medication Divergence Warnings ({SEED_MEDICATION_DISCREPANCIES.length})
                </h3>
                <div className="space-y-2">
                  {SEED_MEDICATION_DISCREPANCIES.map((disc) => (
                    <div
                      key={disc.id}
                      className="p-3 rounded-lg bg-orange-50/70 border border-orange-200 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{disc.medication_name}</span>
                        <Badge variant="warning" size="sm">Divergence Detected</Badge>
                      </div>
                      <p className="text-[11px] text-orange-900 italic font-medium">
                        "{disc.neutral_notice}"
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                        {disc.sources.map((src) => (
                          <div key={src.id} className="p-2 bg-white rounded border border-orange-100 text-[11px]">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-slate-800">{src.source_document_name}</span>
                              <span className="text-[10px] text-slate-500">{src.prescription_date}</span>
                            </div>
                            <p className="text-slate-900 font-bold mt-0.5">Dose: {src.dose_and_unit}</p>
                            <p className="text-slate-600 text-[10px]">Freq: {src.frequency_instructions}</p>
                            <p className="text-slate-500 text-[10px] truncate">Rx: {src.prescribing_provider}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diagnostic Lab Values with Exact Abnormal Flags */}
            {includeLabs && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-[#244783]" />
                  Key Laboratory Findings (Factual Values & Source Reference)
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-lg text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-700">
                      <tr>
                        <th className="p-2.5">Parameter</th>
                        <th className="p-2.5">Measured Value</th>
                        <th className="p-2.5">Reference Range</th>
                        <th className="p-2.5">Source & Date</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-900">Total Cholesterol</td>
                        <td className="p-2.5 font-mono">194 mg/dL</td>
                        <td className="p-2.5 text-slate-500">&lt; 200 mg/dL</td>
                        <td className="p-2.5 text-slate-600">AIIMS (2026-01-16)</td>
                        <td className="p-2.5"><span className="text-emerald-700 font-medium">Desirable</span></td>
                      </tr>
                      <tr className="bg-amber-50/40">
                        <td className="p-2.5 font-semibold text-slate-900">Serum Triglycerides</td>
                        <td className="p-2.5 font-mono font-bold text-amber-900">168 mg/dL</td>
                        <td className="p-2.5 text-slate-500">&lt; 150 mg/dL</td>
                        <td className="p-2.5 text-slate-600">AIIMS (2026-01-16)</td>
                        <td className="p-2.5">
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold text-[10px]">
                            Borderline High
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-900">HDL Cholesterol</td>
                        <td className="p-2.5 font-mono">44 mg/dL</td>
                        <td className="p-2.5 text-slate-500">&gt; 40 mg/dL</td>
                        <td className="p-2.5 text-slate-600">AIIMS (2026-01-16)</td>
                        <td className="p-2.5"><span className="text-emerald-700 font-medium">Acceptable</span></td>
                      </tr>
                      <tr className="bg-amber-50/40">
                        <td className="p-2.5 font-semibold text-slate-900">HbA1c Glycated Hemoglobin</td>
                        <td className="p-2.5 font-mono font-bold text-amber-900">6.4 %</td>
                        <td className="p-2.5 text-slate-500">4.0 - 5.6 %</td>
                        <td className="p-2.5 text-slate-600">Dr. Lal PathLabs (2026-03-02)</td>
                        <td className="p-2.5">
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold text-[10px]">
                            Prediabetic Range
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Chronology & OCR Discrepancies */}
            {(selectedDateConflicts.length > 0 || selectedOCRUncertain.length > 0) && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Chronology & OCR Divergences Requiring Doctor Attention
                </h3>
                <div className="space-y-2 text-xs">
                  {selectedDateConflicts.map((dc) => (
                    <div key={dc.id} className="p-2.5 rounded bg-amber-50/60 border border-amber-200">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-amber-950">{dc.title}</span>
                        <Badge variant="warning" size="sm">Date Conflict</Badge>
                      </div>
                      <p className="text-amber-800 text-[11px] mt-1">{dc.date_conflict_details}</p>
                    </div>
                  ))}
                  {selectedOCRUncertain.map((ocr) => (
                    <div key={ocr.id} className="p-2.5 rounded bg-purple-50/60 border border-purple-200">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-purple-950">{ocr.title}</span>
                        <Badge variant="info" size="sm">OCR Uncertainty</Badge>
                      </div>
                      <p className="text-purple-800 text-[11px] mt-1">
                        Handwritten physician cursive contains ambiguous dosage loop. Preserved original scan for doctor review.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Questions Prepared by Patient */}
            {includeQuestions && questions.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileQuestion className="h-4 w-4 text-blue-600" />
                  Questions Prepared by Patient for Doctor ({questions.length})
                </h3>
                <div className="space-y-2">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 text-xs flex items-start gap-2.5"
                    >
                      <span className="font-bold text-blue-900 bg-blue-200/70 h-5 w-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{q.question_text}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Referenced: <span className="font-medium text-slate-700">{q.source_record_title}</span>
                          {q.context_note && ` • ${q.context_note}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Sign-off */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
              <span>SwasthyaSetu Patient Dossier Export • Generated for Clinical Consultation</span>
              <span>All facts verifiable to Record IDs</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Medication Discrepancy Review */}
      {activeTab === 'medications' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Pill className="h-5 w-5 text-[#C65317]" />
              Explainable Medication Divergence Engine
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              When prescriptions from different hospital visits or handwritten slips diverge, SwasthyaSetu highlights both records faithfully without deciding which prescription is active.
            </p>
          </div>

          <div className="space-y-4">
            {SEED_MEDICATION_DISCREPANCIES.map((group) => (
              <div
                key={group.id}
                className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{group.medication_name}</h3>
                    <p className="text-xs text-slate-500">
                      Comparing {group.sources.length} clinical record sources
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {group.has_dosage_difference && (
                      <span className="text-xs font-semibold bg-rose-50 text-rose-800 px-2 py-0.5 rounded border border-rose-200">
                        Dosage Divergence
                      </span>
                    )}
                    {group.has_ocr_ambiguity && (
                      <span className="text-xs font-semibold bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                        Handwritten OCR Uncertainty
                      </span>
                    )}
                  </div>
                </div>

                {/* Neutral Notice */}
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <Info className="h-4 w-4 text-amber-700 flex-shrink-0" />
                  <span className="font-medium italic">"{group.neutral_notice}"</span>
                </div>

                {/* Side-by-Side Source Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.sources.map((src, idx) => (
                    <div
                      key={src.id}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs relative"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-800">Source #{idx + 1}: {src.source_document_name}</span>
                        <Badge
                          variant={src.is_uncertain ? 'info' : 'success'}
                          size="sm"
                        >
                          {src.is_uncertain ? 'OCR Uncertain' : 'Verified'}
                        </Badge>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Prescription Date:</span>
                          <span className="font-medium text-slate-800">{src.prescription_date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Prescribed Dose:</span>
                          <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {src.dose_and_unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Frequency / Instructions:</span>
                          <span className="font-medium text-slate-800">{src.frequency_instructions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Prescribing Clinician:</span>
                          <span className="text-slate-700">{src.prescribing_provider}</span>
                        </div>
                        {src.uncertainty_reason && (
                          <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200 text-[11px] text-purple-900">
                            <span className="font-bold">OCR Note:</span> {src.uncertainty_reason}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-end">
                        <Link
                          href={`/records/${src.record_id}`}
                          className="text-[#244783] hover:underline flex items-center gap-1 text-[11px] font-semibold"
                        >
                          View Original Record <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Patient Question Preparation */}
      {activeTab === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Question Builder Form */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <PlusCircle className="h-4 w-4 text-[#244783]" />
                Prepare a Question for Doctor
              </h2>
              <p className="text-xs text-slate-500">
                Draft targeted questions referencing specific dates or divergent medications so you don't forget them during your consultation.
              </p>

              <form onSubmit={handleAddQuestion} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Question Category
                  </label>
                  <select
                    value={questionCategory}
                    onChange={(e) => setQuestionCategory(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs"
                  >
                    <option value="medication_clarification">Medication Dosage Clarification</option>
                    <option value="date_discrepancy">Conflicting Date / Event Clarification</option>
                    <option value="ocr_uncertainty">Unclear Handwritten Text Confirmation</option>
                    <option value="version_replacement">Report Version / Replacement Inquiry</option>
                    <option value="custom">General Consultation Question</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Link to Source Record
                  </label>
                  <select
                    value={selectedQuestionRecordId}
                    onChange={(e) => setSelectedQuestionRecordId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs"
                  >
                    {records.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.clinical_event_date || 'No Date'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Your Question for Clinician
                  </label>
                  <textarea
                    rows={3}
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="e.g. Which prescription should I follow for my evening dose?"
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-[#244783]"
                  />
                </div>

                <Button type="submit" variant="primary" size="sm" className="w-full">
                  Add Question to Visit Dossier
                </Button>
              </form>

              {/* Deterministic Suggested Question Templates */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Quick Question Templates:
                </span>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setNewQuestionText(
                        'Can you clarify the date difference between the laboratory collection and report stamp?'
                      )
                    }
                    className="w-full text-left p-1.5 rounded bg-slate-50 hover:bg-slate-100 text-[11px] text-slate-700 block transition-colors"
                  >
                    • "Can you clarify the date difference between these reports?"
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNewQuestionText(
                        'Which prescription dosage should I follow between my inpatient discharge and clinic note?'
                      )
                    }
                    className="w-full text-left p-1.5 rounded bg-slate-50 hover:bg-slate-100 text-[11px] text-slate-700 block transition-colors"
                  >
                    • "Which prescription should I follow?"
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNewQuestionText(
                        'Can you confirm the unclear handwritten text regarding medication timing in this document?'
                      )
                    }
                    className="w-full text-left p-1.5 rounded bg-slate-50 hover:bg-slate-100 text-[11px] text-slate-700 block transition-colors"
                  >
                    • "Can you confirm the unclear text in this document?"
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setNewQuestionText(
                        'Does this updated report replace my previous test result from earlier this month?'
                      )
                    }
                    className="w-full text-left p-1.5 rounded bg-slate-50 hover:bg-slate-100 text-[11px] text-slate-700 block transition-colors"
                  >
                    • "Does this corrected report replace an earlier version?"
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Prepared Questions List */}
          <div className="lg:col-span-7 space-y-3">
            <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">
                  Prepared Questions for Upcoming Visit ({questions.length})
                </h3>
                <span className="text-[11px] text-slate-500">
                  Included in PDF / Print Export
                </span>
              </div>

              {questions.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No questions prepared yet. Use the builder on the left to add questions.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className="h-5 w-5 rounded-full bg-[#244783] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{q.question_text}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Linked record:{' '}
                              <span className="font-semibold text-slate-700">
                                {q.source_record_title}
                              </span>
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeQuestion(q.id)}
                          className="text-slate-400 hover:text-rose-600 text-xs font-semibold"
                        >
                          Remove
                        </button>
                      </div>

                      {q.context_note && (
                        <div className="ml-7 p-2 bg-slate-50 rounded text-[11px] text-slate-600">
                          {q.context_note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
