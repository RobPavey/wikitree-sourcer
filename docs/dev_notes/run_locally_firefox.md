# Running the extension locally in the Firefox browser

To test the extension you can load it locally in the Firefox browser but there is a simple build step required.

In the terminal run this command:
`node scripts/build_firefox.js`

This just copies the files from `extension` to `browser_variants/firefox`.

## First time you run after launching Firefox

* In Firefox go to the [Debugging page](about:debugging#/runtime/this-firefox).
* Click on the `Load Temporary Add-on` button under the "Temporary Extensions" heading.
* In the file selector that comes up navigate to your `browser_variants/firefox` folder and select the `manifest.json` file there and press the Open button.
* You should now see the local WikiTree Sourcer extension under the "Temporary Extensions" heading.

You should now see the WikiTree Sourcer extension under the puzzle piece icon when on any web page. You may need pin it to make it show up in the task bar.

## If you make a change to the <site>_extract_data.mjs or <site>_content.mjs

* Run the command `node scripts/build_firefox.js`
* In Firefox go to the [Debugging page](about:debugging#/runtime/this-firefox).
* Click the reload button in under WikiTree Sourcer in Temporary Extensions. This will reload the extension with your changes.
* Go back to the record page you are testing and reload the page.

## If you change other files

* Run the command `node scripts/build_firefox.js`
* In Firefox just bring up the Sourcer menu on an page. It should have your changes.
