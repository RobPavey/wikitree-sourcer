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

// these are duplicates of functions used in the popup code

function logDebug(...args) {
  const debugConfig = {
    enabled: false,

    showTimestamp: false,
    showDebugText: false,
  };
  if (!debugConfig.enabled) return;

  // check if we are in a production environment in the browser.
  // (if not in browser we are NOT in production)
  // NOTE: This is just a safety catch in case we forget to turn off debugConfig.enabled
  if (typeof chrome === "object") {
    // we are in browser
    var manifest = chrome.runtime.getManifest();
    if (!manifest) {
      return; // not sure assume production
    }

    let isDev = typeof manifest.key == "undefined" && typeof manifest.update_url == "undefined";
    if (!isDev) {
      return;
    }
  }

  let textString = debugConfig.showTimestamp ? `[${new Date().toISOString()}]` : "";
  if (debugConfig.showDebugText) {
    textString += " [DEBUG]";
    textString.trim();
  }
  console.log(textString, ...args);
}

function getBrowserName() {
  const url = (typeof browser !== "undefined" ? browser : chrome).runtime.getURL("");

  // these checks should succeeded in most cases, but in case they don't
  // we have the userAgent fallback at the end.
  if (url.startsWith("moz-extension://")) return "Firefox";
  if (url.startsWith("safari-web-extension://")) return "Safari";
  if (url.startsWith("chrome-extension://")) return "Chrome"; // Also covers Edge/Brave

  // URL checks did not work, so we will try some other checks.
  // Note that these are not 100% reliable but should work in most cases.
  // We will also check for Safari-specific legacy or global objects first
  // to avoid false positives from userAgent checks.

  // Check for Safari-specific legacy or global objects first
  if (typeof safari !== "undefined") return "Safari";

  // Check for Firefox via the 'browser' namespace
  // and specific internal sources (Chrome/Safari don't use 'moz-extension')
  if (typeof browser !== "undefined" && typeof chrome !== "undefined") {
    if (browser.runtime && chrome.runtime && !navigator.userAgent.includes("Chrome")) {
      return "Firefox";
    }
  }

  // fallback to userAgent checks if the above checks did not work.
  // Note that these are not 100% reliable but should work in most cases.
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
  logDebug("navigator.userAgent is:", navigator.userAgent);
  let browserName = getBrowserName();
  logDebug("browserName is:", browserName);
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
        logDebug("openExceptionPageForContentScript got response: ", response);

        if (!response || !response.success) {
          // Note: In Safari it seems unable to send a message to the exception tab after
          // opening it. We can't use popup here in content, so log it.
          console.error("WikiTree Sourcer: Unexpected error :");
          console.error(message);
          console.error(error.stack);
        }
      }
    );
  } else {
    // lastest fallback for Safari
    console.error("WikiTree Sourcer: Unexpected error :");
    console.error(message);
    console.error(error.stack);
  }
}

function extractDataAndRespond(document, url, contentType, sendResponse, siteSpecificInput) {
  logDebug("extractDataAndRespond. url: " + url);

  // Extract the data.
  try {
    let extractedData = extractData(document, url, siteSpecificInput);
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
  logDebug("retryMessageToBackground, siteName is : " + siteName);

  // Send the message a second time. Sometimes this is needed on Safari when the background script
  // has just started up. See notes in background_bootstrap.js
  // It is caused by a Safari bug with module type background scripts
  // NOTE: this may not be required after switching to MV3 on Safari.
  chrome.runtime.sendMessage(
    { type: "contentLoaded", siteName: siteName, prefersDark: prefersDark },
    function (response) {
      // nothing to do, the message needs to send a response though to avoid console error message
      logDebug(
        "retryMessageToBackground 2nd attempt, received response from contentLoaded message, siteName is " + siteName
      );
      logDebug(response);
      if (chrome.runtime.lastError) {
        // possibly there is no background script loaded, this should never happen
        logDebug(
          "retryMessageToBackground: No response from background script, lastError message is:",
          chrome.runtime.lastError.message
        );
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
      logDebug("setPopupAndIcon, received response from contentLoaded message, siteName is: " + siteName);
      logDebug("response is:", response);
      if (response) {
        logDebug("response.success is: " + response.success);
      }
      if (chrome.runtime.lastError) {
        // possibly there is no background script loaded, this should never happen
        logDebug(
          "setPopupAndIcon: No response from background script. lastError message is:",
          chrome.runtime.lastError.message
        );
      } else if (!response || !response.success) {
        // This typically means that the background script was not listening yet and did not set
        // the popup. It is critical that it does so we keep retrying
        const contentLoadedTimeoutDelay = 500;
        setTimeout(function () {
          retryMessageToBackground(siteName, prefersDark);
        }, contentLoadedTimeoutDelay);
      } else {
        logDebug("setPopupAndIcon, have response from bg, siteName is: " + siteName);
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

  logDebug("contentMessageListener, message arrived, request is : ", request);
  logDebug(sender);

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
    logDebug(request.message);
    sendResponse();
  } else if (request.type == "ping") {
    // can be used to test if the content script is loaded
    sendResponse();
  }

  return false; // no async
}

function siteContentInit(siteName, overrideExtractHandler, additionalMessageHandler) {
  logDebug("siteContentInit, site name is: " + siteName);

  // in certain cases the content script can get loaded twice (e.g. in Safari after an update
  // the existing tabs may have the old content script loaded and the new one gets loaded)
  // Define a unique ID for this specific "load" of the script
  const scriptInstanceId = Math.random().toString(36).substr(2, 9);
  window.currentWikiTreeInstance = scriptInstanceId;

  // In the case of Safari where the permission popup comes up when you click the extension icon,
  // siteContentInit is called when the user responds but the response from the contentLoaded
  // message not received until the extension icon is clicked again (weird can be minutes later!).

  setPopupAndIcon(siteName);

  // Listen for messages (from the popup script mostly)
  try {
    if (chrome.runtime && chrome.runtime.id) {
      function onMessageListener(request, sender, sendResponse) {
        logDebug("onMessageListener, message arrived, request is : ", request);
        logDebug(sender);

        logDebug("chrome.runtime?.id is : " + chrome.runtime?.id);

        // Check if the runtime is still alive
        if (!chrome.runtime?.id) {
          console.warn("WikiTree: Extension context invalidated. Cleaning up.");
          chrome.runtime.onMessage.removeListener(onMessageListener);
          return false;
        }

        logDebug("window.currentWikiTreeInstance is : " + window.currentWikiTreeInstance);
        logDebug("scriptInstanceId : " + scriptInstanceId);

        // Check if this instance of the content script is still the "active" one
        if (window.currentWikiTreeInstance !== scriptInstanceId) {
          console.warn("Old script instance - ignored message.");
          return false; // Stay silent and let the new instance handle it
        }

        logDebug("content onMessageListener calling contentMessageListener");
        return contentMessageListener(
          request,
          sender,
          sendResponse,
          siteName,
          overrideExtractHandler,
          additionalMessageHandler
        );
      }

      chrome.runtime.onMessage.addListener(onMessageListener);
      logDebug("Listener registered successfully in context:", chrome.runtime.id);
    } else {
      console.warn("Registration skipped: No runtime ID available.");
    }
  } catch (error) {
    console.error("Critical failure during listener attachment:", error.message);
  }
}
