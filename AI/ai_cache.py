import time
import threading

class SimpleTTLCache:
    def __init__(self, ttl_seconds=60, maxsize=1000):
        self.ttl = ttl_seconds
        self.maxsize = maxsize
        self._data = {}  # key -> (value, expiry)
        self._lock = threading.Lock()

    def get(self, key):
        with self._lock:
            v = self._data.get(key)
            if not v:
                return None
            value, expiry = v
            if expiry < time.time():
                del self._data[key]
                return None
            return value

    def set(self, key, value):
        with self._lock:
            # prune if needed
            if len(self._data) >= self.maxsize:
                # remove expired first
                now = time.time()
                keys = list(self._data.keys())
                for k in keys:
                    if self._data[k][1] < now:
                        del self._data[k]
                # if still too big, pop arbitrary
                if len(self._data) >= self.maxsize:
                    try:
                        self._data.pop(next(iter(self._data)))
                    except StopIteration:
                        pass
            self._data[key] = (value, time.time() + self.ttl)

    def clear(self):
        with self._lock:
            self._data.clear()
