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
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { FreebmdEdReader } from "./freebmd_ed_reader.mjs";
//import { FBMD } from "./freebmd_utils.mjs";

function buildFreebmdUrl(ed, builder) {
  // could provide option to use a search style URL but don't see any reason to so far
  if (ed.citationUrl) {
    return ed.citationUrl;
  }

  if (ed.recordData) {
    let persistentUrlEntry = ed.recordData["Persistent URL for entry"];
    if (persistentUrlEntry) {
      if (persistentUrlEntry.href) {
        let url = persistentUrlEntry.href;
        if (!url.startsWith("http")) {
          // url can be of form:
          // /entry-information/hash?id=VTuTHg8Sx2jpPbxoXlMXhw&locale=en
          // corresponding ed.url could be:
          // https://www.freebmd2.org.uk/68fbebeb86557446cc1ef67f/entry-information/287998007/john-d-smith-marriage-lancashire-bolton-v38-p108?locale=en&search_entry=287998007
          let domainRe = /^(https\:\/\/[^\/]+).*$/;
          if (domainRe.test(ed.url)) {
            let domain = ed.url.replace(domainRe, "$1");
            if (domain) {
              url = domain + url;
            }
          }
        }
        return url;
      }
    }
  }
}

function getQuarterName(dateObj) {
  const quarterNames = ["Jan-Feb-Mar", "Apr-May-Jun", "Jul-Aug-Sep", "Oct-Nov-Dec"];

  if (dateObj.quarter != undefined && dateObj.quarter >= 1 && dateObj.quarter <= 4) {
    let quarterName = quarterNames[dateObj.quarter - 1];
    return quarterName;
  }

  return "";
}

function getCorrectlyCasedName(name, options) {
  if (options.citation_freebmd_changeNamesToInitialCaps) {
    // the option says "Change any person and place names in all caps to initial caps"
    if (StringUtils.isWordAllUpperCase(name)) {
      name = NameUtils.convertNameFromAllCapsToMixedCase(name);
    }
  }
  return name;
}

function getCorrectlyCasedNames(name, options) {
  if (options.citation_freebmd_changeNamesToInitialCaps) {
    // the option says "Change any person and place names in all caps to initial caps"
    if (StringUtils.isWordAllUpperCase(name)) {
      name = NameUtils.convertNameFromAllCapsToMixedCase(name);
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

function getMothersMaidenName(ed, gd, options) {
  let mmn = ed.mothersMaidenName;
  if (mmn) {
    mmn = getCorrectlyCasedName(mmn, options);
  } else {
    mmn = gd.mothersMaidenName;
  }
  return mmn;
}

function getRegistrationDistrict(ed, gd, options) {
  let rd = ed.registrationDistrict;
  if (rd) {
    rd = getCorrectlyCasedName(rd, options);
  } else {
    rd = gd.registrationDistrict;
  }

  return rd;
}

function getNameString(ed, options) {
  if (ed.format == "v2025") {
    const convertToMixedCase = options.citation_freebmd_changeNamesToInitialCaps;

    let edReader = new FreebmdEdReader(ed);
    let names = edReader.getSurnameAndGivenNames(convertToMixedCase);

    return names.surname + ", " + names.givenNames;
  } else {
    return getLastName(ed, options) + ", " + getGivenNames(ed, options);
  }
}

function buildSourceTitle(ed, gd, builder) {
  const titleText = {
    BirthRegistration: "Birth",
    MarriageRegistration: "Marriage",
    DeathRegistration: "Death",
  };

  builder.sourceTitle = "England & Wales " + titleText[gd.recordType] + " Index";
}

function buildSourceReference(ed, gd, builder) {
  // do nothing - the reference data goes in the data string
}

function buildRecordLink(ed, gd, builder) {
  var freebmdUrl = buildFreebmdUrl(ed, builder);

  let recordLink = "[" + freebmdUrl + " FreeBMD Entry Information]";
  builder.recordLinkOrTemplate = recordLink;
}

function buildDataString(ed, gd, builder) {
  let options = builder.getOptions();

  let dataString = getNameString(ed, options);
  if (gd.recordType == RT.BirthRegistration) {
    var mmn = getMothersMaidenName(ed, gd, options);
    if (mmn) {
      dataString += " (Mother's maiden name: ";
      if (mmn == undefined || mmn == "") {
        mmn = "-";
      }
      dataString += mmn + ")";
    }
  } else if (gd.recordType == RT.DeathRegistration) {
    if (gd.ageAtDeath) {
      dataString += " (Age at death: ";
      dataString += gd.ageAtDeath + ")";
    } else if (gd.birthDate) {
      dataString += " (Date of birth: ";
      dataString += gd.birthDate.getDateString() + ")";
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
  if (builder.type != "source" && options.citation_general_addNewlinesWithinBody) {
    dataString += "\n";
  }

  if (options.citation_freebmd_referenceInItalics) {
    dataString += "''GRO Reference:'' ";
  } else {
    dataString += "GRO Reference: ";
  }

  if (gd.eventDate.yearString && gd.eventDate.quarter) {
    dataString += gd.eventDate.yearString + " " + getQuarterName(gd.eventDate);
  } else if (gd.eventDate) {
    dataString += gd.eventDate.getDateString();
  }

  let registrationDistrict = getRegistrationDistrict(ed, gd, options);
  if (registrationDistrict) {
    dataString += " in ";
    // temp - disable district link
    if (false && options.citation_freebmd_useDistrictUrl) {
      dataString +=
        "[" + FBMD.getDistrictPageUrl(ed.registrationDistrict) + " " + getRegistrationDistrict(ed, options) + "]";
    } else {
      dataString += getRegistrationDistrict(ed, gd, options);
    }
  }

  if (gd.collectionData) {
    let volume = gd.collectionData.volume;
    let page = gd.collectionData.page;
    if (volume) {
      dataString += " Volume " + volume + " Page " + page + ".";
    }
  }

  builder.dataString = dataString;
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
