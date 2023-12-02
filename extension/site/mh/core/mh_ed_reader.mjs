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

const recordTypeData = [
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
    recordType: RT.Immigration,
    documentTypes: ["Immigrant Record"],
  },
];

const typeDataEventLabels = {
  Baptism: ["Christening", "Baptism"],
  Immigration: ["Arrival"],
  Census: ["Residence"],
};

class MhEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
    if (ed.recordData) {
      this.determineSourceTypeAndRecordType();
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
          let docType = this.getSimpleRecordDataValue("Document type");
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

        if (typeData.requiredFields) {
          if (!ed.recordData) {
            continue;
          }

          let requiredFieldsPresent = false;
          for (let requiredFieldSet of typeData.requiredFields) {
            let fieldsPresent = true;
            for (let field of requiredFieldSet) {
              if (!ed.recordData[field]) {
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

  getSimpleRecordDataValue(label) {
    let valueObj = this.ed.recordData[label];
    if (valueObj) {
      return valueObj.value;
    }
  }

  getEventDataValue() {
    if (this.recordType) {
      let labels = typeDataEventLabels[this.recordType];
      if (labels) {
        for (let label of labels) {
          let value = this.ed.recordData[label];
          if (value) {
            return value;
          }
        }
      }
    }
  }

  cleanMhDate(dateString) {
    if (!dateString) {
      return "";
    }

    dateString = dateString.trim();

    if (/^\d\d\d\d$/.test(dateString)) {
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
    return this.makeNameObjFromFullName(this.getSimpleRecordDataValue("Name"));
  }

  getGender() {
    if (this.ed.personGender) {
      return this.ed.personGender;
    }

    let gender = this.getSimpleRecordDataValue("Gender");
    if (gender) {
      return gender.toLowerCase();
    }

    return "";
  }

  getEventDateObj() {
    let valueObj = this.getEventDataValue();
    if (valueObj && valueObj.dateString) {
      return this.makeDateObjFromDateString(this.cleanMhDate(valueObj.dateString));
    }

    return undefined;
  }

  getEventPlaceObj() {
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
    return undefined;
  }

  getBirthPlaceObj() {
    return undefined;
  }

  getDeathDateObj() {
    return undefined;
  }

  getDeathPlaceObj() {
    return undefined;
  }

  getAgeAtEvent() {
    return "";
  }

  getAgeAtDeath() {
    return "";
  }

  getRegistrationDistrict() {
    return "";
  }

  getRelationshipToHead() {
    return "";
  }

  getMaritalStatus() {
    return "";
  }

  getOccupation() {
    return "";
  }

  getSpouseObj(eventDateObj, eventPlaceObj) {
    return undefined;
  }

  getParents() {
    return undefined;
  }

  getHousehold() {
    return undefined;
  }

  getCollectionData() {
    return undefined;
  }
}

export { MhEdReader };
