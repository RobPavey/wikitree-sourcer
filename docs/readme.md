# README file for the wikitree-sourcer project

This is the development project for the WikiTree Sourcer browser extension. WikiTree Sourcer helps contributors to wikitree.com search for sources and cite them, thus saving a lot of time and manual typing. It also helps create household tables and in adding new profiles to wikitree from other web sites.

More info on the extension is on the WikiTree Free Space Page here: https://www.wikitree.com/wiki/Space:WikiTree_Sourcer

The top level folder is can be named whetever you like but wikitree-sourcer is the convention.
This folder includes the unit tests and other files
that are not part of the shipping extension.

The sub-folder "extension" is the extension itself.

## Notes for Hacktoberfest 2025

This project is participating in Hacktoberfest 2025. The preferred way to contribute is by adding support for a new site. The sites that have been requested have entries in the issues list for this project and can be seen with [this search](https://github.com/RobPavey/wikitree-sourcer/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22Add%20new%20site%22). Issues that are already in progess are marked with the "In progress" label. Some [issues that seem good tasks for Hacktoberfest have the "hacktoberfest" label added](https://github.com/RobPavey/wikitree-sourcer/issues?q=is%3Aissue%20state%3Aopen%20label%3Ahacktoberfest).

For guides on how to get setup and how to add a new site see below.

## Development environment

The extension is being developed by Rob using VSCode on Mac but any editor and platform that supports javascript development can be used.

git and github are used for version control.

Node.js is used for the unit test environment, this requires installing Node.js and some packages.

Xcode is required to test and run the Safari version of the extension (not required for all developers).

The extension uses manifest version 3 (MV3) for all browsers now.

The [Google Javascript Style Guide](https://google.github.io/styleguide/jsguide.html) is the guide used for formatting/coding standards.

## Platform support

There are three variants of the extension:

- Chrome, this is the main development version
- Firefox, there is a separate folder browser_variants/firefox. The only file that is different is the manifest. There is a script `build_firefox.js` that copies all the extension files here for local testing and builds a .zip file for releasing.
- Safari, there is an App that points to the same extension source as the Chrome version. Except for the manifest file which is different.

## Guides for developers

- [Setting up the development environment](contributors/setup_guide.md)
- [Guide to the folder structure](dev_notes/folder_structure.md)
- [Adding support for a new site](dev_notes/adding_a_new_site.md)
- [Running the extension locally in the Chrome browser](dev_notes/run_locally_chrome.md)
- [Running the extension locally in Firefox](dev_notes/run_locally_firefox.md)
- Running the extension locally in Safari (TBD)
- [Running and debugging the unit tests (outside the browser)](dev_notes/run_debug_unit_tests.md)

## More in depth descriptions or architecture and design choices

- [How the extension handles startup and loading](dev_notes/startup_and_loading.md)

  
