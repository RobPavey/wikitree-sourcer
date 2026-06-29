# Design of the "extract data" part of a site implementation

Each site has a file named `<sitename>_extract_data.js`.
When the popup menu is invoked, this module is used to extract the data from the content page
that is needed by modules like `generalize` and `build_citation`.

## Keep it lightweight

By design this file is kept as simple as possible. There are few reasons for this but the main one is that this file is loaded with the content scripts whenever a matching page is loaded.
So it is one of the few bits of code loaded before the popup menu is invoked.
So for performance reasons we keep it small.

So, the idea is to extract the page data into some easily digestible object structure to make it easy to process for downstream clients
without too much extra interpretation. Make it "as simple as possible, but no simpler".

## Do not import other modules

The `<sitename>_extract_data.js` file is a special case. It is used in 3 ways:
- it is loaded as part of the content scripts into the genealogy site page context
- it is loaded into the popup menu for a few sites using a `<script>` tag in the popup html
- it is loaded by the unit tests using a wrapper

This file used to be a module and loaded using import. But that required it being listed in the `manifest.json` files under `web_accessible_resources` for every site. A code refactor in March 2026 switched to the new design which does not require `web_accessible_resources`.

## Do not have class, const, or let declarations at the top level of the file

In JavaScript, class, const, and let declarations are block-scoped and do not allow re-declaration in the same scope. In some browsers (Safari for example) the content scripts can get loaded more than once (e.g. if the extension is disabled and then re-enabled). 

So none of the content scripts (which include the _extract_data.js file) should have these at the top-level.

## Do not assume that the extract_data module is running within the content script enviroment

The extract_data file is also loaded by the unit tests so it can't use APIs that are not available in the node.js environment.
