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

function buildAmerancUrl(ed, builder) {
  if (ed.citationParts && ed.citationParts.length > 0) {
    let citationUrl = ed.citationParts[ed.citationParts.length - 1];
    if (citationUrl.startsWith("http")) {
      return citationUrl;
    }
  }
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle += ed.title;
}

function buildSourceReference(ed, gd, builder) {
  if (ed.recordData) {
    builder.addSourceReferenceField("Source", ed.recordData["Source"]);
  }

  let volumeName = ed.volumeName;
  if (!volumeName && ed.recordData) {
    volumeName = ed.recordData["Volume"];
  }
  if (!volumeName && ed.recordData) {
    volumeName = ed.recordData["Volume Name"];
  }
  builder.addSourceReferenceField("Volume", ed.volumeName);

  if (ed.recordData) {
    builder.addSourceReferenceField("Page", ed.recordData["Page"]);
    builder.addSourceReferenceField("Reference", ed.recordData["Reference"]);
    builder.addSourceReferenceField("Case Number", ed.recordData["Case Number"]);
    builder.addSourceReferenceField("Note", ed.recordData["Note"]);
    builder.addSourceReferenceField("Original Text", ed.recordData["Original Text"]);
    builder.addSourceReferenceField("Town Info", ed.recordData["Town Info"]);
  }
}

function buildRecordLink(ed, gd, builder) {
  var amerancUrl = buildAmerancUrl(ed, builder);

  let recordLink = "[" + amerancUrl + " American Ancestors Record]";
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
