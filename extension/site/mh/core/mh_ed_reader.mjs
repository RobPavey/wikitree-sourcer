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
import { ExtractedDataReader } from "../../../base/core/extracted_data_reader.mjs";
import { GD } from "../../../base/core/generalize_data_utils.mjs";

const recordTypeData = [
  // put ones with Document type first
  {
    recordType: RT.Immigration,
    documentTypes: ["Immigrant Record"],
  },
  {
    recordType: RT.Divorce,
    documentTypes: ["Divorce"],
  },

  // collection matches
  {
    recordType: RT.Baptism,
    collectionTitleMatches: [["Births and Christenings"]],
    requiredFields: [["Christening"], ["Baptism"]],
  },
  {
    recordType: RT.Census,
    collectionTitleMatches: [["Census"]],
    requiredRecordSections: [["Census"]],
  },
  {
    recordType: RT.MarriageRegistration,
    collectionTitleMatches: [["England & Wales, Marriage Index, 1837-2005"]],
  },
  {
    recordType: RT.Directory,
    collectionTitleMatches: [["Business Register"], ["U.S. Public Records Index"], ["Phone and Address Listings"]],
  },
  {
    recordType: RT.SocialSecurity,
    collectionTitleMatches: [["Social Security Applications and Claims"]],
  },
  {
    recordType: RT.Employment,
    collectionTitleMatches: [["Medicare Public Provider"], ["Attorney Registrations"], ["Job Applications"]],
  },
  {
    recordType: RT.FamHistOrPedigree,
    collectionTitleMatches: [["Biographies"], ["Genealogy of the"], "Personal Reminiscences of"],
  },

  // matches using required fields only
  {
    recordType: RT.Marriage,
    requiredFields: [["Marriage date", "Marriage place"], ["Marriage"]],
  },
];

const typeDataEventLabels = {
  Baptism: ["Christening", "Baptism"],
  Immigration: ["Arrival"],
  Census: ["Residence"],
  Marriage: ["Marriage"],
  Divorce: ["Divorce"],
};

const typeDataEventDateLabels = {
  Directory: ["ABN last updated", "ABN status date"],
  Marriage: ["Marriage date"],
  MarriageRegistration: ["Marriage date"],
};

const typeDataEventPlaceLabels = {
  Directory: ["Residence"],
  Marriage: ["Marriage place"],
  MarriageRegistration: ["Marriage place"],
};

class MhEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
    if (ed.recordData) {
      this.determineSourceTypeAndRecordType();

      this.setupCoupleData();
    }
  }

  determineSourceTypeAndRecordType() {
    let ed = this.ed;

    if (ed.pageType == "person") {
      this.sourceType = "profile";
    } else if (ed.pageType == "record") {
      this.sourceType = "record";

      for (let typeData of recordTypeData) {
        if (typeData.documentTypes) {
          let docType = this.getSimpleRecordDataValueString("Document type");
          if (docType) {
            let docTypesMatch = false;
            for (let typeDataDocType of typeData.documentTypes) {
              if (typeDataDocType == docType) {
                docTypesMatch = true;
                break;
              }
            }
            if (!docTypesMatch) {
              continue;
            }
          } else {
            continue;
          }
        }

        if (typeData.collectionTitleMatches) {
          let title = ed.collectionTitle;
          if (!title) {
            continue;
          }

          let collectionTitlesMatch = false;
          for (let typeDataTitleParts of typeData.collectionTitleMatches) {
            let partsMatch = true;
            for (let part of typeDataTitleParts) {
              if (!title.includes(part)) {
                partsMatch = false;
                break;
              }
            }
            if (partsMatch) {
              collectionTitlesMatch = true;
              break;
            }
          }

          if (!collectionTitlesMatch) {
            continue;
          }
        }

        if (typeData.requiredRecordSections) {
          if (!ed.recordSections) {
            continue;
          }

          let requiredSectionsPresent = false;
          for (let requiredSectionSet of typeData.requiredRecordSections) {
            let sectionsPresent = true;
            for (let section of requiredSectionSet) {
              if (!ed.recordSections[section]) {
                sectionsPresent = false;
              }
            }
            if (sectionsPresent) {
              requiredSectionsPresent = true;
              break;
            }
          }
          if (!requiredSectionsPresent) {
            continue;
          }
        }

        if (typeData.requiredFields) {
          if (!ed.recordData) {
            continue;
          }

          let requiredFieldsPresent = false;
          for (let requiredFieldSet of typeData.requiredFields) {
            let fieldsPresent = true;
            for (let field of requiredFieldSet) {
              if (!this.findRecordDataFieldByLabel(field)) {
                fieldsPresent = false;
              }
            }
            if (fieldsPresent) {
              requiredFieldsPresent = true;
              break;
            }
          }
          if (!requiredFieldsPresent) {
            continue;
          }
        }

        // if we get this far it is a match
        this.recordType = typeData.recordType;
        break;
      }
    }
  }

  findRecordDataFieldByLabel(label) {
    for (let field of Object.values(this.ed.recordData)) {
      if (field.label == label) {
        return field;
      }
    }
  }

  findRecordDataFieldByLabels(labels) {
    if (labels && this.ed.recordData) {
      for (let field of Object.values(this.ed.recordData)) {
        if (labels.includes(field.label)) {
          return field;
        }
      }
    }
  }

  findRecordDataFieldByKeysOrLabels(keys, labels) {
    if (keys && this.ed.recordData) {
      for (let key of Object.keys(this.ed.recordData)) {
        if (keys.includes(key)) {
          return this.ed.recordData[key];
        }
      }
    }

    if (labels && this.ed.recordData) {
      for (let field of Object.values(this.ed.recordData)) {
        if (labels.includes(field.label)) {
          return field;
        }
      }
    }
  }

  getRecordDataValue(labels) {
    let valueObj = this.findRecordDataFieldByLabels(labels);
    if (valueObj) {
      return valueObj;
    }
  }

  getRecordDataValueByKeysOrLabels(keys, labels) {
    let valueObj = this.findRecordDataFieldByKeysOrLabels(keys, labels);
    if (valueObj) {
      return valueObj;
    }
  }

  getRecordDataValueString(labels) {
    let value = this.getRecordDataValue(labels);
    if (value && value.value) {
      return value.value;
    }
  }

  getSimpleRecordDataValueString(label) {
    let valueObj = this.findRecordDataFieldByLabel(label);
    if (valueObj) {
      return valueObj.value;
    }
  }

  getEventDataValue() {
    if (this.recordType) {
      let labels = typeDataEventLabels[this.recordType];
      return this.getRecordDataValue(labels);
    }
  }

  getEventDateValue() {
    if (this.recordType) {
      let labels = typeDataEventDateLabels[this.recordType];
      return this.getRecordDataValue(labels);
    }
  }

  getEventPlaceValue() {
    if (this.recordType) {
      let labels = typeDataEventPlaceLabels[this.recordType];
      return this.getRecordDataValue(labels);
    }
  }

  getBirthDataValue() {
    const labels = ["Birth"];
    return this.getRecordDataValue(labels);
  }

  getDeathDataValue() {
    const labels = ["Death"];
    return this.getRecordDataValue(labels);
  }

  cleanMhDate(dateString) {
    if (!dateString) {
      return "";
    }

    dateString = dateString.trim();

    if (/^\d\d\d\d$/.test(dateString)) {
      return dateString;
    } else if (/^Circa \d\d\d\d$/.test(dateString)) {
      // The "Circa " gets handled in DateObj
      return dateString;
    } else if (/^[A-Z][a-z][a-z]\-[A-Z][a-z][a-z]\-[A-Z][a-z][a-z]\s+\d\d\d\d$/.test(dateString)) {
      return dateString;
    } else if (/^[A-Z][a-z][a-z][a-z]*\-[A-Z][a-z][a-z][a-z]*\-[A-Z][a-z][a-z][a-z]*\s+\d\d\d\d$/.test(dateString)) {
      // e.g. July-Aug-Sep 1914
      let newString = dateString.replace(
        /([A-Z][a-z][a-z])[a-z]*\-([A-Z][a-z][a-z])[a-z]*\-([A-Z][a-z][a-z])[a-z]*\s+(\d\d\d\d)/,
        "$1-$2-$3 $4"
      );
      if (newString) {
        return newString;
      }
      return dateString;
    } else if (dateString.startsWith("Between")) {
    } else if (/^[A-Z-a-z][a-z][a-z]\s+\d\d?\s+\d\d\d\d$/.test(dateString)) {
      // e.g. Aug 22 1822
      let newString = dateString.replace(/([A-Z-a-z][a-z][a-z])\s+(\d\d?)\s+(\d\d\d\d)/, "$2 $1 $3");
      if (newString) {
        return newString;
      }
    }
  }

  cleanMhRelationship(string) {
    if (string) {
      // is it right to remove the "implied" from the relationship?
      // What if it is incorrect?
      const impliedSuffix = " (implied)";
      if (string.endsWith(impliedSuffix)) {
        string = string.substring(0, string.length - impliedSuffix.length);
      }
    }
    return string;
  }

  setupCoupleData() {
    // if this record is actually for two people then get their details and decide which is primary
    let titleString = this.ed.recordTitle;
    if (!titleString.includes(" & ")) {
      return;
    }

    let ampIndex = titleString.indexOf(" & ");
    if (ampIndex == -1) {
      return;
    }

    function buildPersonData(mainValue, maritalStatusValue, ageValue, birthDateValue) {
      let person = {};

      if (mainValue) {
        if (mainValue.value) {
          person.name = mainValue.value;
        } else if (mainValue["Name"]) {
          person.name = mainValue["Name"];
        }

        if (mainValue["Residence"]) {
          person.residence = mainValue["Residence"];
        }
      }

      if (maritalStatusValue) {
        if (maritalStatusValue.value) {
          person.maritalStatus = maritalStatusValue.value;
        }
      }

      if (ageValue) {
        if (ageValue.value) {
          person.age = ageValue.value;
        }
      }

      if (!person.age && birthDateValue) {
        if (birthDateValue.value) {
          person.birthDateString = birthDateValue.value;
        } else if (birthDateValue.dateString) {
          person.birthDateString = birthDateValue.dateString;
        }
      }

      return person;
    }

    let coupleData = {};

    let primaryNameString = titleString.substring(0, ampIndex).trim();

    coupleData.primaryNameString = primaryNameString;

    let husbandMainValue = this.getRecordDataValueByKeysOrLabels(
      ["person-canonical-events.name-as-groom", "husband-name"],
      ["Groom", "Husband"]
    );
    let husbandMaritalStatusValue = this.getRecordDataValue(["Groom marital status"]);
    let husbandAgeValue = this.getRecordDataValueByKeysOrLabels(["husband-age"], []);
    let husbandBirthDateValue = this.getRecordDataValueByKeysOrLabels(["husband-birth"], []);

    let wifeMainValue = this.getRecordDataValueByKeysOrLabels(
      ["person-canonical-events.name-as-bride", "wife-name"],
      ["Bride", "Wife"]
    );
    let wifeMaritalStatusValue = this.getRecordDataValue(["Bride marital status"]);
    let wifeAgeValue = this.getRecordDataValueByKeysOrLabels(["wife-age"], []);
    let wifeBirthDateValue = this.getRecordDataValueByKeysOrLabels(["wife-birth"], []);

    coupleData.husband = buildPersonData(
      husbandMainValue,
      husbandMaritalStatusValue,
      husbandAgeValue,
      husbandBirthDateValue
    );
    coupleData.wife = buildPersonData(wifeMainValue, wifeMaritalStatusValue, wifeAgeValue, wifeBirthDateValue);

    if (coupleData.husband.name == primaryNameString) {
      coupleData.primaryPerson = coupleData.husband;
      coupleData.spouse = coupleData.wife;
    } else if (coupleData.wife.name == primaryNameString) {
      coupleData.primaryPerson = coupleData.wife;
      coupleData.spouse = coupleData.husband;
    }

    this.coupleData = coupleData;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  hasValidData() {
    if (!this.ed.success) {
      return false; //the extract failed, GeneralizedData is not even normally called in this case
    }

    if (!this.ed.recordData) {
      return false;
    }

    return true;
  }

  getSourceType() {
    return this.sourceType;
  }

  getNameObj() {
    let nameString = this.getSimpleRecordDataValueString("Name");

    if (!nameString) {
      nameString = this.ed.recordTitle;
    }

    if (this.coupleData) {
      if (this.coupleData.primaryPerson && this.coupleData.primaryPerson.name) {
        nameString = this.coupleData.primaryPerson.name;
      }
    }

    if (nameString.includes("(born ")) {
      // this person's name is a married name plus the maiden name
      // we really want the name at birth. However we don't know how much of the
      // name before the "(born " is the married last name (it could have spaces in it)
    }

    return this.makeNameObjFromFullName(nameString);
  }

  getGender() {
    if (this.ed.personGender) {
      return this.ed.personGender;
    }

    let gender = this.getSimpleRecordDataValueString("Gender");
    if (gender) {
      return gender.toLowerCase();
    }

    return "";
  }

  getEventDateObj() {
    let dateString = "";
    let valueObj = this.getEventDataValue();
    if (valueObj && valueObj.dateString) {
      dateString = valueObj.dateString;
    }

    if (!dateString) {
      valueObj = this.getEventDateValue();
      if (valueObj && valueObj.value) {
        dateString = valueObj.value;
      }
    }

    if (dateString) {
      return this.makeDateObjFromDateString(this.cleanMhDate(dateString));
    }

    return undefined;
  }

  getEventPlaceObj() {
    let placeString = "";

    let valueObj = this.getEventDataValue();
    if (valueObj && valueObj.placeString) {
      placeString = valueObj.placeString;
    }

    if (!placeString) {
      valueObj = this.getEventPlaceValue();
      if (valueObj && valueObj.placeString) {
        placeString = valueObj.placeString;
      }
    }

    if (placeString) {
      return this.makePlaceObjFromFullPlaceName(placeString);
    }

    return undefined;
  }

  getLastNameAtBirth() {
    return "";
  }

  getLastNameAtDeath() {
    return "";
  }

  getMothersMaidenName() {
    return "";
  }

  getBirthDateObj() {
    // if this is a divorce or possibly marriage it could have the birth date of both people
    // which one to use depends on which person is primary

    let valueObj = this.getBirthDataValue();
    if (valueObj && valueObj.dateString) {
      return this.makeDateObjFromDateString(this.cleanMhDate(valueObj.dateString));
    }

    return undefined;
  }

  getBirthPlaceObj() {
    let valueObj = this.getBirthDataValue();
    if (valueObj && valueObj.placeString) {
      return this.makePlaceObjFromFullPlaceName(valueObj.placeString);
    }

    return undefined;
  }

  getDeathDateObj() {
    let valueObj = this.getDeathDataValue();
    if (valueObj && valueObj.dateString) {
      return this.makeDateObjFromDateString(this.cleanMhDate(valueObj.dateString));
    }

    return undefined;
  }

  getDeathPlaceObj() {
    let valueObj = this.getDeathDataValue();
    if (valueObj && valueObj.placeString) {
      return this.makePlaceObjFromFullPlaceName(valueObj.placeString);
    }

    return undefined;
  }

  getAgeAtEvent() {
    if (this.coupleData && this.coupleData.primaryPerson) {
      if (this.coupleData.primaryPerson.age) {
        return this.coupleData.primaryPerson.age;
      }
    }
    return "";
  }

  getAgeAtDeath() {
    return "";
  }

  getRegistrationDistrict() {
    return "";
  }

  getRelationshipToHead() {
    if (this.ed.household) {
      const household = this.ed.household;
      if (household.headings.includes("Relation to head")) {
        for (let member of household.members) {
          if (member.isSelected) {
            return this.cleanMhRelationship(member["Relation to head"]);
          }
        }
      }
    }
    return "";
  }

  getMaritalStatus() {
    return this.getRecordDataValueString(["Marital status"]);
  }

  getOccupation() {
    return this.getRecordDataValueString(["Occupation"]);
  }

  getSpouseObj(eventDateObj, eventPlaceObj) {
    // Note that the calling function will automatically try to determine spouse for census
    if (this.recordType != RT.Census) {
      let spouseName = this.getRecordDataValueString(["Spouse", "Spouse (implied)"]);

      if (!spouseName && this.coupleData) {
        if (this.coupleData.spouse && this.coupleData.spouse.name) {
          spouseName = this.coupleData.spouse.name;
        }
      }

      if (spouseName) {
        let spouseNameObj = this.makeNameObjFromFullName(spouseName);
        if (spouseNameObj) {
          let spouse = { name: spouseNameObj };
          if (this.recordType == RT.Marriage || this.recordType == RT.MarriageRegistration) {
            let marriageDateObj = this.getEventDateObj();
            if (marriageDateObj) {
              spouse.marriageDate = marriageDateObj;
            }
            let marriagePlaceObj = this.getEventPlaceObj();
            if (marriagePlaceObj) {
              spouse.marriagePlace = marriagePlaceObj;
            }
          } else if (this.recordType == RT.Divorce) {
            // there may be a marriage date
            let marriageValue = this.getRecordDataValue(["Marriage"]);
            if (marriageValue) {
              if (marriageValue.dateString) {
                spouse.marriageDate = this.makeDateObjFromDateString(this.cleanMhDate(marriageValue.dateString));
              }
              if (marriageValue.placeString) {
                spouse.marriagePlace = this.makePlaceObjFromFullPlaceName(marriageValue.placeString);
              }
            }
          }

          if (this.coupleData) {
            let spouseData = this.coupleData.spouse;
            if (spouseData) {
              if (spouseData.age) {
                spouse.age = spouseData.age;
              }
            }
          }

          return spouse;
        }
      }
    }
    return undefined;
  }

  getParents() {
    // Note that the calling function will automatically try to determine parents for census
    if (this.recordType != RT.Census) {
      let fatherValue = this.getRecordDataValue(["Father"]);
      let motherValue = this.getRecordDataValue(["Mother"]);
      if (fatherValue || motherValue) {
        let parents = {};
        if (fatherValue) {
          let fatherName = fatherValue.value;
          if (fatherName) {
            let fatherNameObj = this.makeNameObjFromFullName(fatherName);
            if (fatherNameObj) {
              parents.father = { name: fatherNameObj };
            }
          }
        }
        if (motherValue) {
          let motherName = motherValue.value;
          if (motherName) {
            let motherNameObj = this.makeNameObjFromFullName(motherName);
            if (motherNameObj) {
              parents.mother = { name: motherNameObj };
            }
          }
        }
        return parents;
      }
    }

    return undefined;
  }

  getHousehold() {
    const ed = this.ed;
    const household = ed.household;
    if (!household) {
      return undefined;
    }

    const stdFieldNames = [
      { stdName: "name", siteHeadings: ["Name"] },
      { stdName: "age", siteHeadings: ["Age"] },
      { stdName: "relationship", siteHeadings: ["Relation to head"] },
    ];
    function headingToStdName(heading) {
      for (let entry of stdFieldNames) {
        if (entry.siteHeadings.includes(heading)) {
          return entry.stdName;
        }
      }
    }

    let headings = household.headings;
    let members = household.members;
    if (headings && members) {
      let householdArray = [];
      for (let member of members) {
        let householdMember = {};
        if (member.isClosed) {
          householdMember.isClosed = true;
        } else {
          for (let heading of headings) {
            let fieldName = headingToStdName(heading);
            if (fieldName) {
              let fieldValue = member[heading];
              if (fieldValue) {
                if (fieldName == "relationship") {
                  fieldValue = GD.standardizeRelationshipToHead(this.cleanMhRelationship(fieldValue));
                }

                householdMember[fieldName] = fieldValue;
              }
            }
          }
          let isSelected = member.isSelected;
          if (isSelected) {
            householdMember.isSelected = isSelected;
          }
        }
        householdArray.push(householdMember);
      }

      let result = {};
      result.members = householdArray;

      let fields = [];
      for (let heading of headings) {
        let fieldName = headingToStdName(heading);
        if (fieldName) {
          fields.push(fieldName);
        }
      }
      result.fields = fields;

      return result;
    }
  }

  getCollectionData() {
    return undefined;
  }
}

export { MhEdReader };
