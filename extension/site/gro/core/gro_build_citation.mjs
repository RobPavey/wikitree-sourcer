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

import { simpleBuildCitationWrapper } from "../../../base/core/citation_builder.mjs";
import { GroUriBuilder } from "./gro_uri_builder.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { getUkbmdDistrictPageUrl } from "./gro_to_ukbmd.mjs";

function buildGroSearchUrl(ed) {
  var builder = new GroUriBuilder();

  if (ed.eventType == "birth") {
    builder.addIndex("EW_Birth");
    builder.addYear(ed.eventYear);
    builder.addYearRange("0");
    builder.addSurname(ed.lastName);
    if (ed.mothersMaidenName != undefined && ed.mothersMaidenName != "" && ed.mothersMaidenName != "-") {
      builder.addMothersSurname(ed.mothersMaidenName);
    }
  } else {
    builder.addIndex("EW_Death");
    builder.addYear(ed.eventYear);
    builder.addYearRange("0");
    builder.addSurname(ed.lastName);
    if (ed.recordType == "older") {
      builder.addAge(ed.ageAtDeath);
      builder.addAgeRange("0");
    }
  }

  builder.addFirstForename(ed.firstName);
  builder.addSecondForename(StringUtils.getFirstWord(ed.middleNames));

  if (ed.personGender == "male") {
    builder.addGenderMale();
  } else {
    builder.addGenderFemale();
  }

  if (ed.recordType == "older") {
    builder.addQuarter(ed.eventQuarterLetter);
  } else {
    const quarterToMonthValue = ["13", "14", "15", "16"];
    builder.addMonth(quarterToMonthValue[ed.eventQuarter - 1]);
  }
  builder.addDistrict(ed.registrationDistrict);
  if (ed.referenceVolume != undefined && ed.referenceVolume != "") {
    builder.addVolume(ed.referenceVolume);
    builder.addPage(ed.referencePage);
  } else if (ed.referenceRegister != undefined && ed.referenceRegister != "") {
    builder.addRegister(ed.referenceRegister);
  }

  const url = builder.getUri();

  return url;
}

function buildGroUrl(ed, builder) {
  let options = builder.getOptions();

  if (options.citation_gro_linkStyle == "search") {
    return buildGroSearchUrl(ed);
  } else if (options.citation_gro_linkStyle == "index") {
    if (ed.eventType == "birth") {
      return "https://www.gro.gov.uk/gro/content/certificates/indexes_search.asp?index=EW_Birth";
    } else {
      return "https://www.gro.gov.uk/gro/content/certificates/indexes_search.asp?index=EW_Death";
    }
  } else {
    return "https://www.gro.gov.uk/gro/content";
  }
}

function getQuarterName(ed) {
  const quarterNames = ["Jan-Feb-Mar", "Apr-May-Jun", "Jul-Aug-Sep", "Oct-Nov-Dec"];
  if (ed.eventQuarter != undefined && ed.eventQuarter >= 1 && ed.eventQuarter <= 4) {
    return quarterNames[ed.eventQuarter - 1];
  } else if (ed.eventQuarterLetter != undefined) {
    return ed.eventQuarterLetter + " Quarter";
  }

  return "";
}

function getCorrectlyCasedName(name, options) {
  if (options.citation_gro_changeNamesToInitialCaps) {
    name = StringUtils.toInitialCaps(name);
  }
  return name;
}

function getCorrectlyCasedNames(name, options, isName = false) {
  if (options.citation_gro_changeNamesToInitialCaps) {
    name = StringUtils.toInitialCapsEachWord(name, isName);
  }
  return name;
}

function getFirstName(ed, options) {
  return getCorrectlyCasedName(ed.firstName, options);
}

function getLastName(ed, options) {
  return getCorrectlyCasedName(ed.lastName, options);
}

function getMiddleNames(ed, options) {
  return getCorrectlyCasedNames(ed.middleNames, options, true);
}

