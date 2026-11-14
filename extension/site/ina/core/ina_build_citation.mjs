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
import { getIssueDateString } from "./ina_ed_reader.mjs";

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle = "Irish Newspaper Archives";
}

// e.g. Munster Express, 2 October 1925, page 6, "License transfers and confirmations"
function buildSourceReference(ed, gd, builder) {
  const options = builder.getOptions();

  let reference = ed.newspaperTitle;
  let dateString = getIssueDateString(ed);
  if (dateString) {
    reference += ", " + dateString;
  }
  if (ed.page) {
    reference += ", page " + ed.page;
  }
  if (ed.pageType == "clipping" && ed.clippingTitle && options.citation_ina_includeClippingTitle) {
    reference += ', "' + ed.clippingTitle + '"';
  }
  builder.sourceReference = reference;
}

function getSubReqText(builder) {
  let subReq = builder.getSubReqString(builder.getOptions().citation_ina_subscriptionRequired);
  return subReq ? " (" + subReq + ")" : "";
}

// A clipping can be public, so on a clipping page the clipping is linked by default. Newspaper pages
// need a subscription to view.
function buildRecordLink(ed, gd, builder) {
  const options = builder.getOptions();

  let useClipping = ed.pageType == "clipping" && ed.clippingUrl;
  if (useClipping && options.citation_ina_clippingLink == "page" && ed.pageUrl) {
    useClipping = false;
  }

  if (useClipping) {
    // a private clipping can only be viewed by its owner, who needs a subscription
    let clippingSubReq = ed.clippingIsPublic === false ? getSubReqText(builder) : "";
    builder.recordLinkOrTemplate = "[" + ed.clippingUrl + " Irish Newspaper Archives clipping]" + clippingSubReq;
    if (options.citation_ina_clippingLink == "both" && ed.pageUrl) {
      builder.externalSiteLink = "[" + ed.pageUrl + " Irish Newspaper Archives page]" + getSubReqText(builder);
    }
    return;
  }

  let url = ed.pageUrl ? ed.pageUrl : ed.url;
  builder.recordLinkOrTemplate = "[" + url + " Irish Newspaper Archives page]" + getSubReqText(builder);
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);

  if (ed.pageType == "clipping" && ed.clippingNote && builder.getOptions().citation_ina_includeClippingNote) {
    builder.dataString = "Clipping note: " + ed.clippingNote;
  }

  builder.databaseHasImages = true;
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
