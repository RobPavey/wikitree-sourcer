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
  shouldShowSiteSearch,
  doBackgroundSearchWithSearchData,
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

function shouldShowSearchMenuItem(data, filter) {
  const supportedDates = getSupportedDates();

  const siteConstraints = {
    startYear: supportedDates.startYear,
    endYear: supportedDates.endYear,
    dateTestType: "bmd",
    countryList: ["Australia", "Colony of Victoria"],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function doVicbdmSearch(input, isRetry = false) {
  doAsyncActionWithCatch("Victoria BDM (Aus) Search", input, async function () {
    let loadedModule = await import(`../core/vicbdm_build_search_data.mjs`);
    let buildResult = loadedModule.buildSearchData(input);

    const checkPermissionsOptions = {
      reason:
        "To perform a search on Victoria BDM a content script needs to be loaded on the bdm.vic.gov.au search page.",
    };
    let allowed = await checkPermissionForSite("*://*.bdm.vic.gov.au/*", checkPermissionsOptions);
    if (!allowed) {
      closePopup();
      return;
    }

    const searchData = {
      timeStamp: Date.now(),
      url: "https://my.rio.bdm.vic.gov.au/efamily-history/-",
      fieldData: buildResult.fieldData,
      selectData: buildResult.selectData,
    };

    //console.log("doVicbdmSearch, searchData is:");
    //console.log(searchData);

    let reuseTabIfPossible = options.search_vicbdm_reuseExistingTab;

    doBackgroundSearchWithSearchData("vicbdm", searchData, reuseTabIfPossible);
  });
}

async function vicbdmSearch(generalizedData, typeOfSearch) {
  const input = { generalizedData: generalizedData, typeOfSearch: typeOfSearch, options: options };
  doVicbdmSearch(input);
}

async function vicbdmSearchWithParameters(generalizedData, parameters) {
  const input = {
    typeOfSearch: "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options,
  };
  doVicbdmSearch(input);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addVicbdmDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItem(menu, "Search Victoria BDM (Aus)...", function (element) {
    setupVicbdmSearchSubMenu(data, backFunction, filter);
  });

  return true;
}

function addVicbdmSameRecordMenuItem(menu, data) {
  addSameRecordMenuItem(menu, data, "fmp", function (element) {
    vicbdmSearch(data.generalizedData, "SameCollection");
  });
}

function addVicbdmSearchBirthsMenuItem(menu, data, filter) {
  if (!filter) {
    const supportedDates = getSupportedDates();

    let maxLifespan = Number(options.search_general_maxLifespan);
    let birthPossibleInRange = data.generalizedData.couldPersonHaveBeenBornInDateRange(
      supportedDates.startYear,
      supportedDates.birthEndYear,
      maxLifespan
    );
    if (!birthPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Victoria BDM Births", function (element) {
    vicbdmSearch(data.generalizedData, "Births");
  });
}

function addVicbdmSearchMarriagesMenuItem(menu, data, filter) {
  if (!filter) {
    const supportedDates = getSupportedDates();

    let maxLifespan = Number(options.search_general_maxLifespan);
    let marriagePossibleInRange = data.generalizedData.couldPersonHaveMarriedInDateRange(
      supportedDates.startYear,
      supportedDates.marriageEndYear,
      maxLifespan
    );
    if (!marriagePossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Victoria BDM Marriages", function (element) {
    vicbdmSearch(data.generalizedData, "Marriages");
  });
}

function addVicbdmSearchDeathsMenuItem(menu, data, filter) {
  if (!filter) {
    const supportedDates = getSupportedDates();

    let maxLifespan = Number(options.search_general_maxLifespan);
    let deathPossibleInRange = data.generalizedData.couldPersonHaveDiedInDateRange(
      supportedDates.startYear,
      supportedDates.deathEndYear,
      maxLifespan
    );
    if (!deathPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Victoria BDM Deaths", function (element) {
    vicbdmSearch(data.generalizedData, "Deaths");
  });
}

function addVicbdmSearchWithParametersMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search with specified parameters...", function (element) {
    setupVicbdmSearchWithParametersSubMenu(data, backFunction);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupVicbdmSearchSubMenu(data, backFunction, filter) {
  let backToHereFunction = function () {
    setupVicbdmSearchSubMenu(data, backFunction, filter);
  };

  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addVicbdmSameRecordMenuItem(menu, data);
  addVicbdmSearchBirthsMenuItem(menu, data, filter);
  addVicbdmSearchMarriagesMenuItem(menu, data, filter);
  addVicbdmSearchDeathsMenuItem(menu, data, filter);
  addVicbdmSearchWithParametersMenuItem(menu, data, backToHereFunction);

  endMainMenu(menu);
}

async function setupVicbdmSearchWithParametersSubMenu(data, backFunction) {
  let dataModule = await import(`../core/vicbdm_search_menu_data.mjs`);
  setupSearchWithParametersSubMenu(data, backFunction, dataModule.VicbdmData, vicbdmSearchWithParameters);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction(
  "vicbdm",
  "Victoria BDM (Aus)",
  addVicbdmDefaultSearchMenuItem,
  shouldShowSearchMenuItem
);
