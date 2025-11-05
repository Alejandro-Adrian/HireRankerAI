import React, { useEffect, useRef, useState } from 'react';

// Audio capture component: records audio in 30s chunks via MediaRecorder,
// sends each chunk to a web worker which uploads to the server endpoint /upload_audio_chunk
// After ~5 minutes the component stops recording and asks the server to merge chunks.

type Props = {
    autoStart?: boolean; // start on mount
    username?: string; // session username; if not provided we'll fetch from localStorage 'username' or 'authUser'
}

export default function AudioCapture({ autoStart = false, username }: Props) {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const workerRef = useRef<Worker | null>(null);
    const chunkSeq = useRef<number>(0);
    const [recording, setRecording] = useState(false);
    const mergeTimerRef = useRef<number | null>(null);

    const getUsername = () => {
        if (username) return username;
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('authUser') || localStorage.getItem('username') || 'anonymous');
        }
        return 'anonymous';
    };

    const [uploadStatus, setUploadStatus] = useState<Record<number, string>>({});
    const [mergeStatus, setMergeStatus] = useState<string | null>(null);

    useEffect(() => {
        // create worker from public path
        if (typeof window !== 'undefined') {
            try {
                workerRef.current = new Worker('/audioWorker.js');
                workerRef.current.onmessage = (ev) => {
                    // handle ack from worker
                    const msg = ev.data;
                    console.log('[audioWorker]', msg);
                    if (msg?.action === 'uploaded') {
                        setUploadStatus((prev) => ({ ...(prev || {}), [msg.seq]: msg.ok ? 'uploaded' : 'failed' }));
                    } else if (msg?.action === 'merged') {
                        setMergeStatus(msg.ok ? 'merged' : 'merge_failed');
                    } else if (msg?.action === 'error') {
                        setMergeStatus('worker_error');
                    }
                };
            } catch (e) {
                console.error('Failed to create audio worker:', e);
            }
        }

        if (autoStart) startRecording();

        return () => {
            stopRecording();
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, []);

    const startRecording = async () => {
        if (recording) return;
        try {
            const s = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = s;
            const options: MediaRecorderOptions = { mimeType: 'audio/webm' };
            const mr = new MediaRecorder(s, options);
            mediaRecorderRef.current = mr;

            mr.ondataavailable = (ev: BlobEvent) => {
                if (ev.data && ev.data.size > 0) {
                    const seq = ++chunkSeq.current;
                    // send chunk to worker for upload
                    if (workerRef.current) {
                        // send transferable ArrayBuffer to worker (ArrayBuffer is transferable).
                        // The worker will reconstruct a Blob from the buffer and content type.
                        ev.data.arrayBuffer().then((buf) => {
                            const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
                            const mimeType = (ev.data && ev.data.type) || 'audio/webm';
                            // Determine API base. Allow override via localStorage 'apiBase' for multi-origin setups.
                            const apiBase = (typeof window !== 'undefined' && (localStorage.getItem('apiBase') || window.location.origin)) || '';
                            // Post the raw buffer as transferable to avoid DataCloneError. Include apiBase so the worker can reach the backend when origins differ.
                            workerRef.current!.postMessage({ action: 'upload_chunk', username: getUsername(), seq, token, buffer: buf, mimeType, apiBase }, [buf]);
                            setUploadStatus((prev) => ({ ...(prev || {}), [seq]: 'pending' }));
                        });
                    }
                }
            };

            mr.onstart = () => {
                console.log('MediaRecorder started');
                setRecording(true);
            };
            mr.onstop = () => {
                console.log('MediaRecorder stopped');
                setRecording(false);
            };

            // Start and request data every 30s
            mr.start(30_000);

            // Schedule automatic stop + merge after ~5 minutes (300000 ms)
            if (mergeTimerRef.current) {
                window.clearTimeout(mergeTimerRef.current);
            }
            mergeTimerRef.current = window.setTimeout(() => {
                // stop recorder and request merge
                stopRecording(true);
            }, 5 * 60 * 1000);
        } catch (e) {
            console.error('Error starting audio capture:', e);
        }
    };

    const stopRecording = (requestMerge = false) => {
        try {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            }
        } catch (e) {
            console.warn('stopRecording error', e);
        }
        setRecording(false);
        if (mergeTimerRef.current) {
            window.clearTimeout(mergeTimerRef.current);
            mergeTimerRef.current = null;
        }
            if (requestMerge && workerRef.current) {
                const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
                const apiBase = (typeof window !== 'undefined' && (localStorage.getItem('apiBase') || window.location.origin)) || '';
                setMergeStatus('requested');
                workerRef.current.postMessage({ action: 'merge', username: getUsername(), token, apiBase });
        }
    };

    return (
        <div>
            <h2>Audio Capture</h2>
            <p>Recording: {recording ? 'ON' : 'OFF'}</p>
                    <div className="flex gap-2">
                <button onClick={() => startRecording()} disabled={recording} className="px-3 py-1 bg-green-500 text-white rounded">Start</button>
                <button onClick={() => stopRecording(true)} disabled={!recording} className="px-3 py-1 bg-red-500 text-white rounded">Stop & Merge</button>
            </div>
                    <p className="mt-2 text-sm text-gray-600">Chunks are uploaded every 30s; the component auto-stops and requests merge after ~5 minutes.</p>
                    <div className="mt-2 text-sm">
                        <div>Merge status: {mergeStatus ?? 'idle'}</div>
                        <div className="mt-1">Uploads:</div>
                        <ul className="text-xs">
                            {Object.entries(uploadStatus).map(([k, v]) => (
                                <li key={k}>Chunk {k}: {v}</li>
                            ))}
                        </ul>
                    </div>
        </div>
    );
}