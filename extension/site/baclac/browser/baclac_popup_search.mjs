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
  addMenuItemWithSubMenu,
  beginMainMenu,
  endMainMenu,
  setupSearchCollectionsSubMenu,
  doAsyncActionWithCatch,
} from "/base/browser/popup/popup_menu_building.mjs";

import { setupSearchWithParametersSubMenu } from "/base/browser/popup/popup_search_with_parameters.mjs";

import { doSearch, registerSearchMenuItemFunction, shouldShowSiteSearch } from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

const baclacStartYear = 1800;
const baclacEndYear = 1992;

function shouldShowSearchMenuItem(data, filter) {
  //console.log("shouldShowSearchMenuItem, data is:");
  //console.log(data);

  const siteConstraints = {
    startYear: baclacStartYear,
    endYear: baclacEndYear,
    dateTestType: "bmd",
    countryList: ["Canada"],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function baclacDoSearch(input) {
  doAsyncActionWithCatch("Canada Library and Archives Search", input, async function () {
    let loadedModule = await import(`../core/baclac_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

async function baclacSearch(generalizedData, typeOfSearch) {
  const input = { typeOfSearch: typeOfSearch, generalizedData: generalizedData, options: options };
  baclacDoSearch(input);
}

async function baclacSearchCollection(generalizedData, collectionWtsId) {
  let searchParams = {
    collectionWtsId: collectionWtsId,
  };
  const input = {
    typeOfSearch: "SpecifiedCollection",
    searchParameters: searchParams,
    generalizedData: generalizedData,
    options: options,
  };
  baclacDoSearch(input);
}

async function baclacSearchWithParameters(generalizedData, parameters) {
  const input = {
    typeOfSearch: "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options,
  };
  baclacDoSearch(input);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addBaclacDefaultSearchMenuItem(menu, data, backFunction, filter) {
  //console.log("addBaclacDefaultSearchMenuItem, data is:");
  //console.log(data);

  const siteConstraints = {
    startYear: baclacStartYear,
    endYear: baclacEndYear,
    dateTestType: "bmd",
    countryList: ["Canada"],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  addMenuItemWithSubMenu(
    menu,
    "Search Library and Archives Canada",
    function (element) {
      baclacSearch(data.generalizedData, "Census");
    },
    function () {
      setupBaclacSearchSubMenu(data, backFunction, filter);
    }
  );

  return true;
}

function addBaclacSameRecordMenuItem(menu, data) {
  addSameRecordMenuItem(menu, data, "baclac", function (element) {
    baclacSearch(data.generalizedData, "SameCollection");
  });
}

function addBaclacSearchCensusMenuItem(menu, data) {
  addMenuItem(menu, "Search LAC census records", function (element) {
    baclacSearch(data.generalizedData, "Census");
  });
}

function addBaclacSearchAllCollectionsMenuItem(menu, data) {
  addMenuItem(menu, "Search all LAC collections", function (element) {
    baclacSearch(data.generalizedData, "AllCollections");
  });
}

function addBaclacSearchCollectionsMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search a specific collection...", function (element) {
    setupSearchCollectionsSubMenu(data, "baclac", baclacSearchCollection, backFunction);
  });
}

function addBaclacSearchWithParametersMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search with specified parameters...", function (element) {
    setupBaclacSearchWithParametersSubMenu(data, backFunction);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupBaclacSearchSubMenu(data, backFunction, filter) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addBaclacSameRecordMenuItem(menu, data);
  addBaclacSearchCensusMenuItem(menu, data);
  addBaclacSearchAllCollectionsMenuItem(menu, data);
  addBaclacSearchCollectionsMenuItem(menu, data, backFunction);

  // Not implementing Search with Parameters until there is a clear need
  //addBaclacSearchWithParametersMenuItem(menu, data, backFunction);

  endMainMenu(menu);
}

async function setupBaclacSearchWithParametersSubMenu(data, backFunction) {
  let dataModule = await import(`../core/baclac_search_menu_data.mjs`);
  setupSearchWithParametersSubMenu(data, backFunction, dataModule.BaclacData, baclacSearchWithParameters);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction(
  "baclac",
  "Library and Archives Canada",
  addBaclacDefaultSearchMenuItem,
  shouldShowSearchMenuItem
);
