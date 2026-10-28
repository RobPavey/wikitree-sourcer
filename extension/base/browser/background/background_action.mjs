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

import { logDebug } from "/base/core/log_debug.mjs";
import { doesUrlMatchChromePattern } from "./background_common.mjs";
import { isSafari } from "../common/browser_check.mjs";

function setPopup(tabId, popupPage) {
  //console.log("WikiTree Sourcer, background script (MV3), set popup on tab " + tab + " to: " + popupPage);
  chrome.action.setPopup({ tabId: tabId, popup: popupPage });
}

function setIcon(tabId, iconPath) {
  chrome.action.setIcon({ tabId: tabId, path: iconPath });
}

async function isTabDarkMode(tabId) {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  });

  return result.result;
}

async function applyCorrectAction(tabId, url) {
  //console.log(`applyCorrectAction: tabId: ${tabId}, url: ${url}`);

  const defaultPopupPath = "/base/browser/popup/popup.html";
  let popupPath = defaultPopupPath;

  let contentScripts = await chrome.scripting.getRegisteredContentScripts();

  let siteName = "";
  for (let contentScript of contentScripts) {
    for (let match of contentScript.matches) {
      if (doesUrlMatchChromePattern(match, url)) {
        siteName = contentScript.id;
        logDebug(`Match found: ${url}: ${siteName}`);
        popupPath = "/site/" + siteName + "/browser/" + siteName + "_popup.html";
        break;
      }
    }
  }

  //console.log(`applyCorrectAction: popupPath: ${popupPath}`);

  if (siteName) {
    // Only update if it is a recognized tab
    setPopup(tabId, popupPath);

    // Safari automatically makes icon blue when active so no need to update
    // icon in Safari
    if (!isSafari()) {
      let isDarkMode = await isTabDarkMode(tabId);

      if (isDarkMode) {
        setIcon(tabId, {
          16: "/images/wts_active_dark_16.png",
          32: "/images/wts_active_dark_32.png",
          48: "/images/wts_active_dark_48.png",
        });
      } else {
        setIcon(tabId, {
          16: "/images/wts_active_light_16.png",
          32: "/images/wts_active_light_32.png",
          48: "/images/wts_active_light_48.png",
        });
      }
    }
  }
}

export { applyCorrectAction };
