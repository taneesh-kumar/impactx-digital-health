import { NextRequest, NextResponse } from 'next/server';
import { SEED_RECORDS, SEED_PROFILES, SEED_CONSENTS } from '@/lib/data/seed-data';
import { checkRecordAccess } from '@/lib/security/consent-guard';

export async function GET(request: NextRequest) {
  const role = request.headers.get('x-demo-role') || 'patient';
  const profileId = request.headers.get('x-demo-profile-id');

  const actor = SEED_PROFILES.find((p) => p.id === profileId || p.role === role) || SEED_PROFILES[0];

  // Enforce server-side consent authorization
  const authorized = SEED_RECORDS.filter((r) => {
    const check = checkRecordAccess(r, actor, SEED_CONSENTS);
    return check.allowed;
  });

  return NextResponse.json({
    success: true,
    data: authorized,
    count: authorized.length,
    authenticated_actor: {
      id: actor.id,
      role: actor.role,
      name: actor.full_name,
    },
  });
}
