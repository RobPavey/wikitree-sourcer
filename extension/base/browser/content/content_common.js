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

// Code shared by most content scripts. This file is included by the manifest.json file.

// Overall design:
//
// Each type of web page has its own content script.
//
// The script should do as little as possible until the user brings up the Sourcer
// popup menu.
// It may get called as the menu comes up to determine what should be on the menu.

var isLoadedExtractDataModuleReady = false;
var isLoadedExtractDataModuleLoading = false;
var loadedExtractDataModule;
var loadedExtractDataModuleFailed = false;
var loadExtractDataModuleRetries = 0;
var extractDataAndRespondRetries = 0;

// These could be const but that causes a syntax error if this content script gets reloaded again
// in the same page. This can happen on Safari at least.
var maxLoadModuleRetries = 4;
var maxExtractDataAndRespondRetries = 3;
var loadModuleWaitTimeout = 100;
var loadModuleRetryTimeout = 200;

// these are duplicates of functions used in the popup code
function getBrowserName() {
  if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf("OPR")) != -1) {
    return "Opera";
  } else if (navigator.userAgent.indexOf("Chrome") != -1) {
    return "Chrome";
  } else if (navigator.userAgent.indexOf("Safari") != -1) {
    return "Safari";
  } else if (navigator.userAgent.indexOf("Firefox") != -1) {
    return "Firefox";
  } else if (navigator.userAgent.indexOf("MSIE") != -1 || !!document.documentMode == true) {
    //IF IE > 10
    return "IE";
  } else {
    return "unknown";
  }
}

function isSafari() {
  //console.log("navigator.userAgent is:");
  //console.log(navigator.userAgent);
  let browserName = getBrowserName();
  //console.log("browserName is:");
  //console.log(browserName);
  const isSafari = browserName == "Safari";
  return isSafari;
}

// this is a version of a function in a shared module but we can't use that dynamic module version here
async function openExceptionPageForContentScript(message, input, error, requestReport) {
  if (!isSafari()) {
    chrome.runtime.sendMessage(
      {
        type: "exception",
        message: message,
        input: input,
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        requestReport: requestReport,
      },
      function (response) {
        // We get a detailed response for debugging this
        //console.log("openExceptionPageForContentScript got response: ");
        //console.log(response);

        if (!response || !response.success) {
          // Note: In Safari it seems unable to send a message to the exception tab after
          // opening it. We can't use popup here in content, so log it.
          console.log("WikiTree Sourcer: Unexpected error :");
          console.log(message);
          console.log(error.stack);
        }
      }
    );
  } else {
    // lastest fallback for Safari
    console.log("WikiTree Sourcer: Unexpected error :");
    console.log(message);
    console.log(error.stack);
  }
}

