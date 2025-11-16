import { neon } from '@neondatabase/serverless';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get('audio') as Blob;
    const sessionId = formData.get('sessionId') as string;

    if (!audioBlob) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convert blob to base64 for Deepgram API
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('[v0] Vercel Template - Received audio blob, size:', buffer.length);

    // Call Deepgram API directly (Vercel template approach)
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      throw new Error('DEEPGRAM_API_KEY not configured');
    }

    const deepgramRes = await fetch('https://api.deepgram.com/v1/listen?model=nova-2', {
      method: 'POST',
      headers: {
        'Content-Type': 'audio/webm',
        'Authorization': `Token ${apiKey}`,
      },
      body: buffer,
    });

    if (!deepgramRes.ok) {
      throw new Error(`Deepgram API error: ${deepgramRes.status}`);
    }

    const deepgramData = await deepgramRes.json() as any;
    console.log('[v0] Vercel Template - Deepgram response:', deepgramData);

    // Extract transcripts
    const transcripts: string[] = [];
    if (deepgramData.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.paragraphs) {
      const paragraphs = deepgramData.results.channels[0].alternatives[0].paragraphs.paragraphs;
      paragraphs.forEach((para: any) => {
        if (para.sentences) {
          para.sentences.forEach((sent: any) => {
            if (sent.text) {
              transcripts.push(sent.text);
            }
          });
        }
      });
    } else if (deepgramData.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
      transcripts.push(deepgramData.results.channels[0].alternatives[0].transcript);
    }

    console.log('[v0] Vercel Template - Extracted transcripts:', transcripts);

    return NextResponse.json({ transcripts });
  } catch (error) {
    console.error('[v0] Vercel Template error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Transcription failed' },
      { status: 500 }
    );
  }
}
