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

function cleanRegistrationDistrictName(name) {
  if (!name) {
    return "";
  }

  let newName = name;

  newName = newName.replace(/^OF /, "");

  return WTS_String.toInitialCapsEachWord(newName);
}

// This function generalizes the data extracted from the GRO page.
// We know what fields can be there. And we knw the ones we want in generalizedData.
function generalizeData(input) {
  let data = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "gro";

  let collectionId = undefined;

  if (data.eventYear == undefined || data.eventYear == 0) {
    return result; //the extract failed
  }

  result.sourceType = "record";
  result.recordType =
    data.eventType == "birth" ? RT.BirthRegistration : RT.DeathRegistration;

  result.setEventYear(data.eventYear.toString());
  result.setEventQuarter(data.eventQuarter); // this is 1-4

  if (data.eventYear) {
    result.eventDate = new WtsDate();

    result.eventDate.yearString = data.eventYear.toString();
    if (data.eventQuarter) {
      result.eventDate.quarter = data.eventQuarter; // this is 1-4
    }
  }

  // most strings in extractedData are in all caps. Change them to mixed case
  let lastName = WTS_String.toInitialCapsEachWord(data.lastName, true);
  let forenames = WTS_String.toInitialCapsEachWord(data.forenames, true);
  let mothersMaidenName = WTS_String.toInitialCapsEachWord(
    data.mothersMaidenName,
    true
  );
  let registrationDistrict = cleanRegistrationDistrictName(
    data.registrationDistrict
  );

  // Names, there should always be a firstName and lastName. MiddleNames my be undefined.
  result.setLastNameAndForeNames(lastName, forenames);

  if (data.eventType == "birth") {
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

    if (data.birthYear) {
      result.birthDate = new WtsDate();
      result.birthDate.yearString = data.birthYear.toString();
    }

    if (data.ageAtDeath) {
      result.ageAtDeath = data.ageAtDeath;
    }
  }

  result.setPersonGender(data.personGender);

  if (registrationDistrict) {
    result.registrationDistrict = registrationDistrict;
  }

  // Collection
  if (collectionId) {
    result.collectionData = {
      id: collectionId,
    };
    if (data.referenceVolume) {
      result.collectionData.volume = data.referenceVolume;
    }
    if (data.referencePage) {
      result.collectionData.page = data.referencePage;
    }
  }

  result.hasValidData = true;

  return result;
}

export { generalizeData, GeneralizedData, dateQualifiers };
