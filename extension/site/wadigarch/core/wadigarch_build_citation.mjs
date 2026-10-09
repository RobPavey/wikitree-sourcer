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
import { StringUtils } from "../../../base/core/string_utils.mjs";

const sourceReferenceFields = ["Reference Number", "Document Number", "Reference"];

// Some collections have field names that are run together or abbreviated
const labelMap = {
  Spouseabirthname: "Groom's Birth Name",
  Spousebbirthname: "Bride's Birth Name",
  Spouseasuffix: "Groom's Suffix",
  Spousebsuffix: "Bride's Suffix",
  Countyceremony: "County of Ceremony",
  Countyissuelicense: "County that Issued License",
  Certificateyear: "Certificate Year",
  Sequencenumber: "Sequence Number",
  Localfilenumber: "Local File Number",
  Spousealegallastname: "Spouse A Legal Last Name",
  Spouseafirstname: "Spouse A First Name",
  Spouseamiddlename: "Spouse A Middle Name",
  Spouseabirthlastname: "Spouse A Birth Last Name",
  Spouseblegallastname: "Spouse B Legal Last Name",
  Spousebfirstname: "Spouse B First Name",
  Spousebmiddlename: "Spouse B Middle Name",
  Spousebbirthlastname: "Spouse B Birth Last Name",
  Decreedate: "Decree Date",
  "Cnty-Of-Decree": "County of Decree",
  "Num-Of-Children": "Number of Children",
  Residencecounty: "Residence County",
  "Age-Primary": "Age",
};

// Returns a copy of the record data with readable labels and values that are not all in capitals
function tidyRecordData(recordData) {
  let result = {};
  for (let key of Object.keys(recordData)) {
    let value = recordData[key];
    if (/^[A-Z][A-Z '.-]+$/.test(value)) {
      value = StringUtils.toInitialCapsEachWord(value, true);
    }
    let newKey = labelMap[key] ? labelMap[key] : key;
    result[newKey] = value;
  }
  return result;
}

function buildWadigarchUrl(ed, builder) {
  if (ed.recordId) {
    return "https://digitalarchives.wa.gov/Record/View/" + ed.recordId;
  }
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  // The collection is the title of the original records, e.g. "Thurston County Auditor, Birth Returns, 1891-1907"
  if (ed.collection) {
    builder.sourceTitle = ed.collection;
  } else {
    builder.sourceTitle = "Washington State Digital Archives";
  }
}

function buildSourceReference(ed, gd, builder) {
  builder.sourceReference = "Washington State Archives, Digital Archives";
  builder.addSourceReferenceFieldsFromRecordData(ed.recordData, sourceReferenceFields);
}

function buildImageLink(ed, gd, builder, options) {
  if (ed.imageUrl) {
    builder.databaseHasImages = true;
    if (options.citation_wadigarch_includeImageLink) {
      builder.imageLink = "[" + ed.imageUrl + " Washington State Digital Archives Image (PDF)]";
    }
  } else if (ed.hasImage) {
    builder.databaseHasImages = true;
  }
}

function buildRecordLink(ed, gd, builder) {
  var wadigarchUrl = buildWadigarchUrl(ed, builder);

  let recordLink = "[" + wadigarchUrl + " Washington State Digital Archives Record]";
  builder.recordLinkOrTemplate = recordLink;
}

function buildDataList(ed, gd, builder) {
  builder.addListDataStringFromRecordData(tidyRecordData(ed.recordData), sourceReferenceFields);
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildImageLink(ed, gd, builder, builder.getOptions());
  buildRecordLink(ed, gd, builder);
  buildDataList(ed, gd, builder);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
