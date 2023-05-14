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

const irishgStartYear = 1837;
const irishgEndYear = 1992;

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function irishgSearch(generalizedData, typeOfSearch) {
  const input = { typeOfSearch: typeOfSearch, generalizedData: generalizedData, options: options };
  doAsyncActionWithCatch("IrishGenealogy.ie Search", input, async function () {
    let loadedModule = await import(`../core/irishg_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addIrishgDefaultSearchMenuItem(menu, data, backFunction, filter) {
  //console.log("addIrishgDefaultSearchMenuItem, data is:");
  //console.log(data);

  const stdCountryName = "Ireland";

  if (filter) {
    if (!testFilterForDatesAndCountries(filter, irishgStartYear, irishgEndYear, [stdCountryName])) {
      return;
    }
  } else {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let birthPossibleInRange = data.generalizedData.couldPersonHaveBeenBornInDateRange(
      irishgStartYear,
      irishgEndYear,
      maxLifespan
    );
    let deathPossibleInRange = data.generalizedData.couldPersonHaveDiedInDateRange(
      irishgStartYear,
      irishgEndYear,
      maxLifespan
    );
    let marriagePossibleInRange = data.generalizedData.couldPersonHaveMarriedInDateRange(
      irishgStartYear,
      irishgEndYear,
      maxLifespan
    );

    if (!(birthPossibleInRange || deathPossibleInRange || marriagePossibleInRange)) {
      //console.log("addIrishgDefaultSearchMenuItem: dates not in range");
      return;
    }

    if (!data.generalizedData.didPersonLiveInCountryList([stdCountryName])) {
      //console.log("addIrishgDefaultSearchMenuItem: didPersonLiveInCountryList returned false");
      return;
    }
  }

  addMenuItem(menu, "Search IrishGenealogy.ie...", function (element) {
    setupIrishgSearchSubMenu(data, backFunction, filter);
  });

  return true;
}

async function addIrishgSameRecordMenuItem(menu, data) {
  await addSameRecordMenuItem(menu, data, "irishg", function (element) {
    irishgSearch(data.generalizedData, "SameCollection");
  });
}

function addIrishgSearchCivilRecordsMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let birthPossibleInRange = data.generalizedData.couldPersonHaveBeenBornInDateRange(
      irishgStartYear,
      irishgEndYear,
      maxLifespan
    );
    if (!birthPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search IrishGenealogy.ie Civil Records", function (element) {
    irishgSearch(data.generalizedData, "civilrecords");
  });
}

function addIrishgSearchChurchRecordsMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let marriagePossibleInRange = data.generalizedData.couldPersonHaveMarriedInDateRange(
      irishgStartYear,
      irishgEndYear,
      maxLifespan
    );
    if (!marriagePossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search IrishGenealogy.ie Church Records", function (element) {
    irishgSearch(data.generalizedData, "churchrecords");
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupIrishgSearchSubMenu(data, backFunction, filter) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addIrishgSearchCivilRecordsMenuItem(menu, data, filter);
  addIrishgSearchChurchRecordsMenuItem(menu, data, filter);

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("irishg", "IrishGenealogy.ie", addIrishgDefaultSearchMenuItem);
