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

//================================================================================
// This module simplifies the construction of the search menus for a site
// It streamlines the process by making it more data driven using a searchConfig
//================================================================================

import { options } from "../options/options_loader.mjs";
import {
  addMenuItem,
  addMenuItemWithSubmenu,
  addSameRecordMenuItem,
  addBackMenuItem,
  beginMainMenu,
  endMainMenu,
  addBreak,
  closePopup,
  keepPopupOpen,
  displayUnexpectedErrorMessage,
} from "/base/browser/popup/popup_menu_building.mjs";
import { CD } from "../../core/country_data.mjs";
import { getLocalStorageItem } from "../common/browser_compat.mjs";
import { popupState } from "./popup_state.mjs";

import { shouldShowSiteSearch } from "./popup_search.mjs";
import { setupSearchWithParametersSubmenu } from "./popup_search_with_parameters.mjs";

function addDefaultSearchMenuItemFromConfig(menu, data, backFunction, filter, config) {
  if (config.includeDefaultSearch) {
    if (config.includeSearchSubmenu) {
      addMenuItemWithSubmenu(
        menu,
        config.defaultMenuItemText,
        function (element) {
          config.searchFunction(data.generalizedData);
        },
        function () {
          setupSearchSubmenuFromConfig(data, backFunction, filter, config);
        }
      );
    } else {
      addMenuItem(menu, config.defaultMenuItemText, function (element) {
        config.searchFunction(data.generalizedData);
      });
    }
  } else {
    addMenuItem(menu, config.defaultMenuItemText, function (element) {
      setupSearchSubmenuFromConfig(data, backFunction, filter, config);
    });
  }

  return true;
}

async function addSearchWithParametersMenuItemFromConfig(menu, data, backFunction, config) {
  addMenuItem(menu, "Search with specified parameters...", function (element) {
    setupSearchWithParametersSubmenuFromConfig(data, backFunction, config);
  });
}

async function setupSearchWithParametersSubmenuFromConfig(data, backFunction, config) {
  let siteName = config.siteName;
  let dataModulePath = `../../../site/${siteName}/core/${siteName}_search_menu_data.mjs`;
  let dataModule = await import(chrome.runtime.getURL(dataModulePath));
  let dataName = config.submenuConfig.searchWithParametersData;
  if (!dataName || !dataModule[dataName]) {
    dataName = "searchWithParametersData";
  }
  if (dataModule[dataName]) {
    function searchFunction(gd, parameters) {
      config.searchFunction(gd, "SpecifiedParameters", parameters);
    }
    setupSearchWithParametersSubmenu(data, backFunction, dataModule[dataName], searchFunction);
  }
}

async function setupSearchSubmenuFromConfig(data, backFunction, filter, config) {
  let backToHereFunction = function () {
    setupSearchSubmenu(data, backFunction, filter, config);
  };

  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  if (config.submenuConfig) {
    const subconfig = config.submenuConfig;

    if (subconfig.includeSameCollection) {
      addSameRecordMenuItem(menu, data, config.siteName, function (element) {
        config.searchFunction(data.generalizedData, "SameCollection");
      });
    }

    if (subconfig.submenuOtherSearches) {
      for (let search of subconfig.submenuOtherSearches) {
        if (search.constraints) {
          if (!shouldShowSiteSearch(data.generalizedData, filter, search.constraints)) {
            continue;
          }
        }
        addMenuItem(menu, search.menuItemText, function (element) {
          config.searchFunction(data.generalizedData, search.typeOfSearch);
        });
      }
    }

    addSearchWithParametersMenuItemFromConfig(menu, data, backToHereFunction, config);
  }

  endMainMenu(menu);
}

export { addDefaultSearchMenuItemFromConfig, addSearchWithParametersMenuItemFromConfig, setupSearchSubmenuFromConfig };
