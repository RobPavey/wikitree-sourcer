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
import { WiewaswieEdReader } from "./wiewaswie_ed_reader.mjs";

function buildWiewaswieUrl(ed, edReader, builder) {
  return edReader.getRecordUrlToCite(builder.options);
}

function buildSourceTitle(ed, gd, edReader, builder) {
  builder.sourceTitle += edReader.getSourceTitle();
}

function buildSourceReference(ed, gd, edReader, builder) {
  builder.sourceReference += edReader.getSourceReference(builder.options);
}

function buildRecordLink(ed, gd, edReader, builder) {
  var wiewaswieUrl = buildWiewaswieUrl(ed, edReader, builder);

  let recordLink = "[" + wiewaswieUrl + " WieWasWie Record]";
  builder.recordLinkOrTemplate = recordLink;

  let externalLink = edReader.getExternalLink();
  if (externalLink && externalLink.link) {
    builder.externalSiteLink = "[" + externalLink.link + " " + externalLink.text + "]";
  }
}

function buildCoreCitation(ed, gd, builder) {
  let edReader = new WiewaswieEdReader(ed);

  buildSourceTitle(ed, gd, edReader, builder);
  buildSourceReference(ed, gd, edReader, builder);
  buildRecordLink(ed, gd, edReader, builder);
  builder.addStandardDataString(gd);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
