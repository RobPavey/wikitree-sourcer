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

import { popupState, progressState } from "./popup_state.mjs";
import { separateUrlIntoParts } from "./popup_utils.mjs";
import { isSafari } from "/base/browser/common/browser_check.mjs";

import {
  setPopupMenuWidth,
  beginMainMenu,
  addMenuItem,
  endMainMenu,
  addItalicMessageMenuItem,
  addMenuDivider,
  displayBusyMessage,
  displayMessageWithIcon,
  macSecondMonitorWorkaround,
  openExceptionPage,
  addOptionsMenuItem,
  addHelpMenuItem,
  addBuyMeACoffeeMenuItem,
  closePopup,
} from "./popup_menu_building.mjs";

import { addStandardMenuEnd, addShowCitationAssistantMenuItem } from "/base/browser/popup/popup_menu_blocks.mjs";
import { addEditCitationMenuItem } from "/base/browser/popup/popup_citation.mjs";

var detectedSupportedSite = false;

function setupPopupMenuWhenError(message) {
  popupState.progress = progressState.defaultPopupDisplayError;

  displayMessageWithIcon(
    "warning",
    `WikiTree Sourcer: something went wrong. Please try again.`,
    "Error message: " + message
  );
}

function displayOldGoogleBooksMessage() {
  displayMessageWithIcon(
    "warning",
    "WikiTree Sourcer does not support Classic Google Books. Please switch to the new Google Books."
  );
}

function setupDefaultPopupMenuWhenNoResponseFromContent() {
  popupState.progress = progressState.defaultPopupSiteHasPermissionButNotRecognized;

  //console.log("setupDefaultPopupMenuWhenNoResponseFromContent, popupState is:");
  //console.log(popupState);

  // Check for some special cases where we can give more helpful messages
  // This a bit site specific but helpful for the user
  if (popupState.initialStateInDefaultPopup && popupState.initialStateInDefaultPopup.tabUrl) {
    let url = popupState.initialStateInDefaultPopup.tabUrl;
    //console.log("setupDefaultPopupMenuWhenNoResponseFromContent, have url:");
    //console.log(url);

    // Test for Old Google books
    // e.g.: https://books.google.com/books?id=hlA0AQAAMAAJ&newbks=1&newbks_redir=0&printsec=frontcover&q=riddle#v=snippet&q=riddle&f=false
    if (/^https?\:\/\/books\.google\.[^\/]+\/books.*$/.test(url)) {
      // it is the old style google books
      displayOldGoogleBooksMessage();
      return;
    }
  }

  let backFunction = function () {
    setupDefaultPopupMenuWhenNoResponseFromContent();
  };

  let message = "WikiTree Sourcer has not yet been able to extract the required data from this page.";
  message += "\n\nThis may be an unsupported site.";
  message +=
    "\n\nIf this is a supported site the page type could not be identified and the content script is not responding.";
  message +=
    "\n\nIf you think that this site is supported then please check that you are logged into this site (if required) and on a record page and try again.";
  message +=
    "\n\nIf it still doesn't work try reloading the page. This can happen if this page was open when the extension was installed, updated or enabled.";

  let menu = beginMainMenu();
  addItalicMessageMenuItem(menu, message);
  addMenuDivider(menu);
  addShowCitationAssistantMenuItem(menu);
  addStandardMenuEnd(menu, undefined, backFunction);
}

function setupUnrecognizedSiteMenu() {
  popupState.progress = progressState.defaultPopupSiteNotRecognized;

  let backFunction = function () {
    setupUnrecognizedSiteMenu();
  };

  let message = "WikiTree Sourcer doesn't know how to extract data from this site.";
  message += "\n\nWikiTree Sourcer works on wikitree.com profile pages and record pages from certain genealogy sites.";
  message += "\n\nTry browsing to a wikitree.com person profile or a record page and try the extension there.";

  let menu = beginMainMenu();
  addItalicMessageMenuItem(menu, message);
  addMenuDivider(menu);
  addShowCitationAssistantMenuItem(menu);

  addStandardMenuEnd(menu, undefined, backFunction);
}