async function loadExtractDataModule(modulePath) {
  //console.log('WikiTree Sourcer: loadExtractDataModule. relative path is: ', modulePath);
  if (!isLoadedExtractDataModuleReady && !isLoadedExtractDataModuleLoading) {
    const src = chrome.runtime.getURL(modulePath);
    try {
      //console.log('WikiTree Sourcer: loadExtractDataModule. About to import. src is: ', src);
      isLoadedExtractDataModuleLoading = true;
      loadedExtractDataModule = await import(src);
      isLoadedExtractDataModuleReady = true;
      isLoadedExtractDataModuleLoading = false;
      //console.log('WikiTree Sourcer: loadExtractDataModule. Loaded. src is: ', src);
    } catch (e) {
      console.log("WikiTree Sourcer: error in loadExtractDataModule. Path is: " + src + ", exception is:");
      console.log(e);

      // This can happen in the case of a FreeCen search for example, we are in the middle of loading
      // the extract data module and we do a form.submit which switched to another page, killing this script.
      // That has happened in Firefox at least and in that case the error object was undefined.

      // I have had some reports of this exception occuring in Firefox and the exception is "TypeError"
      // and the message is something like:
      // "error loading dynamically imported module: moz-extension://56237436-bc30-47ed-b1f4-8b006c9cc8ad/site/wikitree/core/wikitree_extract_data.mjs"
      // I can reproduce this in Firefox when I explcitly enable the permissions for wikitree.com
      // (so content script loads on page load) and then load this page:
      //  https://apps.wikitree.com/apps/straub620/wt_search.php?first_name=Florian&last_name=Straub
      // I might have to try multiple times to get the error.
      // So I added a retry and that seems to fix the issue.
      if (loadExtractDataModuleRetries < maxLoadModuleRetries) {
        loadExtractDataModuleRetries++;
        isLoadedExtractDataModuleLoading = false;
        setTimeout(function () {
          loadExtractDataModule(modulePath);
        }, loadModuleRetryTimeout);
      } else {
        if (e) {
          let message = "Error when attempting a dynamic import of the extract data module in a content script.\n";
          message +=
            "This may occur in versions of Firefox prior to Firefox 89 and possibly in versions of Safari prior to version 15.\n";
          message +=
            "If you get this message it may indicate that the WikiTree Sourcer extension does not work in your browser.";

          openExceptionPageForContentScript(message, modulePath, e, false);
        }
        loadedExtractDataModuleFailed = true;
      }
    }
  } else if (isLoadedExtractDataModuleLoading) {
    console.log("WikiTree Sourcer: loadExtractDataModule. Currently loading. relative path is: ", modulePath);
  } else {
    console.log("WikiTree Sourcer: loadExtractDataModule. Already loaded relative path is: ", modulePath);
    console.log("WikiTree Sourcer: loadExtractDataModule. loadedExtractDataModule is: ", loadedExtractDataModule);
  }
}

function extractDataAndRespond(document, url, contentType, sendResponse, siteSpecificInput) {
  //console.log('extractDataAndRespond. url: ' + url);

  if (!isLoadedExtractDataModuleReady) {
    if (loadedExtractDataModuleFailed) {
      let message = "Error when attempting use a dynamically imported extract data module in a content script.\n";
      message +=
        "This may occur in versions of Firefox prior to Firefox 89 and possibly in versions of Safari prior to version 15.\n";
      message +=
        "If you get this message it may indicate that the WikiTree Sourcer extension does not work in your browser.";
      sendResponse({
        success: false,
        errorMessage: message,
        requestReport: false,
      });
    } else if (isLoadedExtractDataModuleLoading) {
      // dependencies not ready, wait a few milliseconds and try again
      if (extractDataAndRespondRetries < maxExtractDataAndRespondRetries) {
        extractDataAndRespondRetries++;
        console.log("extractDataAndRespond. Retry number: ", extractDataAndRespondRetries);
        setTimeout(function () {
          extractDataAndRespond(document, url, contentType, sendResponse);
        }, loadModuleWaitTimeout);
        return true;
      } else {
        console.log("extractDataAndRespond. Too many retries");
        sendResponse({
          success: false,
          errorMessage: "Extract data module never loaded",
        });
      }
    } else {
      // module is not loaded and doesn't seem to be in the process of loading. This should never happen
      // but it does in Firefox when the extension is reloaded. It appears that somehow the module
      // gets loaded but then isLoadedExtractDataModuleReady gets set to false
      console.log("extractDataAndRespond. extract module not loaded and not loading");
      console.log("url is: " + url + ", contentType is: " + contentType);
      console.log("loadedExtractDataModule is: ");
      console.log(loadedExtractDataModule);
      sendResponse({
        success: false,
        errorMessage: "Extract data module never loaded",
      });
    }

    return false;
  }

  //console.log('extractDataAndRespond. calling : loadedExtractDataModule.extractData');

  // Extract the data.
  try {
    let extractedData = loadedExtractDataModule.extractData(document, url, siteSpecificInput);
    // respond with the type of content and the extracted data
    sendResponse({
      success: true,
      contentType: contentType,
      extractedData: extractedData,
    });
  } catch (error) {
    openExceptionPageForContentScript("Error while performing extractData", url, error, true);
    sendResponse({
      success: false,
      exceptionWasReported: true,
    });
  }

  return false;
}

