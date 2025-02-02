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

import { addMenuItem, doAsyncActionWithCatch, closePopup } from "/base/browser/popup/popup_menu_building.mjs";

import {
  registerSearchMenuItemFunction,
  shouldShowSiteSearch,
  openUrlInNewTab,
} from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";
import { checkPermissionForSite } from "/base/browser/popup/popup_permissions.mjs";

const psukStartYear = 1858;
const psukEndYear = 2100;

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: psukStartYear,
    endYear: psukEndYear,
    dateTestType: "died",
    countryList: ["England and Wales"],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function psukSearch(generalizedData) {
  const input = { generalizedData: generalizedData, options: options };

  doAsyncActionWithCatch("Probate Search/Find A Will (UK) Search", input, async function () {
    // since many site searchs can be on the popup for a site, it makes sense to dynamically
    // load the build search module
    let loadedModule = await import(`../core/psuk_build_search_data.mjs`);
    let buildResult = loadedModule.buildSearchData(input);

    const checkPermissionsOptions = {
      reason:
        "To perform a search on Probate Search a content script needs to be loaded on the probatesearch.service.gov.uk search page.",
    };
    let allowed = await checkPermissionForSite("*://probatesearch.service.gov.uk/*", checkPermissionsOptions);
    if (!allowed) {
      closePopup();
      return;
    }

    const searchUrl = "https://probatesearch.service.gov.uk/";
    try {
      const searchData = {
        timeStamp: Date.now(),
        url: searchUrl,
        stage1TextFieldData: buildResult.stage1TextFieldData,
        stage1RadioFieldData: buildResult.stage1RadioFieldData,
        stage2TextFieldData: buildResult.stage2TextFieldData,
      };

      chrome.storage.local.set({ searchData: searchData }, function () {
        //console.log('saved searchData, searchData is:');
        //console.log(searchData);
      });
    } catch (ex) {
      console.log("storeDataCache failed");
    }

    openUrlInNewTab(searchUrl);
    closePopup();
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addPsukDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItem(menu, "Search Probate Search/Find A Will (UK)", function (element) {
    psukSearch(data.generalizedData);
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
  "psuk",
  "Probate Search/Find A Will (UK)",
  addPsukDefaultSearchMenuItem,
  shouldShowSearchMenuItem
);
