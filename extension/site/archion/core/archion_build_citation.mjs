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

import { simpleBuildCitationWrapper } from "../../../base/core/citation_builder.mjs";

function generatePermalinkForPage(uid, pageId, permalinkBase, url) {
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

function buildArchionUrl(ed, builder) {
  // alert(ed.permalink);
  if (ed.permalink && ed.permalink != "<<NOT YET GENERATED>>") {
    return ed.permalink;
  }
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  let title = "";
  for (let part of ed.pathComponents) {
    title += ", " + part;
  }
  builder.sourceTitle += title.substring(2);
}

function buildSourceReference(ed, gd, builder) {
  builder.addSourceReferenceText(ed.book);
  if (ed.pageData) {
    builder.addSourceReferenceField("Page", ed.pageData.page);
  }
}

function buildRecordLink(ed, gd, builder) {
  var archionUrl = buildArchionUrl(ed, builder);

  let recordLink = "[" + archionUrl + " Archion Image]";
  builder.recordLinkOrTemplate = recordLink;
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  builder.addStandardDataString(gd);
}

function customLableFunction(ed, gd) {
  if (ed.bookType) {
    return ed.bookType;
  }
  return "Churchbook";
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation, customLableFunction);
}

export { buildCitation };
