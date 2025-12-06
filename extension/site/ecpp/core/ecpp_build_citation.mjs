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
import { RT } from "../../../base/core/record_type.mjs";

function buildEcppUrl(ed, builder) {
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle += "The Early California Population Project. Edition 1.1";
}

function buildSourceReference(ed, gd, builder) {
  builder.sourceReference =
    "General Editor, Steven W. Hackel, Lead Compiler, Anne M. Reid. (The University of California, Riverside, and the Henry E. Huntington Library, San Marino, California, 2022.)";
}

function buildRecordLink(ed, gd, builder) {
  var ecppUrl = buildEcppUrl(ed, builder);

  let linkText = "ECPP Record";
  if (gd.recordType == RT.Baptism) {
    linkText = "ECPP Baptism Record";
  } else if (gd.recordType == RT.Marriage) {
    linkText = "ECPP Marriage Record";
  } else if (gd.recordType == RT.Burial) {
    linkText = "ECPP Burial Record";
  }

  let recordLink = "[" + ecppUrl + " " + linkText + "]";
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
