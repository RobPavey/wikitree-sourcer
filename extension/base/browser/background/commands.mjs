/*
MIT License

Copyright (c) 2020 Robert M Pavey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
  This is disabled.
  If at some point we want a keyboard shortcut for something like "Build Inline Citation" the code below is a start.
  It requires a "commands" section in manifest.json

  It will require some refactoring and might not work in Safari since writing the citation to the clipboard may fail.

async function executeContentCommand(command) {
  let items = await chrome.storage.sync.get({ options: defaultOptions });
  let options = items.options;

  let tabs = await chrome.tabs.query({active: true, currentWindow: true});
  let activeTab = tabs[0];

  try {
    chrome.tabs.sendMessage(activeTab.id, {type: "extract"}, function(response) {
    
      if (chrome.runtime.lastError) {
        // possibly there is no content script loaded, bring up default menu for unknown pages
        //setupDefaultPopupMenu();
      }
      else {
        var type = response.contentType;

        //console.log("setupMenuBasedOnContent, extractedData is:");
        //console.log(response.extractedData);

        if (type == "fs") {
          fsExecuteContentCommand(command, response.extractedData);
        }
      }
    });
  }
  catch (error) {
    console.log(error);
  }
}

chrome.commands.onCommand.addListener((command) => {
  console.log(`Command: ${command}`);
  executeContentCommand(command);
});

*/
