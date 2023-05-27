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
import { DataString } from "../../../base/core/data_string.mjs";

function buildNliUrl(data, builder) {
  return data.url;
}

function buildSourceTitle(data, gd) {
  let sourceTitle = "";
  sourceTitle += "Catholic Parish Registers";

  return sourceTitle;
}

function buildSourceReference(data, gd, options) {
  // The National Archives of the UK (TNA); Kew, Surrey, England;
  // Census Returns of England and Wales, 1911;
  // Registration District Number: 10; ED, institution, or vessel: 03; Piece: 802<br/>

  let sourceReference = "National Library of Ireland";
  if (data.dioceseParish && data.county) {
    sourceReference += ", " + data.dioceseParish + ", " + data.county;
  }

  return sourceReference;
}

function buildCoreCitation(data, gd, builder) {
  let options = builder.getOptions();
  builder.sourceTitle = buildSourceTitle(data, gd);
  builder.sourceReference = buildSourceReference(data, gd, options);

  var nliUrl = buildNliUrl(data, builder);

  let recordLink = "[" + nliUrl + " National Library of Ireland Register]";
  builder.recordLinkOrTemplate = recordLink;

  if (data.pageInfo) {
    builder.dataString = data.pageInfo;
  }
}

function buildCitation(input) {
  const data = input.extractedData;
  const gd = input.generalizedData;
  const runDate = input.runDate;
  const options = input.options;
  const type = input.type; // "inline", "narrative" or "source"

  let builder = new CitationBuilder(type, runDate, options);

  buildCoreCitation(data, gd, builder);

  // Get meaningful title
  builder.meaningfulTitle = gd.getRefTitle();

  if (type == "narrative") {
    builder.addNarrative(gd, input.dataCache, options);
  }

  // now the builder is setup, use it to build the citation text
  let fullCitation = builder.getCitationString();

  //console.log(fullCitation);

  var citationObject = {
    citation: fullCitation,
    type: type,
  };

  return citationObject;
}

export { buildCitation };
