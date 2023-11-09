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
import { callFunctionWithStoredOptions } from "../options/options_loader.mjs";
import {
  beginMainMenu,
  endMainMenu,
  addMenuItem,
  addItalicMessageMenuItem,
  setPopupMenuWidth,
  displayBusyMessage,
  displayBusyMessageAfterDelay,
  macSecondMonitorWorkaround,
  openExceptionPage,
  displayMessageWithIcon,
} from "./popup_menu_building.mjs";

import "/site/all/browser/popup_register_search_sites.mjs";

//console.log("Loaded popup script");

// This is used to override the console variable so that it logs by sending messages to content script
class LoggerToTabConsole {
  constructor(tabId) {
    this.tabId = tabId;
  }

  log(message) {
    if (this.tabId) {
      chrome.tabs.sendMessage(this.tabId, { type: "log", message: message }, function (response) {
        if (chrome.runtime.lastError) {
          console.log("logToTabConsole failed");
        } else if (!response) {
          console.log(message);
        } else {
          // no need to do anything
        }
      });
    }
  }
}

var logger = new LoggerToTabConsole(undefined);

function displaySiteNameChangedMessage(popupSiteName, contentSiteName) {
  popupState.progress = progressState.sitePopupDisplayError;

  console.log(
    "popup_init: displaySiteNameChangedMessage, siteName is: " +
      popupSiteName +
      " but content siteName is: " +
      contentSiteName
  );

  displayMessageWithIcon(
    "warning",
    "The web page domain changed after the extension icon was clicked. The site changed from " +
      popupSiteName +
      " to " +
      contentSiteName +
      ". Please try again."
  );
}

function displayUrlChangedMessage(menuUrl, newUrl) {
  popupState.progress = progressState.sitePopupDisplayError;

  console.log("popup_init: displayUrlChangedMessage, menu URL is: " + menuUrl + " but new tab url is: " + newUrl);

  displayMessageWithIcon("warning", "The web page URL changed after the extension icon was clicked. Please try again.");
}

function setupMenuForExtractedData(menuSetupFunction, extractedData, tabId) {
  if (!extractedData.ambiguousPerson) {
    menuSetupFunction(extractedData, tabId);
    return;
  }

  // we don't know which person in the record should be the primary person so we
  // setup an intermediate menu for the user to choose
  let menu = beginMainMenu();

  addItalicMessageMenuItem(
    menu,
    "Choose which person in the record to use as the primary person for search, citation etc."
  );

  for (let person of extractedData.ambiguousPersonArray) {
    addMenuItem(menu, person.name, function () {
      extractedData.ambiguousPersonResolvedId = person.id;
      menuSetupFunction(extractedData, tabId);
    });
  }

  endMainMenu(menu);
}

var numRetriesToMessageContent = 0;
var numRetriesToExtractContent = 0;
var retryInProgress = false;

