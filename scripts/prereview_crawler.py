#!/usr/bin/env python3
"""Collect 200 PREreview paper/review rows in the shared CSV format."""
from __future__ import annotations

import argparse, csv, html, json, logging, re, sys, time
from collections import OrderedDict
from pathlib import Path
from typing import Any
from urllib.parse import quote

import requests
from bs4 import BeautifulSoup

COLUMNS = ["DOI", "PaperTitle", "Authors", "Source", "Venue", "Year", "PeerReview", "Field"]
DOI_RE = re.compile(r"10\.\d{4,9}/[-._;()/:A-Z0-9]+", re.I)
ZENODO_RE = re.compile(r"10\.5281/zenodo\.\d+", re.I)


def text(value: Any) -> str:
    if value is None:
        return ""
    value = BeautifulSoup(str(value), "html.parser").get_text("\n")
    lines = [re.sub(r"\s+", " ", html.unescape(x)).strip() for x in value.splitlines()]
    return "\n".join(x for x in lines if x)


def doi(value: Any) -> str:
    if not value:
        return ""
    value = re.sub(r"^https?://(?:dx\.)?doi\.org/", "", str(value), flags=re.I)
    value = re.sub(r"^doi:\s*", "", value, flags=re.I)
    match = DOI_RE.search(html.unescape(value))
    return match.group(0).rstrip(".,;:)]}>").lower() if match else ""


def names(items: Any) -> list[str]:
    out: list[str] = []
    for item in items if isinstance(items, list) else []:
        if isinstance(item, str):
            name = item.strip()
        else:
            person = item.get("person_or_org") if isinstance(item, dict) else None
            if isinstance(person, dict):
                name = person.get("name") or " ".join(filter(None, [person.get("given_name"), person.get("family_name")]))
            else:
                name = " ".join(filter(None, [item.get("given"), item.get("family")])) if isinstance(item, dict) else ""
                name = name or (item.get("name") if isinstance(item, dict) else "")
        if name and name not in out:
            out.append(name)
    return out


def year_from_crossref(msg: dict) -> str:
    for key in ("published-print", "published-online", "issued", "created", "posted"):
        parts = ((msg.get(key) or {}).get("date-parts") or [[]])[0]
        if parts and re.fullmatch(r"\d{4}", str(parts[0])):
            return str(parts[0])
    return ""


def relation(item: dict) -> str:
    value = item.get("relation") or item.get("relation_type") or ""
    return str(value.get("id") or value.get("title") or "").lower() if isinstance(value, dict) else str(value).lower()


def preprint_doi(record: dict) -> str:
    md = record.get("metadata") or {}
    found: list[tuple[int, str]] = []
    for item in md.get("related_identifiers") or record.get("related_identifiers") or []:
        if not isinstance(item, dict):
            continue
        candidate = doi(item.get("identifier") or item.get("id") or item.get("value"))
        if candidate and not ZENODO_RE.fullmatch(candidate):
            rel = relation(item)
            found.append((0 if any(x in rel for x in ("review", "supplement", "describ")) else 1, candidate))
    blob = json.dumps({"description": md.get("description"), "references": md.get("references"), "links": record.get("links")})
    for candidate in DOI_RE.findall(html.unescape(blob)):
        candidate = doi(candidate)
        if candidate and not ZENODO_RE.fullmatch(candidate):
            found.append((2, candidate))
    return sorted(found)[0][1] if found else ""


def review_doi(record: dict) -> str:
    md, pids = record.get("metadata") or {}, record.get("pids") or {}
    for value in ((pids.get("doi") or {}).get("identifier"), md.get("doi"), record.get("doi")):
        candidate = doi(value)
        if candidate:
            return candidate
    rid = str(record.get("id") or "")
    return f"10.5281/zenodo.{rid}" if rid.isdigit() else rid


def review_text(record: dict) -> str:
    md = record.get("metadata") or {}
    parts = [text(md.get("description")), text(md.get("notes"))]
    return "\n\n".join(dict.fromkeys(x for x in parts if x))


def infer_venue(preprint: str, record: dict, fallback: str) -> str:
    blob = json.dumps({"metadata": record.get("metadata"), "links": record.get("links")}).lower()
    for needle, label in [("medrxiv", "medRxiv"), ("biorxiv", "bioRxiv"), ("arxiv", "arXiv"),
                          ("chemrxiv", "ChemRxiv"), ("preprints.org", "Preprints.org"),
                          ("researchsquare", "Research Square"), ("osf.io", "OSF Preprints"),
                          ("psyarxiv", "PsyArXiv"), ("socarxiv", "SocArXiv")]:
        if needle in blob:
            return label
    if preprint.startswith("10.48550/"): return "arXiv"
    if preprint.startswith("10.26434/"): return "ChemRxiv"
    if preprint.startswith("10.20944/"): return "Preprints.org"
    return fallback or "PREreview"


