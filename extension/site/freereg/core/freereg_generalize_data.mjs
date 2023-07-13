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

import { GeneralizedData, GD, dateQualifiers, NameObj } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { getCountryFromCountyName } from "../../freecen/core/freecen_chapman_codes.mjs";

function getCountyAndCountry(ed) {
  let result = { county: "", country: "" };

  let county = ed.recordData["County"];
  let country = getCountryFromCountyName(county);

  result.country = country;
  result.county = county;
  return result;
}

function getRecordDataValueForKeys(ed, keys) {
  for (let key of keys) {
    let value = ed.recordData[key];
    if (value) {
      return value;
    }
  }
}

function buildEventPlace(ed, result) {
  let countyAndCountry = getCountyAndCountry(ed);

  let country = countyAndCountry.country;
  let county = countyAndCountry.county;
  let place = getRecordDataValueForKeys(ed, ["Place"]);

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

function buildFullName(ed, forenameKeys, surnameKeys) {
  let forename = getRecordDataValueForKeys(ed, forenameKeys);
  let surname = getRecordDataValueForKeys(ed, surnameKeys);

  surname = StringUtils.toInitialCapsEachWord(surname, true);

  if (forename && surname) {
    return forename + " " + surname;
  } else if (surname) {
    return surname;
  } else if (forename) {
    return forename;
  }
}

function setMarriageData(ed, result, input) {
  let surname = StringUtils.toInitialCapsEachWord(input.surname, true);
  result.setLastNameAndForenames(surname, input.forenames);
  result.setFieldIfValueExists("ageAtEvent", input.age);

  let spouseSurname = StringUtils.toInitialCapsEachWord(input.spouseSurname, true);
  let spouseName = new NameObj();
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

function generalizeDataForBaptism(ed, result) {
  result.recordType = RT.Baptism;
  let baptismDate = getRecordDataValueForKeys(ed, ["Baptism date"]);
  result.setEventDate(baptismDate);
  let birthDate = getRecordDataValueForKeys(ed, ["Birth date"]);
  result.setBirthDate(birthDate);
  // does a baptism record ever have a death date?

  result.setBirthPlace(result.eventPlace.placeString);

  let age = getRecordDataValueForKeys(ed, ["Age", "Baptism age"]);
  if (age) {
    result.ageAtEvent = age;
  }

  let forenames = getRecordDataValueForKeys(ed, ["Person forename"]);
  let surname = getRecordDataValueForKeys(ed, ["Person surname", "Father surname", "Mother surname"]);
  surname = StringUtils.toInitialCapsEachWord(surname, true);
  result.lastNameAtBirth = surname;
  result.setLastNameAndForenames(surname, forenames);

  let fatherName = buildFullName(ed, ["Father forename"], ["Father surname"]);
  if (fatherName) {
    let father = result.addFather();
    father.name.name = fatherName;
  }
  let motherName = buildFullName(ed, ["Mother forename"], ["Mother surname"]);
  if (motherName) {
    let mother = result.addMother();
    mother.name.name = motherName;
  }
}

function generalizeDataForBurial(ed, result) {
  result.recordType = RT.Burial;
  let burialDate = getRecordDataValueForKeys(ed, ["Burial date"]);
  result.setEventDate(burialDate);

  let abode = getRecordDataValueForKeys(ed, ["Burial person abode"]);
  let placeString = result.eventPlace.placeString;
  if (abode) {
    placeString = abode + ", " + placeString;
  }
  result.setDeathPlace(placeString);

  let age = getRecordDataValueForKeys(ed, ["Age", "Burial age"]);
  if (age) {
    result.ageAtEvent = age;
  }

  let forenames = getRecordDataValueForKeys(ed, ["Burial person forename"]);
  let surname = getRecordDataValueForKeys(ed, ["Burial person surname"]);
  surname = StringUtils.toInitialCapsEachWord(surname, true);
  result.lastNameAtDeath = surname;
  result.setLastNameAndForenames(surname, forenames);
}

function generalizeDataForMarriage(ed, result) {
  result.recordType = RT.Marriage;
  let marriageDate = getRecordDataValueForKeys(ed, ["Marriage date"]);
  result.setEventDate(marriageDate);

  let primaryId = ed.ambiguousPersonResolvedId;
  if (!primaryId) {
    primaryId = "groom";
  }

  let input = {};
  if (primaryId == "groom") {
    result.setPersonGender("male");

    input.forenames = getRecordDataValueForKeys(ed, ["Groom forename"]);
    input.surname = getRecordDataValueForKeys(ed, ["Groom surname"]);
    input.age = getRecordDataValueForKeys(ed, ["Groom age"]);

    input.spouseForenames = getRecordDataValueForKeys(ed, ["Bride forename"]);
    input.spouseSurname = getRecordDataValueForKeys(ed, ["Bride surname"]);
    input.spouseAge = getRecordDataValueForKeys(ed, ["Bride age"]);
  } else {
    result.setPersonGender("female");

    input.forenames = getRecordDataValueForKeys(ed, ["Bride forename"]);
    input.surname = getRecordDataValueForKeys(ed, ["Bride surname"]);
    input.age = getRecordDataValueForKeys(ed, ["Bride age"]);

    input.spouseForenames = getRecordDataValueForKeys(ed, ["Groom forename"]);
    input.spouseSurname = getRecordDataValueForKeys(ed, ["Groom surname"]);
    input.spouseAge = getRecordDataValueForKeys(ed, ["Groom age"]);
  }
  setMarriageData(ed, result, input);
}

function generalizeData(input) {
  //console.log("freereg: generalizeData: input is:");
  //console.log(input);

  let ed = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "freereg";

  if (!ed.success) {
    return result; //the extract failed
  }

  if (!ed.recordData) {
    console.log("freereg: generalizeData: recordData is missing");
    return result; // defensive
  }

  result.sourceType = "record";

  buildEventPlace(ed, result);

  switch (ed.recordType) {
    case "baptism":
      generalizeDataForBaptism(ed, result);
      break;

    case "burial":
      generalizeDataForBurial(ed, result);
      break;

    case "marriage":
      generalizeDataForMarriage(ed, result);
      break;

    default:
      console.log("unknown record type: " + ed.recordType);
      return result;
  }

  result.setPersonGender(getRecordDataValueForKeys(ed, ["Person sex"]));

  result.hasValidData = true;

  //console.log("freereg: generalizeData: result is:");
  //console.log(result);

  return result;
}

export { generalizeData, GeneralizedData, dateQualifiers };
