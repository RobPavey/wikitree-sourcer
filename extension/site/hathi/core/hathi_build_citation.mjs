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

function buildHathiUrl(ed, builder) {
  // could provide option to use a search style URL but don't see any reason to so far
  if (ed.permalinkSeq) {
    return ed.permalinkSeq;
  }
  if (ed.permalink) {
    return ed.permalink;
  }
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  if (ed.name) {
    builder.sourceTitle += ed.name;
  } else if (ed.metaTitle) {
    builder.sourceTitle += ed.metaTitle;
  }
}

function buildSourceReference(ed, gd, builder) {
  function addTerm(title, value) {
    if (value.endsWith(".")) {
      value = value.substring(0, value.length - 1);
    }

    builder.addSourceReferenceField(title, value);
  }
  addTerm("Author", ed.creator);
  addTerm("Publisher", ed.publisher);
  addTerm("Page", ed.pageNumber);
}

function buildRecordLink(ed, gd, builder) {
  var hathiUrl = buildHathiUrl(ed, builder);

  let recordLink = "[" + hathiUrl + " Hathi Trust]";
  builder.recordLinkOrTemplate = recordLink;
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
