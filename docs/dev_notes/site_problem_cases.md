# Problem cases when adding support for a site

Some sites do not make it simple to search or build citations for an idividual record. Here are some cases and how they were handled. These may provide useful examples to follow when adding a new site.

## No individual record page

Many sites will show a list of search results but there is no way to click on one and go to an individual record page. There several ways of addressing this.

### Add a way to select a search result

If the site already provides a way to select a result that can be used (see gro site for example). In most cases they don't.
You can search the code for `highlightRow` to see the sites where this is handled by adding a click handler to allow a row to be selected.
Currently that includes naie, nswbdm, nzbdm, psuk, scotp.

### Multiple people in a result or record

A grave record my have more than one person or a marriage record might only have one search result that always lists the groom first.
To allow to to select the person that you want to build a citation for (or do a search for) you can have a drop down at the top of the Sourcer menu.
This is implemented by making a list called primaryPersonOptions in the generalizedData. This is used by the nzbdm site for example.
