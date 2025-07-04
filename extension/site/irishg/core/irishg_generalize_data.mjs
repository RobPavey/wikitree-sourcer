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

import { GeneralizedData, GD, NameObj, PlaceObj } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";

function cleanFullName(name) {
  if (!name) {
    return name;
  }

  // in 2025 format they are sometimes downcased names in a dumb way resulting in names
  // like O'connor or Mcdermott
  if (/O'[a-z]/.test(name) || /Mc[a-z]/.test(name) || /Mac[a-z]/.test(name)) {
    name = name.toUpperCase();
  }

  // in irishg there are sometimes name like: "ISABELLA MC DONALD"
  let modifiedName = name.replace(/MC (\w)/, "MC$1");

  return NameUtils.convertNameFromAllCapsToMixedCase(modifiedName, true);
}

function cleanDate(dateString) {
  if (!dateString) {
    return "";
  }

  // remove parts in parens. E.g.
  // "19 May 1773 (BASED ON OTHER DATE INFORMATION)"
  let cleanDate = dateString.replace(/\(.*\)/g, "").trim();

  cleanDate = cleanDate.replace(/N\/R/g, "").trim();

  cleanDate = cleanDate.replace(/N\/A/g, "").trim();

  const ddMmYyyyRegEx = /^(\d\d)\/(\d\d)\/(\d\d\d\d)$/;
  if (ddMmYyyyRegEx.test(cleanDate)) {
    let day = cleanDate.replace(ddMmYyyyRegEx, "$1");
    let month = cleanDate.replace(ddMmYyyyRegEx, "$2");
    let year = cleanDate.replace(ddMmYyyyRegEx, "$3");

    if (day.length != 2 || month.length != 2 || year.length != 4) {
      return "";
    }

    let dayNum = parseInt(day);
    let monthNum = parseInt(month);
    let yearNum = parseInt(year);

    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
      return "";
    }

    cleanDate = DateUtils.getDateStringFromYearMonthDay(yearNum, monthNum, dayNum);
  }

  return cleanDate;
}

function extractDateFromEventString(eventString) {
  let dateString = eventString.replace(/^.* in (\d\d\d\d)$/, "$1");
  if (dateString && dateString != eventString) {
    return dateString;
  }

  dateString = eventString.replace(/^.* on (\d\d? \w+ \d\d\d\d)$/, "$1");
  if (dateString && dateString != eventString) {
    return dateString;
  }

  dateString = eventString.replace(/^.* on N\/R (\w+ \d\d\d\d)$/, "$1");
  if (dateString && dateString != eventString) {
    return dateString;
  }

  // Marriage record for BARTLE FAGAN and MARY MALONE on ?? June 1770
  dateString = eventString.replace(/^.* on \?\? (\w+ \d\d\d\d)$/, "$1");
  if (dateString && dateString != eventString) {
    return dateString;
  }
}

function buildEventPlace(ed, result) {
  let eventPlace = "";
  let districtArea = ed.recordData["SR District/Reg Area"];
  if (districtArea) {
    eventPlace = districtArea;
  } else if (ed.headingText) {
    let area = ed.headingText.replace(/^Area - ([^,]+)\,.*$/, "$1");
    if (area == ed.headingText) {
      area = "";
    }
    let parish = ed.headingText.replace(/^.*Parish\/Church\/Congregation - ([^,]+).*$/, "$1");
    if (parish == ed.headingText) {
      parish = "";
    }

    if (area) {
      let parenIndex = area.indexOf("(");
      if (parenIndex != -1) {
        let firstPart = area.substring(0, parenIndex);
        let secondPart = area.substring(parenIndex);
        firstPart = StringUtils.toInitialCapsEachWord(firstPart);
        area = firstPart + " " + secondPart;
      } else {
        area = StringUtils.toInitialCapsEachWord(area);
      }
    }

    if (parish) {
      parish = StringUtils.toInitialCapsEachWord(parish);
    }

    if (area && parish) {
      eventPlace = parish.trim() + ", " + area.trim();
    } else if (parish) {
      eventPlace = parish.trim();
    } else if (area) {
      eventPlace = area.trim();
    }
  }
  return eventPlace;
}

function setRegistrationDistrict(ed, result) {
  if (
    result.recordType == RT.BirthRegistration ||
    result.recordType == RT.MarriageRegistration ||
    result.recordType == RT.DeathRegistration
  ) {
    let districtArea = ed.recordData["SR District/Reg Area"];
    if (districtArea) {
      result.registrationDistrict = districtArea;
    }
  }
}

