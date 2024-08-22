/*
MIT License

Copyright (c) 2024 Robert M Pavey

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
import { VicbdmEdReader } from "./vicbdm_ed_reader.mjs";

function buildVicbdmUrl(ed, builder) {
  return "https://www.bdm.vic.gov.au/research-and-family-history/search-your-family-history";
}

function buildSourceTitle(ed, gd, builder) {
  let format = builder.options.citation_vicbdm_sourceTitleFormat;

  switch (format) {
    case "vrbdm":
      builder.sourceTitle = "Victoria Registry of Births, Deaths & Marriages";
      break;
    case "vsgrbdmv":
      builder.sourceTitle = "Victoria State Government, Registry of Births, Deaths and Marriages Victoria";
      break;
    case "vsgrbdm":
      builder.sourceTitle = "Victoria State Government, Registry of Births, Deaths and Marriages";
      break;
    case "bdmv":
      builder.sourceTitle = "Births, Deaths & Marriages Victoria";
      break;
    case "vbdm":
      builder.sourceTitle = "Victoria Births, Deaths & Marriages";
      break;
  }
}

function buildSourceReference(ed, gd, builder) {
  let recordType = gd.recordType;
  let typeText = "";
  if (recordType == RT.Birth || recordType == RT.BirthRegistration) {
    typeText = "Births";
  } else if (recordType == RT.Death || recordType == RT.DeathRegistration) {
    typeText = "Deaths";
  } else if (recordType == RT.Marriage || recordType == RT.MarriageRegistration) {
    typeText = "Marriages";
  }
  if (typeText) {
    builder.addSourceReferenceText("Victoria " + typeText + " Index");
  }

  if (ed.recordData) {
    let registrationNumber = ed.recordData["Registration number"];
    if (registrationNumber) {
      builder.addSourceReferenceField("Registration number", registrationNumber);
    }
  }
}

function buildRecordLink(ed, gd, builder) {
  let options = builder.getOptions();
  let linkOption = options.citation_vicbdm_includeLink;

  if (linkOption == "none") {
    return;
  }

  let vicbdmUrl = buildVicbdmUrl(ed, builder);

  let recordLink = "";

  if (linkOption == "inSourceTitle") {
    builder.putRecordLinkInTitle = true;
    recordLink = vicbdmUrl;
  } else if (linkOption == "asBDMVictoria") {
    recordLink = "[" + vicbdmUrl + " BDM Victoria]";
  } else if (linkOption == "asLinkToSearchPage") {
    recordLink = "[" + vicbdmUrl + " Link to search page]";
  }

  if (recordLink) {
    builder.recordLinkOrTemplate = recordLink;
  }
}

function buildDataString(ed, gd, builder) {
  let edReader = new VicbdmEdReader(ed);

  let dataString = "";

  let name = edReader.getCitationName();
  dataString = builder.addSingleValueToDataListString(dataString, name);

  function addKeyValuePair(key, func) {
    let value = edReader[func]();
    dataString = builder.addKeyValuePairToDataListString(dataString, key, value);
  }

  addKeyValuePair("Spouse", "getCitationSpouse");
  addKeyValuePair("Age", "getCitationAge");
  addKeyValuePair("Year", "getCitationYear");
  addKeyValuePair("Place", "getCitationPlace");
  addKeyValuePair("Father", "getCitationFather");
  addKeyValuePair("Mother", "getCitationMother");
  addKeyValuePair("Mother's LNAB", "getCitationMotherLnab");
  addKeyValuePair("Place of birth", "getCitationPlaceOfBirth");

  if (dataString) {
    if (!dataString.endsWith(".")) {
      dataString += ".";
    }
    builder.dataString = dataString;
  }
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);

  //builder.addStandardDataString(gd);
  buildDataString(ed, gd, builder);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
