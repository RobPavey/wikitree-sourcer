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

////////////////////////////////////////////////////////////////////////////////
// Code for registering/unregistering tab with background
////////////////////////////////////////////////////////////////////////////////

async function unregisterTabWithBackground() {
  //console.log("unregisterTabWithBackground");

  // send message to background script to unregister tab
  let unregisterResponse = await chrome.runtime.sendMessage({
    type: "unregisterTab",
    siteName: "gro",
    tab: registeredTabId,
  });

  //console.log("gro, response from unregisterTab message");
  //console.log(unregisterResponse);

  if (chrome.runtime.lastError) {
    // possibly there is no background script loaded, this should never happen
    console.log("gro: No response from background script, lastError message is:");
    console.log(chrome.runtime.lastError.message);
  }
}

var registeredTabId = undefined;

async function registerTabWithBackground() {
  // send message to background script that we have a gro tab open
  // This can fail with the error:
  //  Uncaught (in promise) Error: Extension context invalidated.
  // if the extension has been updated. So we do a try/catch
  try {
    let registerResponse = await chrome.runtime.sendMessage({ type: "registerTab", siteName: "gro" });

    //console.log("gro, response from registerTab message");
    //console.log(registerResponse);

    // we remember the tabId because in Firefox when we try to unregister
    // the sender in the message receiver has no tab if the tab was closed already.
    if (registerResponse && registerResponse.tab) {
      registeredTabId = registerResponse.tab;
    }

    if (chrome.runtime.lastError) {
      // possibly there is no background script loaded, this should never happen
      console.log("nzbdm: No response from background script, lastError message is:");
      console.log(chrome.runtime.lastError.message);
    } else {
      //console.log("addng event listener for unregister");

      // NOTE: this listener does not get triggered on iOS when the X is pressed to close tab.
      // It is a known bug and no workaround is known. Not unregistering the tab doesn't cause
      // problems - an error is reported to console when it tries to reuse it but then it falls back
      // to opening a new tab.
      window.addEventListener("pagehide", function () {
        //console.log("pagehide event");
        unregisterTabWithBackground();
      });
    }
  } catch (error) {
    // possibly there is no background script loaded, this should never happen
    // Could also be that the extension was just reloaded/updated
    console.log("gro: No response from background script, error is:");
    console.log(error);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Message hander to receive search message from background
////////////////////////////////////////////////////////////////////////////////

async function additionalMessageHandler(request, sender, sendResponse) {
  if (request.type == "doPost") {
    //console.log("gro: additionalMessageHandler, request is:");
    //console.log(request);
    //console.log("gro: additionalMessageHandler, document.URL is:");
    //console.log(document.URL);

    // We could try to check if this is the correct type of page (Births, Deaths etc)
    // and clear the fields and refill them. But it is simply to just load the desired URL
    // into this existing tab.

    let postData = request.postData;

    let fetchUrl = request.url;

    //console.log("additionalMessageHandler:doPost, fetchUrl is: " + fetchUrl);
    //console.log("additionalMessageHandler:doPost, postData is:");
    //console.log(postData);

    let fetchOptionsHeaders = {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      "Content-Type": "application/x-www-form-urlencoded",
    };

    let fetchOptions = {
      headers: fetchOptionsHeaders,
      body: postData,
      method: "POST",
    };

    let result = { success: false };

    try {
      let response = await fetch(fetchUrl, fetchOptions);

      //console.log("doPost, response.status is: " + response.status);

      if (response.status !== 200) {
        console.log("Looks like there was a problem. Status Code: " + response.status);
        console.log("Fetch URL is: " + fetchUrl);
        result.errorCondition = "FetchError";
        result.status = response.status;
        sendResponse(result);
        return { wasHandled: true, returnValue: false };
      }

      //console.log("additionalMessageHandler:doPost: fetch response is:");
      //console.log(response);

      let htmlText = await response.text();

      //console.log("doSearchPost: response text is:");
      //console.log(htmlText);

      result.success = true;
      result.status = response.status;
      result.htmlText = htmlText;
      sendResponse(result);
      return { wasHandled: true, returnValue: true };
    } catch (error) {
      console.log("fetch failed, error is:");
      console.log(error);
      console.log("Fetch URL is: " + fetchUrl);

      result.errorCondition = "Exception";
      result.status = response.status;
      result.error = error;
      sendResponse(result);
      return { wasHandled: true, returnValue: false };
    }
  }
  return { wasHandled: false };
}

async function doSetup() {
  siteContentInit(
    `gro`,
    `site/gro/core/gro_extract_data.mjs`,
    undefined, // overrideExtractHandler
    additionalMessageHandler
  );

  // probably should be done only for search window?
  registerTabWithBackground();
}

doSetup();
