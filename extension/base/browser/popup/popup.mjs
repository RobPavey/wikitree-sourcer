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
import { isSafari, isChrome } from "/base/browser/common/browser_check.mjs";
import { doesUrlMatchChromePattern } from "/base/browser/common/permissions.mjs";
import { checkPermissionForSites } from "./popup_permissions.mjs";
import { getSiteDataForSite } from "/base/browser/common/site_registry_storage.mjs";

import {
  setPopupMenuWidth,
  beginMainMenu,
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
} from "./popup_menu_building.mjs";

import { addStandardMenuEnd, addShowCitationAssistantMenuItem } from "/base/browser/popup/popup_menu_blocks.mjs";
import { addEditCitationMenuItem } from "/base/browser/popup/popup_citation.mjs";
import { logDebug } from "/base/core/log_debug.mjs";

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

  logDebug("setupDefaultPopupMenuWhenNoResponseFromContent, popupState is:", popupState);

  // Check for some special cases where we can give more helpful messages
  // This a bit site specific but helpful for the user
  if (popupState.initialStateInDefaultPopup && popupState.initialStateInDefaultPopup.tabUrl) {
    let url = popupState.initialStateInDefaultPopup.tabUrl;
    logDebug("setupDefaultPopupMenuWhenNoResponseFromContent, have url:", url);

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

async function determineSiteNameForTab(activeTab) {
  let manifest = chrome.runtime.getManifest();

  // Note: the url and pendingUrl properties will be ignored unless the extension has the "tabs" permission
  // or "host_permission" for the site. Chrome has the latter currently.
  // Update: I removed the host_permissions on 19 May 2025 and people started seeing this fail (it would
  // bring up the default popup on wikitree profiles after they had been open a while).
  // It appears that adding the activeTab permission fixes this. That seems easier to maintain than
  // having a host_permission for every site.

  let url = activeTab.pendingUrl;
  if (!url) {
    url = activeTab.url;
  }

  logDebug("WikiTree Sourcer: determineSiteNameForTab");

  let contentScripts = await chrome.scripting.getRegisteredContentScripts();
  for (let contentScript of contentScripts) {
    for (let match of contentScript.matches) {
      let doesTabMatch = doesUrlMatchChromePattern(match, url);

      if (doesTabMatch) {
        logDebug("This tab matches the pattern.");

        // found match, get siteName from the content script id
        let siteName = contentScript.id;

        // we have a content script dynamically registered for the site.
        logDebug("We have a content script dynamically registered for the site.");

        let originsToRequest = [match];
        let siteData = await getSiteDataForSite(siteName);
        if (siteData && siteData.requiredAdditionalOrigins) {
          originsToRequest = [...originsToRequest, ...siteData.requiredAdditionalOrigins];
        }

        if (await chrome.permissions.contains({ origins: originsToRequest })) {
          logDebug("We have permissions for the site.");

          // extension already has permission, no need to ask user
          // However, sometimes the content script may not be loaded, it SHOULD get loaded
          // when the user grants permission but sometimes does not for some tabs.
          // So ping the tab and, if it does not respond, then inject the content scripts.
          // NOTE: This also fixes the issue when a user can disable the extension and then
          // re-enable it. In Chrome that results in the content script being missing.
          if (isChrome()) {
            let pingSucceeded = false;
            try {
              // First, check if content script is already there to avoid double-loading
              let response = await chrome.tabs.sendMessage(activeTab.id, { type: "ping" });
              if (chrome.runtime.lastError) {
                logDebug("ping to content script failed, lastError is", chrome.runtime.lastError);
              } else if (!response) {
                logDebug("ping to content script failed, null response is", response);
              } else if (response.success) {
                logDebug("ping to content script succeeded.");
                pingSucceeded = true;
              } else {
                logDebug("ping to content script failed, success is false.");
              }
            } catch (e) {
              logDebug("ping to content script failed, error is", e);
            }

            if (!pingSucceeded) {
              logDebug("ping to content script failed, attempting to inject content script.");
              // If the ping fails, the script isn't there, so inject it!
              try {
                await chrome.scripting.executeScript({
                  target: { tabId: activeTab.id },
                  files: contentScript.js,
                });
                logDebug("inject of content script succeeeded");
              } catch (error) {
                console.error(`Injection error on tab ${activeTab.id}:`, error);
              }

              // these additional steps are to handle additional content scripts that get loaded in iFrames
              if (siteData.additionalContentScripts) {
                // since the script for the tab was not loaded we can assue that the additional scripts are not loaded
                for (let additionalScript of siteData.additionalContentScripts) {
                  if (additionalScript.allFrames) {
                    const frameResults = await chrome.scripting.executeScript({
                      target: { tabId: activeTab.id, allFrames: true },
                      func: () => {
                        return { url: window.location.href };
                      },
                    });

                    for (const frame of frameResults) {
                      // Check if frame.result exists and has a url property
                      if (frame.result && frame.result.url) {
                        const frameId = frame.frameId;
                        const frameUrl = frame.result.url;
                        for (let additionalMatch of additionalScript.matches) {
                          if (doesUrlMatchChromePattern(additionalMatch, frameUrl)) {
                            logDebug("attempting to inject additional content script.");
                            // If the ping fails, the script isn't there, so inject it!
                            try {
                              await chrome.scripting.executeScript({
                                target: { tabId: activeTab.id, frameIds: [frameId] },
                                files: additionalScript.js,
                              });
                              logDebug("inject of additional content script succeeeded");
                            } catch (error) {
                              console.error(`Injection error on tab ${activeTab.id}:`, error);
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          return siteName;
        }

        // ask user for permission
        const checkPermissionsOptions = {
          reason: "The extension needs to load a content script in order to extract data from the page.",
          needsPopupDisplayed: true,
          userClickedExtensionPopup: true,
        };
        if (await checkPermissionForSites(originsToRequest, checkPermissionsOptions)) {
          // permission was granted but the content script will not be retroactively loaded
          // so we want to load it manually. However we can't rely on the code getting here
          // because the chrome permission request dialog can kill the popup, so the
          // script is injected in the background script using chrome.permissions.onAdded
          return siteName;
        }

        console.warn(
          "WikiTree Sourcer: determineSiteNameForTab. Tab matches content script but could not get site name. Content script is:"
        );
        console.warn("match pattern is: " + match);
        return "unknown";
      }
    }
  }

  // This is normal if extension icon is clicked on an unsupported page
  logDebug("WikiTree Sourcer: determineSiteNameForTab. Tab has URL but no content script match");
  logDebug("activeTab.url is: " + activeTab.url);
  return "unknown";
}

async function loadPopupModuleForSupportedSite(popupModulePath) {
  if (detectedSupportedSite) {
    return; // don't want to load twice
  }

  detectedSupportedSite = true;

  logDebug("WikiTree Sourcer: loadPopupModuleForSupportedSite. popupModulePath is:", popupModulePath);

  try {
    logDebug("WikiTree Sourcer: loadPopupModuleForSupportedSite. importing: ", popupModulePath);
    popupState.progress = progressState.defaultPopupLoadingSiteModule;
    // Note: Using chrome.runtime.getURL is considered "sanitizing" the pathName
    // so it avoids a validation warning for Firefox
    let loadedPopupModule = await import(chrome.runtime.getURL(popupModulePath));
    if (!loadedPopupModule) {
      console.warn("WikiTree Sourcer: loadPopupModuleForSupportedSite. failed to import");
    }
  } catch (e) {
    popupState.progress = progressState.defaultPopupException;

    console.error("WikiTree Sourcer: error in loadPopupModuleForSupportedSite. Path is: ", popupModulePath, e);

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
  logDebug("WikiTree Sourcer: popup.mjs: initPopupGivenActiveTab, active tab is:", activeTab);

  if (detectedSupportedSite) {
    // our work here is done
    return;
  }

  popupState.progress = progressState.defaultPopupHaveActiveTab;

  if (!activeTab) {
    // this should never happen
    console.error("WikiTree Sourcer: popup.mjs: setupInitialPopupMenuWithActiveTab, no active tab");
    setupPopupMenuWhenError("There is no active tab in initPopupGivenActiveTab");
    return;
  }

  popupState.recordDefaultPopupActiveTab(activeTab);

  logDebug("WikiTree Sourcer: popup.mjs: initPopupGivenActiveTab, activeTabId is: " + activeTab.id);
  logDebug("WikiTree Sourcer: popup.mjs: initPopupGivenActiveTab, activeTab.status is: " + activeTab.status);
  logDebug("WikiTree Sourcer: popup.mjs: initPopupGivenActiveTab, activeTab.url is: " + activeTab.url);
  logDebug("WikiTree Sourcer: popup.mjs: initPopupGivenActiveTab, activeTab.pendingUrl is: " + activeTab.pendingUrl);

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
  let isExtensionPage = url?.startsWith(chrome.runtime.getURL(""));
  if (isExtensionPage) {
    setupExtensionPageMenu(url);
    return;
  }

  // this will be empty string if not a supported page
  let siteName = await determineSiteNameForTab(activeTab);

  if (!siteName) {
    // the url will be blank if we don't have permission to the tab so we can't get site name
    console.warn("WikiTree Sourcer: popup.mjs: initPopupGivenActiveTab, cannot determine site name");
    setupUnrecognizedSiteMenu(activeTab.id);
    return;
  }

  if (siteName != "unknown") {
    logDebug("WikiTree Sourcer: popup.mjs: initPopupGivenActiveTab, site name is: " + siteName);

    // we worked out the siteName from the url, switch to the correct popup script
    let popupModulePath = "site/" + siteName + "/browser/" + siteName + "_popup.mjs";
    loadPopupModuleForSupportedSite(popupModulePath);
    return;
  }

  logDebug("WikiTree Sourcer: popup.mjs: initPopupGivenActiveTab, unknown site name");

  // Now that we have the activeTab permission it will normally come through here
  // when the extension popup is used on an unsupported page
  setupDefaultPopupMenuWhenNoResponseFromContent();
}

function initPopupWithActiveTab() {
  // Note that await doesn't work with chrome.tabs.query on Firefox
  // So we use the callback version.
  // it is possible that browser.tabs.querey would work.
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs || tabs.length < 1) {
      console.warn("WikiTree Sourcer: popup.mjs: setupInitialPopupMenu, no tabs returned from chrome.tabs.query");
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

  logDebug("WikiTree Sourcer: popup.mjs: initPopup");
  displayBusyMessage("WikiTree Sourcer initializing menu ...");

  initPopupWithActiveTab();
}

initPopup();
