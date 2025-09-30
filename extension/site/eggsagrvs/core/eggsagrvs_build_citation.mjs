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

function buildEggsagrvsUrl(ed, builder) {
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle += ed.topHeading;
}

function decodeHtml(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function buildSourceReference(ed, gd, builder) {
  // If the source reference is to be at the end of the citation, we prepend "eGGGSA Graves:" to it
  // with or without a link to the search page depending on user options
  // and append the people string to it.
  const imgPos = builder.options.citation_eggsagrvs_includeImgPos ? (ed.imagePos ? " " + ed.imagePos : "") : "";
  if (builder.options.citation_general_referencePosition == "atEnd") {
    let heading = "eGGSA Graves";
    if (builder.options.citation_eggsagrvs_includeLink == "inRef") {
      const url = buildEggsagrvsUrl(ed, builder);
      heading = `[${url} ${heading}]`;
    }

    if (decodeHtml(ed.breadcrumb).endsWith(ed.peopleStr)) {
      builder.sourceReference = `${heading}: ${ed.breadcrumb}`;
    } else {
      builder.sourceReference = `${heading}: ${ed.breadcrumb} / ${ed.peopleStr}`;
    }
  } else if (
    builder.options.citation_eggsagrvs_includeLink == "inSourceTitle" &&
    !decodeHtml(ed.breadcrumb).endsWith(ed.peopleStr)
  ) {
    builder.sourceReference = `${ed.breadcrumb} / ${ed.peopleStr}`;
  } else {
    // Just use the breadcrumbs
    builder.sourceReference = ed.breadcrumb;
  }
  builder.sourceReference += imgPos;
}

function buildRecordLink(ed, gd, builder) {
  const eggsagrvsUrl = buildEggsagrvsUrl(ed, builder);
  const linkOption = builder.options.citation_eggsagrvs_includeLink;
  let recordLink;
  if (linkOption == "inSourceTitle") {
    builder.putRecordLinkInTitle = true;
    recordLink = eggsagrvsUrl;
  } else if (builder.options.citation_general_referencePosition == "atEnd") {
    // source reference is at the end of the citation
    switch (linkOption) {
      case "inRef":
        return; // link will be part of the source reference
      case "inImageTitle":
      default:
        recordLink = "[" + eggsagrvsUrl + " " + ed.peopleStr + "]";
    }
  } else {
    // source reference is not at the end of the citation and the link should not be in the source title
    recordLink = "[" + eggsagrvsUrl + " " + ed.peopleStr + "]";
  }

  builder.recordLinkOrTemplate = recordLink;
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
