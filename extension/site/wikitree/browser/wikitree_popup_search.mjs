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

import { doSearch, registerSearchMenuItemFunction, openUrlInNewTab } from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";
import { checkPermissionForSiteFromUrl } from "/base/browser/popup/popup_permissions.mjs";

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

    const checkPermissionsOptions = {
      reason:
        "To perform a search on wikitree.com a content script needs to be loaded on the wikitree.com search page.",
    };
    let allowed = await checkPermissionForSiteFromUrl(searchUrl, checkPermissionsOptions);
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

async function wikitreePlusSearchForTemplateData(templateData, additionalTemplateData) {
  if (additionalTemplateData) {
    for (let addition of additionalTemplateData) {
      if (!templateData.includes(addition)) {
        templateData.push(addition);
      }
    }
  }

  const input = {
    typeOfSearch: "",
    templateData: templateData,
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
  let typeString = "record";
  let ed = data.extractedData;
  let gd = data.generalizedData;

  if (gd.sourceType == "profile") {
    typeString = "person";
  }

  // This code is site specific. It would be better in the site folders.
  // One way to do that would bto add a "templateSearchData" member in generalizedData.
  // Is that overkill?
  if (gd.sourceOfData == "ancestry") {
    if (ed.ancestryTemplate) {
      templateData.push(ed.ancestryTemplate);
    }

    if (ed.titleCollection && ed.titleCollection.includes("Find a Grave")) {
      if (ed.imageRecordId & ed.imageRecordId.includes("/memorial/")) {
        let memorialId = ed.imageRecordId.replace(/^.*\/memorial\/([^\/]+)\/.*$/, "$1");
        if (memorialId && memorialId != ed.imageRecordId) {
          templateLinkedData.push("{{FindAGrave|" + memorialId + "}}");
        }
      }
    }

    if (ed.household && ed.household.members) {
      for (let member of ed.household.members) {
        if (member.dbId && member.recordId) {
          templateLinkedData.push("{{Ancestry Record|" + member.dbId + "|" + member.recordId + "}}");
        }
      }
    }
  } else if (gd.sourceOfData == "fg") {
    if (ed.memorialId) {
      templateData.push("{{FindAGrave|" + ed.memorialId + "}}");
    }
  } else if (gd.sourceOfData == "fs") {
    if (gd.wtSearchTemplates && gd.wtSearchTemplates.length) {
      for (let template of gd.wtSearchTemplates) {
        templateData.push(template);
      }
    }
    if (gd.wtSearchTemplatesRelated && gd.wtSearchTemplatesRelated.length) {
      for (let template of gd.wtSearchTemplatesRelated) {
        templateLinkedData.push(template);
      }
    }
  }

  if (templateData.length > 0) {
    const text = "Search for WikiTree profiles with a template referencing this " + typeString;
    addMenuItem(menu, text, function (element) {
      wikitreePlusSearchForTemplateData(templateData);
    });
  }
  if (templateLinkedData.length > 0) {
    const text = "Search for WikiTree profiles with templates for this " + typeString + " or related records";
    addMenuItem(menu, text, function (element) {
      wikitreePlusSearchForTemplateData(templateData, templateLinkedData);
    });
  }
}

function addWikitreeSearchWithParametersMenuItem(menu, data, backFunction) {
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

  addWikitreeSearchUsingWtPlusMenuItem(menu, data, backToHereFunction);
  addWikitreeSearchForUsageMenuItem(menu, data, backToHereFunction);
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
