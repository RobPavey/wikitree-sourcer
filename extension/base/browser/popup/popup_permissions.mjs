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

import { displayMessageThenClosePopup, emptyMenu, displayMessageWithIcon } from "./popup_menu_building.mjs";

async function requestPermissionsFromUser(permissions, options) {
  //console.log("requestPermissionsFromUser, permissions is:");
  //console.log(permissions);

  const reasonMessage = options.reason;
  const allowSkip = options.allowSkip;
  const needsPopupDisplayed = options.needsPopupDisplayed;

  function addBreak(fragment) {
    let br = document.createElement("br");
    fragment.appendChild(br);
  }

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

  let label3Message = "Press the button below to request the permission.";
  if (needsPopupDisplayed) {
    label3Message += " This may close the popup so you may have to click on the Sourcer [1] icon again.";
  }
  label3.innerText = label3Message;
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
    skipButton = document.createElement("button");
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
        let requestResult = await chrome.permissions.request(permissions);
        menu.style = savedMenuStyle;
        if (!requestResult) {
          displayMessageWithIcon("warning", "Permission request failed");
          resolve(false);
        } else {
          resolve(true);
        }
      } catch (error) {
        console.log("Exception caught during chrome.permissions.request.");
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

async function checkPermissionForSites(siteMatches, options) {
  let permissions = { origins: siteMatches };

  //console.log("checkPermissionForSites, permissions is:");
  //console.log(permissions);

  let hasPermission = await chrome.permissions.contains(permissions);

  if (hasPermission) {
    return true;
  }

  if (options.checkOnly) {
    return false;
  }

  // request permission from Firefox
  return await requestPermissionsFromUser(permissions, options);
}

async function checkPermissionForSite(matchString, options) {
  let siteMatches = [matchString];
  return await checkPermissionForSites(siteMatches, options);
}

async function checkPermissionForSiteFromUrl(url, options) {
  let domain = url.replace(/https?\:\/\/[^\.]+\.([^\/]+)\/.*/, "$1");
  if (!domain || domain == url) {
    if (!options.defaultDomain) {
      return false;
    }
    domain = options.defaultDomain;
  }

  // Note: it is best to use the scheme in the URL rather than "*" because the request
  // has to be a subset of what is in the manifest. On Safari if there is a content match
  // for, say, "https://*.wikitree.com/*" and we request "*://*.wikitree.com/*" it will get an
  // exception.
  let scheme = url.replace(/(https?)\:\/\/[^\.]+\.[^\/]+\/.*/, "$1");
  if (!scheme || scheme == url) {
    scheme = "https";
  }

  // we want a match string like: "*://*.ancestry.com/*"

  let subDomain = "*";
  if (options.overrideSubdomain) {
    subDomain = options.overrideSubdomain;
  }

  let matchString = scheme + "://" + subDomain + "." + domain + "/*";

  return await checkPermissionForSite(matchString, options);
}

export { checkPermissionForSite, checkPermissionForSites, checkPermissionForSiteFromUrl };
