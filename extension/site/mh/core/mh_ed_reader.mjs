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
import { StringUtils } from "../../../base/core/string_utils.mjs";

// for some common collections specify the exact record type for every record
// in the collection
const collectionIdToRecordType = {
  10092: RT.BirthRegistration,
  10442: RT.BirthRegistration,
  10443: RT.MarriageRegistration,
};

const recordTypeData = [
  // put ones with Document type first
  {
    recordType: RT.Immigration,
    documentTypes: ["immigrant record"],
  },
  {
    recordType: RT.Divorce,
    documentTypes: ["divorce"],
  },
  {
    recordType: RT.Burial,
    documentTypes: ["death / burial", "death/burial"],
    requiredFields: [["burial"]],
  },
  {
    recordType: RT.Death,
    documentTypes: ["death / burial", "death/burial"],
    requiredFields: [["death"]],
  },
  {
    recordType: RT.DeathOrBurial,
    documentTypes: ["death / burial", "death/burial"],
  },
  {
    recordType: RT.Will,
    documentTypes: ["will"],
  },
  {
    recordType: RT.Probate,
    documentTypes: ["probate", "letter of administration", "intestacy"],
  },
  {
    recordType: RT.LegalRecord,
    documentTypes: ["insolvency"],
  },

  // collection matches
  {
    recordType: RT.Baptism,
    collectionTitleMatches: [["births and christenings"]],
    requiredFields: [["christening"], ["baptism"]],
  },
  {
    recordType: RT.Census,
    collectionTitleMatches: [["census"]],
    requiredRecordSections: [["Census"]],
  },
  {
    recordType: RT.BirthRegistration,
    collectionTitleMatches: [["england & wales, birth index, 1837-2005"], ["birth", "gro index"]],
  },
  {
    recordType: RT.MarriageRegistration,
    collectionTitleMatches: [["england & wales, marriage index, 1837-2005"], ["register of marriages for "]],
  },
  {
    recordType: RT.DeathRegistration,
    collectionTitleMatches: [["england & wales, death index"], ["england & wales deaths,"]],
  },
  {
    recordType: RT.Directory,
    collectionTitleMatches: [["business register"], ["u.s. public records index"], ["phone and address listings"]],
  },
  {
    recordType: RT.SocialSecurity,
    collectionTitleMatches: [["social security applications and claims"]],
  },
  {
    recordType: RT.Employment,
    collectionTitleMatches: [["medicare public provider"], ["attorney registrations"], ["job applications"]],
  },
  {
    recordType: RT.FamHistOrPedigree,
    collectionTitleMatches: [["biographies"], ["genealogy of the"], ["personal reminiscences of"]],
  },
  {
    recordType: RT.Directory,
    collectionTitleMatches: [["directory and gazetteer"]],
  },
  {
    recordType: RT.ElectoralRegister,
    collectionTitleMatches: [["register of electors"]],
  },
  {
    recordType: RT.Probate,
    collectionTitleMatches: [["will and probate index"]],
  },

  // matches using required fields only
  {
    recordType: RT.Baptism,
    requiredFields: [["baptism date", "baptism place"], ["baptism"], ["christening"]],
  },
  {
    recordType: RT.Burial,
    requiredFields: [["burial date", "burial place"], ["burial"]],
  },
  {
    recordType: RT.Will,
    requiredFields: [["will", "court"]],
  },
  {
    recordType: RT.ElectoralRegister,
    requiredFields: [["voter registration"]],
  },
  {
    recordType: RT.CriminalRegister,
    requiredFields: [["offence", "conviction"], ["imprisonment"]],
  },

  {
    recordType: RT.Death,
    requiredFields: [["death date", "death place"], ["death"]],
  },
  {
    recordType: RT.Marriage,
    requiredFields: [["marriage date", "marriage place"], ["marriage"]],
  },
  {
    recordType: RT.Birth,
    requiredFields: [["birth date", "birth place"], ["birth"]],
  },
];

const typeDataEventLabels = {
  Baptism: ["christening", "baptism"],
  Birth: ["birth"],
  BirthRegistration: ["birth"],
  Burial: ["burial"],
  Census: ["residence"],
  CriminalRegister: ["conviction", "imprisonment"],
  Death: ["death"],
  DeathOrBurial: ["death / burial", "burial", "death"],
  Divorce: ["divorce"],
  ElectoralRegister: ["voter registration"],
  Immigration: ["arrival"],
  Marriage: ["marriage"],
  MarriageRegistration: ["marriage"],
  Will: ["will"],
};

