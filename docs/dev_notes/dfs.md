# Danish Family Search (`dfs`)

Adds issue #125 support for church books, censuses, school protocols, and military
levy rolls. This is separate from the FamilySearch (`fs`) integration.

## Using the integration

Sign in to Danish Family Search in the browser where Sourcer is installed. Searches
and references reuse that browser session; Sourcer never requests or stores credentials.
If the session expires, sign in and start the Sourcer action again.

The search menu offers all four groups, individual groups, and specified parameters
for source years, birth years, birthplace, and locality. Search automatically submits
by default. Turn off **Submit the search automatically** under the site's search
options to review the filled form first. The site's own Reset postback clears remembered
geographic, sex, occupation, and text filters before the new search is filled.
Requests expire after 60 seconds and are removed before submission or review.

Individual `/cid…` census and `/kbid…` church pages supply person records. Indexed
church, school, and levy image pages have a **WikiTree Sourcer person** selector.
Select an entry, then open or reopen Sourcer. Selection is never inferred from the
first row or a matching name and is cleared when the URL, image, or displayed index
changes, including index pagination. A page without a selected entry supports an
image citation, without person data or a narrative. For paginated indexes, use the
website's pagination to display the intended entry before selecting it.

Census household tables preserve the displayed rows and identify the selected
person by the `/cid…` ID, including when names are duplicated. Relationships are
translated only when explicit. An occupation alone does not establish the head or
parentage. Approximate census birth years remain approximate. Free-text remarks are
not converted into vital events. Adjacent bride and groom index rows are not paired
without an explicit transcription relationship.

Individual census citations add “in the household of [name]” for a person other than
the main household member. This uses an explicit head where supplied, otherwise
the first displayed household member. It is citation context only, not an inference
of parentage. The phrase is omitted when a household table is included or the main
person cannot be identified unambiguously.

Citations use record/image page URLs, register and image references, entry numbers,
and census DDA/KIP provenance where supplied. Image URLs are secondary links. A
reader may need to sign in to follow a citation. No OCR, Danskerbasen tree import,
bulk retrieval, or edits to DFS transcriptions are implemented. Coverage dates shown
by DFS are not hard-coded search limits.

## Implementation and validation

Browser extraction reads published label/value tables and indexed rows; editable
name-entry forms are excluded. `DfsEdReader` maps to existing Sourcer types, including
`SchoolRecords` and `Military`. The latter supplies no inferred service, unit, or rank.
The shared search-parameter renderer gains an optional text control so source year
and place parameters use the existing specified-parameters dialog.

Run `node scripts/run_test.js dfs` for extraction, generalization, citation,
household-table, search state-machine, selection, and manifest tests. The tests use
sanitized compact HTML excerpts and explicit synthetic failure cases; see
`unit_tests/dfs/saved_pages/README.md`. They simulate the site's postback lifecycle
without contacting DFS or changing records.

The authenticated website layouts and Reset/Search behavior were inspected in the
built-in browser. This does not constitute an installed-extension end-to-end test.
Before release, verify the unpacked extension in Chrome and the Firefox variant:

1. Search from a WikiTree profile, both all-groups and single-group; confirm the
   intended names/year bounds and that remembered geographic filters are cleared.
2. Repeat with automatic submission disabled, and with a remembered result page.
3. Cite a census person and build its household table. Check duplicate names and
   that servants remain included under the user's normal table settings.
4. Cite a church transcription, then select entries on church, school, and levy
   images. Change the image or index page and confirm selection clears.
5. Cite an unindexed image; confirm person/narrative actions are absent.
6. Let the session expire or use a logged-out browser. Confirm the sign-in message,
   no false citation, and no automatic replay after login; retry explicitly.
7. Open the generated reference in another logged-in session and confirm its image
   and entry references locate the same source. Test Safari macOS/iOS separately.
