/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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

// The Digital Archives has many different record series with different fields.
// Only the series that we know the fields for are listed here.
const recordSeriesData = {
  "Birth Records": {
    recordType: RT.Birth,
    forenamesKeys: ["Child's First Name", "Child's Middle Name"],
    lastNameKeys: ["Child's Last Name"],
    genderKeys: ["Child's Gender"],
    eventDateKeys: ["Birth Date"],
    fatherForenamesKeys: ["Father's First Name", "Father's Middle Name"],
    fatherLastNameKeys: ["Father's Last Name"],
    motherForenamesKeys: ["Mother's First Name", "Mother's Middle Name"],
    motherLastNameKeys: ["Mother's Maiden Name"],
  },
  "Marriage Records": {
    recordType: RT.Marriage,
    eventDateKeys: ["Marriage Date"],
  },
  "Divorce Records": {
    recordType: RT.Divorce,
    eventDateKeys: ["Decreedate"],
    eventPlaceKeys: ["Cnty-Of-Decree"],
    spouseA: {
      forenamesKeys: ["Spouseafirstname", "Spouseamiddlename"],
      lastNameKeys: ["Spousealegallastname", "Spouseabirthlastname"],
      birthLastNameKeys: ["Spouseabirthlastname"],
    },
    spouseB: {
      forenamesKeys: ["Spousebfirstname", "Spousebmiddlename"],
      lastNameKeys: ["Spouseblegallastname", "Spousebbirthlastname"],
      birthLastNameKeys: ["Spousebbirthlastname"],
    },
  },
  "Death Records": {
    recordType: RT.Death,
    forenamesKeys: ["First Name", "Middle Name"],
    lastNameKeys: ["Last Name"],
    genderKeys: ["Sex"],
    eventDateKeys: ["Death Date"],
    eventPlaceKeys: ["Death Location"],
    ageKeys: ["Age-Primary"],
  },
};

// Names are sometimes in all caps in the index
function fixNameCase(name) {
  if (name && name.length > 1 && name == name.toUpperCase()) {
    return StringUtils.toInitialCapsEachWord(name, true);
  }
  return name;
}

function countyToPlaceString(county) {
  if (!county) {
    return "";
  }
  let placeString = "";
  if (county.toLowerCase() != "statewide") {
    placeString = /county$/i.test(county) ? county : county + " County";
    placeString += ", ";
  }
  return placeString + "Washington, United States";
}

class WadigarchEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    this.typeData = recordSeriesData[ed.recordSeries];
    if (this.typeData) {
      this.recordType = this.typeData.recordType;
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getNamePartsValue(keys) {
    let parts = [];
    for (let key of keys) {
      let value = this.getRecordDataValue(key);
      if (value) {
        parts.push(fixNameCase(value));
      }
    }
    return parts.join(" ");
  }

  // for divorces: the person data for the primary person and the other person
  getDivorcePersonData(wantPrimary) {
    let primaryId = this.ed.ambiguousPersonResolvedId;
    let primaryIsA = !primaryId || primaryId == "spouseA";
    return primaryIsA == wantPrimary ? this.typeData.spouseA : this.typeData.spouseB;
  }

  getDivorceName(personData) {
    let forenames = this.getNamePartsValue(personData.forenamesKeys);
    // the legal last name comes first in the keys. If it is empty the birth last name is used.
    let lastName = fixNameCase(this.getRecordDataValueForKeys(personData.lastNameKeys));
    return this.makeNameObjFromForenamesAndLastName(forenames, lastName);
  }

  isGroom() {
    let primaryId = this.ed.ambiguousPersonResolvedId;
    if (!primaryId) {
      primaryId = "groom";
    }
    return primaryId == "groom";
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  hasValidData() {
    if (!this.ed.success || !this.ed.recordData) {
      return false;
    }

    // other record series are not supported (yet)
    if (!this.typeData) {
      return false;
    }

    if (this.recordType == RT.Divorce) {
      let nameObj = this.getDivorceName(this.getDivorcePersonData(true));
      return nameObj != undefined && nameObj.inferFullName() != "";
    }
    return true;
  }

  getNameObj() {
    if (this.recordType == RT.Divorce) {
      return this.getDivorceName(this.getDivorcePersonData(true));
    }

    if (this.recordType == RT.Marriage) {
      let key = this.isGroom() ? "Groom's Name" : "Bride's Name";
      let fullName = this.getRecordDataValue(key);
      return this.makeNameObjFromFullName(fixNameCase(fullName));
    }

    let forenames = this.getNamePartsValue(this.typeData.forenamesKeys);
    let lastName = this.getNamePartsValue(this.typeData.lastNameKeys);
    return this.makeNameObjFromForenamesAndLastName(forenames, lastName);
  }

  getGender() {
    if (this.recordType == RT.Marriage) {
      return this.isGroom() ? "male" : "female";
    }
    if (!this.typeData.genderKeys) {
      return "";
    }
    let genderString = this.getRecordDataValueForKeys(this.typeData.genderKeys);
    return this.getGenderFromString(genderString, ["male", "m"], ["female", "f"], true);
  }

  getEventDateObj() {
    // dates are m/d/yyyy, in the DoH divorce index they have no leading zeros
    let dateString = this.getRecordDataValueForKeys(this.typeData.eventDateKeys);
    return this.makeDateObjFromMmddyyyyDate(dateString, "/");
  }

  getEventPlaceObj() {
    // for births and marriages the county is the county of the auditor that recorded the event
    let placeString = "";
    if (this.typeData.eventPlaceKeys) {
      placeString = countyToPlaceString(this.getRecordDataValueForKeys(this.typeData.eventPlaceKeys));
    } else {
      placeString = countyToPlaceString(this.ed.county);
    }
    return this.makePlaceObjFromFullPlaceName(placeString);
  }

  getLastNameAtBirth() {
    if (this.recordType == RT.Divorce) {
      return fixNameCase(this.getRecordDataValueForKeys(this.getDivorcePersonData(true).birthLastNameKeys));
    }

    if (this.recordType == RT.Birth) {
      return this.getNamePartsValue(this.typeData.lastNameKeys);
    }
    return "";
  }

  getMothersMaidenName() {
    if (this.recordType == RT.Birth) {
      return fixNameCase(this.getRecordDataValueForKeys(this.typeData.motherLastNameKeys));
    }
    return "";
  }

  getBirthDateObj() {
    if (this.recordType == RT.Birth) {
      return this.getEventDateObj();
    }
    return undefined;
  }

  getBirthPlaceObj() {
    if (this.recordType == RT.Birth) {
      return this.getEventPlaceObj();
    }
    return undefined;
  }

  getDeathDateObj() {
    if (this.recordType == RT.Death) {
      return this.getEventDateObj();
    }
    return undefined;
  }

  getDeathPlaceObj() {
    if (this.recordType == RT.Death) {
      return this.getEventPlaceObj();
    }
    return undefined;
  }

  getAgeAtDeath() {
    if (this.recordType == RT.Death) {
      return this.getRecordDataValueForKeys(this.typeData.ageKeys);
    }
    return "";
  }

  getSpouses() {
    if (this.recordType == RT.Divorce) {
      let spouseNameObj = this.getDivorceName(this.getDivorcePersonData(false));
      if (spouseNameObj && spouseNameObj.inferFullName()) {
        return [this.makeSpouseObj(spouseNameObj)];
      }
      return undefined;
    }

    if (this.recordType == RT.Marriage) {
      let key = this.isGroom() ? "Bride's Name" : "Groom's Name";
      let spouseName = fixNameCase(this.getRecordDataValue(key));
      if (spouseName) {
        let spouseNameObj = this.makeNameObjFromFullName(spouseName);
        return [this.makeSpouseObj(spouseNameObj, this.getEventDateObj(), this.getEventPlaceObj())];
      }
    }
    return undefined;
  }

  getParents() {
    if (this.recordType == RT.Birth) {
      let td = this.typeData;
      return this.makeParentsFromForenamesAndLastNames(
        this.getNamePartsValue(td.fatherForenamesKeys),
        this.getNamePartsValue(td.fatherLastNameKeys),
        this.getNamePartsValue(td.motherForenamesKeys),
        this.getNamePartsValue(td.motherLastNameKeys)
      );
    }
    return undefined;
  }
}

export { WadigarchEdReader };