async function setupMenuBasedOnContent(tabId, options, siteName, menuSetupFunction) {
  //console.log("popup_init: setupMenuBasedOnContent, siteName is: " + siteName
  //  + ", progress is: " + popupState.progress);

  if (popupState.progress >= progressState.sitePopupCalledMenuSetup) {
    return;
  }

  // send a message to content script
  try {
    popupState.progress = progressState.sitePopupSentExtract;

    chrome.tabs.sendMessage(tabId, { type: "extract", options: options }, function (response) {
      if (popupState.progress >= progressState.sitePopupCalledMenuSetup) {
        // We already got a good response and setup the menu so do not try again
        // But if the URL is different show an error

        if (!chrome.runtime.lastError && response && response.success) {
          if (response.extractedData.url != popupState.extractedDocumentUrl) {
            displayUrlChangedMessage(popupState.extractedDocumentUrl, response.extractedData.url);
          }
        }
        return;
      }

      displayBusyMessageAfterDelay("WikiTree Sourcer initializing menu ...");

      //console.log("setupMenuBasedOnContent, chrome.runtime.lastError is:");
      //console.log(chrome.runtime.lastError);
      //console.log("setupMenuBasedOnContent, response is:");
      //console.log(response);

      // NOTE: must check lastError first in the if below so it doesn't report an unchecked error
      // NOTE: On FamilySearch I have recently been getting exceptions in the fetch the page has been inactive
      // for a while. So do retry if the response has an exception object
      if (chrome.runtime.lastError || !response || (!response.success && response.wasFetchError)) {
        // possibly there is no content script loaded, this could be an error that should be reported
        // By testing edge cases I have found the if you reload the page and immediately click the
        // extension button sometimes this will happen. Presumably because the content script
        // just got unloaded prior to the reload but we got here because the popup had not been reset.
        // In this case we are seeing the response being undefined.
        // What to do in this case? Don't want to leave the "Initializing menu..." up.

        const retryDelay = 200;
        if (numRetriesToMessageContent < 50) {
          if (!retryInProgress) {
            numRetriesToMessageContent++;
            //console.log("popup_init: setupMenuBasedOnContent, extract failed, retry: " + numRetriesToMessageContent);
            let timeWaited = (numRetriesToMessageContent * retryDelay) / 1000;
            if (timeWaited > 1) {
              let timeWaitedString = timeWaited.toFixed(2) + " seconds";
              displayBusyMessage(
                "WikiTree Sourcer is waiting for the page to respond...\nTab still not responding after " +
                  timeWaitedString
              );
            }
            popupState.progress = progressState.sitePopupRetryExtractTimeout;

            retryInProgress = true;
            setTimeout(function () {
              retryInProgress = false;
              setupMenuBasedOnContent(tabId, options, siteName, menuSetupFunction);
            }, retryDelay);
          } else {
            // the retry in progress will continue the work
          }
        } else {
          let message = "The content script did not respond. Cannot initialize the WikiTree Sourcer menu";

          if (chrome.runtime.lastError) {
            console.log("popup_init: setupMenuBasedOnContent, extract failed with error after all retries: ");
            console.log(chrome.runtime.lastError);
            message += "\nError:\n" + chrome.runtime.lastError.message;
          }

          popupState.progress = progressState.sitePopupDisplayError;
          displayMessageWithIcon("warning", message);
        }
      } else if (response.success) {
        var type = response.contentType;

        // if the extractedData is not valid it could be that the tab status is "complete" but the
        // page data hasn't been filled out in the document. Some sites (like FMP) are like this.
        // For sites like that they will set the dataMayBeIncomplete flag in the extractedData when the
        // extract fails but the URL or other data implies it is a valid page. In this case we do a few retries.

        if (response.extractedData.dataMayBeIncomplete && numRetriesToExtractContent < 50) {
          if (!retryInProgress) {
            const retryDelay = 200;
            numRetriesToExtractContent++;
            popupState.progress = progressState.sitePopupRetryExtractTimeout;
            //console.log("popup_init: setupMenuBasedOnContent, data may be incomplete, retry: " + numRetriesToExtractContent);
            let timeWaited = (numRetriesToExtractContent * retryDelay) / 1000;
            if (timeWaited > 1) {
              let timeWaitedString = timeWaited.toFixed(2) + " seconds";
              displayBusyMessage(
                "WikiTree Sourcer is waiting for the data to be available...\nTab seems incomplete after " +
                  timeWaitedString
              );
            }

            retryInProgress = true;
            setTimeout(function () {
              retryInProgress = false;
              setupMenuBasedOnContent(tabId, options, siteName, menuSetupFunction);
            }, retryDelay);
          }
        } else {
          if (response.contentType != siteName) {
            // This has happened on Chrome but is very hard to reproduce, timing is critical.
            displaySiteNameChangedMessage(siteName, response.contentType);
          } else {
            // Change the global console variable (in the popup scope) to use the logger to log to active tab
            //logger.tabId = tabId;
            //console = logger;

            //console.log("popup_init: setupMenuBasedOnContent, calling menuSetupFunction, url is: " + response.extractedData.url);
            //console.log("popup_init: setupMenuBasedOnContent, data extracted is: ");
            //console.log(response.extractedData);
            popupState.progress = progressState.sitePopupCalledMenuSetup;
            popupState.extractedDocumentUrl = response.extractedData.url;
            setupMenuForExtractedData(menuSetupFunction, response.extractedData, tabId);
          }
        }
      } else {
        // it works better to catach this is content_common since the error stack works then
        // So normally exceptionWasReported will be true if an exception was caught in extractDataAndRespond
        if (!response.exceptionWasReported) {
          let message = response.errorMessage;
          if (!message) {
            message = "Error response from 'extract' message";
          } else {
            message = "Error response from 'extract' message: " + message;
          }
          let requestReport = response.requestReport;
          if (requestReport === undefined) {
            requestReport = true;
          }
          openExceptionPage(message, popupState, response.exceptionObject, requestReport);
        }
        popupState.progress = progressState.sitePopupException;
      }
    });
  } catch (error) {
    popupState.progress = progressState.sitePopupException;
    let message = "Error in setupMenuBasedOnContent";
    openExceptionPage(message, popupState, error, true);
    console.log(error);
  }
}

