# Digitalarkivet parish viewer

The new `nye.digitalarkivet.no/source/<sourceId>/parish/<imageUuid>` viewer is
handled separately from legacy record and `media.digitalarkivet.no` image pages.
Content extraction identifies the URL; the popup loads public source and image
JSON through the existing background fetch helper and optional site permissions.
It does not inspect private application state, execute page scripts, or download
image pixels.

The metadata normalizer checks the source manifest ID and selected canvas, and
the file-info image UUID. Pagination is keyed by the UUID, not its array position.
Printed page, permanent image ID, source ID, and canvas UUID are distinct. The
register period and page-year describe the source; they are not personal events.
English metadata is preferred with Norwegian fallback. Inert metadata markup is
converted to plain text.

An optional request failure leaves verified metadata available; if all requests
fail, the build form explains that only the exact viewer link can be cited. A
wrong-source/image response is rejected. Identity is checked after loading and
again through the build form's asynchronous hook before generating a citation.
This also protects citation collection after navigation without reload.

New viewer citations use the provided permanent ID at `goto.digitalarkivet.no`;
legacy link handling is unchanged. Provider attribution is separate from the
actual holding institution. No generic provider credit is added by this change.

## Verification

Run `node scripts/run_test.js noda viewer` for viewer metadata, citation snapshots,
and popup behavior tests, then `node scripts/run_test.js noda` for legacy coverage.
The full repository suite is `node scripts/run_test.js`.

Manual Chrome/Firefox checks still required:

- Open each URL in `unit_tests/noda/viewer_fixtures/*.json` and build WikiTree and
  Plain Text citations. Verify source title, protocol, holding institution, page,
  stable link, and references-at-end formatting.
- Navigate to another image without reloading while Sourcer is open. Old actions
  must not generate a citation for the previous image.
- Test a source/index-only page, unavailable metadata, and an untranscribed page.
- Recheck legacy record pages and the legacy census-image viewer.

Windows computer use currently stops at the browser URL-policy restriction, so
browser UI verification has not been completed by the contributor.
