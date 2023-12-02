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

import { setupSimplePopupMenu } from "/base/browser/popup/popup_simple_base.mjs";
import { initPopup } from "/base/browser/popup/popup_init.mjs";
import { generalizeData } from "../core/gbooks_generalize_data.mjs";
import { buildCitation } from "../core/gbooks_build_citation.mjs";
import { checkPermissionForSite } from "/base/browser/popup/popup_permissions.mjs";

async function setupGbooksPopupMenu(extractedData, tabId) {
  // if the pageviewer is active then attempt to get the page from that
  if (extractedData.url && extractedData.url.includes("gbpv=1")) {
    // request permission for if needed
    const checkPermissionsOptions = {
      reason: "To get the page number the extension needs to load a content script into the books iframe.",
      needsPopupDisplayed: true,
      allowSkip: true,
    };
    // the books link will be to google.com when the current url is google.co.uk
    // so don't use the page URL to check.
    // NOTE: On Firefox the page has to be reloaded after permission is granted.
    let allowed = await checkPermissionForSite("*://books.google.com/*", checkPermissionsOptions);

    if (allowed) {
      // send an additional message to attempt to get the pageLink from an iframe
      chrome.tabs.sendMessage(tabId, { type: "getPageViewerInfo" }, function (response) {
        console.log("response from getPageViewerInfo is:");
        console.log(response);
        if (chrome.runtime.lastError) {
          console.log("getPageViewerInfo failed");
          console.log(chrome.runtime.lastError);
        } else {
          if (response && response.success) {
            extractedData.shareLink = response.shareLink;
            extractedData.pageLink = response.pageLink;
            extractedData.pageLabel = response.pageLabel;
            extractedData.pageNumber = response.pageNumber;
            extractedData.urlPageNumber = response.urlPageNumber;
            extractedData.isShareLinkVisible = response.isShareLinkVisible;
          }
        }
      });
    }
  }

  let input = {
    extractedData: extractedData,
    extractFailedMessage: "It looks like a Google Books page but not an actual book page.",
    generalizeFailedMessage: "It looks like a Google Books page but does not contain the required data.",
    generalizeDataFunction: generalizeData,
    buildCitationFunction: buildCitation,
    siteNameToExcludeFromSearch: "gbooks",
  };
  setupSimplePopupMenu(input);
}

initPopup("gbooks", setupGbooksPopupMenu);
