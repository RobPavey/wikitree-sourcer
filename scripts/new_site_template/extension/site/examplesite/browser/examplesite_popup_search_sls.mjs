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

import { addMenuItem, doAsyncActionWithCatch } from "/base/browser/popup/popup_menu_building.mjs";

import {
  doBackgroundSearchWithSearchData,
  registerSearchMenuItemFunction,
  shouldShowSiteSearch,
} from "/base/browser/popup/popup_search.mjs";

import { checkPermissionForSite } from "/base/browser/popup/popup_permissions.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

const examplesiteStartYear = 1800;
const examplesiteEndYear = 2000;

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: examplesiteStartYear,
    endYear: examplesiteEndYear,
    dateTestType: "bmd",
    countryList: [],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function examplesiteSearch(generalizedData) {
  const input = { generalizedData: generalizedData, options: options };
  doAsyncActionWithCatch("ExampleSite Search", input, async function () {
    let loadedModule = await import(`../core/examplesite_build_search_data.mjs`);
    let buildResult = loadedModule.buildSearchData(input);

    const checkPermissionsOptions = {
      reason: "To perform a search on ExampleSite a content script needs to be loaded on the ExampleSite search page.",
    };
    let allowed = await checkPermissionForSite("exampleSiteUrlMatchString", checkPermissionsOptions);
    if (!allowed) {
      closePopup();
      return;
    }

    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // put URL of this site's search page here
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    let searchUrl = "https://familyhistory.bdm.nsw.gov.au/lifelink/familyhistory/search/births";

    const searchData = {
      timeStamp: Date.now(),
      url: searchUrl,
      fieldData: buildResult.fieldData,
      selectData: buildResult.selectData,
    };

    //console.log("examplesiteSearch, searchData is:");
    //console.log(searchData);

    let reuseTabIfPossible = options.search_examplesite_reuseExistingTab;

    doBackgroundSearchWithSearchData("examplesite", searchData, reuseTabIfPossible);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addExamplesiteDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItem(menu, "Search ExampleSite", function (element) {
    examplesiteSearch(data.generalizedData);
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
  "examplesite",
  "ExampleSite",
  addExamplesiteDefaultSearchMenuItem,
  shouldShowSearchMenuItem
);
