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
  GD,
  dateQualifiers,
  WtsName,
} from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { WTS_String } from "../../../base/core/wts_string.mjs";
import { getCountryFromCountyName } from "../../freecen/core/freecen_chapman_codes.mjs";

function getCountyAndCountry(data) {
  let result = { county: "", country: "" };

  let county = data.recordData["County"];
  let country = getCountryFromCountyName(county);

  result.country = country;
  result.county = county;
  return result;
}

function getRecordDataValueForKeys(data, keys) {
  for (let key of keys) {
    let value = data.recordData[key];
    if (value) {
      return value;
    }
  }
}

function buildEventPlace(data, result) {
  let countyAndCountry = getCountyAndCountry(data);

  let country = countyAndCountry.country;
  let county = countyAndCountry.county;
  let place = getRecordDataValueForKeys(data, ["Place"]);

  let placeString = "";

  function addPlacePart(part) {
    if (part) {
      if (placeString) {
        placeString += ", ";
      }
      placeString += part;
    }
  }

  addPlacePart(place);
  addPlacePart(county);
  addPlacePart(country);

  result.setEventPlace(placeString);
}

function buildFullName(data, forenameKeys, surnameKeys) {
  let forename = getRecordDataValueForKeys(data, forenameKeys);
  let surname = getRecordDataValueForKeys(data, surnameKeys);

  surname = WTS_String.toInitialCapsEachWord(surname, true);

  if (forename && surname) {
    return forename + " " + surname;
  } else if (surname) {
    return surname;
  } else if (forename) {
    return forename;
  }
}

function setMarriageData(data, result, input) {
  let surname = WTS_String.toInitialCapsEachWord(input.surname, true);
  result.setLastNameAndForeNames(surname, input.forenames);
  result.setFieldIfValueExists("ageAtEvent", input.age);

  let spouseSurname = WTS_String.toInitialCapsEachWord(
    input.spouseSurname,
    true
  );
  let spouseName = new WtsName();
  if (input.spouseForenames) {
    spouseName.forenames = input.spouseForenames;
  }
  if (spouseSurname) {
    spouseName.lastName = spouseSurname;
  }

  let spouse = {
    name: spouseName,
  };
  if (result.eventDate) {
    spouse.marriageDate = result.eventDate;
  }
  if (result.eventPlace) {
    spouse.marriagePlace = result.eventPlace;
  }
  if (input.spouseAge) {
    spouse.age = input.spouseAge;
  }
  result.spouses = [spouse];
}

function generalizeDataForBaptism(data, result) {
  result.recordType = RT.Baptism;
  let baptismDate = getRecordDataValueForKeys(data, ["Baptism date"]);
  result.setEventDate(baptismDate);
  let birthDate = getRecordDataValueForKeys(data, ["Birth date"]);
  result.setBirthDate(birthDate);
  // does a baptism record ever have a death date?

  result.setBirthPlace(result.eventPlace.placeString);

  let age = getRecordDataValueForKeys(data, ["Age", "Baptism age"]);
  if (age) {
    result.ageAtEvent = age;
  }

  let forenames = getRecordDataValueForKeys(data, ["Person forename"]);
  let surname = getRecordDataValueForKeys(data, [
    "Person surname",
    "Father surname",
    "Mother surname",
  ]);
  surname = WTS_String.toInitialCapsEachWord(surname, true);
  result.lastNameAtBirth = surname;
  result.setLastNameAndForeNames(surname, forenames);

  let fatherName = buildFullName(data, ["Father forename"], ["Father surname"]);
  if (fatherName) {
    let father = result.addFather();
    father.name.name = fatherName;
  }
  let motherName = buildFullName(data, ["Mother forename"], ["Mother surname"]);
  if (motherName) {
    let mother = result.addMother();
    mother.name.name = motherName;
  }
}

function generalizeDataForBurial(data, result) {
  result.recordType = RT.Burial;
  let burialDate = getRecordDataValueForKeys(data, ["Burial date"]);
  result.setEventDate(burialDate);

  let abode = getRecordDataValueForKeys(data, ["Burial person abode"]);
  let placeString = result.eventPlace.placeString;
  if (abode) {
    placeString = abode + ", " + placeString;
  }
  result.setDeathPlace(placeString);

  let age = getRecordDataValueForKeys(data, ["Age", "Burial age"]);
  if (age) {
    result.ageAtEvent = age;
  }

  let forenames = getRecordDataValueForKeys(data, ["Burial person forename"]);
  let surname = getRecordDataValueForKeys(data, ["Burial person surname"]);
  surname = WTS_String.toInitialCapsEachWord(surname, true);
  result.lastNameAtDeath = surname;
  result.setLastNameAndForeNames(surname, forenames);
}

function generalizeDataForMarriage(data, result) {
  result.recordType = RT.Marriage;
  let marriageDate = getRecordDataValueForKeys(data, ["Marriage date"]);
  result.setEventDate(marriageDate);

  let primaryId = data.ambiguousPersonResolvedId;
  if (!primaryId) {
    primaryId = "groom";
  }

  let input = {};
  if (primaryId == "groom") {
    result.setPersonGender("male");

    input.forenames = getRecordDataValueForKeys(data, ["Groom forename"]);
    input.surname = getRecordDataValueForKeys(data, ["Groom surname"]);
    input.age = getRecordDataValueForKeys(data, ["Groom age"]);

    input.spouseForenames = getRecordDataValueForKeys(data, ["Bride forename"]);
    input.spouseSurname = getRecordDataValueForKeys(data, ["Bride surname"]);
    input.spouseAge = getRecordDataValueForKeys(data, ["Bride age"]);
  } else {
    result.setPersonGender("female");

    input.forenames = getRecordDataValueForKeys(data, ["Bride forename"]);
    input.surname = getRecordDataValueForKeys(data, ["Bride surname"]);
    input.age = getRecordDataValueForKeys(data, ["Bride age"]);

    input.spouseForenames = getRecordDataValueForKeys(data, ["Groom forename"]);
    input.spouseSurname = getRecordDataValueForKeys(data, ["Groom surname"]);
    input.spouseAge = getRecordDataValueForKeys(data, ["Groom age"]);
  }
  setMarriageData(data, result, input);
}

function generalizeData(input) {
  //console.log("freereg: generalizeData: input is:");
  //console.log(input);

  let data = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "freereg";

  if (!data.success) {
    return result; //the extract failed
  }

  if (!data.recordData) {
    console.log("freereg: generalizeData: recordData is missing");
    return result; // defensive
  }

  result.sourceType = "record";

  buildEventPlace(data, result);

  switch (data.recordType) {
    case "baptism":
      generalizeDataForBaptism(data, result);
      break;

    case "burial":
      generalizeDataForBurial(data, result);
      break;

    case "marriage":
      generalizeDataForMarriage(data, result);
      break;

    default:
      console.log("unknown record type: " + data.recordType);
      return result;
  }

  result.setPersonGender(getRecordDataValueForKeys(data, ["Person sex"]));

  result.hasValidData = true;

  //console.log("freereg: generalizeData: result is:");
  //console.log(result);

  return result;
}

export { generalizeData, GeneralizedData, dateQualifiers };
