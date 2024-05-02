/*
MIT License

Copyright (c) 2024 Robert M Pavey

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

import {
  beginMainMenu,
  endMainMenu,
  addMenuItem,
  addBackMenuItem,
  addSameRecordMenuItem,
  doAsyncActionWithCatch,
  closePopup,
} from "/base/browser/popup/popup_menu_building.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

import {
  registerSearchMenuItemFunction,
  testFilterForDatesAndCountries,
  openUrlInNewTab,
} from "/base/browser/popup/popup_search.mjs";

import { setupSearchWithParametersSubMenu } from "/base/browser/popup/popup_search_with_parameters.mjs";

import { checkPermissionForSite } from "/base/browser/popup/popup_permissions.mjs";

function getSupportedDates() {
  const recordStartYear = 1836;
  const date = new Date();
  const year = date.getFullYear();
  const recordEndYear = year - 29;

  let birthEndYear = year - 99;
  let marriageEndYear = year - 59;
  let deathEndYear = year - 29;

  const dates = {
    startYear: recordStartYear,
    endYear: recordEndYear,
    birthEndYear: birthEndYear,
    marriageEndYear: marriageEndYear,
    deathEndYear: deathEndYear,
  };

  return dates;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function doVicbdmSearchInNewTab(vicbdmSearchData) {
  let searchUrl = vicbdmSearchData.url;

  const checkPermissionsOptions = {
    reason:
      "To perform a search on Victoria BDM a content script needs to be loaded on the bdm.vic.gov.au search page.",
  };
  let allowed = await checkPermissionForSite("*://*.bdm.vic.gov.au/*", checkPermissionsOptions);
  if (!allowed) {
    closePopup();
    return;
  }

  try {
    // this stores the search data in local storage which is then picked up by the
    // content script in the new tab/window
    chrome.storage.local.set({ vicbdmSearchData: vicbdmSearchData }, function () {
      //console.log('saved vicbdmSearchData, vicbdmSearchData is:');
      //console.log(vicbdmSearchData);
    });
  } catch (ex) {
    console.log("store of vicbdmSearchData failed");
  }

  openUrlInNewTab(searchUrl);
}

async function doVicbdmSearchInExistingTab(tabId, vicbdmSearchData) {
  //console.log("doVicbdmSearchInExistingTab: tabId is: " + tabId);

  // make the tab active
  chrome.tabs.update(tabId, { selected: true });

  let response = await chrome.tabs.sendMessage(tabId, {
    type: "doSearchInExistingTab",
    vicbdmSearchData: vicbdmSearchData,
  });

  if (chrome.runtime.lastError) {
    //console.log("doVicbdmSearchInExistingTab failed, lastError is:");
    //console.log(lastError);
  } else if (!response) {
    //console.log("doVicbdmSearchInExistingTab failed, null response");
    //console.log(message);
  } else {
    //console.log("doVicbdmSearchInExistingTab message sent OK");
    return true;
  }

  return false;
}

async function doVicBdmSearchGivenSearchData(vicbdmSearchData, options, existingTab) {
  //console.log("doVicBdmSearchGivenSearchData. options.search_vicbdm_reuseExistingTab is:");
  //console.log(options.search_vicbdm_reuseExistingTab);
  //console.log("doVicBdmSearchGivenSearchData. existingTab is:");
  //console.log(existingTab);

  if (options.search_vicbdm_reuseExistingTab) {
    if (existingTab) {
      // we are being called from background
      let success = await doVicbdmSearchInExistingTab(existingTab, vicbdmSearchData);
      if (success) {
        return;
      }
    } else {
      // send message to background script that we have a vicbdm tab open
      try {
        let response = await chrome.runtime.sendMessage({ type: "getRegisteredTab", siteName: "vicbdm" });
        // nothing to do, the message needs to send a response though to avoid console error message
        //console.log("doVicbdmSearch, received response from getRegisteredTab message");
        //console.log(response);
        if (chrome.runtime.lastError) {
          // possibly there is no background script loaded, this should never happen
          console.log("doVicbdmSearch: No response from background script, lastError message is:");
          console.log(chrome.runtime.lastError.message);
        } else if (response.success && response.tab) {
          let success = await doVicbdmSearchInExistingTab(response.tab, vicbdmSearchData);
          if (success) {
            return;
          }
        }
      } catch (error) {
        // We expect to get "Error: Could not establish connection. Receiving end does not exist."
        // if there is no existing tab.
        //console.log("doVicbdmSearch: caught error on sendMessage:");
        //console.log(error);
      }
    }
    doVicbdmSearchInNewTab(vicbdmSearchData);
  } else {
    doVicbdmSearchInNewTab(vicbdmSearchData);
  }
}

export { doVicBdmSearchGivenSearchData };
