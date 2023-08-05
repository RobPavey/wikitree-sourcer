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
  addMenuItem,
  addSameRecordMenuItem,
  addBackMenuItem,
  addMenuItemWithSubMenu,
  beginMainMenu,
  endMainMenu,
  doAsyncActionWithCatch,
} from "/base/browser/popup/popup_menu_building.mjs";
import { setupSearchWithParametersSubMenu } from "/base/browser/popup/popup_search_with_parameters.mjs";

import {
  doSearch,
  registerSearchMenuItemFunction,
  testFilterForDatesAndCountries,
} from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

const openarchStartYear = 1000;
const openarchEndYear = 2023;

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function doOpenarchSearch(input) {
  doAsyncActionWithCatch("Open Archives (NL) Search", input, async function () {
    let loadedModule = await import(`../core/openarch_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

async function openarchSearch(generalizedData, typeOfSearch) {
  const input = { typeOfSearch: typeOfSearch, generalizedData: generalizedData, options: options };
  doOpenarchSearch(input);
}

async function openarchSearchWithParameters(generalizedData, parameters) {
  const input = {
    typeOfSearch: "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options,
  };
  doOpenarchSearch(input);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addOpenarchDefaultSearchMenuItem(menu, data, backFunction, filter) {
  //console.log("addOpenarchDefaultSearchMenuItem, data is:");
  //console.log(data);

  const stdCountryName = "Netherlands";

  if (filter) {
    if (!testFilterForDatesAndCountries(filter, openarchStartYear, openarchEndYear, [stdCountryName])) {
      return;
    }
  } else {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let birthPossibleInRange = data.generalizedData.couldPersonHaveBeenBornInDateRange(
      openarchStartYear,
      openarchEndYear,
      maxLifespan
    );
    let deathPossibleInRange = data.generalizedData.couldPersonHaveDiedInDateRange(
      openarchStartYear,
      openarchEndYear,
      maxLifespan
    );
    let marriagePossibleInRange = data.generalizedData.couldPersonHaveMarriedInDateRange(
      openarchStartYear,
      openarchEndYear,
      maxLifespan
    );

    if (!(birthPossibleInRange || deathPossibleInRange || marriagePossibleInRange)) {
      //console.log("addOpenarchDefaultSearchMenuItem: dates not in range");
      return;
    }

    if (!data.generalizedData.didPersonLiveInCountryList([stdCountryName])) {
      //console.log("addOpenarchDefaultSearchMenuItem: didPersonLiveInCountryList returned false");
      return;
    }
  }

  addMenuItemWithSubMenu(
    menu,
    "Search Open Archives (NL)",
    function (element) {
      openarchSearch(data.generalizedData, "");
    },
    function () {
      setupOpenarchSearchSubMenu(data, backFunction, filter);
    }
  );

  return true;
}

function addOpenarchSameRecordMenuItem(menu, data) {
  let added = addSameRecordMenuItem(menu, data, "openarch", function (element) {
    openarchSearch(data.generalizedData, "SameCollection");
  });

  if (!added && data.generalizedData.sourceOfData == "wiewaswie") {
    addMenuItem(menu, "Search OpenArch for the same record", function (element) {
      openarchSearch(data.generalizedData, "SameCollection");
    });
  }
}

function addOpenarchSearchWithParametersMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search with specified parameters", function (element) {
    setupOpenarchSearchWithParametersSubMenu(data, backFunction);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupOpenarchSearchSubMenu(data, backFunction, filter) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addOpenarchSameRecordMenuItem(menu, data, filter);
  addOpenarchSearchWithParametersMenuItem(menu, data, backFunction);

  endMainMenu(menu);
}

async function setupOpenarchSearchWithParametersSubMenu(data, backFunction) {
  let dataModule = await import(`../core/openarch_search_menu_data.mjs`);
  setupSearchWithParametersSubMenu(data, backFunction, dataModule.OpenarchData, openarchSearchWithParameters);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("openarch", "Open Archives (NL)", addOpenarchDefaultSearchMenuItem);