function getMothersMaidenName(ed, options) {
  return getCorrectlyCasedName(ed.mothersMaidenName, options);
}

function getRegistrationDistrict(ed, options) {
  return getCorrectlyCasedNames(ed.registrationDistrict, options);
}

async function buildCoreCitation(ed, runDate, builder) {
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

  let options = builder.options;

  builder.sourceTitle = "England & Wales General Register Office";

  var groUrl = buildGroUrl(ed, builder);

  if (options.citation_gro_linkStyle == "url_content") {
    builder.sourceReference = "GRO Online Indexes - ";
    if (ed.eventType == "birth") {
      builder.sourceReference += "Birth";
    } else {
      builder.sourceReference += "Death";
    }
    builder.recordLinkOrTemplate = groUrl;
  } else {
    let recordLink = "[" + groUrl + " GRO Online Indexes - ";

    if (ed.eventType == "birth") {
      recordLink += "Birth";
    } else {
      recordLink += "Death";
    }
    recordLink += "]";
    builder.recordLinkOrTemplate = recordLink;
  }

  let dataString = getLastName(ed, options) + ", " + getFirstName(ed, options);
  if (ed.middleNames != undefined && ed.middleNames != "") {
    dataString += " " + getMiddleNames(ed, options);
  }
  if (ed.eventType == "birth") {
    if (ed.mothersMaidenName != undefined && ed.mothersMaidenName != "") {
      dataString += " (Mother's maiden name: ";
      var mmn = getMothersMaidenName(ed, options);
      if (mmn == undefined || mmn == "") {
        mmn = "-";
      }
      dataString += mmn + ")";
    }
  } else {
    // age at death can be zero so need to check if property exists
    if (ed.hasOwnProperty("ageAtDeath")) {
      dataString += " (Age at death: ";
      dataString += ed.ageAtDeath + ")";
    } else if (ed.birthYear) {
      dataString += " (Year of birth: ";
      dataString += ed.birthYear + ")";
    }
  }
  dataString += ".";

  if (options.citation_general_addBreaksWithinBody) {
    dataString += "<br/>";
  } else {
    dataString += " ";
  }
  if (options.citation_general_addNewlinesWithinBody && builder.type != "source") {
    dataString += "\n";
  }

  if (options.citation_gro_referenceInItalics) {
    dataString += "''GRO Reference:'' ";
  } else {
    dataString += "GRO Reference: ";
  }

  dataString += ed.eventYear + " " + getQuarterName(ed) + " in ";

  let districtNameForOutput = getRegistrationDistrict(ed, options);
  if (districtNameForOutput) {
    if (options.citation_gro_useDistrictUrl) {
      let url = getUkbmdDistrictPageUrl(ed.registrationDistrict);
      if (url) {
        dataString += "[" + url + " " + districtNameForOutput + "]";
      } else {
        dataString += districtNameForOutput;
      }
    } else {
      dataString += districtNameForOutput;
    }
  } else {
    dataString += "unspecified district";
  }

  if (ed.registrationDistrictCode != undefined && ed.registrationDistrictCode != "") {
    dataString += " (" + ed.registrationDistrictCode + ")";
  }

  if (ed.referenceVolume != undefined && ed.referenceVolume != "") {
    dataString += " Volume " + ed.referenceVolume;
    if (ed.referencePage != undefined && ed.referencePage != "") {
      dataString += " Page " + ed.referencePage;
    }
  } else if (ed.referenceRegister != undefined && ed.referenceRegister != "") {
    dataString += " Reg " + ed.referenceRegister;
  }

  if (ed.entryNumber != undefined && ed.entryNumber != "") {
    dataString += " Entry Number " + ed.entryNumber;
  }

  dataString += ".";

  builder.dataString = dataString;
}

function getRefTitle(ed, gd) {
  return ed.eventType == "birth" ? "Birth Registration" : "Death Registration";
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation, getRefTitle);
}

export { buildCitation };
