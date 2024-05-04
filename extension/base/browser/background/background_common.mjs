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
} from "./background_register_tab.mjs";
import { handleDoSearchWithSearchDataMessage } from "./background_search.mjs";
import { callFunctionWithStoredOptions } from "../options/options_loader.mjs";

function setPopup(tab, popupPage) {
  //console.log("WikiTree Sourcer, background script (MV3), set popup on tab " + tab + " to: " + popupPage);
  chrome.action.setPopup({ tabId: tab, popup: popupPage });
}

function setIcon(tab, iconPath) {
  chrome.action.setIcon({ tabId: tab, path: iconPath });
}

// Listen for messages (from the popup script mostly)
function messageHandler(request, sender, sendResponse) {
  // Request should have these fields
  // type = the message type, a string that defines the action to be performed

  //console.log("background messageHandler, request is: ");
  //console.log(request);

  if (request.type == "contentLoaded") {
    //console.log("WikiTree Sourcer, background script, received contentLoaded message");
    handleContentLoadedMessage(request, sender, sendResponse, setPopup, setIcon);
  } else if (request.type == "registerTab") {
    //console.log("WikiTree Sourcer, background script, received registerTab message");
    handleRegisterTabMessage(request, sender, sendResponse);
  } else if (request.type == "unregisterTab") {
    //console.log("WikiTree Sourcer, background script, received unregisterTab message");
    handleUnregisterTabMessage(request, sender, sendResponse);
  } else if (request.type == "getRegisteredTab") {
    //console.log("WikiTree Sourcer, background script, received getRegisteredTab message");
    handleGetRegisteredTabMessage(request, sender, sendResponse);
  } else if (request.type == "doSearchWithSearchData") {
    //console.log("WikiTree Sourcer, background script, received doSearchWithSearchData message");
    handleDoSearchWithSearchDataMessage(request, sender, sendResponse);
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
  }
  //else if (request.type == "updateContextMenu") {
  //  modifyContextMenu(request.contentType);
  //}
}

function openInNewTab(link, currentTab, options) {
  const tabOption = options.context_general_newTabPos;

  if (tabOption == "newWindow") {
    chrome.windows.create({ url: link });
  } else if (tabOption == "nextToRight" && currentTab) {
    chrome.tabs.create({ url: link, index: currentTab.index + 1 });
  } else {
    chrome.tabs.create({ url: link });
  }
}

export { messageHandler, openInNewTab };
