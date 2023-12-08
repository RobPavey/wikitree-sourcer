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

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function mhDoSearch(input) {
  doAsyncActionWithCatch("MyHeritage Search", input, async function () {
    let loadedModule = await import(`../core/mh_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

async function mhSearch(generalizedData, typeOfSearch) {
  const input = { generalizedData: generalizedData, typeOfSearch: typeOfSearch, options: options };
  mhDoSearch(input);
}

async function mhSearchCollection(generalizedData, collectionWtsId) {
  let searchParams = {
    collectionWtsId: collectionWtsId,
  };
  const input = {
    typeOfSearch: "SpecifiedCollection",
    searchParameters: searchParams,
    generalizedData: generalizedData,
    options: options,
  };
  mhDoSearch(input);
}

async function mhSearchWithParameters(generalizedData, parameters) {
  const input = {
    typeOfSearch: "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options,
  };
  mhDoSearch(input);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addMhDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItemWithSubMenu(
    menu,
    "Search MyHeritage",
    function (element) {
      mhSearch(data.generalizedData, "");
    },
    function () {
      setupMhSearchSubMenu(data, backFunction);
    }
  );

  return true;
}

function addMhSameRecordMenuItem(menu, data) {
  addSameRecordMenuItem(menu, data, "mh", function (element) {
    mhSearch(data.generalizedData, "SameCollection");
  });
}

function addMhSearchCollectionsMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search a specific collection", function (element) {
    setupSearchCollectionsSubMenu(data, "mh", mhSearchCollection, backFunction);
  });
}

function addMhSearchTreeMenuItem(menu, data) {
  addMenuItem(menu, "Search family tree", function (element) {
    mhSearch(data.generalizedData, "FamilyTree");
  });
}

function addMhSearchWithParametersMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search with specified parameters", function (element) {
    setupMhSearchWithParametersSubMenu(data, backFunction);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupMhSearchSubMenu(data, backFunction) {
  let backToHereFunction = function () {
    setupMhSearchSubMenu(data, backFunction);
  };

  let menu = beginMainMenu();
  addBackMenuItem(menu, backFunction);

  addMhSameRecordMenuItem(menu, data);
  addMhSearchCollectionsMenuItem(menu, data, backToHereFunction);
  addMhSearchTreeMenuItem(menu, data);
  addMhSearchWithParametersMenuItem(menu, data, backToHereFunction);

  endMainMenu(menu);
}

async function setupMhSearchWithParametersSubMenu(data, backFunction) {
  let dataModule = await import(`../core/mh_search_menu_data.mjs`);
  setupSearchWithParametersSubMenu(data, backFunction, dataModule.MhData, mhSearchWithParameters);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("mh", "MyHeritage", addMhDefaultSearchMenuItem);
