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
  addSameRecordMenuItem,
  addBackMenuItem,
  addMenuItem,
  beginMainMenu,
  endMainMenu,
  doAsyncActionWithCatch,
} from "/base/browser/popup/popup_menu_building.mjs";

import {
  doSearch,
  registerSearchMenuItemFunction,
  testFilterForDatesAndCountries,
} from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

const baclacStartYear = 1837;
const baclacEndYear = 1992;

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function baclacSearch(generalizedData, typeOfSearch) {
  const input = { typeOfSearch: typeOfSearch, generalizedData: generalizedData, options: options };
  doAsyncActionWithCatch("Canada Census Search", input, async function () {
    let loadedModule = await import(`../core/baclac_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addBaclacDefaultSearchMenuItem(menu, data, backFunction, filter) {
  //console.log("addBaclacDefaultSearchMenuItem, data is:");
  //console.log(data);

  const stdCountryName = "England and Wales";

  if (filter) {
    if (!testFilterForDatesAndCountries(filter, baclacStartYear, baclacEndYear, [stdCountryName])) {
      return;
    }
  } else {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let birthPossibleInRange = data.generalizedData.couldPersonHaveBeenBornInDateRange(
      baclacStartYear,
      baclacEndYear,
      maxLifespan
    );
    let deathPossibleInRange = data.generalizedData.couldPersonHaveDiedInDateRange(
      baclacStartYear,
      baclacEndYear,
      maxLifespan
    );
    let marriagePossibleInRange = data.generalizedData.couldPersonHaveMarriedInDateRange(
      baclacStartYear,
      baclacEndYear,
      maxLifespan
    );

    if (!(birthPossibleInRange || deathPossibleInRange || marriagePossibleInRange)) {
      //console.log("addBaclacDefaultSearchMenuItem: dates not in range");
      return;
    }

    if (!data.generalizedData.didPersonLiveInCountryList([stdCountryName])) {
      //console.log("addBaclacDefaultSearchMenuItem: didPersonLiveInCountryList returned false");
      return;
    }
  }

  addMenuItem(menu, "Search Canada Census...", function (element) {
    setupBaclacSearchSubMenu(data, backFunction, filter);
  });

  return true;
}

function addBaclacSameRecordMenuItem(menu, data) {
  addSameRecordMenuItem(menu, data, "baclac", function (element) {
    baclacSearch(data.generalizedData, "SameCollection");
  });
}

function addBaclacSearchBirthsMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let birthPossibleInRange = data.generalizedData.couldPersonHaveBeenBornInDateRange(
      baclacStartYear,
      baclacEndYear,
      maxLifespan
    );
    if (!birthPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Canada Census Births", function (element) {
    baclacSearch(data.generalizedData, "Births");
  });
}

function addBaclacSearchMarriagesMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let marriagePossibleInRange = data.generalizedData.couldPersonHaveMarriedInDateRange(
      baclacStartYear,
      baclacEndYear,
      maxLifespan
    );
    if (!marriagePossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Canada Census Marriages", function (element) {
    baclacSearch(data.generalizedData, "Marriages");
  });
}

function addBaclacSearchDeathsMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let deathPossibleInRange = data.generalizedData.couldPersonHaveDiedInDateRange(
      baclacStartYear,
      baclacEndYear,
      maxLifespan
    );
    if (!deathPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Canada Census Deaths", function (element) {
    baclacSearch(data.generalizedData, "Deaths");
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupBaclacSearchSubMenu(data, backFunction, filter) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addBaclacSameRecordMenuItem(menu, data, filter);
  addBaclacSearchBirthsMenuItem(menu, data, filter);
  addBaclacSearchMarriagesMenuItem(menu, data, filter);
  addBaclacSearchDeathsMenuItem(menu, data, filter);

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("baclac", "Canada Census", addBaclacDefaultSearchMenuItem);
