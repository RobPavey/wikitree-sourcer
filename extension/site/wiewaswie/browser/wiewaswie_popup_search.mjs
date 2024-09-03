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
  beginMainMenu,
  endMainMenu,
  addMenuItem,
  addMenuItemWithSubMenu,
  addBackMenuItem,
  addSameRecordMenuItem,
  doAsyncActionWithCatch,
  closePopup,
} from "/base/browser/popup/popup_menu_building.mjs";

import {
  registerSearchMenuItemFunction,
  shouldShowSiteSearch,
  openUrlInNewTab,
} from "/base/browser/popup/popup_search.mjs";
import { setupSearchWithParametersSubMenu } from "/base/browser/popup/popup_search_with_parameters.mjs";

import { options } from "/base/browser/options/options_loader.mjs";
import { checkPermissionForSite } from "/base/browser/popup/popup_permissions.mjs";

const wiewaswieStartYear = 1000; // I have seem lots of dates like 1039 and some of 1000
const wiewaswieEndYear = 2040;

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: wiewaswieStartYear,
    endYear: wiewaswieEndYear,
    dateTestType: "bmd",
    countryList: ["Netherlands"],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function doWiewaswieSearch(input) {
  doAsyncActionWithCatch("WieWasWie (NL) Search", input, async function () {
    let loadedModule = await import(`../core/wiewaswie_build_search_data.mjs`);
    let buildResult = loadedModule.buildSearchData(input);

    let fieldData = buildResult.fieldData;
    let selectData = buildResult.selectData;

    const checkPermissionsOptions = {
      reason:
        "To perform a search on WieWasWie a content script needs to be loaded on the www.wiewaswie.nl search page.",
    };
    let allowed = await checkPermissionForSite("*://www.wiewaswie.nl/*", checkPermissionsOptions);
    if (!allowed) {
      closePopup();
      return;
    }

    let searchUrl = "https://www.wiewaswie.nl/en/search/?advancedsearch=1";
    let lang = options.search_wiewaswie_searchLang;
    if (lang && lang == "nl") {
      searchUrl = "https://www.wiewaswie.nl/nl/zoeken/?advancedsearch=1";
    }

    try {
      const wiewaswieSearchData = {
        timeStamp: Date.now(),
        url: searchUrl,
        fieldData: fieldData,
        selectData: selectData,
      };

      // this stores the search data in local storage which is then picked up by the
      // content script in the new tab/window
      chrome.storage.local.set({ wiewaswieSearchData: wiewaswieSearchData }, function () {
        //console.log('saved wiewaswieSearchData, wiewaswieSearchData is:');
        //console.log(wiewaswieSearchData);
      });
    } catch (ex) {
      console.log("storeDataCache failed");
    }

    openUrlInNewTab(searchUrl);
    closePopup();
  });
}

async function wiewaswieSearch(generalizedData, typeOfSearch) {
  const input = { typeOfSearch: typeOfSearch, generalizedData: generalizedData, options: options };
  doWiewaswieSearch(input);
}

async function wiewaswieSearchWithParameters(generalizedData, parameters) {
  const input = {
    typeOfSearch: "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options,
  };
  doWiewaswieSearch(input);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addWiewaswieDefaultSearchMenuItem(menu, data, backFunction) {
  addMenuItemWithSubMenu(
    menu,
    "Search WieWasWie (NL)",
    function (element) {
      wiewaswieSearch(data.generalizedData, "");
    },
    function () {
      setupWiewaswieSearchSubMenu(data, backFunction);
    }
  );

  return true;
}

function addWiewaswieSameRecordMenuItem(menu, data) {
  let added = addSameRecordMenuItem(menu, data, "wiewaswie", function (element) {
    wiewaswieSearch(data.generalizedData, "SameCollection");
  });

  if (!added && data.generalizedData.sourceOfData == "openarch") {
    addMenuItem(menu, "Search WieWasWie for the same record", function (element) {
      wiewaswieSearch(data.generalizedData, "SameCollection");
    });
  }
}

function addWiewaswieSearchWithParametersMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search with specified parameters", function (element) {
    setupWiewaswieSearchWithParametersSubMenu(data, backFunction);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupWiewaswieSearchSubMenu(data, backFunction) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addWiewaswieSameRecordMenuItem(menu, data);
  addWiewaswieSearchWithParametersMenuItem(menu, data, backFunction);

  endMainMenu(menu);
}

async function setupWiewaswieSearchWithParametersSubMenu(data, backFunction) {
  let dataModule = await import(`../core/wiewaswie_search_menu_data.mjs`);
  setupSearchWithParametersSubMenu(data, backFunction, dataModule.WiewaswieData, wiewaswieSearchWithParameters);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction(
  "wiewaswie",
  "WieWasWie (NL)",
  addWiewaswieDefaultSearchMenuItem,
  shouldShowSearchMenuItem
);
