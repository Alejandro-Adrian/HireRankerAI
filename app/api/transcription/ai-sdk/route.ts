import { transcribe } from 'ai';
import { deepgram } from '@ai-sdk/deepgram';
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

    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('[v0] AI SDK - Received audio blob, size:', buffer.length);

    try {
      const result = await transcribe({
        model: deepgram('nova-2'),
        audio: buffer,
        mimeType: 'audio/webm',
      });

      console.log('[v0] AI SDK - Transcription result:', result);

      // Extract transcripts - split by sentences or use as single transcript
      const transcripts = result.text
        ? result.text.split(/[.!?]+/).filter((sent: string) => sent.trim().length > 0)
            .map((sent: string) => sent.trim())
        : [];

      console.log('[v0] AI SDK - Extracted transcripts:', transcripts);

      return NextResponse.json({ transcripts });
    } catch (transcribeError) {
      console.error('[v0] AI SDK transcribe error:', transcribeError);
      // Return friendly error message
      throw new Error('AI SDK transcription failed');
    }
  } catch (error) {
    console.error('[v0] AI SDK error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Transcription failed' },
      { status: 500 }
    );
  }
}
