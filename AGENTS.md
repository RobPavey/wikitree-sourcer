Markdown

# WikiTree Sourcer Developer Guidelines for AI Agents

## Architecture Overview

- This is a cross-browser extension (Chrome, Firefox, Safari) built with vanilla JavaScript (ES modules) and web extension APIs.
- each supported site has its code in its own folder under `extension/sites` and also has unit/regression tests in its own folder under `unit_tests`

## Code Conventions

- Avoid third-party dependencies or build steps where native JavaScript features suffice.
- Follow the existing error-handling and logging patterns used in neighboring site parsers.
- Always run `node scripts/run_test.js` before submitting changes

## Manifest files and permissions

- host_permissions are avoided and optional_host_permissions are used. This greatly speeds up review times for the Chrome Web Store.

## Adding supprt for a new site

- See the `docs/dev_notes/adding_a_new_site.md` for an explanation of what is required.
- There is a script that developers should run to create the file and folder structure and update the manifest files and files that include the site files. It is `scripts/create_new_site.js`.
- When implementing the site's extracted data reader (the `<site>_ed_reader.mjs` file) the most modern way to do it is a data driven approach. See example sites `gensau`, `qldbdm`, `riksark` and `wagovau`. If the data driven approach doesn't work for this site then fall back to implementing overrides of the base class functions - a hybrid approach is also allowed.
- Try to minimize the code in the extract_data file. Since this is included as a content script it cannot include ES modules
