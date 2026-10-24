'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const routeNameMap: Record<string, string> = {
  'timeline': 'Health Timeline',
  'records': 'Documents & Records',
  'upload': 'Upload Document',
  'duplicate-review': 'Duplicate & Conflict Review',
  'share-consent': 'Share & Consent',
  'visit-prep': 'Visit Preparation',
  'emergency-access': 'Emergency Access',
  'caregiver-access': 'Caregiver Access',
  'corrections': 'Clinical Corrections',
  'ai-assistant': 'AI Health Assistant',
  'access-history': 'Access & Audit History',
};

export const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();

  if (pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-1.5 text-xs text-slate-500">
        <li>
          <Link href="/" className="flex items-center text-slate-600 hover:text-[#0d5ca8] transition-colors">
            <Home className="h-3.5 w-3.5 mr-1" />
            <span>Home</span>
          </Link>
        </li>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const isLast = index === segments.length - 1;
          const label = routeNameMap[segment] || segment.replace(/-/g, ' ');

          return (
            <li key={href} className="flex items-center space-x-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              {isLast ? (
                <span className="font-semibold text-slate-800 capitalize" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link href={href} className="text-slate-600 hover:text-[#0d5ca8] capitalize transition-colors">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
