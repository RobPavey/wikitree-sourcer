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
  addMenuItemWithSubMenu,
  doAsyncActionWithCatch,
  addBackMenuItem,
  addSameRecordMenuItem,
  addSameEventMenuItem,
  beginMainMenu,
  endMainMenu,
  setupSearchCollectionsSubMenu,
} from "/base/browser/popup/popup_menu_building.mjs";

import { doSearch, registerSearchMenuItemFunction, shouldShowSiteSearch } from "/base/browser/popup/popup_search.mjs";
import { setupSearchWithParametersSubMenu } from "/base/browser/popup/popup_search_with_parameters.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

const nodaStartYear = 1200;
const nodaEndYear = 2020;

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: nodaStartYear,
    endYear: nodaEndYear,
    dateTestType: "bmd",
    countryList: ["Norway"],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function doNodaSearch(input) {
  doAsyncActionWithCatch("Search Digitalarkivet (Norway) Search", input, async function () {
    let loadedModule = await import(`../core/noda_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

async function nodaSearch(generalizedData, typeOfSearch) {
  const input = { typeOfSearch: typeOfSearch, generalizedData: generalizedData, options: options };
  doNodaSearch(input);
}

async function nodaSearchSearchCollection(generalizedData, collectionWtsId) {
  let searchParams = {
    collectionWtsId: collectionWtsId,
  };
  const input = {
    typeOfSearch: "SpecifiedCollection",
    searchParameters: searchParams,
    generalizedData: generalizedData,
    options: options,
  };
  doNodaSearch(input);
}

async function nodaSearchWithParameters(generalizedData, parameters) {
  const input = {
    typeOfSearch: "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options,
  };
  doNodaSearch(input);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addNodaDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItemWithSubMenu(
    menu,
    "Search Digitalarkivet (Norway)",
    function (element) {
      nodaSearch(data.generalizedData, "");
    },
    function () {
      setupNodaSearchSubMenu(data, backFunction, filter);
    }
  );

  return true;
}

function addNodaSameRecordMenuItem(menu, data) {
  let added = addSameRecordMenuItem(menu, data, "noda", function (element) {
    nodaSearch(data.generalizedData, "SameCollection");
  });
}

function addNodaSameEventMenuItem(menu, data) {
  let added = addSameEventMenuItem(menu, data, function (element) {
    nodaSearch(data.generalizedData, "SameEvent");
  });
}

function addNodaSearchCollectionsMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search a specific collection...", function (element) {
    setupSearchCollectionsSubMenu(data, "noda", nodaSearchSearchCollection, backFunction);
  });
}

function addNodaSearchWithParametersMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search with specified parameters...", function (element) {
    setupNodaSearchWithParametersSubMenu(data, backFunction);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupNodaSearchSubMenu(data, backFunction, filter) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addNodaSameRecordMenuItem(menu, data, filter);
  addNodaSameEventMenuItem(menu, data);
  addNodaSearchCollectionsMenuItem(menu, data, backFunction);
  addNodaSearchWithParametersMenuItem(menu, data, backFunction);

  endMainMenu(menu);
}

async function setupNodaSearchWithParametersSubMenu(data, backFunction) {
  let dataModule = await import(`../core/noda_search_menu_data.mjs`);
  setupSearchWithParametersSubMenu(data, backFunction, dataModule.NodaData, nodaSearchWithParameters);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("noda", "Digitalarkivet", addNodaDefaultSearchMenuItem, shouldShowSearchMenuItem);
