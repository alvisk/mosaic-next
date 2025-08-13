from __future__ import annotations

import os
import time
from typing import List, Dict, Any
import requests
from datetime import datetime, timedelta

API_KEY = os.environ.get("MEMORIES_API_KEY")  # set this in your env
UPLOAD_API = "https://api.memories.ai"
BACKEND_API = "https://mavi-backend.memories.ai"

# Rate limiting configuration
RATE_LIMIT_CALLS = 80  # Conservative: 80 calls per minute
RATE_LIMIT_WINDOW = 60  # 60 seconds
RATE_LIMIT_DELAY = RATE_LIMIT_WINDOW / RATE_LIMIT_CALLS  # ~0.75 seconds between calls

class RateLimiter:
    def __init__(self, max_calls: int = RATE_LIMIT_CALLS, window_seconds: int = RATE_LIMIT_WINDOW):
        self.max_calls = max_calls
        self.window_seconds = window_seconds
        self.calls = []
    
    def wait_if_needed(self):
        now = time.time()
        # Remove calls older than the window
        self.calls = [call_time for call_time in self.calls if now - call_time < self.window_seconds]
        
        if len(self.calls) >= self.max_calls:
            # Wait until we can make another call
            sleep_time = self.window_seconds - (now - self.calls[0])
            if sleep_time > 0:
                print(f"Rate limit reached. Waiting {sleep_time:.1f}s...")
                time.sleep(sleep_time)
        
        self.calls.append(time.time())

# Global rate limiter
rate_limiter = RateLimiter()

def rate_limited_request(method, url, **kwargs):
    """Make a rate-limited HTTP request"""
    rate_limiter.wait_if_needed()
    return requests.request(method, url, **kwargs)

def upload_by_url(video_url: str, unique_id: str, callback: str | None = None) -> str:
    headers = {"Authorization": API_KEY}
    data = {"url": video_url, "unique_id": unique_id}
    if callback:
        data["callback"] = callback
    r = rate_limited_request("POST", f"{UPLOAD_API}/serve/api/v1/upload_url", data=data, headers=headers, timeout=60)
    r.raise_for_status()
    resp = r.json()
    if resp.get("code") != "0000":
        raise RuntimeError(f"Upload failed: {resp}")
    return resp["data"]["videoNo"]

def wait_until_parsed_optimized(video_no: str, poll_secs: int = 15, timeout_secs: int = 1800):
    """
    Optimized version that reduces API calls and implements proper rate limiting.
    - Uses longer polling intervals (15s instead of 5s)
    - Only checks first page initially, expands search if needed
    - Implements exponential backoff for polling
    """
    start = time.time()
    headers = {"Authorization": API_KEY}
    page_size = 100  # Larger page size
    current_poll_secs = poll_secs
    max_poll_secs = 60  # Cap polling interval at 60 seconds
    
    def elapsed():
        return f"{int(time.time() - start)}s"

    while True:
        try:
            # Start with just the first page
            r = rate_limited_request(
                "GET",
                f"{BACKEND_API}/api/serve/video/searchDB",
                params={"pageNo": 1, "pageSize": page_size},
                headers=headers,
                timeout=30,
            )
            r.raise_for_status()
            payload = r.json() or {}
            data = (payload.get("data") or {})
            items = (data.get("videoData") or [])
            
            # Check if we found our video
            found_status = None
            for it in items:
                if it.get("videoNo") == video_no:
                    found_status = it.get("videoStatus")
                    break
            
            # If not found on first page and we have more pages, search deeper
            if found_status is None and len(items) == page_size:
                print(f"[{elapsed()}] Video not found on first page, searching deeper...")
                # Search up to 3 more pages maximum
                for page_no in range(2, 5):
                    r = rate_limited_request(
                        "GET",
                        f"{BACKEND_API}/api/serve/video/searchDB",
                        params={"pageNo": page_no, "pageSize": page_size},
                        headers=headers,
                        timeout=30,
                    )
                    r.raise_for_status()
                    payload = r.json() or {}
                    data = (payload.get("data") or {})
                    items = (data.get("videoData") or [])
                    
                    if not items:
                        break
                    
                    for it in items:
                        if it.get("videoNo") == video_no:
                            found_status = it.get("videoStatus")
                            break
                    
                    if found_status is not None:
                        break

            if found_status == "PARSE":
                print(f"[{elapsed()}] parsed!!")
                return
            if found_status == "FAIL":
                raise RuntimeError("Video processing failed (status=FAIL).")
            if time.time() - start > timeout_secs:
                raise TimeoutError(f"Timed out waiting for parsing after {elapsed()}.")

            # Try the search endpoint as a fallback (but less frequently)
            if int(time.time() - start) % 60 < 15:  # Only try every ~60 seconds
                try:
                    test = rate_limited_request(
                        "POST",
                        f"{BACKEND_API}/api/serve/video/searchVideoFragment",
                        json={"videoNos": [video_no], "searchValue": "test"},
                        headers=headers,
                        timeout=30,
                    )
                    if test.ok and (test.json() or {}).get("data"):
                        print(f"[{elapsed()}] search succeeded despite status lag; proceeding.")
                        return
                except requests.RequestException:
                    pass

            print(f"[{elapsed()}] status={found_status or 'NOT_FOUND_YET'}; retrying in {current_poll_secs}s…")
            time.sleep(current_poll_secs)
            
            # Implement exponential backoff for polling
            current_poll_secs = min(current_poll_secs * 1.2, max_poll_secs)

        except requests.RequestException as e:
            print(f"[{elapsed()}] polling error (will retry): {e}")
            time.sleep(current_poll_secs)

