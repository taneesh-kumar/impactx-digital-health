'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDemoContext } from '@/lib/state/demo-context';
import { HealthRecord, RecordCategory } from '@/lib/supabase/types';
import {
  Calendar,
  Building,
  Upload,
  AlertTriangle,
  FileQuestion,
  CheckCircle2,
  Clock,
  Filter,
  FileText,
  Search,
  ExternalLink,
  Info,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';

function TimelineContent() {
  const searchParams = useSearchParams();
  const urlFilter = searchParams.get('filter') || 'all';
  const queryParam = searchParams.get('q') || '';

  const { records, searchQuery, setSearchQuery } = useDemoContext();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>(urlFilter);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>(queryParam);

  const categories: { value: string; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'lab_result', label: 'Lab Results' },
    { value: 'prescription', label: 'Prescriptions' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'clinical_note', label: 'Clinical Notes' },
    { value: 'discharge_summary', label: 'Discharge Summaries' },
    { value: 'vaccination', label: 'Vaccinations' },
    { value: 'vital_sign', label: 'Vital Signs' },
  ];

  const statuses: { value: string; label: string }[] = [
    { value: 'all', label: 'All Review Statuses' },
    { value: 'verified', label: 'Verified Only' },
    { value: 'date_conflict', label: 'Date Conflicts (Requires Review)' },
    { value: 'ocr_uncertain', label: 'OCR Uncertain (Handwritten Rx)' },
    { value: 'pending_review', label: 'Pending Duplicate Review' },
  ];

  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // Category filter
        if (selectedCategory !== 'all' && rec.category !== selectedCategory) return false;
        // Status filter
        if (selectedStatus === 'date_conflict') {
          if (!rec.has_date_conflict && rec.verification_status !== 'date_conflict') return false;
        } else if (selectedStatus === 'ocr_uncertain') {
          if (rec.verification_status !== 'ocr_uncertain') return false;
        } else if (selectedStatus === 'verified') {
          if (rec.verification_status !== 'verified') return false;
        } else if (selectedStatus === 'pending_review') {
          if (rec.verification_status !== 'pending_review') return false;
        }
        // Source filter
        if (selectedSource !== 'all' && rec.source?.source_type !== selectedSource) return false;
        // Search term
        const query = searchTerm.toLowerCase();
        if (query) {
          const matchTitle = rec.title.toLowerCase().includes(query);
          const matchDesc = rec.description?.toLowerCase().includes(query);
          const matchProvider = rec.provider?.facility_name.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchProvider) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Chronological clinical order: newest clinical date first, handling unknown dates safely
        const dateA = a.clinical_event_date ? new Date(a.clinical_event_date).getTime() : 0;
        const dateB = b.clinical_event_date ? new Date(b.clinical_event_date).getTime() : 0;
        return dateB - dateA;
      });
  }, [records, selectedCategory, selectedStatus, selectedSource, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl font-bold text-[#0a1f38]">Longitudinal Health Timeline</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict chronological separation of clinical event date, report release date, and upload timestamp.
            </p>
          </div>
          <Link href="/records/upload">
            <Button variant="gov-orange" size="sm">
              <Upload className="h-4 w-4 mr-1.5" />
              Upload Document
            </Button>
          </Link>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Term */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by title, test name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-[#0d5ca8] focus:outline-none focus:ring-1 focus:ring-[#0d5ca8]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs text-slate-900 focus:border-[#0d5ca8] focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Review Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs text-slate-900 focus:border-[#0d5ca8] focus:outline-none"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedSource('all');
                setSearchTerm('');
              }}
              className="w-full text-xs"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Active Filter Badges */}
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
          <span className="font-semibold text-slate-700">Showing {filteredRecords.length} records</span>
          {selectedStatus !== 'all' && (
            <Badge variant="orange" size="sm">
              Filtered: {selectedStatus.replace('_', ' ')}
            </Badge>
          )}
          {selectedCategory !== 'all' && (
            <Badge variant="default" size="sm">
              Category: {selectedCategory.replace('_', ' ')}
            </Badge>
          )}
        </div>
      </div>

      {/* Timeline Stream */}
      {filteredRecords.length === 0 ? (
        <EmptyState
          title="No records match current filters"
          description="Try resetting category or status filters to view other medical events in the patient journey."
          actionLabel="Clear Filters"
          onAction={() => {
            setSelectedCategory('all');
            setSelectedStatus('all');
            setSearchTerm('');
          }}
        />
      ) : (
        <div className="relative border-l-2 border-slate-300 ml-4 sm:ml-6 pl-4 sm:pl-6 space-y-6">
          {filteredRecords.map((record) => (
            <TimelineItem key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineItem({ record }: { record: HealthRecord }) {
  const getBadgeVariant = (status: HealthRecord['verification_status']) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'date_conflict':
        return 'warning';
      case 'ocr_uncertain':
        return 'orange';
      case 'pending_review':
        return 'info';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="relative group">
      {/* Timeline Pin Marker */}
      <div
        className={`absolute -left-[27px] sm:-left-[35px] top-4 h-5 w-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
          record.has_date_conflict || record.verification_status === 'date_conflict'
            ? 'bg-[#d9531e]'
            : record.verification_status === 'ocr_uncertain'
            ? 'bg-amber-500'
            : record.verification_status === 'verified'
            ? 'bg-[#0d5ca8]'
            : 'bg-slate-400'
        }`}
      >
        <div className="h-1.5 w-1.5 rounded-full bg-white" />
      </div>

      {/* Record Card */}
      <div className="rounded-xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" size="sm" className="uppercase font-bold tracking-wider">
                {record.category.replace('_', ' ')}
              </Badge>

              <Badge variant={getBadgeVariant(record.verification_status)} size="sm">
                {record.verification_status === 'date_conflict'
                  ? 'Date Conflict Flag'
                  : record.verification_status === 'ocr_uncertain'
                  ? 'OCR Ambiguity Flag'
                  : record.verification_status === 'pending_review'
                  ? 'Duplicate Review Pending'
                  : 'Verified Clinical Record'}
              </Badge>

              <span className="text-[11px] text-slate-400 font-mono">
                Method: {record.extraction_method.replace('_', ' ')}
              </span>
            </div>

            <Link href={`/records/${record.id}`} className="group-hover:text-[#0d5ca8] transition-colors inline-block">
              <h3 className="text-base font-bold text-slate-900 leading-snug">{record.title}</h3>
            </Link>

            {record.description && (
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{record.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start">
            <Link href={`/records/${record.id}`}>
              <Button variant="outline" size="sm" className="text-xs">
                Inspect Dossier
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* DATE CONFLICT WARNING BANNER (When conflicting dates exist) */}
        {record.has_date_conflict && (
          <div className="mt-3.5 rounded-lg border border-orange-300 bg-orange-50/70 p-3 text-xs text-orange-900 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-[#d9531e] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Chronology Discrepancy Detected</p>
              <p className="mt-0.5 text-orange-800 leading-relaxed">
                {record.date_conflict_details ||
                  'Clinical event date disagrees with lab release stamp. Preserving both raw timestamps for manual audit.'}
              </p>
            </div>
          </div>
        )}

        {/* OCR UNCERTAINTY BANNER */}
        {record.verification_status === 'ocr_uncertain' && (
          <div className="mt-3.5 rounded-lg border border-amber-300 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <FileQuestion className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Handwritten Cursive Ambiguity</p>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                Prescription dosage stroke has uncertain confidence (54.0%). Clinical safety protocol prevents automated verification without physician or pharmacist confirmation.
              </p>
            </div>
          </div>
        )}

        {/* DISTINCT TIMESTAMPS FOOTER (Event Date vs Report Date vs Upload Timestamp) */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#0d5ca8]" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-600 block">Clinical Event Date</span>
              <span className="font-semibold text-slate-800">
                {record.clinical_event_date ? record.clinical_event_date : 'Unknown (Not Invented)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-600 block">Report Release Date</span>
              <span className="font-semibold text-slate-800">
                {record.report_date ? record.report_date : 'Unknown'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Upload className="h-3.5 w-3.5 text-slate-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-600 block">Dossier Ingested Timestamp</span>
              <span className="font-semibold text-slate-800">
                {new Date(record.upload_timestamp).toLocaleDateString()} {new Date(record.upload_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Provenance and Facility attribution */}
        <div className="mt-2.5 pt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-3">
            {record.provider && (
              <span className="flex items-center gap-1">
                <Building className="h-3 w-3 text-slate-400" />
                {record.provider.facility_name}
              </span>
            )}
            {record.source && (
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                Source: {record.source.name}
              </span>
            )}
          </div>

          {record.sha256_hash && (
            <div className="font-mono text-[10px] text-slate-400 truncate max-w-xs">
              SHA: {record.sha256_hash.slice(0, 16)}...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TimelinePage() {
  return (
    <Suspense fallback={<LoadingState message="Loading longitudinal health timeline..." />}>
      <TimelineContent />
    </Suspense>
  );
}
