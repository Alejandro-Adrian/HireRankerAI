import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const body = await request.json();
    const { sessionId, results } = body;

    if (!sessionId || !results) {
      return NextResponse.json(
        { error: 'Missing sessionId or results' },
        { status: 400 }
      );
    }

    const resultPromises = results.map((result: any) =>
      supabase.from('transcription_results').insert({
        session_id: sessionId,
        transcript_text: result.text,
        is_final: result.isFinal,
        confidence: result.confidence,
      })
    );

    await Promise.all(resultPromises);

    await supabase
      .from('transcription_sessions')
      .update({
        transcript_count: results.filter((r: any) => r.isFinal).length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    return NextResponse.json({ success: true, savedCount: results.length });
  } catch (error) {
    console.error('[v0] Save transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to save transcription' },
      { status: 500 }
    );
  }
}