def wait_until_queryable_optimized(video_no: str, poll_secs: int = 20, timeout_secs: int = 1800):
    """
    Optimized version with longer polling intervals and rate limiting.
    """
    start = time.time()
    payload = {"videoNos": [video_no], "searchValue": "test-probe"}
    headers = {"Authorization": API_KEY}
    current_poll_secs = poll_secs
    max_poll_secs = 60

    while True:
        r = post_json_with_retries_optimized(
            "https://mavi-backend.memories.ai/api/serve/video/searchVideoFragment",
            payload, headers, timeout=30, max_retries=3, base_delay=2
        )
        ready = False
        try:
            j = r.json()
            msg = (j or {}).get("msg", "").lower()
            ready = ("unparse" not in msg) and ("not ready" not in msg) and ("processing" not in msg)
        except ValueError:
            pass

        if ready:
            print(f"[{int(time.time()-start)}s] parsed!!")
            return

        if time.time() - start > timeout_secs:
            raise TimeoutError(f"Timed out waiting for parsing after {int(time.time()-start)}s.")
        elapsed = int(time.time() - start)
        print(f"[{elapsed}s] not ready; retrying in {current_poll_secs}s…")
        time.sleep(current_poll_secs)
        
        # Exponential backoff
        current_poll_secs = min(current_poll_secs * 1.2, max_poll_secs)

def _headers():
    if not API_KEY or API_KEY == "PASTE_YOUR_API_KEY_HERE":
        raise RuntimeError("Set MEMORIES_API_KEY env var or paste your API key into API_KEY.")
    return {"Authorization": API_KEY}

def find_scene(video_no: str, query: str, max_results: int = 1):
    url = "https://mavi-backend.memories.ai/api/serve/video/searchVideoFragment"
    headers = {"Authorization": API_KEY}
    payload = {"videoNos": [video_no], "searchValue": query}

    r = post_json_with_retries_optimized(url, payload, headers, timeout=60, max_retries=6, base_delay=2)

    try:
        j = r.json()
    except ValueError:
        print(f"Non-JSON response: {r.text}")
        return []

    # Handle rate-limit or error formats gracefully
    if not isinstance(j, dict) or "data" not in j or not isinstance(j["data"], dict):
        print(f"Unexpected API response format: {j}")
        return []

    videos = j["data"].get("videos") or []
    if not isinstance(videos, list):
        print(f"'videos' is not a list: {videos}")
        return []

    results = []
    for v in videos[:max_results]:
        try:
            start_s = float(v.get("fragmentStartTime"))
            end_s = float(v.get("fragmentEndTime"))
        except (TypeError, ValueError):
            continue
        results.append({
            "videoNo": v.get("videoNo"),
            "videoName": v.get("videoName"),
            "start": start_s,
            "end": end_s,
            "duration": float(v["duration"]) if v.get("duration") is not None else None,
        })
    return results

def post_json_with_retries_optimized(url, payload, headers, timeout=60, max_retries=6, base_delay=2):
    delay = base_delay
    for attempt in range(max_retries):
        r = rate_limited_request("POST", url, json=payload, headers=headers, timeout=timeout)
        # If not rate-limited and not a 5xx, return immediately
        if r.status_code != 429 and r.status_code < 500:
            return r
        # Respect Retry-After if present, otherwise back off exponentially
        retry_after = r.headers.get("Retry-After")
        sleep_s = int(retry_after) if (retry_after and retry_after.isdigit()) else delay
        print(f"Rate limited (attempt {attempt + 1}/{max_retries}). Waiting {sleep_s}s...")
        time.sleep(sleep_s)
        delay = min(delay * 2, 60)
    # last attempt result
    r.raise_for_status()
    return r

if __name__ == "__main__":
    # --- configure these ---
    VIDEO_URL = "https://sample-videos.com/video321/mp4/240/big_buck_bunny_240p_5mb.mp4"
    UNIQUE_ID = "demo-user-1"
    QUERY = "white rabbit smells flowers"
    # -----------------------

    assert API_KEY, "Set MEMORIES_API_KEY in your environment"

    print("Uploading…")
    video_no = upload_by_url(VIDEO_URL, UNIQUE_ID)
    print("VideoNo:", video_no)

    print("Waiting for parsing (this can take a bit)…")
    # Use the optimized version
    wait_until_parsed_optimized(video_no, poll_secs=15, timeout_secs=1800)
    # Alternative: wait_until_queryable_optimized(video_no, poll_secs=20, timeout_secs=1800)

    print(f"Searching for scene: {QUERY!r}")
    scenes = find_scene(video_no, QUERY, max_results=1)
    if not scenes:
        print("No scene found.")
    else:
        for i, s in enumerate(scenes, 1):
            print(f"[{i}] {s['videoName']} — {s['start']:.2f}s → {s['end']:.2f}s  (VideoNo={s['videoNo']})")