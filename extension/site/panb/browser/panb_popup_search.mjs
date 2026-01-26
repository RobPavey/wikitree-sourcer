/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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
  addMenuItem,
  endMainMenu,
  doAsyncActionWithCatch,
  closePopup,
 } from "/base/browser/popup/popup_menu_building.mjs";

import {
  registerSearchMenuItemFunction,
  shouldShowSiteSearch,
  openUrlInNewTab,
} from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";
import { checkPermissionForSite } from "/base/browser/popup/popup_permissions.mjs";

const panbStartYear = 1658;
const panbEndYear = 2014;

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: panbStartYear,
    endYear: panbEndYear,
    dateTestType: "lived",
    countryList: ["New Brunswick","Canada"],
  };
  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }
  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function panbDoSearch(input) {
  doAsyncActionWithCatch("New Brunswick Provincial Archives Search", input, async function () {
    let loadedModule = await import(`../core/panb_build_search_data.mjs`);
    let buildResult = loadedModule.buildSearchData(input);
    let fieldData = buildResult.fieldData;
     const checkPermissionsOptions = {
      reason:
        "To perform a search on New Brunswick Provincial Archives a content script needs to be loaded on the New Brunswick Provincial Archives search page.",
    };
    let allowed = await checkPermissionForSite(
      "https://archives2.gnb.ca/Search/FEDS/Default.aspx?culture=en-CA",
      checkPermissionsOptions
    );
    if (!allowed) {
      closePopup();
      return;
    }
    let searchUrl = "https://archives2.gnb.ca/Search/FEDS/Default.aspx?culture=en-CA";
    try {
      const panbSearchData = {
        timeStamp: Date.now(),
        url: searchUrl,
        fieldData: fieldData,
      }
      // this stores the search data in local storage which is then picked up by the content script in the new tab/window
      chrome.storage.local.set({ panbSearchData: panbSearchData }, function () {});
    } catch (ex) {
      console.log("storeDataCache failed");
    }

    openUrlInNewTab(searchUrl);
    closePopup();
  });
}

async function panbSearch(generalizedData) {
  const input = {
    typeOfSearch: "",
    generalizedData: generalizedData,
    options: options,
  };
  panbDoSearch(input);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addPanbDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItem(menu, "Search New Brunswick Provincial Archives", function (element) {
    panbSearch(data.generalizedData);
  });

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction(
  "panb",
  "New Brunswick Provincial Archives",
  addPanbDefaultSearchMenuItem,
  shouldShowSearchMenuItem
);
