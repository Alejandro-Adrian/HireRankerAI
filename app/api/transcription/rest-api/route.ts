import { DEEPGRAM_API_KEY } from '@/lib/constants';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
      method: 'POST',
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/webm',
      },
      body: arrayBuffer,
    });

    const data = await response.json();
    console.log('[v0] Deepgram REST response:', data);

    const transcripts: string[] = [];
    
    if (data.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.paragraphs) {
      data.results.channels[0].alternatives[0].paragraphs.paragraphs.forEach((para: any) => {
        if (para.sentences) {
          para.sentences.forEach((sentence: any) => {
            if (sentence.text) {
              transcripts.push(sentence.text);
            }
          });
        }
      });
    } else if (data.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
      // Fallback: if no paragraphs, use full transcript
      transcripts.push(data.results.channels[0].alternatives[0].transcript);
    }

    return NextResponse.json({ success: true, transcripts });
  } catch (error) {
    console.error('[v0] REST API error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
