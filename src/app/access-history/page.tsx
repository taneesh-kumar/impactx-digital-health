'use client';

import React from 'react';
import { useDemoContext } from '@/lib/state/demo-context';
import { Shield, Clock, AlertTriangle, UserCheck, Key, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

export default function AccessHistoryPage() {
  const { auditEvents } = useDemoContext();

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0a1f38]">Access History & Immutable Audit Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically sealed timeline of every doctor consultation, break-glass event, and consent authorization.
          </p>
        </div>
        <span className="font-mono text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded font-semibold flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-emerald-600" />
          ABDM Compliance Enforced
        </span>
      </div>

      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Recorded Ingress & Read Events ({auditEvents.length})</h3>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor & Role</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target Resource</TableHead>
              <TableHead>IP Address & Terminal</TableHead>
              <TableHead className="text-right">Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-mono text-xs text-slate-700">
                  {new Date(event.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-slate-900 capitalize block">{event.actor_role.replace('_', ' ')}</span>
                  <span className="text-[10px] text-slate-400 font-mono">UID: {event.user_id?.slice(0, 8)}...</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    {event.action}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-slate-700">
                  {event.resource_type}
                </TableCell>
                <TableCell className="text-xs text-slate-500 font-mono">
                  {event.ip_address || '127.0.0.1'}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    size="sm"
                    variant={
                      event.severity === 'critical'
                        ? 'danger'
                        : event.severity === 'warning'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {event.severity}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