class Collector:
    def __init__(self, delay: float = .08):
        self.delay = delay
        self.s = requests.Session()
        self.s.headers.update({"Accept": "application/json", "User-Agent": "OpenReview-PREreview-sampler/1.0"})
        self.cache: dict[str, dict | None] = {}

    def get(self, url: str, params: dict | None = None, retries: int = 4) -> Any:
        error = None
        for attempt in range(retries):
            try:
                r = self.s.get(url, params=params, timeout=40)
                if r.status_code == 429:
                    time.sleep(min(30, 2 ** attempt)); continue
                r.raise_for_status(); return r.json()
            except Exception as exc:
                error = exc; time.sleep(1 + attempt)
        raise RuntimeError(f"GET failed: {url}: {error}")

    def zenodo(self, max_pages: int):
        for page in range(1, max_pages + 1):
            payload = self.get("https://zenodo.org/api/records", {"communities": "prereview-reviews", "sort": "mostrecent", "size": 25, "page": page})
            hits = payload.get("hits", {}).get("hits", []) if isinstance(payload, dict) else payload
            if not hits and isinstance(payload, dict): hits = payload.get("data", [])
            logging.info("Zenodo page %d: %d records", page, len(hits))
            if not hits: break
            yield from hits
            if len(hits) < 25: break

    def metadata(self, preprint: str) -> dict | None:
        if preprint in self.cache: return self.cache[preprint]
        result: dict[str, Any] = {}
        try:
            msg = self.get("https://api.crossref.org/works/" + quote(preprint, safe=""), retries=3).get("message", {})
            titles = msg.get("title") or []
            result = {"title": text(titles[0] if isinstance(titles, list) and titles else titles),
                      "authors": names(msg.get("author")), "year": year_from_crossref(msg),
                      "source": ((msg.get("container-title") or [""])[0] if isinstance(msg.get("container-title"), list) else msg.get("container-title")) or msg.get("publisher") or ""}
        except Exception: pass
        if not result.get("title") or not result.get("authors") or not result.get("year"):
            try:
                oa = self.get("https://api.openalex.org/works/https://doi.org/" + quote(preprint, safe=""), retries=3)
                alt = {"title": text(oa.get("title") or oa.get("display_name")),
                       "authors": [a.get("author", {}).get("display_name") for a in oa.get("authorships", []) if a.get("author", {}).get("display_name")],
                       "year": str(oa.get("publication_year") or ""),
                       "source": ((oa.get("primary_location") or {}).get("source") or {}).get("display_name") or ""}
                for key, value in alt.items():
                    if not result.get(key): result[key] = value
            except Exception: pass
        self.cache[preprint] = result or None
        time.sleep(self.delay)
        return self.cache[preprint]

    def collect(self, limit: int, max_pages: int) -> tuple[list[dict], dict]:
        papers: OrderedDict[str, dict] = OrderedDict()
        stats = {"seen": 0, "no_preprint_doi": 0, "no_review_text": 0, "metadata_failed": 0, "metadata_incomplete": 0}
        for rec in self.zenodo(max_pages):
            stats["seen"] += 1
            pd, rt = preprint_doi(rec), review_text(rec)
            if not pd: stats["no_preprint_doi"] += 1; continue
            if not rt: stats["no_review_text"] += 1; continue
            rid = review_doi(rec) or str(rec.get("id") or "PREreview")
            if pd not in papers:
                md = self.metadata(pd)
                if not md: stats["metadata_failed"] += 1; continue
                if not md.get("title") or not md.get("authors") or not re.fullmatch(r"\d{4}", str(md.get("year") or "")):
                    stats["metadata_incomplete"] += 1; continue
                papers[pd] = {"doi": pd, "title": md["title"], "authors": md["authors"], "year": str(md["year"]),
                              "venue": infer_venue(pd, rec, str(md.get("source") or "")), "comments": []}
            if rid not in {x["Reviewer_ID"] for x in papers[pd]["comments"]}:
                papers[pd]["comments"].append({"Reviewer_ID": rid, "Comment": rt})
            if len(papers) >= limit: break
        return list(papers.values())[:limit], stats


def save(records: list[dict], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS); w.writeheader()
        for p in records:
            peer = [{"Round": 1, "Comments": p["comments"], "Response": []}]
            w.writerow({"DOI": p["doi"], "PaperTitle": p["title"], "Authors": json.dumps(p["authors"], ensure_ascii=False),
                        "Source": "PREreview", "Venue": p["venue"], "Year": p["year"],
                        "PeerReview": json.dumps(peer, ensure_ascii=False), "Field": ""})


def validate(path: Path, expected: int) -> list[str]:
    with path.open(encoding="utf-8-sig", newline="") as f: rows = list(csv.DictReader(f))
    issues = [] if len(rows) == expected else [f"rows={len(rows)}, expected={expected}"]
    for n, row in enumerate(rows, 2):
        if any(not row[k].strip() for k in ("PaperTitle", "Authors", "Source", "Venue", "Year", "PeerReview")): issues.append(f"row {n}: missing required value")
        try:
            a, r = json.loads(row["Authors"]), json.loads(row["PeerReview"])
            if not a or not r or r[0].get("Round") != 1 or not r[0].get("Comments") or not isinstance(r[0].get("Response"), list): issues.append(f"row {n}: invalid JSON shape")
        except Exception as exc: issues.append(f"row {n}: JSON error {exc}")
    return issues


def main() -> None:
    ap = argparse.ArgumentParser(); ap.add_argument("--limit", type=int, default=200); ap.add_argument("--max-pages", type=int, default=100)
    ap.add_argument("--output", default="data/prereview/prereview_final_200.csv"); ap.add_argument("--stats", default="data/prereview/prereview_collection_stats.json")
    args = ap.parse_args(); logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    records, stats = Collector().collect(args.limit, args.max_pages); out = Path(args.output); save(records, out); issues = validate(out, args.limit)
    report = {"platform": "PREreview", "requested": args.limit, "written": len(records), "collection": stats, "validation_issues": issues}
    sp = Path(args.stats); sp.parent.mkdir(parents=True, exist_ok=True); sp.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2)); sys.exit(2 if issues else 0)

if __name__ == "__main__": main()
