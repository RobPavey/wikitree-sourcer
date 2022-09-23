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

//////////////////////////////////////////////////////////////////////////////////////////
// Browser compatibility
//////////////////////////////////////////////////////////////////////////////////////////

async function getTabDetails(tabId) {
  // while chrome.tabs.get exists on Firefox it does not return a promise so await doesn't work
  // meanwhile the browser global does not exist in Chrome
  if (typeof browser === "undefined") {
    return await chrome.tabs.get(tabId);
  }
  else {
    return await browser.tabs.get(tabId);
  }
}

async function getLocalStorageItem(key) {
  let item = undefined;
  let items = undefined;
  if (typeof browser === "undefined") {
    items = await chrome.storage.local.get(key);
  }
  else {
    items = await browser.storage.local.get(key);
  }

  if (items && items[key]) {
    item = items[key];
  }
  return item;
}

async function getSyncStorageItems(keyList) {
  let items = undefined;
  if (typeof browser === "undefined") {
    items = await chrome.storage.sync.get(keyList);
  }
  else {
    items = await browser.storage.sync.get(keyList);
  }
  return items;
}

export { getTabDetails, getLocalStorageItem, getSyncStorageItems };