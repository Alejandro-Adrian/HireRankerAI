'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DeepgramTestPage() {
  const [activeTab, setActiveTab] = useState('mock');

  const tabs = [
    { id: 'mock', label: '🧪 Mock Test' },
    { id: 'websocket', label: '1. WebSocket Direct' },
    { id: 'rest-api', label: '2. REST API (Batch)' },
    { id: 'deepgram-sdk', label: '3. Deepgram SDK' },
    { id: 'assembly-ai', label: '4. AssemblyAI' },
    { id: 'google-speech', label: '5. Google Speech' },
    { id: 'azure-speech', label: '6. Azure Speech' },
    { id: 'aws-transcribe', label: '7. AWS Transcribe' },
    { id: 'web-audio', label: '8. Web Audio API' },
    { id: 'manual-input', label: '9. Manual Text Input' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Transcription Testing Suite</h1>
          <p className="text-slate-400">Testing multiple implementation approaches for reliable audio-to-text</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto mb-6">
            <TabsList className="inline-flex bg-slate-800 border border-slate-700 rounded-lg p-1 gap-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-sm whitespace-nowrap"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Mock Test Tab - START HERE */}
          <TabsContent value="mock">
            <MockTestImplementation />
          </TabsContent>

          {/* Tab 1: WebSocket Direct */}
          <TabsContent value="websocket">
            <WebSocketImplementation />
          </TabsContent>

          {/* Tab 2: REST API (Batch) */}
          <TabsContent value="rest-api">
            <RestApiImplementation />
          </TabsContent>

          {/* Tab 3: Deepgram SDK */}
          <TabsContent value="deepgram-sdk">
            <DeepgramSdkImplementation />
          </TabsContent>

          {/* Tab 4: AssemblyAI */}
          <TabsContent value="assembly-ai">
            <AssemblyAiImplementation />
          </TabsContent>

          {/* Tab 5: Google Speech */}
          <TabsContent value="google-speech">
            <GoogleSpeechImplementation />
          </TabsContent>

          {/* Tab 6: Azure Speech */}
          <TabsContent value="azure-speech">
            <AzureSpeechImplementation />
          </TabsContent>

          {/* Tab 7: AWS Transcribe */}
          <TabsContent value="aws-transcribe">
            <AwsTranscribeImplementation />
          </TabsContent>

          {/* Tab 8: Web Audio API */}
          <TabsContent value="web-audio">
            <WebAudioImplementation />
          </TabsContent>

          {/* Tab 9: Manual Text Input */}
          <TabsContent value="manual-input">
            <ManualInputImplementation />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// 🧪 MOCK TEST - START HERE TO VERIFY DATABASE WORKS
function MockTestImplementation() {
  const [results, setResults] = useState<string[]>([]);
  const [status, setStatus] = useState('Ready to test');
  const sessionIdRef = useRef<string | null>(null);

  const handleMockRecord = useCallback(async () => {
    try {
      setStatus('Creating session...');
      
      // Create session
      const sessionRes = await fetch('/api/transcription/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const sessionData = await sessionRes.json();
      sessionIdRef.current = sessionData.sessionId;
      console.log('[v0] Mock Test - Session created:', sessionIdRef.current);

      setStatus('Saving mock transcription results...');
      
      // Mock transcription data
      const mockResults = [
        { text: 'Hello, this is a test recording.', isFinal: true, confidence: 0.98 },
        { text: 'The database storage is working properly.', isFinal: true, confidence: 0.99 },
        { text: 'We can now use this to debug other implementations.', isFinal: true, confidence: 0.97 },
      ];

      // Save to database
      const saveRes = await fetch('/api/transcription/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          results: mockResults,
        }),
      });

      const saveData = await saveRes.json();
      console.log('[v0] Mock Test - Save response:', saveData);

      if (saveData.success) {
        setResults(mockResults.map(r => r.text));
        setStatus('✅ Mock test successful! Check Supabase to verify data was stored.');
      } else {
        setStatus('❌ Failed to save mock results');
      }
    } catch (err) {
      console.error('[v0] Mock test error:', err);
      setStatus('❌ Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, []);

  return (
    <>
      <Card className="bg-yellow-900/20 border-yellow-700/50 mb-8">
        <div className="p-6">
          <h2 className="text-lg font-bold text-yellow-300 mb-2">🧪 Mock Test - START HERE</h2>
          <p className="text-yellow-200 text-sm mb-4">
            This tab tests that your database storage works at all. It creates a mock transcription session and saves dummy results. If this doesn't work, the problem is database connectivity, not audio capture.
          </p>
          <Button
            onClick={handleMockRecord}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Run Mock Test
          </Button>
        </div>
      </Card>

      <Card className="bg-slate-800 border-slate-700 mb-8">
        <div className="p-6">
          <h3 className="text-white font-semibold mb-3">Status: {status}</h3>
          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-slate-300 text-sm mb-3">Mock results:</p>
              {results.map((text, idx) => (
                <div key={idx} className="bg-slate-700 rounded p-3 border-l-2 border-yellow-500">
                  <p className="text-white text-sm">{text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded text-blue-300 text-sm">
        <p className="font-semibold mb-1">🔍 How to verify:</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Click "Run Mock Test"</li>
          <li>Check browser console for session ID and save response</li>
          <li>Go to Supabase dashboard → transcription_results table</li>
          <li>Look for 3 new rows with the mock text</li>
          <li>If they're there, database storage works! If not, you have a database connectivity issue.</li>
        </ol>
      </div>
    </>
  );
}

// 1. WEBSOCKET DIRECT
function WebSocketImplementation() {
  return (
    <ComingSoonTab
      name="WebSocket Direct"
      description="Real-time WebSocket connection directly to Deepgram API"
      requiredEnv={['DEEPGRAM_API_KEY']}
      status="Needs debugging - not capturing data"
    />
  );
}

// 2. REST API BATCH
function RestApiImplementation() {
  const [isRecording, setIsRecording] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [status, setStatus] = useState('Ready');
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const handleToggle = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      setIsRecording(false);
      setStatus('Processing audio...');

      // Send audio blob to API
      if (audioChunksRef.current.length > 0 && sessionIdRef.current) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob);
          formData.append('sessionId', sessionIdRef.current);

          const res = await fetch('/api/transcription/rest-api', {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();
          console.log('[v0] REST API - Response:', data);

          if (data.transcripts && Array.isArray(data.transcripts)) {
            setResults(data.transcripts);
            setStatus('✅ Transcription complete');

            // Save to database
            const saveRes = await fetch('/api/transcription/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: sessionIdRef.current,
                results: data.transcripts.map((text: string) => ({
                  text,
                  isFinal: true,
                })),
              }),
            });

            const saveData = await saveRes.json();
            console.log('[v0] REST API - Save response:', saveData);
          } else {
            setStatus('❌ No transcription returned');
          }
        } catch (err) {
          console.error('[v0] REST API error:', err);
          setStatus('❌ Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
      }
    } else {
      // Start recording
      try {
        setStatus('Requesting microphone...');
        audioChunksRef.current = [];
        setResults([]);
        setRecordingTime(0);

        // Create session
        const sessionRes = await fetch('/api/transcription/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const sessionData = await sessionRes.json();
        sessionIdRef.current = sessionData.sessionId;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.addEventListener('dataavailable', (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        });

        mediaRecorder.start(250);
        setIsRecording(true);
        setStatus('🎤 Recording...');

        let seconds = 0;
        timerRef.current = setInterval(() => {
          seconds++;
          setRecordingTime(seconds);
        }, 1000);
      } catch (err) {
        console.error('[v0] Recording error:', err);
        setStatus('❌ Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    }
  }, [isRecording]);

  return (
    <RecordingUI
      tabName="REST API (Batch)"
      isRecording={isRecording}
      recordingTime={recordingTime}
      status={status}
      results={results}
      onToggle={handleToggle}
      onClear={() => {
        setResults([]);
        setStatus('Ready');
      }}
      description="Send complete audio file to Deepgram API after recording stops"
      requiredEnv={['DEEPGRAM_API_KEY']}
    />
  );
}

// 3. DEEPGRAM SDK
function DeepgramSdkImplementation() {
  return (
    <ComingSoonTab
      name="Deepgram SDK"
      description="Using @deepgram/sdk package for more reliable transcription"
      requiredEnv={['DEEPGRAM_API_KEY']}
      status="Ready to implement"
    />
  );
}

// 4. ASSEMBLYAI
function AssemblyAiImplementation() {
  return (
    <ComingSoonTab
      name="AssemblyAI"
      description="Alternative transcription service with high accuracy"
      requiredEnv={['ASSEMBLYAI_API_KEY']}
      status="Ready to implement"
    />
  );
}

// 5. GOOGLE SPEECH
function GoogleSpeechImplementation() {
  return (
    <ComingSoonTab
      name="Google Cloud Speech-to-Text"
      description="Google's speech recognition API"
      requiredEnv={['GOOGLE_CLOUD_PROJECT_ID', 'GOOGLE_CLOUD_PRIVATE_KEY']}
      status="Ready to implement"
    />
  );
}

// 6. AZURE SPEECH
function AzureSpeechImplementation() {
  return (
    <ComingSoonTab
      name="Azure Speech Services"
      description="Microsoft Azure speech recognition"
      requiredEnv={['AZURE_SPEECH_KEY', 'AZURE_SPEECH_REGION']}
      status="Ready to implement"
    />
  );
}

// 7. AWS TRANSCRIBE
function AwsTranscribeImplementation() {
  return (
    <ComingSoonTab
      name="AWS Transcribe"
      description="Amazon transcription service"
      requiredEnv={['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION']}
      status="Ready to implement"
    />
  );
}

// 8. WEB AUDIO API
function WebAudioImplementation() {
  return (
    <ComingSoonTab
      name="Web Audio API + Local Processing"
      description="Process audio locally in the browser"
      requiredEnv={['DEEPGRAM_API_KEY']}
      status="Ready to implement"
    />
  );
}

// 9. MANUAL INPUT
function ManualInputImplementation() {
  const [text, setText] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [status, setStatus] = useState('Ready');
  const sessionIdRef = useRef<string | null>(null);

  const handleSave = useCallback(async () => {
    if (!text.trim()) {
      setStatus('Please enter some text');
      return;
    }

    try {
      setStatus('Creating session...');

      // Create session if needed
      if (!sessionIdRef.current) {
        const sessionRes = await fetch('/api/transcription/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const sessionData = await sessionRes.json();
        sessionIdRef.current = sessionData.sessionId;
      }

      setStatus('Saving to database...');

      // Save to database
      const saveRes = await fetch('/api/transcription/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          results: [{ text: text.trim(), isFinal: true }],
        }),
      });

      const saveData = await saveRes.json();
      console.log('[v0] Manual Input - Save response:', saveData);

      if (saveData.success) {
        setResults([text.trim()]);
        setStatus('✅ Saved to database');
        setText('');
      } else {
        setStatus('❌ Failed to save');
      }
    } catch (err) {
      console.error('[v0] Manual input error:', err);
      setStatus('❌ Error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [text]);

  return (
    <>
      <Card className="bg-slate-800 border-slate-700 mb-8">
        <div className="p-6">
          <h3 className="text-white font-semibold mb-4">Manual Text Input</h3>
          <p className="text-slate-400 text-sm mb-4">For testing database storage without audio capture</p>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text here..."
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 mb-4 h-32"
          />

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Save to Database
            </Button>
            <Button
              onClick={() => {
                setText('');
                setResults([]);
                setStatus('Ready');
              }}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              Clear
            </Button>
          </div>

          <p className="text-slate-400 text-sm mt-4">Status: {status}</p>

          {results.length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-slate-300 text-sm font-semibold">Saved results:</p>
              {results.map((result, idx) => (
                <div key={idx} className="bg-emerald-900/20 rounded p-3 border-l-2 border-emerald-500">
                  <p className="text-white text-sm">{result}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded text-blue-300 text-sm">
        <p className="font-semibold mb-1">💡 Use this to test:</p>
        <p>Verify that the database storage mechanism works independently of audio capture.</p>
      </div>
    </>
  );
}

// Shared Components
function ComingSoonTab({
  name,
  description,
  requiredEnv,
  status,
}: {
  name: string;
  description: string;
  requiredEnv: string[];
  status: string;
}) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <div className="p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-3">{name}</h3>
        <p className="text-slate-400 mb-6">{description}</p>
        
        <div className="bg-slate-700/50 rounded p-4 mb-6 text-left max-w-md mx-auto">
          <p className="text-slate-300 text-sm font-semibold mb-2">Required Environment Variables:</p>
          <ul className="space-y-1">
            {requiredEnv.map((env) => (
              <li key={env} className="text-slate-400 text-xs font-mono bg-slate-900 px-2 py-1 rounded">
                {env}
              </li>
            ))}
          </ul>
        </div>

        <div className="inline-block px-4 py-2 bg-slate-700 rounded text-slate-300 text-sm">
          Status: {status}
        </div>
      </div>
    </Card>
  );
}

function RecordingUI({
  tabName,
  isRecording,
  recordingTime,
  status,
  results,
  onToggle,
  onClear,
  description,
  requiredEnv,
}: {
  tabName: string;
  isRecording: boolean;
  recordingTime: number;
  status: string;
  results: string[];
  onToggle: () => void;
  onClear: () => void;
  description: string;
  requiredEnv: string[];
}) {
  return (
    <>
      <Card className="bg-slate-800 border-slate-700 mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
              <h2 className="text-lg font-semibold text-white">{status}</h2>
            </div>
            {isRecording && (
              <div className="text-sm text-slate-400 font-mono">
                {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onToggle}
              disabled={isRecording}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Start Recording
            </Button>
            <Button
              onClick={onToggle}
              disabled={!isRecording}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Stop Recording
            </Button>
            <Button
              onClick={onClear}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {results.length > 0 && (
        <Card className="bg-slate-800 border-emerald-700/50 mb-8">
          <div className="p-6">
            <h3 className="text-white font-semibold mb-4">Transcription Results ({results.length})</h3>
            <div className="space-y-2">
              {results.map((text, idx) => (
                <div key={idx} className="bg-emerald-900/20 rounded p-3 border-l-2 border-emerald-500">
                  <p className="text-white text-sm">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="p-4 bg-blue-500/10 border border-blue-500/50 rounded text-blue-300 text-sm">
        <p className="font-semibold mb-2">{tabName}</p>
        <p className="mb-2">{description}</p>
        <p className="text-xs mb-2">Required env vars: {requiredEnv.join(', ')}</p>
        <p className="text-xs">Check console logs for debug information and Supabase table for stored results.</p>
      </div>
    </>
  );
}
