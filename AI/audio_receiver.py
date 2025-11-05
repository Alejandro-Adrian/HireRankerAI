import asyncio
import websockets
import numpy as np
from transcriber import Transcriber

class AudioReceiver:
    def __init__(self, host="0.0.0.0", port=8001):
        self.host = host
        self.port = port
        self.transcriber = Transcriber(model_size="small", device="cuda", compute_type="int8")

    async def handler(self, websocket):
        print("[AudioReceiver] Client connected.")
        async for message in websocket:
            audio_np = np.frombuffer(message, dtype=np.int16).astype(np.float32) / 32768.0
            text = self.transcriber.transcribe_chunk(audio_np)
            await websocket.send(text)

    async def run(self):
        print(f"[AudioReceiver] Listening on ws://{self.host}:{self.port}")
        async with websockets.serve(self.handler, self.host, self.port):
            await asyncio.Future()
