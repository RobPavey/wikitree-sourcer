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

import { RT, Role, RecordSubtype } from "./record_type.mjs";

function getChildTerm(gender) {
  if (!gender) {
    return "child";
  } else if (gender == "male") {
    return "son";
  } else if (gender == "female") {
    return "daughter";
  }
}

function getPrimaryPersonChildTerm(gd) {
  let childGender = "";
  if (gd.primaryPerson) {
    childGender = gd.primaryPerson.gender;
  }
  return getChildTerm(childGender);
}

function getParentTerm(gender) {
  if (!gender) {
    return "parent";
  } else if (gender == "male") {
    return "father";
  } else if (gender == "female") {
    return "mother";
  }
}

function getPrimaryPersonParentTerm(gd) {
  let parentGender = "";
  if (gd.primaryPerson) {
    parentGender = gd.primaryPerson.gender;
  }
  return getParentTerm(parentGender);
}

function getSpouseTerm(gender) {
  if (!gender) {
    return "spouse";
  } else if (gender == "male") {
    return "husband";
  } else if (gender == "female") {
    return "wife";
  }
}

function getPrimaryPersonSpouseTerm(gd) {
  let spouseGender = "";
  if (gd.primaryPerson) {
    spouseGender = gd.primaryPerson.gender;
  }
  return getSpouseTerm(spouseGender);
}

function getPrimaryPersonTermAndName(gd) {
  let string = gd.getRelationshipOfPrimaryPersonToThisPerson();

  let primaryPersonName = gd.inferPrimaryPersonFullName();
  if (primaryPersonName) {
    string += " " + primaryPersonName;
  }

  return string;
}

function isRegistrationEventDateTheRegistrationDate(gd) {
  let eventDateObj = gd.inferEventDateObj();
  if (eventDateObj) {
    if (eventDateObj.isRegistrationDate !== undefined) {
      return eventDateObj.isRegistrationDate;
    }
  }

  let quarter = gd.inferEventQuarter();

  let year = gd.inferEventYear();
  let dateString = gd.inferEventDate();
  let registrationDistrict = gd.registrationDistrict;
  let eventPlaceObj = gd.inferEventPlaceObj();

  // Note - we may need a better way to distinguish between the date being the birth/marriage/death date and
  // it being the registration date/quarter.
  // It might require either a separate record type or a flag in the GD
  let isDateTheRegistrationDate = false;
  if (registrationDistrict && (gd.isRecordInCountry("United Kingdom") || !eventPlaceObj)) {
    isDateTheRegistrationDate = true;
  } else if ((quarter || year == dateString) && year) {
    isDateTheRegistrationDate = true;
  } else if (dateString) {
    // there could be two different dates, e.g. one for birth and one for registration
    if (gd.recordType == RT.BirthRegistration) {
      let birthDateString = gd.inferBirthDate();
      if (gd.role && gd.role != Role.Primary) {
        if (gd.primaryPerson && gd.primaryPerson.birthDate) {
          birthDateString = gd.primaryPerson.birthDate.getDateString();
        }
      }
      if (birthDateString != dateString) {
        isDateTheRegistrationDate = true;
      }
    } else if (gd.recordType == RT.DeathRegistration) {
      let deathDateString = gd.inferDeathDate();
      if (gd.role && gd.role != Role.Primary) {
        if (gd.primaryPerson && gd.primaryPerson.deathDate) {
          deathDateString = gd.primaryPerson.deathDate.getDateString();
        }
      }
      if (deathDateString != dateString) {
        isDateTheRegistrationDate = true;
      }
    }
  }

  return isDateTheRegistrationDate;
}

export {
  getChildTerm,
  getPrimaryPersonChildTerm,
  getParentTerm,
  getPrimaryPersonParentTerm,
  getSpouseTerm,
  getPrimaryPersonSpouseTerm,
  getPrimaryPersonTermAndName,
  isRegistrationEventDateTheRegistrationDate,
};
