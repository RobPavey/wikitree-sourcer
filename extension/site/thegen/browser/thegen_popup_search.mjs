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

const thegenStartYear = 1500;
const thegenEndYear = 2025;

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: thegenStartYear,
    endYear: thegenEndYear,
    dateTestType: "lived",
    countryList: ["England", "Scotland", "Wales", "Ireland"],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function doThegenSearch(input) {
  doAsyncActionWithCatch("The Genealogist Search", input, async function () {
    let loadedModule = await import(`../core/thegen_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

async function thegenSearch(generalizedData, typeOfSearch) {
  const input = { generalizedData: generalizedData, options: options, typeOfSearch: typeOfSearch };
  doThegenSearch(input);
}

async function thegenSearchWithParameters(generalizedData, parameters) {
  const input = {
    typeOfSearch: "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options,
  };
  doThegenSearch(input);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addThegenDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItemWithSubMenu(
    menu,
    "Search The Genealogist",
    function (element) {
      thegenSearch(data.generalizedData, "");
    },
    function () {
      setupThegenSearchSubMenu(data, backFunction, filter);
    }
  );

  return true;
}

function addThegenSameEventMenuItem(menu, data) {
  let added = addSameEventMenuItem(menu, data, function (element) {
    thegenSearch(data.generalizedData, "SameEvent");
  });
}

function addThegenSearchWithParametersMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search with specified parameters...", function (element) {
    setupThegenSearchWithParametersSubMenu(data, backFunction);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupThegenSearchSubMenu(data, backFunction, filter) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addThegenSameEventMenuItem(menu, data);
  addThegenSearchWithParametersMenuItem(menu, data, backFunction);

  endMainMenu(menu);
}

async function setupThegenSearchWithParametersSubMenu(data, backFunction) {
  let dataModule = await import(`../core/thegen_search_menu_data.mjs`);
  setupSearchWithParametersSubMenu(data, backFunction, dataModule.ThegenData, thegenSearchWithParameters);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("thegen", "The Genealogist", addThegenDefaultSearchMenuItem, shouldShowSearchMenuItem);
