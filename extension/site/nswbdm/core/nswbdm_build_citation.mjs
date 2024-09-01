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
import { NswbdmEdReader } from "./nswbdm_ed_reader.mjs";

function buildNswbdmUrl(ed, gd, builder) {
  var nswbdmUrl = "https://familyhistory.bdm.nsw.gov.au/lifelink/familyhistory/search/";
  if (gd.recordType == RT.BirthRegistration) {
    nswbdmUrl += "births";
  } else if (gd.recordType == RT.DeathRegistration) {
    nswbdmUrl += "deaths";
  } else if (gd.recordType == RT.MarriageRegistration) {
    nswbdmUrl += "marriages";
  }
  return nswbdmUrl;
}

function buildSourceTitle(ed, gd, builder) {
  let format = builder.options.citation_nswbdm_sourceTitleFormat;

  switch (format) {
    case "nswbdm":
      builder.sourceTitle = "New South Wales Births, Deaths and Marriages";
      break;
    case "nswgrbdm":
      builder.sourceTitle = "NSW Government. Registry of Births, Deaths and Marriages";
      break;
  }
}

function buildSourceReference(ed, gd, builder, edReader) {
  let options = builder.getOptions();

  if (ed.recordData) {
    let registrationNumberParts = ed.registrationNumberParts;
    if (registrationNumberParts && registrationNumberParts.length >= 2) {
      let type = "";
      if (gd.recordType == RT.BirthRegistration) {
        type = "Birth";
      } else if (gd.recordType == RT.DeathRegistration) {
        type = "Death";
      } else if (gd.recordType == RT.MarriageRegistration) {
        type = "Marriage";
      }
      let registrationString = registrationNumberParts[0] + "/" + registrationNumberParts[1];
      if (registrationNumberParts.length >= 3) {
        registrationString += " " + registrationNumberParts[2];
      }
      if (registrationNumberParts.length >= 4) {
        registrationString += " " + registrationNumberParts[3];
      }
      builder.addSourceReferenceField(type + " Registration Number", registrationString);
    }

    let dataStyleOption = options.citation_nswbdm_dataStyle;

    if (dataStyleOption == "sentence") {
      // the sentence will not display the district
      let district = edReader.getCitationDistrictPlusPossibleDeathPlace();
      if (district) {
        builder.addSourceReferenceField("District", district);
      }
    }
  }
}

function buildRecordLink(ed, gd, builder) {
  var nswbdmUrl = buildNswbdmUrl(ed, gd, builder);

  let options = builder.getOptions();
  let linkOption = options.citation_nswbdm_includeLink;

  if (linkOption == "none") {
    return;
  }

  let recordLink = "";

  if (linkOption == "inSourceTitle") {
    builder.putRecordLinkInTitle = true;
    recordLink = nswbdmUrl;
  } else if (linkOption == "asNswBdm") {
    recordLink = "[" + nswbdmUrl + " NSW BDM]";
  } else if (linkOption == "asTypeSearchPage") {
    let type = "";
    if (gd.recordType == RT.BirthRegistration) {
      type = "Births";
    } else if (gd.recordType == RT.DeathRegistration) {
      type = "Deaths";
    } else if (gd.recordType == RT.MarriageRegistration) {
      type = "Marriages";
    }

    if (type) {
      recordLink = "[" + nswbdmUrl + " " + type + " search page]";
    }
  }

  if (recordLink) {
    builder.recordLinkOrTemplate = recordLink;
  }
}

function buildCuratedListDataString(ed, gd, builder) {
  let edReader = new NswbdmEdReader(ed);

  const fields = [
    { key: "", value: edReader.getCitationName() },
    { key: "Father's Given Name(s)", value: edReader.getCitationFatherGivenNames() },
    { key: "Mother's Given Name(s)", value: edReader.getCitationMotherGivenNames() },
    { key: "Age at Death", value: edReader.getCitationAgeAtDeath() },
    { key: "District", value: edReader.getCitationDistrictPlusPossibleDeathPlace() },
  ];

  builder.addListDataString(fields);
}

function buildOriginalListDataString(ed, gd, builder) {
  const fieldsToExclude = ["Event", "Registration number"];

  let nameString = "";
  if (ed.lastName) {
    nameString += ed.lastName;
  }
  if (ed.firstName) {
    if (nameString) {
      nameString += " ";
    }
    nameString += ed.firstName;
  }
  if (nameString) {
    builder.dataString = builder.addSingleValueToDataListString(nameString);
  }

  builder.addListDataStringFromRecordData(ed.recordData, fieldsToExclude);
}

function buildDataString(ed, gd, builder) {
  let options = builder.getOptions();
  let dataStyleOption = options.citation_nswbdm_dataStyle;

  if (dataStyleOption == "listCurated") {
    buildCuratedListDataString(ed, gd, builder);
  } else if (dataStyleOption == "sentence") {
    builder.addStandardDataString(gd);
  } else if (dataStyleOption == "listOriginal") {
    buildOriginalListDataString(ed, gd, builder);
  }
}

function buildCoreCitation(ed, gd, builder) {
  let edReader = new NswbdmEdReader(ed);

  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder, edReader);
  buildRecordLink(ed, gd, builder);
  buildDataString(ed, gd, builder);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
