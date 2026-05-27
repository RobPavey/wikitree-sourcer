/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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

function buildGensauRecordUrl(ed, builder) {
  // The URLS tend to be really long e.g.:
  // https://www.genealogysa.org.au/index.php
  // ?option=com_hikashop&view=product&layout=show
  // &Itemid=223&uid=531039&coid=birth&cid=5
  // &request_data=%7B%26quot%3Boption%26quot%3B%3A%26quot%3Bcom_gsa%26quot%3B%2C%26quot%3Bview%26quot%3B%3A%26quot%3Bgsa%26quot%3B%2C%26quot%3Blayout%26quot%3B%3A%26quot%3Bessearch%26quot%3B%2C%26quot%3BItemid%26quot%3B%3A%26quot%3B193%26quot%3B%2C%26quot%3Bcollection_id%26quot%3B%3A%26quot%3Bbirth%26quot%3B%2C%26quot%3Bpage_no%26quot%3B%3A%26quot%3B1%26quot%3B%2C%26quot%3Bsort_by%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3Bsort_direction%26quot%3B%3A%26quot%3Basc%26quot%3B%2C%26quot%3BSurname%26quot%3B%3A%26quot%3BOReilly%26quot%3B%2C%26quot%3BGivenName%26quot%3B%3A%26quot%3BJohn%26quot%3B%2C%26quot%3Byear_from%26quot%3B%3A%26quot%3B1898%26quot%3B%2C%26quot%3Baccuracy%26quot%3B%3A%26quot%3B50%26quot%3B%2C%26quot%3BGender%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3BFather%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3BDistrict%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3BBook_Page%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3B95626bcc2d5a516407fc742f25713c8c%26quot%3B%3A%26quot%3B37a43995e1ee5db334fb81752793208d%26quot%3B%2C%26quot%3B_ga%26quot%3B%3A%26quot%3BGA1.3.1675802975.1778714438%26quot%3B%2C%26quot%3B_gid%26quot%3B%3A%26quot%3BGA1.3.1485660444.1778714438%26quot%3B%2C%26quot%3B_gat_UA-145232469-1%26quot%3B%3A%26quot%3B1%26quot%3B%2C%26quot%3B_ga_QXKDZTP4JE%26quot%3B%3A%26quot%3BGS2.3.s1778714438%24o1%24g1%24t1778715513%24j36%24l0%24h0%26quot%3B%7D
  // so we remove the unnecessary search parameters

  const searchParamWhiteList = ["option", "view", "layout", "Itemid", "uid", "coid", "cid"];

  let urlObj = new URL(ed.url);

  const allowedParams = Array.from(urlObj.searchParams.entries()).filter(([key]) => searchParamWhiteList.includes(key));

  urlObj.search = new URLSearchParams(allowedParams).toString();

  return urlObj.toString();
}

function buildGensauHomeUrl(ed, builder) {
  return "https://www.genealogysa.org.au";
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle += "South Australia - " + ed.databaseName;
}

function buildSourceReference(ed, gd, builder) {
  builder.addSourceReferenceText("Genealogy SA");
  let rd = ed.recordData;
  if (rd) {
    builder.addSourceReferenceFieldFromRd(rd, "Surname");

    if (rd["Book/Page"]) {
      builder.addSourceReferenceFieldFromRd(rd, "Book/Page");
    } else {
      builder.addSourceReferenceFieldFromRd(rd, "Given Names");
      builder.addSourceReferenceField("Year", gd.inferEventYear());
    }

    builder.addSourceReferenceFieldFromRd(rd, "Notice");
    builder.addSourceReferenceFieldFromRd(rd, "Source");
    builder.addSourceReferenceFieldFromRd(rd, "Source2");
    builder.addSourceReferenceFieldFromRd(rd, "Publication Date");
    builder.addSourceReferenceFieldFromRd(rd, "Registration Number");
    builder.addSourceReferenceFieldFromRd(rd, "Admission/Registration No");
    builder.addSourceReferenceFieldFromRd(rd, "Rec Type");
    builder.addSourceReferenceFieldFromRd(rd, "SNcode");
    builder.addSourceReferenceFieldFromRd(rd, "Notice");
    builder.addSourceReferenceFieldFromRd(rd, "Notes");
  }
}

function buildRecordLink(ed, gd, builder) {
  let options = builder.getOptions();
  let linkType = options.citation_gensau_linkType;

  if (linkType == "toRecord") {
    let gensauUrl = buildGensauRecordUrl(ed, builder);
    let recordLink = "[" + gensauUrl + " Genealogy SA Record]";
    builder.recordLinkOrTemplate = recordLink;
  } else {
    let gensauUrl = buildGensauHomeUrl(ed, builder);
    let homeLink = "[" + gensauUrl + " Genealogy SA]";
    builder.recordLinkOrTemplate = homeLink;
  }
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  builder.addStandardDataString(gd);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
