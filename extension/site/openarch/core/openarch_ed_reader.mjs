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

import { RT, RecordSubtype } from "../../../base/core/record_type.mjs";
import { ExtractedDataReader } from "../../../base/core/extracted_data_reader.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";
import { NameObj, DateObj, PlaceObj } from "../../../base/core/generalize_data_utils.mjs";
import { placeData } from "./openarch_place_data.mjs";

const RelationType = {
  primary: "primary",
  father: "father",
  mother: "mother",
  bride: "bride",
  brideFather: "brideFather",
  brideMother: "brideMother",
  spouse: "spouse",
};

const typeData = {
  default: {
    relation: {
      father: ["Vader"],
      mother: ["Moeder"],
      spouse: ["Partner"],
      bride: ["Bruid"],
      brideFather: ["Vader van de bruid"],
      brideMother: ["Moeder van de bruid"],
    },
    referenceKeys: {
      "a2a:InstitutionName": "",
      "a2a:Collection": "Collection",
      "a2a:Archive": "Archive",
      "a2a:RegistryNumber": "Inventory number",
      "a2a:DocumentNumber": "Record number",
      "a2a:Folio": "Folio",
      "a2a:Book": "Book",
    },
  },
  "DTB Dopen": {
    // Baptismal registers
    enDocumentType: "Church records baptisms",
    recordType: RT.Baptism,
    relation: {
      primary: ["Dopeling"],
    },
  },
  "DTB Trouwen": {
    // Marriage registers
    enDocumentType: "Church records marriages",
    recordType: RT.Marriage,
    relation: {
      primary: ["Bruidegom"],
      father: ["Vader van de bruidegom", "Vader"],
      mother: ["Moeder van de bruidegom", "Moeder"],
    },
    referenceKeys: {
      "a2a:Archive": "Access code",
    },
  },
  "DTB Begraven": {
    // Burial registers
    enDocumentType: "Church records burials",
    recordType: RT.Burial,
    relation: {
      primary: ["Overledene"],
    },
  },
  "other:DTB Lidmaten": {
    // Church membership registers
    enDocumentType: "Church membership records",
    recordType: RT.OtherChurchEvent,
    recordSubtype: RecordSubtype.MemberRegistration,
    relation: {
      primary: ["other:Man"],
    },
  },

  "BS Geboorte": {
    // Civil Birth
    enDocumentType: "Civil registration births",
    recordType: RT.BirthRegistration,
    relation: {
      primary: ["Kind"],
    },
  },
  "BS Huwelijk": {
    // Civil Marriage
    enDocumentType: "Civil registration marriages",
    recordType: RT.MarriageRegistration,
    relation: {
      primary: ["Bruidegom"],
      father: ["Vader van de bruidegom", "Vader"],
      mother: ["Moeder van de bruidegom", "Moeder"],
    },
  },
  "BS Overlijden": {
    // Civil Death
    enDocumentType: "Civil registration deaths",
    recordType: RT.DeathRegistration,
    relation: {
      primary: ["Overledene"],
    },
  },

  // "other:" types
  "other:Akte van lijkvinding": {
    enDocumentType: "Act of corpse discovery",
    recordType: RT.Death,
    relation: {
      primary: ["Overledene"],
    },
    referenceKeys: {
      "a2a:Archive": "Access code",
    },
  },
};

function cleanOccupation(occupation) {
  if (occupation) {
    occupation = occupation.trim();

    if (occupation == "Zonder") {
      occupation = "";
    }
  }
  return occupation;
}

class OpenarchEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    if (ed.dataObj && ed.dataObj.A2A) {
      this.a2a = ed.dataObj.A2A;

      this.a2aSourceType = this.extractSourceFieldByKey("a2a:SourceType");
      this.a2aEventType = this.extractEventFieldByKey("a2a:EventType");