function contentLoadedNotification(tab, siteName) {
  //console.log("popup_init: contentLoadedNotification called, siteName = " + siteName);

  if (popupState.progress < progressState.sitePopupCalledMenuSetup) {
    // check the siteName is what we expect
    if (siteName == popupState.initialStateInSitePopup.siteName) {
      let tabId = popupState.initialStateInSitePopup.tabId;
      let options = popupState.initialStateInSitePopup.options;
      let menuSetupFunction = popupState.initialStateInSitePopup.menuSetupFunction;
      setupMenuBasedOnContent(tabId, options, siteName, menuSetupFunction);
    } else {
      displaySiteNameChangedMessage(popupState.initialStateInSitePopup.siteName, siteName);
    }
  } else if (popupState.progress < progressState.sitePopupDisplayError) {
    // if this came in after we setup the menu then check the siteName and URL are the same
    // if not display an error message
    if (siteName != popupState.initialStateInSitePopup.siteName) {
      displaySiteNameChangedMessage(popupState.initialStateInSitePopup.siteName, siteName);
    } else if (tab.url != popupState.extractedDocumentUrl) {
      displayUrlChangedMessage(popupState.extractedDocumentUrl, tab.url);
    }
  }
}

function tabChangeNotification(tabId, changeInfo, tab) {
  //console.log("popup_init: tabChangeNotification called, tabId = " + tabId);
  //console.log("popup_init: tabChangeNotification called, popupState is:");
  //console.log(popupState);

  if (popupState.progress < progressState.sitePopupCalledMenuSetup) {
    // do we do some tests on what the change was here?
    // Or just say go ahead and call setupMenuBasedOnContent?

    // It doesn't matter if the URL has changed if we haven't brought up the menu yet.
    // BUT - it does matter if the site name has changed.
    if (changeInfo.url) {
      let newUrlParts = separateUrlIntoParts(tab.pendingUrl);
      let oldUrlParts = separateUrlIntoParts(popupState.initialStateInSitePopup.tabUrl);
      if (newUrlParts && oldUrlParts) {
        if (newUrlParts.domain != oldUrlParts.domain) {
          displaySiteNameChangedMessage(oldUrlParts.domain, newUrlParts.domain);
          return;
        }
      }
    } else {
      // if we are switching to a non-supported site then the URL is always going to be undefined
      if (!tab.url) {
        displaySiteNameChangedMessage(oldUrlParts.domain, "unsupported");
        return;
      }
    }

    let tabId = popupState.initialStateInSitePopup.tabId;
    let options = popupState.initialStateInSitePopup.options;
    let siteName = popupState.initialStateInSitePopup.siteName;
    let menuSetupFunction = popupState.initialStateInSitePopup.menuSetupFunction;
    setupMenuBasedOnContent(tabId, options, siteName, menuSetupFunction);
  } else if (popupState.progress < progressState.sitePopupDisplayError) {
    // if this came in after we setup the menu then check URL is the same
    // if not display an error message
    if (tab.url != popupState.extractedDocumentUrl) {
      displayUrlChangedMessage(popupState.extractedDocumentUrl, tab.url);
    }
  }
}

function initialTimeoutEnd() {
  //console.log("popup_init: initialTimeoutEnd, popupState.progress is: " + popupState.progress);

  if (popupState.progress == progressState.sitePopupInitialTimeout) {
    // nothing else has happening during the timeout, go ahead and call setupMenuBasedOnContent
    let tabId = popupState.initialStateInSitePopup.tabId;
    let options = popupState.initialStateInSitePopup.options;
    let siteName = popupState.initialStateInSitePopup.siteName;
    let menuSetupFunction = popupState.initialStateInSitePopup.menuSetupFunction;
    setupMenuBasedOnContent(tabId, options, siteName, menuSetupFunction);
  }
}

