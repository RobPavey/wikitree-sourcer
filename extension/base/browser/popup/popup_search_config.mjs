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
  doAsyncActionWithCatch,
} from "./popup_menu_building.mjs";

import {
  doSearch,
  registerSearchMenuItemFunction,
  shouldShowSiteSearch,
  doBackgroundSearchWithSearchData,
} from "./popup_search.mjs";
import { setupSearchWithParametersSubmenu } from "./popup_search_with_parameters.mjs";
import { checkPermissionForSiteMatches } from "./popup_permissions.mjs";

async function doUrlSearchFromConfig(config, gd, typeOfSearch, parameters) {
  const input = {
    generalizedData: gd,
    typeOfSearch: typeOfSearch,
    searchParameters: parameters,
    options: options,
  };
  const actionText = config.siteDisplayName + " Search";
  const siteName = config.siteName;
  const modulePath = `../../../site/${siteName}/core/${siteName}_build_search_url.mjs`;
  doAsyncActionWithCatch(actionText, input, async function () {
    let loadedModule = await import(chrome.runtime.getURL(modulePath));
    doSearch(loadedModule, input);
  });
}

async function doLocalStorageSearchFromConfig(config, gd, typeOfSearch, parameters) {
  const input = {
    generalizedData: gd,
    typeOfSearch: typeOfSearch,
    searchParameters: parameters,
    options: options,
    runDate: new Date(),
  };
  const actionText = config.siteDisplayName + " Search";
  const siteName = config.siteName;
  const siteDisplayName = config.siteDisplayName;
  const modulePath = `../../../site/${siteName}/core/${siteName}_build_search_data.mjs`;
  const lsConfig = config.localStorageConfig;
  let permissionsMessage = lsConfig.permissionsMessage;
  if (!permissionsMessage) {
    permissionsMessage = `To perform a search on ${siteDisplayName} a content script needs to be loaded on the search page.`;
  }

  doAsyncActionWithCatch(actionText, input, async function () {
    let loadedModule = await import(chrome.runtime.getURL(modulePath));
    let buildResult = loadedModule.buildSearchData(input);

    const checkPermissionsOptions = {
      reason: permissionsMessage,
    };
    let allowed = await checkPermissionForSiteMatches(siteName, checkPermissionsOptions);
    if (!allowed) {
      closePopup();
      return;
    }

    let searchData = undefined;
    if (lsConfig.buildLocalStorageDataFunction) {
      searchData = lsConfig.buildLocalStorageDataFunction(buildResult, typeOfSearch);
    } else if (lsConfig.searchUrl) {
      let searchUrl = lsConfig.searchUrl;
      searchData = {
        timeStamp: Date.now(),
        url: searchUrl,
        fieldData: buildResult.fieldData,
        selectData: buildResult.selectData,
        searchType: typeOfSearch,
      };
    } else {
      closePopup();
      return;
    }

    let reuseOptionName = lsConfig.reuseTabOptionName;
    if (!reuseOptionName) {
      reuseOptionName = `search_${siteName}_reuseExistingTab`;
    }
    let reuseTabIfPossible = options[reuseOptionName];

    doBackgroundSearchWithSearchData(siteName, searchData, reuseTabIfPossible);
  });
}

async function doSearchFromConfig(config, gd, typeOfSearch, parameters) {
  if (config.searchFunction) {
    config.searchFunction(gd, typeOfSearch, parameters);
  } else if (config.localStorageConfig) {
    doLocalStorageSearchFromConfig(config, gd, typeOfSearch, parameters);
  } else {
    doUrlSearchFromConfig(config, gd, typeOfSearch, parameters);
  }
}

