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

import { GeneralizedData, dateQualifiers, NameObj } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";

const RECORD_TYPES = {
  B: RT.BirthRegistration,
  D: RT.DeathRegistration,
  S: RT.MarriageRegistration,
};

const PROVINCES = {
  "01ds": "dolnośląskie",
  "02kp": "kujawsko-pomorskie",
  "03lb": "lubelskie",
  "04ls": "lubuskie",
  "05ld": "łódzkie",
  "06mp": "małopolskie",
  "07mz": "mazowieckie",
  "71wa": "Warszawa",
  "08op": "opolskie",
  "09pk": "podkarpackie",
  "10pl": "podlaskie",
  "11pm": "pomorskie",
  "12sl": "śląskie",
  "13sk": "świętokrzyskie",
  "14wm": "warmińsko-mazurskie",
  "15wp": "wielkopolskie",
  "16zp": "zachodniopomorskie",
  "21uk": "Ukraina",
  "22br": "Białoruś",
  "23lt": "Litwa",
  "25po": "Pozostałe",
};

/**
 * Convert most popular female surnames to their male counterparts.
 */
function femaleToMaleName(name) {
  return name.replace(/ska$/, "ski").replace(/cka$/, "cki").replace(/zka$/, "zki");
}

/**
 * Convert date from dd.mm.yyyy format to d MMM yyyy.
 * Example: 05.01.1876 -> 5 Jan 1876
 */
function convertDate(date) {
  const dateMatch = date?.match(/^(\d\d).(\d\d).(\d\d\d\d)$/);
  if (!dateMatch) {
    return undefined;
  }
  const day = parseInt(dateMatch[1]);
  const month = parseInt(dateMatch[2]);
  const year = parseInt(dateMatch[3]);
  return DateUtils.getDateStringFromYearMonthDay(year, month, day);
}

// This function generalizes the data (ed) extracted from the web page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeData(input) {
  let ed = input.extractedData;

  const result = new GeneralizedData();
  result.sourceOfData = "geneteka";

  if (!ed || !ed.success) {
    return result; // The extract failed.
  }

  const recordData = ed.recordData;
  result.sourceType = "record";
  result.recordType = RECORD_TYPES[recordData.recordType];
  result.collectionData = {
    provinceId: recordData.province,
    province: PROVINCES[recordData.province],
  };

  result.setEventYear(recordData.year);
  result.setEventPlace(recordData.parish);

  if (recordData.record) {
    result.collectionData.registrationNumber = recordData.record;
  }
  if (recordData.parish) {
    result.collectionData.parish = recordData.parish;
  }

  if (recordData.recordType !== "S") {
    result.setLastNameAndForenames(recordData.lastName, recordData.firstName);

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
    result.setBirthDate(convertDate(recordData.date));
    result.setBirthPlace(recordData.place);
    result.collectionData.id = "births";
  } else if (recordData.recordType === "D") {
    result.setDeathDate(convertDate(recordData.date));
    result.setDeathPlace(recordData.place);
    result.collectionData.id = "deaths";
  } else if (recordData.recordType === "S") {
    result.setLastNameAndForenames(recordData.husbandLastName, recordData.husbandFirstName);
    const spouse = result.addSpouse();
    spouse.name = new NameObj();
    spouse.name.setLastName(recordData.wifeLastName);
    spouse.name.setForenames(recordData.wifeFirstName);
    if (recordData.date) {
      spouse.marriageDate.setDateAndQualifierFromString(convertDate(recordData.date));
    }
    if (recordData.place) {
      spouse.marriagePlace.placeString = recordData.place;
    }
    result.collectionData.id = "marriages";
  }

  result.hasValidData = true;
  return result;
}

export { generalizeData, GeneralizedData, dateQualifiers };
