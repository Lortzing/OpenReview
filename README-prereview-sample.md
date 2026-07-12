# PREreview 200-row corrected sample

This branch builds a 200-paper PREreview sample in the shared CSV schema:

`DOI, PaperTitle, Authors, Source, Venue, Year, PeerReview, Field`

## Strict collection rules

- Scan the complete public Zenodo community `prereview-reviews` before sampling.
- Accept a paper-review association only from an explicit Zenodo `related_identifier` whose relation is `reviews` and whose resource type is a preprint.
- Never infer the reviewed paper DOI from review prose, references, titles, or arbitrary links.
- Group versioned identifiers into one paper family and represent reviewed versions as consecutive `Round` values.
- Resolve paper metadata through Crossref and OpenAlex, cross-checking metadata titles against PREreview titles.
- Normalize `Venue` to a preprint platform and reject publisher names as venues.
- Remove HTML and PREreview/Zenodo preservation boilerplate.
- Map explicitly linked author responses to `Response`; extract PDF-only response text with PyMuPDF.
- Emit an audit JSON containing every selected target version, review record, response record, and source URL.

## Verified output

The successful CI artifact contains:

- 200 unique version families
- 231 review comments with 231 unique review-record DOIs
- 204 rounds
- 3 multi-version papers
- 1 explicitly linked author response extracted from its PDF attachment
- no validation issues

The GitHub Actions workflow applies `scripts/prereview_corrections.patch` to the base crawler, runs the complete collection, validates the output, and uploads the CSV, corrected crawler, statistics, audit file, and run log.
