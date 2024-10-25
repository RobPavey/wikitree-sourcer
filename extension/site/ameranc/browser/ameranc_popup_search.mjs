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
  addBackMenuItem,
  addSameEventMenuItem,
  beginMainMenu,
  endMainMenu,
  doAsyncActionWithCatch,
} from "/base/browser/popup/popup_menu_building.mjs";

import { doSearch, registerSearchMenuItemFunction, shouldShowSiteSearch } from "/base/browser/popup/popup_search.mjs";

import { setupSearchWithParametersSubMenu } from "/base/browser/popup/popup_search_with_parameters.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

const amerancStartYear = 1600;
const amerancEndYear = 2024;

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: amerancStartYear,
    endYear: amerancEndYear,
    dateTestType: "lived",
    countryList: ["United States"],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function doAmerancSearch(input) {
  doAsyncActionWithCatch("American Ancestors Search", input, async function () {
    let loadedModule = await import(`../core/ameranc_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

async function amerancSearch(generalizedData, typeOfSearch) {
  const input = { generalizedData: generalizedData, options: options, typeOfSearch: typeOfSearch };
  doAmerancSearch(input);
}

async function amerancSearchWithParameters(generalizedData, parameters) {
  const input = {
    typeOfSearch: "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options,
  };
  doAmerancSearch(input);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addAmerancDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItemWithSubMenu(
    menu,
    "Search American Ancestors",
    function (element) {
      amerancSearch(data.generalizedData, "");
    },
    function () {
      setupAmerancSearchSubMenu(data, backFunction, filter);
    }
  );

  return true;
}

function addAmerancSameEventMenuItem(menu, data) {
  let added = addSameEventMenuItem(menu, data, function (element) {
    amerancSearch(data.generalizedData, "SameEvent");
  });
}

function addAmerancSearchWithParametersMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search with specified parameters...", function (element) {
    setupAmerancSearchWithParametersSubMenu(data, backFunction);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupAmerancSearchSubMenu(data, backFunction, filter) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addAmerancSameEventMenuItem(menu, data);
  addAmerancSearchWithParametersMenuItem(menu, data, backFunction);

  endMainMenu(menu);
}

async function setupAmerancSearchWithParametersSubMenu(data, backFunction) {
  let dataModule = await import(`../core/ameranc_search_menu_data.mjs`);
  setupSearchWithParametersSubMenu(data, backFunction, dataModule.AmerancData, amerancSearchWithParameters);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction(
  "ameranc",
  "American Ancestors",
  addAmerancDefaultSearchMenuItem,
  shouldShowSearchMenuItem
);