      if (this.a2aSourceType) {
        this.typeData = typeData[this.a2aSourceType];
        if (this.typeData) {
          this.recordType = this.typeData.recordType;
          this.recordSubtype = this.typeData.recordSubtype;
        }
      }
    }

    let url = ed.url;
    // Example record URL
    // https://www.openarch.nl/frl:ddbcbbb4-6c3a-4fca-a222-505a70ac75bf
    if (/^https\:\/\/www\.openarch\.nl\/\w+\:[a-zA-Z0-9\-]+(?:\/\w\w)?\/?$/.test(url)) {
      let archive = url.replace(/^https\:\/\/www\.openarch\.nl\/(\w+)\:[a-zA-Z0-9\-]+(?:\/\w\w)?\/?$/, "$1");
      if (archive && archive != url) {
        this.urlArchive = archive;
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  makeNameObjFromA2aName(a2aName) {
    // e.g. "a2a:PersonName": { "a2a:PersonNameFirstName": "Hendrik", "a2a:PersonNameLastName": "Goudemond" },

    if (a2aName) {
      let nameObj = new NameObj();

      let firstName = a2aName["a2a:PersonNameFirstName"];
      let lastNamePrefix = a2aName["a2a:PersonNamePrefixLastName"];
      let patronym = a2aName["a2a:PersonNamePatronym"];
      let lastName = a2aName["a2a:PersonNameLastName"];

      if (firstName && firstName != "NN" && firstName != "N.N.") {
        nameObj.setForenames(firstName);
      }
      if (lastName || patronym || lastNamePrefix) {
        let finalLastName = lastName;
        if (finalLastName == "NN" || finalLastName == "N.N.") {
          finalLastName = "";
        }

        if (patronym) {
          if (finalLastName) {
            finalLastName = patronym + " " + finalLastName;
          } else {
            finalLastName = patronym;
          }
        }

        if (lastNamePrefix) {
          if (finalLastName) {
            finalLastName = lastNamePrefix + " " + finalLastName;
          } else {
            finalLastName = lastNamePrefix;
          }
        }

        if (finalLastName) {
          nameObj.setLastName(finalLastName);
        }
      }

      return nameObj;
    }
  }

  makeDateObjFromA2aDate(a2aDate) {
    // e.g.       "a2a:EventDate": { "a2a:Year": "1789", "a2a:Month": "8", "a2a:Day": "14" },
    if (a2aDate) {
      let day = a2aDate["a2a:Day"];
      let month = a2aDate["a2a:Month"];
      let year = a2aDate["a2a:Year"];

      let dayNum = 0;
      let monthNum = 0;
      let yearNum = 0;

      if (day && day.length > 0 && day.length < 3) {
        dayNum = parseInt(day);
        if (isNaN(dayNum)) {
          return;
        }
      }

      if (month && month.length > 0 && month.length < 3) {
        monthNum = parseInt(month);
        if (isNaN(monthNum)) {
          return;
        }
      }

      if (year && year.length > 0 && year.length < 5) {
        yearNum = parseInt(year);
        if (isNaN(yearNum)) {
          return;
        }
      }

      let dateString = DateUtils.getDateStringFromYearMonthDay(yearNum, monthNum, dayNum);

      if (dateString) {
        let dateObj = new DateObj();
        dateObj.dateString = dateString;
        return dateObj;
      }
    }
  }

  makePlaceObjFromA2aPlace(a2aPlace) {
    // e.g.       "a2a:EventDate": { "a2a:Year": "1789", "a2a:Month": "8", "a2a:Day": "14" },
    if (a2aPlace) {
      let place = a2aPlace["a2a:Place"];

      if (place) {
        let placeString = place;
        let placeInfo = placeData[place];
        if (placeInfo) {
          placeString += ", " + placeInfo.province + ", " + placeInfo.country;
        } else {
          placeString += ", Nederland";
        }

        let placeObj = new PlaceObj();
        placeObj.placeString = placeString;
        return placeObj;
      }
    }
  }

  ageFromA2aAge(a2aAge) {
    if (a2aAge) {
      let years = a2aAge["a2a:PersonAgeYears"];
      if (years) {
        years = years.replace(/ jaar$/, "");
        return years;
      }
    }
  }

  makeParentsFromPersonObjects(father, mother) {
    if (father || mother) {
      let parents = {};
      if (father) {
        parents.father = {};
        parents.father.name = this.makeNameObjFromA2aName(father["a2a:PersonName"]);
      }
      if (mother) {
        parents.mother = {};
        parents.mother.name = this.makeNameObjFromA2aName(mother["a2a:PersonName"]);
      }
      return parents;
    }
  }

  extractEventFieldByKey(key) {
    let event = this.a2a["a2a:Event"];
    if (event) {
      return event[key];
    }
  }

  extractSourceFieldByKey(key) {
    let source = this.a2a["a2a:Source"];
    if (source) {
      return source[key];
    }
  }

  extractPersonFieldByKey(person, key) {
    if (person) {
      return person[key];
    }
  }

  extractPrimaryPersonFieldByKey(key) {
    let person = this.findPrimaryPerson();
    if (person) {
      return person[key];
    }
  }

  getNameForReferenceKey(key) {
    let name = undefined;
    if (this.typeData && this.typeData.referenceKeys) {
      name = this.typeData.referenceKeys[key];
    }

    if (name === undefined) {
      name = typeData.default.referenceKeys[key];
    }

    if (name === undefined) {
      name = key;
      name = name.replace("a2a:", "");
    }

    return name;
  }

  findRelationshipByType(relationType) {
    let a2aRelationTypes = undefined;
    if (this.typeData) {
      a2aRelationTypes = this.typeData.relation[relationType];
    }
    if (!a2aRelationTypes || a2aRelationTypes.length == 0) {
      a2aRelationTypes = typeData.default.relation[relationType];
    }
    if (a2aRelationTypes) {
      for (let a2aRelationType of a2aRelationTypes) {
        let relationshipArray = this.a2a["a2a:RelationEP"];
        if (relationshipArray) {
          if (Array.isArray(relationshipArray)) {
            for (let relation of relationshipArray) {
              let type = relation["a2a:RelationType"];
              if (type == a2aRelationType) {
                return relation;
              }
            }
          } else {
            let relation = relationshipArray;
            let type = relation["a2a:RelationType"];
            if (type == a2aRelationType) {
              return relation;
            }
          }
        }
      }
    }
  }

  findPersonById(pid) {
    let personArray = this.a2a["a2a:Person"];
    if (personArray) {
      if (Array.isArray(personArray)) {
        for (let person of personArray) {
          let personPid = person["@pid"];
          if (personPid == pid) {
            return person;
          }
        }
      } else {
        let person = personArray;
        let personPid = person["@pid"];
        if (personPid == pid) {
          return person;
        }
      }
    }
  }

  findPersonByRelationType(relationType) {
    let relation = this.findRelationshipByType(relationType);
    if (relation) {
      let pid = relation["a2a:PersonKeyRef"];
      if (pid) {
        return this.findPersonById(pid);
      }
    }
  }

  findPrimaryPerson() {
    let relation = this.findRelationshipByType(RelationType.primary);
    if (relation) {
      let pid = relation["a2a:PersonKeyRef"];
      if (pid) {
        return this.findPersonById(pid);
      }
    } else {
      let personArray = this.a2a["a2a:Person"];
      if (personArray && personArray.length > 0) {
        return personArray[0];
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

    return true;
  }

  getSourceType() {
    return "record";
  }

  getNameObj() {
    let a2aName = this.extractPrimaryPersonFieldByKey("a2a:PersonName");
    return this.makeNameObjFromA2aName(a2aName);
  }

  getGender() {
    let a2aGender = this.extractPrimaryPersonFieldByKey("a2a:Gender");
    if (a2aGender == "Man") {
      return "male";
    } else if (a2aGender == "Vrouw") {
      return "female";
    }

    return "";
  }

  getEventDateObj() {
    let a2aDate = this.extractEventFieldByKey("a2a:EventDate");
    return this.makeDateObjFromA2aDate(a2aDate);
  }

  getEventPlaceObj() {
    let a2aPlace = this.extractEventFieldByKey("a2a:EventPlace");
    return this.makePlaceObjFromA2aPlace(a2aPlace);
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
    let a2aDate = this.extractPrimaryPersonFieldByKey("a2a:BirthDate");
    return this.makeDateObjFromA2aDate(a2aDate);
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
    let a2aAge = this.extractPrimaryPersonFieldByKey("a2a:Age");
    return this.ageFromA2aAge(a2aAge);
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
    let profession = this.extractPrimaryPersonFieldByKey("a2a:Profession");
    return cleanOccupation(profession);

    return "";
  }

  getSpouseObj(eventDateObj, eventPlaceObj) {
    let bride = this.findPersonByRelationType(RelationType.bride);
    if (bride) {
      let brideName = this.extractPersonFieldByKey(bride, "a2a:PersonName");
      let spouseNameObj = this.makeNameObjFromA2aName(brideName);
      let a2aAge = this.extractPersonFieldByKey(bride, "a2a:Age");
      let age = this.ageFromA2aAge(a2aAge);
      let spouseObj = this.makeSpouseObj(spouseNameObj, eventDateObj, eventPlaceObj, age);

      if (spouseObj) {
        spouseObj.personGender = "female";

        let father = this.findPersonByRelationType(RelationType.brideFather);
        let mother = this.findPersonByRelationType(RelationType.brideMother);
        let brideParents = this.makeParentsFromPersonObjects(father, mother);
        if (brideParents) {
          spouseObj.parents = brideParents;
        }
      }

      return spouseObj;
    }

    // for a death or burial or other records it can give the spouse
    let spouse = this.findPersonByRelationType(RelationType.spouse);
    if (spouse) {
      let spouseName = this.extractPersonFieldByKey(spouse, "a2a:PersonName");
      let spouseNameObj = this.makeNameObjFromA2aName(spouseName);
      let spouseObj = this.makeSpouseObj(spouseNameObj);
      return spouseObj;
    }
  }

  getParents() {
    let father = this.findPersonByRelationType(RelationType.father);
    let mother = this.findPersonByRelationType(RelationType.mother);
    return this.makeParentsFromPersonObjects(father, mother);
  }

  getHousehold() {
    return undefined;
  }

  getCollectionData() {
    if (this.a2aSourceType) {
      let collectionData = { id: this.a2aSourceType };

      let a2aName = this.extractPrimaryPersonFieldByKey("a2a:PersonName");
      if (a2aName) {
        let firstName = a2aName["a2a:PersonNameFirstName"];
        let lastNamePrefix = a2aName["a2a:PersonNamePrefixLastName"];
        let patronym = a2aName["a2a:PersonNamePatronym"];
        let lastName = a2aName["a2a:PersonNameLastName"];

        let nameParts = {};
        if (firstName) {
          nameParts.forenames = firstName;
        }
        if (lastNamePrefix) {
          nameParts.lastNamePrefix = lastNamePrefix;
        }
        if (patronym) {
          nameParts.patronym = patronym;
        }
        if (lastName) {
          nameParts.lastName = lastName;
        }
        collectionData.nameParts = nameParts;
      }

      let a2aPlace = this.extractEventFieldByKey("a2a:EventPlace");
      if (a2aPlace) {
        let place = a2aPlace["a2a:Place"];
        if (place) {
          collectionData.place = place;
        }
      }

      return collectionData;
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Functions to support build citation
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getSourceTitle() {
    let title = this.a2aSourceType;
    if (!title) {
      title = "";
    }

    const otherPrefix = "other:";
    if (title.startsWith(otherPrefix)) {
      title = title.substring(otherPrefix.length);
    }

    if (this.typeData && this.typeData.enDocumentType) {
      if (title) {
        title += " (" + this.typeData.enDocumentType + ")";
      } else {
        title = this.typeData.enDocumentType;
      }
    }
    return title;
  }

  getSourceReference(options) {
    let reference = this.extractSourceFieldByKey("a2a:SourceReference");
    if (!reference) {
      return "";
    }

    let string = "";

    function addPart(reader, referenceKey) {
      let value = reference[referenceKey];

      if (value) {
        let name = reader.getNameForReferenceKey(referenceKey);

        if (referenceKey == "a2a:Collection") {
          const prefix = "Archiefnaam: ";
          if (value.startsWith(prefix)) {
            value = value.substring(prefix.length);
          }
          let remainderIndex = value.search(/\,\s+[^,:]+\:/);
          if (remainderIndex != -1) {
            value = value.substring(0, remainderIndex);
          }
        }

        if (string) {
          string += ", ";
        }
        if (name) {
          string += name + ": ";
        }
        string += value;
      }
    }

    addPart(this, "a2a:InstitutionName");
    addPart(this, "a2a:Collection");

    if (options.citation_openarch_includeArchiveNumInSourceRef) {
      addPart(this, "a2a:Archive");
    }
    if (options.citation_openarch_includeRegNumInSourceRef) {
      addPart(this, "a2a:RegistryNumber");
    }
    if (options.citation_openarch_includeDocNumInSourceRef) {
      addPart(this, "a2a:DocumentNumber");
    }
    addPart(this, "a2a:Book");
    if (options.citation_openarch_includeFolioNumInSourceRef) {
      addPart(this, "a2a:Folio");
    }
    return string;
  }

  getExternalLink() {
    let externalLink = {
      link: "",
      text: "",
    };

    let originalSourceLink = this.extractSourceFieldByKey("a2a:SourceDigitalOriginal");

    if (originalSourceLink) {
      externalLink.link = originalSourceLink;

      externalLink.text = "External Record";
      let reference = this.extractSourceFieldByKey("a2a:SourceReference");
      if (reference) {
        let institution = reference["a2a:InstitutionName"];
        if (institution) {
          externalLink.text = institution + " Record";
        }
      }

      return externalLink;
    }
  }
}

export { OpenarchEdReader };
