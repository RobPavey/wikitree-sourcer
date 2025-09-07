# Running the extension locally in the Chrome browser

To test the extension you can load it locally in the Chrome browser without any build step

## First time setup

* In Chrome go to the [Manage Extensions page](chrome://extensions/).
* If you already have WikiTree Sourcer installed from the Chrome Web Store then disable it with the toggle switch.
* Click on the `Load Unpacked` button at the top left
* In the file selector that comes up navigate to your `wikitree-sourcer/extension` folder and select the manifest.json file there and press the Select button.
* You should now see the local WikiTree Sourcer extension in the Manage Extensions page.
* You can tell the locally installed unpacked extensions from the packed ones installed from the store by the orange circle icon.

You should now see the WikiTree Sourcer extension under the puzzle piece icon when on any web page. You may need pin it to make it show up in the task bar.

## If you make a change to the <site>_extract_data.mjs or <site>_content.mjs

* In Chrome go to the [Manage Extensions page](chrome://extensions/).
* Click the reload icon (circular arrow) in the box for WikiTree Sourcer (unpacked one). This will reload the extension with your changes.
* Go back to the record page you are testing and reload the page.

## If you change other files

For most other files (like generalize_data, build_citation, popups etc) there is no need for a reload.
Just save the code files you edited and go back to the browser and bring up the Sourcer menu and it will have the changes that you made.
