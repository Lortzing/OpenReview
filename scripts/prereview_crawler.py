#!/usr/bin/env python3
"""Collect a strict, version-aware 200-paper PREreview sample.

The public PREreview v2 API documented on the legacy developer page is no
longer available (it currently returns HTTP 404). This collector therefore
uses the official "Reviews on PREreview" Zenodo community as the authoritative
review source. A paper/review association is accepted only when Zenodo
provides an explicit related_identifier with relation=reviews. DOI-like text
inside review prose, references, titles, or arbitrary links is never used to
associate a review with a paper.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import html
import json
import logging
import re
import sys
import time
import xml.etree.ElementTree as ET
from collections import Counter, OrderedDict
from dataclasses import dataclass, field
from datetime import datetime
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import quote, urlparse

import requests
from bs4 import BeautifulSoup

COLUMNS = ["DOI", "PaperTitle", "Authors", "Source", "Venue", "Year", "PeerReview", "Field"]
ZENODO_API = "https://zenodo.org/api/records"
COMMUNITY = "prereview-reviews"
DOI_RE = re.compile(r"10\.\d{4,9}/[-._;()/:A-Z0-9]+", re.I)
ZENODO_DOI_RE = re.compile(r"10\.5281/zenodo\.\d+", re.I)
ARXIV_RE = re.compile(r"(?:arxiv:|arxiv\.org/(?:abs|pdf)/)?([a-z.-]+/\d{7}|\d{4}\.\d{4,5})(?:v(\d+))?", re.I)
VERSION_SUFFIXES = [
    re.compile(r"(?i)([._-]v)(\d+)$"),
    re.compile(r"(?i)(/v)(\d+)$"),
    re.compile(r"(?i)([._-]version)(\d+)$"),
]
PRESERVATION_PHRASES = (
    "this zenodo record is a permanently preserved version of",
    "you can view the complete prereview at",
)
FORBIDDEN_VENUE_FRAGMENTS = (
    " elsevier", "springer", "wiley", "taylor & francis", "sage publishing",
    "science and business media", "publishing group", "publications inc",
    "fapunifesp", "publisher", " llc", " bv",
)
CURRENT_YEAR = datetime.utcnow().year


@dataclass(frozen=True)
class Target:
    kind: str
    value: str
    doi: str
    family_key: str
    version: int | None
    scheme: str
    source_identifier: str


@dataclass
class Review:
    review_id: str
    record_id: str
    target: Target
    comment: str
    review_date: str
    review_type: str
    title_hint: str
    record_url: str
    creators: list[str] = field(default_factory=list)
    subjects: list[str] = field(default_factory=list)


@dataclass
class TargetBucket:
    target: Target
    reviews: list[Review] = field(default_factory=list)


@dataclass
class Family:
    key: str
    targets: OrderedDict[str, TargetBucket] = field(default_factory=OrderedDict)


def clean_text(value: Any, separator: str = "\n") -> str:
    if value is None:
        return ""
    soup = BeautifulSoup(str(value), "html.parser")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    raw = html.unescape(soup.get_text(separator))
    lines = [re.sub(r"[\t\r\f\v ]+", " ", line).strip() for line in raw.splitlines()]
    out: list[str] = []
    blank = False
    for line in lines:
        if not line:
            if out and not blank:
                out.append("")
            blank = True
            continue
        out.append(line)
        blank = False
    return "\n".join(out).strip()


def clean_review_html(value: Any) -> str:
    if not value:
        return ""
    soup = BeautifulSoup(str(value), "html.parser")
    for node in list(soup.find_all(string=True)):
        low = str(node).strip().lower()
        if any(phrase in low for phrase in PRESERVATION_PHRASES):
            parent = node.find_parent("p") or node.find_parent("div") or node.parent
            if parent is not None:
                parent.decompose()
    text_value = clean_text(str(soup))
    cleaned: list[str] = []
    for line in text_value.splitlines():
        low = line.strip().lower()
        if not line.strip():
            cleaned.append("")
            continue
        if any(phrase in low for phrase in PRESERVATION_PHRASES):
            continue
        if re.fullmatch(r"https?://(?:www\.)?prereview\.org/reviews/\d+/?", line.strip(), re.I):
            continue
        if line.strip() == ".":
            continue
        cleaned.append(line.strip())
    out: list[str] = []
    for line in cleaned:
        if not line and (not out or not out[-1]):
            continue
        out.append(line)
    return "\n".join(out).strip()


def normalize_doi(value: Any) -> str:
    if not value:
        return ""
    raw = html.unescape(str(value)).strip()
    raw = re.sub(r"^https?://(?:dx\.)?doi\.org/", "", raw, flags=re.I)
    raw = re.sub(r"^doi:\s*", "", raw, flags=re.I)
    match = DOI_RE.fullmatch(raw.rstrip(".,;:)]}>"))
    return match.group(0).lower() if match else ""


def family_and_version(identifier: str, kind: str) -> tuple[str, int | None]:
    value = identifier.lower().strip()
    if kind == "arxiv":
        match = re.fullmatch(r"(.+?)(?:v(\d+))?", value, re.I)
        assert match
        return f"arxiv:{match.group(1)}", int(match.group(2)) if match.group(2) else None
    for pattern in VERSION_SUFFIXES:
        match = pattern.search(value)
        if match:
            return f"doi:{value[:match.start()]}", int(match.group(2))
    return f"doi:{value}", None


def explicit_target(record: dict[str, Any]) -> tuple[Target | None, str]:
    metadata = record.get("metadata") or {}
    related = metadata.get("related_identifiers") or record.get("related_identifiers") or []
    accepted: list[Target] = []
    for item in related:
        if not isinstance(item, dict):
            continue
        relation = str(item.get("relation") or item.get("relation_type") or "").lower()
        resource_type = item.get("resource_type") or ""
        if isinstance(resource_type, dict):
            resource_type = " ".join(str(x) for x in resource_type.values())
        resource_low = str(resource_type).lower()
        if relation != "reviews":
            continue
        if resource_low and "preprint" not in resource_low:
            continue
        raw = str(item.get("identifier") or item.get("id") or item.get("value") or "").strip()
        scheme = str(item.get("scheme") or "").lower()
        candidate_doi = normalize_doi(raw)
        if not candidate_doi and raw.lower().startswith(("http://", "https://")):
            path = urlparse(raw).path.lstrip("/")
            candidate_doi = normalize_doi(path)
        if candidate_doi and not ZENODO_DOI_RE.fullmatch(candidate_doi):
            family, version = family_and_version(candidate_doi, "doi")
            accepted.append(Target("doi", candidate_doi, candidate_doi, family, version, scheme or "doi", raw))
            continue
        arxiv_match = ARXIV_RE.fullmatch(raw) or ARXIV_RE.search(raw)
        if arxiv_match:
            arxiv_id = arxiv_match.group(1).lower()
            version = int(arxiv_match.group(2)) if arxiv_match.group(2) else None
            family, _ = family_and_version(arxiv_id, "arxiv")
            accepted.append(Target("arxiv", arxiv_id, "", family, version, scheme or "arxiv", raw))
    unique = OrderedDict((target.value, target) for target in accepted)
    if not unique:
        return None, "no_explicit_target"
    if len(unique) > 1:
        families = {target.family_key for target in unique.values()}
        if len(families) != 1:
            return None, "ambiguous_explicit_targets"
        target = sorted(unique.values(), key=lambda x: (x.version is not None, x.version or 0, x.value))[-1]
        return target, "multiple_same_family"
    return next(iter(unique.values())), "ok"


def review_doi(record: dict[str, Any]) -> str:
    metadata, pids = record.get("metadata") or {}, record.get("pids") or {}
    candidates = [
        (pids.get("doi") or {}).get("identifier") if isinstance(pids, dict) else None,
        metadata.get("doi"), record.get("doi"),
    ]
    for candidate in candidates:
        normalized = normalize_doi(candidate)
        if normalized:
            return normalized
    recid = str(record.get("id") or "")
    return f"10.5281/zenodo.{recid}" if recid.isdigit() else f"PREreview:{recid}"


def review_type_and_title(title: Any) -> tuple[str, str]:
    title_text = clean_text(title, " ")
    low = title_text.lower()
    review_type = "PREreview"
    for label in ("Structured PREreview", "Rapid PREreview", "Full PREreview"):
        if low.startswith(label.lower()):
            review_type = label
            break
    patterns = [
        r"(?is)^(?:structured|rapid|full)?\s*prereview\s+of\s+[\"“](.*?)[\"”]\s*$",
        r"(?is)^prereview\s+of\s+(.*?)\s*$",
    ]
    hint = ""
    for pattern in patterns:
        match = re.match(pattern, title_text)
        if match:
            hint = clean_text(match.group(1), " ").strip('"“”')
            break
    return review_type, hint


def creators_from_record(record: dict[str, Any]) -> list[str]:
    out: list[str] = []
    for creator in (record.get("metadata") or {}).get("creators") or []:
        name = clean_text(creator.get("name") if isinstance(creator, dict) else creator, " ")
        if name and name not in out:
            out.append(name)
    return out


def subjects_from_record(record: dict[str, Any]) -> list[str]:
    out: list[str] = []
    for subject in (record.get("metadata") or {}).get("subjects") or []:
        term = clean_text(subject.get("term") if isinstance(subject, dict) else subject, " ")
        if term and term not in out:
            out.append(term)
    return out


def title_similarity(left: str, right: str) -> float:
    def norm(value: str) -> str:
        return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()
    a, b = norm(left), norm(right)
    if not a or not b:
        return 1.0
    sequence = SequenceMatcher(None, a, b).ratio()
    sa, sb = set(a.split()), set(b.split())
    jaccard = len(sa & sb) / len(sa | sb) if sa | sb else 1.0
    return max(sequence, jaccard)


def names(items: Any) -> list[str]:
    out: list[str] = []
    for item in items if isinstance(items, list) else []:
        if isinstance(item, str):
            name = clean_text(item, " ")
        elif isinstance(item, dict):
            person = item.get("person_or_org")
            if isinstance(person, dict):
                name = person.get("name") or " ".join(filter(None, [person.get("given_name"), person.get("family_name")]))
            else:
                name = " ".join(filter(None, [item.get("given"), item.get("family")])) or item.get("name") or ""
            name = clean_text(name, " ")
        else:
            name = ""
        if name and name not in out:
            out.append(name)
    return out


def date_year(obj: dict[str, Any], keys: Iterable[str]) -> str:
    for key in keys:
        value = obj.get(key) or {}
        if isinstance(value, dict):
            parts = value.get("date-parts") or []
            if parts and parts[0]:
                year = str(parts[0][0])
                if re.fullmatch(r"\d{4}", year):
                    return year
    return ""


VENUE_ALIASES = OrderedDict([
    ("medrxiv", "medRxiv"), ("biorxiv", "bioRxiv"), ("openrxiv", "openRxiv"),
    ("arxiv", "arXiv"), ("chemrxiv", "ChemRxiv"), ("preprints.org", "Preprints.org"),
    ("research square", "Research Square"), ("researchsquare", "Research Square"),
    ("psyarxiv", "PsyArXiv"), ("socarxiv", "SocArXiv"), ("eartharxiv", "EarthArXiv"),
    ("ecoevorxiv", "EcoEvoRxiv"), ("engrxiv", "engrXiv"), ("lawarxiv", "LawArXiv"),
    ("osf preprints", "OSF Preprints"), ("osf.io", "OSF Preprints"),
    ("authorea", "Authorea"), ("ssrn", "SSRN"), ("peerj preprints", "PeerJ Preprints"),
    ("zenodo", "Zenodo"), ("africarxiv", "AfricArXiv"), ("scielo preprints", "SciELO Preprints"),
])


def normalize_venue(candidates: Iterable[Any], target: Target) -> str:
    values = [clean_text(value, " ") for value in candidates if value]
    values.extend([target.source_identifier, target.value])
    blob = "\n".join(values).lower()
    for needle, label in VENUE_ALIASES.items():
        if needle in blob:
            return label
    doi_value = target.doi.lower()
    prefix_map = [
        ("10.48550/arxiv.", "arXiv"), ("10.26434/chemrxiv", "ChemRxiv"),
        ("10.20944/preprints", "Preprints.org"), ("10.64898/", "openRxiv"),
        ("10.21203/", "Research Square"), ("10.31234/osf.io/", "PsyArXiv"),
        ("10.35542/osf.io/", "SocArXiv"), ("10.31219/osf.io/", "OSF Preprints"),
        ("10.17605/osf.io/", "OSF Preprints"), ("10.22541/", "Authorea"),
    ]
    for prefix, label in prefix_map:
        if doi_value.startswith(prefix):
            return label
    return ""


class Collector:
    def __init__(self, delay: float = 0.05, seed: str = "PREreview-200-v2-20260713") -> None:
        self.delay = delay
        self.seed = seed
        self.session = requests.Session()
        self.session.headers.update({
            "Accept": "application/json",
            "User-Agent": "Lortzing-OpenReview-PREreview-collector/2.0 (https://github.com/Lortzing/OpenReview)",
        })
        self.metadata_cache: dict[str, dict[str, Any] | None] = {}
        self.request_counts: Counter[str] = Counter()

    def get_json(self, url: str, params: dict[str, Any] | None = None, retries: int = 5) -> Any:
        error: Exception | None = None
        for attempt in range(retries):
            try:
                response = self.session.get(url, params=params, timeout=60)
                self.request_counts[urlparse(response.url).netloc] += 1
                if response.status_code == 429:
                    time.sleep(min(30, 2 ** attempt))
                    continue
                response.raise_for_status()
                return response.json()
            except Exception as exc:
                error = exc
                time.sleep(1 + attempt)
        raise RuntimeError(f"GET failed: {url}: {error}")

    def get_text(self, url: str, retries: int = 4) -> str:
        error: Exception | None = None
        for attempt in range(retries):
            try:
                response = self.session.get(url, timeout=60)
                self.request_counts[urlparse(response.url).netloc] += 1
                if response.status_code == 429:
                    time.sleep(min(30, 2 ** attempt))
                    continue
                response.raise_for_status()
                return response.text
            except Exception as exc:
                error = exc
                time.sleep(1 + attempt)
        raise RuntimeError(f"GET failed: {url}: {error}")

    def iter_zenodo_records(self, max_pages: int, page_size: int = 100):
        for page in range(1, max_pages + 1):
            payload = self.get_json(ZENODO_API, {
                "communities": COMMUNITY,
                "sort": "mostrecent",
                "size": page_size,
                "page": page,
            })
            hits = (payload.get("hits") or {}).get("hits") or []
            total = (payload.get("hits") or {}).get("total")
            if isinstance(total, dict):
                total = total.get("value")
            logging.info("Zenodo page %d: %d records (reported total=%s)", page, len(hits), total)
            if not hits:
                break
            yield from hits
            if len(hits) < page_size:
                break

    def review_body(self, record: dict[str, Any]) -> str:
        metadata = record.get("metadata") or {}
        body = clean_review_html(metadata.get("description"))
        if body:
            return body
        for file_info in record.get("files") or []:
            if not isinstance(file_info, dict):
                continue
            if str(file_info.get("key") or "").lower().endswith((".html", ".txt", ".md")):
                url = (file_info.get("links") or {}).get("self")
                if url:
                    try:
                        return clean_review_html(self.get_text(url))
                    except Exception:
                        continue
        return ""

    def scan(self, max_pages: int) -> tuple[OrderedDict[str, Family], dict[str, Any]]:
        families: OrderedDict[str, Family] = OrderedDict()
        seen_records: set[str] = set()
        stats: Counter[str] = Counter()
        review_types: Counter[str] = Counter()
        possible_responses: list[dict[str, str]] = []

        for record in self.iter_zenodo_records(max_pages):
            record_id = str(record.get("id") or record.get("recid") or "")
            if not record_id or record_id in seen_records:
                stats["duplicate_or_missing_record_id"] += 1
                continue
            seen_records.add(record_id)
            stats["records_seen"] += 1
            metadata = record.get("metadata") or {}
            raw_title = clean_text(metadata.get("title"), " ")
            if re.search(r"\b(author response|response to|rebuttal|reply to)\b", raw_title, re.I):
                possible_responses.append({"record_id": record_id, "title": raw_title})
                stats["possible_response_records_skipped"] += 1
                continue
            target, reason = explicit_target(record)
            if target is None:
                stats[reason] += 1
                continue
            if reason != "ok":
                stats[reason] += 1
            body = self.review_body(record)
            if not body:
                stats["missing_review_body"] += 1
                continue
            if any(phrase in body.lower() for phrase in PRESERVATION_PHRASES):
                stats["boilerplate_cleaning_failed"] += 1
                continue
            review_type, title_hint = review_type_and_title(raw_title)
            review_types[review_type] += 1
            review = Review(
                review_id=review_doi(record),
                record_id=record_id,
                target=target,
                comment=body,
                review_date=str(metadata.get("publication_date") or record.get("created") or "")[:10],
                review_type=review_type,
                title_hint=title_hint,
                record_url=(record.get("links") or {}).get("self_html") or f"https://zenodo.org/records/{record_id}",
                creators=creators_from_record(record),
                subjects=subjects_from_record(record),
            )
            family = families.setdefault(target.family_key, Family(target.family_key))
            bucket = family.targets.setdefault(target.value, TargetBucket(target))
            if review.review_id in {item.review_id for item in bucket.reviews}:
                stats["duplicate_review_id"] += 1
                continue
            bucket.reviews.append(review)
            stats["reviews_accepted"] += 1

        report = dict(stats)
        report["strict_families"] = len(families)
        report["strict_target_versions"] = sum(len(family.targets) for family in families.values())
        report["review_types"] = dict(review_types)
        report["possible_response_records"] = possible_responses[:50]
        report["possible_response_record_count"] = len(possible_responses)
        return families, report

    def crossref_metadata(self, doi_value: str) -> dict[str, Any]:
        payload = self.get_json("https://api.crossref.org/works/" + quote(doi_value, safe=""), retries=3)
        msg = payload.get("message") or {}
        title_items = msg.get("title") or []
        title = clean_text(title_items[0] if isinstance(title_items, list) and title_items else title_items, " ")
        authors = names(msg.get("author"))
        year = date_year(msg, ("posted", "published-online", "published", "issued", "published-print"))
        venue_candidates: list[Any] = []
        for key in ("container-title", "short-container-title", "institution", "group-title"):
            value = msg.get(key)
            venue_candidates.extend(value if isinstance(value, list) else [value])
        venue_candidates.append(msg.get("URL"))
        for link in msg.get("link") or []:
            if isinstance(link, dict):
                venue_candidates.append(link.get("URL"))
        return {"title": title, "authors": authors, "year": year, "venue_candidates": venue_candidates, "source": "Crossref"}

    def openalex_metadata(self, doi_value: str) -> dict[str, Any]:
        payload = self.get_json("https://api.openalex.org/works/https://doi.org/" + quote(doi_value, safe=""), retries=3)
        source = ((payload.get("primary_location") or {}).get("source") or {})
        return {
            "title": clean_text(payload.get("title") or payload.get("display_name"), " "),
            "authors": [
                clean_text((authorship.get("author") or {}).get("display_name"), " ")
                for authorship in payload.get("authorships") or []
                if clean_text((authorship.get("author") or {}).get("display_name"), " ")
            ],
            "year": str(payload.get("publication_year") or ""),
            "venue_candidates": [
                source.get("display_name"), source.get("host_organization_name"),
                (payload.get("primary_location") or {}).get("landing_page_url"),
                (payload.get("primary_location") or {}).get("pdf_url"),
            ],
            "source": "OpenAlex",
        }

    def arxiv_metadata(self, arxiv_id: str) -> dict[str, Any]:
        xml = self.get_text("https://export.arxiv.org/api/query?id_list=" + quote(arxiv_id, safe=""), retries=3)
        root = ET.fromstring(xml)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        entry = root.find("atom:entry", ns)
        if entry is None:
            return {}
        title = clean_text(entry.findtext("atom:title", default="", namespaces=ns), " ")
        authors = [clean_text(a.findtext("atom:name", default="", namespaces=ns), " ") for a in entry.findall("atom:author", ns)]
        published = entry.findtext("atom:published", default="", namespaces=ns)
        year = published[:4] if re.match(r"\d{4}", published) else ""
        return {"title": title, "authors": [a for a in authors if a], "year": year, "venue_candidates": ["arXiv"], "source": "arXiv API"}

    def resolve(self, target: Target) -> dict[str, Any] | None:
        cache_key = f"{target.kind}:{target.value}"
        if cache_key in self.metadata_cache:
            return self.metadata_cache[cache_key]
        merged: dict[str, Any] = {"title": "", "authors": [], "year": "", "venue_candidates": [], "sources": []}
        resolvers = []
        if target.kind == "doi":
            resolvers = [lambda: self.crossref_metadata(target.doi), lambda: self.openalex_metadata(target.doi)]
        elif target.kind == "arxiv":
            resolvers = [lambda: self.arxiv_metadata(target.value)]
        for resolver in resolvers:
            try:
                value = resolver() or {}
            except Exception as exc:
                logging.debug("metadata resolver failed for %s: %s", target.value, exc)
                continue
            if value.get("source"):
                merged["sources"].append(value["source"])
            if not merged["title"] and value.get("title"):
                merged["title"] = value["title"]
            if not merged["authors"] and value.get("authors"):
                merged["authors"] = value["authors"]
            if not merged["year"] and re.fullmatch(r"\d{4}", str(value.get("year") or "")):
                merged["year"] = str(value["year"])
            merged["venue_candidates"].extend(value.get("venue_candidates") or [])
            if merged["title"] and merged["authors"] and merged["year"] and normalize_venue(merged["venue_candidates"], target):
                break
        merged["venue"] = normalize_venue(merged["venue_candidates"], target)
        self.metadata_cache[cache_key] = merged if any((merged["title"], merged["authors"], merged["year"])) else None
        time.sleep(self.delay)
        return self.metadata_cache[cache_key]

    def family_hash(self, key: str) -> str:
        return hashlib.sha256(f"{self.seed}\0{key}".encode()).hexdigest()

    def build_family(self, family: Family) -> tuple[dict[str, Any] | None, dict[str, Any]]:
        buckets = list(family.targets.values())
        buckets.sort(key=lambda bucket: (
            bucket.target.version is None,
            bucket.target.version if bucket.target.version is not None else 10**9,
            min((review.review_date for review in bucket.reviews), default="9999"),
            bucket.target.value,
        ))
        resolved: list[tuple[TargetBucket, dict[str, Any]]] = []
        rejection: dict[str, Any] = {"family_key": family.key, "targets": [b.target.value for b in buckets]}
        latest_bucket = sorted(
            buckets,
            key=lambda bucket: (bucket.target.version is not None, bucket.target.version or 0, bucket.target.value),
        )[-1]
        for bucket in buckets:
            metadata = self.resolve(bucket.target)
            if metadata:
                resolved.append((bucket, metadata))
        if not resolved:
            rejection["reason"] = "metadata_failed_all_versions"
            return None, rejection
        latest = next((metadata for bucket, metadata in resolved if bucket.target.value == latest_bucket.target.value), None)
        if latest is None:
            rejection["reason"] = "latest_version_metadata_failed"
            return None, rejection
        hints = [review.title_hint for bucket in buckets for review in bucket.reviews if review.title_hint]
        hint = Counter(hints).most_common(1)[0][0] if hints else ""
        title = latest.get("title") or hint
        similarity = title_similarity(title, hint) if hint else 1.0
        authors = latest.get("authors") or []
        years = [str(metadata.get("year")) for _, metadata in resolved if re.fullmatch(r"\d{4}", str(metadata.get("year") or ""))]
        year = min(years) if years else ""
        venue = latest.get("venue") or next((metadata.get("venue") for _, metadata in reversed(resolved) if metadata.get("venue")), "")
        missing = [name for name, value in (("title", title), ("authors", authors), ("year", year), ("venue", venue)) if not value]
        if missing:
            rejection.update({"reason": "metadata_incomplete", "missing": missing, "metadata_sources": latest.get("sources")})
            return None, rejection
        if similarity < 0.58:
            rejection.update({"reason": "title_mismatch", "metadata_title": title, "review_title": hint, "similarity": similarity})
            return None, rejection
        if any(fragment in f" {venue.lower()}" for fragment in FORBIDDEN_VENUE_FRAGMENTS):
            rejection.update({"reason": "publisher_used_as_venue", "venue": venue})
            return None, rejection
        if not (1900 <= int(year) <= CURRENT_YEAR + 1):
            rejection.update({"reason": "invalid_year", "year": year})
            return None, rejection

        rounds: list[dict[str, Any]] = []
        audit_rounds: list[dict[str, Any]] = []
        for round_index, bucket in enumerate(buckets, start=1):
            reviews = sorted(bucket.reviews, key=lambda review: (review.review_date, review.review_id))
            comments = [{"Reviewer_ID": review.review_id, "Comment": review.comment} for review in reviews]
            rounds.append({"Round": round_index, "Comments": comments, "Response": []})
            audit_rounds.append({
                "round": round_index,
                "target_identifier": bucket.target.value,
                "target_doi": bucket.target.doi,
                "explicit_version": bucket.target.version,
                "reviews": [
                    {
                        "review_id": review.review_id,
                        "review_record_id": review.record_id,
                        "review_url": review.record_url,
                        "review_date": review.review_date,
                        "review_type": review.review_type,
                        "reviewers": review.creators,
                    }
                    for review in reviews
                ],
            })

        latest_doi = latest_bucket.target.doi
        paper = {
            "DOI": latest_doi,
            "PaperTitle": clean_text(title, " "),
            "Authors": authors,
            "Source": "PREreview",
            "Venue": venue,
            "Year": year,
            "PeerReview": rounds,
            "Field": "",
        }
        audit = {
            "family_key": family.key,
            "output_doi": latest_doi,
            "title_similarity": round(similarity, 4),
            "title_hint": hint,
            "metadata_sources": latest.get("sources") or [],
            "versions": len(buckets),
            "rounds": audit_rounds,
        }
        return paper, audit

    def collect(self, limit: int, max_pages: int) -> tuple[list[dict[str, Any]], dict[str, Any], list[dict[str, Any]]]:
        families, scan_stats = self.scan(max_pages)
        ordered = sorted(families.values(), key=lambda family: self.family_hash(family.key))
        papers: list[dict[str, Any]] = []
        audit: list[dict[str, Any]] = []
        rejection_counts: Counter[str] = Counter()
        rejection_examples: list[dict[str, Any]] = []
        for family in ordered:
            paper, detail = self.build_family(family)
            if paper is None:
                rejection_counts[detail.get("reason", "unknown")] += 1
                if len(rejection_examples) < 30:
                    rejection_examples.append(detail)
                continue
            papers.append(paper)
            detail["sample_index"] = len(papers)
            audit.append(detail)
            if len(papers) >= limit:
                break

        selected_reviews = sum(
            len(round_data["Comments"])
            for paper in papers
            for round_data in paper["PeerReview"]
        )
        selected_review_types: Counter[str] = Counter()
        for row in audit:
            for round_data in row["rounds"]:
                for review in round_data["reviews"]:
                    selected_review_types[review["review_type"]] += 1
        stats = {
            "platform": "PREreview",
            "source": "Zenodo community prereview-reviews",
            "association_policy": "Only explicit Zenodo related_identifiers with relation=reviews; no DOI extraction from prose, references, titles, or arbitrary links.",
            "sample_policy": "Deterministic SHA-256 ordering over all strict version-family groups after a complete community scan.",
            "seed": self.seed,
            "requested": limit,
            "written": len(papers),
            "scan": scan_stats,
            "metadata_rejections": dict(rejection_counts),
            "metadata_rejection_examples": rejection_examples,
            "selected": {
                "papers": len(papers),
                "review_comments": selected_reviews,
                "multi_version_papers": sum(len(paper["PeerReview"]) > 1 for paper in papers),
                "rounds": sum(len(paper["PeerReview"]) for paper in papers),
                "years": dict(sorted(Counter(paper["Year"] for paper in papers).items())),
                "venues": dict(Counter(paper["Venue"] for paper in papers).most_common()),
                "review_types": dict(selected_review_types),
                "empty_doi": sum(not paper["DOI"] for paper in papers),
                "responses_found": sum(len(round_data["Response"]) for paper in papers for round_data in paper["PeerReview"]),
            },
            "request_counts": dict(self.request_counts),
            "reviewer_id_semantics": "Stable PREreview review-record DOI, analogous to the F1000 report ID used in the provided schema.",
        }
        return papers, stats, audit


def save_csv(records: list[dict[str, Any]], output: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=COLUMNS)
        writer.writeheader()
        for record in records:
            writer.writerow({
                "DOI": record["DOI"],
                "PaperTitle": record["PaperTitle"],
                "Authors": json.dumps(record["Authors"], ensure_ascii=False),
                "Source": record["Source"],
                "Venue": record["Venue"],
                "Year": record["Year"],
                "PeerReview": json.dumps(record["PeerReview"], ensure_ascii=False),
                "Field": record["Field"],
            })


def canonical_family_from_output_doi(value: str) -> str:
    normalized = normalize_doi(value)
    if not normalized:
        return ""
    return family_and_version(normalized, "doi")[0]


def validate_csv(path: Path, expected: int) -> list[str]:
    with path.open(encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        rows = list(reader)
        columns = reader.fieldnames
    issues: list[str] = []
    if columns != COLUMNS:
        issues.append(f"columns={columns}, expected={COLUMNS}")
    if len(rows) != expected:
        issues.append(f"rows={len(rows)}, expected={expected}")
    family_keys: set[str] = set()
    review_ids: set[str] = set()
    for row_number, row in enumerate(rows, start=2):
        for required in ("PaperTitle", "Authors", "Source", "Venue", "Year", "PeerReview"):
            if not str(row.get(required) or "").strip():
                issues.append(f"row {row_number}: missing {required}")
        if re.search(r"<[^>]+>", row.get("PaperTitle") or ""):
            issues.append(f"row {row_number}: HTML remains in title")
        doi_value = row.get("DOI") or ""
        if doi_value:
            normalized = normalize_doi(doi_value)
            if not normalized or ZENODO_DOI_RE.fullmatch(normalized):
                issues.append(f"row {row_number}: invalid paper DOI {doi_value!r}")
            family_key = canonical_family_from_output_doi(doi_value)
            if family_key in family_keys:
                issues.append(f"row {row_number}: duplicate version-family {family_key}")
            family_keys.add(family_key)
        if not re.fullmatch(r"\d{4}", row.get("Year") or ""):
            issues.append(f"row {row_number}: invalid year")
        venue = row.get("Venue") or ""
        if any(fragment in f" {venue.lower()}" for fragment in FORBIDDEN_VENUE_FRAGMENTS):
            issues.append(f"row {row_number}: publisher-like Venue {venue!r}")
        try:
            authors = json.loads(row.get("Authors") or "")
            peer_reviews = json.loads(row.get("PeerReview") or "")
        except Exception as exc:
            issues.append(f"row {row_number}: JSON error {exc}")
            continue
        if not isinstance(authors, list) or not authors or any(not isinstance(name, str) or not name.strip() for name in authors):
            issues.append(f"row {row_number}: invalid Authors")
        if not isinstance(peer_reviews, list) or not peer_reviews:
            issues.append(f"row {row_number}: invalid PeerReview")
            continue
        expected_rounds = list(range(1, len(peer_reviews) + 1))
        rounds = [item.get("Round") for item in peer_reviews if isinstance(item, dict)]
        if rounds != expected_rounds:
            issues.append(f"row {row_number}: non-consecutive rounds {rounds}")
        for round_data in peer_reviews:
            if not isinstance(round_data, dict):
                issues.append(f"row {row_number}: round is not object")
                continue
            comments = round_data.get("Comments")
            responses = round_data.get("Response")
            if not isinstance(comments, list) or not comments:
                issues.append(f"row {row_number}: empty Comments")
                continue
            if not isinstance(responses, list):
                issues.append(f"row {row_number}: Response is not list")
            for comment in comments:
                review_id = str(comment.get("Reviewer_ID") or "") if isinstance(comment, dict) else ""
                body = str(comment.get("Comment") or "") if isinstance(comment, dict) else ""
                if not review_id or not body:
                    issues.append(f"row {row_number}: invalid comment")
                if review_id in review_ids:
                    issues.append(f"row {row_number}: duplicate review ID {review_id}")
                review_ids.add(review_id)
                if any(phrase in body.lower() for phrase in PRESERVATION_PHRASES):
                    issues.append(f"row {row_number}: preservation boilerplate remains")
                if re.search(r"<[^>]+>", body):
                    issues.append(f"row {row_number}: HTML remains in comment")
    return issues


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=200)
    parser.add_argument("--max-pages", type=int, default=100)
    parser.add_argument("--output", default="data/prereview/prereview_final_200_corrected.csv")
    parser.add_argument("--stats", default="data/prereview/prereview_collection_stats_corrected.json")
    parser.add_argument("--audit", default="data/prereview/prereview_audit_200.json")
    parser.add_argument("--seed", default="PREreview-200-v2-20260713")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    collector = Collector(seed=args.seed)
    records, report, audit = collector.collect(args.limit, args.max_pages)
    output = Path(args.output)
    save_csv(records, output)
    issues = validate_csv(output, args.limit)
    report["validation_issues"] = issues
    Path(args.stats).parent.mkdir(parents=True, exist_ok=True)
    Path(args.stats).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    Path(args.audit).write_text(json.dumps(audit, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    sys.exit(2 if issues or len(records) != args.limit else 0)


if __name__ == "__main__":
    main()
