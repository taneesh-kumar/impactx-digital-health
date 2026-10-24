'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDemoContext } from '@/lib/state/demo-context';
import {
  FileText,
  Upload,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  FileQuestion,
  Search,
  ExternalLink,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { checkRecordAccess } from '@/lib/security/consent-guard';

export default function RecordsListPage() {
  const { records, currentProfile, consents, caregiver, emergencySessions } = useDemoContext();
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterQuery, setFilterQuery] = useState('');

  // 1. Enforce RBAC, Caregiver Delegation & Emergency Access Guard
  const authorizedRecords = records.filter((r) => {
    const access = checkRecordAccess(r, currentProfile, consents, caregiver, emergencySessions);
    return access.allowed;
  });

  const filtered = authorizedRecords.filter((r) => {
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.provider?.facility_name.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0a1f38]">Documents & Health Records</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete inventory of authenticated patient records, lab feeds, and diagnostic scans.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/records/upload">
            <Button variant="gov-orange" size="sm">
              <Upload className="h-4 w-4 mr-1.5" />
              Upload New Record
            </Button>
          </Link>
        </div>
      </div>

      {currentProfile.role === 'specialist' && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3.5 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#244783]">Specialist Consultation Scope:</span>
            <span>
              Viewing {authorizedRecords.length} of {records.length} records explicitly authorized by Rajesh Sharma under active consent grant.
            </span>
          </div>
          <Link href="/share-consent" className="font-bold text-[#244783] hover:underline whitespace-nowrap">
            View Grant & Receipt →
          </Link>
        </div>
      )}

      {currentProfile.role === 'caregiver' && (
        <div className="rounded-lg bg-purple-50 border border-purple-200 p-3.5 text-xs text-purple-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-purple-900">Caregiver Delegated Scope:</span>
            <span>
              Viewing {authorizedRecords.length} of {records.length} records in delegated categories (sensitive categories excluded).
            </span>
          </div>
          <Link href="/caregiver-access" className="font-bold text-purple-900 hover:underline whitespace-nowrap">
            Caregiver Proxy Details →
          </Link>
        </div>
      )}

      {currentProfile.role === 'emergency_clinician' && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-rose-950">Emergency Break-Glass View:</span>
            <span>
              {authorizedRecords.length > 0
                ? `Emergency session active. Viewing ${authorizedRecords.length} life-safety records.`
                : 'No active break-glass session. Please invoke emergency session to access trauma records.'}
            </span>
          </div>
          <Link href="/emergency-access" className="font-bold text-rose-900 hover:underline whitespace-nowrap">
            Emergency Console →
          </Link>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search records by title, doctor, facility..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full rounded border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-[#0d5ca8] focus:outline-none"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-[#0d5ca8] focus:outline-none"
        >
          <option value="all">All Categories ({records.length})</option>
          <option value="lab_result">Lab Results</option>
          <option value="prescription">Prescriptions</option>
          <option value="radiology">Radiology</option>
          <option value="clinical_note">Clinical Notes</option>
          <option value="discharge_summary">Discharge Summaries</option>
          <option value="vital_sign">Vital Signs</option>
          <option value="vaccination">Vaccinations</option>
        </select>
      </div>

      {/* Table of Records */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Record Title & Category</TableHead>
            <TableHead>Clinical Date</TableHead>
            <TableHead>Source & Facility</TableHead>
            <TableHead>Verification Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                <Link href={`/records/${record.id}`} className="font-semibold text-slate-900 hover:text-[#0d5ca8] block">
                  {record.title}
                </Link>
                <span className="text-[11px] text-slate-500 capitalize">{record.category.replace('_', ' ')}</span>
              </TableCell>

              <TableCell>
                <div className="text-xs font-medium text-slate-800">
                  {record.clinical_event_date || <span className="text-slate-400 italic">Unknown</span>}
                </div>
                <div className="text-[10px] text-slate-400">
                  Ingested: {new Date(record.upload_timestamp).toLocaleDateString()}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-xs font-medium text-slate-800">{record.provider?.facility_name || 'Self-Uploaded'}</div>
                <div className="text-[10px] text-slate-500">{record.source?.name}</div>
              </TableCell>

              <TableCell>
                <Badge
                  size="sm"
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
                    ? 'Date Conflict'
                    : record.verification_status === 'ocr_uncertain'
                    ? 'OCR Ambiguity'
                    : record.verification_status}
                </Badge>
              </TableCell>

              <TableCell className="font-mono text-xs text-slate-600">
                {record.extraction_method.replace('_', ' ')}
              </TableCell>

              <TableCell className="text-right">
                <Link href={`/records/${record.id}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    View Dossier
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
