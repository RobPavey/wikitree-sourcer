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
  addMenuItemWithSubMenu,
  addMenuItem,
  beginMainMenu,
  endMainMenu,
  doAsyncActionWithCatch,
  closePopup,
} from "/base/browser/popup/popup_menu_building.mjs";
import { setupSearchWithParametersSubMenu } from "/base/browser/popup/popup_search_with_parameters.mjs";

import {
  doSearch,
  registerSearchMenuItemFunction,
  openUrlInNewTab,
  dataHasName,
} from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";
import { checkPermissionForSiteMatches } from "/base/browser/popup/popup_permissions.mjs";

function shouldShowSearchMenuItem(data, filter) {
  if (data.generalizedData.wtSearchIds && data.generalizedData.wtSearchIds.length) {
    return true;
  }

  if (data.generalizedData.wtSearchTemplates && data.generalizedData.wtSearchTemplates.length) {
    return true;
  }

  if (!dataHasName(data)) {
    return false;
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

function wikitreeDoSearch(input) {
  doAsyncActionWithCatch("WikiTree Search", input, async function () {
    // since many site searchs can be on the popup for a site, it makes sense to dynamically
    // load the build search module
    let loadedModule = await import(`../core/wikitree_build_search_data.mjs`);
    let buildResult = loadedModule.buildSearchData(input);

    let options = input.options;

    let fieldData = buildResult.fieldData;
    let searchUrl = "https://www.wikitree.com/wiki/Special:SearchPerson";
    if (options && options.search_wikitree_useDev2025Server) {
      searchUrl = "https://dev-2025.wikitree.com/wiki/Special:SearchPerson";
    }

    const checkPermissionsOptions = {
      reason:
        "To perform a search on wikitree.com a content script needs to be loaded on the wikitree.com search page.",
    };
    let allowed = await checkPermissionForSiteMatches("wikitree", checkPermissionsOptions);
    if (!allowed) {
      closePopup();
      return;
    }

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

    openUrlInNewTab(searchUrl);
    closePopup();
  });
}

async function wikitreePlusDoSearch(input) {
  doAsyncActionWithCatch("WikiTree Plus Search", input, async function () {
    let loadedModule = await import(`../core/wikitree_plus_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

async function wikitreeSearch(gd) {
  let useStandardWtSearch = true;

  if (!gd.inferFullName() && (gd.wtSearchTemplates || gd.wtSearchIds)) {
    useStandardWtSearch = false;
  }

  if (useStandardWtSearch) {
    const input = {
      typeOfSearch: "",
      generalizedData: gd,
      options: options,
    };
    wikitreeDoSearch(input);
  } else {
    if (gd.wtSearchIds) {
      wikitreePlusSearchForIdData(gd.wtSearchIds);
    } else {
      wikitreePlusSearchForTemplateData(gd.wtSearchTemplates);
    }
  }
}

async function wikitreePlusSearch(generalizedData) {
  const input = {
    typeOfSearch: "",
    generalizedData: generalizedData,
    options: options,
  };

  wikitreePlusDoSearch(input);
}

async function wikitreePlusSearchForTemplateData(templateData, additionalTemplateData) {
  let templates = templateData;

  if (additionalTemplateData) {
    for (let template of templateData) {
      if (!templates.includes(template)) {
        templates.push(template);
      }
    }
    for (let addition of additionalTemplateData) {
      if (!templates.includes(addition)) {
        templates.push(addition);
      }
    }
  }

  const input = {
    typeOfSearch: "",
    templateData: templates,
    options: options,
  };

  wikitreePlusDoSearch(input);
}

async function wikitreePlusSearchForIdData(idData, additionalIdData) {
  let ids = idData;

  if (additionalIdData) {
    for (let id of idData) {
      if (!ids.includes(id)) {
        ids.push(id);
      }
    }
    for (let addition of additionalIdData) {
      if (!ids.includes(addition)) {
        ids.push(addition);
      }
    }
  }

  const input = {
    typeOfSearch: "",
    idData: ids,
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

function addWikitreeSearchUsingWtPlusMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search using WikiTree Plus", function (element) {
    wikitreePlusSearch(data.generalizedData);
  });
}

function addWikitreeSearchForUsageMenuItem(menu, data, backFunction) {
  let templateData = [];
  let templateLinkedData = [];
  let idData = [];
  let idLinkedData = [];
  let typeString = "record";
  let gd = data.generalizedData;

  if (gd.sourceType == "profile") {
    typeString = "person";
  }

  templateData = gd.wtSearchTemplates;
  templateLinkedData = gd.wtSearchTemplatesRelated;

  idData = gd.wtSearchIds;
  idLinkedData = gd.wtSearchIdsRelated;

  if (templateData && templateData.length > 0) {
    const text = "Search for WikiTree profiles with a template referencing this " + typeString;
    addMenuItem(menu, text, function (element) {
      wikitreePlusSearchForTemplateData(templateData);
    });
  }
  if (templateLinkedData && templateLinkedData.length > 0) {
    const text = "Search for WikiTree profiles with templates for this " + typeString + " or related records";
    addMenuItem(menu, text, function (element) {
      wikitreePlusSearchForTemplateData(templateData, templateLinkedData);
    });
  }

  if (idData && idData.length > 0) {
    const text = "Search for WikiTree profiles with a template or link referencing this " + typeString;
    addMenuItem(menu, text, function (element) {
      wikitreePlusSearchForIdData(idData);
    });
  }
  if (idLinkedData && idLinkedData.length > 0) {
    const text = "Search for WikiTree profiles with templates or links for this " + typeString + " or related records";
    addMenuItem(menu, text, function (element) {
      wikitreePlusSearchForIdData(idData, idLinkedData);
    });
  }
}

function addWikitreeSearchWithParametersMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search with specified parameters...", function (element) {
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

  if (dataHasName(data)) {
    addWikitreeSearchUsingWtPlusMenuItem(menu, data, backToHereFunction);
  }
  addWikitreeSearchForUsageMenuItem(menu, data, backToHereFunction);
  if (dataHasName(data)) {
    addWikitreeSearchWithParametersMenuItem(menu, data, backToHereFunction);
  }

  endMainMenu(menu);
}

async function setupWikitreeSearchWithParametersSubMenu(data, backFunction) {
  let dataModule = await import(`../core/wikitree_search_menu_data.mjs`);
  setupSearchWithParametersSubMenu(data, backFunction, dataModule.WikitreeData, wikitreeSearchWithParameters);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("wikitree", "WikiTree", addWikitreeDefaultSearchMenuItem, shouldShowSearchMenuItem);
