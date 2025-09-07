# Folder structure of the wikitree-sourcer project

## Overview

The code is broken up into modules. It is separated in several ways:

- site specific code (e.g. ancestry or fmp) is separated from each other and from the base code
- code that depends on the browser APIs (and thus can't be used in local unitt tests) is separated from core code
- code that is part of the actual shipping extension is separated from the unit tests

## Top level folders

- extension: contains the code that is published as the extension (this is the Chrome version)
- browser_variants: contains the small number of files that are different for the firefox and safari versions
- scripts: contains javascript files to be run in node.js to perform dev tasks
- unit_tests: contains both the code to run regression tests plus the input files and reference files for the tests
- docs: contains documentation files
- resources: contains images used for creating icons and screenshots used when publishing

## Folders within the extension

- base: this is the code that is not specific to any site
- site: contains a folder for each supported site
- images: icons used in the extension

## browser vs core

Within the base folder and within each site specific folder there are two folders:

- browser: this contains code that relies on the browser APIs, it is not used in the unit tests
- core: this contains the core core that can be tested in the unit tests, we keep as much code as we can in here
