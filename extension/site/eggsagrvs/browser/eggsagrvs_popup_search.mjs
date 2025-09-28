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

const eggsagrvsStartYear = 1600;

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: eggsagrvsStartYear,
    endYear: undefined,
    dateTestType: "bd",
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

function eggsagrvsDoSearch(input) {
  doAsyncActionWithCatch("eGGSA Graves Search", input, async function () {
    // since many site searchs can be on the popup for a site, it makes sense to dynamically
    // load the build search module
    let loadedModule = await import(`../core/eggsagrvs_build_search_data.mjs`);
    let buildResult = loadedModule.buildSearchData(input);

    const fieldData = buildResult.fieldData;

    const checkPermissionsOptions = {
      reason:
        "To perform a search on eGGSA Graves a content script needs to be loaded on the graves.eggsa.org search page.",
    };
    const allowed = await checkPermissionForSite("*://www.graves.eggsa.org/*", checkPermissionsOptions);
    if (!allowed) {
      closePopup();
      return;
    }

    const searchUrl = `https://graves.eggsa.org/Search/${input.urlPart}.htm`;
    try {
      const eggsagrvsSearchData = {
        timeStamp: Date.now(),
        url: searchUrl,
        fieldData: fieldData,
      };

      // this stores the search data in local storage which is then picked up by the
      // content script in the new tab/window
      chrome.storage.local.set({ eggsagrvsSearchData: eggsagrvsSearchData }, function () {
        console.log("saved eggsagrvsSearchData, eggsagrvsSearchData is:");
        console.log(eggsagrvsSearchData);
      });
    } catch (ex) {
      console.log("storeDataCache failed");
    }

    openUrlInNewTab(searchUrl);
    closePopup();
  });
}

async function eggsagrvsSearch(generalizedData, urlPart) {
  const input = {
    urlPart: urlPart,
    generalizedData: generalizedData,
    options: options,
  };
  eggsagrvsDoSearch(input);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addEggsagrvsDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItem(menu, "Search eGGSA Graves", function (element) {
    setupEggsagrvsSearchSubMenu(data, backFunction, filter);
  });

  return true;
}

const searchAreas = [
  { name: "Eastern Province", urlPart: "ecsearchGraves" },
  { name: "Free State", urlPart: "fssearchGraves" },
  { name: "Gauteng", urlPart: "ggsearchGraves" },
  { name: "Kwazulu-Natal", urlPart: "kwasearchGraves" },
  { name: "Limpopo", urlPart: "limsearchGraves" },
  { name: "Mpumalanga", urlPart: "mpsearchGraves" },
  { name: "Northern Cape", urlPart: "ncsearchGraves" },
  { name: "Northwest", urlPart: "nwsearchGraves" },
  { name: "Western Cape", urlPart: "wcsearchGraves" },
  { name: "Worldwide", urlPart: "wosearchGraves" },
];

function addEggsagrvsAreaMenuItem(menu, generalizedData, item) {
  addMenuItem(menu, `Search eGSSA ${item.name} Graves`, function (element) {
    eggsagrvsSearch(generalizedData, item.urlPart);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupEggsagrvsSearchSubMenu(data, backFunction, filter) {
  let menu = beginMainMenu();
  addBackMenuItem(menu, backFunction);

  for (const item of searchAreas) {
    addEggsagrvsAreaMenuItem(menu, data.generalizedData, item);
  }
  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction(
  "eggsagrvs",
  "eGGSA Graves",
  addEggsagrvsDefaultSearchMenuItem,
  shouldShowSearchMenuItem
);
