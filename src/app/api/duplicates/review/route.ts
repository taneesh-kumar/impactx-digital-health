import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { duplicateId, decision, reviewerId, notes } = body;

    if (!duplicateId || !decision) {
      return NextResponse.json({ success: false, error: 'Missing duplicateId or decision' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        duplicateId,
        decision,
        reviewerId,
        notes,
        reviewed_at: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to record decision' }, { status: 500 });
  }
}
