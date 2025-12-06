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

const ecppStartYear = 1750;
const ecppEndYear = 1900;

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: ecppStartYear,
    endYear: ecppEndYear,
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

async function ecppSearch(generalizedData) {
  const input = { generalizedData: generalizedData, options: options };
  doAsyncActionWithCatch("Early California Population Project Search", input, async function () {
    let loadedModule = await import(`../core/ecpp_build_search_data.mjs`);
    let buildResult = loadedModule.buildSearchData(input);

    const checkPermissionsOptions = {
      reason:
        "To perform a search on Early California Population Project a content script needs to be loaded on the Early California Population Project search page.",
    };
    let allowed = await checkPermissionForSite("*://ecpp.ucr.edu/*", checkPermissionsOptions);
    if (!allowed) {
      closePopup();
      return;
    }

    //!!!!!!!!!! CHANGES NEEDED HERE AFTER RUNNING create_new_site SCRIPT !!!!!!!!!!
    // put URL of this site's search page here
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    let searchUrl = "https://ecpp.ucr.edu/ecpp/app/user/view/search";

    const searchData = {
      timeStamp: Date.now(),
      url: searchUrl,
      fieldData: buildResult.fieldData,
      selectData: buildResult.selectData,
    };

    //console.log("ecppSearch, searchData is:");
    //console.log(searchData);

    let reuseTabIfPossible = options.search_ecpp_reuseExistingTab;

    doBackgroundSearchWithSearchData("ecpp", searchData, reuseTabIfPossible);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addEcppDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItem(menu, "Search Early California Population Project", function (element) {
    ecppSearch(data.generalizedData);
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
  "ecpp",
  "Early California Population Project",
  addEcppDefaultSearchMenuItem,
  shouldShowSearchMenuItem
);
