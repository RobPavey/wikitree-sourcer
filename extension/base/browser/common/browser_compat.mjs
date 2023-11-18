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

import { isSafari } from "/base/browser/common/browser_check.mjs";

//////////////////////////////////////////////////////////////////////////////////////////
// Browser compatibility
//////////////////////////////////////////////////////////////////////////////////////////

async function getLocalStorageItem(key) {
  let item = undefined;
  let items = undefined;
  items = await chrome.storage.local.get(key);
  if (items && items[key]) {
    item = items[key];
  }
  return item;
}

async function openOrShowOptionsPage() {
  // Safari doesn't open the existing Options tab if it exists. So in Safari check for that
  // first.
  if (isSafari()) {
    // See if options page is already open
    const optionsUrl = chrome.runtime.getURL("base/browser/options/options.html");
    let views = chrome.extension.getViews({
      type: "tab",
    });

    let existingTab = undefined;
    for (let view of views) {
      if (view.document.documentURI == optionsUrl) {
        let tab = await view.chrome.tabs.getCurrent();
        chrome.tabs.update(tab.id, { active: true });
        chrome.windows.update(tab.windowId, { focused: true });
        return;
      }
    }
  }

  // Not Safari with an existin options page oprn, so use normal method
  chrome.runtime.openOptionsPage();
}

export { getLocalStorageItem, openOrShowOptionsPage };
