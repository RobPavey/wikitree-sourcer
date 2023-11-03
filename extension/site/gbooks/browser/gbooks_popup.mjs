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
import { checkPermissionForSiteFromUrl } from "/base/browser/popup/popup_permissions.mjs";

async function setupGbooksPopupMenu(extractedData, tabId) {
  // request permission for Firefox if needed
  let reason = "To get the page number the extension needs to load a content script into the books iframe.";
  reason += "\nYou will need to reload the page after allowing the permission";
  if (!(await checkPermissionForSiteFromUrl(reason, extractedData.url, "", "books", true))) {
    return;
  }

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

  let input = {
    extractedData: extractedData,
    extractFailedMessage:
      "It looks like a Google Books page but not an Entry Information page.\n\nTo get to the Entry Information page click the red rectangle with 'Info' in it next to the search result that you wish to cite.",
    generalizeFailedMessage: "It looks like a Google Books page but does not contain the required data.",
    generalizeDataFunction: generalizeData,
    buildCitationFunction: buildCitation,
    siteNameToExcludeFromSearch: "gbooks",
  };
  setupSimplePopupMenu(input);
}

initPopup("gbooks", setupGbooksPopupMenu);