function addSearchMenuItemFromConfig(menu, data, backFunction, filter, config, menuItemConfig) {
  let includeDefaultSearch = menuItemConfig.includeDefaultSearch;
  let includeSearchSubmenu = menuItemConfig.includeSearchSubmenu;

  if (!includeDefaultSearch && !includeSearchSubmenu) {
    includeDefaultSearch = true;
  }

  if (includeDefaultSearch) {
    if (includeSearchSubmenu) {
      addMenuItemWithSubmenu(
        menu,
        menuItemConfig.menuItemText,
        function (element) {
          doSearchFromConfig(config, data.generalizedData);
        },
        function () {
          setupSearchSubmenuFromConfig(data, backFunction, filter, config, menuItemConfig.submenuConfig);
        }
      );
    } else {
      addMenuItem(menu, menuItemConfig.menuItemText, function (element) {
        doSearchFromConfig(config, data.generalizedData, menuItemConfig.typeOfSearch);
      });
    }
  } else {
    addMenuItem(menu, menuItemConfig.menuItemText + "...", function (element) {
      setupSearchSubmenuFromConfig(data, backFunction, filter, config, menuItemConfig.submenuConfig);
    });
  }
}

function addDefaultSearchMenuItemFromConfig(menu, data, backFunction, filter, config) {
  addSearchMenuItemFromConfig(menu, data, backFunction, filter, config, config.defaultMenuItem);
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
    dataName = "SearchWithParametersData";
  }
  if (dataModule[dataName]) {
    function searchFunction(gd, parameters) {
      doSearchFromConfig(config, gd, "SpecifiedParameters", parameters);
    }
    setupSearchWithParametersSubmenu(data, backFunction, dataModule[dataName], searchFunction);
  }
}

async function setupSearchSubmenuFromConfig(data, backFunction, filter, config, submenuConfig) {
  let backToHereFunction = function () {
    setupSearchSubmenuFromConfig(data, backFunction, filter, config, submenuConfig);
  };

  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  if (submenuConfig) {
    if (submenuConfig.includeSameCollection) {
      addSameRecordMenuItem(menu, data, config.siteName, function (element) {
        doSearchFromConfig(config, data.generalizedData, "SameCollection");
      });
    }

    if (submenuConfig.submenuMenuItems) {
      for (let menuItemConfig of submenuConfig.submenuMenuItems) {
        if (menuItemConfig.constraints) {
          let constraints = menuItemConfig.constraints;
          if (config.siteConstraints) {
            let siteConstraints = config.siteConstraints;
            if (!constraints.startYear && !constraints.startYearDynamic) {
              if (siteConstraints.startYear) {
                constraints.startYear = siteConstraints.startYear;
              } else if (siteConstraints.startYearDynamic) {
                constraints.startYearDynamic = siteConstraints.startYearDynamic;
              }
            }
            if (!constraints.endYear && !constraints.endYearDynamic) {
              if (siteConstraints.endYear) {
                constraints.endYear = siteConstraints.endYear;
              } else if (siteConstraints.endYearDynamic) {
                constraints.endYearDynamic = siteConstraints.endYearDynamic;
              }
            }
          }
          if (!shouldShowSiteSearch(data.generalizedData, filter, constraints)) {
            continue;
          }
        }
        addSearchMenuItemFromConfig(menu, data, backToHereFunction, filter, config, menuItemConfig);
      }
    }

    if (submenuConfig.includeSearchWithParameters) {
      addSearchWithParametersMenuItemFromConfig(menu, data, backToHereFunction, config);
    }
  }

  endMainMenu(menu);
}

function registerSearchMenuItemFromConfig(config) {
  function addDefaultSearchMenuItem(menu, data, backFunction, filter) {
    return addDefaultSearchMenuItemFromConfig(menu, data, backFunction, filter, config);
  }
  function shouldShowSearchMenuItem(data, filter) {
    return shouldShowSiteSearch(data.generalizedData, filter, config.siteConstraints);
  }
  registerSearchMenuItemFunction(
    config.siteName,
    config.siteDisplayName,
    addDefaultSearchMenuItem,
    shouldShowSearchMenuItem
  );
}

export { registerSearchMenuItemFromConfig };
