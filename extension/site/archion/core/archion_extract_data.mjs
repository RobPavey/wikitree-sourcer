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

function extractPageIdFromDocument(uid, document, url) {
  let result = {};

  let fetch_result = fetch(
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
  fetch_result
    .then((response) => response.text())
    .then((text) => {
      const pages = JSON.parse(text, null);
      const page_select = document.querySelector("select");
      const page_index = page_select.querySelector("option[selected]");
      const page = pages[page_index.value];
      result.pageId = page.id;
      // alert(JSON.stringify(page, null, 2));
    });

  return result.pageId;
}

function extractPermalinkForPage(uid, pageId, document, url) {
  const permalinkBaseUrl = extractPermalinkBaseUrl(url);

  let response = fetch(permalinkBaseUrl, {
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
    referrer: url,
    referrerPolicy: "strict-origin-when-cross-origin",
    body: "uid=" + uid + "&type=churchRegister&pageId=" + pageId,
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
  response
    .then((x) => x.text())
    .then((text) => {
      const start = text.indexOf("<p><a href=");
      const end = text.indexOf("</a></p>");
      const section = text.substring(start, end);
      alert(section.split(">")[2].split("<")[0]);
    });
}

async function extractPermalinkBaseUrl(url) {
  let request = fetch(url, {
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
  });
  return await request
    .then((page) => page.text())
    .then((text) => {
      const start = text.indexOf("permalinkDoBaseurl");
      const end = text.indexOf("feedbackBaseurl");
      const section = text.substring(start, end);
      const baseUrl = section.split("'")[1];
      return baseUrl;
    });
}

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  let pathComponents = [];

  const title = document.querySelector("div[class='dvbreadcrumb']");
  const fragments = title.querySelectorAll("span");

  for (let fragment of fragments) {
    const link = fragment.querySelector("a");
    if (link) {
      const text = link.text;
      if (text && text != "Alle Archive in ARCHION") {
        pathComponents.push(text);
      }
    }
  }

  const perma_link_button = document.querySelector("span[class='addlink']");
  if (perma_link_button && url && url.includes("churchRegister")) {
    // https://www.archion.de/de/viewer/churchRegister/290910?cHash=7425117a1f08bec109082a024138bc12
    const parts = url.split("/");
    const uid = parts[parts.length - 1].split("?")[0];

    result.pageId = extractPageIdFromDocument(uid, document, url);
    result.permalink = extractPermalinkForPage(uid, result.pageId, document, url);
  }

  result.pathComponents = pathComponents;

  result.success = true;

  return result;
}

export { extractData };
