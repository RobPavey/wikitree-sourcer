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

import { addMenuItem, doAsyncActionWithCatch } from "/base/browser/popup/popup_menu_building.mjs";

import { doSearch, registerSearchMenuItemFunction, shouldShowSiteSearch } from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

const nsvrStartYear = 1763;
const nsvrEndYear = 1980;

const COUNTRY_NAMES = ["Nova Scotia", "Canada"];

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: nsvrStartYear,
    endYear: nsvrEndYear,
    dateTestType: "bmd",
    countryList: COUNTRY_NAMES,
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function nsvrSearch(generalizedData) {
  const input = {
    typeOfSearch: typeOfSearch,
    generalizedData: generalizedData,
    options: options,
    runDate: new Date(),
  };
  doAsyncActionWithCatch("Nova Scotia Vital Records Search", input, async function () {
    let loadedModule = await import(`../core/nsvr_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addNsvrDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItem(menu, "Search Nova Scotia Vital Records", function (element) {
    // nsvrSearch(data.generalizedData);
    setupNsvrSearchSubMenu(data, backFunction, filter);
  });

  return true;
}

function addNsvrSearchBirthsMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let birthPossibleInRange = data.generalizedData.couldPersonHaveBeenBornInDateRange(
      nsvrStartYear,
      nsvrEndYear,
      maxLifespan
    );
    if (!birthPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Nova Scotia Births", function (element) {
    nsvrSearch(data.generalizedData, "Births");
  });
}

function addNsvrSearchMarriagesMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let marriagePossibleInRange = data.generalizedData.couldPersonHaveMarriedInDateRange(
      nsvrStartYear,
      nsvrEndYear,
      maxLifespan
    );
    if (!marriagePossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Nova Scotia Marriages", function (element) {
    nsvrSearch(data.generalizedData, "Marriages");
  });
}

function addNsvrSearchDeathsMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let deathPossibleInRange = data.generalizedData.couldPersonHaveDiedInDateRange(
      nsvrStartYear,
      nsvrEndYear,
      maxLifespan
    );
    if (!deathPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Nova Scotia Deaths", function (element) {
    nsvrSearch(data.generalizedData, "Deaths");
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupNsvrSearchSubMenu(data, backFunction, filter) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addNsvrSearchBirthsMenuItem(menu, data, filter);
  addNsvrSearchDeathsMenuItem(menu, data, filter);
  addNsvrSearchMarriagesMenuItem(menu, data, filter);

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction(
  "nsvr",
  "Nova Scotia Vital Records",
  addNsvrDefaultSearchMenuItem,
  shouldShowSearchMenuItem
);
