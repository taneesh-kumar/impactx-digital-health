'use client';

import React, { useState } from 'react';
import { useDemoContext } from '@/lib/state/demo-context';
import { User, Check, ShieldAlert, ChevronDown } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const DemoAccountSelector: React.FC = () => {
  const { currentProfile, setCurrentProfileId, allProfiles, resetAllData } = useDemoContext();
  const [isOpen, setIsOpen] = useState(false);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'patient':
        return 'Patient';
      case 'specialist':
        return 'Specialist Physician';
      case 'caregiver':
        return 'Caregiver / Proxy';
      case 'emergency_clinician':
        return 'Emergency Clinician (Break-Glass)';
      case 'auditor':
        return 'ABDM Compliance Auditor';
      default:
        return role;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-white text-xs transition-colors"
        aria-label="Switch synthetic demonstration identity"
      >
        <span className="h-5 w-5 rounded-full overflow-hidden bg-slate-600 flex items-center justify-center text-[10px] font-bold">
          {currentProfile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentProfile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <User className="h-3 w-3" />
          )}
        </span>
        <span className="font-medium">Demo: {getRoleLabel(currentProfile.role).split(' ')[0]}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-80" />
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Simulated Demonstration Identity Switcher"
        description="Select a synthetic persona to test role-specific workflows and authorization boundaries."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Demonstration Mode Notice</p>
              <p className="mt-0.5 text-amber-800">
                This selector operates purely on synthetic demonstration data. In a production ABDM environment, role
                authorization is governed by cryptographic Aadhaar / ABHA biometric authentication and signed OAuth 2.0 tokens.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {allProfiles.map((p) => {
              const isSelected = p.id === currentProfile.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setCurrentProfileId(p.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#0d5ca8] bg-blue-50/60 ring-1 ring-[#0d5ca8]'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200 border border-slate-300 flex-shrink-0">
                      {p.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-600">
                          {p.full_name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{p.full_name}</p>
                        <Badge
                          size="sm"
                          variant={
                            p.role === 'patient'
                              ? 'default'
                              : p.role === 'specialist'
                              ? 'info'
                              : p.role === 'caregiver'
                              ? 'success'
                              : p.role === 'emergency_clinician'
                              ? 'danger'
                              : 'neutral'
                          }
                        >
                          {getRoleLabel(p.role)}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{p.email}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0d5ca8] text-white">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all demonstration records, consents, duplicates, and audit logs to factory seed state?')) {
                  resetAllData();
                  setIsOpen(false);
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium hover:underline flex items-center gap-1"
            >
              Reset Prototype Data to Factory Seed
            </button>
            <Button variant="secondary" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};
