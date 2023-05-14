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
import { RT } from "../../../base/core/record_type.mjs";

function buildIrishgUrl(data, builder) {
  // Example URL:
  // "https://churchrecords.irishgenealogy.ie/churchrecords/details/59a05e0443275
  // ?b=https%3A%2F%2Fchurchrecords.irishgenealogy.ie%2Fchurchrecords%2Fsearch.jsp%3Fnamefm%3DJohn%26namel%3DO%2527Connor%26location%3D%26yyfrom%3D%26yyto%3D%26submit%3DSearch"
  let url = data.url;

  let queryIndex = url.indexOf("?");
  if (queryIndex != -1) {
    url = url.substring(0, queryIndex);
  }
  return url;
}

function buildSourceTitle(data, gd) {
  let sourceTitle = "";
  if (
    gd.recordType == RT.BirthRegistration ||
    gd.recordType == RT.MarriageRegistration ||
    gd.recordType == RT.DeathRegistration
  ) {
    sourceTitle = "Civil Records of Births, Marriages and Deaths; General Register Office of Ireland";
  } else {
    sourceTitle = "Church Records";
  }

  return sourceTitle;
}

function buildSourceReference(data, gd) {
  let sourceReference = "";

  function addField(label, value) {
    if (value && value != "N/R") {
      if (sourceReference) {
        sourceReference += ", ";
      }
      sourceReference += label + ": " + value;
    }
  }

  function addFieldFromRecordData(label) {
    addField(label, data.recordData[label]);
  }

  function addFieldFromRefData(label) {
    addField(label, data.refData[label]);
  }

  if (
    gd.recordType == RT.BirthRegistration ||
    gd.recordType == RT.MarriageRegistration ||
    gd.recordType == RT.DeathRegistration
  ) {
    addFieldFromRecordData("Group Registration ID");
    addFieldFromRecordData("SR District/Reg Area");
  } else {
    addFieldFromRefData("Book Number");
    addFieldFromRefData("Page");
    addFieldFromRefData("Entry Number");
    addFieldFromRefData("Record_Identifier");
    addFieldFromRefData("Image Filename");
  }

  return sourceReference;
}

function buildCoreCitation(data, gd, builder) {
  let options = builder.getOptions();
  builder.sourceTitle = buildSourceTitle(data, gd);
  builder.sourceReference = buildSourceReference(data, gd);

  var irishgUrl = buildIrishgUrl(data, builder);

  let recordLink = "[" + irishgUrl + " IrishGenealogy.ie Record]";
  builder.recordLinkOrTemplate = recordLink;

  let input = {
    generalizedData: gd,
    options: options,
  };
  let dataString = DataString.buildDataString(input);
  if (!dataString.endsWith(".")) {
    dataString += ".";
  }
  builder.dataString = dataString;
}

function buildCitation(input) {
  const data = input.extractedData;
  const gd = input.generalizedData;
  const runDate = input.runDate;
  const options = input.options;
  const type = input.type; // "inline", "narrative" or "source"

  let builder = new CitationBuilder(type, runDate, options);

  var citation = buildCoreCitation(data, gd, builder);

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
