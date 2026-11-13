# NB manual testing

Use the simplified NB branch, not the other feature checkout. Load `extension`
as an unpacked extension in Chrome. For Firefox, build with
`node scripts/build_firefox.js none` and load
`browser_variants/firefox/manifest.json` as a temporary add-on. Reload NB tabs.

1. Open each regression URL:
   - https://www.nb.no/items/URN:NBN:no-nb_digavis_hedemarkensamtstidende_null_null_19100330_64_35_1?page=1
   - https://www.nb.no/items/URN:NBN:no-nb_digibok_2012050924011?page=585
2. Open Sourcer, grant the normal site/API permission if prompted, and choose a citation command.
3. Check that the person's name starts blank and no collection-subject, suggestion or confirmation controls appear.
4. For newspapers, try each notice category. Enter a name and optional event facts from the passage. Check the heading and narrative preview. A book's catalogue author must remain bibliographic metadata.
5. Change the category or person after entering event facts. Check that old event details disappear. Clear the name and generate a reference with no invented narrative.
6. Enter `31 February 1920`: generation must be disabled with a message. Replace it with `1920` or `before 3 May 1920`: precision/qualifier must be preserved. Publication time must remain distinct.
7. Copy inline, narrative and source citations to a text editor. Check the URN and exact `page` query, printed-page override and viewer-image fallback.
8. Change the NB page while the form is open. Generation must request reopening Sourcer.
9. Start a collection, add two distinct NB notices (use different passage locators), stop and restore it. Earlier citations must remain unchanged. Opening another NB form must still start with blank person/event fields. Duplicate references retain normal duplicate handling.

Record Chrome and Firefox outcomes separately, including permission and clipboard
coverage. Safari is untested unless exercised on its actual platform.