const typeDataEventDateLabels = {
  Directory: ["abn last updated", "abn status date"],
  Marriage: ["marriage date"],
  MarriageRegistration: ["marriage date"],
  Birth: ["birth date"],
  BirthRegistration: ["birth date"],
  Death: ["death date"],
  DeathRegistration: ["death date"],
};

const typeDataEventPlaceLabels = {
  Directory: ["residence"],
  Marriage: ["marriage place"],
  MarriageRegistration: ["marriage place"],
  Birth: ["birth place"],
  BirthRegistration: ["birth place"],
  Death: ["death place"],
  DeathRegistration: ["death place"],
};

function cleanMhDate(dateString) {
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
  } else if (/^[A-Z-a-z][a-z][a-z]+\s+\d\d?\s+\d\d\d\d$/.test(dateString)) {
    // e.g. Aug 22 1822 or July 4 1961
    let newString = dateString.replace(/([A-Z-a-z][a-z][a-z]+)\s+(\d\d?)\s+(\d\d\d\d)/, "$2 $1 $3");
    if (newString) {
      return newString;
    }
  } else if (/^Between \d\d\d\d and \d\d\d\d$/.test(dateString)) {
    let newString = dateString.replace(/^Between (\d\d\d\d) and (\d\d\d\d)$/, "$1-$2");
    if (newString) {
      return newString;
    }
  }

  return dateString;
}

