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

import { GeneralizedData, dateQualifiers, WtsName } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";

const RECORD_TYPES = {
  B: RT.BirthRegistration,
  D: RT.DeathRegistration,
  S: RT.MarriageRegistration,
};

/**
 * Convert most popular female surnames to their male counterparts.
 */
function femaleToMaleName(name) {
  return name.replace(/ska$/, "ski").replace(/cka$/, "cki").replace(/zka$/, "zki");
}

// This function generalizes the data extracted web page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeData(input) {
  let data = input.extractedData;

  const result = new GeneralizedData();
  result.sourceOfData = "geneteka";

  if (!data || !data.success) {
    return result; // The extract failed.
  }

  const recordData = data.recordData;
  result.sourceType = "record";
  result.recordType = RECORD_TYPES[recordData.recordType];

  result.setEventYear(recordData.year);

  if (recordData !== "S") {
    result.setLastNameAndForeNames(recordData.lastName, recordData.firstName);

    if (recordData.fatherFirstName) {
      const father = result.addFather();
      father.name.firstName = recordData.fatherFirstName;
      father.name.lastName = femaleToMaleName(recordData.lastName);
    }
    if (recordData.motherFirstName) {
      const mother = result.addMother();
      mother.name.firstName = recordData.motherFirstName;
    }
    if (recordData.motherMaidenName) {
      const mother = result.addMother();
      mother.name.lastName = recordData.motherMaidenName;
    }
  }

  if (recordData.recordType === "B") {
    result.setBirthDate(recordData.date);
    result.setBirthPlace(recordData.place);
  } else if (recordData.recordType === "D") {
    result.setDeathDate(recordData.date);
    result.setDeathPlace(recordData.place);
  } else if (recordData.recordType === "S") {
    result.setLastNameAndForeNames(recordData.husbandLastName, recordData.husbandFirstName);
    const spouse = result.addSpouse();
    spouse.name = new WtsName();
    spouse.name.setLastName(recordData.wifeLastName);
    spouse.name.setForeNames(recordData.wifeFirstName);
    spouse.marriageDate.setDateAndQualifierFromString(recordData.date);
    if (recordData.place) {
      spouse.marriagePlace.placeString = recordData.place;
    }
  }

  result.hasValidData = true;
  return result;
}

export { generalizeData, GeneralizedData, dateQualifiers };
