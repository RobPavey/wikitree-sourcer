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
import { RT } from "../../../base/core/record_type.mjs";
import { simpleBuildCitationWrapper } from "../../../base/core/citation_builder.mjs";
import { NzashEdReader } from "./nzash_ed_reader.mjs";

function buildSourceTitle(ed, gd, builder) {
  let format = builder.options.citation_nzash_sourceTitleFormat;

  switch (format) {
    case "nzasho":
      builder.sourceTitle = "New Zealand Births, Deaths & Marriages Online";
      break;
    case "nzashdo":
      builder.sourceTitle = "New Zealand Births, Deaths and Marriages - Online";
      break;
    case "bdmonzdia":
      builder.sourceTitle = "Births, Deaths & Marriages Online, New Zealand Department of Internal Affairs";
      break;
  }
}

function buildSourceReference(ed, gd, builder) {
  if (ed.recordData) {
    let registrationNumber = ed.recordData["Registration Number"];
    if (registrationNumber) {
      let type = "";
      if (gd.recordType == RT.BirthRegistration) {
        type = "Birth ";
      } else if (gd.recordType == RT.DeathRegistration) {
        type = "Death ";
      } else if (gd.recordType == RT.MarriageRegistration) {
        type = "Marriage ";
      }
      builder.sourceReference = type + "Registration Number: " + registrationNumber;
    }
  }
}

function buildRecordLink(ed, gd, builder) {
  let options = builder.getOptions();
  let linkFormatOption = options.citation_nzash_linkFormat;

  var nzashUrl = "";
  if (linkFormatOption == "top") {
    nzashUrl = "https://www.bdmhistoricalrecords.dia.govt.nz/";
  } else if (linkFormatOption == "search") {
    nzashUrl = "https://www.bdmhistoricalrecords.dia.govt.nz/search";
  } else if (linkFormatOption == "searchOfType") {
    nzashUrl = "https://www.bdmhistoricalrecords.dia.govt.nz/search/search";
    let type = "";
    if (gd.recordType == RT.BirthRegistration) {
      nzashUrl += "?path=%2FqueryEntry.m%3Ftype%3Dbirths";
    } else if (gd.recordType == RT.DeathRegistration) {
      nzashUrl += "?path=%2FqueryEntry.m%3Ftype%3Ddeaths";
    } else if (gd.recordType == RT.MarriageRegistration) {
      nzashUrl += "?path=%2FqueryEntry.m%3Ftype%3Dmarriages";
    }
  }
  if (!nzashUrl) {
    return;
  }

  let linkOption = options.citation_nzash_includeLink;

  if (linkOption == "none") {
    return;
  }

  let recordLink = "";

  if (linkOption == "inSourceTitle") {
    builder.putRecordLinkInTitle = true;
    recordLink = nzashUrl;
  } else if (linkOption == "asNzashOnline") {
    recordLink = "[" + nzashUrl + " New Zealand BDM Online]";
  } else if (linkOption == "asLinkToSearchPage") {
    recordLink = "[" + nzashUrl + " Link to search page]";
  }

  if (recordLink) {
    builder.recordLinkOrTemplate = recordLink;
  }
}

function buildCuratedListDataString(ed, gd, builder) {
  let edReader = new NzashEdReader(ed);

  let isStillBirth = ed.recordData["Still Birth"];

  const fields = [
    { key: "", value: edReader.getCitationName() },
    { key: "Mother's Given Name(s)", value: edReader.getCitationMotherGivenNames() },
    { key: "Father's Given Name(s)", value: edReader.getCitationFatherGivenNames() },
    { key: "", value: isStillBirth ? "Still Birth" : "" },
    { key: "Age at Death", value: edReader.getCitationAgeAtDeath() },
    { key: "Date of Birth", value: edReader.getCitationDateOfBirth() },
  ];

  builder.addListDataString(fields);
}

function buildOriginalListDataString(ed, gd, builder) {
  const fieldsToExclude = ["Registration Number"];
  builder.addListDataStringFromRecordData(ed.recordData, fieldsToExclude);
}

function buildDataString(ed, gd, builder) {
  let options = builder.getOptions();
  let dataStyleOption = options.citation_nzash_dataStyle;

  if (dataStyleOption == "listCurated") {
    buildCuratedListDataString(ed, gd, builder);
  } else if (dataStyleOption == "sentence") {
    builder.addStandardDataString(gd);
  } else if (dataStyleOption == "listOriginal") {
    buildOriginalListDataString(ed, gd, builder);
  }
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  buildDataString(ed, gd, builder);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
