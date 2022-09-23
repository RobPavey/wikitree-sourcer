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
import { WTS_String } from "../../../base/core/wts_string.mjs";
//import { FBMD } from "./freebmd_utils.mjs";

function buildFreebmdUrl(data, builder) {

  // could provide option to use a search style URL but don't see any reason to so far
  return data.citationUrl;
}

function getQuarterName(data) {
  const quarterNames = {
    "Mar": "Jan-Feb-Mar",
    "Jun": "Apr-May-Jun",
    "Sep": "Jul-Aug-Sep",
    "Dec": "Oct-Nov-Dec"
  };

  if (data.eventQuarter != undefined && data.eventQuarter != "") {
    let quarterName = quarterNames[data.eventQuarter];
    if (!quarterName) {
      quarterName = data.eventQuarter;
    }
    return quarterName;
  }

  return "";
}

function getCorrectlyCasedName(name, options) {
  if (options.citation_freebmd_changeNamesToInitialCaps) {
    name = WTS_String.toInitialCaps(name)
  }
  return name;
}

function getCorrectlyCasedNames(name, options) {
  if (options.citation_freebmd_changeNamesToInitialCaps) {
    name = WTS_String.toInitialCapsEachWord(name, true);
  }
  return name;
}

function getGivenNames(data, options) {
  return getCorrectlyCasedNames(data.givenNames, options);
}

function getLastName(data, options) {
  return getCorrectlyCasedName(data.surname, options);
}

function getMothersMaidenName(data, options) {
  return getCorrectlyCasedName(data.mothersMaidenName, options);
}

function getRegistrationDistrict(data, options) {
  return getCorrectlyCasedNames(data.registrationDistrict, options);
}

function buildCoreCitation(data, runDate, builder) {

  const titleText = {
    birth: "Birth",
    marriage: "Marriage",
    death: "Death",
  }

  let options = builder.getOptions();

  builder.sourceTitle = "England & Wales " + titleText[data.eventType] + " Index";

  builder.sourceReference = data.sourceCitation;


  var freebmdUrl = buildFreebmdUrl(data, builder);

  let recordLink = "[" + freebmdUrl + " FreeBMD Entry Information]";
  builder.recordLinkOrTemplate = recordLink;

  let dataString = getLastName(data, options) + ", " + getGivenNames(data, options);
  if (data.eventType == "birth") {
    if (data.mothersMaidenName != undefined && data.mothersMaidenName != "") {
      dataString += " (Mother's maiden name: ";
      var mmn = getMothersMaidenName(data, options);
      if (mmn == undefined || mmn == "") {
        mmn = "-";
      }
      dataString += mmn + ")";
    }
  }
  else if (data.eventType == "death") {
    if (data.ageAtDeath) {
      dataString += " (Age at death: ";
      dataString += data.ageAtDeath + ")";
    }
    else if (data.birthDate) {
      dataString += " (Date of birth: ";
      dataString += data.birthDate + ")";
    }
  }
  if (!dataString.endsWith(".")) {
    dataString += ".";
  }

  if (options.citation_general_addBreaksWithinBody) {
    dataString += "<br/>";
  }
  else {
    dataString += " ";
  }
  if (options.citation_general_addNewlinesWithinBody) {
    dataString += "\n";
  }

  if (options.citation_freebmd_referenceInItalics) {
    dataString += "''GRO Reference:'' ";
  }
  else {
    dataString += "GRO Reference: ";
  }

  dataString += data.eventYear + " " + getQuarterName(data) + " in ";

  // temp - disable district link
  if (false && options.citation_freebmd_useDistrictUrl) {
    dataString += "[" + FBMD.getDistrictPageUrl(data.registrationDistrict) + " " + getRegistrationDistrict(data, options) + "]";
  }
  else {
    dataString += getRegistrationDistrict(data, options);
  }

  if (data.referenceVolume != undefined && data.referenceVolume != "") {
    dataString += " Volume " + data.referenceVolume + " Page " + data.referencePage + ".";
  }

  builder.dataString = dataString;
}

function buildCitation(input) {

  const data = input.extractedData;
  const gd = input.generalizedData;
  const runDate = input.runDate;
  const options = input.options;
  const type = input.type;  // "inline", "narrative" or "source"

  let builder = new CitationBuilder(type, runDate, options);

  var citation = buildCoreCitation(data, runDate, builder);

  // Get meaningful title
  var refTitle = "";
  switch (data.eventType) {
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
  builder.meaningfulTitle = refTitle;

  if (type == "narrative") {
    builder.addNarrative(gd, input.dataCache, options);
  }

  // now the builder is setup use it to build the citation text
  let fullCitation = builder.getCitationString();

  //console.log(fullCitation);

  var citationObject = {
    citation: fullCitation,
    type: type,
  }

  return citationObject;
}

export { buildCitation };
