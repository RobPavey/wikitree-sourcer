# Adding support for a new site

## Pick a name

The first decision is to choose a unique abbrevation for your new site. This will be all lower case.
For example FindMyPast is fmp and Scotlands People is scotp. Try to keep it to 8 characters or less.

## Create the extension site folder

You can see examples such as extension/site/ancestry. You can see that each one has two subfolders: browser and core. This pattern should be followed.

You can either create these folders manually or you can copy any existing site folder and modify it.

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

### Add imports in the extension/site/all folder

The only javascript code in the extension that has to be modified for each site added is in the extension/site/all folder. You just need to add one import line to each of these files:

- `extension/site/all/browser/popup_register_search_sites.mjs`
- `extension/site/all/core/register_site_options.mjs`

## Create the unit tests site folder

## Add the site to the manifest.json file(s)

In order for the popup to work on your site you need to add the site to the manifest files. Because there are three different manifest files (for Chrome, Firefox and Safari) the same changes need to made to each one.

There are actually three places in the manifest file that have to be changed to add a site.

### Add a section under "content_scripts"

This is the obvious one. This is what causes the extensions site-specific content script to be loaded when on this site.

### Add a section under "web_accessible_resources"

This is because the `<site>_extract_data.mjs` file is loaded dynamically. Any module loaded dynamically by a content script has to be specified in this section

### Add some lines under "host_permissions"

To be honest I forget why this is needed and whether it is needed on all three platforms (Chrome, Safari, Firefox). I think it is related to the code that reloads the content scripts when the extension is installed or re-enabled.



