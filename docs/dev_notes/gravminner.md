# Slekt og Data – Gravminner

This integration supports citations from individual memorial pages at
`https://slektogdata.no/gravminner/grav/<UUID>` and the equivalent `www` address.
It does not register a Gravminner search target or add profile-creation features.

## Using it

1. Load the development extension from `extension/manifest.json` in Chrome, or run
   `node scripts/build_firefox.js none` and load `browser_variants/firefox/manifest.json`
   as a temporary extension in Firefox.
2. Open a person page, grant Sourcer its optional site permission when requested,
   and wait until the person's details and unique ID are visible.
3. Open Sourcer and choose the usual citation command. Paste into a WikiTree edit
   preview to check the resulting reference before saving.

Standard inline, narrative and source formats are supported. Common Sourcer
options control the accessed date, reference labels and formatting. There are no
additional site-specific options. Search and general help pages cannot be cited
as person records. If details have not loaded, reopen Sourcer after loading.

## Data interpretation

The extractor reads displayed p/a values from the single `.table-info` table,
using its `data-key` attributes. It does not read editing controls, hidden date
pickers or other people in the same-grave list. The table's Unik ID must match the
UUID in the address; this rejects stale content during Angular navigation.
Missing or stale content uses Sourcer’s existing incomplete-data retry mechanism.
The landing-page route is included so scripts survive client-side navigation.

Birth, death, burial and Bisatt dates remain separate. Dates containing only a
year remain year-only. Zero components are handled defensively without inventing
a month or day; invalid dates remain verbatim in citations and are not used for
generalized events. A burial record type is used only when the burial date can be
interpreted. Otherwise the record type is Memorial: a monument does not prove
that the person was buried at that location. The cemetery is never a death place.
No relationships are inferred from shared memorials.

The site's generated Kildereferanse is retained for inspection, but structured
fields determine names and dates. In an observed record the generated prose
confused a birthplace with a maiden name. Image credits are retained when shown,
but citations describe the database memorial rather than the photograph. No
images are downloaded, copied or embedded.

## Tests

Run `node scripts/run_test.js gravminner`. Seven regression cases exercise
extraction, generalization and nine citation variants each. Nine independent
behavior checks cover person isolation, structured maiden names, monuments,
date precision/validation, ceremony-only records, citation options, URL cleanup,
invalid/stale pages, and manifest/module registration.

Fixture provenance and the distinction between public DOM transcriptions and
synthetic edge cases are documented in `unit_tests/gravminner/saved_pages/README.md`.
The fixtures are reduced transcriptions, not complete browser page saves.

## Manual release checks

- Chrome and Firefox: grant the site permission, open each observed example,
  build inline/narrative/source references, verify the copied text, and paste into
  a WikiTree preview. Confirm no search target or profile-creation command was added.
- Navigate between two person pages without a full reload, and try an unfinished
  page and a search page. Sourcer must never cite the previous person.
- Repeat the person-page flow both logged out and logged in, with and without an
  image. Confirm that editing controls do not affect extraction.
- Safari macOS/iOS manifests contain the same optional hosts; actual Safari testing
  requires the corresponding platforms.

Live DOM inspection was performed logged out on 9 November 2026. Installed
Chrome/Firefox extension flows, logged-in operation and Safari operation require
manual verification; automated fixture tests do not replace those checks.
