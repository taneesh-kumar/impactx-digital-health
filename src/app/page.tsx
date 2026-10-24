'use client';

import React from 'react';
import Link from 'next/link';
import { useDemoContext } from '@/lib/state/demo-context';
import {
  FileText,
  AlertTriangle,
  Copy,
  FileQuestion,
  Share2,
  Users,
  Upload,
  Clock,
  Stethoscope,
  ShieldAlert,
  Bot,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Building,
  UserCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function OverviewPage() {
  const { counts, records, currentProfile } = useDemoContext();

  // Overview metric cards strictly driven by persisted data counts
  const statCards = [
    {
      title: 'Total Records',
      count: counts.totalRecords,
      subtitle: 'Persisted in dossier',
      href: '/records',
      icon: FileText,
      iconBg: 'bg-blue-600 text-white',
      borderAccent: 'border-blue-100',
    },
    {
      title: 'Need Review',
      count: counts.needReviewCount,
      subtitle: '(Date Conflicts)',
      href: '/timeline?filter=date_conflict',
      icon: AlertTriangle,
      iconBg: 'bg-[#d9531e] text-white',
      borderAccent: 'border-orange-200',
      highlight: true,
    },
    {
      title: 'Potential Duplicates',
      count: counts.potentialDuplicatesCount,
      subtitle: 'Awaiting review',
      href: '/duplicate-review',
      icon: Copy,
      iconBg: 'bg-[#0d5ca8] text-white',
      borderAccent: 'border-blue-200',
    },
    {
      title: 'OCR Uncertainty',
      count: counts.ocrUncertainCount,
      subtitle: 'Handwritten Rx flag',
      href: '/records/r0888888-8888-8888-8888-888888888888',
      icon: FileQuestion,
      iconBg: 'bg-teal-600 text-white',
      borderAccent: 'border-teal-100',
    },
    {
      title: 'Active Shares',
      count: counts.activeSharesCount,
      subtitle: 'Consent grants',
      href: '/share-consent',
      icon: Share2,
      iconBg: 'bg-indigo-600 text-white',
      borderAccent: 'border-indigo-100',
    },
    {
      title: 'Caregiver Access',
      count: counts.caregiverCount,
      subtitle: 'Active proxy',
      href: '/caregiver-access',
      icon: Users,
      iconBg: 'bg-slate-700 text-white',
      borderAccent: 'border-slate-200',
    },
  ];

  const quickAccessActions = [
    {
      title: 'Upload Document',
      description: 'Add reports from any provider',
      href: '/records/upload',
      icon: Upload,
      color: 'bg-blue-600 text-white',
    },
    {
      title: 'View Health Timeline',
      description: 'Explore your complete history',
      href: '/timeline',
      icon: Clock,
      color: 'bg-indigo-600 text-white',
    },
    {
      title: 'Share Records',
      description: 'Control who can access',
      href: '/share-consent',
      icon: Share2,
      color: 'bg-blue-500 text-white',
    },
    {
      title: 'Prepare for Visit',
      description: 'Generate a summary',
      href: '/visit-prep',
      icon: Stethoscope,
      color: 'bg-emerald-600 text-white',
    },
    {
      title: 'Emergency Access',
      description: 'For authorized clinicians',
      href: '/emergency-access',
      icon: ShieldAlert,
      color: 'bg-[#d9531e] text-white',
    },
    {
      title: 'AI Assistant',
      description: 'Ask questions about your records',
      href: '/ai-assistant',
      icon: Bot,
      color: 'bg-sky-600 text-white',
    },
  ];

  const recentRecords = records.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* 1. HERO BANNER (Matches reference design) */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-white via-white to-blue-50/60 p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0d5ca8] text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#0d5ca8] animate-pulse" />
              Patient-Controlled Health Dossier • Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0a1f38] tracking-tight">
              Your Health Records. <br />
              <span className="text-[#0d5ca8]">More Control. Greater Clarity.</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              SwasthyaSetu helps you organize, understand and securely share your health records from multiple providers — with full control and transparency.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/records/upload">
                <Button variant="gov-orange" size="sm">
                  <Upload className="h-4 w-4 mr-1.5" />
                  Upload New Document
                </Button>
              </Link>
              <Link href="/timeline">
                <Button variant="outline" size="sm">
                  Explore Timeline
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Graphical Clinical Illustration Card */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xs rounded-xl bg-gradient-to-b from-blue-50 to-indigo-50/50 p-5 border border-blue-100 shadow-inner text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md text-[#0d5ca8] mb-3">
                <Stethoscope className="h-7 w-7" />
              </div>
              <p className="text-xs font-bold text-[#0a1f38]">ABDM Clinical Continuity</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Zero silent merges • Verifiable provenance • Short-lived consent grants
              </p>
              <div className="mt-3 pt-3 border-t border-blue-100/60 flex items-center justify-center gap-2 text-[10px] text-[#0d5ca8] font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Logged as {currentProfile.full_name}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS ROW (Matches reference layout: 12, 2, 3, 1, 2, 1) */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className={`group rounded-xl bg-white p-4 border transition-all hover:shadow-md hover:-translate-y-0.5 ${card.borderAccent}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 ${card.iconBg}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900 group-hover:text-[#0d5ca8] transition-colors leading-none">
                      {card.count}
                    </div>
                    <div className="text-[11px] font-bold text-slate-700 leading-tight mt-1">
                      {card.title}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 font-medium truncate">
                  {card.subtitle}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. QUICK ACCESS CARDS (Matches reference design) */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {quickAccessActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="group flex flex-col justify-between rounded-xl bg-white p-4 border border-slate-200 transition-all hover:border-[#0d5ca8] hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#0d5ca8] group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#0d5ca8] transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    {action.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. CONTINUE DEMONSTRATION JOURNEY & RECENT HIGHLIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Demonstration Milestones */}
        <div className="lg:col-span-7 rounded-xl bg-white p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Continue Demonstration Journey</h3>
              <p className="text-xs text-slate-500">Key inspection points across Prompt 0, 1, 2, and 3</p>
            </div>
            <Badge variant="orange" size="sm">
              3 Tasks Ready
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Action 1: Duplicate & Conflict Review */}
            <Link
              href="/duplicate-review"
              className="flex items-start gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors group"
            >
              <div className="p-2 rounded bg-amber-100 text-amber-700 flex-shrink-0 mt-0.5">
                <Copy className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-900 group-hover:text-amber-800">
                    Review Flagged Duplicates & Near-Duplicates
                  </h4>
                  <span className="text-[11px] font-semibold text-amber-700 group-hover:translate-x-0.5 transition-transform flex items-center">
                    Review →
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  1 exact binary hash duplicate and 2 near-duplicate records awaiting explainable side-by-side reconciliation.
                </p>
              </div>
            </Link>

            {/* Action 2: Date Discrepancy Verification */}
            <Link
              href="/timeline?filter=date_conflict"
              className="flex items-start gap-3 p-3 rounded-lg border border-orange-200 bg-orange-50/50 hover:bg-orange-50 transition-colors group"
            >
              <div className="p-2 rounded bg-orange-100 text-[#d9531e] flex-shrink-0 mt-0.5">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-orange-900 group-hover:text-orange-800">
                    Verify Conflicting Clinical Chronologies (2 Records)
                  </h4>
                  <span className="text-[11px] font-semibold text-[#d9531e] group-hover:translate-x-0.5 transition-transform flex items-center">
                    Inspect →
                  </span>
                </div>
                <p className="text-[11px] text-orange-800 mt-0.5">
                  Liver panel and Cardiology outpatient records show specimen draw dates that conflict with printed sign-off dates.
                </p>
              </div>
            </Link>

            {/* Action 3: OCR Uncertainty Inspection */}
            <Link
              href="/records/r0888888-8888-8888-8888-888888888888"
              className="flex items-start gap-3 p-3 rounded-lg border border-teal-200 bg-teal-50/50 hover:bg-teal-50 transition-colors group"
            >
              <div className="p-2 rounded bg-teal-100 text-teal-700 flex-shrink-0 mt-0.5">
                <FileQuestion className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-teal-900 group-hover:text-teal-800">
                    Inspect Handwritten Prescription OCR Uncertainty
                  </h4>
                  <span className="text-[11px] font-semibold text-teal-700 group-hover:translate-x-0.5 transition-transform flex items-center">
                    Examine →
                  </span>
                </div>
                <p className="text-[11px] text-teal-800 mt-0.5">
                  Cardiology prescription has ambiguous cursive stroke (Telmisartan 20mg vs 40mg). Marked unverified to prevent silent clinical errors.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Records Stream */}
        <div className="lg:col-span-5 rounded-xl bg-white p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Records</h3>
              <p className="text-xs text-slate-500">Latest synchronized documents</p>
            </div>
            <Link href="/records" className="text-xs font-semibold text-[#0d5ca8] hover:underline">
              View All ({records.length})
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentRecords.map((rec) => (
              <Link
                key={rec.id}
                href={`/records/${rec.id}`}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded bg-blue-50 text-[#0d5ca8] flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{rec.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {rec.clinical_event_date || 'Unknown date'}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{rec.category.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <Badge
                  size="sm"
                  variant={
                    rec.verification_status === 'verified'
                      ? 'success'
                      : rec.verification_status === 'date_conflict'
                      ? 'warning'
                      : rec.verification_status === 'ocr_uncertain'
                      ? 'orange'
                      : 'neutral'
                  }
                >
                  {rec.verification_status === 'date_conflict'
                    ? 'Date Conflict'
                    : rec.verification_status === 'ocr_uncertain'
                    ? 'OCR Check'
                    : rec.verification_status}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
