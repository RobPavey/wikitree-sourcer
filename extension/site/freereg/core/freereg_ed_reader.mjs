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

import { RT } from "../../../base/core/record_type.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { ExtractedDataReader } from "../../../base/core/extracted_data_reader.mjs";
import { getCountryFromCountyName } from "../../freecen/core/freecen_chapman_codes.mjs";

const typeData = {
  baptism: {
    recordType: RT.Baptism,
    eventDateKeys: ["Baptism date"],
    birthDateKeys: ["Birth date"],
    lastNameKeys: ["Person surname", "Father surname", "Mother surname"],
    forenamesKeys: ["Person forename"],
    ageAtEventKeys: ["Age", "Baptism age"],
    fatherForenamesKeys: ["Father forename"],
    fatherLastNameKeys: ["Father surname"],
    motherForenamesKeys: ["Mother forename"],
    motherLastNameKeys: ["Mother surname"],
  },
  burial: {
    recordType: RT.Burial,
    eventDateKeys: ["Burial date"],
    lastNameKeys: ["Burial person surname"],
    forenamesKeys: ["Burial person forename"],
    ageAtEventKeys: ["Age", "Burial age"],
  },
  marriage: {
    recordType: RT.Marriage,
    eventDateKeys: ["Marriage date"],
  },
};

function getCountyAndCountry(ed) {
  let result = { county: "", country: "" };

  let county = ed.recordData["County"];
  let country = getCountryFromCountyName(county);

  result.country = country;
  result.county = county;
  return result;
}

class FreeregEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    this.typeData = typeData[ed.recordType];
    this.recordType = this.typeData.recordType;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getSurname() {
    let surname = this.getRecordDataValueForKeys(this.typeData.lastNameKeys);
    return StringUtils.toInitialCapsEachWord(surname, true);
  }

  isGroom() {
    let primaryId = this.ed.ambiguousPersonResolvedId;
    if (!primaryId) {
      primaryId = "groom";
    }

    return primaryId == "groom";
  }

  buildFullName(forenameKeys, surnameKeys) {
    let forename = this.getRecordDataValueForKeys(forenameKeys);
    let surname = this.getRecordDataValueForKeys(surnameKeys);

    surname = StringUtils.toInitialCapsEachWord(surname, true);

    if (forename && surname) {
      return forename + " " + surname;
    } else if (surname) {
      return surname;
    } else if (forename) {
      return forename;
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  hasValidData() {
    if (!this.ed.success) {
      return false; //the extract failed, GeneralizedData is not even normally called in this case
    }

    if (!this.ed.recordData) {
      console.log("freereg: generalizeData: recordData is missing");
      return result; // defensive
    }

    return true;
  }

  getNameObj() {
    if (this.recordType == RT.Marriage) {
      if (this.isGroom()) {
        let forenames = this.getRecordDataValueForKeys(["Groom forename"]);
        let surname = this.getRecordDataValueForKeys(["Groom surname"]);
        surname = StringUtils.toInitialCapsEachWord(surname, true);
        return this.makeNameObjFromForenamesAndLastName(forenames, surname);
      } else {
        let forenames = this.getRecordDataValueForKeys(["Bride forename"]);
        let surname = this.getRecordDataValueForKeys(["Bride surname"]);
        surname = StringUtils.toInitialCapsEachWord(surname, true);
        return this.makeNameObjFromForenamesAndLastName(forenames, surname);
      }
    } else {
      let forenames = this.getRecordDataValueForKeys(this.typeData.forenamesKeys);
      let surname = this.getSurname();
      return this.makeNameObjFromForenamesAndLastName(forenames, surname);
    }
  }

  getGender() {
    if (this.recordType == RT.Marriage) {
      if (this.isGroom()) {
        return "male";
      } else {
        return "female";
      }
    } else {
      return this.getRecordDataValueForKeys(["Person sex"]);
    }
  }

  getEventDateObj() {
    let dateString = this.getRecordDataValueForKeys(this.typeData.eventDateKeys);
    return this.makeDateObjFromDateString(dateString);
  }

  getEventPlaceObj() {
    let countyAndCountry = getCountyAndCountry(this.ed);

    let country = countyAndCountry.country;
    let county = countyAndCountry.county;
    let place = this.getRecordDataValueForKeys(["Place"]);

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

    let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
    return placeObj;
  }

  getLastNameAtBirth() {
    if (this.recordType == RT.Baptism) {
      return this.getSurname();
    }
    return "";
  }

  getLastNameAtDeath() {
    if (this.recordType == RT.Burial) {
      return this.getSurname();
    }
    return "";
  }

  getBirthDateObj() {
    let dateString = this.getRecordDataValueForKeys(this.typeData.birthDateKeys);
    let dateObj = this.makeDateObjFromDateString(dateString);
    return dateObj;
  }

  getBirthPlaceObj() {
    if (this.recordType == RT.Baptism) {
      return this.getEventPlaceObj();
    }
  }

  getDeathPlaceObj() {
    if (this.recordType == RT.Burial) {
      let eventPlaceObj = this.getEventPlaceObj();
      let abode = this.getRecordDataValueForKeys(["Burial person abode"]);
      if (eventPlaceObj) {
        if (eventPlaceObj.placeString) {
          eventPlaceObj.placeString = abode + ", " + eventPlaceObj.placeString;
        } else {
          eventPlaceObj.placeString = abode;
        }
        return eventPlaceObj;
      } else if (abode) {
        return this.makePlaceObjFromFullPlaceName(abode);
      }
    }
  }

  getAgeAtEvent() {
    if (this.recordType == RT.Marriage) {
      if (this.isGroom()) {
        return this.getRecordDataValueForKeys(["Groom age"]);
      } else {
        return this.getRecordDataValueForKeys(["Bride age"]);
      }
    } else {
      return this.getRecordDataValueForKeys(this.typeData.ageAtEventKeys);
    }
  }

  getSpouses() {
    if (this.recordType == RT.Marriage) {
      let eventDateObj = this.getEventDateObj();
      let eventPlaceObj = this.getEventPlaceObj();
      if (this.isGroom()) {
        let forenames = this.getRecordDataValueForKeys(["Bride forename"]);
        let surname = this.getRecordDataValueForKeys(["Bride surname"]);
        surname = StringUtils.toInitialCapsEachWord(surname, true);
        let spouseNameObj = this.makeNameObjFromForenamesAndLastName(forenames, surname);
        let age = this.getRecordDataValueForKeys(["Bride age"]);
        return [this.makeSpouseObj(spouseNameObj, eventDateObj, eventPlaceObj, age)];
      } else {
        let forenames = this.getRecordDataValueForKeys(["Groom forename"]);
        let surname = this.getRecordDataValueForKeys(["Groom surname"]);
        surname = StringUtils.toInitialCapsEachWord(surname, true);
        let spouseNameObj = this.makeNameObjFromForenamesAndLastName(forenames, surname);
        let age = this.getRecordDataValueForKeys(["Groom age"]);
        return [this.makeSpouseObj(spouseNameObj, eventDateObj, eventPlaceObj, age)];
      }
    }
  }

  getParents() {
    let fatherName = this.buildFullName(this.typeData.fatherForenamesKeys, this.typeData.fatherLastNameKeys);
    let motherName = this.buildFullName(this.typeData.motherForenamesKeys, this.typeData.motherLastNameKeys);

    return this.makeParentsFromFullNames(fatherName, motherName);
  }
}

export { FreeregEdReader };
