import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateText } from 'ai'
import { xai } from '@ai-sdk/xai'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createClient()

    console.log('[v0] Starting summary generation for session:', id)

    const { data: sessionData, error: sessionError } = await supabase
      .from('video_sessions')
      .select('summary')
      .eq('id', id)
      .single()

    if (sessionError) {
      console.error('[v0] Error fetching session:', sessionError)
      return NextResponse.json(
        { error: 'Session not found', details: sessionError.message },
        { status: 404 }
      )
    }

    const existingSummary = sessionData?.summary

    // Get all recordings for this session
    const { data: recordings, error: recordingsError } = await supabase
      .from('video_session_recordings')
      .select('*')
      .eq('session_id', id)
      .order('created_at', { ascending: true })

    if (recordingsError) {
      console.error('[v0] Error fetching recordings:', recordingsError)
      return NextResponse.json(
        { error: 'Failed to fetch recordings' },
        { status: 500 }
      )
    }

    console.log(`[v0] Found ${recordings?.length || 0} recordings`)

    if (!recordings || recordings.length === 0) {
      return NextResponse.json(
        { error: 'No recordings found for this session' },
        { status: 404 }
      )
    }

    const conversationText = recordings
      .filter((r) => r.transcript && r.transcript.trim())
      .map((r) => {
        const speaker = r.participant_role === 'host' ? 'Host' : r.participant_name || 'Participant'
        return `${speaker}: ${r.transcript}`
      })
      .join('\n\n')

    console.log('[v0] Combined conversation text length:', conversationText.length)

    if (!conversationText) {
      console.error('[v0] No transcripts available to summarize')
      return NextResponse.json(
        { error: 'No transcripts available to summarize' },
        { status: 400 }
      )
    }

    const prompt = existingSummary 
      ? `You are an AI assistant that updates meeting summaries as new information becomes available.

You previously created this summary:
${existingSummary}

Now, a new participant has completed their recording. Here is the COMPLETE conversation including all participants:
${conversationText}

Please provide an UPDATED summary that incorporates all available information. Include:
1. **Main Topics Discussed**: All key subjects covered
2. **Key Points**: Important insights from all participants
3. **Action Items**: Any tasks or follow-ups mentioned
4. **Overall Assessment**: Brief evaluation of the full conversation

Keep the summary concise but comprehensive (3-5 paragraphs).`
      : `You are an AI assistant that summarizes interview and meeting conversations. 

Please analyze the following conversation transcript and provide a comprehensive summary that includes:

1. **Main Topics Discussed**: Key subjects and themes covered
2. **Key Points**: Important information, decisions, or insights shared
3. **Action Items**: Any tasks, follow-ups, or next steps mentioned
4. **Overall Assessment**: Brief evaluation of the conversation

Keep the summary concise but informative (3-5 paragraphs).

Conversation Transcript:
${conversationText}`

    console.log(`[v0] ${existingSummary ? 'Updating existing' : 'Creating new'} summary for session:`, id)
    console.log('[v0] Conversation length:', conversationText.length, 'characters')

    const { text: summary } = await generateText({
      model: xai("grok-4", {
        apiKey: process.env.XAI_API_KEY,
      }),
      prompt,
      maxTokens: 1500,
      temperature: 0.6,
    })

    console.log('[v0] Summary generated successfully, length:', summary.length)
    console.log('[v0] Summary preview:', summary.substring(0, 200) + '...')

    // Update the video session with the summary
    const { error: updateError } = await supabase
      .from('video_sessions')
      .update({ 
        summary,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('[v0] Error updating session with summary:', updateError)
      return NextResponse.json(
        { error: 'Failed to save summary' },
        { status: 500 }
      )
    }

    console.log('[v0] Summary saved to database successfully')

    return NextResponse.json({ 
      success: true,
      summary, 
      isUpdate: !!existingSummary,
      recordingsCount: recordings.length
    })
  } catch (error) {
    console.error('[v0] Error generating summary:', error)
    console.error('[v0] Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Failed to generate summary', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
