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

function wikitreeDoSearch(input) {
  doAsyncActionWithCatch("WikiTree Search", input, async function () {
    // since many site searchs can be on the popup for a site, it makes sense to dynamically
    // load the build search module
    let loadedModule = await import(`../core/wikitree_build_search_data.mjs`);
    let buildResult = loadedModule.buildSearchData(input);

    let fieldData = buildResult.fieldData;

    const searchUrl = "https://www.wikitree.com/wiki/Special:SearchPerson";
    try {
      const wikitreeSearchData = {
        timeStamp: Date.now(),
        url: searchUrl,
        fieldData: fieldData,
      };

      chrome.storage.local.set({ wikitreeSearchData: wikitreeSearchData }, function () {
        //console.log('saved wikitreeSearchData, wikitreeSearchData is:');
        //console.log(wikitreeSearchData);
      });
    } catch (ex) {
      console.log("storeDataCache failed");
    }

    if (options.search_general_new_window) {
      chrome.windows.create({ url: searchUrl });
    } else {
      chrome.tabs.create({ url: searchUrl });
    }
    window.close();
  });
}

async function wikitreePlusDoSearch(input) {
  doAsyncActionWithCatch("WikiTree Plus Search", input, async function () {
    let loadedModule = await import(`../core/wikitree_plus_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

async function wikitreeSearch(generalizedData) {
  const input = {
    typeOfSearch: "",
    generalizedData: generalizedData,
    options: options,
  };
  wikitreeDoSearch(input);
}

async function wikitreePlusSearch(generalizedData) {
  const input = {
    typeOfSearch: "",
    generalizedData: generalizedData,
    options: options,
  };

  wikitreePlusDoSearch(input);
}

async function wikitreeSearchWithParameters(generalizedData, parameters) {
  const input = {
    typeOfSearch: "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options,
  };

  if (parameters.category == "wikitree_person_search") {
    wikitreeDoSearch(input);
  } else if (parameters.category == "wikitree_plus_search") {
    wikitreePlusDoSearch(input);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addWikitreeDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItemWithSubMenu(
    menu,
    "Search WikiTree",
    function (element) {
      wikitreeSearch(data.generalizedData);
    },
    function () {
      setupWikitreeSearchSubMenu(data, backFunction);
    }
  );

  return true;
}

function addWikitreeSearchWithParametersMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search using WikiTree Plus", function (element) {
    wikitreePlusSearch(data.generalizedData);
  });
  addMenuItem(menu, "Search with specified parameters", function (element) {
    setupWikitreeSearchWithParametersSubMenu(data, backFunction);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupWikitreeSearchSubMenu(data, backFunction) {
  let backToHereFunction = function () {
    setupWikitreeSearchSubMenu(data, backFunction);
  };

  let menu = beginMainMenu();
  addBackMenuItem(menu, backFunction);

  addWikitreeSearchWithParametersMenuItem(menu, data, backToHereFunction);

  endMainMenu(menu);
}

async function setupWikitreeSearchWithParametersSubMenu(data, backFunction) {
  let dataModule = await import(`../core/wikitree_search_menu_data.mjs`);
  setupSearchWithParametersSubMenu(data, backFunction, dataModule.WikitreeData, wikitreeSearchWithParameters);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("wikitree", "WikiTree", addWikitreeDefaultSearchMenuItem);
