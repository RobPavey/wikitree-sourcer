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

import { GeneralizedData, GD, dateQualifiers, WtsName } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { WTS_String } from "../../../base/core/wts_string.mjs";

function cleanFullName(name) {
  if (!name) {
    return "";
  }

  let cleanName = WTS_String.toInitialCapsEachWord(name);

  cleanName = cleanName.replace(/Mc (\w)/, "Mc$1");

  // The above will change "O'CONNOR" to "O'connor"
  // So the replace below will change "O'connor" to "O'Connor"
  function replacer(letter) {
    return letter.toUpperCase();
  }
  cleanName = cleanName.replace(/'(\w)/g, replacer);

  return cleanName;
}

function cleanDate(dateString) {
  if (!dateString) {
    return "";
  }

  // remove parts in parens. E.g.
  // "19 May 1773 (BASED ON OTHER DATE INFORMATION)"
  let cleanDate = dateString.replace(/\(.*\)/g, "").trim();

  cleanDate = cleanDate.replace(/N\/R/g, "").trim();

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
}

function buildEventPlace(data, result) {
  let eventPlace = "";
  let districtArea = data.recordData["SR District/Reg Area"];
  if (districtArea) {
    eventPlace = districtArea;
  } else if (data.headingText) {
    let area = data.headingText.replace(/^Area - ([^,]+)\,.*$/, "$1");
    if (area == data.headingText) {
      area = "";
    }
    let parish = data.headingText.replace(/^.*Parish\/Church\/Congregation - ([^,]+).*$/, "$1");
    if (parish == data.headingText) {
      parish = "";
    }

    if (area) {
      let parenIndex = area.indexOf("(");
      if (parenIndex != -1) {
        let firstPart = area.substring(0, parenIndex);
        let secondPart = area.substring(parenIndex);
        firstPart = WTS_String.toInitialCapsEachWord(firstPart);
        area = firstPart + " " + secondPart;
      } else {
        area = WTS_String.toInitialCapsEachWord(area);
      }
    }

    if (parish) {
      parish = WTS_String.toInitialCapsEachWord(parish);
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

// This function generalizes the data extracted web page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeData(input) {
  let data = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "irishg";

  let collectionId = undefined;

  if (!data.success) {
    return result; //the extract failed
  }

  result.sourceType = "record";

  // not easy to determine record type - use descriptive paragraph first word
  if (!data.eventText) {
    return result;
  }

  // to tell if civil or church we can look at url
  let recordSite = data.url.replace(/^.*\:\/\/([^\.]+)\.irishgenealogy.*$/, "$1");
  if (!recordSite || recordSite == data.url) {
    console.log("irishg generalizeData: could not find recordSite in URL");
    return result;
  }

  let firstWord = WTS_String.getFirstWord(data.eventText).toLowerCase();
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

  result.setEventPlace(buildEventPlace(data, result));

  if (result.recordType == RT.BirthRegistration) {
    result.setEventDate(data.recordData["Date of Birth"]);
    result.setFullName(cleanFullName(data.recordData["Name"]));

    collectionId = "births";
    result.birthDate = result.eventDate;
    let mmn = data.recordData["Mother's Birth Surname"];
    if (mmn && mmn != "see register entry") {
      result.mothersMaidenName = cleanFullName(mmn);
    }

    let sex = data.recordData["Sex"];
    if (sex && sex != "see register entry") {
      result.gender = GD.standardizeGender(sex);
    }
  } else if (result.recordType == RT.MarriageRegistration) {
    result.setEventDate(data.recordData["Date of Event"]);

    collectionId = "civil-marriages";

    let name1 = cleanFullName(data.recordData["Party 1 Name"]);
    let name2 = cleanFullName(data.recordData["Party 2 Name"]);

    if (name1) {
      result.setFullName(name1);
    }

    if (name2) {
      let name = new WtsName();
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
  } else if (result.recordType == RT.DeathRegistration) {
    result.setEventDate(data.recordData["Date of Death"]);
    result.setFullName(cleanFullName(data.recordData["Name"]));

    collectionId = "deaths";
    result.lastNameAtDeath = result.inferLastNameAtDeath();
    result.deathDate = result.eventDate;

    let age = data.recordData["Deceased Age at Death"];
    if (age) {
      result.ageAtDeath = age;
    }
  } else if (result.recordType == RT.Baptism) {
    result.setFullName(cleanFullName(data.recordData["Name"]));
    result.setBirthDate(cleanDate(data.recordData["Date of Birth"]));
    result.setEventDate(extractDateFromEventString(data.eventText));
    collectionId = "baptisms";
  } else if (result.recordType == RT.Marriage) {
    result.setEventDate(extractDateFromEventString(data.eventText));
    collectionId = "marriages";

    let name1 = cleanFullName(data.recordData["Name"]);
    let name2 = cleanFullName(data.spouseRecordData["Name"]);

    if (name1) {
      result.setFullName(name1);
    }

    if (name2) {
      let name = new WtsName();
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
  } else if (result.recordType == RT.Burial) {
    result.setFullName(cleanFullName(data.recordData["Name"]));
    result.setDeathDate(cleanDate(data.recordData["Date of Death"]));
    result.setEventDate(extractDateFromEventString(data.eventText));
    let age = data.recordData["Age"];
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

    let registrationId = data.recordData["Group Registration ID"];

    if (registrationId) {
      result.collectionData.registrationId = registrationId;
    }
  }

  result.hasValidData = true;

  //console.log("irishg; generalizeData: result is:");
  //console.log(result);

  return result;
}

export { generalizeData, GeneralizedData, dateQualifiers };
