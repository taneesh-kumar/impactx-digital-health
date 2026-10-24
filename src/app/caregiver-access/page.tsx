'use client';

import React from 'react';
import { useDemoContext } from '@/lib/state/demo-context';
import { Users, ShieldCheck, CheckCircle2, Calendar, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function CaregiverAccessPage() {
  const { caregiver } = useDemoContext();

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0a1f38]">Caregiver Access & Proxy Delegations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Designate trusted family members or legal guardians with granular record viewing and emergency rights.
          </p>
        </div>
        <Button variant="gov-orange" size="sm">
          <UserPlus className="h-4 w-4 mr-1.5" />
          Add Caregiver Proxy
        </Button>
      </div>

      <div className="rounded-xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Current Authorized Healthcare Proxy</h3>

        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={caregiver.caregiver_profile?.avatar_url} alt="" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{caregiver.caregiver_profile?.full_name}</span>
                <Badge variant="success" size="sm">Active Proxy</Badge>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{caregiver.relationship}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">{caregiver.caregiver_profile?.phone}</p>
            </div>
          </div>

          <div className="space-y-1 text-right text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Granted Permissions</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {caregiver.permissions.map((p) => (
                <span key={p} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px] text-slate-700">
                  {p.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