async function initPopupGivenActiveTab(activeTab, options, siteName, menuSetupFunction) {
  // there are several different cases to handle here:
  // 1. The normal case: we did not come through default popup, the content is fully loaded and the
  //    content script has called contentLoaded and there is no pending load of a new page.
  //    This is what happens 99% of the time and this case should be performant (no awaits).
  // 2. Everything appears as above but there is actually a pending load that we can't detect
  //    This may be rare and manifest differently on different browsers. What we can do is precede
  //    as normal but listen for any change and invalidate the menu if detected.
  // 3. The tab status might be loading but only because some advert or additional data is loading.
  //    In this case we do not wan't any delays.
  // 4. The content script may not be loaded yet. In this case the tab status will most likely be loading.
  //    but we can't always tell if the contentLoaded message was sent yet.
  //    We can proceed as normal and do retries of calling the setupMenuBasedOnContent function until
  //    the content script responds. We can also listen for the contentLoaded message and imediately call
  //    setupMenuBasedOnContent to shortcut the retry timeout.
  // So, we could always go striaght to calling setupMenuBasedOnContent and then monitor for changes.
  // Are there any case on any browsers where this would fail?
  // It is possible it will bring up a menu for the previous page - but that can be detected as a URL change.
  // If this situation is detected before setupMenuBasedOnContent gets a response from the "extract" message
  // then we can just proceed as normal.
  // Are there any issues that can occur with starting sending the "extract" message too soon?
  // - We probably don't want to do this when pendingUrl is set - that suggests we are in the very early
  //   stages of a new page load.
  // So it seems there are three possible courses of action:
  // 1. call setupMenuBasedOnContent and don't bother listening for any changes
  // 2. call setupMenuBasedOnContent and monitor for messages
  // 3. wait a moment in case URL changes then call setupMenuBasedOnContent

  //console.log("popup_init: initPopupGivenActiveTab, siteName is: " + siteName);
  //console.log("popup_init: initPopupGivenActiveTab, activeTab is: " );
  //console.log(activeTab);

  popupState.progress = progressState.sitePopupHaveActiveTab;
  popupState.recordSitePopupActiveTab(activeTab, siteName, options, menuSetupFunction);

  if (popupState.receivedContentLoadedData) {
    // we received the contentLoaded message either:
    // - within popup.mjs
    // - while loading this module from popup.mjs
    // - while getting the options and active tab in this module
    if (popupState.receivedContentLoadedData.siteName != siteName) {
      displaySiteNameChangedMessage(siteName, popupState.receivedContentLoadedData.siteName);
      return;
    }

    // we have received contentLoaded since popup came up, we are good to go and don't
    // need to listen for any changes at this point.
    //console.log("popup_init: initPopupGivenActiveTab, already got contentLoaded, calling setupMenuBasedOnContent");
    setupMenuBasedOnContent(activeTab.id, options, siteName, menuSetupFunction);
    return;
  } else {
    popupState.onContentLoaded = contentLoadedNotification;
  }

  popupState.onTabChange = tabChangeNotification;

  let waitForChange = false;
  if (activeTab.status == "loading") {
    if (activeTab.pendingUrl) {
      waitForChange = true;
    } else if (popupState.didStartFromDefaultPopup) {
      waitForChange = true;
    }
  }

  if (waitForChange) {
    //console.log("popup_init: initPopupGivenActiveTab, doing a timeout");
    popupState.progress = progressState.sitePopupInitialTimeout;
    setTimeout(initialTimeoutEnd, 500);
    return;
  }

  // else we are not waiting
  //console.log("popup_init: initPopupGivenActiveTab, calling setupMenuBasedOnContent");
  setupMenuBasedOnContent(activeTab.id, options, siteName, menuSetupFunction);
}

async function callFunctionWithActiveTab(func) {
  //console.log("callFunctionWithActiveTab");
  //displayBusyMessage("WikiTree Sourcer initializing menu ...\ncallFunctionWithActiveTab");

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //displayBusyMessage("WikiTree Sourcer initializing menu ...\ncallFunctionWithActiveTab, got tab");
    //console.log("callFunctionWithActiveTab, got tab");
    if (tabs && tabs.length > 0 && tabs[0]) {
      func(tabs[0]);
    } else {
      // This has happened in iPhone simulator. It may have happened because it did not
      // popup the Safari dialog asking for permission to access the page
      let message = "Could not get active tab. There may be a problem with extension permissions.";
      openExceptionPage(message, "", undefined, true);
    }
  });
}

function initPopupInternal(siteName, menuSetupFunction) {
  macSecondMonitorWorkaround();
  setPopupMenuWidth();

  displayBusyMessageAfterDelay("WikiTree Sourcer initializing menu ...");

  // first get the options, then setup menu
  callFunctionWithStoredOptions(function (options) {
    callFunctionWithActiveTab(function (tab) {
      initPopupGivenActiveTab(tab, options, siteName, menuSetupFunction);
    });
  });
}

async function initPopup(siteName, menuSetupFunction) {
  popupState.progress = progressState.sitePopupEntered;

  //console.log("initPopup: recognised site popup, siteName is: " + siteName);
  //console.log("initPopup: popupState.didStartFromDefaultPopup is: " + popupState.didStartFromDefaultPopup);

  try {
    initPopupInternal(siteName, menuSetupFunction);
  } catch (e) {
    console.log("WikiTree Sourcer: initPopup, exception occurred, e is:");
    console.log(e);
    openExceptionPage("Error during creating popup menu for content.", "", e, true);
  }
}

export { initPopup };
