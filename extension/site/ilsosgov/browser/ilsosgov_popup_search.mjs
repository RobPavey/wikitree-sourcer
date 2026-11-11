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
  addBackMenuItem,
  addMenuItem,
  beginMainMenu,
  endMainMenu,
  doAsyncActionWithCatch,
  closePopup,
} from "/base/browser/popup/popup_menu_building.mjs";

import {
  doBackgroundSearchWithSearchData,
  registerSearchMenuItemFunction,
  shouldShowSiteSearch,
} from "/base/browser/popup/popup_search.mjs";

import { checkPermissionForSiteMatches } from "/base/browser/popup/popup_permissions.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

const ilsosgovDeathsPre1916StartYear = 1850; // earliest year for death records in the post-1915 collection
const ilsosgovDeathsPre1916EndYear = 1915; // latest year for death records in the post-1915 collection
const ilsosgovDeathsPost1915StartYear = 1916; // earliest year for death records in the post-1915 collection
const ilsosgovDeathsPost1915EndYear = 1972; // latest year for death records in the post-1915 collection
const ilsosgovMarriagesStartYear = 1763; // earliest year for death records in the post-1915 collection
const ilsosgovMarriagesEndYear = 1900; // latest year for death records in the post-1915 collection

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: ilsosgovMarriagesStartYear,
    endYear: ilsosgovDeathsPost1915EndYear,
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

async function ilsosgovSearch(generalizedData, typeOfSearch) {
  const input = { generalizedData: generalizedData, options: options, typeOfSearch: typeOfSearch };
  doAsyncActionWithCatch("Illinois State Archives Search", input, async function () {
    let loadedModule = await import(`../core/ilsosgov_build_search_data.mjs`);
    let buildResult = loadedModule.buildSearchData(input);

    const checkPermissionsOptions = {
      reason:
        "To perform a search of Illinois State Archives a content script needs to be loaded on the site's search page.",
    };
    let allowed = await checkPermissionForSiteMatches("ilsosgov", checkPermissionsOptions);
    if (!allowed) {
      closePopup();
      return;
    }

    //!!!!!!!!!! CHANGES NEEDED HERE AFTER RUNNING create_new_site SCRIPT !!!!!!!!!!
    // put URL of this site's search page here
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    let searchUrl = "";
    if (typeOfSearch == "deathsPre1916") {
      searchUrl = "https://apps.ilsos.gov/isavital/deathsrch.jsp";
    } else if (typeOfSearch == "deathsPost1915") {
      searchUrl = "https://apps.ilsos.gov/isavital/idphdeathsrch.jsp";
    } else if (typeOfSearch == "marriagesByGroom") {
      searchUrl = "https://apps.ilsos.gov/isavital/marriagesrch.jsp";
    } else if (typeOfSearch == "marriagesByBride") {
      searchUrl = "https://apps.ilsos.gov/isavital/marriagesrch.jsp";
    }

    const searchData = {
      timeStamp: Date.now(),
      url: searchUrl,
      fieldData: buildResult.fieldData,
      selectData: buildResult.selectData,
    };

    // console.log("ilsosgovSearch, searchData is:");
    // console.log(searchData);

    let reuseTabIfPossible = options.search_ilsosgov_reuseExistingTab;

    doBackgroundSearchWithSearchData("ilsosgov", searchData, reuseTabIfPossible);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addIlsosgovDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItem(menu, "Search Illinois State Archives ...", function (element) {
    setupIlsosgovSearchSubmenu(data.generalizedData, backFunction, filter);
  });

  return true;
}

function addIlsosgovSearchDeathsPre1916MenuItem(menu, generalizedData, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let deathPossibleInRange = generalizedData.couldPersonHaveDiedInDateRange(
      ilsosgovDeathsPre1916StartYear,
      ilsosgovDeathsPre1916EndYear,
      maxLifespan
    );
    if (!deathPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Illinois Statewide Death Index, Pre-1916", function (element) {
    ilsosgovSearch(generalizedData, "deathsPre1916");
  });
}

function addIlsosgovSearchDeathsPost1915MenuItem(menu, generalizedData, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let deathPossibleInRange = generalizedData.couldPersonHaveDiedInDateRange(
      ilsosgovDeathsPost1915StartYear,
      ilsosgovDeathsPost1915EndYear,
      maxLifespan
    );
    if (!deathPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Illinois Statewide Death Index, 1916-1972", function (element) {
    ilsosgovSearch(generalizedData, "deathsPost1915");
  });
}

function addIlsosgovSearchMarriagesByGroomMenuItem(menu, generalizedData, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let marriagePossibleInRange = generalizedData.couldPersonHaveMarriedInDateRange(
      ilsosgovMarriagesStartYear,
      ilsosgovMarriagesEndYear,
      maxLifespan
    );
    if (!marriagePossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Illinois Statewide Marriage Index, 1763-1900 By Groom", function (element) {
    ilsosgovSearch(generalizedData, "marriagesByGroom");
  });
}

function addIlsosgovSearchMarriagesByBrideMenuItem(menu, generalizedData, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let marriagePossibleInRange = generalizedData.couldPersonHaveMarriedInDateRange(
      ilsosgovMarriagesStartYear,
      ilsosgovMarriagesEndYear,
      maxLifespan
    );
    if (!marriagePossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Illinois Statewide Marriage Index, 1763-1900 By Bride", function (element) {
    ilsosgovSearch(generalizedData, "marriagesByBride");
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupIlsosgovSearchSubmenu(generalizedData, backFunction, filter) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addIlsosgovSearchDeathsPre1916MenuItem(menu, generalizedData, filter);
  addIlsosgovSearchDeathsPost1915MenuItem(menu, generalizedData, filter);
  addIlsosgovSearchMarriagesByGroomMenuItem(menu, generalizedData, filter);
  addIlsosgovSearchMarriagesByBrideMenuItem(menu, generalizedData, filter);

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction(
  "ilsosgov",
  "Illinois State Archives",
  addIlsosgovDefaultSearchMenuItem,
  shouldShowSearchMenuItem
);
