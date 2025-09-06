# Adding support for a new site

## Work in the develop branch in your fork when adding a new site

This is so that I can merge a PR to the main repo without affecting the next release being worked on in the main branch.

## Pick a name

The first decision is to choose a unique abbrevation for your new site. This will be all lower case with no spaces or underscores.
For example FindMyPast is fmp and Scotlands People is scotp. Try to keep it to 10 characters or less.

## Use the create_new_site script to setup the files and folders for your new site

This does many steps for you. The one thing it doesn't do is edit the manifest.json files.

To run the script:

`node scripts/create_new_site.js <sitename> <site display name>`

for example:

`node scripts/create_new_site.js trove "Trove (Aus)"`

See the subsections below for what the script does and how they could be done manually if needed. Note you do not need to do thse - the script does them automatically.

### It creates the extension site folder

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

### It adds imports in the extension/site/all folder

The only javascript code in the extension that has to be modified for each site added is in the extension/site/all folder. You just need to add one import line to this file:

- `extension/site/all/core/site_names.mjs`

### It creates the unit tests site folder

The unit tests are run locally to check that changes have not changed the output of build_search_url, build_citation etc.
The is a subfolder under unit_tests for each site.

### It adds the javascript file on the unit tests site folder

Look at one of the existing ones as an example. There is a main file `<site>\_test.mjs` that runs the test. You should follow the pattern of the existing tests with a separate .mjs file for each type of test.

### It adds the site to scripts/run_test.js

All that is needed is to add one import. This will register the site for testing.

## Add the site to the manifest.json file(s)

This is not done by the create_new_site script.

In order for the popup to work on your site you need to add the site to the manifest files. Because there are three different manifest files (for Chrome, Firefox and Safari) the same changes need to made to each one.

There are actually two places in the manifest file that have to be changed to add a site.

### Add a section under "content_scripts"

This is the obvious one. This is what causes the extensions site-specific content script to be loaded when on this site.

### Add a section under "web_accessible_resources"

This is because the `<site>_extract_data.mjs` file is loaded dynamically. Any module loaded dynamically by a content script has to be specified in this section.

## Implement the extract step

The first step is to write the code to extract the data from the web site. For most sites this just involves extracting from one web page with no other fetches required.

The code for this will be in the `core/<site_extract_data.mjs>` file. You can look at other sites for examples.

This step will create an extracted_data structure that is used by the generalize step AND the build citation step. Unlike the generalized_data structure the extracted_data structure can have whhatever fields you want but it is suggested that you keep it somewhat similar to other sites just to make maintenance easier.

Key points about this file that make it different to the other steps:
* the `<site>_extract_data.mjs` file cannot import any other modules
* Sourcer does not use jquery. The built-in Javascript functions query_selector and query_selector_all are used
* You can save the web page locally and test this using the unit test framework or test in the browser. Testing locally allows you to implement this before doing any work on the popup code.

## Implement the generalize step

This step takes the extracted_data structure and builds a generalized_data structure. The generalized_data structure is used for searc and for building narrative sentences and can also be used in the build citation step.

## Implement the build citation step

This step takes the extracted_data and generalized_data (and the options) as input and build the citation text and saves that to the clipboard. There are common helper classed like citation_builder.mjs you should use.

## Implement search

The search code for the site will allow this site to be searched from WikiTree or from all other sites that WikiTree supports.

## Implement any extra features for this site

Simple sites will not need anything more but many sites have little extras like context menu support or menu items to build templates etc.
