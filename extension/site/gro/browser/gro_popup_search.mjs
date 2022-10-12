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

import { cachedDataCache, isCachedDataCacheReady } from "/base/browser/common/data_cache.mjs";
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

import { CD } from "/base/core/country_data.mjs";

const groStartYear = 1837;
const groEndYear = 2020;

//////////////////////////////////////////////////////////////////////////////////////////
// Helper functions
//////////////////////////////////////////////////////////////////////////////////////////

function birthYearInGroRange(data) {
  // currently starts at 1837 and there is a gap from 1935-1983
  let birthYear = data.generalizedData.inferBirthYear();
  return birthYear && birthYear >= groStartYear;
}

function deathYearInGroRange(data) {
  // currently starts at 1837 and there is a gap from 1958-1983
  let deathYear = data.generalizedData.inferDeathYear();
  return deathYear && deathYear >= groStartYear;
}

function countryHasGroCoverage(data) {
  let countryArray = data.generalizedData.inferCountries();

  if (countryArray.length > 0) {
    for (let country of countryArray) {
      if (country == "England" || country == "Wales" || CD.isPartOf(country, "England and Wales")) {
        return true;
      }
      if (country == "United Kingdom") {
        // Some Ancestry death registrations have a place like: Hoxne, Suffolk, United Kingdom
        return true;
      }
    }

    return false;
  }

  return true; // country unknown
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function groSearch(generalizedData, typeOfSearch) {
  if (!isCachedDataCacheReady) {
    // dependencies not ready, wait a few milliseconds and try again
    console.log("groSearch, waiting another 10ms");
    setTimeout(function () {
      groSearch(generalizedData, typeOfSearch);
    }, 10);
    return;
  }

  doAsyncActionWithCatch("GRO Search", generalizedData, async function () {
    let loadedModule = await import(`../core/gro_build_search_url.mjs`);
    const input = {
      typeOfSearch: typeOfSearch,
      generalizedData: generalizedData,
      dataCache: cachedDataCache,
    };
    doSearch(loadedModule, input);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addGroSearchBirthsMenuItem(menu, data, filter) {
  if (!filter && !birthYearInGroRange(data)) {
    return;
  }
  addMenuItem(menu, "Search GRO Births", function (element) {
    groSearch(data.generalizedData, "births");
  });
}

function addGroSearchDeathsMenuItem(menu, data, filter) {
  if (!filter && !deathYearInGroRange(data)) {
    return;
  }
  addMenuItem(menu, "Search GRO Deaths", function (element) {
    groSearch(data.generalizedData, "deaths");
  });
}

function addGroDefaultSearchMenuItem(menu, data, backFunction, filter) {
  if (filter) {
    if (!testFilterForDatesAndCountries(filter, groStartYear, groEndYear, ["England and Wales"])) {
      return;
    }
  } else {
    if (!birthYearInGroRange(data) && !deathYearInGroRange(data)) {
      return false;
    }

    if (!countryHasGroCoverage(data)) {
      return false;
    }
  }

  addMenuItem(menu, "Search GRO (UK)...", function (element) {
    setupGroSearchSubMenu(data, backFunction, filter);
  });

  return true;
}

async function addGroSameRecordMenuItem(menu, data) {
  await addSameRecordMenuItem(menu, data, "gro", function (element) {
    groSearch(data.generalizedData, "SameCollection");
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupGroSearchSubMenu(data, backFunction, filter) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  await addGroSameRecordMenuItem(menu, data, filter);
  addGroSearchBirthsMenuItem(menu, data, filter);
  addGroSearchDeathsMenuItem(menu, data, filter);

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("gro", "GRO (UK)", addGroDefaultSearchMenuItem);
