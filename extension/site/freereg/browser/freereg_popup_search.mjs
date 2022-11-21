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
  closePopup,
} from "/base/browser/popup/popup_menu_building.mjs";
import { setupSearchWithParametersSubMenu } from "/base/browser/popup/popup_search_with_parameters.mjs";

import { registerSearchMenuItemFunction, testFilterForDatesAndCountries } from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

const freeregStartYear = 1538;

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

function freeregDoSearch(input) {
  doAsyncActionWithCatch("FreeReg Search", input, async function () {
    // since many site searchs can be on the popup for a site, it makes sense to dynamically
    // load the build search module
    let loadedModule = await import(`../core/freereg_build_search_data.mjs`);
    let buildResult = loadedModule.buildSearchData(input);

    let fieldData = buildResult.fieldData;

    const searchUrl = "https://www.freereg.org.uk/search_queries/new?locale=en";
    try {
      const freeregSearchData = {
        timeStamp: Date.now(),
        url: searchUrl,
        fieldData: fieldData,
      };

      // this stores the search data in local storage which is then picked up by the
      // content script in the new tab/window
      chrome.storage.local.set({ freeregSearchData: freeregSearchData }, function () {
        //console.log('saved freeregSearchData, freeregSearchData is:');
        //console.log(freeregSearchData);
      });
    } catch (ex) {
      console.log("storeDataCache failed");
    }

    if (options.search_general_new_window) {
      chrome.windows.create({ url: searchUrl });
    } else {
      chrome.tabs.create({ url: searchUrl });
    }
    closePopup();
  });
}

async function freeregSearch(generalizedData, typeOfSearch) {
  const input = {
    typeOfSearch: typeOfSearch,
    generalizedData: generalizedData,
    options: options,
  };
  freeregDoSearch(input);
}

async function freeregSearchWithParameters(generalizedData, parameters) {
  const input = {
    typeOfSearch: "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options,
  };
  freeregDoSearch(input);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addFreeregDefaultSearchMenuItem(menu, data, backFunction, filter) {
  //console.log("addFreeregDefaultSearchMenuItem, data is:");
  //console.log(data);

  if (filter) {
    if (!testFilterForDatesAndCountries(filter, freeregStartYear, undefined, ["United Kingdom"])) {
      return;
    }
  } else {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let birthPossibleInRange = data.generalizedData.couldPersonHaveBeenBornInDateRange(
      freeregStartYear,
      undefined,
      maxLifespan
    );
    let deathPossibleInRange = data.generalizedData.couldPersonHaveDiedInDateRange(
      freeregStartYear,
      undefined,
      maxLifespan
    );
    let marriagePossibleInRange = data.generalizedData.couldPersonHaveMarriedInDateRange(
      freeregStartYear,
      undefined,
      maxLifespan
    );

    if (!(birthPossibleInRange || deathPossibleInRange || marriagePossibleInRange)) {
      //console.log("addFreeregDefaultSearchMenuItem: dates not in range");
      return;
    }

    if (!data.generalizedData.didPersonLiveInCountryList(["United Kingdom"])) {
      //console.log("addFreeregDefaultSearchMenuItem: didPersonLiveInCountryList returned false");
      return;
    }
  }

  addMenuItem(menu, "Search FreeReg (UK)...", function (element) {
    setupFreeregSearchSubMenu(data, backFunction, filter);
  });

  return true;
}

function addFreeregSearchBaptismsMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let birthPossibleInRange = data.generalizedData.couldPersonHaveBeenBornInDateRange(
      freeregStartYear,
      undefined,
      maxLifespan
    );
    if (!birthPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search FreeReg Baptisms", function (element) {
    freeregSearch(data.generalizedData, "baptism");
  });
}

function addFreeregSearchMarriagesMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let marriagePossibleInRange = data.generalizedData.couldPersonHaveMarriedInDateRange(
      freeregStartYear,
      undefined,
      maxLifespan
    );
    if (!marriagePossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search FreeReg Marriages", function (element) {
    freeregSearch(data.generalizedData, "marriage");
  });
}

function addFreeregSearchBurialsMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let deathPossibleInRange = data.generalizedData.couldPersonHaveDiedInDateRange(
      freeregStartYear,
      undefined,
      maxLifespan
    );
    if (!deathPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search FreeReg Burials", function (element) {
    freeregSearch(data.generalizedData, "burial");
  });
}

function addFreeregSearchAllTypesMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = options.search_general_maxLifespan;
    let livingPossibleInRange = data.generalizedData.couldPersonHaveLivedInDateRange(
      freeregStartYear,
      undefined,
      maxLifespan
    );
    if (!livingPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search FreeReg All Types", function (element) {
    freeregSearch(data.generalizedData, "all");
  });
}

function addFreeregSearchWithParametersMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search with specified parameters", function (element) {
    setupFreeregSearchWithParametersSubMenu(data, backFunction);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupFreeregSearchSubMenu(data, backFunction, filter) {
  let backToHereFunction = function () {
    setupFreeregSearchSubMenu(data, backFunction);
  };

  let menu = beginMainMenu();
  addBackMenuItem(menu, backFunction);

  addFreeregSearchBaptismsMenuItem(menu, data, filter);
  addFreeregSearchMarriagesMenuItem(menu, data, filter);
  addFreeregSearchBurialsMenuItem(menu, data, filter);
  addFreeregSearchAllTypesMenuItem(menu, data, filter);
  addFreeregSearchWithParametersMenuItem(menu, data, backToHereFunction);

  endMainMenu(menu);
}

async function setupFreeregSearchWithParametersSubMenu(data, backFunction) {
  let dataModule = await import(`../core/freereg_data.mjs`);
  setupSearchWithParametersSubMenu(data, backFunction, dataModule.FreeregData, freeregSearchWithParameters);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("freereg", "FreeReg (UK)", addFreeregDefaultSearchMenuItem);
