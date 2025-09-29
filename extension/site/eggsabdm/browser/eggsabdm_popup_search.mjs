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
  addBackMenuItem,
  addMenuItem,
  beginMainMenu,
  endMainMenu,
  doAsyncActionWithCatch,
  closePopup,
} from "/base/browser/popup/popup_menu_building.mjs";

import {
  registerSearchMenuItemFunction,
  shouldShowSiteSearch,
  openUrlInNewTab,
} from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";
import { checkPermissionForSite } from "/base/browser/popup/popup_permissions.mjs";
import { setupSearchWithParametersSubMenu } from "/base/browser/popup/popup_search_with_parameters.mjs";

const eggsabdmStartYear = 1688;
const eggsabdmEndYear = 2015;

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: eggsabdmStartYear,
    endYear: eggsabdmEndYear,
    dateTestType: "bmd",
    countryList: [],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

function doEggsabdmSearch(input) {
  doAsyncActionWithCatch("eGGSA BDM Search", input, async function () {
    // since many site searchs can be on the popup for a site, it makes sense to dynamically
    // load the build search module
    const loadedModule = await import(`../core/eggsabdm_build_search_data.mjs`);
    const buildResult = loadedModule.buildSearchData(input);

    const fieldData = buildResult.fieldData;

    const checkPermissionsOptions = {
      reason:
        "To perform a search on eGGSA BMD a content script needs to be loaded on the eggsa.org/bdms search pages.",
    };
    const allowed = await checkPermissionForSite("*://*.eggsa.org/bdms/*", checkPermissionsOptions);
    if (!allowed) {
      closePopup();
      return;
    }

    const searchUrl = `https://www.eggsa.org/bdms/${buildResult.urlPart}.html`;
    try {
      const eggsabdmSearchData = {
        timeStamp: Date.now(),
        url: searchUrl,
        search: buildResult.category,
        fieldData: fieldData,
      };

      // this stores the search data in local storage which is then picked up by the
      // content script in the new tab/window
      chrome.storage.local.set({ eggsabdmSearchData: eggsabdmSearchData }, function () {
        // console.log("saved eggsabdmSearchData, eggsabdmSearchData is:");
        // console.log(eggsabdmSearchData);
      });
    } catch (ex) {
      console.log("storeDataCache failed");
    }

    openUrlInNewTab(searchUrl);
    closePopup();
  });
}

async function eggsabdmSearch(generalizedData, category) {
  const input = {
    typeOfSearch: category,
    generalizedData: generalizedData,
    options: options,
  };
  doEggsabdmSearch(input);
}

async function eggsabdmSearchWithParameters(generalizedData, parameters) {
  const input = {
    typeOfSearch: parameters.category, // "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options,
  };
  doEggsabdmSearch(input);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addEggsabdmDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItem(menu, "Search eGGSA BDM", function (element) {
    setupEggsabdmSearchSubMenu(data, backFunction, filter);
  });

  return true;
}

// If searchAreas changes, you must update parameterDefs in eggsabdm_search_menu_data.mjs
const searchAreas = ["Baptisms", "Marriages", "Burials"];

function addEggsabdmAreaMenuItem(menu, generalizedData, area) {
  addMenuItem(menu, `Search eGSSA BMD ${area}`, function (element) {
    eggsabdmSearch(generalizedData, area);
  });
}

function addEggsabdmSearchWithParametersMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search with specified parameters...", function (element) {
    setupEggsabdmSearchWithParametersSubMenu(data, backFunction);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupEggsabdmSearchSubMenu(data, backFunction, filter) {
  const backToHereFunction = function () {
    setupEggsabdmSearchSubMenu(data, backFunction, filter);
  };

  const menu = beginMainMenu();
  addBackMenuItem(menu, backFunction);

  for (const area of searchAreas) {
    addEggsabdmAreaMenuItem(menu, data.generalizedData, area);
  }
  addEggsabdmSearchWithParametersMenuItem(menu, data, backToHereFunction);
  endMainMenu(menu);
}

async function setupEggsabdmSearchWithParametersSubMenu(data, backFunction) {
  const dataModule = await import(`../core/eggsabdm_search_menu_data.mjs`);
  setupSearchWithParametersSubMenu(data, backFunction, dataModule.EggsabdmData, eggsabdmSearchWithParameters);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("eggsabdm", "eGGSA BMD", addEggsabdmDefaultSearchMenuItem, shouldShowSearchMenuItem);
