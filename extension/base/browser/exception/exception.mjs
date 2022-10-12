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

async function updatePage(request) {
  let message = request.message;
  let input = request.input;
  let errorName = request.errorName;
  let errorMessage = request.errorMessage;
  let errorStack = request.errorStack;

  let requestReport = request.requestReport;

  let reportElement = document.getElementById("requestReport");
  if (!requestReport) {
    reportElement.style.display = "none";
  }

  let descriptionElement = document.getElementById("description");
  if (descriptionElement) {
    descriptionElement.innerText = message;
  }

  //console.log("error is:");
  //console.log(errorStack);
  //console.log("input is:");
  //console.log(input);

  let detailsElement = document.getElementById("details");
  if (detailsElement && errorStack) {
    detailsElement.innerText = errorStack;
  }

  try {
    let inputDataDiv = document.getElementById("inputDataDiv");
    if (inputDataDiv) {
      if (input) {
        let inputText = JSON.stringify(input, null, 2);
        let inputDataElement = document.getElementById("inputData");
        if (inputDataElement) {
          inputDataElement.innerText = inputText;
        }
      } else {
        inputDataDiv.style.display = "none";
      }
    }
  } catch (e) {}

  try {
    if (browser && browser.runtime.getBrowserInfo) {
      let browserInfo = await browser.runtime.getBrowserInfo();
      if (browserInfo) {
        let browserInfoElement = document.getElementById("browserInfo");
        let browserInfoText = JSON.stringify(browserInfo, null, 2);
        let message = "Browser Info\n" + browserInfoText;
        browserInfoElement.innerText = message;
      }
    }
  } catch (e) {}

  try {
    let manifest = chrome.runtime.getManifest();
    if (manifest) {
      let version = manifest.version;
      if (version) {
        let versionMessage = "The extension version is " + version;

        let extensionVersionElement = document.getElementById("extensionVersion");
        if (extensionVersionElement) {
          extensionVersionElement.innerText = versionMessage;
        }
      }
    }
  } catch (e) {}

  try {
    let userAgentString = window.navigator.userAgent;
    if (userAgentString) {
      let userAgentElement = document.getElementById("userAgent");
      let message = "User Agent Info\n" + userAgentString;
      userAgentElement.innerText = message;
    }
  } catch (e) {}
}

// Listen for messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("exception.js received a message. Request is:");
  console.log(request);

  if (request.type == "exception") {
    sendResponse({ success: true }); // do this to let the caller we received message

    updatePage(request);
  }
});

//console.log("exception.js loaded");