function setupExtensionPageMenu(url) {
  popupState.progress = progressState.defaultPopupIsExtensionPage;

  let backFunction = function () {
    setupExtensionPageMenu(url);
  };

  let pageType = "";
  if (url.endsWith("user_citation.html")) {
    pageType = "user_citation";
  } else if (url.endsWith("options.html")) {
    pageType = "options";
  } else if (url.endsWith("exception.html")) {
    pageType = "exception";
  } else if (url.endsWith("gro_smart_search.html")) {
    pageType = "groSmartSearch";
  }

  let message = "";

  if (pageType == "user_citation") {
    message = "WikiTree Sourcer Citation Assistant page.";
  } else if (pageType == "options") {
    message = "WikiTree Sourcer options page.";
  } else if (pageType == "exception") {
    message = "WikiTree Sourcer exception page.";
  } else if (pageType == "groSmartSearch") {
    message =
      "WikiTree Sourcer GRO Smart Search page.\n\nClick on 'Open tab' for a result to go to GRO page to generate a citation.";
  } else {
    message = "WikiTree Sourcer extension page.";
  }

  let menu = beginMainMenu();
  addItalicMessageMenuItem(menu, message);
  if (pageType != "user_citation") {
    addMenuDivider(menu);
    addShowCitationAssistantMenuItem(menu);
  }

  addMenuDivider(menu);
  if (pageType != "user_citation") {
    addEditCitationMenuItem(menu, backFunction);
  }
  addBuyMeACoffeeMenuItem(menu);
  if (pageType != "options") {
    addOptionsMenuItem(menu);
  }
  addHelpMenuItem(menu, undefined, backFunction);

  endMainMenu(menu);
}

function doesUrlMatchPattern(urlParts, patternParts) {
  if (!urlParts || !patternParts) {
    return false;
  }
  // example url: https://www.ancestry.com/discoveryui-content/view/187423:1088
  // example pattern: *://*.ancestry.com/*

  if (patternParts.scheme != "*" && patternParts.scheme != urlParts.scheme) {
    return false;
  }

  if (patternParts.subdomain != "*" && patternParts.subdomain != urlParts.subdomain) {
    return false;
  }

  if (patternParts.domain != urlParts.domain) {
    return false;
  }

  if (patternParts.subdirectory == "*") {
    return true;
  }

  let starIndex = patternParts.subdirectory.indexOf("*");
  if (starIndex != -1) {
    let subDirectoryToMatch = patternParts.subdirectory.substring(0, starIndex);
    return urlParts.subdirectory.startsWith(subDirectoryToMatch);
  } else {
    return urlParts.subdirectory == patternParts.subdirectory;
  }
}

function determineSiteNameForTab(activeTab) {
  let manifest = chrome.runtime.getManifest();

  // Note: the url and pendingUrl properties will be ignored unless the extsnion has the "tabs" permission
  // or "host_permission" for the site. Chrome has the latter currently.
  // Update: I removed the host_permissions on 19 May 2025 and people started seeing this fail (it would
  // bring up the default popup on wikitree profiles after they had been open a while).
  // It appears that adding the activeTab permission fixes this. That seems easier to maintain than
  // having a host_permission for every site.

  let urlParts = separateUrlIntoParts(activeTab.pendingUrl);
  if (!urlParts) {
    urlParts = separateUrlIntoParts(activeTab.url);
  }

  // for a non-supported site these will usually be empty because of permissions
  if (!urlParts) {
    return false;
  }

  //console.log("WikiTree Sourcer: determineSiteNameForTab");
  let contentScripts = manifest.content_scripts;

  for (let contentScript of contentScripts) {
    //console.log("contentScript.matches = ")
    //console.log(contentScript.matches)

    for (let match of contentScript.matches) {
      let matchParts = separateUrlIntoParts(match);

      let doesTabMatch = doesUrlMatchPattern(urlParts, matchParts);

      if (doesTabMatch) {
        // found match, get siteName from the last script name
        let scripts = contentScript.js;
        if (scripts && scripts.length > 0) {
          let lastScript = scripts[scripts.length - 1];
          // example: "site/fs/browser/fs_content.js"
          let lastSlashIndex = lastScript.lastIndexOf("/");
          if (lastSlashIndex != -1) {
            const suffix = "_content.js";
            let suffixIndex = lastScript.indexOf(suffix, lastSlashIndex);
            if (suffixIndex != -1) {
              let siteName = lastScript.substring(lastSlashIndex + 1, suffixIndex);
              return siteName;
            }
          }
        }

        console.log(
          "WikiTree Sourcer: determineSiteNameForTab. Tab matches content script but could not get site name. Content script is:"
        );
        console.log("match pattern is: " + match);
        return "unknown";
      }
    }
  }

  console.log("WikiTree Sourcer: determineSiteNameForTab. Tab has URL but no content script match");
  console.log("activeTab.url is: " + activeTab.url);
  return "unknown";
}

