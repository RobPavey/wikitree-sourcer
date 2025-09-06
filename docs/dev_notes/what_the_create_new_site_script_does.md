# What the create_new_site script does

See the subsections below for what the script does and how they could be done manually if needed. Note you do not normally need to do these - the script does them automatically.

## It creates the extension site folder

You can see examples such as extension/site/ancestry. You can see that each one has two subfolders: browser and core. This pattern should be followed.

If you don't use the create_new_site script, you can either create these folders manually or you can copy any existing site folder and modify it.

There are certain files that all sites will have and they should follow the naming conventions.

In the browser folder:

- `<site>_content.js`
- `<site>_popup.html`
- `<site>_popup.mjs`
- `<site>_popup_search.mjs`

In the core folder:

- `<site>_build_citation.mjs`
- `<site>_build_search_url.mjs`
- `<site>_extract_data.mjs`
- `<site>_generalize_data.mjs`
- `<site>_options.mjs`
- `<site>_uri_builder.mjs` : this one is not always needed, depending on how searches and citations links are created

## It adds imports in the extension/site/all folder

The only javascript code in the extension that has to be modified for each site added is in the extension/site/all folder. You just need to add one import line to this file:

- `extension/site/all/core/site_names.mjs`

## It creates the unit tests site folder

The unit tests are run locally to check that changes have not changed the output of build_search_url, build_citation etc.
The is a subfolder under unit_tests for each site.

## It adds the javascript file on the unit tests site folder

Look at one of the existing ones as an example. There is a main file `<site>\_test.mjs` that runs the test. You should follow the pattern of the existing tests with a separate .mjs file for each type of test.

## It adds the site to scripts/run_test.js

All that is needed is to add one import. This will register the site for testing.
