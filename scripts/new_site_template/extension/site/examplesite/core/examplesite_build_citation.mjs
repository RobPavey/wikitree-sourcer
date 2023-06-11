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

function buildExamplesiteUrl(ed, builder) {
  // could provide option to use a search style URL but don't see any reason to so far
  return ed.citationUrl;
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle += "Put Source Title here";
}

function buildSourceReference(ed, gd, builder) {
  builder.sourceReference = "Put Source Reference here";
}

function buildRecordLink(ed, gd, builder) {
  var examplesiteUrl = buildExamplesiteUrl(ed, builder);

  let recordLink = "[" + examplesiteUrl + " ExampleSite Record]";
  builder.recordLinkOrTemplate = recordLink;
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  builder.addStandardDataString(gd);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