async function loadPopupModuleForSupportedSite(popupModulePath) {
  if (detectedSupportedSite) {
    return; // don't want to load twice
  }

  detectedSupportedSite = true;

  console.log("WikiTree Sourcer: loadPopupModuleForSupportedSite. popupModulePath is:");
  console.log(popupModulePath);

  try {
    //console.log('WikiTree Sourcer: loadPopupModuleForSupportedSite. importing: ', popupModulePath);
    popupState.progress = progressState.defaultPopupLoadingSiteModule;
    // Note: Using chrome.runtime.getURL is considered "sanitizing" the pathName
    // so it avoids a validation warning for Firefox
    let loadedPopupModule = await import(chrome.runtime.getURL(popupModulePath));
    if (!loadedPopupModule) {
      console.log("WikiTree Sourcer: loadPopupModuleForSupportedSite. failed to import");
    }
  } catch (e) {
    popupState.progress = progressState.defaultPopupException;

    console.log("WikiTree Sourcer: error in loadPopupModuleForSupportedSite. Path is: ", popupModulePath);
    console.log(e);

    let message = "Error when attempting a dynamic import of the popup module in a the default popup.\n";
    openExceptionPage(message, popupModulePath, e, false);
  }
}

function contentLoadedNotification(tab, siteName) {
  if (popupState.initialStateInDefaultPopup && popupState.initialStateInDefaultPopup.tabId == tab.id) {
    if (siteName != "unknown") {
      // no need for this function to be called again
      popupState.onContentLoaded = undefined;
      // we worked out the siteName from the contentLoaded message, switch to the correct popup script
      let popupModulePath = "site/" + siteName + "/browser/" + siteName + "_popup.mjs";
      loadPopupModuleForSupportedSite(popupModulePath);
      return;
    }
  }
}

var initPopupGivenActiveTabRetryCount = 0;
const initPopupGivenActiveTabRetryOnCompleteDelay = 100;
const initPopupGivenActiveTabRetryOnCompleteMaxCount = 5;

