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
import { generalizeData } from "../core/dfgviewer_generalize_data.mjs";
import { buildCitation } from "../core/dfgviewer_build_citation.mjs";
import { parseMetadata } from "../core/dfgviewer_metadata_parser.mjs";

async function fetch_metadata(url, extractData) {
  url = url.toString();
  const url_parsed = new URL(url);
  var metadata_url = url_parsed.searchParams.get("tx_dlf[id]");

  if (metadata_url == null) {
    metadata_url = url_parsed.searchParams.get("set[mets]");
  }

  if (metadata_url == null) {
    // Cannot fetch metadata
    return;
  }

  extractData.metadata_url = metadata_url;

  try {
    let request = await fetch(metadata_url, {
      headers: {
        accept: "*/*",
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
      method: "GET",
      mode: "cors",
      credentials: "include",
    });
    if (request.ok) {
      extractData.metadata = await request.text();
    }
  } catch {
    alert("Could not fetch metadata, metadata endpoint was " + metadata_url);
  }
}

async function setupDfgviewerPopupMenu(extractedData) {
  await fetch_metadata(extractedData.url, extractedData);
  await parseMetadata(extractedData);

  let input = {
    extractedData: extractedData,
    extractFailedMessage: "It looks like a DFG Viewer page but not a record page.",
    generalizeFailedMessage: "It looks like a DFG Viewer page but does not contain the required data.",
    generalizeDataFunction: generalizeData,
    buildCitationFunction: buildCitation,
    siteNameToExcludeFromSearch: "dfgviewer",
  };

  setupSimplePopupMenu(input);
}

initPopup("dfgviewer", setupDfgviewerPopupMenu);