function cleanMhRelationship(string) {
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

function cleanMhAge(string) {
  if (!string) {
    return "";
  }

  string = string.trim();

  // Census records like 1841 contains ages like "15 - 19" when the
  // census record says 15. Change to 15.
  if (string.includes("-")) {
    string = string.replace(/(\d+)\s*\-\s*\d*/, "$1");
    string = string.replace(/\s+/g, " ");
  }

  return string;
}

class MhEdReader extends ExtractedDataReader {
  constructor(ed, userGivenRecordType = undefined) {
    super(ed);
    if (ed.recordData) {
      this.setupUrlParts();
      this.determineSourceTypeAndRecordType(userGivenRecordType);

      this.setupCoupleData();

      this.setupNameParts();
    }
  }

  determineSourceTypeAndRecordType(userGivenRecordType) {
    let ed = this.ed;

    if (ed.pageType == "person") {
      this.sourceType = "profile";
    } else if (ed.pageType == "record") {
      this.sourceType = "record";

      if (userGivenRecordType) {
        this.recordType = userGivenRecordType;
        return;
      }

      if (this.urlParts.collectionId) {
        let rtFromCollection = collectionIdToRecordType[this.urlParts.collectionId];
        if (rtFromCollection) {
          this.recordType = rtFromCollection;
          return;
        }
      }

      for (let typeData of recordTypeData) {
        if (typeData.documentTypes) {
          let docTypeValue = this.getRecordDataValueByKeysOrLabels(["formtype"], ["document type", "record type"]);
          if (docTypeValue && docTypeValue.value) {
            let docType = docTypeValue.value.toLowerCase();
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

          title = title.toLowerCase();
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
      if (field.label) {
        let fieldLabel = field.label.toLowerCase();
        if (fieldLabel == label) {
          return field;
        }
      }
    }
  }

  findRecordDataFieldByLabels(labels) {
    if (labels && this.ed.recordData) {
      for (let field of Object.values(this.ed.recordData)) {
        if (field.label) {
          let label = field.label.toLowerCase();
          if (labels.includes(label)) {
            return field;
          }
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
        if (field.label) {
          let label = field.label.toLowerCase();
          if (labels.includes(label)) {
            return field;
          }
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
      let value = this.getRecordDataValue(labels);
      if (value) {
        return value;
      }
    }

    let value = this.getRecordDataValue(["event"]);
    return value;
  }

  getEventDateValue() {
    if (this.recordType) {
      let labels = typeDataEventDateLabels[this.recordType];
      let value = this.getRecordDataValue(labels);
      if (value) {
        return value;
      }
    }
    let value = this.getRecordDataValue(["event date", "event year", "date", "year", "date of grant", "year of grant"]);
    return value;
  }

  getEventPlaceValue() {
    if (this.recordType) {
      let labels = typeDataEventPlaceLabels[this.recordType];
      let value = this.getRecordDataValue(labels);
      if (value) {
        return value;
      }
    }
    let value = this.getRecordDataValue(["event place", "place"]);
    return value;
  }

  getBirthDataValue() {
    const labels = ["birth"];
    return this.getRecordDataValue(labels);
  }

  getDeathDataValue() {
    const labels = ["death"];
    return this.getRecordDataValue(labels);
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

        if (mainValue["Age"]) {
          person.age = cleanMhAge(mainValue["Age"]);
        }

        if (mainValue["Residence"]) {
          person.residence = mainValue["Residence"];
        }

        if (mainValue["Father"]) {
          person.fatherName = mainValue["Father"];
        }

        if (mainValue["Mother"]) {
          person.motherName = mainValue["Mother"];
        }
      }

      if (maritalStatusValue) {
        if (maritalStatusValue.value) {
          person.maritalStatus = maritalStatusValue.value;
        }
      }

      if (ageValue) {
        if (ageValue.value) {
          person.age = cleanMhAge(ageValue.value);
        }
      }

      if (!person.age && (birthDateValue || (mainValue && mainValue["Birth"]))) {
        if (birthDateValue.value) {
          person.birthDateString = birthDateValue.value;
        } else if (birthDateValue.dateString) {
          person.birthDateString = birthDateValue.dateString;
        } else if (mainValue && mainValue["Birth"]) {
          person.birthDateString = mainValue["Birth"];
        }
      }

      return person;
    }

    let coupleData = {};

    let primaryNameString = titleString.substring(0, ampIndex).trim();

    coupleData.primaryNameString = primaryNameString;

    let husbandMainValue = this.getRecordDataValueByKeysOrLabels(
      ["person-canonical-events.name-as-groom", "husband-name"],
      ["groom", "husband"]
    );
    let husbandMaritalStatusValue = this.getRecordDataValue(["Groom marital status"]);
    let husbandAgeValue = this.getRecordDataValueByKeysOrLabels(["husband-age"], []);
    let husbandBirthDateValue = this.getRecordDataValueByKeysOrLabels(["husband-birth"], []);

    let wifeMainValue = this.getRecordDataValueByKeysOrLabels(
      ["person-canonical-events.name-as-bride", "wife-name"],
      ["bride", "wife"]
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

    coupleData.husband.gender = "male";
    coupleData.wife.gender = "female";

    if (coupleData.husband.name == primaryNameString) {
      coupleData.primaryPerson = coupleData.husband;
      coupleData.spouse = coupleData.wife;
    } else if (coupleData.wife.name == primaryNameString) {
      coupleData.primaryPerson = coupleData.wife;
      coupleData.spouse = coupleData.husband;
    }

    this.coupleData = coupleData;
  }

  setupNameParts() {
    let nameString = this.getSimpleRecordDataValueString("name");

    if (!nameString) {
      let title = this.ed.recordTitle;
      if (title != this.ed.collectionTitle) {
        nameString = title;
      }
    }

    if (this.coupleData) {
      if (this.coupleData.primaryPerson && this.coupleData.primaryPerson.name) {
        nameString = this.coupleData.primaryPerson.name;
      }
    }

    this.nameParts = this.separateMhNameIntoParts(nameString);
  }

  setupUrlParts() {
    this.urlParts = {};

    let url = this.ed.url;
    if (!url) {
      return;
    }

    // Example record URL:
    // https://www.myheritage.com/research/record-10069-35470791/ronnie-l-smith-and-linda-smith-in-texas-marriages-divorces#
    // can also look like:
    // https://www.myheritage.com/research/record-20618-3185920-F/frank-c-gemperline-and-edna-schwamberger-in-ohio-marriages
    // Example person profile URL:
    // https://www.myheritage.com/research/record-1-451433851-1-508888/charles-kimberlin-in-myheritage-family-trees

    let collectionId = "";
    if (/^https?\:\/\/.+\.myheritage.+\/research\/record\-\d+\-\d+(?:\-\w+)?\//.test(url)) {
      let collectionPart = url.replace(
        /^https?\:\/\/.+\.myheritage.+\/research\/record\-(\d+)\-\d+(?:\-\w+)?\/.+$/,
        "$1"
      );
      if (collectionPart && collectionPart != url) {
        collectionId = collectionPart;
      }
    }
    if (collectionId) {
      this.urlParts.collectionId = collectionId;
    }
  }

  separateMhNameIntoParts(nameString) {
    let parts = {
      fullName: nameString,
    };

    if (!nameString) {
      return parts;
    }

    const bornPrefix = "(born ";
    if (nameString.includes(bornPrefix)) {
      let bornIndex = nameString.indexOf(bornPrefix);
      if (bornIndex != -1) {
        let closeParenIndex = nameString.indexOf(")", bornIndex);
        if (closeParenIndex != -1) {
          let fullMarriedName = nameString.substring(0, bornIndex).trim();
          // this can have other last names e.g.: "Emily Kimberlin - Black (born Mason)"
          const lnSep = " - ";
          let lnSepIndex = fullMarriedName.indexOf(lnSep);
          if (lnSepIndex != -1) {
            fullMarriedName = fullMarriedName.substring(0, lnSepIndex).trim();
            parts.otherLastNames = fullMarriedName.substring(lnSepIndex + lnSep.length).trim();
          }
          parts.forenames = StringUtils.getWordsBeforeLastWord(fullMarriedName);

          parts.lnab = nameString.substring(bornIndex + bornPrefix.length, closeParenIndex).trim();
          parts.cln = StringUtils.getLastWord(fullMarriedName);
          parts.fullName = parts.forenames + " " + parts.lnab;
        }
      }
    } else {
      if (StringUtils.countWords(nameString) > 1) {
        parts.lastName = StringUtils.getLastWord(nameString);
        parts.forenames = StringUtils.getWordsBeforeLastWord(nameString);
        parts.lnab = parts.lastName;
      }
    }

    return parts;
  }

  makeNameObjFromMhFullName(nameString) {
    let parts = this.separateMhNameIntoParts(nameString);
    let nameObj = this.makeNameObjFromFullName(parts.fullName);
    return nameObj;
  }

  makeDateObjFromMhValueObj(valueObj) {
    if (!valueObj) {
      return undefined;
    }

    if (valueObj.dateString) {
      return this.makeDateObjFromDateString(cleanMhDate(valueObj.dateString));
    }

    if (valueObj.value) {
      // sometimes the value is something like "Oct 5 1788 - Lyon, France"
      let parts = valueObj.value.split(" - ");
      if (parts.length == 2) {
        let dateObj = this.makeDateObjFromDateString(cleanMhDate(parts[0]));
        if (dateObj) {
          return dateObj;
        }
      }
      return this.makeDateObjFromDateString(cleanMhDate(valueObj.value));
    }

    if (valueObj["Year"]) {
      return this.makeDateObjFromYear(cleanMhDate(valueObj["Year"]));
    }
  }

  makePlaceObjFromMhValueObj(valueObj) {
    if (!valueObj) {
      return undefined;
    }

    if (valueObj.placeString) {
      return this.makePlaceObjFromFullPlaceName(valueObj.placeString);
    }

    if (valueObj["District"]) {
      return this.makePlaceObjFromFullPlaceName(valueObj["District"]);
    }

    if (valueObj.value) {
      // sometimes the value is something like "Oct 5 1788 - Lyon, France"
      let parts = valueObj.value.split(" - ");
      if (parts.length == 2) {
        let placeObj = this.makePlaceObjFromFullPlaceName(parts[1]);
        if (placeObj) {
          return placeObj;
        }
      }
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
      return false;
    }

    return true;
  }

  getSourceType() {
    return this.sourceType;
  }

  getNameObj() {
    return this.makeNameObjFromFullName(this.nameParts.fullName);
  }

  getGender() {
    if (this.ed.personGender) {
      return this.ed.personGender;
    }

    let gender = this.getSimpleRecordDataValueString("gender");
    if (gender) {
      return gender.toLowerCase();
    }

    if (this.coupleData && this.coupleData.primaryPerson && this.coupleData.primaryPerson.gender) {
      return this.coupleData.primaryPerson.gender;
    }

    return "";
  }

  getEventDateObj() {
    let valueObj = this.getEventDataValue();
    let dateObj = this.makeDateObjFromMhValueObj(valueObj);
    if (dateObj) {
      return dateObj;
    }

    valueObj = this.getEventDateValue();
    dateObj = this.makeDateObjFromMhValueObj(valueObj);
    if (dateObj) {
      return dateObj;
    }

    return undefined;
  }

  getEventPlaceObj() {
    let placeObj = this.makePlaceObjFromMhValueObj(this.getEventDataValue());
    if (placeObj) {
      return placeObj;
    }

    placeObj = this.makePlaceObjFromMhValueObj(this.getEventPlaceValue());
    if (placeObj) {
      return placeObj;
    }

    let valueObj = this.getRecordDataValue(["place"]);
    if (valueObj && valueObj.value) {
      placeObj = this.makePlaceObjFromFullPlaceName(valueObj.value);
      if (placeObj) {
        return placeObj;
      }
    }

    return undefined;
  }

  getLastNameAtBirth() {
    if (
      this.sourceType == "profile" ||
      this.recordType == "Birth" ||
      this.recordType == "BirthRegistration" ||
      this.recordType == "Baptism"
    ) {
      if (this.nameParts.lnab) {
        return this.nameParts.lnab;
      }
    }

    return "";
  }

  getLastNameAtDeath() {
    if (
      this.sourceType == "profile" ||
      this.recordType == "Death" ||
      this.recordType == "DeathRegistration" ||
      this.recordType == "Burial"
    ) {
      if (this.nameParts.cln) {
        return this.nameParts.cln;
      }
    }

    return "";
  }

  getMothersMaidenName() {
    let valueObj = this.getRecordDataValueByKeysOrLabels(["mother-last-name"], ["mother's maiden name"]);
    if (valueObj && valueObj.value) {
      return valueObj.value;
    }

    return "";
  }

  getBirthDateObj() {
    // if this is a divorce or possibly marriage it could have the birth date of both people
    // which one to use depends on which person is primary

    let valueObj = this.getBirthDataValue();
    let dateObj = this.makeDateObjFromMhValueObj(valueObj);
    if (dateObj) {
      return dateObj;
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
    let dateObj = this.makeDateObjFromMhValueObj(valueObj);
    if (dateObj) {
      return dateObj;
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
    } else {
      let ageValue = this.getRecordDataValueByKeysOrLabels(["age"], ["age"]);
      if (ageValue && ageValue.value) {
        return cleanMhAge(ageValue.value);
      }
    }
    return "";
  }

  getAgeAtDeath() {
    return "";
  }

  getRegistrationDistrict() {
    let district = this.getRecordDataValueByKeysOrLabels(["registration"], ["registration"]);
    if (district && district.value) {
      return district.value;
    }
    return "";
  }

  getRelationshipToHead() {
    if (this.ed.household) {
      const household = this.ed.household;
      if (household.headings.includes("Relation to head")) {
        for (let member of household.members) {
          if (member.isSelected) {
            return cleanMhRelationship(member["Relation to head"]);
          }
        }
      }
    }
    return "";
  }

  getMaritalStatus() {
    return this.getRecordDataValueString(["marital status"]);
  }

  getOccupation() {
    return this.getRecordDataValueString(["occupation"]);
  }

  getSpouseObj(eventDateObj, eventPlaceObj) {
    // Note that the calling function will automatically try to determine spouse for census
    if (this.recordType != RT.Census) {
      let spouseName = this.getRecordDataValueString(["spouse", "spouse (implied)"]);

      if (!spouseName && this.coupleData) {
        if (this.coupleData.spouse && this.coupleData.spouse.name) {
          spouseName = this.coupleData.spouse.name;
        }
      }

      let spouseGender = "";

      if (!spouseName) {
        let wifeValueObj = this.getRecordDataValue(["wife"]);
        if (wifeValueObj) {
          if (wifeValueObj["Name"]) {
            spouseName = wifeValueObj["Name"];
          } else if (wifeValueObj.value) {
            spouseName = wifeValueObj.value;
          }
          spouseGender = "female";
        } else {
          let husbandValueObj = this.getRecordDataValue(["husband"]);
          if (husbandValueObj) {
            if (husbandValueObj["Name"]) {
              spouseName = husbandValueObj["Name"];
            } else if (husbandValueObj.value) {
              spouseName = husbandValueObj.value;
            }
            spouseGender = "male";
          }
        }
      }

      if (spouseName) {
        let spouseNameObj = this.makeNameObjFromMhFullName(spouseName);
        if (spouseNameObj) {
          let spouse = { name: spouseNameObj };
          if (spouseGender) {
            spouse.personGender = spouseGender;
          }
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
            let marriageValue = this.getRecordDataValue(["marriage"]);
            if (marriageValue) {
              if (marriageValue.dateString) {
                spouse.marriageDate = this.makeDateObjFromDateString(cleanMhDate(marriageValue.dateString));
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
              if (spouseData.gender) {
                spouse.personGender = spouseData.gender;
              }

              if (spouseData.fatherName || spouseData.motherName) {
                spouse.parents = {};
                let fatherNameObj = this.makeNameObjFromMhFullName(spouseData.fatherName);
                if (fatherNameObj) {
                  spouse.parents.father = { name: fatherNameObj };
                }
                let motherNameObj = this.makeNameObjFromMhFullName(spouseData.motherName);
                if (motherNameObj) {
                  spouse.parents.mother = { name: motherNameObj };
                }
              }
            }
          } else {
            let spouseFatherName = this.getRecordDataValueString(["wife's father", "husband's father"]);
            let spouseMotherName = this.getRecordDataValueString(["wife's mother", "husband's mother"]);
            if (spouseFatherName || spouseMotherName) {
              spouse.parents = {};
              let fatherNameObj = this.makeNameObjFromMhFullName(spouseFatherName);
              if (fatherNameObj) {
                spouse.parents.father = { name: fatherNameObj };
              }
              let motherNameObj = this.makeNameObjFromMhFullName(spouseMotherName);
              if (motherNameObj) {
                spouse.parents.mother = { name: motherNameObj };
              }
            }
          }

          return spouse;
        }
      }
    }

    if (this.sourceType == "profile") {
      if (this.ed.recordSections) {
        let familySection = this.ed.recordSections["Family members"];
        if (familySection) {
          let persons = familySection["Spouse"];
          if (!persons) {
            persons = familySection["Wife"];
          }
          if (!persons) {
            persons = familySection["Husband"];
          }
          if (persons) {
            if (persons.length == 1) {
              let person = persons[0];
              let spouseNameObj = this.makeNameObjFromMhFullName(person.name);
              if (spouseNameObj) {
                let spouse = { name: spouseNameObj };
                return spouse;
              }
            }
          }
        }
      }
    }

    return undefined;
  }

  getParents() {
    // Note that the calling function will automatically try to determine parents for census
    if (this.recordType != RT.Census) {
      let fatherValue = this.getRecordDataValue(["father"]);
      let motherValue = this.getRecordDataValue(["mother"]);
      let fatherName = "";
      let motherName = "";
      if (fatherValue || motherValue) {
        if (fatherValue) {
          if (fatherValue["Name"]) {
            fatherName = fatherValue["Name"];
          } else if (fatherValue.value) {
            fatherName = fatherValue.value;
          }
        }
        if (motherValue) {
          if (motherValue["Name"]) {
            motherName = motherValue["Name"];
          } else if (motherValue.value) {
            motherName = motherValue.value;
          }
        }
      } else {
        if (this.coupleData && this.coupleData.primaryPerson) {
          let primaryPerson = this.coupleData.primaryPerson;
          if (primaryPerson.fatherName) {
            fatherName = primaryPerson.fatherName;
          }
          if (primaryPerson.motherName) {
            motherName = primaryPerson.motherName;
          }
        }
      }

      if (fatherName || motherName) {
        let parents = {};
        if (fatherName) {
          let fatherNameObj = this.makeNameObjFromMhFullName(fatherName);
          if (fatherNameObj) {
            parents.father = { name: fatherNameObj };
          }
        }
        if (motherName) {
          let motherNameObj = this.makeNameObjFromMhFullName(motherName);
          if (motherNameObj) {
            parents.mother = { name: motherNameObj };
          }
        }
        return parents;
      }
    }

    function makeParentFromNameParts(reader, nameParts) {
      if (!nameParts.fullName) {
        return undefined;
      }

      let nameObj = reader.makeNameObjFromFullName(nameParts.fullName);
      if (nameObj) {
        let parent = { name: nameObj };
        if (nameParts.lnab) {
          parent.lastNameAtBirth = nameParts.lnab;
        }
        if (nameParts.cln) {
          parent.lastNameAtDeath = nameParts.cln;
        }
        return parent;
      }
    }

    if (this.sourceType == "profile") {
      if (this.ed.recordSections) {
        let familySection = this.ed.recordSections["Family members"];
        if (familySection) {
          let parents = {};
          let persons = familySection["Parents"];
          if (persons) {
            if (persons.length == 1) {
              let person = persons[0];
              let nameParts = this.separateMhNameIntoParts(person.name);
              let parent = makeParentFromNameParts(this, nameParts);
              if (parent) {
                if (person.gender == "female") {
                  parents.mother = parent;
                } else {
                  parents.father = parent;
                }
              }
            } else if (persons.length == 2) {
              let fatherPerson = persons[1].gender == "female" ? persons[0] : persons[1];
              let motherPerson = persons[1].gender == "female" ? persons[1] : persons[0];

              let fatherNameParts = this.separateMhNameIntoParts(fatherPerson.name);
              let father = makeParentFromNameParts(this, fatherNameParts);
              let motherNameParts = this.separateMhNameIntoParts(motherPerson.name);
              let mother = makeParentFromNameParts(this, motherNameParts);

              if (father) {
                parents.father = father;
              }
              if (mother) {
                parents.mother = mother;
              }
            }
          }

          if (parents.mother || parents.father) {
            return parents;
          }
        }
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
                  fieldValue = GD.standardizeRelationshipToHead(cleanMhRelationship(fieldValue));
                } else if (fieldName == "age") {
                  fieldValue = cleanMhAge(fieldValue);
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
    let collectionId = this.urlParts.collectionId;
    if (collectionId) {
      let collectionData = {
        id: collectionId,
      };

      function addRef(fieldName, value) {
        if (value) {
          collectionData[fieldName] = value;
        }
      }

      if (this.ed.recordSections) {
        let censusSection = this.ed.recordSections["Census"];
        if (censusSection) {
          function addRefForCensusKey(fieldName, key) {
            let value = censusSection[key];
            addRef(fieldName, value);
          }

          addRefForCensusKey("district", "Registration district");
          addRefForCensusKey("eccPar", "Ecclesiastical district");
          addRefForCensusKey("enumDistrict", "Enum. District");
          addRefForCensusKey("county", "County");
          addRefForCensusKey("familyNumber", "Family");
          addRefForCensusKey("folio", "Folio");
          addRefForCensusKey("piece", "Piece");

          let pageString = censusSection["Page"];
          if (pageString.includes("\\")) {
            let book = pageString.replace(/^(\d+)\\\d+$/, "$1");
            let page = pageString.replace(/^\d+\\(\d+)$/, "$1");
            if (book && page && book != pageString && page != pageString) {
              addRef("book", book);
              addRef("page", page);
            } else {
              addRef("page", pageString);
            }
          } else {
            addRef("page", pageString);
          }
        }
      }

      function addRefForRecordDataKeysOrLabels(reader, fieldName, keys, labels) {
        let valueObj = reader.getRecordDataValueByKeysOrLabels(keys, labels);
        if (valueObj) {
          let value = "";
          if (valueObj.value) {
            value = valueObj.value;
          }
          addRef(fieldName, value);
        }
      }

      addRefForRecordDataKeysOrLabels(this, "page", ["Page", "page"], ["page"]);
      addRefForRecordDataKeysOrLabels(this, "volume", ["Vol", "vol"], ["volume"]);

      let registrationObj = this.getRecordDataValueByKeysOrLabels(["registration"], ["registration"]);
      if (registrationObj) {
        function addRefForRegistrationKey(fieldName, key) {
          let value = registrationObj[key];
          addRef(fieldName, value);
        }

        addRefForRegistrationKey("book", "Book");
        addRefForRegistrationKey("page", "Page");
        addRefForRegistrationKey("number", "Number");
      }

      return collectionData;
    }

    return undefined;
  }
}

export { MhEdReader };
