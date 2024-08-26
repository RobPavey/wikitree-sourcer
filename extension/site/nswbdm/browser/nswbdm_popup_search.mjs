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

import {
  addBackMenuItem,
  addMenuItem,
  beginMainMenu,
  endMainMenu,
  doAsyncActionWithCatch,
} from "/base/browser/popup/popup_menu_building.mjs";

import {
  doBackgroundSearchWithSearchData,
  registerSearchMenuItemFunction,
  shouldShowSiteSearch,
} from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";
import { checkPermissionForSite } from "/base/browser/popup/popup_permissions.mjs";

const nswbdmStartYear = 1800;
const nswbdmEndYear = 2000;

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: nswbdmStartYear,
    endYear: nswbdmEndYear,
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

async function nswbdmSearch(generalizedData, typeOfSearch) {
  const input = {
    typeOfSearch: typeOfSearch,
    generalizedData: generalizedData,
    options: options,
    runDate: new Date(),
  };
  doAsyncActionWithCatch("New South Wales BDM (Aus) Search", input, async function () {
    let loadedModule = await import(`../core/nswbdm_build_search_data.mjs`);
    let buildResult = loadedModule.buildSearchData(input);

    const checkPermissionsOptions = {
      reason:
        "To perform a search on NSW BDM a content script needs to be loaded on the familyhistory.bdm.nsw.gov.au search page.",
    };
    let allowed = await checkPermissionForSite("*://*.bdm.nsw.gov.au/*", checkPermissionsOptions);
    if (!allowed) {
      closePopup();
      return;
    }

    let searchUrl = "https://familyhistory.bdm.nsw.gov.au/lifelink/familyhistory/search/";
    searchUrl += typeOfSearch.toLowerCase();

    const searchData = {
      timeStamp: Date.now(),
      url: searchUrl,
      fieldData: buildResult.fieldData,
      selectData: buildResult.selectData,
      searchType: typeOfSearch,
      baseName: buildResult.baseName,
    };

    //console.log("nswbdmSearch, searchData is:");
    //console.log(searchData);

    let reuseTabIfPossible = options.search_nswbdm_reuseExistingTab;

    doBackgroundSearchWithSearchData("nswbdm", searchData, reuseTabIfPossible);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addNswbdmDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItem(menu, "Search New South Wales BDM (Aus)...", function (element) {
    setupNswbdmSearchSubMenu(data, backFunction, filter);
  });

  return true;
}

function addNswbdmSearchBirthsMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let birthPossibleInRange = data.generalizedData.couldPersonHaveBeenBornInDateRange(
      nswbdmStartYear,
      nswbdmEndYear,
      maxLifespan
    );
    if (!birthPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search New South Wales BDM Births", function (element) {
    nswbdmSearch(data.generalizedData, "Births");
  });
}

function addNswbdmSearchMarriagesMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let marriagePossibleInRange = data.generalizedData.couldPersonHaveMarriedInDateRange(
      nswbdmStartYear,
      nswbdmEndYear,
      maxLifespan
    );
    if (!marriagePossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search New South Wales BDM Marriages", function (element) {
    nswbdmSearch(data.generalizedData, "Marriages");
  });
}

function addNswbdmSearchDeathsMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let deathPossibleInRange = data.generalizedData.couldPersonHaveDiedInDateRange(
      nswbdmStartYear,
      nswbdmEndYear,
      maxLifespan
    );
    if (!deathPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search New South Wales BDM Deaths", function (element) {
    nswbdmSearch(data.generalizedData, "Deaths");
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupNswbdmSearchSubMenu(data, backFunction, filter) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addNswbdmSearchBirthsMenuItem(menu, data, filter);
  addNswbdmSearchDeathsMenuItem(menu, data, filter);
  addNswbdmSearchMarriagesMenuItem(menu, data, filter);

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction(
  "nswbdm",
  "New South Wales BDM (Aus)",
  addNswbdmDefaultSearchMenuItem,
  shouldShowSearchMenuItem
);