function isName2Primary(ed, name1, name2) {
  let url = ed.url;
  const searchString = "search.jsp%3F";
  let searchIndex = url.indexOf(searchString);
  if (searchIndex != -1) {
    let searchParams = url.substring(searchIndex + searchIndex.length);

    const firstNameKey = "namefm%3D";
    const lastNameKey = "namel%3D";

    let searchFirstName = "";
    let firstNameIndex = searchParams.indexOf(firstNameKey);
    if (firstNameIndex != -1) {
      let endIndex = searchParams.indexOf("%26", firstNameIndex);
      if (endIndex != -1) {
        searchFirstName = searchParams.substring(firstNameIndex + firstNameKey.length, endIndex);
      }
    }

    let searchLastName = "";
    let lastNameIndex = searchParams.indexOf(lastNameKey);
    if (lastNameIndex != -1) {
      let endIndex = searchParams.indexOf("%26", lastNameIndex);
      if (endIndex != -1) {
        searchLastName = searchParams.substring(lastNameIndex + lastNameKey.length, endIndex);
      }
    }

    if (searchFirstName) {
      if (name2.startsWith(searchFirstName)) {
        return true;
      }
    }

    if (searchLastName) {
      if (name2.endsWith(searchLastName)) {
        return true;
      }
    }
  }

  return false;
}

