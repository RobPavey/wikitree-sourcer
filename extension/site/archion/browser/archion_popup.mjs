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
import { generalizeData } from "../core/archion_generalize_data.mjs";
import { buildCitation } from "../core/archion_build_citation.mjs";

async function extractPageDataFromDocument(uid, url, page_index) {
  let req = await fetch(
    "https://www.archion.de/de/ajax?tx_sparchiondocuments_spdocumentviewer[action]=getViewerDocumentPages&uid=" +
      uid +
      "&type=churchRegister",
    {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9",
        "sec-ch-ua": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      referrer: url,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    }
  );
  if (!req.ok) {
    alert("failed to request page data");
    return -1;
  }

  let fetch_result = await req.text();

  try {
    const pages = JSON.parse(fetch_result);
    const page = pages[page_index];

    return page.id;
  }
  catch {
    alert("error during parsing response");
    console.log(fetch_result);
    return -1;
  }
}

async function extractPermalinkBaseUrl(url) {
  let text = await (
    await fetch(url, {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "sec-ch-ua": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
      },
      referrer: url,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    })
  ).text();

  const start = text.indexOf("permalinkDoBaseurl");
  const end = text.indexOf("feedbackBaseurl");
  const section = text.substring(start, end);
  const baseUrl = section.split("'")[1];
  return baseUrl;
}

async function archionPopupBuildCitation(data) {
  clearCitation();

  //console.log("archionPopupBuildCitation");

  doAsyncActionWithCatch("Building Citation", data, async function () {
    if (data.extractedData.permalink && data.extractedData.permalink == "<<NOT YET GENERATED>>") {
      data.extractedData.permalink = await generatePermaLink(data.extractedData);
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
    //console.log("archionPopupBuildCitation, citationObject is:");
    //console.log(citationObject);

    //console.log("archionPopupBuildCitation, citationObject is:");
    //console.log(citationObject);

    saveCitation(citationObject);
  });
}

async function generatePermaLink(ed) {
  console.log("generatePermaLink");

  if (ed.pageData && ed.pageData.page != undefined) {
    const checkPermissionsOptions = {
      reason: "To generate a permalink a content script needs to be loaded on the archion.de page.",
    };
    let allowed = await checkPermissionForSite("*://www.archion.de/*", checkPermissionsOptions);
    if (!allowed) {
      console.log("Permalink generation not allowed!");
      closePopup();
      return;
    }

    ed.pageData.pageId = await extractPageDataFromDocument(ed.uid, ed.url, ed.pageData.page);
    ed.permalinkBase = await extractPermalinkBaseUrl(ed.url);

    if (ed.pageData.pageId == -1 || ed.permalinkBase == null) {
      alert("xy");
      return ed.url;
    }

    let response = await fetch(ed.permalinkBase, {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-ch-ua": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
      referrer: ed.url,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: "uid=" + ed.uid + "&type=churchRegister&pageId=" + ed.pageData.pageId,
      method: "POST",
      mode: "cors",
      credentials: "include",
    });
    if (!response.ok) {
      alert("Bad permalink response");
      return ed.url;
    }

    let text = await response.text();

    // Check for erros from the server, e.g. user has no active pass and cannot generate permalinks
    if (text.indexOf("alert alert-warning") != -1) {
      return ed.url;
    }

    const start = text.indexOf("<p><a href=");
    const end = text.indexOf(">", start + 8);
    ed.permalink = text.substring(start, end).split('"')[1];
  }
  return ed.permalink;
}

async function setupArchionPopupMenu(extractedData) {
  let backFunction = function () {
    setupArchionPopupMenu(extractedData);
  };

  //console.log("setupArchionPopupMenu, extractedData is:");
  //console.log(extractedData);

  if (!extractedData || !extractedData.success) {
    let message = "WikiTree Sourcer doesn't know how to extract data from this page.";
    message += "\n\nIt looks like an Archion page but not a record page.";
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

  //console.log("setupArchionPopupMenu, generalizedData is:");
  //console.log(generalizedData);

  let data = { extractedData: extractedData, generalizedData: generalizedData };

  if (!generalizedData || !generalizedData.hasValidData) {
    let message = "WikiTree Sourcer could not interpret the data on this page.";
    message += "\n\nIt looks like an Archion page but does not contain the required data.";
    buildMinimalMenuWithMessage(message, data, backFunction);
    return;
  }

  let menu = beginMainMenu();

  addBuildCitationMenuItems(menu, data, archionPopupBuildCitation, backFunction);

  addStandardMenuEnd(menu, data, backFunction);
}

initPopup("archion", setupArchionPopupMenu);
