// audioWorker.js
// Receives messages from main thread to upload audio chunks and request merge.

self.addEventListener('message', async (ev) => {
  const msg = ev.data;
    try {
    if (msg && msg.action === 'upload_chunk') {
      const { username, seq, token, apiBase } = msg;
      // Support either a Blob (legacy) or a transferred ArrayBuffer + mimeType
      let blob = null;
      if (msg.blob) {
        blob = msg.blob;
      } else if (msg.buffer) {
        const mime = msg.mimeType || 'audio/webm';
        // msg.buffer is an ArrayBuffer (transferable) — rebuild a Blob from it
        blob = new Blob([msg.buffer], { type: mime });
      }
      const form = new FormData();
      // include username for debugging/compat but server will validate via token
      if (username) form.append('username', username);
      // Give the browser's blob a filename
      form.append('audio', blob, `chunk-${Date.now()}.webm`);
      // construct upload URL using provided apiBase if present; otherwise use relative path
      const uploadUrl = (apiBase && typeof apiBase === 'string') ? (apiBase.replace(/\/$/, '') + '/upload_audio_chunk') : '/upload_audio_chunk';

      // simple retry: 2 attempts
      let attempts = 0;
      const maxAttempts = 2;
      while (attempts < maxAttempts) {
        attempts += 1;
        try {
          const headers = {};
          if (token) headers['Authorization'] = 'Bearer ' + token;
          const res = await fetch(uploadUrl, { method: 'POST', body: form, headers });
          // try to get JSON, but also capture text for debugging
          let data = null;
          try { data = await res.json(); } catch(e) { try { data = await res.text(); } catch(e2) { data = null; } }
          if (!res.ok) {
            // if not ok and we have retries left, delay then retry
            const errTxt = typeof data === 'string' ? data : JSON.stringify(data);
            if (attempts < maxAttempts) {
              // small backoff
              await new Promise(r => setTimeout(r, 300 * attempts));
              continue;
            }
            self.postMessage({ action: 'uploaded', seq, ok: false, status: res.status, statusText: res.statusText, data, attempts });
          } else {
            self.postMessage({ action: 'uploaded', seq, ok: true, status: res.status, data });
          }
          break;
        } catch (err) {
          // on network errors retry once
          if (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 300 * attempts));
            continue;
          }
          self.postMessage({ action: 'uploaded', seq, ok: false, error: String(err), attempts });
        }
      }
    } else if (msg && msg.action === 'merge') {
      const { username, token, apiBase } = msg;
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        const mergeUrl = (apiBase && typeof apiBase === 'string') ? (apiBase.replace(/\/$/, '') + '/merge_audio') : '/merge_audio';
        const res = await fetch(mergeUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ username })
        });
        let data = null;
        try { data = await res.json(); } catch(e) { try { data = await res.text(); } catch(e2) { data = null; } }
        if (!res.ok) {
          self.postMessage({ action: 'merged', ok: false, status: res.status, statusText: res.statusText, data });
        } else {
          self.postMessage({ action: 'merged', ok: true, status: res.status, data });
        }
      } catch (err) {
        self.postMessage({ action: 'merged', ok: false, error: String(err) });
      }
    }
  } catch (e) {
    self.postMessage({ action: 'error', error: String(e) });
  }
});
