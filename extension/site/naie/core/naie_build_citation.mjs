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

function buildNaieUrl(ed, builder) {
  // could provide option to use a search style URL but don't see any reason to so far
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  let year = gd.inferEventYear();
  if (year) {
    builder.sourceTitle += year + " ";
  }
  builder.sourceTitle += "Census of Ireland";
}

function buildSourceReference(ed, gd, builder) {
  // The National Archives of the UK (TNA); Kew, Surrey, England;
  // Census Returns of England and Wales, 1911;
  // Registration District Number: 10; ED, institution, or vessel: 03; Piece: 802<br/>

  builder.addSourceReferenceText("The National Archives of Ireland");
  if (ed.heading) {
    let string = ed.heading.replace(/\s+/g, " ");
    builder.addSourceReferenceText(string);
  }
}

function buildCoreCitation(ed, gd, builder) {
  let options = builder.getOptions();
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);

  var naieUrl = buildNaieUrl(ed, builder);
  let recordLink = "[" + naieUrl + " National Archives of Ireland Record]";
  builder.recordLinkOrTemplate = recordLink;

  if (ed.imageLink) {
    let link = ed.imageLink;
    if (!link.startsWith("http")) {
      link = "http://www.census.nationalarchives.ie" + link;
    }
    builder.imageLink = "[" + link + " National Archives of Ireland Image]";
  }

  builder.addStandardDataString(gd);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
