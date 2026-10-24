import { NextResponse } from 'next/server';
import { executeAiQuery, getActorAuthorizedRecords } from '@/lib/ai/assistant-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, records, actor, consents, caregiver, emergencySessions } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    if (!actor) {
      return NextResponse.json({ error: 'Actor context is required' }, { status: 400 });
    }

    // Role-scoped authorization: AI can ONLY analyze records the actor is permitted to see
    const authorizedRecords = getActorAuthorizedRecords(
      records || [],
      actor,
      consents || [],
      caregiver,
      emergencySessions || []
    );

    const grokApiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
    const grokModel = process.env.GROK_MODEL || 'grok-2-mini';

    const result = await executeAiQuery(query, authorizedRecords, actor, {
      grokApiKey,
      model: grokModel,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Query Route Handler Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while evaluating clinical query' },
      { status: 500 }
    );
  }
}