function retryMessageToBackground(siteName, prefersDark) {
  console.log("retryMessageToBackground, siteName is : " + siteName);

  // Send the message a second time. Sometimes this is needed on Safari when the background script
  // has just started up. See notes in background_bootstrap.js
  // It is caused by a Safari bug with module type background scripts
  // NOTE: this may not be required after switching to MV3 on Safari.
  chrome.runtime.sendMessage(
    { type: "contentLoaded", siteName: siteName, prefersDark: prefersDark },
    function (response) {
      // nothing to do, the message needs to send a response though to avoid console error message
      console.log("siteContentInit 2nd attempt, received response from contentLoaded message, siteName is " + siteName);
      console.log(response);
      if (chrome.runtime.lastError) {
        // possibly there is no background script loaded, this should never happen
        console.log("retryMessageToBackground: No response from background script, lastError message is:");
        console.log(chrome.runtime.lastError.message);
      }
    }
  );
}

function setPopupAndIcon(siteName) {
  // We could do setPopup etc here rather than sending a message to the background.
  // The reason for the message is to get the tab id (which gets put in sender.tab.id).
  // Apparently chrome.tabs.query is not available in the content script.

  let prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  chrome.runtime.sendMessage(
    { type: "contentLoaded", siteName: siteName, prefersDark: prefersDark },
    function (response) {
      // we need to be sure that the background script got the message and set the popup
      //console.log("siteContentInit, received response from contentLoaded message, siteName is: " + siteName);
      //console.log("response is:");
      //console.log(response);
      //if (response) {
      //  console.log("response.success is: " + response.success);
      //}
      if (chrome.runtime.lastError) {
        // possibly there is no background script loaded, this should never happen
        console.log("siteContentInit: No response from background script. lastError message is:");
        console.log(chrome.runtime.lastError.message);
      } else if (!response || !response.success) {
        // This typically means that the background script was not listening yet and did not set
        // the popup. It is critical that it does so we keep retrying
        const contentLoadedTimeoutDelay = 500;
        setTimeout(function () {
          retryMessageToBackground(siteName, prefersDark);
        }, contentLoadedTimeoutDelay);
      } else {
        //console.log("siteContentInit, have response from bg, siteName is: " + siteName);
      }
    }
  );
}

function contentMessageListener(
  request,
  sender,
  sendResponse,
  siteName,
  overrideExtractHandler,
  additionalMessageHandler
) {
  // Request should have these fields
  // type = the message type, a string that defines the action to be performed

  //console.log("contentMessageListener, message arrived, request is : ");
  //console.log(request);
  //console.log(sender);

  if (additionalMessageHandler) {
    let handlerResult = additionalMessageHandler(request, sender, sendResponse);
    if (handlerResult.wasHandled) {
      return handlerResult.returnValue;
    }
  }

  if (request.type == "extract") {
    if (overrideExtractHandler) {
      let isAsync = overrideExtractHandler(request, sendResponse);
      return isAsync;
    }
    // Extract the data.
    let isAsync = extractDataAndRespond(document, location.href, siteName, sendResponse);
    if (isAsync) {
      return true;
    }
  } else if (request.type == "log") {
    // All content scripts implement this so that the popup script can print to the content console
    console.log(request.message);
    sendResponse();
  }

  // if we were going to respond async we would return true here. But in current design
  // we always respond synchronously for most requests.
}

function siteContentInit(siteName, extractModulePath, overrideExtractHandler, additionalMessageHandler) {
  console.log("siteContentInit, site name is: " + siteName);

  // In the case of Safari where the permission popup comes up when you click the extension icon,
  // siteContentInit is called when the user responds but the response from the contentLoaded
  // message not received until the extension icon is clicked again (weird can be minutes later!).

  setPopupAndIcon(siteName);

  loadExtractDataModule(extractModulePath);

  // Listen for messages (from the popup script mostly)
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    return contentMessageListener(
      request,
      sender,
      sendResponse,
      siteName,
      overrideExtractHandler,
      additionalMessageHandler
    );
  });
}
