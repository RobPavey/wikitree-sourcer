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

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle = "Monumental inscription";
}

function buildSourceReference(ed, gd, builder) {
  let c = ed.cemetery || {};
  let ref = [c.name, c.city, c.county, c.state].filter((p) => p).join(", ");
  if (ref) {
    builder.addSourceReferenceText(ref);
  }
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  builder.addStandardDataString(gd);
}

function buildCitation(input) {
  let citationObject = simpleBuildCitationWrapper(input, buildCoreCitation);

  // The Headstone Photo Tool builds the full "*Monumental inscription. ..." source line (cemetery Space page, GPS,
  // photographer) from its own settings. That line is the source for this person, so use it as it is, wrapped the
  // way Sourcer wraps the type that was asked for: a line in the Sources section (the normal home for this
  // citation), or a reference in the biography, after the burial sentence for the narrative type.
  // (For other targets such as plain text, Sourcer's own wording is kept: wiki links make no sense there.)
  const text = input.extractedData.citation;
  if (text && input.options.citation_general_target == "wikitree") {
    if (citationObject.type == "source") {
      citationObject.citation = text;
    } else {
      const body = text.replace(/^\*\s*/, "");
      const refStart = citationObject.citation.indexOf("<ref>");
      const before = refStart > 0 ? citationObject.citation.substring(0, refStart) : ""; // the narrative sentence, if any
      citationObject.citation = before + "<ref>" + body + "</ref>";
    }
  }
  return citationObject;
}

export { buildCitation };
