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
import { logDebug } from "/base/core/log_debug.mjs";
import { isFirefox } from "/base/browser/common/browser_check.mjs";
import {
  commonCheckPermissionForSite,
  commonCheckPermissionForSites,
  commonCheckPermissionForSiteFromUrl,
  commonCheckPermissionForSiteMatches,
} from "/base/browser/common/permissions.mjs";

async function requestPermissionsFromUser(permissions, options) {
  logDebug("requestPermissionsFromUser, permissions is:", permissions);

  const reasonMessage = options.reason;
  const allowSkip = options.allowSkip;
  const needsPopupDisplayed = options.needsPopupDisplayed;
  const userClickedExtensionPopup = options.userClickedExtensionPopup;

  emptyMenu();

  let fragment = document.createDocumentFragment();

  let messageDiv1 = document.createElement("div");
  messageDiv1.className = "flex-parent jc-center";

  let label1 = document.createElement("label");
  label1.className = "messageLabel";
  label1.innerText = "Additional permissions are needed to complete this operation.";
  messageDiv1.appendChild(label1);

  fragment.appendChild(messageDiv1);

  if (reasonMessage) {
    let messageDiv2 = document.createElement("div");
    messageDiv2.className = "flex-parent jc-center";

    let label2 = document.createElement("label");
    label2.className = "messageLabel";
    label2.innerText = reasonMessage;
    messageDiv2.appendChild(label2);

    fragment.appendChild(messageDiv2);
  }

  if (permissions && permissions.origins) {
    let messageDivPermissions = document.createElement("div");
    messageDivPermissions.className = "permissions-div";

    let labelPermissions = document.createElement("label");
    labelPermissions.className = "messageLabel";
    labelPermissions.innerText =
      "The exact permissions requested are these (the browser dialog may simplify them in the UI):";
    messageDivPermissions.appendChild(labelPermissions);

    let permissionsList = document.createElement("ul");
    permissionsList.className = "permissions-list";
    for (let permission of permissions.origins) {
      let permissionsListItem = document.createElement("li");
      permissionsListItem.textContent = permission;
      permissionsList.appendChild(permissionsListItem);
    }
    messageDivPermissions.appendChild(permissionsList);

    fragment.appendChild(messageDivPermissions);
  }

  if (userClickedExtensionPopup && isFirefox()) {
    let messageDiv2a = document.createElement("div");
    messageDiv2a.className = "flex-parent jc-center";

    let label2 = document.createElement("label");
    label2.className = "messageLabel";
    label2.innerText =
      "On Firefox just clicking the extension popup icon will have granted" +
      " temporary permissions for this tab. Click the button below to grant non-temporary permission.";
    messageDiv2a.appendChild(label2);

    fragment.appendChild(messageDiv2a);
  }

  let messageDiv3 = document.createElement("div");
  messageDiv3.className = "flex-parent jc-center";

  let label3 = document.createElement("label");
  label3.className = "messageLabel";

  let label3Message = "Press the button below to request the permission.";
  if (needsPopupDisplayed) {
    label3Message += " This may close the popup so you may have to click on the Sourcer [1] icon again.";
  }
  label3.innerText = label3Message;
  messageDiv3.appendChild(label3);

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
      // needed on Firefox or the popup covers the system dialog asking for confirmation
      menu.style = "display:none";

      logDebug("request button pressed");

      try {
        let requestResult = await chrome.permissions.request(permissions);
        menu.style = savedMenuStyle;
        if (!requestResult) {
          displayMessageWithIcon("warning", "Permission request failed");
          resolve(false);
        } else if (chrome.runtime.lastError) {
          displayMessageWithIcon("warning", "Permission request failed");
          resolve(false);
        } else {
          resolve(true);
        }
      } catch (error) {
        console.error("Exception caught during chrome.permissions.request.", error);
        //menu.style = savedMenuStyle;
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
  return await commonCheckPermissionForSites(siteMatches, options, requestPermissionsFromUser);
}

async function checkPermissionForSite(matchString, options) {
  return await commonCheckPermissionForSite(matchString, options, requestPermissionsFromUser);
}

async function checkPermissionForSiteFromUrl(url, options) {
  return await commonCheckPermissionForSiteFromUrl(url, options, requestPermissionsFromUser);
}

async function checkPermissionForSiteMatches(siteName, options) {
  return await commonCheckPermissionForSiteMatches(siteName, options, requestPermissionsFromUser);
}

export {
  checkPermissionForSite,
  checkPermissionForSites,
  checkPermissionForSiteFromUrl,
  checkPermissionForSiteMatches,
};
