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

const getText = (data, xpathQuery) => {
  if (typeof XPathResult !== "undefined") {
    // Browser environment
    const node = data.evaluate(xpathQuery, data, nsResolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    return node ? node.textContent.trim() : null;
  } else {
    // Node.js environment with jsdom - use alternative approach
    try {
      // For jsdom, we need to use the window's XPathResult if available
      const win = data.defaultView || data.ownerDocument?.defaultView;
      if (win && win.XPathResult) {
        const node = data.evaluate(
          xpathQuery,
          data,
          nsResolver,
          win.XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        return node ? node.textContent.trim() : null;
      } else {
        // Fallback: use querySelector with simplified selectors for common cases
        return getTextFallback(data, xpathQuery);
      }
    } catch (e) {
      console.error("XPath error:", e);
      return null;
    }
  }
};

const getAllTexts = (data, xpathQuery) => {
  if (typeof XPathResult !== "undefined") {
    // Browser environment
    const results = data.evaluate(xpathQuery, data, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    let values = [];
    for (let i = 0; i < results.snapshotLength; i++) {
      values.push(results.snapshotItem(i).textContent.trim());
    }
    return values;
  } else {
    // Node.js environment with jsdom
    try {
      const win = data.defaultView || data.ownerDocument?.defaultView;
      if (win && win.XPathResult) {
        const results = data.evaluate(xpathQuery, data, nsResolver, win.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        let values = [];
        for (let i = 0; i < results.snapshotLength; i++) {
          values.push(results.snapshotItem(i).textContent.trim());
        }
        return values;
      } else {
        // Fallback: use querySelectorAll with simplified selectors
        return getAllTextsFallback(data, xpathQuery);
      }
    } catch (e) {
      console.error("XPath error:", e);
      return [];
    }
  }
};

// Fallback functions for Node.js environment without XPath support
const getTextFallback = (data, xpathQuery) => {
  // Simple fallback for common XPath patterns used in this code
  if (xpathQuery.includes("mods:title")) {
    const elements = data.querySelectorAll("title");
    return elements.length > 0 ? elements[0].textContent.trim() : null;
  }
  if (xpathQuery.includes("mods:shelfLocator")) {
    const elements = data.querySelectorAll("shelfLocator");
    return elements.length > 0 ? elements[0].textContent.trim() : null;
  }
  return null;
};

const getAllTextsFallback = (data, xpathQuery) => {
  // Simple fallback for common XPath patterns
  if (xpathQuery.includes("mods:shelfLocator")) {
    const elements = data.querySelectorAll("shelfLocator");
    return Array.from(elements).map((el) => el.textContent.trim());
  }
  if (xpathQuery.includes("dv:reference")) {
    const elements = data.querySelectorAll("reference");
    return Array.from(elements).map((el) => el.textContent.trim());
  }
  return [];
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

async function parseArchiveNrwApiMetadata(extractData, base_url) {
  const api_url = "https://nina-suf.archive.nrw.de/sufservice/api/listContextByNodeId?nodeId=" + base_url.split("=")[1];

  let request = null;
  try {
    request = await fetch(api_url, {
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
  } catch {
    console.error("Could not fetch extended metadata (api endpoint url was " + api_url + ")");
    return;
  }

  // Special case: For some resources, we cannot access the entry at archive.nrw behind it, so we cannot get the title (at all)
  const text = await request.text();
  if (text == "") {
    extractData.title = "Unknown";
    return;
  }

  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("Could not parse json data");
    console.error(text);
    console.error(api_url);
    console.error(extractData.metadata_url);
    return;
  }
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

  if (extractData.metadata != null) {
    const base_url = getAllTexts(extractData.metadata, "//dv:links/dv:reference")[0];

    if (base_url.match("www.archive.nrw.de/archivsuche")) {
      await parseArchiveNrwApiMetadata(extractData, base_url);
    }
  }
}

export async function parseMetadata(extractData) {
  if (extractData.metadata == null) {
    return;
  }

  // Create DOMParser if not available (for Node.js environment)
  let domParser = typeof DOMParser !== "undefined" ? new DOMParser() : (await import("jsdom")).JSDOM.fragment;

  let xmlDoc;
  if (typeof DOMParser !== "undefined") {
    xmlDoc = domParser.parseFromString(extractData.metadata, "text/xml");
  } else {
    // For testing environment, use jsdom
    const { JSDOM } = await import("jsdom");
    const dom = new JSDOM(extractData.metadata, { contentType: "application/xml" });
    xmlDoc = dom.window.document;
  }

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
    console.error("No support for site " + extractData.metadata_url + " yet");
  }
}
