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

import {
  GeneralizedData,
  dateQualifiers,
  WtsPlace,
  WtsName,
  WtsDate,
} from "../../../base/core/generalize_data_utils.mjs";
import { WTS_String } from "../../../base/core/wts_string.mjs";
import { RT } from "../../../base/core/record_type.mjs";

function freebmdQuarterToGdQuarter(quarter) {
  let string = quarter.toLowerCase();
  switch (string) {
    case "mar":
      return 1;
    case "jun":
      return 2;
    case "sep":
      return 3;
    case "dec":
      return 4;
    default:
      return 1;
  }
}
// This function generalizes the data (ed) extracted from the GRO page.
// We know what fields can be there. And we knw the ones we want in generalizedData.
function generalizeData(input) {
  let ed = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "freebmd";

  let collectionId = undefined;

  if (!ed.success == undefined || !ed.eventYear) {
    return result; //the extract failed
  }

  result.sourceType = "record";

  switch (ed.eventType) {
    case "birth":
      result.recordType = RT.BirthRegistration;
      break;
    case "marriage":
      result.recordType = RT.MarriageRegistration;
      break;
    case "death":
      result.recordType = RT.DeathRegistration;
      break;
    default:
      return;
  }

  result.setEventYear(ed.eventYear);
  result.setEventQuarter(freebmdQuarterToGdQuarter(ed.eventQuarter));

  // Names, there should always be a firstName and lastName. MiddleNames my be undefined.
  result.setLastNameAndForeNames(ed.surname, ed.givenNames);

  if (ed.eventType == "birth") {
    collectionId = "births";
    result.lastNameAtBirth = ed.surname;
    result.birthDate = result.eventDate;
    if (ed.mother) {
      result.mothersMaidenName = ed.mothersMaidenName;
    }
  } else if (ed.eventType == "marriage") {
    collectionId = "marriages";

    if (ed.spouse) {
      let name = new WtsName();
      name.name = ed.spouse;
      let spouse = {
        name: name,
        marriageDate: result.eventDate,
        marriagePlace: ed.district,
      };

      result.spouses = [spouse];
    }
  } else if (ed.eventType == "death") {
    collectionId = "deaths";
    result.lastNameAtDeath = ed.surname;
    result.deathDate = result.eventDate;

    if (ed.ageAtDeath) {
      result.ageAtDeath = ed.ageAtDeath;
    } else if (ed.birthDate) {
      result.setBirthDate(ed.birthDate);
    }
  }

  result.registrationDistrict = ed.registrationDistrict;

  // Collection
  if (collectionId) {
    result.collectionData = {
      id: collectionId,
    };
    if (ed.referenceVolume) {
      result.collectionData.volume = ed.referenceVolume;
    }
    if (ed.referencePage) {
      result.collectionData.page = ed.referencePage;
    }
  }

  result.hasValidData = true;

  //console.log("freebmd; generalizeData: result is:");
  //console.log(result);

  return result;
}

export { generalizeData, GeneralizedData, dateQualifiers };
