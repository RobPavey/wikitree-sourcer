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

/*
Ideas on templates:

F1 = HARRY
F2 = Harry

S1 = PAVEY
S2 = Pavey

M1 = ALFRED GEORGE
M2 = Alfred George

Y1 = 1891

A1 = 1

N1 = LITTLEMORE
N2 = Littlemore

Q1 = J QUARTER
Q2 = June Quarter
Q3 = Apr-May-June
Q4 = Apr-Jun
Q5 = April-June

D1 = SAINT PANCRAS
D2 = Saint Pancras

L1 = https://www.gro.gov.uk/gro/content
L2 = https://www.gro.gov.uk/gro/content/certificates/indexes_search.asp?index=EW_Birth&year=1871&range=0&surname=Pavey&motherssurname=Littlemore&forename1=Harry&forename2=Alfred&gender=M&district=SAINT%20PANCRAS&volume=01B&page=142

U1 = https://www.ukbmd.org.uk/reg/districts/st%20pancras.html

A1 = 4 May 2021

V1 = 01B
P1 = 142

So a template could look like:
<ref>
'''Birth Registration''':
England & Wales General Register Office,<br/>
[$L2 GRO Online Indexes - Birth] (accessed $A1)<br/>
$S1, $F2 $M2 (Mother's maiden name: $N1).<br/>
''GRO Reference:'' $Y1 $Q3 in [$U1 $D1] Volume $V1 Page $P1.
</ref>

An alternate version could be:
'''Birth Registration''':
England & Wales General Register Office,<br/>
[$Link(full)$ GRO Online Indexes - Birth] (accessed $today(dmy)$<br/>
$Surname(ic)$, $forename1(ic)$ $OtherForenames(ic)$ (Mother's maiden name: $MMN(ic)$).<br/>
''GRO Reference:'' $Year$ $Quarter(mmm)$ in [$DistrictLink(bmd) $District(ic)] Volume $Volume$ Page $Page$.

*/

import { CitationBuilder } from "../../../base/core/citation_builder.mjs";
import { GroUriBuilder } from "./gro_uri_builder.mjs";
import { WTS_String } from "../../../base/core/wts_string.mjs";
import { getUkbmdDistrictPageUrl } from "./gro_to_ukbmd.mjs";

function buildGroSearchUrl(data) {
  var builder = new GroUriBuilder;

  if (data.eventType == "birth") {
    builder.addIndex("EW_Birth");
    builder.addYear(data.eventYear);
    builder.addYearRange("0");
    builder.addSurname(data.lastName);
    if (data.mothersMaidenName != undefined && data.mothersMaidenName != "" && data.mothersMaidenName != "-") {
      builder.addMothersSurname(data.mothersMaidenName);
    }
  }
  else {
    builder.addIndex("EW_Death");
    builder.addYear(data.eventYear);
    builder.addYearRange("0");
    builder.addSurname(data.lastName);
    if (data.recordType == "older") {
      builder.addAge(data.ageAtDeath);
      builder.addAgeRange("0");
    }
  }

  builder.addFirstForename(data.firstName);
  builder.addSecondForename(WTS_String.getFirstWord(data.middleNames));

  if (data.personGender == "male") {
    builder.addGenderMale();
  }
  else {
    builder.addGenderFemale();
  }

  if (data.recordType == "older") {
    builder.addQuarter(data.eventQuarterLetter);
  }
  else {
    const quarterToMonthValue = ["13", "14", "15", "16"];
    builder.addMonth(quarterToMonthValue[data.eventQuarter-1]);
  }
  builder.addDistrict(data.registrationDistrict);
  if (data.referenceVolume != undefined && data.referenceVolume != "") {
    builder.addVolume(data.referenceVolume);
    builder.addPage(data.referencePage);
  }
  else if (data.referenceRegister != undefined && data.referenceRegister != "") {
    builder.addRegister(data.referenceRegister);
  }

  const url = builder.getUri();

  return url;
}


function buildGroUrl(data, builder) {

  let options = builder.getOptions();

  if (options.citation_gro_linkStyle == "search") {
    return buildGroSearchUrl(data);
  }
  else if (options.citation_gro_linkStyle == "index") {
    if (data.eventType == "birth") {
      return "https://www.gro.gov.uk/gro/content/certificates/indexes_search.asp?index=EW_Birth";
    }
    else {
      return "https://www.gro.gov.uk/gro/content/certificates/indexes_search.asp?index=EW_Death";
    }
  }
  else {
    return "https://www.gro.gov.uk/gro/content";
  }
}

function getQuarterName(data) {
  const quarterNames = [ "Jan-Feb-Mar", "Apr-May-Jun", "Jul-Aug-Sep", "Oct-Nov-Dec"];
  if (data.eventQuarter != undefined && data.eventQuarter >= 1 && data.eventQuarter <= 4) {
    return quarterNames[data.eventQuarter-1];
  }
  else if (data.eventQuarterLetter != undefined) {
    return data.eventQuarterLetter + " Quarter";
  }

  return "";
}

function getCorrectlyCasedName(name, options) {
  if (options.citation_gro_changeNamesToInitialCaps) {
    name = WTS_String.toInitialCaps(name)
  }
  return name;
}

