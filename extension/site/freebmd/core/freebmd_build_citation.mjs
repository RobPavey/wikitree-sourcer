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
import { StringUtils } from "../../../base/core/string_utils.mjs";
//import { FBMD } from "./freebmd_utils.mjs";

function buildFreebmdUrl(ed, builder) {
  // could provide option to use a search style URL but don't see any reason to so far
  return ed.citationUrl;
}

function getQuarterName(ed) {
  const quarterNames = {
    Mar: "Jan-Feb-Mar",
    Jun: "Apr-May-Jun",
    Sep: "Jul-Aug-Sep",
    Dec: "Oct-Nov-Dec",
  };

  if (ed.eventQuarter != undefined && ed.eventQuarter != "") {
    let quarterName = quarterNames[ed.eventQuarter];
    if (!quarterName) {
      quarterName = ed.eventQuarter;
    }
    return quarterName;
  }

  return "";
}

function getCorrectlyCasedName(name, options) {
  if (options.citation_freebmd_changeNamesToInitialCaps) {
    // the option says "Change any person and place names in all caps to initial caps"
    if (StringUtils.isWordAllUpperCase(name)) {
      name = StringUtils.toInitialCaps(name);
    }
  }
  return name;
}

function getCorrectlyCasedNames(name, options) {
  if (options.citation_freebmd_changeNamesToInitialCaps) {
    // the option says "Change any person and place names in all caps to initial caps"
    if (StringUtils.isWordAllUpperCase(name)) {
      name = StringUtils.toInitialCapsEachWord(name, true);
    }
  }
  return name;
}

function getGivenNames(ed, options) {
  return getCorrectlyCasedNames(ed.givenNames, options);
}

function getLastName(ed, options) {
  return getCorrectlyCasedName(ed.surname, options);
}

function getMothersMaidenName(ed, options) {
  return getCorrectlyCasedName(ed.mothersMaidenName, options);
}

function getRegistrationDistrict(ed, options) {
  return getCorrectlyCasedNames(ed.registrationDistrict, options);
}

function buildCoreCitation(ed, gd, builder) {
  const titleText = {
    birth: "Birth",
    marriage: "Marriage",
    death: "Death",
  };

  let options = builder.getOptions();

  builder.sourceTitle = "England & Wales " + titleText[ed.eventType] + " Index";

  builder.sourceReference = ed.sourceCitation;

  var freebmdUrl = buildFreebmdUrl(ed, builder);

  let recordLink = "[" + freebmdUrl + " FreeBMD Entry Information]";
  builder.recordLinkOrTemplate = recordLink;

  let dataString = getLastName(ed, options) + ", " + getGivenNames(ed, options);
  if (ed.eventType == "birth") {
    if (ed.mothersMaidenName != undefined && ed.mothersMaidenName != "") {
      dataString += " (Mother's maiden name: ";
      var mmn = getMothersMaidenName(ed, options);
      if (mmn == undefined || mmn == "") {
        mmn = "-";
      }
      dataString += mmn + ")";
    }
  } else if (ed.eventType == "death") {
    if (ed.ageAtDeath) {
      dataString += " (Age at death: ";
      dataString += ed.ageAtDeath + ")";
    } else if (ed.birthDate) {
      dataString += " (Date of birth: ";
      dataString += ed.birthDate + ")";
    }
  }
  if (!dataString.endsWith(".")) {
    dataString += ".";
  }

  if (options.citation_general_addBreaksWithinBody) {
    dataString += "<br/>";
  } else {
    dataString += " ";
  }
  if (options.citation_general_addNewlinesWithinBody) {
    dataString += "\n";
  }

  if (options.citation_freebmd_referenceInItalics) {
    dataString += "''GRO Reference:'' ";
  } else {
    dataString += "GRO Reference: ";
  }

  dataString += ed.eventYear + " " + getQuarterName(ed) + " in ";

  // temp - disable district link
  if (false && options.citation_freebmd_useDistrictUrl) {
    dataString +=
      "[" + FBMD.getDistrictPageUrl(ed.registrationDistrict) + " " + getRegistrationDistrict(ed, options) + "]";
  } else {
    dataString += getRegistrationDistrict(ed, options);
  }

  if (ed.referenceVolume != undefined && ed.referenceVolume != "") {
    dataString += " Volume " + ed.referenceVolume + " Page " + ed.referencePage + ".";
  }

  builder.dataString = dataString;
}

function getRefTitle(ed, gd) {
  var refTitle = "";
  switch (ed.eventType) {
    case "birth":
      refTitle = "Birth Registration";
      break;
    case "marriage":
      refTitle = "Marriage Registration";
      break;
    case "death":
      refTitle = "Death Registration";
      break;
  }
  return refTitle;
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation, getRefTitle);
}

export { buildCitation };
