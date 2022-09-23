# Adding support for a new site

## pick a name

The first decision is to choose a unique abbrevation for your new site. This will be all lower case.
For example FindMyPast is fmp and Scotlands People is scotp. Try to keep it to 8 characters or less.

## Create the extension site folder

You can see examples such as extension/site/ancestry. You can see that each one has two subfolders: browser and core. This pattern should be followed.

You can either create these folders manually or you can copy any existing site folder and modify it.

There are certain files that all sites will have and they should follow the name conventions.

In the browser folder:
- <site>_content.js
- <site>_popup.html
- <site>_popup.mjs
- <site>_popup_search.mjs

In the core folder:
- <site>_build_citation.mjs
- <site>_build_search_url.mjs
- <site>_extract_data.mjs
- <site>_generalize_data.mjs
- <site>_options.mjs
- <site>_uri_builder.mjs

### Add imports in the extension/site/all folder

## Create the unit tests site folder

## Add the site to the manifest.json file(s)



