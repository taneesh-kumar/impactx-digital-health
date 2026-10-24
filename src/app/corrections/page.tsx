'use client';

import React from 'react';
import { useDemoContext } from '@/lib/state/demo-context';
import { SEED_CORRECTIONS } from '@/lib/data/seed-data';
import { AlertCircle, Clock, CheckCircle2, History, Send } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

export default function CorrectionsPage() {
  const { records } = useDemoContext();

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0a1f38]">Clinical Corrections & Audit Tracking</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparently propose, review, and propagate clinical corrections across downstream health networks.
          </p>
        </div>
        <Button variant="gov-orange" size="sm">
          <Send className="h-4 w-4 mr-1.5" />
          Submit Correction Request
        </Button>
      </div>

      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Active Record Correction Requests ({SEED_CORRECTIONS.length})</h3>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Target Health Record</TableHead>
              <TableHead>Proposed Change</TableHead>
              <TableHead>Current / Recorded Value</TableHead>
              <TableHead>Patient Rationale</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Physician Review</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SEED_CORRECTIONS.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-semibold text-slate-900">{c.record_title}</TableCell>
                <TableCell className="text-xs text-[#0d5ca8] font-bold">{c.proposed_value}</TableCell>
                <TableCell className="text-xs text-slate-500 line-through">{c.previous_value}</TableCell>
                <TableCell className="text-xs text-slate-600 max-w-xs">{c.reason}</TableCell>
                <TableCell>
                  <Badge variant={c.status === 'in_review' ? 'warning' : 'success'} size="sm">
                    {c.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-xs text-slate-500">
                  {c.reviewer_notes || 'Pending phlebotomy log verification'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
