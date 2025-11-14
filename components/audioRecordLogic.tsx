import React, { useRef, useState } from 'react';
import { AudioRecorder } from '../utils/audioRecorder';

export default function AudioCapture() {
    const recorderRef = useRef<AudioRecorder | null>(null);
    const [transcriptiontext, setTranscriptionText] = useState<string>("No transcription Yet....");
    const [AISummaryText, setAISummaryText] = useState<string>("No Summary Yet......");
    const [processing, setProcessing] = useState<boolean>(false);
    // separate flags for pipeline stages
    const [transcribing, setTranscribing] = useState<boolean>(false);
    const [summarizing, setSummarizing] = useState<boolean>(false);

    const getApiBase = () => {
        if (typeof window === 'undefined') return 'http://localhost:5000';
        const stored = localStorage.getItem('apiBase');
        if (stored) return stored.replace(/\/$/, '');
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return 'http://localhost:5000';
        return window.location.origin;
    };

    function start() {
    if (!recorderRef.current) {
        const apiBase = getApiBase();
        const token = localStorage.getItem('authToken') || undefined;
        // pass a callback to receive processing events
        recorderRef.current = new AudioRecorder(
        apiBase,
        undefined,
        token,
        (payload) => {
            // payload: { type: 'ack'|'results'|'sent', data }
            if (payload.type === 'sent') {
                // we've sent audio to the server; begin both phases
                setProcessing(true);
                setTranscribing(true);
                setSummarizing(true);
            } else if (payload.type === 'ack') {
                // server acknowledged save; continue showing processing
                setProcessing(true);
            } else if (payload.type === 'results') {
                const d = payload.data || {};
                // If server returns transcription and/or summary separately, update each flag independently
                if (d.transcription) {
                    setTranscriptionText(d.transcription);
                    setTranscribing(false);
                }
                if (d.summary) {
                    setAISummaryText(d.summary);
                    setSummarizing(false);
                }
                // If both stages finished, clear global processing
                if ((d.transcription || !transcribing) && (d.summary || !summarizing)) {
                    // small guard: if either field is missing but flags were already false, consider done
                    setProcessing(false);
                }
            }
        }
        );
    }
    recorderRef.current.startRecording();
    }

    function stop() {
    recorderRef.current?.stopRecording();
    // show processing until results arrive
    setProcessing(true);
    }

    function play() {
    recorderRef.current?.playSavedAudio();
    }

    return (
    <div>
        <button onClick={start}>🎙️ Record</button>
        <button onClick={stop}>🛑 Stop & Send</button>
        <button onClick={play}>▶️ Play</button>
    <h1>Transcription</h1>
    <p>{transcribing ? 'Transcribing...' : transcriptiontext}</p>
    <h1>AI Summary</h1>
    <p>{summarizing ? 'Generating summary...' : AISummaryText}</p>
    </div>
    );
}
