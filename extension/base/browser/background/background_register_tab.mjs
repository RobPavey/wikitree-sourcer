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

// NOTE: because service workers are non-persistent we can't store siteRegistry in a global var
async function getSiteRegistry() {
  let value = await chrome.storage.session.get(["backgroundTabIdRegistry"]);

  //console.log("getSiteRegistry, value is:");
  //console.log(value);

  if (!(value && value.backgroundTabIdRegistry)) {
    return {};
  }

  //console.log("getSiteRegistry, value.backgroundTabIdRegistry is:");
  //console.log(value.backgroundTabIdRegistry);

  let siteRegistry = value.backgroundTabIdRegistry;

  return siteRegistry;
}

async function setSiteRegistry(siteRegistry) {
  //console.log("setSiteRegistry, siteRegistry is:");
  //console.log(siteRegistry);

  chrome.storage.session.set({ backgroundTabIdRegistry: siteRegistry });
}

async function handleRegisterTabMessage(request, sender, sendResponse) {
  //console.log("handleRegisterTabMessage");

  let siteRegistry = await getSiteRegistry();

  //console.log("siteRegistry is:");
  //console.log(siteRegistry);

  let tab = sender.tab.id;

  let siteName = request.siteName;

  let tabList = siteRegistry[siteName];

  if (tabList === undefined) {
    tabList = [];
  }

  if (!tabList.includes(tab)) {
    tabList.push(tab);
  }

  siteRegistry[siteName] = tabList;

  setSiteRegistry(siteRegistry);

  //console.log("handleRegisterTabMessage, done, siteRegistry is:");
  //console.log(siteRegistry);

  let response = { success: true, tab: tab };
  //console.log("WikiTree Sourcer, background script, sending response to registerTab message:");
  //console.log(response);
  sendResponse(response);
}

async function handleUnregisterTabMessage(request, sender, sendResponse) {
  //console.log("handleUnregisterTabMessage, received unregisterTab message");
  //console.log("sender is:");
  //console.log(sender);

  let siteRegistry = await getSiteRegistry();

  //console.log("siteRegistry is:");
  //console.log(siteRegistry);

  let tab = request.tab;

  if (!tab && sender && sender.tab && sender.tab.id) {
    tab = sender.tab.id;
  }

  //console.log("tab is:");
  //console.log(tab);

  let siteName = request.siteName;

  let tabList = siteRegistry[siteName];

  if (tabList === undefined) {
    tabList = [];
  }

  let index = tabList.indexOf(tab);
  if (index != -1) {
    tabList.splice(index, 1);
  }

  siteRegistry[siteName] = tabList;

  setSiteRegistry(siteRegistry);

  //console.log("handleUnregisterTabMessage, done, siteRegistry is:");
  //console.log(siteRegistry);

  let response = { success: true, tab: tab };
  //console.log("WikiTree Sourcer, background script, sending response to unregisterTab message:");
  //console.log(response);
  sendResponse(response);
}

async function handleGetRegisteredTabMessage(request, sender, sendResponse) {
  //console.log("handleGetRegisteredTabMessage, siteName is: " + request.siteName);

  let siteRegistry = await getSiteRegistry();

  //console.log("handleGetRegisteredTabMessage, siteRegistry is:");
  //console.log(siteRegistry);

  let siteName = request.siteName;

  let response = { success: false };

  let tabList = siteRegistry[siteName];

  if (tabList && tabList.length > 0) {
    let tab = tabList[tabList.length - 1];
    response = { success: true, tab: tab };
  }

  //console.log("WikiTree Sourcer, background script, sending response to getRegisteredTab message:");
  //console.log(response);
  sendResponse(response);
}

