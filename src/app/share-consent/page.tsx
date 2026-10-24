'use client';

import React, { useState } from 'react';
import { useDemoContext } from '@/lib/state/demo-context';
import { Share2, Shield, Lock, Plus, CheckCircle2, Clock, Trash2, KeyRound } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Dialog } from '@/components/ui/Dialog';
import { Input, Select } from '@/components/ui/Input';

export default function ShareConsentPage() {
  const { consents, logAuditEvent, currentProfile } = useDemoContext();
  const [isGrantOpen, setIsGrantOpen] = useState(false);
  const [granteeName, setGranteeName] = useState('');
  const [scope, setScope] = useState('all_records');
  const [validDays, setValidDays] = useState('30');
  const [purpose, setPurpose] = useState('');

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0a1f38]">Consent Manager & ABDM Data Sharing</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Granular, time-bounded, purpose-specific consent grants backed by cryptographic receipts.
          </p>
        </div>
        <Button variant="gov-orange" size="sm" onClick={() => setIsGrantOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Create New Consent Grant
        </Button>
      </div>

      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Active Healthcare Provider Grants ({consents.length})</h3>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Authorized Entity</TableHead>
              <TableHead>Scope of Access</TableHead>
              <TableHead>Declared Purpose</TableHead>
              <TableHead>Validity Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Receipt & Revocation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consents.map((grant) => (
              <TableRow key={grant.id}>
                <TableCell>
                  <div className="font-semibold text-slate-900">{grant.grantee_name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{grant.grantee_type}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="default" size="sm">
                    {grant.scope.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-600 max-w-xs">{grant.purpose}</TableCell>
                <TableCell className="text-xs text-slate-700">
                  Till {new Date(grant.valid_until).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={grant.status === 'active' ? 'success' : 'neutral'} size="sm">
                    {grant.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-mono text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600">
                      CR-ABDM-TOKEN
                    </span>
                    <Button variant="outline" size="sm" className="text-xs text-red-600 hover:bg-red-50">
                      Revoke
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        isOpen={isGrantOpen}
        onClose={() => setIsGrantOpen(false)}
        title="Authorise New Health Data Consent Grant"
        description="Specify recipient, purpose and expiration for ABDM-compliant disclosure."
      >
        <div className="space-y-4">
          <Input
            label="Grantee Name (Physician or Facility)"
            placeholder="e.g. Dr. Ramesh Gupta (Max Hospital)"
            value={granteeName}
            onChange={(e) => setGranteeName(e.target.value)}
          />

          <Select
            label="Access Scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            options={[
              { value: 'all_records', label: 'All Health Records in Dossier' },
              { value: 'lab_results_only', label: 'Laboratory Diagnostic Reports Only' },
              { value: 'clinical_notes_only', label: 'Clinical Consultation Notes Only' },
              { value: 'emergency_only', label: 'Emergency Trauma Data Only' },
            ]}
          />

          <Input
            label="Valid Duration (Days)"
            type="number"
            value={validDays}
            onChange={(e) => setValidDays(e.target.value)}
          />

          <Input
            label="Clinical Purpose"
            placeholder="e.g. Cardiology Second Opinion Consultation"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />

          <div className="pt-3 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsGrantOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gov-orange"
              size="sm"
              onClick={() => {
                alert('Created consent grant and generated cryptographic ABDM audit token.');
                setIsGrantOpen(false);
              }}
            >
              Sign & Authorize Grant
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
