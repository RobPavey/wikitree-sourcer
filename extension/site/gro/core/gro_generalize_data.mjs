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
  PlaceObj,
  NameObj,
  DateObj,
} from "../../../base/core/generalize_data_utils.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";

function cleanRegistrationDistrictName(name) {
  if (!name) {
    return "";
  }

  let newName = name;

  newName = newName.replace(/^OF /, "");

  return StringUtils.toInitialCapsEachWord(newName);
}

// This function generalizes the data (ed) extracted from the GRO page.
// We know what fields can be there. And we knw the ones we want in generalizedData.
function generalizeData(input) {
  let ed = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "gro";

  let collectionId = undefined;

  if (ed.eventYear == undefined || ed.eventYear == 0) {
    return result; //the extract failed
  }

  result.sourceType = "record";
  result.recordType = ed.eventType == "birth" ? RT.BirthRegistration : RT.DeathRegistration;

  result.setEventYear(ed.eventYear.toString());
  result.setEventQuarter(ed.eventQuarter); // this is 1-4

  if (ed.eventYear) {
    result.eventDate = new DateObj();

    result.eventDate.yearString = ed.eventYear.toString();
    if (ed.eventQuarter) {
      result.eventDate.quarter = ed.eventQuarter; // this is 1-4
    }
  }

  // most strings in extractedData are in all caps. Change them to mixed case
  let lastName = StringUtils.toInitialCapsEachWord(ed.lastName, true);
  let forenames = StringUtils.toInitialCapsEachWord(ed.forenames, true);
  let mothersMaidenName = StringUtils.toInitialCapsEachWord(ed.mothersMaidenName, true);
  let registrationDistrict = cleanRegistrationDistrictName(ed.registrationDistrict);

  // Names, there should always be a firstName and lastName. MiddleNames my be undefined.
  result.setLastNameAndForenames(lastName, forenames);

  if (ed.eventType == "birth") {
    collectionId = "births";
    result.lastNameAtBirth = lastName;
    result.birthDate = result.eventDate;

    if (mothersMaidenName) {
      result.mothersMaidenName = mothersMaidenName;
    }
  } else {
    collectionId = "deaths";
    result.lastNameAtDeath = lastName;
    result.deathDate = result.eventDate;

    if (ed.birthYear) {
      result.birthDate = new DateObj();
      result.birthDate.yearString = ed.birthYear.toString();
    }

    if (ed.ageAtDeath) {
      result.ageAtDeath = ed.ageAtDeath;
    }
  }

  result.setPersonGender(ed.personGender);

  if (registrationDistrict) {
    result.registrationDistrict = registrationDistrict;
  }

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

  return result;
}

export { generalizeData, GeneralizedData, dateQualifiers };
