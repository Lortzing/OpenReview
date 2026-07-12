#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import quote

import requests

OUT = Path("data/prereview/probe")
OUT.mkdir(parents=True, exist_ok=True)
S = requests.Session()
S.headers.update({"Accept": "application/json", "User-Agent": "OpenReview-PREreview-probe/2.0"})


def fetch(name: str, url: str, params=None):
    r = S.get(url, params=params, timeout=60)
    payload = {"url": r.url, "status": r.status_code, "headers": dict(r.headers)}
    try:
        payload["json"] = r.json()
    except Exception:
        payload["text"] = r.text[:20000]
    (OUT / f"{name}.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(name, r.status_code, r.url)
    return payload

preprints = fetch("preprints", "https://prereview.org/api/v2/preprints", {"limit": 3})
items = (preprints.get("json") or {}).get("data") or []
if isinstance(items, list) and items:
    first = items[0]
    (OUT / "first_preprint.json").write_text(json.dumps(first, ensure_ascii=False, indent=2), encoding="utf-8")
    handle = first.get("handle") or first.get("uuid")
    if handle:
        encoded = quote(str(handle), safe="-._~")
        base = f"https://prereview.org/api/v2/preprints/{encoded}"
        fetch("preprint_single", base)
        for endpoint in ["rapid-reviews", "full-reviews", "structured-reviews", "reviews", "comments"]:
            fetch(endpoint.replace("-", "_"), f"{base}/{endpoint}")

fetch("zenodo_recent", "https://zenodo.org/api/records", {"communities": "prereview-reviews", "sort": "mostrecent", "size": 3, "page": 1})
