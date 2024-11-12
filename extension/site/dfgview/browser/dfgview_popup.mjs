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
  addBuildCitationMenuItems,
  addMenuDivider,
  beginMainMenu,
  doAsyncActionWithCatch,
  openExceptionPage,
  closePopup,
} from "/base/browser/popup/popup_menu_building.mjs";
import { addStandardMenuEnd, buildMinimalMenuWithMessage } from "/base/browser/popup/popup_menu_blocks.mjs";
import { clearCitation, saveCitation } from "/base/browser/popup/popup_citation.mjs";
import { options } from "/base/browser/options/options_loader.mjs";
import { checkPermissionForSite } from "/base/browser/popup/popup_permissions.mjs";

import { initPopup } from "/base/browser/popup/popup_init.mjs";
import { generalizeData } from "../core/dfgview_generalize_data.mjs";
import { buildCitation } from "../core/dfgview_build_citation.mjs";

async function dfgViewGetExtendedMetadata(exttractedData, metadataUrl) {
  const checkPermissionsOptions = {
    reason: "To get advanced metadata a content script needs to be loaded on the dfg-viewer.de page.",
  };
  let allowed = await checkPermissionForSite("*://dfg-viewer.de/*", checkPermissionsOptions);
  if (!allowed) {
    return;
  }

  alert(metadataUrl);

  let data = await fetch(metadataUrl, {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=0, i",
      "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1"
    },
    "referrerPolicy": "strict-origin-when-cross-origin",
    "method": "GET",
    "mode": "cors",
    "credentials": "omit"
  });
  alert(await data.text());
}

async function dfgViewPopupBuildCitation(data) {
  clearCitation();

  doAsyncActionWithCatch("Building Citation", data, async function () {
    if (data.extractedData.metadataUrl) {
      await dfgViewGetExtendedMetadata(data.extractedData, data.extractedData.metadataUrl);
    }

    const input = {
      extractedData: data.extractedData,
      generalizedData: data.generalizedData,
      runDate: new Date(),
      type: data.type,
      options: options,
    };
    const citationObject = buildCitation(input);
    citationObject.generalizedData = data.generalizedData;

    saveCitation(citationObject);
  });
}

async function setupDfgviewPopupMenu(extractedData) {
  let backFunction = function () {
    setupDfgviewPopupMenu(extractedData);
  };

  if (!extractedData || !extractedData.success) {
    let message = "WikiTree Sourcer doesn't know how to extract data from this page.";
    message += "\n\nIt looks like an DFG Viewer page but not a record page.";
    let data = { extractedData: extractedData };
    buildMinimalMenuWithMessage(message, data, backFunction);
    return;
  }

  let generalizedData = undefined;

  try {
    generalizedData = generalizeData({
      extractedData: extractedData,
    });
  } catch (err) {
    openExceptionPage("Error during creating popup menu for content.", "generalizeData failed", err, true);
  }

  let data = { extractedData: extractedData, generalizedData: generalizedData };

  if (!generalizedData || !generalizedData.hasValidData) {
    let message = "WikiTree Sourcer could not interpret the data on this page.";
    message += "\n\nIt looks like an DFG Viewer page but does not contain the required data.";
    buildMinimalMenuWithMessage(message, data, backFunction);
    return;
  }

  let menu = beginMainMenu();

  addBuildCitationMenuItems(menu, data, dfgViewPopupBuildCitation, backFunction);

  addStandardMenuEnd(menu, data, backFunction);
}

initPopup("dfgview", setupDfgviewPopupMenu);
