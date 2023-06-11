/*
MIT License

Copyright (c) 2022 Robert M Pavey

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

function buildTroveUrl(ed, builder) {
  let url = ed.url;

  const options = builder.getOptions();
  if (!options.citation_trove_includeSearchQuery) {
    // remove any search stuff
    let queryIndex = url.indexOf("?");
    if (queryIndex != -1) {
      url = url.substring(0, queryIndex);
    }
  }

  return url;
}

function buildCoreCitation(ed, gd, builder) {
  builder.sourceTitle = "Trove, National Library of Australia";

  builder.databaseHasImages = true;

  var troveUrl = buildTroveUrl(ed, builder);

  let recordLink = "[" + troveUrl + " Trove Article]";
  builder.recordLinkOrTemplate = recordLink;

  // issue can contain extra white space including newlines
  const issue = ed.issue.replace(/\s+/g, " ");

  builder.sourceReference = ed.title + ", " + issue + ", " + ed.page + " : " + ed.article;
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
