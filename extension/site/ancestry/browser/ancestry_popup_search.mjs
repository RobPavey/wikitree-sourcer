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
  if (options.search_ancestry_domain == "none") {
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

async function ancestryDoSearch(input) {
  // doesn't need dataCache, dataObj or preloaded modules (because not writing to clipboard)
  doAsyncActionWithCatch("Ancestry Search", input, async function () {
    let loadedModule = await import(`../core/ancestry_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

async function ancestrySearch(generalizedData, typeOfSearch) {
  const input = {
    typeOfSearch: typeOfSearch,
    generalizedData: generalizedData,
    options: options,
  };
  ancestryDoSearch(input);
}

async function ancestrySearchCollection(generalizedData, collectionWtsId) {
  let searchParams = {
    collectionWtsId: collectionWtsId,
  };
  const input = {
    typeOfSearch: "SpecifiedCollection",
    searchParameters: searchParams,
    generalizedData: generalizedData,
    options: options,
  };
  ancestryDoSearch(input);
}

async function ancestrySearchWithParameters(generalizedData, parameters) {
  const input = {
    typeOfSearch: "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options,
  };
  ancestryDoSearch(input);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addAncestryDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItemWithSubMenu(
    menu,
    "Search Ancestry",
    function (element) {
      ancestrySearch(data.generalizedData, "");
    },
    function () {
      setupAncestrySearchSubMenu(data, backFunction);
    }
  );
  return true;
}

function addAncestrySameRecordMenuItem(menu, data) {
  addSameRecordMenuItem(menu, data, "ancestry", function (element) {
    ancestrySearch(data.generalizedData, "SameCollection");
  });
}

function addAncestrySearchCollectionsMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search a specific collection...", function (element) {
    setupSearchCollectionsSubMenu(data, "ancestry", ancestrySearchCollection, backFunction);
  });
}

function addAncestryTreesMenuItem(menu, data) {
  addMenuItem(menu, "Search family trees", function (element) {
    ancestrySearch(data.generalizedData, "FamilyTree");
  });
}

function addAncestrySearchWithParametersMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search with specified parameters...", function (element) {
    setupAncestrySearchWithParametersSubMenu(data, backFunction);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupAncestrySearchSubMenu(data, backFunction) {
  let backToHereFunction = function () {
    setupAncestrySearchSubMenu(data, backFunction);
  };

  let menu = beginMainMenu();
  addBackMenuItem(menu, backFunction);

  addAncestrySameRecordMenuItem(menu, data);
  addAncestrySearchCollectionsMenuItem(menu, data, backToHereFunction);
  addAncestryTreesMenuItem(menu, data);
  addAncestrySearchWithParametersMenuItem(menu, data, backToHereFunction);

  endMainMenu(menu);
}

async function setupAncestrySearchWithParametersSubMenu(data, backFunction) {
  let dataModule = await import(`../core/ancestry_data.mjs`);
  setupSearchWithParametersSubMenu(data, backFunction, dataModule.AncestryData, ancestrySearchWithParameters);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("ancestry", "Ancestry", addAncestryDefaultSearchMenuItem, shouldShowSearchMenuItem);
