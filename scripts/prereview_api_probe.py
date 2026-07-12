#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

import requests

OUT = Path("data/prereview/probe")
OUT.mkdir(parents=True, exist_ok=True)
S = requests.Session()
S.headers.update({"Accept": "application/json", "User-Agent": "OpenReview-PREreview-probe/2.1"})


def fetch(name: str, url: str, params=None):
    r = S.get(url, params=params, timeout=60)
    payload = {"url": r.url, "status": r.status_code, "headers": dict(r.headers)}
    try:
        payload["json"] = r.json()
    except Exception:
        payload["text"] = r.text[:50000]
    (OUT / f"{name}.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(name, r.status_code, r.url)
    return payload

fetch("preprints", "https://prereview.org/api/v2/preprints", {"limit": 3})
fetch("zenodo_recent", "https://zenodo.org/api/records", {"communities": "prereview-reviews", "sort": "mostrecent", "size": 3, "page": 1})
fetch("legacy_response_6524963", "https://zenodo.org/api/records/6524963")
fetch("legacy_title_search", "https://zenodo.org/api/records", {
    "communities": "prereview-reviews",
    "q": 'metadata.title:"A robust receptive field code for optic flow detection and decomposition during self-motion"',
    "size": 25,
})
