# Nasjonalbiblioteket (NB.no) citation assistance

Citation-only support for digitized newspaper and book viewer items, addressed
by short item IDs or full URNs. Generated links prefer the API-supplied URN and
retain the exact zero-based `page` query. Public catalogue metadata is loaded
through Sourcer's existing background JSON fetch; no OCR, images or login state
are fetched. Search and profile creation are outside this contribution.

## Data flow

1. Read the viewer item and page, then load the NB bibliography and optional page manifest.
2. Show a manual form for category, person, passage locator, printed pages and applicable event facts.
3. Normalize applicable passage fields, run the rule-based reader and common generalization pipeline, then use the common citation builder.

`nb_notice_types.mjs` is the single definition of newspaper categories, headings,
visible event fields and narrative phrases. Underlying record types remain
Newspaper and Book. Publication dates are never treated as life-event dates;
death facts transcribed from a passage have explicit reader mappings. Book
creators stay in the bibliography and never become the narrative subject.

Person and event fields always start blank. Changing the person or category
clears event facts. Rebuilding generalized data from the bibliography and current
passage removes stale fields. Without a person, generation produces a reference
without a person-specific narrative. Narratives attribute entered event facts to
the notice rather than presenting them as independently established facts.

## Citation collection

Collection-based prefilling is deferred to a separate proposal. NB does not read
existing citations or write research context into collection storage. Normal
Add to collection, duplicate handling, stop and restore use the existing common
workflow. This contribution adds no collection storage fields or migrations;
older stored collections are left untouched.

## Shared form changes

The existing user-input hook remains synchronous. Its optional regeneralization
hook is awaited so NB can check that the tab still shows the same item/page before
building. Synchronous hooks remain supported. Failed checks stop generation with
a message; repeated submission is blocked while a check is pending. An optional
`validationError` disables generation for invalid event dates. Rebuilding the form
preserves the standard collecting-mode button label. These changes do not read
collection contents or change citation collection storage.

## Page and citation identity

A viewer index identifies an image, not necessarily a printed page. Manifest
labels are retained as metadata, but printed pages are entered manually. URN and
short-ID aliases are accepted for the same item; a different item or page blocks
generation. Two-up display ranges come from the visible viewer control.

References include category, person and optional passage locator to distinguish
notices on one image. Identical references retain Sourcer's duplicate behavior.

## Verification

Run `node scripts/run_test.js nb` for extraction, generalization, citation
baselines, manual-input behavior, URN links, page-change checks and actual-form
DOM tests. Collection lifecycle tests exercise the unchanged common add, stop
and restore functions and check preservation of earlier citations. Fixture
notices and names are synthetic; metadata is public and no scans are included.

Both reported URN viewer links were manually retested successfully by the
contributor before this simplification. That result does not count as manual
testing of the revised form. See `nb_manual_test.md` for the revised workflow.
Safari execution has not been tested.