// This function generalizes the data (ed) extracted from the web page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeData(input) {
  let ed = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "irishg";

  let collectionId = undefined;

  if (!ed.success) {
    return result; //the extract failed
  }

  result.sourceType = "record";

  if (!ed.eventText) {
    return result;
  }

  // to tell if civil or church we can look at url
  let recordSite = ed.url.replace(/^.*\:\/\/([^\.]+)\.irishgenealogy.*$/, "$1");
  if (!recordSite || recordSite == ed.url) {
    console.log("irishg generalizeData: could not find recordSite in URL");
    return result;
  }

  if (recordSite == "www") {
    // new 2025 format, can't use the URL to determine if a church record
    // "imageHref": "https://www.irishgenealogy.ie/files/church/st.michans_mf_1726-1830_ma_1113.pdf.pdf",
    // "headingText": "Area - DUBLIN (RC), Parish/Church/Congregation - ST. MICHAN",
    const imageHrefChurchRegEx = /^.*\/church\/.*$/i;
    const headingChurchRegEx = /^.*\/church\/.*$/i;
    if (imageHrefChurchRegEx.test(ed.imageHref) || headingChurchRegEx.test(ed.headingText)) {
      recordSite = "churchrecords";
    }
  }

  let firstWord = StringUtils.getFirstWord(ed.eventText).toLowerCase();
  switch (firstWord) {
    case "baptism":
      result.recordType = RT.Baptism;
      break;
    case "birth":
      result.recordType = RT.BirthRegistration;
      break;
    case "burial":
      result.recordType = RT.Burial;
      break;
    case "marriage":
      if (recordSite == "churchrecords") {
        result.recordType = RT.Marriage;
      } else {
        result.recordType = RT.MarriageRegistration;
      }
      break;
    case "death":
      result.recordType = RT.DeathRegistration;
      break;
    default:
      return;
  }

  result.setEventPlace(buildEventPlace(ed, result));
  setRegistrationDistrict(ed, result);
  // set country
  if (!result.eventPlace) {
    result.eventPlace = new PlaceObj();
  }
  result.eventPlace.country = "Ireland";

  if (result.recordType == RT.BirthRegistration) {
    let dateOfBirth = cleanDate(ed.recordData["Date of Birth"]);
    let yearOfBirth = ed.recordData["Year of Birth"];

    if (dateOfBirth) {
      result.setEventDate(dateOfBirth);
    } else if (yearOfBirth) {
      result.setEventYear(yearOfBirth);
    }
    result.setFullName(cleanFullName(ed.recordData["Name"]));

    collectionId = "births";
    result.birthDate = result.eventDate;
    let mmn = ed.recordData["Mother's Birth Surname"];
    if (mmn && mmn != "see register entry" && mmn != "Null") {
      result.mothersMaidenName = cleanFullName(mmn);
    }

    let sex = ed.recordData["Sex"];
    if (sex && sex != "see register entry") {
      result.setPersonGender(sex);
    }
  } else if (result.recordType == RT.MarriageRegistration) {
    result.setEventDate(cleanDate(ed.recordData["Date of Event"]));

    collectionId = "civil-marriages";

    let name1 = cleanFullName(ed.recordData["Party 1 Name"]);
    let name2 = cleanFullName(ed.recordData["Party 2 Name"]);

    // These are only available when the imagae is not available
    let age1 = ed.recordData["Party 1 Age"];
    let age2 = ed.recordData["Party 2 Age"];

    // who should be considered the primary person?
    if (isName2Primary(ed, name1, name2)) {
      let temp = name1;
      name1 = name2;
      name2 = temp;
      temp = age1;
      age1 = age2;
      age2 = temp;
    }

    if (name1) {
      result.setFullName(name1);
      result.setAgeAtEvent(age1);
    }

    if (name2) {
      let name = new NameObj();
      name.name = name2;
      let spouse = {
        name: name,
        marriageDate: result.eventDate,
      };
      let eventPlace = result.inferEventPlace();
      if (eventPlace) {
        spouse["marriagePlace"] = eventPlace;
      }
      if (age2) {
        spouse.age = age2;
      }

      result.spouses = [spouse];
    }
  } else if (result.recordType == RT.DeathRegistration) {
    result.setEventDate(cleanDate(ed.recordData["Date of Death"]));
    result.setFullName(cleanFullName(ed.recordData["Name"]));

    collectionId = "deaths";
    result.lastNameAtDeath = result.inferLastNameAtDeath();
    result.deathDate = result.eventDate;

    let age = ed.recordData["Deceased Age at Death"];
    if (age) {
      result.ageAtDeath = age;
    }
  } else if (result.recordType == RT.Baptism) {
    result.setFullName(cleanFullName(ed.recordData["Name"]));

    // sometimes the birth date is just the baptism date
    let birthDate = cleanDate(ed.recordData["Date of Birth"]);
    let eventDate = extractDateFromEventString(ed.eventText);
    result.setEventDate(eventDate);
    if (birthDate && birthDate != eventDate) {
      const suffix = "(BASED ON OTHER DATE INFORMATION)";
      if (!ed.recordData["Date of Birth"].endsWith(suffix)) {
        result.setBirthDate(birthDate);
      }
    }
    collectionId = "baptisms";
  } else if (result.recordType == RT.Marriage) {
    result.setEventDate(extractDateFromEventString(ed.eventText));
    collectionId = "marriages";

    if (ed.spouseRecordData) {
      let name1 = cleanFullName(ed.recordData["Name"]);
      let name2 = cleanFullName(ed.spouseRecordData["Name"]);

      // who should be considered the primary person?
      if (isName2Primary(ed, name1, name2)) {
        let temp = name1;
        name1 = name2;
        name2 = temp;
      }

      if (name1) {
        result.setFullName(name1);
      }

      if (name2) {
        let name = new NameObj();
        name.name = name2;
        let spouse = {
          name: name,
          marriageDate: result.eventDate,
        };

        let eventPlace = result.inferEventPlace();
        if (eventPlace) {
          spouse["marriagePlace"] = eventPlace;
        }

        result.spouses = [spouse];
      }
    } else {
      let husbandName = cleanFullName(ed.recordData["Husband Name"]);
      let wifeName = cleanFullName(ed.recordData["Wife Name"]);
      if (husbandName && wifeName) {
        result.setFullName(husbandName);
        let spouseNameObj = new NameObj();
        spouseNameObj.name = wifeName;
        let spouse = {
          name: spouseNameObj,
          marriageDate: result.eventDate,
        };

        let eventPlace = result.inferEventPlace();
        if (eventPlace) {
          spouse["marriagePlace"] = eventPlace;
        }

        result.spouses = [spouse];
      }
    }
  } else if (result.recordType == RT.Burial) {
    result.setFullName(cleanFullName(ed.recordData["Name"]));
    result.setDeathDate(cleanDate(ed.recordData["Date of Death"]));
    result.setEventDate(extractDateFromEventString(ed.eventText));
    let age = ed.recordData["Age"];
    if (age && age != "N/R") {
      result.ageAtDeath = age;
    }

    collectionId = "burials";
  }

  // Collection
  if (collectionId) {
    result.collectionData = {
      id: collectionId,
    };

    let registrationId = ed.recordData["Group Registration ID"];

    if (registrationId) {
      result.collectionData.registrationId = registrationId;
    }
  }

  result.hasValidData = true;

  //console.log("irishg; generalizeData: result is:");
  //console.log(result);

  return result;
}

export { generalizeData };
