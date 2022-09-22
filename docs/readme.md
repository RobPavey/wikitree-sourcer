# README file for WikiTreeSourcer

This is the development project for the WikiTree Sourcer browser extension.

More info on the extension is on the WikiTree Free Space Page here: https://www.wikitree.com/wiki/Space:WikiTree_Sourcer

The top level folder is WikiTreeSourcer_Project. This includes the unit tests and other files
that are not part of the shipping extension.

The sub-folder "extension" is the extension itself.

## Development environment

The extension is being developed using VSCode on Mac. 

git and github are used for version control.

Node.js is used for the unit test environment, this requires installing Node.js and some packages.

Xcode is required to test and run the Safari version of the extension.

The extension uses manifest version 3 (MV3) for Chrome and manifest version 2 (MV2) for Firefox and Safari.

## Platform support

There are three variants of the extension:
- Chrome, this is the main development version
- Firefox, there is a separate folder browser_variants/firefox. The only file that is different is the manifest
- Safari, there is an App that points to the same extension source as the Chrome version. Except for the manifest file which is different.