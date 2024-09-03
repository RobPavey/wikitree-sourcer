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

const nzbdmStartYear = 1839;
const nzbdmEndYear = 2000;

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: nzbdmStartYear,
    endYear: nzbdmEndYear,
    dateTestType: "bmd",
    countryList: ["New Zealand"],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function nzbdmSearch(generalizedData, typeOfSearch) {
  const input = {
    typeOfSearch: typeOfSearch,
    generalizedData: generalizedData,
    options: options,
  };
  doAsyncActionWithCatch("New Zealand BDM Search", input, async function () {
    let loadedModule = await import(`../core/nzbdm_build_search_data.mjs`);
    let buildResult = loadedModule.buildSearchData(input);

    const checkPermissionsOptions = {
      reason:
        "To perform a search on NZ BDM a content script needs to be loaded on the bdmhistoricalrecords.dia.govt.nz search page.",
    };
    let allowed = await checkPermissionForSite("*://*.bdmhistoricalrecords.dia.govt.nz/*", checkPermissionsOptions);
    if (!allowed) {
      closePopup();
      return;
    }

    // https://www.bdmhistoricalrecords.dia.govt.nz/search/search?path=%2FqueryEntry.m%3Ftype%3Dbirths
    let searchUrl = "https://www.bdmhistoricalrecords.dia.govt.nz/search/search?path=%2FqueryEntry.m%3Ftype%3D";
    searchUrl += typeOfSearch.toLowerCase();

    const searchData = {
      timeStamp: Date.now(),
      url: searchUrl,
      fieldData: buildResult.fieldData,
      selectData: buildResult.selectData,
      searchType: typeOfSearch,
    };

    //console.log("nzbdmSearch, searchData is:");
    //console.log(searchData);

    let reuseTabIfPossible = options.search_nzbdm_reuseExistingTab;

    doBackgroundSearchWithSearchData("nzbdm", searchData, reuseTabIfPossible);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addNzbdmDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItem(menu, "Search New Zealand BDM...", function (element) {
    setupNzbdmSearchSubMenu(data, backFunction, filter);
  });

  return true;
}

function addNzbdmSearchBirthsMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let birthPossibleInRange = data.generalizedData.couldPersonHaveBeenBornInDateRange(
      nzbdmStartYear,
      nzbdmEndYear,
      maxLifespan
    );
    if (!birthPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search New Zealand BDM Births", function (element) {
    nzbdmSearch(data.generalizedData, "Births");
  });
}

function addNzbdmSearchMarriagesMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let marriagePossibleInRange = data.generalizedData.couldPersonHaveMarriedInDateRange(
      nzbdmStartYear,
      nzbdmEndYear,
      maxLifespan
    );
    if (!marriagePossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search New Zealand BDM Marriages", function (element) {
    nzbdmSearch(data.generalizedData, "Marriages");
  });
}

function addNzbdmSearchDeathsMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let deathPossibleInRange = data.generalizedData.couldPersonHaveDiedInDateRange(
      nzbdmStartYear,
      nzbdmEndYear,
      maxLifespan
    );
    if (!deathPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search New Zealand BDM Deaths", function (element) {
    nzbdmSearch(data.generalizedData, "Deaths");
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupNzbdmSearchSubMenu(data, backFunction, filter) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addNzbdmSearchBirthsMenuItem(menu, data, filter);
  addNzbdmSearchDeathsMenuItem(menu, data, filter);
  addNzbdmSearchMarriagesMenuItem(menu, data, filter);

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("nzbdm", "New Zealand BDM", addNzbdmDefaultSearchMenuItem, shouldShowSearchMenuItem);
