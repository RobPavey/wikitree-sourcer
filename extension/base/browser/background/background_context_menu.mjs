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

import { callFunctionWithStoredOptions } from "../options/options_loader.mjs";
import { getRegisteredTab } from "./background_register_tab.mjs";
import { openInNewTab } from "./background_common.mjs";

import { doSearchGivenSearchData } from "./background_search.mjs";
import { checkPermissionForSiteMatches } from "./background_permissions.mjs";

import { logDebug } from "../../core/log_debug.mjs";

import { contextModules } from "../../../site/all/core/context_modules.mjs";

function openSiteLink(siteContextModule, phase, tab, link, options) {
  if (siteContextModule && siteContextModule.transformLink) {
    let newLink = siteContextModule.transformLink(link, phase, options);
    if (newLink) {
      const tabOption = options.context_general_newTabPos;
      openInNewTab(newLink, tab, tabOption);
      return true;
    }
  }
  return false;
}

function openSiteTemplate(siteContextModule, tab, text, options) {
  if (siteContextModule && siteContextModule.transformTemplateToLink) {
    let newLink = siteContextModule.transformTemplateToLink(text, options);
    if (newLink) {
      const tabOption = options.context_general_newTabPos;
      openInNewTab(newLink, tab, tabOption);
      return true;
    }
  }
  return false;
}

async function openPageUsingSearchData(tab, options, input) {
  try {
    let siteName = input.siteName;
    let searchData = input.searchData;
    let reuseTabIfPossible = input.reuseTab;
    let message = input.permissionsMessage;

    let existingTab = await getRegisteredTab(siteName);

    const checkPermissionsOptions = {
      reason: message,
    };
    let allowed = await checkPermissionForSiteMatches(siteName, checkPermissionsOptions);
    if (!allowed) {
      return false;
    }

    doSearchGivenSearchData(searchData, tab, options, existingTab, reuseTabIfPossible);
    return true;
  } catch (ex) {
    console.log("openPageUsingSearchData failed");
    console.log(ex);
  }

  return false;
}

async function openPageUsingComplexSearchData(tab, options, input) {
  console.log("openPageUsingComplexSearchData, input is:");
  console.log(input);

  let siteName = input.siteName;

  try {
    const checkPermissionsOptions = {
      reason: input.permissionsMessage,
    };
    let allowed = await checkPermissionForSiteMatches(siteName, checkPermissionsOptions);
    if (!allowed) {
      return false;
    }

    for (let searchData of input.searchDataList) {
      await chrome.storage.local.set(searchData);
    }

    if (!input.url) {
      console.warn("openPageUsingComplexSearchData: no search url found");
      return false;
    }

    const tabOption = options.search_general_newTabPos;
    openInNewTab(input.url, tab, tabOption);
    return true;
  } catch (ex) {
    console.log("openPageUsingComplexSearchData failed");
    console.log(ex);
  }

  return false;
}

function openSitePlainText(siteContextModule, phase, tab, text, options) {
  if (siteContextModule && siteContextModule.transformPlainText) {
    let transformed = siteContextModule.transformPlainText(text, phase, options);
    console.log("openSitePlainText: transformed = ", transformed);
    if (transformed) {
      if (transformed.link) {
        const tabOption = options.context_general_newTabPos;
        openInNewTab(transformed.link, tab, tabOption);
        return true;
      } else if (transformed.searchData || transformed.searchDataList) {
        if (transformed.isComplexSearchData) {
          openPageUsingComplexSearchData(tab, options, transformed);
        } else {
          openPageUsingSearchData(tab, options, transformed);
        }
        return true;
      }
    }
  }

  return false;
}

function openLink(info, tab, options) {
  //console.log("openLink, info is: ");
  //console.log(info);

  function findMatchingSiteAndOpenLink(phase) {
    for (let siteName of Object.keys(contextModules)) {
      let siteContextModule = contextModules[siteName];
      if (openSiteLink(siteContextModule, phase, tab, link, options)) {
        return true;
      }
    }
    return false;
  }

  let link = info.linkUrl;
  if (link) {
    //console.log("openLink, orig link is: " + link);

    // do a couple of passes through the sites to allow for strict vs fuzzy matching
    for (let phase = 0; phase < 2; phase++) {
      if (findMatchingSiteAndOpenLink(phase)) {
        return;
      }
    }

    let openedAsText = openSelectionPlainText(info, tab, options);
    if (!openedAsText) {
      // open unchanged link
      const tabOption = options.context_general_newTabPos;
      openInNewTab(link, tab, tabOption);
    }
  }
}

function openTemplate(info, tab, options) {
  let text = info.selectionText;

  //console.log("openTemplate, text is: " + text);

  let templateStartIndex = text.indexOf("{{");
  if (templateStartIndex == -1) return;

  let templateEndIndex = text.indexOf("}}", templateStartIndex);
  if (templateEndIndex == -1) return;

  text = text.substring(templateStartIndex, templateEndIndex + 2);

  for (let siteName of Object.keys(contextModules)) {
    let siteContextModule = contextModules[siteName];
    if (openSiteTemplate(siteContextModule, tab, text, options)) {
      return true;
    }
  }

  logDebug("openTemplate: template not supported: ", text);
}

function openSelectionPlainText(info, tab, options) {
  let text = info.selectionText;

  console.log("openSelectionText, text is:\n----------------\n" + text + "\n----------------");

  let templateStartIndex = text.indexOf("{{");
  if (templateStartIndex != -1) {
    //console.log("contains a template");
    openTemplate(info, tab, options);
    return true;
  }

  for (let phase = 0; phase < 3; phase++) {
    for (let siteName of Object.keys(contextModules)) {
      let siteContextModule = contextModules[siteName];
      if (openSitePlainText(siteContextModule, phase, tab, text, options)) {
        return true;
      }
    }
  }

  return false;
}

async function openSelectionText(info, tab) {
  callFunctionWithStoredOptions(function (options) {
    openSelectionPlainText(info, tab, options);
  });
}

function contextClick(info, tab) {
  //console.log("contextTest, info is:");
  //console.log(info);

  //console.log("contextTest, tab is:");
  //console.log(tab);

  if (info.menuItemId == "openLink") {
    if (info.linkUrl) {
      callFunctionWithStoredOptions(function (options) {
        openLink(info, tab, options);
      });
    } else if (info.selectionText) {
      openSelectionText(info, tab);
    }
  }
}

function setupContextMenu() {
  //console.log("setupContextMenu");

  chrome.contextMenus.onClicked.addListener(contextClick);

  let title = "Sourcer: Open Link in New Tab";

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      title: title,
      contexts: ["link", "selection"],
      id: "openLink",
    });
  });
}

export { setupContextMenu };
