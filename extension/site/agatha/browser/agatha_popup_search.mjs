/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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

import { addMenuItem, doAsyncActionWithCatch, closePopup } from "/base/browser/popup/popup_menu_building.mjs";
//import { setupSearchWithParametersSubmenu } from "/base/browser/popup/popup_search_with_parameters.mjs";

import {
  registerSearchMenuItemFunction,
  shouldShowSiteSearch,
  openUrlInNewTab,
} from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";
import { checkPermissionForSiteMatches } from "/base/browser/popup/popup_permissions.mjs";

//////////////////////////////////////////////////////////////////////////////////////////
// Configuration
//////////////////////////////////////////////////////////////////////////////////////////

const searchMenuConfig = {
  siteName: "agatha",
  siteDisplayName: "AGATHA",
  localStorageConfig: {
    searchUrl: "https://agatha.arch.be/search/analyses/",
  },
  defaultMenuItem: {
    menuItemText: "Search AGATHA (Belgian State Archive)",
    includeDefaultSearch: true,
    includeSearchSubmenu: false,
  },
};

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    //startYear: agathaStartYear,
    //endYear: agathaEndYear,
    dateTestType: "bmd",
    countryList: ["Belgique", "België", "Belgien", "Belgium"],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

function agathaDoSearch(input) {
  doAsyncActionWithCatch("AGATHA Search", input, async function () {
    // since many site searchs can be on the popup for a site, it makes sense to dynamically
    // load the build search module
    let loadedModule = await import(`../core/agatha_build_search_data.mjs`);
    let buildResult = loadedModule.buildSearchData(input);

    let fieldData = buildResult.fieldData;

    const checkPermissionsOptions = {
      reason: "To perform a search on AGATHA a content script needs to be loaded on the agatha.arch.be search page.",
    };
    let allowed = await checkPermissionForSiteMatches("agatha", checkPermissionsOptions);
    if (!allowed) {
      closePopup();
      return;
    }

    const searchUrl = "https://agatha.arch.be/search/analyses/";
    try {
      const agathaSearchData = {
        timeStamp: Date.now(),
        url: searchUrl,
        fieldData: fieldData,
      };

      // this stores the search data in local storage which is then picked up by the
      // content script in the new tab/window
      chrome.storage.local.set({ agathaSearchData: agathaSearchData }, function () {
        //console.log('saved agathaSearchData, agathaSearchData is:');
        //console.log(agathaSearchData);
      });
    } catch (ex) {
      console.log("storeDataCache failed");
    }

    openUrlInNewTab(searchUrl);
    closePopup();
  });
}

async function agathaSearch(generalizedData, typeOfSearch) {
  const input = {
    typeOfSearch: typeOfSearch,
    generalizedData: generalizedData,
    options: options,
  };
  agathaDoSearch(input);
}

/*async function agathaSearchWithParameters(generalizedData, parameters) {
  const input = {
    typeOfSearch: "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options,
  };
  agathaDoSearch(input);
}*/

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addAgathaDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItem(menu, "Search AGATHA (Belgium)", function (element) {
    agathaSearch(data.generalizedData, "Any");
  });

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

//registerSearchMenuItemFromConfig(searchMenuConfig);
registerSearchMenuItemFunction("agatha", "AGATHA (Belgium)", addAgathaDefaultSearchMenuItem, shouldShowSearchMenuItem);
