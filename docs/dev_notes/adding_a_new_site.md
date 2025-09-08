# Adding support for a new site

Note: See the [setup guide](https://github.com/RobPavey/wikitree-sourcer/blob/main/docs/contributors/setup_guide.md) for details of setting up your local repository and build environment before starting on adding a new site. The [README file](https://github.com/RobPavey/wikitree-sourcer/blob/main/docs/readme.md) is the best jumping off point for all developer documentation.

The time taken to add support for a new site varies a lot based on the complexity of the site, the experience of the developer etc. With testing and debugging it usually takes Rob 4-15 days to add a site. The way Sourcer works means that it is not just a matter of scraping the data from the page since the search and narrative support requires interpreting the data.

## Work in the develop branch in your fork when adding a new site

This is so that I can merge a PR to the main repo without affecting the next release being worked on in the main branch.

## Pick a name

The first decision is to choose a unique abbrevation for your new site. This will be all lower case with no spaces or underscores.
For example FindMyPast is `fmp` and Scotlands People is `scotp`. Try to keep it to 10 characters or less.

## Use the create_new_site script to setup the files and folders for your new site

This does many steps for you. The one thing it doesn't do is edit the manifest.json files.

To run the script:

`node scripts/create_new_site.js <sitename> <site display name>`

for example:

`node scripts/create_new_site.js trove "Trove (Aus)"`

See this [separate doc](https://github.com/RobPavey/wikitree-sourcer/blob/main/docs/dev_notes/what_the_create_new_site_script_does.md) for what the script does.

## Add the site to the manifest.json file(s)

This is not done by the create_new_site script.

In order for the popup to work on your site you need to add the site to the manifest files. Because there are four different manifest files (for Chrome, Firefox, Safari macOS and Safari iOS) the same changes need to made to each one. The for files are:
* Chrome: `extension/manifest.json`
* Firefox: `browser_variants/firefox/manifest.json`
* Safari macOS: `browser_variants/safari/macos/manifest.json`
* Safari: iOS: `browser_variants/safari/ios/manifest.json`

There are actually two places in the manifest file that have to be changed to add a site.

### Add a section under "content_scripts"

This is the obvious one. This is what causes the extensions site-specific content script to be loaded when on this site.

### Add a section under "web_accessible_resources"

This is because the `<site>_extract_data.mjs` file is loaded dynamically. Any module loaded dynamically by a content script has to be specified in this section.

## Implement the extract step

The first step is to write the code to extract the data from the web site. For most sites this just involves extracting from one web page with no other fetches required.

The code for this will be in the `extension/site/<site>/core/<site>_extract_data.mjs` file. You can look at other sites for examples.

This step will create an extracted_data structure that is used by the generalize step AND the build citation step. Unlike the generalized_data structure the extracted_data structure can have whatever fields you want but it is suggested that you keep it somewhat similar to other sites just to make maintenance easier.

Key points about this file that make it different to the other steps:
* the `<site>_extract_data.mjs` file cannot import any other modules
* Sourcer does not use jquery. The built-in Javascript functions query_selector and query_selector_all are used
* You can save the web page locally and test this using the unit test framework or test in the browser. Testing locally allows you to implement this before doing any work on the popup code or the manifest.
* See [this doc on the extract data design for more details](https://github.com/RobPavey/wikitree-sourcer/blob/main/docs/dev_notes/extract_data_design.md)

## Implement the generalize step

This step takes the extracted_data structure and builds a generalized_data structure. The generalized_data structure is used for search and for building narrative sentences and can also be used in the build citation step. The generalized_data structure is an instance of the GeneralizedData class.

This step includes assigning a record type and filling in fields like name, birth date, birth place etc.

New sites use a file called `<site>_ed_reader.mjs` to do this. This provides a structure where you just need to fill in the functions that set each fields in the generalized_data structure.

## Implement the build citation step

This step takes the extracted_data and generalized_data (and the options) as input and builds the citation text and saves that to the clipboard. There are common helper classes like citation_builder.mjs you should use.

The code for this will be in the `extension/site/<site>/core/<site>_build_citation.mjs` file.

## Implement search

The search code for the site will allow this site to be searched from WikiTree or from all other sites that WikiTree supports.

The approach taken depends on how the site can be searched. Usually it is one of two ways:
1. The site supports search via the query part of the URL. This is the simplest. Simple example sites are freebmd and fg.
   The code for this will be in the `extension/site/<site>/core/<site>_build_search_url.mjs` file.
3. The site does not support URL query so Sourcer must fill out the form on the sites search page and submit the form. Example sites are vicbdm and wikitree.
   The code for this will be in the `extension/site/<site>/core/<site>_build_search_data.mjs` file.

The create_new_site script assumes the first approach so if using the second approach rename the `<site>_build_search_url.mjs` file and copy the contents from another site using approach 2.

## Implement any extra features for this site

Simple sites will not need anything more but many sites have little extras like context menu support or menu items to build templates etc.

## Problem cases

Some sites present problems in searching or building citations. These may have been encountered for other sites. See [this list of problem cases](https://github.com/RobPavey/wikitree-sourcer/blob/main/docs/dev_notes/site_problem_cases.md) to see if you can follow an existing pattern.

## Documentation

You can add user documentation for the new site to a free space page. When the site support is released you can add a link to the documentation page to the [supported sites](https://www.wikitree.com/wiki/Space:WikiTree_Sourcer_supported_sites) page.
