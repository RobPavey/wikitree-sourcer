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
import { RT } from "../../../base/core/record_type.mjs";

const sourceReferenceFields = ["Registration details"];

function buildQldbdmUrl(ed, builder) {
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle = "Queensland Registrations";
  if (gd.recordType == RT.BirthRegistration) {
    builder.sourceTitle = "Queensland Birth Registration Index";
  } else if (gd.recordType == RT.DeathRegistration) {
    builder.sourceTitle = "Queensland Death Registration Index";
  } else if (gd.recordType == RT.MarriageRegistration) {
    builder.sourceTitle = "Queensland Marriage Registration Index";
  }
}

function buildSourceReference(ed, gd, builder) {
  builder.sourceReference = "Queensland Government, Births, Deaths, Marriages";
  builder.addSourceReferenceFieldsFromRecordData(ed.recordData, sourceReferenceFields);
}

function buildRecordLink(ed, gd, builder) {
  var qldbdmUrl = buildQldbdmUrl(ed, builder);

  let recordLink = "[" + qldbdmUrl + " Queensland BDM Record]";
  builder.recordLinkOrTemplate = recordLink;
}

function buildDataList(ed, gd, builder) {
  builder.addListDataStringFromRecordData(ed.recordData, sourceReferenceFields);
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  buildDataList(ed, gd, builder);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
