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
import { checkPermissionForSite } from "/base/browser/popup/popup_permissions.mjs";
import { closePopup } from "/base/browser/popup/popup_menu_building.mjs";

async function fetch_metadata(url, extractData) {
  const url_parsed = new URLSearchParams(url);
  const metadata_url = url_parsed.get("tx_dlf[id]");

  extractData.metadata_url = metadata_url;

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
}

const nsResolver = (prefix) => {
  const ns = {
    mets: "http://www.loc.gov/METS/",
    mods: "http://www.loc.gov/mods/v3",
    ns2: "http://www.loc.gov/METS/",
    ns4: "http://www.loc.gov/mods/v3",
    dv: "http://dfg-viewer.de/",
  };
  return ns[prefix] || null;
};

const getText = (data, xpath) => {
  const node = data.evaluate(xpath, data, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  return node ? node.textContent.trim() : null;
};

const getAllTexts = (data, xpath) => {
  const results = data.evaluate(xpath, data, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  let values = [];
  for (let i = 0; i < results.snapshotLength; i++) {
    values.push(results.snapshotItem(i).textContent.trim());
  }
  return values;
};

function parseErzbistumMunichMetadata(extractData) {
  extractData.title = getText(extractData.metadata, "//mods:mods/mods:titleInfo/mods:title");
  extractData.signature = getText(extractData.metadata, "//mods:relatedItem[@type='host']/mods:titleInfo/mods:title");
}

function parseStaatsarchivBayernMetadata(extractData) {
  extractData.title = getText(extractData.metadata, "//mods:mods/mods:titleInfo/mods:title");
  extractData.signature = getText(extractData.metadata, "//mods:mods/mods:location/mods:shelfLocator");
}

function parseArcinsysMetadata(extractData) {
  extractData.title = getText(extractData.metadata, "//ns4:mods/ns4:titleInfo/ns4:title");
  let signature_components = getAllTexts(extractData.metadata, "//ns4:mods/ns4:location/ns4:shelfLocator");
  extractData.signature = signature_components.join(", ");
}

async function parseArchiveNrwMetadata(extractData) {
  const owner = getText(extractData.metadata, "//dv:rights/dv:owner");
  const signature = getText(extractData.metadata, "//mods:mods/mods:titleInfo/mods:title");

  if (owner && signature) {
    extractData.signature = owner + ", " + signature;
  } else if (owner) {
    extractData.signature = owner;
  } else if (signature) {
    extractData.signature = signature;
  }

  const base_url = getAllTexts(extractData.metadata, "//dv:links/dv:reference")[0];

  if (base_url.match("www.archive.nrw.de/archivsuche")) {
    const api_url =
      "https://nina-suf.archive.nrw.de/sufservice/api/listContextByNodeId?nodeId=" + base_url.split("=")[1];
    const request = await fetch(api_url, {
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
      referrer: extractData.url,
      referrerPolicy: "strict-origin-when-cross-origin",
      method: "GET",
      mode: "cors",
      credentials: "include",
    });

    const data = await request.json();
    if (!data) return;
    const node_data = data["selectedNode"];
    if (!node_data) return;

    const title = node_data["title"];
    const date = node_data["unitDate"];

    if (date && title) {
      extractData.title = title + " (" + date + ")";
    } else if (title) {
      extractData.title = title;
    } else if (data) {
      extractData.title = "Unknown (" + date + ")";
    }
  }
}

let domParser = new DOMParser();

async function parseMetadata(extractData) {
  let xmlDoc = domParser.parseFromString(extractData.metadata, "text/xml");
  extractData.metadata = xmlDoc;

  if (extractData.metadata_url.match("digitales-archiv.erzbistum-muenchen.de")) {
    parseErzbistumMunichMetadata(extractData);
  } else if (extractData.metadata_url.match("www.gda.bayern.de")) {
    parseStaatsarchivBayernMetadata(extractData);
  } else if (extractData.metadata_url.match("www.arcinsys.niedersachsen.de")) {
    parseArcinsysMetadata(extractData);
  } else if (extractData.metadata_url.match("arcinsys.hessen.de")) {
    parseArcinsysMetadata(extractData);
  } else if (extractData.metadata_url.match("www.landesarchiv-nrw.de")) {
    await parseArchiveNrwMetadata(extractData);
  } else {
    alert("No support for side " + extractData.metadata_url + " yet");
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
