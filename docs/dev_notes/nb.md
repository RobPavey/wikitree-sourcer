# Nasjonalbiblioteket (NB.no) citation assistance

Citation-only support for newspaper and book viewer items addressed by either
NB item IDs or full URNs. Generated links prefer the API-supplied URN, retaining
the exact zero-based `page` query. NB bibliography is
loaded on demand from the public catalogue API through Sourcer's existing
background JSON fetch. Item/page identity is checked again after fetching and
before generation. No OCR, scanned images, credentials or search terms are fetched.

## Data-driven interpretation

`nb_notice_types.mjs` defines the six newspaper categories and book context. These
definitions drive headings, available fields and narrative phrases. The reader
uses common field rules, `setRecordData` and `commonGeneralizeData`. Confirmed form
input is applied through that same reader again, replacing all prior generalized
fields so stale facts cannot survive a category change.

The generic record type remains Newspaper or Book. Its eventDate is publication
time. Confirmed death facts have their own standardized fields; marriage and
engagement details remain in the plain, serializable `siteData.nb` passage data.
Book creators remain bibliographic metadata. A named book subject sets
`isAboutNamedPerson`; catalogue authors are not used as research subjects.

## Three distinct data layers

1. Extracted NB bibliography and viewer position.
2. Suggestions derived from the active collection, kept in a popup-local context.
3. Facts transcribed or explicitly confirmed in the current passage. Only these
   reach the passage data, generalized death fields and attributed narrative.

The collection retains an optional `nbContext` containing the selected subject
and explicitly associated name variants, never copied life-event facts. New
collections have an ID; legacy active collections receive one on first NB use.
The ID prevents a stale form from using a replaced or stopped collection. Explicit
restoration preserves the research subject, but passage confirmations start blank.
Only primary-person records with matching names or explicitly associated variants
supply suggestions. Alternatives remain separate, with source descriptions. Date
qualifiers and year-only precision are preserved, including death-before-burial
limits. Saved person data and inactive previous collections are not consulted.

## Existing form integration

The existing user-input hook remains synchronous. Collection metadata is loaded
before constructing the form and refreshed when returning from the collection
menu. The shared form now awaits its regeneralize hook, handles failure/cancellation
without building, prevents double submission, and supports an optional
`validationError` message. Existing synchronous hooks continue to work. Rebuilt
forms retain the collecting-mode button label.

No new generalized-data classes or global record types are introduced. The shared
collection change is an additive ID field; existing stored collections remain valid.

## Page and citation identity

The viewer's zero-based page query identifies an image, not a printed page.
ID and URN aliases for the same item are recognized during stale-page checks;
a change of page or a genuinely different item still blocks generation. Keep
its exact canonical link, including image zero. Two-up display ranges are captured
from the visible viewer control. Manifest labels are retained as metadata but are
not assumed to be printed page numbers. The user can supply a printed page/range.

Source references include the page locator, category, person and optional passage
heading/column, allowing distinct notices on the same image to be collected.
Identical references still use Sourcer's standard duplicate handling.

## Verification

Run `node scripts/run_test.js nb` for public metadata fixtures, interpreted-data
and citation baselines, collection and form behavior, and DOM tests of the actual
shared input-form implementation. Synthetic names/notices are explicitly identified.
The tests exercise synchronous and asynchronous hooks, early cancellation, failed
hooks, form rebuilds, validation and the actual collection add/stop/restore methods.

A local browser harness using the actual form function and core NB modules also
verified that an unconfirmed suggested date is omitted and a confirmed one appears
with attribution. This harness does not replace installed-extension testing.

Chrome and Firefox still need manual extension-level checks of permission prompts,
live NB access and clipboard output. Safari manifests are maintained, but actual
Safari testing requires the relevant platforms. See the local contribution's
LOCAL-TESTING.md for the complete manual workflow.

## Contributor retest

The contributor manually retested both reported URN viewer examples and confirmed
successful citation generation after the URN correction, including the book at
page index 585. Detailed platform-by-platform permission and clipboard coverage
has not been recorded; Safari execution remains untested.
