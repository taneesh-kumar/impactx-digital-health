'use client';

import React, { useState } from 'react';
import { useDemoContext } from '@/lib/state/demo-context';
import {
  Shield,
  Clock,
  AlertTriangle,
  UserCheck,
  Key,
  FileText,
  Filter,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Search,
  Lock,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

export default function AccessHistoryPage() {
  const { auditEvents } = useDemoContext();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [searchActor, setSearchActor] = useState<string>('');

  const filteredEvents = auditEvents.filter((event) => {
    if (filterSeverity !== 'all' && event.severity !== filterSeverity) return false;
    if (searchActor) {
      const q = searchActor.toLowerCase();
      const roleMatch = event.actor_role.toLowerCase().includes(q);
      const actionMatch = event.action.toLowerCase().includes(q);
      const detailsMatch = JSON.stringify(event.details || {}).toLowerCase().includes(q);
      return roleMatch || actionMatch || detailsMatch;
    }
    return true;
  });

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
              Patient-Visible Access History & Append-Only Audit Trail
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete, transparent ledger of every access attempt, consent grant, caregiver action, and emergency break-glass event.
          </p>
        </div>
        <span className="font-mono text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded font-semibold flex items-center gap-1.5 self-start sm:self-auto">
          <Shield className="h-3.5 w-3.5 text-emerald-600" />
          Append-Only (Zero Deletes Permitted)
        </span>
      </div>

      {/* Privacy Notice */}
      <div className="rounded-lg bg-slate-100 border border-slate-200 p-3.5 text-xs text-slate-700 flex items-start gap-2.5">
        <Lock className="h-4 w-4 text-[#244783] flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900">Privacy-Safe Audit Policy:</span>
          <p className="text-slate-600 text-[11px]">
            To safeguard patient privacy, raw clinical diagnoses, medical records content, and access tokens are never logged in audit trails. Only cryptographic actor identifiers, timestamps, resource IDs, and access outcomes are preserved.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by actor role, action, or details..."
            value={searchActor}
            onChange={(e) => setSearchActor(e.target.value)}
            className="w-full rounded border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-[#244783] focus:outline-none"
          />
        </div>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="rounded border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:border-[#244783] focus:outline-none"
        >
          <option value="all">All Severities ({auditEvents.length})</option>
          <option value="info">Informational (Standard Reads & Grunts)</option>
          <option value="warning">Warnings (Revocations & Denied Access)</option>
          <option value="critical">Critical (Emergency Break-Glass)</option>
        </select>
      </div>

      {/* Audit Events Table */}
      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            Recorded Access & Governance Events ({filteredEvents.length})
          </h2>
          <span className="text-[11px] text-slate-400">
            Displaying chronological ingress ledger
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor & Role</TableHead>
              <TableHead>Action / Operation</TableHead>
              <TableHead>Resource Target</TableHead>
              <TableHead>Outcome & Context Details</TableHead>
              <TableHead className="text-right">Severity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.map((event) => {
              const detailsStr = event.details
                ? Object.entries(event.details)
                    .map(([k, v]) => `${k.replace('_', ' ')}: ${v}`)
                    .join(' • ')
                : '';

              return (
                <TableRow key={event.id}>
                  <TableCell className="font-mono text-xs text-slate-700 whitespace-nowrap">
                    <div className="font-medium text-slate-900">
                      {new Date(event.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(event.created_at).toLocaleTimeString('en-IN')}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="font-bold text-slate-900 capitalize block text-xs">
                      {event.actor_role.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      UID: {event.user_id ? `${event.user_id.slice(0, 8)}...` : 'System'}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-[11px] font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                      {event.action}
                    </span>
                  </TableCell>

                  <TableCell className="text-xs text-slate-700">
                    <span className="font-medium text-slate-800 block">
                      {event.resource_type.replace('_', ' ')}
                    </span>
                    {event.resource_id && (
                      <span className="text-[10px] font-mono text-slate-400">
                        {event.resource_id.slice(0, 14)}...
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-xs text-slate-600 max-w-sm">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {event.severity === 'critical' ? (
                        <ShieldAlert className="h-3.5 w-3.5 text-rose-600 flex-shrink-0" />
                      ) : event.severity === 'warning' ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                      )}
                      <span className="font-semibold text-slate-900">
                        {event.action.includes('deny') ? 'ACCESS DENIED' : 'VERIFIED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">
                      {detailsStr || 'Standard access verification'}
                    </p>
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
                      {event.severity.toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
