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

const psukStartYear = 1837;
const psukEndYear = 1992;

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function psukSearch(generalizedData, typeOfSearch) {
  const input = { typeOfSearch: typeOfSearch, generalizedData: generalizedData, options: options };
  doAsyncActionWithCatch("Probate Search/Find A Will (UK) Search", input, async function () {
    let loadedModule = await import(`../core/psuk_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addPsukDefaultSearchMenuItem(menu, data, backFunction, filter) {
  //console.log("addPsukDefaultSearchMenuItem, data is:");
  //console.log(data);

  const stdCountryName = "England and Wales";

  if (filter) {
    if (!testFilterForDatesAndCountries(filter, psukStartYear, psukEndYear, [stdCountryName])) {
      return;
    }
  } else {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let birthPossibleInRange = data.generalizedData.couldPersonHaveBeenBornInDateRange(
      psukStartYear,
      psukEndYear,
      maxLifespan
    );
    let deathPossibleInRange = data.generalizedData.couldPersonHaveDiedInDateRange(
      psukStartYear,
      psukEndYear,
      maxLifespan
    );
    let marriagePossibleInRange = data.generalizedData.couldPersonHaveMarriedInDateRange(
      psukStartYear,
      psukEndYear,
      maxLifespan
    );

    if (!(birthPossibleInRange || deathPossibleInRange || marriagePossibleInRange)) {
      //console.log("addPsukDefaultSearchMenuItem: dates not in range");
      return;
    }

    if (!data.generalizedData.didPersonLiveInCountryList([stdCountryName])) {
      //console.log("addPsukDefaultSearchMenuItem: didPersonLiveInCountryList returned false");
      return;
    }
  }

  addMenuItem(menu, "Search Probate Search/Find A Will (UK)...", function (element) {
    setupPsukSearchSubMenu(data, backFunction, filter);
  });

  return true;
}

async function addPsukSameRecordMenuItem(menu, data) {
  await addSameRecordMenuItem(menu, data, "psuk", function (element) {
    psukSearch(data.generalizedData, "SameCollection");
  });
}

function addPsukSearchBirthsMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let birthPossibleInRange = data.generalizedData.couldPersonHaveBeenBornInDateRange(
      psukStartYear,
      psukEndYear,
      maxLifespan
    );
    if (!birthPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Probate Search/Find A Will (UK) Births", function (element) {
    psukSearch(data.generalizedData, "Births");
  });
}

function addPsukSearchMarriagesMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let marriagePossibleInRange = data.generalizedData.couldPersonHaveMarriedInDateRange(
      psukStartYear,
      psukEndYear,
      maxLifespan
    );
    if (!marriagePossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Probate Search/Find A Will (UK) Marriages", function (element) {
    psukSearch(data.generalizedData, "Marriages");
  });
}

function addPsukSearchDeathsMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let deathPossibleInRange = data.generalizedData.couldPersonHaveDiedInDateRange(
      psukStartYear,
      psukEndYear,
      maxLifespan
    );
    if (!deathPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Probate Search/Find A Will (UK) Deaths", function (element) {
    psukSearch(data.generalizedData, "Deaths");
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupPsukSearchSubMenu(data, backFunction, filter) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  await addPsukSameRecordMenuItem(menu, data, filter);
  addPsukSearchBirthsMenuItem(menu, data, filter);
  addPsukSearchMarriagesMenuItem(menu, data, filter);
  addPsukSearchDeathsMenuItem(menu, data, filter);

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("psuk", "Probate Search/Find A Will (UK)", addPsukDefaultSearchMenuItem);
