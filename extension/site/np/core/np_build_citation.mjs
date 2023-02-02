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

import { CitationBuilder } from "../../../base/core/citation_builder.mjs";

function buildCoreCitation(data, gd, runDate, builder) {
  builder.sourceTitle = "Newspapers.com";
  let options = builder.getOptions();

  builder.databaseHasImages = true;

  const clipString = "/clip/";
  let clipIndex = data.url.indexOf(clipString);
  if (clipIndex != -1) {
    let remainder = data.url.substring(clipIndex + clipString.length);
    let recordLink = "{{Newspapers.com|" + remainder.split("/")[0] + "}}";
    builder.recordLinkOrTemplate = recordLink;
  }

  builder.sourceReference = data.newspaperTitle;

  if (options.citation_np_includeLocation) {
    builder.sourceReference += " (" + data.location + ")";
  }

  builder.sourceReference += " " + data.publicationDate + ", page " + data.pageNumber;
}

function buildCitation(input) {
  const data = input.extractedData;
  const gd = input.generalizedData;
  const runDate = input.runDate;
  const options = input.options;
  const type = input.type; // "inline", "narrative" or "source"

  let builder = new CitationBuilder(type, runDate, options);

  buildCoreCitation(data, gd, runDate, builder);

  builder.meaningfulTitle = gd.getRefTitle();

  if (type == "narrative") {
    builder.addNarrative(gd, input.dataCache, options);
  }

  // now the builder is setup use it to build the citation text
  let fullCitation = builder.getCitationString();

  //console.log(fullCitation);

  var citationObject = {
    citation: fullCitation,
    type: type,
  };

  return citationObject;
}

export { buildCitation };
