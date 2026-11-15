# Slekt og Data – Gravminner

This integration supports citations from individual memorial pages at
`https://slektogdata.no/gravminner/grav/<UUID>` and the equivalent `www` address.
It also supports form-based searches started from WikiTree and other supported
sources. It adds no profile-creation features or image-transfer functions.

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
additional site-specific citation options. Search and general help pages cannot be cited
as person records. If details have not loaded, reopen Sourcer after loading.

## Searching Gravminner

Choose **Search Slekt og Data – Gravminner** in Sourcer. A fresh tab opens at
`https://slektogdata.no/gravminner/finn-en-grav`, using Sourcer's normal tab-position
setting. The search uses the native Angular form, not private APIs or URL queries.

Sourcer fills the first given name and surname at death (falling back to the known
surname). The maiden-name field is left blank so a record without maiden-name
metadata can still match. Available birth/death years use the shared
`setDatesUsingQualifier` ranges and tolerance; month/day fields stay blank. The
birth-year and death-year filters can be turned off independently in Search
options. Exact-name matching is off. Country remains at the site's default, and
no burial area is inferred from birthplace, death place or residence.

Gravminner determines what the current session may search. Sourcer submits once;
if the site requires county and municipality, the entered names/years remain and
a banner asks you to select the area. After the dependent geography choices have
loaded, Sourcer submits once more. No membership setting or credential is stored.

You can stop automatic searching with the banner button, edit a non-geography
field, or submit manually. Results, including zero results, remain editable;
Sourcer does not broaden and repeat an unsuccessful search. Loading or unexpected
validation problems leave the native form available with an explanatory message.

Pending requests must target the Gravminner search route and be less than 50
seconds old. A claimed request is removed from extension storage before filling;
other sites' requests are not removed. Form loading and result waiting each have
a 30-second limit; choosing geography has no short countdown. Observers/listeners
are removed on completion, cancellation, manual takeover or leaving the route.
Existing search tabs are not reused.

The server-rendered form can appear before Angular is ready, particularly in
Firefox. Before submitting, Sourcer waits for the filled values to stay stable
for one second and refills if client bootstrap resets or replaces the form. A
submit not intercepted by Angular is prevented from causing a native page reload
and retried within the same loading deadline. Once Angular handles a submission,
Sourcer waits for its response instead of repeating the request.

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
The citation fixtures are reduced transcriptions, not complete browser page saves.

Search regressions use WikiTree, Find a Grave and Gravminner records with each
combination of enabled/disabled year filters. Synthetic DOM tests exercise
Angular-compatible events, delayed fields, geography restrictions and dependent
loading, one-time submission, manual takeover, expiry, route changes and failures.
An isolated ESM test executes the shared popup helper with mocked browser APIs to
verify both permission refusal and successful Gravminner menu dispatch. No new
package dependencies are needed.

## Manual release checks

- Chrome and Firefox: grant the site permission, open each observed example,
  build inline/narrative/source references, verify the copied text, and paste into
  a WikiTree preview. Confirm the Gravminner search target is present and no new profile-creation command was added.
- Navigate between two person pages without a full reload, and try an unfinished
  page and a search page. Sourcer must never cite the previous person.
- Repeat the person-page flow both logged out and logged in, with and without an
  image. Confirm that editing controls do not affect extraction.
- Safari macOS/iOS manifests contain the same optional hosts; actual Safari testing
  requires the corresponding platforms.

- Start searches from both WikiTree and another source. Verify names/year filters,
  pending-request cleanup, and the full search-result-to-citation flow.
- Repeat search with a logged-in member (unrestricted search), logged out, and a
  logged-in non-member where available. In restricted sessions choose geography
  and confirm automatic resumption. Test zero results and manual cancellation.

Live citation DOM inspection was performed logged out on 9 November 2026; the
contributor subsequently reported Chrome/Firefox citation testing for #554.
The native search form was inspected on 10 November both logged out and in a
member session. Member searches with year ranges succeeded without geography,
and the native zero-result response was checked. These native-form checks do
not establish that the installed extension's new search pipeline is verified.
The user also launched an installed-extension member search from WikiTree
Hansen-28568: the connected browser showed Johan Hansen, birth years 1827–1829,
death years 1900–1902, unselected county/municipality, and two search results.
The user confirmed the logged-out geography handoff in Chrome and, after the
server-form readiness fix, in Firefox. The user also confirmed the updated
Firefox member search runs without county/municipality selection. Safari runtime testing is unavailable. Automated tests do not replace those checks.
