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

import { handleContentLoadedMessage } from "./background_content_loaded.mjs";
import {
  handleRegisterTabMessage,
  handleUnregisterTabMessage,
  handleGetRegisteredTabMessage,
  handleSendMessageToRegisteredTabMessage,
} from "./background_register_tab.mjs";
import { handleDoSearchWithSearchDataMessage } from "./background_search.mjs";
import { callFunctionWithStoredOptions } from "../options/options_loader.mjs";
import { handleExceptionMessage } from "./background_exception.mjs";
import {
  registerContentScripts,
  injectContentScriptsIntoTabsOnPermissionsChange,
} from "./background_content_scripts.mjs";
import { logDebug } from "/base/core/log_debug.mjs";

function setPopup(tab, popupPage) {
  //console.log("WikiTree Sourcer, background script (MV3), set popup on tab " + tab + " to: " + popupPage);
  chrome.action.setPopup({ tabId: tab, popup: popupPage });
}

function setIcon(tab, iconPath) {
  chrome.action.setIcon({ tabId: tab, path: iconPath });
}

async function handleGetPlatformInfoMessage(request, sendResponse) {
  let platformInfo = await chrome.runtime.getPlatformInfo();
  //console.log("platformInfo is:");
  //console.log(platformInfo);
  let response = { success: true, platformInfo: platformInfo };
  sendResponse(response);
}

async function doWtPlusApiCall(request, sendResponse) {
  console.log("doWtPlusApiCall, request is:", request);

  let fetchUrl = request.url;

  fetch(fetchUrl)
    .then((response) => response.text())
    .then((text) => sendResponse({ success: true, rawData: text }))
    .catch((error) => sendResponse({ success: false, error: error.message }));

  return true; // Keep the message channel open for the async response
}

async function doFetchJson(request, sendResponse) {
  console.log("doFetchJson, request is:", request);

  let fetchUrl = request.fetchUrl;
  let fetchOptions = request.fetchOptions;

  try {
    let response = await fetch(fetchUrl, fetchOptions);
    console.log("doFetchJson, response is:", response);

    console.log("fetchFsRecordDataObj, response.status is: " + response.status);

    if (response.status !== 200) {
      console.log("Looks like there was a problem. Status Code: " + response.status);
      console.log("Fetch URL is: " + fetchUrl);
      sendResponse({
        success: false,
        error: "FetchError",
        status: response.status,
        fetchUrl: fetchUrl,
      });
    }

    let jsonData = await response.text();

    //console.log("fetchFsRecordDataObj: response text is:");
    //console.log(jsonData);

    if (!jsonData || jsonData[0] != `{`) {
      console.log("The response text does not look like JSON");
      //console.log(jsonData);
      sendResponse({ success: false, error: "NotJSON" });
    }

    const json = JSON.parse(jsonData);

    console.log("json is:");
    console.log(json);

    sendResponse({ success: true, json: json });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }

  return true; // Keep the message channel open for the async response
}

// Listen for messages (from the popup script mostly)
function messageHandler(request, sender, sendResponse) {
  // Request should have these fields
  // type = the message type, a string that defines the action to be performed

  logDebug("background messageHandler, request is:", request);

  if (request.type == "contentLoaded") {
    //console.log("WikiTree Sourcer, background script, received contentLoaded message");
    handleContentLoadedMessage(request, sender, sendResponse, setPopup, setIcon);
  } else if (request.type == "registerTab") {
    //console.log("WikiTree Sourcer, background script, received registerTab message");
    handleRegisterTabMessage(request, sender, sendResponse);
    return true;
  } else if (request.type == "unregisterTab") {
    //console.log("WikiTree Sourcer, background script, received unregisterTab message");
    handleUnregisterTabMessage(request, sender, sendResponse);
    return true;
  } else if (request.type == "getRegisteredTab") {
    //console.log("WikiTree Sourcer, background script, received getRegisteredTab message");
    handleGetRegisteredTabMessage(request, sender, sendResponse);
    return true;
  } else if (request.type == "sendMessageToRegisteredTab") {
    handleSendMessageToRegisteredTabMessage(request, sender, sendResponse);
    return true;
  } else if (request.type == "doSearchWithSearchData") {
    //console.log("WikiTree Sourcer, background script, received doSearchWithSearchData message");
    handleDoSearchWithSearchDataMessage(request, sender, sendResponse);
    return true;
  } else if (request.type == "exception") {
    handleExceptionMessage(request, sendResponse);

    // we send an async response to confirm the tab was opened and updated
    return true;
  } else if (request.type == "getOptions") {
    callFunctionWithStoredOptions(function (options) {
      let response = { success: true, options: options };
      sendResponse(response);
    });
    return true;
  } else if (request.type == "getPlatformInfo") {
    handleGetPlatformInfoMessage(request, sendResponse);
    return true;
  } else if (request.type == "doWtPlusApiCall") {
    doWtPlusApiCall(request, sendResponse);
    return true;
  } else if (request.type == "doFetchJson") {
    doFetchJson(request, sendResponse);
    return true;
  } else if (request.type == "openInNewTab") {
    openInNewTab(request.url, sender.tab, request.tabOption);
  } else if (request.type == "reregisterContentScripts") {
    console.log("calling registerContentScripts");
    doRegisterContentScripts(sendResponse);
    return true;
  } else if (request.type == "log") {
    console.log("reveived log message in background", request.message);
    return false;
  }
  //else if (request.type == "updateContextMenu") {
  //  modifyContextMenu(request.contentType);
  //}
}

async function doRegisterContentScripts(sendResponse) {
  await registerContentScripts();

  let contentScripts = await chrome.scripting.getRegisteredContentScripts();
  logDebug("doRegisterContentScripts, sending response, contentScripts is ", contentScripts);
  sendResponse({ success: true });
}

function openInNewTab(link, currentTab, tabOption) {
  if (tabOption == "newWindow") {
    chrome.windows.create({ url: link });
  } else if (tabOption == "nextToRight" && currentTab) {
    chrome.tabs.create({ url: link, index: currentTab.index + 1 });
  } else {
    chrome.tabs.create({ url: link });
  }
}

export { messageHandler, openInNewTab };