async function initPopupGivenActiveTab(activeTab) {
  console.log("WikiTree Sourcer: popup.mjs: initPopupGivenActiveTab, active tab is:");
  console.log(activeTab);

  if (detectedSupportedSite) {
    // our work here is done
    return;
  }

  popupState.progress = progressState.defaultPopupHaveActiveTab;

  if (!activeTab) {
    // this should never happen
    console.log("WikiTree Sourcer: popup.mjs: setupInitialPopupMenuWithActiveTab, no active tab");
    setupPopupMenuWhenError("There is no active tab in initPopupGivenActiveTab");
    return;
  }

  popupState.recordDefaultPopupActiveTab(activeTab);

  //console.log("WikiTree Sourcer: popup.mjs: initPopupGivenActiveTab, activeTabId is: " + activeTab.id);
  //console.log("WikiTree Sourcer: popup.mjs: initPopupGivenActiveTab, siteName is: " + siteName + ", activeTab is:");
  //console.log(activeTab);
  //console.log("WikiTree Sourcer: popup.mjs: initPopupGivenActiveTab, activeTab.status is: " + activeTab.status);
  //console.log("WikiTree Sourcer: popup.mjs: initPopupGivenActiveTab, activeTab.url is: " + activeTab.url);
  //console.log("WikiTree Sourcer: popup.mjs: initPopupGivenActiveTab, activeTab.pendingUrl is: " + activeTab.pendingUrl);

  // One problem is that in Safari if we bring up the menu very quickly after navigating to a page
  // the tab still thinks it is "complete" and has the old URL. In this case it does appear that
  // set popup has been reset so we do come here. But there is no easy way to detect it.
  // It should only happen when status is "complete" unless we get into extreme edge cases where the
  // user navigate to another page before the first has finished loading.

  if (isSafari() && activeTab.status == "complete") {
    if (initPopupGivenActiveTabRetryCount < initPopupGivenActiveTabRetryOnCompleteMaxCount) {
      initPopupGivenActiveTabRetryCount++;

      popupState.onContentLoaded = contentLoadedNotification;
      popupState.defaultPopupDidTimeoutOnComplete = true;
      popupState.progress = progressState.defaultPopupTimeout;

      setTimeout(function () {
        initPopupGivenActiveTab(activeTab);
      }, initPopupGivenActiveTabRetryOnCompleteDelay);
      return;
    }
  }

  // Check if this is an extension page
  let url = activeTab.pendingUrl ? activeTab.pendingUrl : activeTab.url;
  let views = chrome.extension.getViews({ type: "tab" });
  let isExtensionPage = false;
  if (url) {
    // Firefox will come thrugh here
    for (let view of views) {
      if (view.document.documentURI == url) {
        isExtensionPage = true;
        break;
      }
    }
  } else {
    // Chrome will come through here
    for (let view of views) {
      let extensionTab = await view.chrome.tabs.getCurrent();
      if (extensionTab.id == activeTab.id) {
        isExtensionPage = true;
        url = view.document.documentURI;
      }
    }
  }
  if (isExtensionPage) {
    setupExtensionPageMenu(url);
    return;
  }

  // this will be empty string if not a supported page
  let siteName = determineSiteNameForTab(activeTab);

  if (!siteName) {
    // the url will be blank if we don't have permission to the tab so we can't get site name
    console.log("WikiTree Sourcer: popup.mjs: initPopupGivenActiveTab, cannot determine site name");
    setupUnrecognizedSiteMenu(activeTab.id);
    return;
  }

  if (siteName != "unknown") {
    console.log("WikiTree Sourcer: popup.mjs: initPopupGivenActiveTab, site name is: " + siteName);

    // we worked out the siteName from the url, switch to the correct popup script
    let popupModulePath = "site/" + siteName + "/browser/" + siteName + "_popup.mjs";
    loadPopupModuleForSupportedSite(popupModulePath);
    return;
  }

  //console.log("WikiTree Sourcer: popup.mjs: initPopupGivenActiveTab, UNKNOWN SITE NAME");

  // We should hopefully never get here. It only happens if the tab has a url (so is supported)
  // but we could not work out the site name.
  // For now just bring up an error message popup.
  setupDefaultPopupMenuWhenNoResponseFromContent();
}

function initPopupWithActiveTab() {
  // Note that await doesn't work with chrome.tabs.query on Firefox
  // So we use the callback version.
  // it is possible that browser.tabs.querey would work.
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs || tabs.length < 1) {
      console.log("WikiTree Sourcer: popup.mjs: setupInitialPopupMenu, no tabs returned from chrome.tabs.query");
    } else {
      initPopupGivenActiveTab(tabs[0]);
    }
  });
}

function initPopup() {
  popupState.progress = progressState.defaultPopupEntered;
  popupState.didStartFromDefaultPopup = true;

  macSecondMonitorWorkaround();

  setPopupMenuWidth();

  console.log("WikiTree Sourcer: popup.mjs: initPopup");
  displayBusyMessage("WikiTree Sourcer initializing menu ...");

  initPopupWithActiveTab();
}

initPopup();
