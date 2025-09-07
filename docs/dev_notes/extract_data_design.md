# Design of the "extract data" part of a site implementation

Each site has a file named `<sitename>_extract_data.mjs`.
When the popup menu is invoked, this module is used to extract the data from the content page
that is needed by the other modules like `generalize` and `build_citation`.

## Keep it lightweight

By design this file is kept as simple as possible. There are few reasons for this but the main one is that this module is dynamically loaded into the content script whenever the content script is loaded.
So it is one of the few bits of code loaded before the popup menu is invoked.
So for performance reasons we keep it small.

So, the idea is to extract the page data into some easily digestible object structure to make it easy to process for downstream clients
without too much extra interpretation. Make it "as simple as possible, but no simpler".

## Do not import other modules unless really necessary

If a module is imported statically it will increase the size to load all the time (see above).
If it is imported dynamically then it has to be declared in the manifest in `web_accessible_resources`.

Occasionally we might import modules but is the exception rather than the rule. Care has to be taken of all paths in the imports within the imported module.

## Do not assume that the extract_data module is running within the content script enviroment

The extract_data module is also loaded by the unit tests so it can't use APIs that are not available in the node.js environment.
The extract data file is the the `core` subfolder, not the `browser` subfolder.
