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

import { callFunctionWithStoredOptions } from "../options/options_loader.mjs";
import { openInNewTab } from "./background_common.mjs";
import { getRegisteredTab } from "./background_register_tab.mjs";

async function doSearchInNewTab(searchData, currentTab, options) {
  let searchUrl = searchData.url;

  try {
    // this stores the search data in local storage which is then picked up by the
    // content script in the new tab/window
    chrome.storage.local.set({ searchData: searchData }, function () {
      //console.log('saved searchData, searchData is:');
      //console.log(searchData);
    });
  } catch (ex) {
    console.log("store of searchData failed");
  }

  openInNewTab(searchUrl, currentTab, options);
}

async function doSearchInExistingTab(tabId, searchData) {
  //console.log("doSearchInExistingTab: tabId is: " + tabId);

  // make the tab active
  chrome.tabs.update(tabId, { active: true });

  try {
    let response = await chrome.tabs.sendMessage(tabId, {
      type: "doSearchInExistingTab",
      searchData: searchData,
    });

    if (chrome.runtime.lastError) {
      console.log("doSearchInExistingTab failed, lastError is:");
      console.log(lastError);
    } else if (!response) {
      console.log("doSearchInExistingTab failed, null response");
      console.log(message);
    } else {
      //console.log("doSearchInExistingTab message sent OK");
      return true;
    }
  } catch (error) {
    console.log("caught error from sendMessage:");
    console.log(error);
  }

  return false;
}

async function doSearchGivenSearchData(searchData, activeTab, options, existingTab, reuseTabIfPossible) {
  console.log("doSearchGivenSearchData. reuseTabIfPossible is:");
  console.log(reuseTabIfPossible);
  console.log("doSearchGivenSearchData. existingTab is:");
  console.log(existingTab);
  console.log("doSearchGivenSearchData. searchData is:");
  console.log(searchData);

  if (reuseTabIfPossible) {
    if (existingTab) {
      // we are being called from background
      let success = await doSearchInExistingTab(existingTab, searchData);
      if (success) {
        return;
      }
    }
    console.log("doSearchGivenSearchData: did not do in existing tab so opening a new one");
    doSearchInNewTab(searchData, activeTab, options);
  } else {
    doSearchInNewTab(searchData, activeTab, options);
  }
}

function handleDoSearchWithSearchDataMessage(request, sender, sendResponse) {
  let tab = sender.tab;
  let siteName = request.siteName;
  let searchData = request.searchData;
  let reuseTabIfPossible = request.reuseTabIfPossible;
  let existingTabId = getRegisteredTab(siteName);

  callFunctionWithStoredOptions(function (options) {
    doSearchGivenSearchData(searchData, tab, options, existingTabId, reuseTabIfPossible);
  });
}

export { handleDoSearchWithSearchDataMessage, doSearchGivenSearchData };
