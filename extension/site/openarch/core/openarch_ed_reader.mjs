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
      InstitutionName: "",
      Collection: "Collection",
      Archive: "Archive",
      RegistryNumber: "Inventory number",
      DocumentNumber: "Record number",
      Folio: "Folio",
      Book: "Book",
    },
  },
  "DTB Dopen": {
    // Baptismal registers
    enDocumentType: "Church records baptisms",
    recordType: RT.Baptism,
    relation: {
      primary: ["Dopeling", "Kind"],
    },
  },
  "DTB Trouwen": {
    // Marriage registers
    enDocumentType: "Church records marriages",
    recordType: RT.Marriage,
    fixedGender: "male", // the primary person is always the groom
    relation: {
      primary: ["Bruidegom"],
      father: ["Vader van de bruidegom", "Vader"],
      mother: ["Moeder van de bruidegom", "Moeder"],
    },
    referenceKeys: {
      Archive: "Access code",
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
    nlDocumentType: "Burgerlijke Stand Geboorte",
    enDocumentType: "Civil registration births",
    recordType: RT.Birth,
    relation: {
      primary: ["Kind"],
    },
  },
  "BS Huwelijk": {
    // Civil Marriage
    nlDocumentType: "Burgerlijke Stand Huwelijk",
    enDocumentType: "Civil registration marriages",
    recordType: RT.Marriage,
    fixedGender: "male", // the primary person is always the groom
    relation: {
      primary: ["Bruidegom"],
      father: ["Vader van de bruidegom", "Vader"],
      mother: ["Moeder van de bruidegom", "Moeder"],
    },
  },
  "BS Overlijden": {
    // Civil Death
    nlDocumentType: "Burgerlijke Stand Overlijden",
    enDocumentType: "Civil registration deaths",
    recordType: RT.Death,
    relation: {
      primary: ["Overledene"],
    },
  },

  Bevolkingsregister: {
    // Population register
    enDocumentType: "Population register",
    recordType: RT.PopulationRegister,
    relation: {
      primary: ["Geregistreerde"],
    },
  },
  "other:Bevolkingsregister 1853-1863": {
    // Population register
    enDocumentType: "Population register 1853-1863",
    recordType: RT.PopulationRegister,
    relation: {
      primary: ["Geregistreerde"],
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
      Archive: "Access code",
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

    if (ed.dataObj) {
      this.a2a = ed.dataObj.A2A;
      if (!this.a2a) {
        this.a2a = ed.dataObj;
      }

      this.a2aSourceType = this.extractSourceFieldByKey("SourceType");
      this.a2aEventType = this.extractEventFieldByKey("EventType");

      if (this.a2aSourceType == "other:") {
        let eventType = this.a2aEventType;
        if (eventType) {
          if (eventType.startsWith("other:")) {
            eventType = eventType.substring(6);
            if (eventType) {
              this.a2aEventType = eventType;
            }
          }
          this.a2aSourceType = eventType;
        }
      }

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
    // https://www.openarchieven.nl/frl:ddbcbbb4-6c3a-4fca-a222-505a70ac75bf
    if (/^https\:\/\/www\.openarchieven\.nl\/\w+\:[a-zA-Z0-9\-]+(?:\/\w\w)?\/?$/.test(url)) {
      let archive = url.replace(/^https\:\/\/www\.openarchieven\.nl\/(\w+)\:[a-zA-Z0-9\-]+(?:\/\w\w)?\/?$/, "$1");
      if (archive && archive != url) {
        this.urlArchive = archive;
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  extractA2aFieldByKey(object, key) {
    if (object) {
      let value = object[key];
      if (!value) {
        value = object["a2a:" + key];
      }
      return value;
    }
  }

  makeNameObjFromA2aName(a2aName) {
    // e.g. "a2a:PersonName": { "a2a:PersonNameFirstName": "Hendrik", "a2a:PersonNameLastName": "Goudemond" },

    if (a2aName) {
      let nameObj = new NameObj();

      let firstName = this.extractA2aFieldByKey(a2aName, "PersonNameFirstName");
      let lastNamePrefix = this.extractA2aFieldByKey(a2aName, "PersonNamePrefixLastName");
      let patronym = this.extractA2aFieldByKey(a2aName, "PersonNamePatronym");
      let lastName = this.extractA2aFieldByKey(a2aName, "PersonNameLastName");

      if (firstName && firstName != "NN" && firstName != "N.N." && firstName != []) {
        nameObj.setForenames(firstName);
      }
      if (lastName || patronym || lastNamePrefix) {
        let finalLastName = lastName;
        if (finalLastName == "NN" || finalLastName == "N.N." || finalLastName == []) {
          finalLastName = "";
        }

        if (lastNamePrefix && lastNamePrefix != []) {
          if (finalLastName) {
            finalLastName = lastNamePrefix + " " + finalLastName;
          } else {
            finalLastName = lastNamePrefix;
          }
        }

        if (patronym && patronym != []) {
          if (finalLastName) {
            finalLastName = patronym + " " + finalLastName;
          } else {
            finalLastName = patronym;
          }
        }

        if (finalLastName) {
          nameObj.setLastName(finalLastName);
        }
      }

      return nameObj;
    }
  }

  makeFullNameFromA2aName(a2aName) {
    // e.g. "a2a:PersonName": { "a2a:PersonNameFirstName": "Hendrik", "a2a:PersonNameLastName": "Goudemond" },

    if (a2aName) {
      let fullName = "";

      let firstName = this.extractA2aFieldByKey(a2aName, "PersonNameFirstName");
      let lastNamePrefix = this.extractA2aFieldByKey(a2aName, "PersonNamePrefixLastName");
      let patronym = this.extractA2aFieldByKey(a2aName, "PersonNamePatronym");
      let lastName = this.extractA2aFieldByKey(a2aName, "PersonNameLastName");

      if (firstName && firstName != "NN" && firstName != "N.N.") {
        fullName = firstName;
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
          if (fullName) {
            fullName += " ";
          }
          fullName += finalLastName;
        }
      }

      return fullName;
    }
  }

  makeDateObjFromA2aDate(a2aDate) {
    // e.g.       "a2a:EventDate": { "a2a:Year": "1789", "a2a:Month": "8", "a2a:Day": "14" },
    if (a2aDate) {
      let day = this.extractA2aFieldByKey(a2aDate, "Day");
      let month = this.extractA2aFieldByKey(a2aDate, "Month");
      let year = this.extractA2aFieldByKey(a2aDate, "Year");

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
      let place = this.extractA2aFieldByKey(a2aPlace, "Place");
      let province = this.extractA2aFieldByKey(a2aPlace, "Province");
      let country = this.extractA2aFieldByKey(a2aPlace, "Country");

      let placeString = "";

      function addPart(part) {
        if (part) {
          if (placeString) {
            placeString += ", ";
          }
          placeString += part;
        }
      }

      if (place && !province && !country) {
        let placeInfo = placeData[place];
        if (placeInfo) {
          province = placeInfo.province;
          country = placeInfo.country;
        }
      }

      // this may be a bad assumption as records could be in Belgium?
      // If there is no place at all don't make a place just for country
      if ((place || province) && !country) {
        country = "Nederland";
      }

      addPart(place);
      addPart(province);
      addPart(country);

      if (placeString) {
        let placeObj = new PlaceObj();
        placeObj.placeString = placeString;
        if (country) {
          placeObj.country = country;
        }
        return placeObj;
      }
    }
  }

  ageFromA2aAge(a2aAge) {
    if (a2aAge) {
      let age = this.extractA2aFieldByKey(a2aAge, "PersonAgeYears");
      if (!age) {
        age = this.extractA2aFieldByKey(a2aAge, "PersonAgeLiteral");
      }
      if (age) {
        age = age.replace(/ jaar$/, "");
        age = age.replace(/\s+jaar/, " years");
        age = age.replace(/\s+weken/, " weeks");
        age = age.replace(/\s+dagen/, " days");
      }

      return age;
    }
  }

  makeParentsFromPersonObjects(father, mother) {
    if (father || mother) {
      let parents = {};
      if (father) {
        let fatherName = this.extractA2aFieldByKey(father, "PersonName");
        parents.father = {};
        parents.father.name = this.makeNameObjFromA2aName(fatherName);
      }
      if (mother) {
        let motherName = this.extractA2aFieldByKey(mother, "PersonName");
        parents.mother = {};
        parents.mother.name = this.makeNameObjFromA2aName(motherName);
      }
      return parents;
    }
  }

  extractEventFieldByKey(key) {
    let event = this.extractA2aFieldByKey(this.a2a, "Event");
    if (event) {
      return this.extractA2aFieldByKey(event, key);
    }
  }

  extractSourceFieldByKey(key) {
    let source = this.extractA2aFieldByKey(this.a2a, "Source");
    if (source) {
      return this.extractA2aFieldByKey(source, key);
    }
  }

  extractPersonFieldByKey(person, key) {
    if (person) {
      return this.extractA2aFieldByKey(person, key);
    }
  }

  extractPrimaryPersonFieldByKey(key) {
    let person = this.findPrimaryPerson();
    if (person) {
      return this.extractA2aFieldByKey(person, key);
    }
  }

  getNameForReferenceKey(key) {
    let name = undefined;
    if (this.typeData && this.typeData.referenceKeys) {
      name = this.typeData.referenceKeys[key];

      if (name === undefined) {
        name = typeData.default.referenceKeys["a2a:" + key];
      }
    }

    if (name === undefined) {
      name = typeData.default.referenceKeys[key];
      if (name === undefined) {
        name = typeData.default.referenceKeys["a2a:" + key];
      }
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
        let relationshipArray = this.extractA2aFieldByKey(this.a2a, "RelationEP");
        if (relationshipArray) {
          if (Array.isArray(relationshipArray)) {
            for (let relation of relationshipArray) {
              let type = this.extractA2aFieldByKey(relation, "RelationType");
              if (type == a2aRelationType) {
                return relation;
              }
            }
          } else {
            let relation = relationshipArray;
            let type = this.extractA2aFieldByKey(relation, "RelationType");
            if (type == a2aRelationType) {
              return relation;
            }
          }
        }
      }
    }
  }

  findPersonById(pid) {
    let personArray = this.extractA2aFieldByKey(this.a2a, "Person");
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
      let pid = this.extractA2aFieldByKey(relation, "PersonKeyRef");
      if (pid) {
        return this.findPersonById(pid);
      }
    }
  }

  findPrimaryPerson() {
    let relation = this.findRelationshipByType(RelationType.primary);
    if (relation) {
      let pid = this.extractA2aFieldByKey(relation, "PersonKeyRef");
      if (pid) {
        return this.findPersonById(pid);
      }
    } else {
      let personArray = this.extractA2aFieldByKey(this.a2a, "Person");
      if (personArray) {
        if (Array.isArray(personArray)) {
          if (personArray && personArray.length > 0) {
            return personArray[0];
          }
        } else {
          return personArray;
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

    return true;
  }

  getSourceType() {
    return "record";
  }

  getNameObj() {
    let a2aName = this.extractPrimaryPersonFieldByKey("PersonName");
    return this.makeNameObjFromA2aName(a2aName);
  }

  getGender() {
    if (this.typeData && this.typeData.fixedGender) {
      return this.typeData.fixedGender;
    }

    let a2aGender = this.extractPrimaryPersonFieldByKey("Gender");
    if (a2aGender == "Man") {
      return "male";
    } else if (a2aGender == "Vrouw") {
      return "female";
    }

    return "";
  }

  getEventDateObj() {
    let a2aDate = this.extractEventFieldByKey("EventDate");

    if (a2aDate && Object.keys(a2aDate).length > 0) {
      let dateObj = this.makeDateObjFromA2aDate(a2aDate);
      if (dateObj) {
        return dateObj;
      }
    }

    a2aDate = this.extractSourceFieldByKey("SourceDate");
    if (a2aDate && Object.keys(a2aDate).length > 0) {
      let dateObj = this.makeDateObjFromA2aDate(a2aDate);
      if (dateObj) {
        return dateObj;
      }
    }

    let dateRange = this.extractSourceFieldByKey("SourceIndexDate");
    if (dateRange) {
      let from = this.extractA2aFieldByKey(dateRange, "From");
      let to = this.extractA2aFieldByKey(dateRange, "To");
      if (from && to) {
        let fromDateObj = this.makeDateObjFromYyyymmddDate(from, "-");
        let toDateObj = this.makeDateObjFromYyyymmddDate(to, "-");
        if (fromDateObj && toDateObj) {
          let dateObj = new DateObj();
          dateObj.yearString = fromDateObj.getYearString();
          dateObj.fromDate = fromDateObj;
          dateObj.toDate = toDateObj;
          return dateObj;
        }
      }
    }
  }

  getEventPlaceObj() {
    let a2aPlace = this.extractEventFieldByKey("EventPlace");
    if (!a2aPlace) {
      a2aPlace = this.extractSourceFieldByKey("SourcePlace");
    }
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
    let a2aDate = this.extractPrimaryPersonFieldByKey("BirthDate");
    return this.makeDateObjFromA2aDate(a2aDate);
  }

  getBirthPlaceObj() {
    let place = this.extractPrimaryPersonFieldByKey("BirthPlace");
    let placeObj = this.makePlaceObjFromA2aPlace(place);
    return placeObj;
  }

  getDeathDateObj() {
    return undefined;
  }

  getDeathPlaceObj() {
    return undefined;
  }

  getAgeAtEvent() {
    let a2aAge = this.extractPrimaryPersonFieldByKey("Age");
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
    let profession = this.extractPrimaryPersonFieldByKey("Profession");
    return cleanOccupation(profession);

    return "";
  }

  getSpouses() {
    let bride = this.findPersonByRelationType(RelationType.bride);
    if (bride) {
      let brideName = this.extractPersonFieldByKey(bride, "PersonName");
      let spouseNameObj = this.makeNameObjFromA2aName(brideName);
      let a2aAge = this.extractPersonFieldByKey(bride, "Age");
      let age = this.ageFromA2aAge(a2aAge);
      let eventDateObj = this.getEventDateObj();
      let eventPlaceObj = this.getEventPlaceObj();

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

      return [spouseObj];
    }

    // for a death or burial or other records it can give the spouse
    let spouse = this.findPersonByRelationType(RelationType.spouse);
    if (spouse) {
      let spouseName = this.extractPersonFieldByKey(spouse, "PersonName");
      let spouseNameObj = this.makeNameObjFromA2aName(spouseName);
      let spouseObj = this.makeSpouseObj(spouseNameObj);
      return [spouseObj];
    }
  }

  getParents() {
    let father = this.findPersonByRelationType(RelationType.father);
    let mother = this.findPersonByRelationType(RelationType.mother);
    return this.makeParentsFromPersonObjects(father, mother);
  }

  getHousehold() {
    if (this.a2aSourceType == "Bevolkingsregister") {
      let personArray = this.extractA2aFieldByKey(this.a2a, "Person");
      if (personArray.length > 1) {
        let householdArray = [];
        let fields = ["name"];

        for (let person of personArray) {
          let a2aName = this.extractPersonFieldByKey(person, "PersonName");
          let name = this.makeFullNameFromA2aName(a2aName);

          if (name) {
            let householdMember = { name: name };

            function addMemberField(reader, dataKey, fieldName, type = "") {
              let value = reader.extractPersonFieldByKey(person, dataKey);
              if (value) {
                if (type == "date") {
                  let dateObj = reader.makeDateObjFromA2aDate(value);
                  if (dateObj) {
                    value = dateObj.getDateString();
                  }
                } else if (type == "place") {
                  let place = reader.extractA2aFieldByKey(value, "Place");
                  if (place) {
                    value = place;
                  } else {
                    value = "";
                  }
                }

                householdMember[fieldName] = value;
                if (!fields.includes(fieldName)) {
                  fields.push(fieldName);
                }
              }
            }

            addMemberField(this, "Profession", "profession");
            addMemberField(this, "BirthDate", "birthDate", "date");
            addMemberField(this, "BirthPlace", "birthPlace", "place");

            householdArray.push(householdMember);
          }
        }

        let result = {};
        result.members = householdArray;
        result.fields = fields;
        return result;
      }
    }
    return undefined;
  }

  getCollectionData() {
    if (this.a2aSourceType) {
      let collectionData = { id: this.a2aSourceType };

      let a2aName = this.extractPrimaryPersonFieldByKey("PersonName");
      if (a2aName) {
        let firstName = this.extractA2aFieldByKey(a2aName, "PersonNameFirstName");
        let lastNamePrefix = this.extractA2aFieldByKey(a2aName, "PersonNamePrefixLastName");
        let patronym = this.extractA2aFieldByKey(a2aName, "PersonNamePatronym");
        let lastName = this.extractA2aFieldByKey(a2aName, "PersonNameLastName");

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

      let a2aPlace = this.extractEventFieldByKey("EventPlace");
      if (!a2aPlace) {
        a2aPlace = this.extractSourceFieldByKey("SourcePlace");
      }
      if (a2aPlace) {
        let place = this.extractA2aFieldByKey(a2aPlace, "Place");
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

    if (this.typeData && this.typeData.nlDocumentType) {
      title = this.typeData.nlDocumentType;
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
    let type = options.citation_openarch_sourceRefType;

    if (type == "pageWithLinks") {
      if (this.ed.citationParts && this.ed.citationParts.length > 0) {
        let string = "";
        for (let part of this.ed.citationParts) {
          if (part.type == "1" && part.tag) {
            let tag = part.tag.toLowerCase();
            if (tag == "a") {
              if (part.href && part.text) {
                string += "[" + part.href + " " + part.text + "]";
              } else if (part.text) {
                string += part.text;
              }
            } else if (tag == "br") {
              string += "<br/>";
            } else {
              string += part.text;
            }
          } else {
            string += part.text;
          }
        }
        return string;
      } else if (this.ed.citationText) {
        return this.ed.citationText;
      }
    } else if (type == "page" && this.ed.citationText) {
      return this.ed.citationText;
    }

    let reference = this.extractSourceFieldByKey("SourceReference");
    if (!reference) {
      return "";
    }

    let string = "";

    function addPart(reader, referenceKey) {
      let value = reader.extractA2aFieldByKey(reference, referenceKey);

      if (value) {
        let name = reader.getNameForReferenceKey(referenceKey);

        if (referenceKey == "Collection") {
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

    addPart(this, "InstitutionName");
    addPart(this, "Collection");

    if (options.citation_openarch_includeArchiveNumInSourceRef) {
      addPart(this, "Archive");
    }
    if (options.citation_openarch_includeRegNumInSourceRef) {
      addPart(this, "RegistryNumber");
    }
    if (options.citation_openarch_includeDocNumInSourceRef) {
      addPart(this, "DocumentNumber");
    }
    addPart(this, "Book");
    if (options.citation_openarch_includeFolioNumInSourceRef) {
      addPart(this, "Folio");
    }
    return string;
  }

  getExternalLink() {
    let externalLink = {
      link: "",
      text: "",
    };

    let originalSourceLink = this.extractSourceFieldByKey("SourceDigitalOriginal");

    if (originalSourceLink) {
      externalLink.link = originalSourceLink;

      externalLink.text = "External Record";
      let reference = this.extractSourceFieldByKey("SourceReference");
      if (reference) {
        let institution = this.extractA2aFieldByKey(reference, "InstitutionName");
        if (institution) {
          externalLink.text = institution + " Record";
        }
      }

      return externalLink;
    }
  }
}

export { OpenarchEdReader };
