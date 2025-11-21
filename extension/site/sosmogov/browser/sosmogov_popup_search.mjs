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

const sosmogovStartYear = 1910; // earliest year for death records in the collection
let today = new Date();
let thisYear = today.getFullYear();
const sosmogovEndYear = thisYear - 51; // a death certificate can be available in the year following 50 years after the death date

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: sosmogovStartYear,
    endYear: sosmogovEndYear,
    dateTestType: "died",
    countryList: ["United States"],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function sosmogovSearch(generalizedData) {
  const input = { generalizedData: generalizedData, options: options };
  doAsyncActionWithCatch("Missouri State Archives Search", input, async function () {
    let loadedModule = await import(`../core/sosmogov_build_search_data.mjs`);
    let buildResult = loadedModule.buildSearchData(input);

    const checkPermissionsOptions = {
      reason:
        "To perform a search of Missouri State Archives Death Certificates a content script needs to be loaded on the site's search page.",
    };
    let allowed = await checkPermissionForSite(
      "*://s1.sos.mo.gov/Records/Archives/ArchivesMvc/DeathCertificates/*", // this is results page match pattern
      checkPermissionsOptions
    );
    if (!allowed) {
      closePopup();
      return;
    }

    //!!!!!!!!!! CHANGES NEEDED HERE AFTER RUNNING create_new_site SCRIPT !!!!!!!!!!
    // put URL of this site's search page here
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    let searchUrl = "https://s1.sos.mo.gov/records/archives/archivesmvc/deathcertificates#searchDB";

    const searchData = {
      timeStamp: Date.now(),
      url: searchUrl,
      fieldData: buildResult.fieldData,
      selectData: buildResult.selectData,
    };

    // console.log("sosmogovSearch, searchData is:");
    // console.log(searchData);

    let reuseTabIfPossible = options.search_sosmogov_reuseExistingTab;

    doBackgroundSearchWithSearchData("sosmogov", searchData, reuseTabIfPossible);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addSosmogovDefaultSearchMenuItem(menu, data, backFunction, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let deathPossibleInRange = data.generalizedData.couldPersonHaveDiedInDateRange(
      sosmogovStartYear,
      sosmogovEndYear,
      maxLifespan
    );
    if (!deathPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Death Certificates at Missouri State Archives", function (element) {
    sosmogovSearch(data.generalizedData);
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
  "sosmogov",
  "Missouri State Archives",
  addSosmogovDefaultSearchMenuItem,
  shouldShowSearchMenuItem
);
