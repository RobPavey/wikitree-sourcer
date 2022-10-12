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

const progressState = {
  notSet: 0,
  defaultPopupEntered: 1,
  defaultPopupHaveActiveTab: 2,
  defaultPopupTimeout: 3,
  defaultPopupDisplayError: 4,
  defaultPopupException: 5,
  defaultPopupSiteNotRecognized: 6,
  defaultPopupLoadingSiteModule: 7,
  sitePopupEntered: 8,
  sitePopupHaveActiveTab: 9,
  sitePopupInitialTimeout: 10,
  sitePopupSentExtract: 11,
  sitePopupRetryExtractTimeout: 12,
  sitePopupCalledMenuSetup: 13,
  sitePopupDisplayError: 14, // e.g. url changed or siteName changed
  sitePopupException: 15,
};

var popupState = {
  progress: progressState.notSet,
  didStartFromDefaultPopup: false,
  actveTabListener: undefined,
  tabId: undefined,
  extractedDocumentUrl: undefined,

  recordDefaultPopupActiveTab: function (activeTab) {
    this.initialStateInDefaultPopup = {
      tabId: activeTab.id,
      tabStatus: activeTab.status,
      tabUrl: activeTab.url,
      tabPendingUrl: activeTab.pendingUrl,
    };
    this.tabId = activeTab.id;
  },

  recordSitePopupActiveTab: function (activeTab, siteName, options, menuSetupFunction) {
    this.initialStateInSitePopup = {
      tabId: activeTab.id,
      tabStatus: activeTab.status,
      tabUrl: activeTab.url,
      tabPendingUrl: activeTab.pendingUrl,
      siteName: siteName,
      options: options,
      menuSetupFunction: menuSetupFunction,
    };
    this.tabId = activeTab.id;
  },
};

// NOTE: regarding pendingURL. It is of limited use. See this Stack Overflow post:
// https://stackoverflow.com/questions/60443329/is-pendingurl-always-defined-for-tabs-oncreatedfunctiontab

// Listen for the contentLoaded message that is sent from the content script to the background
// We never send a response - we are just lestening in
function contentLoadedMessageListener(request, sender, sendResponse) {
  //console.log("popup_state: contentLoadedMessageListener")

  if (request.type == "contentLoaded") {
    // remove listener? Not sure there is any need. We don't always get this message so it
    // will not always get removed.

    if (popupState.receivedContentLoadedData) {
      // this implies we got the contentLoaded message twice
      // This is actually possible on Safari, we send the message twice because the background
      // (see retryMessageToBackground)
      //console.log("popup_state: contentLoadedMessageListener, CALLED TWICE!");
      //console.log("  Old id is: " + popupState.receivedContentLoadedData.tabId
      //  + "and siteName is: " + popupState.receivedContentLoadedData.siteName);
      //console.log("  New id is: " + sender.tab.id
      //  + "and siteName is: " + request.siteName);
    }

    popupState.receivedContentLoadedData = {
      tabId: sender.tab.id,
      siteName: request.siteName,
    };

    if (popupState.onContentLoaded) {
      popupState.onContentLoaded(sender.tab, request.siteName);
    }
  }
}

function tabListener(tabId, changeInfo, tab) {
  if (tabId == popupState.tabId) {
    //console.log("popup_state: tabListener, changeInfo is:");
    //console.log(changeInfo);
    //console.log("popup_state: tabListener, changeInfo.status is: " + changeInfo.status);
    //console.log("popup_state: tabListener, changeInfo.url is: " + changeInfo.url);
    //console.log("popup_state: tabListener, tab.status is: " + tab.status);
    //console.log("popup_state: tabListener, tab.id is: " + tab.id);
    //console.log("popup_state: tabListener, tab.url is: " + tab.url);
    //console.log("popup_state: tabListener, tab.pendingUrl is: " + tab.pendingUrl);

    // the change can but something like the title that we are not interested in
    if (changeInfo.status || changeInfo.url) {
      popupState.lastChangeToThisTab = {
        tabId: tabId,
        changeInfo: changeInfo,
        tabStatus: tab.status,
        tabUrl: tab.url,
        tabPendingUrl: tab.pendingUrl,
      };

      if (popupState.onTabChange) {
        popupState.onTabChange(tabId, changeInfo, tab);
      }
    }
  } else if (!popupState.tabId) {
    popupState.lastTabChangeBeforeActiveTabIdSet = {
      tabId: tabId,
      changeInfo: changeInfo,
      tabStatus: tab.status,
      tabUrl: tab.url,
      tabPendingUrl: tab.pendingUrl,
    };
  }
}

function separateUrlIntoParts(url) {
  if (!url) {
    return undefined;
  }

  const schemeSuffix = "://";
  let schemeSuffixIndex = url.indexOf(schemeSuffix);
  if (schemeSuffixIndex == -1) {
    return undefined;
  }
  let scheme = url.substring(0, schemeSuffixIndex);
  let remainder = url.substring(schemeSuffixIndex + schemeSuffix.length);

  let dotIndex = remainder.indexOf(".");
  if (dotIndex == -1) {
    return undefined;
  }
  let subdomain = remainder.substring(0, dotIndex);
  remainder = remainder.substring(dotIndex + 1);

  let slashIndex = remainder.indexOf("/");
  if (slashIndex == -1) {
    slashIndex = remainder.length;
  }
  let domain = remainder.substring(0, slashIndex);
  let subdirectory = remainder.substring(slashIndex + 1);

  return {
    scheme: scheme,
    subdomain: subdomain,
    domain: domain,
    subdirectory: subdirectory,
  };
}

chrome.runtime.onMessage.addListener(contentLoadedMessageListener);
chrome.tabs.onUpdated.addListener(tabListener);

export { popupState, progressState };
