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

// see this WikiTree page:
// https://www.wikitree.com/wiki/Space:Norway_Project_-_Source_Citation_Format

import { simpleBuildCitationWrapper } from "../../../base/core/citation_builder.mjs";
import { NodaEdReader } from "./noda_ed_reader.mjs";

function buildNodaUrl(ed, builder) {
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  if (ed.sourceInformation) {
    builder.sourceTitle += ed.sourceInformation;
  }
}

function buildSourceReference(ed, gd, builder) {
  let edReader = new NodaEdReader(ed);
  edReader.addSourceReferenceToCitationBuilder(builder);
}

function buildRecordLink(ed, gd, builder) {
  let permanentId = ed.permanentId;
  let options = builder.getOptions();

  function buildLinkText(url, id, typeText) {
    let linkText = "";
    let linkFormat = options.citation_noda_linkFormat;

    if (linkFormat == "visible") {
      linkText = "Digitalarkivet " + typeText + ": " + url;
    } else if (linkFormat == "withPermanentId" && id) {
      linkText = "Digitalarkivet " + typeText + ": " + "[" + url + " " + id + "]";
    } else {
      linkText = "[" + url + " Digitalarkivet " + typeText + "]";
    }
    return linkText;
  }

  if (ed.pageType == "record") {
    var nodaUrl = buildNodaUrl(ed, builder);

    let recordLink = buildLinkText(nodaUrl, permanentId, "Record");
    builder.recordLinkOrTemplate = recordLink;

    let includeImageLink = options.citation_noda_includeImageLink;

    if (includeImageLink) {
      let imageLinkUrl = ed.imageLink;
      if (imageLinkUrl) {
        let imagePermanentId = imageLinkUrl.replace(/.*\/([a-z0-9]+)$/, "$1");
        if (!imagePermanentId || imagePermanentId == imageLinkUrl) {
          imagePermanentId = "";
        }
        let imageLink = buildLinkText(imageLinkUrl, imagePermanentId, "Image");
        builder.imageLink = imageLink;
      }
    }
  } else if (ed.pageType == "image") {
    var nodaUrl = buildNodaUrl(ed, builder);

    let imageLink = buildLinkText(nodaUrl, permanentId, "Image");
    // add as record link so an accessed date is added
    builder.recordLinkOrTemplate = imageLink;
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
