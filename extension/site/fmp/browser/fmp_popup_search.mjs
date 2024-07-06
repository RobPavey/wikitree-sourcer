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
  setupSearchCollectionsSubMenu,
  addSameRecordMenuItem,
  hasBirthOrDeathYear,
  addBackMenuItem,
  addMenuItemWithSubMenu,
  addMenuItem,
  beginMainMenu,
  endMainMenu,
  doAsyncActionWithCatch,
} from "/base/browser/popup/popup_menu_building.mjs";
import { setupSearchWithParametersSubMenu } from "/base/browser/popup/popup_search_with_parameters.mjs";

import { doSearch, registerSearchMenuItemFunction } from "/base/browser/popup/popup_search.mjs";
import { options } from "/base/browser/options/options_loader.mjs";

function shouldShowSearchMenuItem(data, filter) {
  if (options.search_fmp_domain == "none") {
    return false;
  }
  if (!hasBirthOrDeathYear(data)) {
    return false;
  }
  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function fmpDoSearch(input) {
  doAsyncActionWithCatch("FindMyPast Search", input, async function () {
    let loadedModule = await import(`../core/fmp_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

async function fmpSearch(generalizedData, typeOfSearch) {
  const input = {
    typeOfSearch: typeOfSearch,
    generalizedData: generalizedData,
    options: options,
  };
  fmpDoSearch(input);
}

async function fmpSearchCollection(generalizedData, collectionWtsId) {
  let searchParams = {
    collectionWtsId: collectionWtsId,
  };
  const input = {
    typeOfSearch: "SpecifiedCollection",
    searchParameters: searchParams,
    generalizedData: generalizedData,
    options: options,
  };
  fmpDoSearch(input);
}

async function fmpSearchWithParameters(generalizedData, parameters) {
  const input = {
    typeOfSearch: "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options,
  };
  fmpDoSearch(input);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addFmpDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItemWithSubMenu(
    menu,
    "Search FindMyPast",
    function (element) {
      fmpSearch(data.generalizedData, "");
    },
    function () {
      setupFmpSearchSubMenu(data, backFunction);
    }
  );

  return true;
}

function addFmpSameRecordMenuItem(menu, data) {
  addSameRecordMenuItem(menu, data, "fmp", function (element) {
    fmpSearch(data.generalizedData, "SameCollection");
  });
}

function addFmpSearchCollectionsMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search a specific collection...", function (element) {
    setupSearchCollectionsSubMenu(data, "fmp", fmpSearchCollection, backFunction);
  });
}

function addFmpSearchTreeMenuItem(menu, data) {
  addMenuItem(menu, "Search family tree", function (element) {
    fmpSearch(data.generalizedData, "FamilyTree");
  });
}

function addFmpSearchWithParametersMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search with specified parameters...", function (element) {
    setupFmpSearchWithParametersSubMenu(data, backFunction);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupFmpSearchSubMenu(data, backFunction) {
  let backToHereFunction = function () {
    setupFmpSearchSubMenu(data, backFunction);
  };

  let menu = beginMainMenu();
  addBackMenuItem(menu, backFunction);

  addFmpSameRecordMenuItem(menu, data);
  addFmpSearchCollectionsMenuItem(menu, data, backToHereFunction);
  addFmpSearchTreeMenuItem(menu, data);
  addFmpSearchWithParametersMenuItem(menu, data, backToHereFunction);

  endMainMenu(menu);
}

async function setupFmpSearchWithParametersSubMenu(data, backFunction) {
  let dataModule = await import(`../core/fmp_data.mjs`);
  setupSearchWithParametersSubMenu(data, backFunction, dataModule.FmpData, fmpSearchWithParameters);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("fmp", "FindMyPast", addFmpDefaultSearchMenuItem, shouldShowSearchMenuItem);
