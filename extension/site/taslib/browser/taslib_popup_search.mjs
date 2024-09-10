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
  addMenuItemWithSubMenu,
  beginMainMenu,
  endMainMenu,
  doAsyncActionWithCatch,
} from "/base/browser/popup/popup_menu_building.mjs";

import { doSearch, registerSearchMenuItemFunction, shouldShowSiteSearch } from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

const taslibStartYear = 1800;
const taslibEndYear = 1990;

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: taslibStartYear,
    endYear: taslibEndYear,
    dateTestType: "bmd",
    countryList: ["Australia"],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function taslibSearch(generalizedData, typeOfSearch) {
  const input = { generalizedData: generalizedData, typeOfSearch: typeOfSearch, options: options };
  doAsyncActionWithCatch("Libraries Tasmania Name Index Search", input, async function () {
    let loadedModule = await import(`../core/taslib_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addTaslibDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItemWithSubMenu(
    menu,
    "Search Libraries Tasmania, Names Index",
    function (element) {
      taslibSearch(data.generalizedData);
    },
    function () {
      setupTaslibSearchSubMenu(data, backFunction, filter);
    }
  );

  return true;
}

function addTaslibSearchBirthsMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let birthPossibleInRange = data.generalizedData.couldPersonHaveBeenBornInDateRange(
      taslibStartYear,
      taslibEndYear,
      maxLifespan
    );
    if (!birthPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Libraries Tasmania, Names Index Births", function (element) {
    taslibSearch(data.generalizedData, "Births");
  });
}

function addTaslibSearchMarriagesMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let marriagePossibleInRange = data.generalizedData.couldPersonHaveMarriedInDateRange(
      taslibStartYear,
      taslibEndYear,
      maxLifespan
    );
    if (!marriagePossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Libraries Tasmania, Names Index Marriages", function (element) {
    taslibSearch(data.generalizedData, "Marriages");
  });
}

function addTaslibSearchDeathsMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let deathPossibleInRange = data.generalizedData.couldPersonHaveDiedInDateRange(
      taslibStartYear,
      taslibEndYear,
      maxLifespan
    );
    if (!deathPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Libraries Tasmania, Names Index Deaths", function (element) {
    taslibSearch(data.generalizedData, "Deaths");
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupTaslibSearchSubMenu(data, backFunction, filter) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addTaslibSearchBirthsMenuItem(menu, data, filter);
  addTaslibSearchDeathsMenuItem(menu, data, filter);
  addTaslibSearchMarriagesMenuItem(menu, data, filter);

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction(
  "taslib",
  "Libraries Tasmania",
  addTaslibDefaultSearchMenuItem,
  shouldShowSearchMenuItem
);
