'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDemoContext } from '@/lib/state/demo-context';
import { DemoAccountSelector } from './DemoAccountSelector';
import { Breadcrumbs } from './Breadcrumbs';
import {
  Search,
  Menu,
  X,
  HeartHandshake,
  HelpCircle,
  Globe,
  Bell,
  Shield,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { counts, searchQuery, setSearchQuery } = useDemoContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'larger'>('normal');

  const navLinks = [
    { label: 'Overview', href: '/' },
    { label: 'Health Timeline', href: '/timeline' },
    { label: 'Documents', href: '/records' },
    {
      label: 'Duplicate & Conflict Review',
      href: '/duplicate-review',
      badge: counts.potentialDuplicatesCount > 0 ? counts.potentialDuplicatesCount : undefined,
      badgeColor: 'bg-amber-500',
    },
    {
      label: 'Share & Consent',
      href: '/share-consent',
      badge: counts.activeSharesCount > 0 ? counts.activeSharesCount : undefined,
      badgeColor: 'bg-blue-400',
    },
    { label: 'Visit Preparation', href: '/visit-prep' },
    { label: 'Emergency Access', href: '/emergency-access' },
    { label: 'Caregiver Access', href: '/caregiver-access' },
    {
      label: 'Corrections',
      href: '/corrections',
      badge: counts.needReviewCount > 0 ? counts.needReviewCount : undefined,
      badgeColor: 'bg-orange-500',
    },
    { label: 'AI Assistant', href: '/ai-assistant' },
    { label: 'Access History', href: '/access-history' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pathname !== '/timeline') {
      router.push(`/timeline?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className={`min-h-screen bg-[#f3f6fa] text-[#1c2833] flex flex-col ${fontSize === 'large' ? 'text-base' : fontSize === 'larger' ? 'text-lg' : 'text-sm'}`}>
      {/* 1. TOP UTILITY HEADER */}
      <header className="bg-[#061527] text-slate-300 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-[11px]">
            <a href="#main-content" className="hover:text-white transition-colors focus:ring-1 focus:ring-amber-400">
              Skip to main content
            </a>
            <span className="text-slate-600">|</span>
            <span className="hover:text-white cursor-pointer transition-colors">Screen Reader Access</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Font Size Adjuster */}
            <div className="hidden sm:flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400">
              <button
                onClick={() => setFontSize('normal')}
                className={`hover:text-white px-1 ${fontSize === 'normal' ? 'text-white underline' : ''}`}
                title="Default text size"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`hover:text-white px-1 ${fontSize === 'large' ? 'text-white underline' : ''}`}
                title="Larger text size"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('larger')}
                className={`hover:text-white px-1 ${fontSize === 'larger' ? 'text-white underline' : ''}`}
                title="Extra large text size"
              >
                A+
              </button>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white cursor-pointer">
              <Globe className="h-3 w-3" />
              <span>English</span>
              <span className="text-[10px]">▼</span>
            </div>

            {/* Support Link */}
            <Link href="/access-history" className="hidden md:flex items-center gap-1 hover:text-white text-[11px]">
              <HelpCircle className="h-3 w-3" />
              <span>Help & Support</span>
            </Link>

            {/* Simulated Demo Account Selector */}
            <DemoAccountSelector />
          </div>
        </div>
      </header>

      {/* 2. SWASTHYASETU BRANDING BAR */}
      <div className="bg-white border-b border-slate-200 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 focus:outline-none">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#0d5ca8] via-[#1e40af] to-[#d9531e] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <HeartHandshake className="h-6 w-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight text-[#0a1f38] leading-none">
                  SwasthyaSetu
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5 tracking-wide uppercase">
                  Patient-Controlled Health Records
                </div>
              </div>
            </Link>

            {/* Challenge Prototype Notice Badge */}
            <div className="hidden lg:block border-l border-slate-200 pl-4 ml-2">
              <div className="text-xs font-semibold text-slate-800">
                IMPACTX 2026 Challenge Prototype <span className="text-slate-400 font-normal">|</span> <span className="text-[#0d5ca8]">Synthetic Data</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Building a Safer, More Informed Digital Health Journey
              </div>
            </div>
          </div>

          {/* Global Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full md:w-96">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search records, providers, etc."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-l border border-slate-300 bg-white py-1.5 pl-3 pr-2 text-xs text-slate-800 focus:border-[#d9531e] focus:outline-none focus:ring-1 focus:ring-[#d9531e]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#d9531e] hover:bg-[#b84315] text-white px-3.5 py-1.5 rounded-r transition-colors flex items-center justify-center"
              aria-label="Submit Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* 3. NAVY PRIMARY NAVIGATION */}
      <nav className="bg-[#0a1f38] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11">
            {/* Desktop Navigation Links */}
            <div className="hidden xl:flex items-center space-x-1 h-full overflow-x-auto scrollbar-none">
              {navLinks.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-1.5 h-full px-3 text-xs font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-[#163459] text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-[#d9531e]'
                        : 'text-slate-200 hover:bg-[#163459]/60 hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full text-white ${item.badgeColor || 'bg-blue-500'}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile / Tablet View Current Route Indicator & Toggle */}
            <div className="flex xl:hidden items-center justify-between w-full">
              <span className="text-xs font-semibold text-slate-200">
                {navLinks.find((l) => (l.href === '/' ? pathname === '/' : pathname.startsWith(l.href)))?.label || 'Menu'}
              </span>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-800"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-700 bg-[#061527] px-4 py-3 space-y-1">
            {navLinks.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors ${
                    isActive ? 'bg-[#d9531e] text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-white/20 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* 4. MAIN CONTENT AREA */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs />
        {children}
      </main>

      {/* 5. GOVERNMENT-STYLE FOOTER */}
      <footer className="bg-[#0a1f38] border-t border-slate-800 text-slate-300 text-xs py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#163459] flex items-center justify-center text-white">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-white">SwasthyaSetu — Digital Health Architecture</p>
                <p className="text-[11px] text-slate-400">
                  Patient-Controlled Health Records | Built for IMPACTX 2026 Challenge | ABDM Ready
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-[11px] text-slate-400">
              <Link href="/access-history" className="hover:text-white transition-colors">
                Audit Trail
              </Link>
              <Link href="/share-consent" className="hover:text-white transition-colors">
                Consent Policies
              </Link>
              <Link href="/duplicate-review" className="hover:text-white transition-colors">
                Explainable Reconciliation
              </Link>
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                ● RLS Enforced
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
