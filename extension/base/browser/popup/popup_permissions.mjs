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

import {
  displayMessageWithIconThenClosePopup,
  displayMessageThenClosePopup,
  emptyMenu,
  isFirefox,
  displayMessageWithIcon,
} from "./popup_menu_building.mjs";

function writeToClipboardSuccessMessage(objectName, internalSave, extraMessage = "") {
  let message1 = objectName + " saved to clipboard.";
  let message2 = extraMessage;
  if (internalSave) {
    message2 = "It is also saved internally.\n" + extraMessage;
  }
  displayMessageWithIconThenClosePopup("check", message1, message2);
}

async function requestPermissionsFromUser(reasonMessage, permissions, allowSkip = false) {
  function addBreak(fragment) {
    let br = document.createElement("br");
    fragment.appendChild(br);
  }

  // This is currently only used on Safari

  emptyMenu();

  let fragment = document.createDocumentFragment();

  let messageDiv1 = document.createElement("div");
  messageDiv1.className = "flex-parent jc-center";
  addBreak(messageDiv1);

  let label1 = document.createElement("label");
  label1.className = "messageLabel";
  label1.innerText = "Additional permissions are needed to complete this operation.";
  messageDiv1.appendChild(label1);

  fragment.appendChild(messageDiv1);

  if (reasonMessage) {
    let messageDiv2 = document.createElement("div");
    messageDiv2.className = "flex-parent jc-center";
    addBreak(messageDiv2);

    let label2 = document.createElement("label");
    label2.className = "messageLabel";
    label2.innerText = reasonMessage;
    messageDiv2.appendChild(label2);

    addBreak(messageDiv2);

    fragment.appendChild(messageDiv2);
  }

  let messageDiv3 = document.createElement("div");
  messageDiv3.className = "flex-parent jc-center";
  addBreak(messageDiv3);

  let label3 = document.createElement("label");
  label3.className = "messageLabel";
  label3.innerText =
    "Press the button below to request the permission. This will restart the extension so you will have to click on the Sourcer [1] icon again.";
  messageDiv3.appendChild(label3);

  addBreak(messageDiv3);

  fragment.appendChild(messageDiv3);

  // request button
  let requestButton = document.createElement("button");
  requestButton.className = "dialogButton";
  requestButton.innerText = "Request the permissions";

  let buttonDiv = document.createElement("div");
  buttonDiv.className = "flex-parent jc-center";
  buttonDiv.appendChild(requestButton);

  fragment.appendChild(buttonDiv);

  // skip button
  let skipButton = undefined;
  if (allowSkip) {
    let skipButton = document.createElement("button");
    skipButton.className = "dialogButton";
    skipButton.innerText = "Continue without permission";

    let buttonDiv = document.createElement("div");
    buttonDiv.className = "flex-parent jc-center";
    buttonDiv.appendChild(skipButton);

    fragment.appendChild(buttonDiv);
  }

  // add fragment to menu
  let menu = document.getElementById("menu");
  menu.appendChild(fragment);

  return new Promise(function (resolve, reject) {
    requestButton.onclick = async function (element) {
      let savedMenuStyle = menu.style;
      menu.style = "display:none";
      try {
        let requestResult = await browser.permissions.request(permissions);
        menu.style = savedMenuStyle;
        if (!requestResult) {
          displayMessageWithIcon("warning", "Permission request failed");
          resolve(false);
        }

        resolve(true);
      } catch (error) {
        console.log("Exception caught during browser.permissions.request.");
        console.log(error);
        menu.style = savedMenuStyle;
        displayMessageThenClosePopup("Permission request failed.");
        resolve(false);
      }
    };

    if (skipButton) {
      skipButton.onclick = async function (element) {
        resolve(false);
      };
    }
  });
}

async function checkPermissionForSites(reasonMessage, siteMatches, allowSkip = false) {
  if (!isFirefox()) {
    return true;
  }

  let permissions = { origins: siteMatches };
  let hasPermission = await browser.permissions.contains(permissions);

  if (hasPermission) {
    return true;
  }

  // request permission from Firefox
  return await requestPermissionsFromUser(reasonMessage, permissions, allowSkip);
}

async function checkPermissionForSite(reasonMessage, matchString, allowSkip = false) {
  if (!isFirefox()) {
    return true;
  }

  let siteMatches = [matchString];
  return await checkPermissionForSites(reasonMessage, siteMatches, allowSkip);
}

async function checkPermissionForSiteFromUrl(reasonMessage, url, defaultDomain, overrideSubdomain, allowSkip = false) {
  let domain = url.replace(/https?\:\/\/[^\.]+\.([^\/]+)\/.*/, "$1");
  if (!domain || domain == url) {
    if (!defaultDomain) {
      return false;
    }
    domain = defaultDomain;
  }

  // we want a match string like: "*://*.ancestry.com/*"

  let subDomain = "*";
  if (overrideSubdomain) {
    subDomain = overrideSubdomain;
  }

  let matchString = "*://" + subDomain + "." + domain + "/*";

  return await checkPermissionForSite(reasonMessage, matchString, allowSkip);
}
export { checkPermissionForSite, checkPermissionForSites, checkPermissionForSiteFromUrl };
