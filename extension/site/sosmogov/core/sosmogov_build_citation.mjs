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

function cleanText(inputText) {
  let text = inputText;
  if (text) {
    text = text.replace(/\s+/g, " ");
    text = text.replace(/(\r\n|\n|\r)/gm, "");
    text = text.trim();
  }
  return text;
}

function cleanEdRecordDataNameFields(edRecordData) {
  // remove extraneous whitespace from ed/rd name fields
  let edRecordDataCleaned = edRecordData;
  if (edRecordData["Spouse"]) {
    edRecordDataCleaned["Spouse"] = cleanText(edRecordData["Spouse"]);
  }
  if (edRecordData["Father"]) {
    edRecordDataCleaned["Father"] = cleanText(edRecordData["Father"]);
  }
  if (edRecordData["Mother"]) {
    edRecordDataCleaned["Mother"] = cleanText(edRecordData["Mother"]);
  }
  return edRecordDataCleaned;
}

function buildSosmogovUrl(ed, builder) {
  return ed.recordData["Image"];
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle = "Missouri State Archives"; // default
  if (ed.url.includes("DeathCertificates")) {
    builder.sourceTitle = ed.collectionName;
  }
}

function buildSourceReference(ed, gd, builder) {
  builder.sourceReference = "Missouri State Archives";
  builder.addSourceReferenceField("Deceased", cleanText(ed.recordData["Deceased"]));
  builder.addSourceReferenceField("Date of Death", gd.deathDate.dateString);
  builder.addSourceReferenceField("County", ed.recordData["County"]);
}

function buildRecordLink(ed, gd, builder) {
  var sosmogovUrl = buildSosmogovUrl(ed, builder);
  let recordLink = "[" + sosmogovUrl + " MO Death Certificate Image]";
  builder.recordLinkOrTemplate = recordLink;
}

function buildDataString(ed, gd, builder) {
  const fieldsToExclude = ["Deceased", "Date of Death", "County", "Image"];
  builder.addListDataStringFromRecordData(cleanEdRecordDataNameFields(ed.recordData), fieldsToExclude);
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  buildDataString(ed, gd, builder);
}

function getRefTitle(ed, gd) {
  // this is also referred to as label
  if (gd.recordType) {
    const refTitle = gd.recordType;
    return refTitle;
  } else {
    return undefined;
  }
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation, getRefTitle);
}

export { buildCitation };