async function handleSendMessageToRegisteredTabMessage(request, sender, sendResponse) {
  //console.log("handleSendMessageToRegisteredTabMessage, siteName is: " + request.siteName);

  let siteName = request.siteName;
  let requestToSend = request.requestToSend;
  let urlToCreate = request.urlToCreate;
  let makeActive = request.makeActive;

  let existingTabId = await getRegisteredTab(siteName);

  if (existingTabId) {
    // tab exists send the message
    let result = { success: false };

    try {
      let response = await chrome.tabs.sendMessage(existingTabId, requestToSend);

      if (chrome.runtime.lastError) {
        console.log("handleSendMessageToRegisteredTabMessage failed, lastError is:");
        console.log(lastError);
      } else if (!response) {
        console.log("handleSendMessageToRegisteredTabMessage failed, null response");
      } else {
        //console.log("doSearchInExistingTab message sent OK");
        result.success = true;
        result.responseFromTab = response;
      }
    } catch (error) {
      console.log("caught error from sendMessage:");
      console.log(error);
    }

    //console.log("WikiTree Sourcer, background script, sending response to getRegisteredTab message:");
    //console.log(response);
    sendResponse(result);
  } else {
    chrome.tabs.create({ url: urlToCreate, active: makeActive }, function (createdTab) {
      //console.log("Created Tab");
      //console.log(createdTab);

      if (createdTab && createdTab.id) {
        chrome.tabs.onUpdated.addListener(function tabListener(tabId, changeInfo, tab) {
          //console.log("Created tab updated, tabId is: " + tabId);

          // make sure the status is 'complete' and it's the right tab
          if (tabId == createdTab.id && changeInfo.status == "complete") {
            //console.log("Created tab is complete, sending message");

            // remove the listener now that we know the tab has completed loading
            chrome.tabs.onUpdated.removeListener(tabListener);

            chrome.tabs.sendMessage(tabId, requestToSend, function (response) {
              if (!response) {
                console.log("Null response from sending message to tab");
                sendResponse({
                  success: false,
                  createdTab: createdTab,
                  changeInfo: changeInfo,
                  tabId: tabId,
                  tab: tab,
                  lastError: chrome.runtime.lastError,
                });
              } else {
                //console.log("Response from sending message to tab is:");
                //console.log(response);

                // we send a detailed response back to the caller for debugging this mechanism
                sendResponse({
                  success: true,
                  createdTab: createdTab,
                  changeInfo: changeInfo,
                  tabId: tabId,
                  tab: tab,
                  responseFromTab: response,
                  lastError: chrome.runtime.lastError,
                });
              }
            });
          }
        });
      }
    });
  }
}

async function getRegisteredTab(siteName) {
  let siteRegistry = await getSiteRegistry();

  //console.log("getRegisteredTab, siteRegistry is:");
  //console.log(siteRegistry);

  let tabList = siteRegistry[siteName];

  //console.log("getRegisteredTab, tabList is:");
  //console.log(tabList);

  if (tabList && tabList.length > 0) {
    let tab = tabList[tabList.length - 1];
    return tab;
  }
}

async function anyTabRemoved(tabId) {
  // This is a fallback in case the tab doesn't manage to unregister itself.
  // This can happen if the background is asleep when the tab is closed.

  //console.log("anyTabRemoved");

  //console.log("tabId is:");
  //console.log(tabId);

  let siteRegistry = await getSiteRegistry();

  //console.log("siteRegistry is:");
  //console.log(siteRegistry);

  let foundTabInRegistry = false;

  for (let siteName of Object.keys(siteRegistry)) {
    let tabList = siteRegistry[siteName];
    if (tabList && tabList.length > 0) {
      let index = tabList.indexOf(tabId);
      if (index != -1) {
        tabList.splice(index, 1);
        foundTabInRegistry = true;
        siteRegistry[siteName] = tabList;
      }
    }
  }

  if (foundTabInRegistry) {
    //console.log("anyTabRemoved, found tabId in site registry");
    setSiteRegistry(siteRegistry);
  }
}

chrome.tabs.onRemoved.addListener(anyTabRemoved);

export {
  handleRegisterTabMessage,
  handleUnregisterTabMessage,
  handleGetRegisteredTabMessage,
  handleSendMessageToRegisteredTabMessage,
  getRegisteredTab,
};
