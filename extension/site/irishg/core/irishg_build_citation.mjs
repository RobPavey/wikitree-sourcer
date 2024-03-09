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
import { RT } from "../../../base/core/record_type.mjs";

function buildIrishgUrl(ed, builder) {
  // Example URL:
  // "https://churchrecords.irishgenealogy.ie/churchrecords/details/59a05e0443275
  // ?b=https%3A%2F%2Fchurchrecords.irishgenealogy.ie%2Fchurchrecords%2Fsearch.jsp%3Fnamefm%3DJohn%26namel%3DO%2527Connor%26location%3D%26yyfrom%3D%26yyto%3D%26submit%3DSearch"
  let url = ed.url;

  let queryIndex = url.indexOf("?");
  if (queryIndex != -1) {
    url = url.substring(0, queryIndex);
  }
  return url;
}

function buildSourceTitle(ed, gd, builder) {
  if (
    gd.recordType == RT.BirthRegistration ||
    gd.recordType == RT.MarriageRegistration ||
    gd.recordType == RT.DeathRegistration
  ) {
    builder.sourceTitle = "Civil Records of Irish Births, Deaths and Marriages";
  } else {
    builder.sourceTitle = "Irish Church Records";
    if (gd.eventPlace && gd.eventPlace.placeString) {
      builder.sourceTitle += "; " + gd.eventPlace.placeString;
    }
  }
}

function buildSourceReference(ed, gd, builder) {
  const excludeValues = ["N/R"];

  function addFieldFromRecordData(label) {
    if (ed.recordData) {
      builder.addSourceReferenceField(label, ed.recordData[label], excludeValues);
    }
  }

  function addFieldFromRefData(label) {
    if (ed.refData) {
      builder.addSourceReferenceField(label, ed.refData[label], excludeValues);
    }
  }

  if (
    gd.recordType == RT.BirthRegistration ||
    gd.recordType == RT.MarriageRegistration ||
    gd.recordType == RT.DeathRegistration
  ) {
    builder.addSourceReferenceText("General Register Office, Ireland");
    addFieldFromRecordData("Group Registration ID");
    addFieldFromRecordData("SR District/Reg Area");
  } else {
    addFieldFromRefData("Book Number");
    addFieldFromRefData("Page");
    addFieldFromRefData("Entry Number");
    addFieldFromRefData("Record_Identifier");
    addFieldFromRefData("Image Filename");
  }
}

function buildCoreCitation(ed, gd, builder) {
  let options = builder.getOptions();
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);

  var irishgUrl = buildIrishgUrl(ed, builder);

  let recordLink = "[" + irishgUrl + " IrishGenealogy.ie Record]";
  builder.recordLinkOrTemplate = recordLink;

  if (ed.imageHref) {
    let link = ed.imageHref;
    if (!link.startsWith("http")) {
      link = "https://civilrecords.irishgenealogy.ie" + link;
    }
    builder.imageLink = "[" + link + " IrishGenealogy.ie Image]";
  }

  if (options.citation_irishg_dataStringFormat == "dataString") {
    builder.addStandardDataString(gd);
  } else if (options.citation_irishg_dataStringFormat == "fromPage") {
    if (ed.eventText) {
      builder.dataString = ed.eventText;
    }
  }
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
