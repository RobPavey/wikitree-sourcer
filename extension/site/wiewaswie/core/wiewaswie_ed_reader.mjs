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

const FT = {
  forenames: "forenames",
  fullName: "fullName",
  personFather: "personFather",
};

// Document types
const typeData = {
  "BS Geboorte": {
    // Birth certificates
    recordType: RT.BirthRegistration,
  },
  "BS Huwelijk": {
    // Marriage certificates
    recordType: RT.MarriageRegistration,
    fixedGender: "male", // the primary person is always the groom
    nameFormat: "full",
    labels: {
      en: {
        fullName: ["Groom"],
      },
      nl: {
        fullName: ["Bruidegom"],
      },
    },
  },
  "BS Overlijden": {
    // Death certificate
    recordType: RT.DeathRegistration,
  },

  "DTB Dopen": {
    // Baptismal registers
    recordType: RT.Baptism,
    nameFormat: "forenamesOnly",
    labels: {
      en: {
        forenames: ["Dopeling"],
        personFather: ["Father"],
      },
      nl: {
        forenames: ["Dopeling"],
        personFather: ["Vader"],
      },
    },
  },
  "DTB Trouwen": {
    // Marriage registers
    recordType: RT.Marriage,
  },
  "DTB Begraven": {
    // Burial registers
    recordType: RT.Burial,
  },
  "DTB Overig": {
    // Church membership register
    recordType: RT.OtherChurchEvent,
  },

  // other document types in alphabetical order
  "Beroep en bedrijf": {
    // Profession and business
    recordType: RT.Employment,
  },
  Bevolkingsregister: {
    // Population register
    recordType: RT.Census,
  },
  Bidprentjes: {
    // Prayer cards (Faire-parts)
    recordType: RT.OtherChurchEvent,
  },
  Familieadvertenties: {
    // Family announcements
    recordType: RT.Unclassified,
  },
  "Fiscaal en financieel": {
    // Tax and financial records
    recordType: RT.Unclassified,
  },
  Familieadvertenties: {
    // Family announcements
    recordType: RT.Unclassified,
  },
  Instellingsregister: {
    // Institutional register
    recordType: RT.Unclassified,
  },
  "Memories van Successie": {
    // Memories of succession
    recordType: RT.Unclassified,
  },
  Militairen: {
    // Military sources
    recordType: RT.Military,
  },
  "Misdaad en straf": {
    // Crime and punishment
    recordType: RT.Unclassified,
  },
  "Notariële archieven": {
    // Notarial archives
    recordType: RT.Unclassified,
  },
  "Onroerend goed": {
    // Real estate
    recordType: RT.Unclassified,
  },
  "Rechterlijke archieven": {
    // Court registers
    recordType: RT.Unclassified,
  },
  "Sociale zorg": {
    // Social care
    recordType: RT.Unclassified,
  },
  Slavernijbronnen: {
    // Slavery records
    recordType: RT.Unclassified,
  },
  "Tweede Wereldoorlog": {
    // World War II
    recordType: RT.Unclassified,
  },
  "Vestiging en vertrek": {
    // Migration
    recordType: RT.Unclassified,
  },
  "VOC Opvarenden": {
    // VOC Passengers (United East India Company Passengers) or (Dutch East India Company passengers)
    recordType: RT.Unclassified,
  },
};

function fullNameToLastName(fullName) {
  // NOTE: need to handle "van" or "v. "
  return StringUtils.getLastWord(fullName);
}

class WiewaswieEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    // determine document type, event type and hence record type
    this.documentType = this.extractSourceFieldByDataKey("DocumentType");
    this.eventType = this.extractEventFieldByDataKey("Event");

    if (this.documentType) {
      this.typeData = typeData[this.documentType];
      if (this.typeData) {
        this.recordType = this.typeData.recordType;
      }
    }

    // determine if the record is in English or Dutch
    this.lang = "";
    const urlPrefix = "https://www.wiewaswie.nl/";
    if (ed.url && ed.url.startsWith(urlPrefix)) {
      let urlRemainder = ed.url.substring(urlPrefix.length);
      if (urlRemainder.startsWith("en")) {
        this.lang = "en";
      } else if (urlRemainder.startsWith("nl")) {
        this.lang = "nl";
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  extractFieldByDataKey(fieldArray, lastPartOfDataKey) {
    const dataKey = "SourceDetail." + lastPartOfDataKey;
    for (let field of fieldArray) {
      if (field.dataKey == dataKey) {
        return field.value;
      }
    }
  }

  extractSourceFieldByDataKey(lastPartOfDataKey) {
    return this.extractFieldByDataKey(this.ed.sourceList, lastPartOfDataKey);
  }

  extractEventFieldByDataKey(lastPartOfDataKey) {
    return this.extractFieldByDataKey(this.ed.eventList, lastPartOfDataKey);
  }

  extractFieldByFieldType(fieldArray, fieldType) {
    let labels = [];
    if (this.typeData.labels && this.typeData.labels[this.lang]) {
      if (this.typeData.labels[this.lang][fieldType]) {
        labels = this.typeData.labels[this.lang][fieldType];
      }
    }

    if (labels && labels.length > 0) {
      for (let field of fieldArray) {
        for (let label of labels) {
          if (field.label == label) {
            return field.value;
          }
        }
      }
    }
  }

  extractPersonFieldByFieldType(person, fieldType) {
    return this.extractFieldByFieldType(person, fieldType);
  }

  extractIndexedPersonFieldByFieldType(personIndex, fieldType) {
    if (this.ed.people.length <= personIndex) {
      return;
    }
    let person = this.ed.people[personIndex];
    return this.extractPersonFieldByFieldType(person, fieldType);
  }

  findPersonByFirstFieldType(fieldType) {
    if (!this.ed.people || !this.ed.people.length) {
      return;
    }

    let labels = [];
    if (this.typeData.labels && this.typeData.labels[this.lang]) {
      if (this.typeData.labels[this.lang][fieldType]) {
        labels = this.typeData.labels[this.lang][fieldType];
      }
    }

    if (labels && labels.length > 0) {
      for (let person of this.ed.people) {
        for (let label of labels) {
          if (person[0].label == label) {
            return person;
          }
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

    if (!this.documentType) {
      return false;
    }

    if (!this.lang) {
      return false;
    }

    if (!this.typeData) {
      return false;
    }

    return true;
  }

  getSourceType() {
    return "record";
  }

  getNameObj() {
    if (this.typeData.nameFormat == "full") {
      let name = this.extractIndexedPersonFieldByFieldType(0, FT.fullName);
      return this.makeNameObjFromFullName(name);
    } else if (this.typeData.nameFormat == "forenamesOnly") {
      let forenames = this.extractIndexedPersonFieldByFieldType(0, FT.forenames);
      return this.makeNameObjFromForenames(forenames);
    }
  }

  getGender() {
    if (this.typeData.fixedGender) {
      return this.typeData.fixedGender;
    }

    return "";
  }

  getEventDateObj() {
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
    /*
      let father = this.findPersonByFirstFieldType(FT.personFather);
      if (father) {
        let fatherName = this.extractPersonFieldByFieldType(father, FT.personFather);
        let fatherLastName = fullNameToLastName(fatherName);

        if (forenames && fatherLastName) {
          return this.makeNameObjFromForenamesAndLastName(forenames, fatherLastName);
        }
      }

    */
    return undefined;
  }

  getHousehold() {
    return undefined;
  }

  getCollectionData() {
    return undefined;
  }
}

export { WiewaswieEdReader };