function getCorrectlyCasedNames(name, options, isName = false) {
  if (options.citation_gro_changeNamesToInitialCaps) {
    name = WTS_String.toInitialCapsEachWord(name, isName);
  }
  return name;
}

function getFirstName(data, options) {
  return getCorrectlyCasedName(data.firstName, options);
}

function getLastName(data, options) {
  return getCorrectlyCasedName(data.lastName, options);
}

function getMiddleNames(data, options) {
  return getCorrectlyCasedNames(data.middleNames, options, true);
}

function getMothersMaidenName(data, options) {
  return getCorrectlyCasedName(data.mothersMaidenName, options);
}

function getRegistrationDistrict(data, options) {
  return getCorrectlyCasedNames(data.registrationDistrict, options);
}

async function buildCoreCitation(data, runDate, builder) {

  let options = builder.options;

  builder.sourceTitle = "England & Wales General Register Office";

  var groUrl = buildGroUrl(data, builder);

  if (options.citation_gro_linkStyle == "url_content") {

    builder.sourceReference = "GRO Online Indexes - ";
    if (data.eventType == "birth") {
      builder.sourceReference += "Birth";
    }
    else {
      builder.sourceReference += "Death";
    }
    builder.recordLinkOrTemplate = groUrl;
  }
  else {
    let recordLink = "[" + groUrl + " GRO Online Indexes - ";

    if (data.eventType == "birth") {
      recordLink += "Birth";
    }
    else {
      recordLink += "Death";
    }
    recordLink += "]";
    builder.recordLinkOrTemplate = recordLink;
  }

  let dataString = getLastName(data, options) + ", " + getFirstName(data, options);
  if (data.middleNames != undefined && data.middleNames != "") {
    dataString += " " + getMiddleNames(data, options);
  }
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
  else {
    if (data.ageAtDeath) {
      dataString += " (Age at death: ";
      dataString += data.ageAtDeath + ")";
    }
    else if (data.birthYear) {
      dataString += " (Year of birth: ";
      dataString += data.birthYear + ")";
    }
  }
  dataString += ".";

  if (options.citation_general_addBreaksWithinBody) {
    dataString += "<br/>";
  }
  else {
    dataString += " ";
  }
  if (options.citation_general_addNewlinesWithinBody && builder.type != "source") {
    dataString += "\n";
  }

  if (options.citation_gro_referenceInItalics) {
    dataString += "''GRO Reference:'' ";
  }
  else {
    dataString += "GRO Reference: ";
  }

  dataString += data.eventYear + " " + getQuarterName(data) + " in ";

  let districtNameForOutput = getRegistrationDistrict(data, options);
  if (districtNameForOutput) {
    if (options.citation_gro_useDistrictUrl) {
      let url = getUkbmdDistrictPageUrl(data.registrationDistrict);
      if (url) {
        dataString += "[" + url + " " + districtNameForOutput + "]";
      }
      else {
        dataString += districtNameForOutput;
      }
    }
    else {
      dataString += districtNameForOutput;
    }
  }
  else {
    dataString += "unspecified district";
  }

  if (data.registrationDistrictCode != undefined && data.registrationDistrictCode != "") {
    dataString += " (" + data.registrationDistrictCode + ")";
  }

  if (data.referenceVolume != undefined && data.referenceVolume != "") {
    dataString += " Volume " + data.referenceVolume;
    if (data.referencePage != undefined && data.referencePage != "") {
      dataString += " Page " + data.referencePage;
    }
  }
  else if (data.referenceRegister != undefined && data.referenceRegister != "") {
    dataString += " Reg " + data.referenceRegister;
  }

  if (data.entryNumber != undefined && data.entryNumber != "") {
    dataString += " Entry Number " + data.entryNumber;
  }

  dataString += ".";

  builder.dataString = dataString;
}

function buildCitation(input) {

  const data = input.extractedData;
  const gd = input.generalizedData;
  const runDate = input.runDate;
  const options = input.options;
  const type = input.type;  // "inline", "narrative" or "source"

  //console.log("buildCitation (GRO): input is");
  //console.log(input);

  let builder = new CitationBuilder(type, runDate, options);

  //console.log("BuildCitation called");

  // This is what the England Project Orphan Trail Citation Templates look like (except they have no newlines):
  //
  // Birth
  //
  // England & Wales General Register Office, GRO Online Index - Birth
  // (https://www.gro.gov.uk/gro/content : accessed [insert date]),
  // database entry for POTTER, HELEN BEATRIX (Mother's maiden surname: LEECH).
  // GRO Reference: 1866 S Quarter in KENSINGTON Volume 01A Page 141.
  //
  // Death
  // 
  // England & Wales General Register Office, GRO Online Index - Death
  // (https://www.gro.gov.uk/gro/content : accessed [insert date]),
  // database entry for Vincent, Anna Muddle. (Age at death: 75).
  // GRO Reference: 1866 M Quarter in Islington, Volume 01B Page 157.

  var citation = buildCoreCitation(data, runDate, builder);

  // Get meaningful title
  var refTitle = (data.eventType == "birth") ? "Birth Registration" : "Death Registration";
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
