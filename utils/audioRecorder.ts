import { io, Socket } from "socket.io-client";

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private isRecording = false;

  private socket: Socket;
  private sessionId: string | null = null;
  private onResults: ((payload: any) => void) | null = null;

  // Accept an optional onResults callback to notify caller of upload ack and final results
  constructor(socketUrl: string, sessionId?: string, token?: string, onResults?: (payload: any) => void) {
    this.sessionId = sessionId || null;
    this.onResults = onResults || null;

    // Derive socket origin: callers may pass a full upload URL (e.g. '/upload-audio') or origin
    let origin = socketUrl;
    try {
      const u = new URL(socketUrl);
      origin = u.origin;
    } catch (e) {
      // if parse fails, fall back to window.location.origin when available
      if (typeof window !== 'undefined' && window.location) origin = window.location.origin;
    }

    // Connect to socket server
    this.socket = io(origin, {
      auth: {
        token, // optional JWT for auth
      },
      autoConnect: true,
    });

    // When connected, if no sessionId provided use the socket id
    this.socket.on("connect", () => {
      if (!this.sessionId) {
        this.sessionId = this.socket.id || null;
        console.log("AudioRecorder: using socket id as sessionId:", this.sessionId);
      } else {
        console.log("AudioRecorder: connected, sessionId (provided):", this.sessionId);
      }
    });

    // Listen for audio upload acknowledgement and final processing results
    this.socket.on("audio_response", (data) => {
      console.log("🎧 Server response:", data);
      if (this.onResults) this.onResults({ type: "ack", data });
    });

    this.socket.on("audio_results", (data) => {
      console.log("🧾 Audio processing results:", data);
      if (this.onResults) this.onResults({ type: "results", data });
    });
  }

  async startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.chunks = [];

    this.mediaRecorder.ondataavailable = (e) => this.chunks.push(e.data);

    this.mediaRecorder.onstop = async () => {
      if (this.chunks.length === 0) {
        console.warn("No audio captured!");
        return;
      }

      // Convert Blob -> Base64
      const blob = new Blob(this.chunks, { type: "audio/webm" });
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);

      // Save to localStorage (optional)
      localStorage.setItem("recordedAudio", base64);

      // Emit via Socket.IO. Prefer the socket id if sessionId not set yet.
      const sid = this.sessionId && this.sessionId.length > 0 ? this.sessionId : this.socket.id;
      this.socket.emit("client_request", {
        instruction: "AUDIO",
        session_id: sid,
        audio: base64
      });

      console.log("🎧 Audio sent via Socket.IO!");
      // Let caller know upload was triggered (UI can show processing state)
      if (this.onResults) this.onResults({ type: "sent", data: { session_id: sid } });
    };

    this.mediaRecorder.start();
    this.isRecording = true;
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.isRecording = false;
    } else {
      console.warn("Recording has not started yet!");
    }
  }

  playSavedAudio() {
    const base64 = localStorage.getItem("recordedAudio");
    if (!base64) {
      console.warn("No recording found!");
      return;
    }
    const src = `data:audio/webm;base64,${base64}`;
    new Audio(src).play();
  }
}
