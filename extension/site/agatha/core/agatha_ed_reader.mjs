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
import { ExtractedDataReader } from "../../../base/core/extracted_data_reader.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { NameObj, DateObj, PlaceObj } from "../../../base/core/generalize_data_utils.mjs";

const typeMap = {
  "actes de baptêmes": RT.Baptism,
  doopakten: RT.Baptism,
  taufurkunden: RT.Baptism,
  "baptism certificates": RT.Baptism,
  "actes de sépultures": RT.Burial,
  begrafenisakten: RT.Burial,
  bestattungsurkunden: RT.Burial,
  "funeral certificates": RT.Burial,
  "actes de mariages": RT.Marriage,
  huwelijksakten: RT.Marriage,
  eheschließungsurkunden: RT.Marriage,
  "marriage certificates": RT.Marriage,
  "actes de décès": RT.DeathRegistration,
  overlijdensakten: RT.DeathRegistration,
  sterbeurkunden: RT.DeathRegistration,
  "death certificates": RT.DeathRegistration,
  "actes de naissances": RT.BirthRegistration,
  geboorteakten: RT.BirthRegistration,
  geburtsurkunden: RT.BirthRegistration,
  "birth certificates": RT.BirthRegistration,
};

const nameMap = [
  // [list of options], type if civil record, type if parish record
  [
    ["geboorteakten", "actes de naissances", "birth certificates", "geburtsurkunden"],
    RT.BirthRegistration,
    RT.BirthRegistration,
  ],
  [["doopakten", "actes de baptêmes", "baptism certificates", "taufurkunden"], RT.Baptism, RT.Baptism],
  [
    [
      "huwelijksbeloften en -akten",
      "actes de promesses de mariage et mariages",
      "nuptial vow and marriage certificates",
      "eheversprechens- und eheschließungsurkunden",
    ],
    RT.Marriage,
    RT.Marriage,
    ["sponsalia", "matrimonium"],
  ],
  [
    ["huwelijksakten", "actes de mariages", "marriage certificates", "eheschließungsurkunden"],
    RT.Marriage,
    RT.Marriage,
  ],
  [
    [
      "begrafenis- en overlijdensakten",
      "actes de sépultures et décès",
      "funeral and death certificates",
      "bestattungs- und sterbeurkunden",
    ],
    RT.DeathOrBurial,
    RT.DeathOrBurial,
  ],
  [["begrafenisakten", "actes de sépultures", "funeral certificates", "bestattungsurkunden"], RT.Burial, RT.Burial],
  [["overlijdensakten", "actes de décès", "death certificates", "sterbeurkunden"], RT.DeathRegistration, RT.Death],
];

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
  },
  Baptism: {
    // Baptismal registers
    primary: ["enfant baptisé", "dopeling", "täufling", "baptized child"],
    father: [
      "père de l'enfant baptisé",
      "vader van de dopeling",
      "vater des täuflings",
      "father of the baptized child",
    ],
    mother: [
      "mère de l'enfant baptisé",
      "moeder van de dopeling",
      "mutter des täuflings",
      "mother of the baptized child",
    ],
    godfather: ["parrain", "peter", "pate", "godfather"],
    godmother: ["marraine", "meter", "patin", "godmother"],
  },
  Burial: {
    // Burial registers
    primary: ["défunt / défunte", "overledene", "verstorbener", "deceased"],
    father: [
      "père du défunt / de la défunte",
      "vader van de overledene",
      "vater des verstorbenen",
      "father of the deceased",
    ],
    mother: [
      "mère du défunt / de la défunte",
      "moeder van de overledene",
      "mutter des verstorbenen",
      "mother of the deceased",
    ],
    spouse: [
      "partenaire du défunt / de la défunte",
      "partner van de overledene",
      "partner des verstorbenen",
      "partner of the deceased",
    ],
  },
  DeathRegistration: {
    // Death records
    primary: ["défunt / défunte", "overledene", "verstorbener", "deceased"],
    father: [
      "père du défunt / de la défunte",
      "vader van de overledene",
      "vater des verstorbenen",
      "father of the deceased",
    ],
    mother: [
      "mère du défunt / de la défunte",
      "moeder van de overledene",
      "mutter des verstorbenen",
      "mother of the deceased",
    ],
    spouse: [
      "partenaire du défunt / de la défunte",
      "partner van de overledene",
      "partner des verstorbenen",
      "partner of the deceased",
    ],
  },
  BirthRegistration: {
    // Birth records
    primary: ["enfant", "kind", "child"], // kind is the same for both Dutch and German
    father: ["père", "vader", "vater", "father"],
    mother: ["mère", "moeder", "mutter", "mother"],
  },
  Marriage: {
    // Marriage registers
    bride: ["épouse", "bruid", "braut", "bride"],
    father_of_bride: ["père de l'épouse", "vader van bruid", "vater der braut", "father of the bride"],
    mother_of_bride: ["mère de l'épouse", "moeder van bruid", "mutter der braut", "mother of the bride"],
    groom: ["époux", "bruidegom", "bräutigam", "groom"],
    father_of_groom: ["père de l'époux", "vader van de bruidegom", "vater der bräutigams", "father of the groom"],
    mother_of_groom: ["mère de l'époux", "moeder van de bruidegom", "mutter der bräutigams", "mother of the husband"],
  },
};

const personFields = {
  fullname: [
    "nom et prénom",
    "naam en voornaam",
    "name und vorname",
    "name and first name",
    "prénom et nom",
    "voornaam en naam",
    "vorname und name",
    "first name and name",
  ],
  birthplace: ["lieu de naissance", "geboorteplaats", "geburtsort", "place of birth"],
  birthdate: ["date de naissance", "geboortedatum", "geburtsdatum", "date of birth"],
  deathplace: ["lieu de décès", "overlijdensplaats", "sterbeort", "place of death"],
  deathdate: ["date de décès", "overlijdensdatum", "sterbedatum", "date of death"],
  residence: ["lieu de résidence", "woonplaats", "wohnort", "place of residence"],
  age: ["age", "leeftijd", "alter"], // age is the same for both French and English
  profession: ["profession", "beroep", "beruf"], // profession is the same for both French and English
};

const metadataFields = {
  record_type: [
    "type d'actes",
    "aktetype",
    "art der urkunde",
    "type of records",
    "type d'acte",
    "type of record",
    "aktentyp",
  ],
  project: ["projet", "project", "projekt"], // project is the same for both Dutch and English
  location: ["lieu", "plaats", "ort", "location"],
  description: ["description", "beschrijving", "beschreibung"], // description is the same for both French and English
  remark: ["remarque", "opmerking", "bemerkung", "remark"],
  record_date: ["date de l'acte", "aktedatum", "datum der urkunde", "date of record", "datum van de akte"],
};

class AgathaEdReader extends ExtractedDataReader {
  constructor(ed, primaryPersonIndex) {
    super(ed);
    this.primaryPersonIndex = primaryPersonIndex;
    let recordType = this.findAnyField(ed.metadata, metadataFields.record_type);
    if (recordType) {
      recordType = typeMap[recordType.toLowerCase()];
      if (recordType) {
        this.recordType = recordType;
      }
    } else if (!ed.isRecord) {
      this.recordType = this.guessType(ed.metadata.selection);
    }
    this.type = typeData[this.recordType];
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  findPrimary() {
    if (this.type) {
      let primaryKeys = this.type["primary"];
      if (!primaryKeys) {
        // No single primary person. Only supported record type is marriage
        if (this.primaryPersonIndex == 0) {
          return this.findPersonMatchingAny(this.type["bride"]);
        } else {
          return this.findPersonMatchingAny(this.type["groom"]);
        }
      } else {
        return this.findPersonMatchingAny(primaryKeys);
      }
    }
  }

  findPersonMatchingAny(keys) {
    if (this.ed.people && keys) {
      for (let key of keys) {
        let person = this.ed.people[key];
        if (person) {
          return person[0];
        }
      }
    }
  }

  findAnyField(obj, keys) {
    if (obj && keys) {
      for (let key of keys) {
        let field = obj[key];
        if (field) {
          return field;
        }
      }
    }
  }

  normalizeAge(ageString) {
    // Some languages use the same word for both a single and multiple time units (1 year and 2 years vs. 1 jaar en 2 jaar)
    if (ageString) {
      let result = ageString.toLowerCase().replace(/ans|jaar|jahre/, "years");
      result = result.replace(/mois|maanden|monate/, "months");
      result = result.replace(/jours|dagen|tage/, "days");
      result = result.replace(/an|jahr/, "year");
      result = result.replace(/maand|monat/, "month");
      result = result.replace(/jour|dag|tag/, "day");
      return result;
    }
  }

  guessType(groupName) {
    if (groupName) {
      const groupNameLC = groupName.toLowerCase();
      let idx = 1;
      if (groupNameLC.includes(":")) {
        // Parish register (e.g., Dworp (Beersel): Sint-Gaugericus)
        idx += 1;
      }
      for (let typ of nameMap) {
        for (let opt of typ[0]) {
          if (groupNameLC.includes(opt)) {
            return typ[idx];
          }
        }
      }
    }
    return RT.Unclassified;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  // Note: there are default implementations in ExtractedDataReader and, if using a data-driven
  // style, you may not need to override them here.
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getSourceType() {
    if (this.ed.isRecord) {
      return "record";
    }
    return "image";
  }

  getNameObj() {
    let primary = this.findPrimary();
    if (primary) {
      let name = this.findAnyField(primary, personFields.fullname);
      if (name) {
        return this.makeNameObjFromFullName(name);
      }
    }
  }

  getEventDateObj() {
    if (this.ed && this.ed.metadata) {
      let date = this.findAnyField(this.ed.metadata, metadataFields.record_date);
      if (date) {
        return this.makeDateObjFromDdmmyyyyDate(date, /[/-]+/);
      }
    }
  }

  getEventPlaceObj() {
    if (this.ed && this.ed.metadata) {
      let place = this.findAnyField(this.ed.metadata, metadataFields.location);
      if (place) {
        return this.makePlaceObjFromFullPlaceName(place);
      }
    }
    let placeString = this.getValueUsingRecordTypeData("eventPlace");

    if (placeString) {
      let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
      if (placeObj) {
        return placeObj;
      }
    }
    return undefined;
  }

  getBirthDateObj() {
    let primary = this.findPrimary();
    if (primary) {
      let bd = this.findAnyField(primary, personFields.birthdate);
      if (bd) {
        return this.makeDateObjFromDdmmyyyyDate(bd, /[/-]+/);
      }
    }
  }

  getBirthPlaceObj() {
    let placeString;
    let primary = this.findPrimary();
    if (primary) {
      placeString = this.findAnyField(primary, personFields.birthplace);
    }
    /*if (!placeString && (this.recordType == RT.BirthRegistration || this.recordType == RT.Baptism)) {
      return this.getEventPlaceObj();
    }*/

    if (placeString || this.recordType == RT.Birth || this.recordType == RT.BirthRegistration) {
      let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
      if (placeObj) {
        return placeObj;
      }
    }
    return undefined;
  }

  getDeathDateObj() {
    let primary = this.findPrimary();
    if (primary) {
      let dd = this.findAnyField(primary, personFields.deathdate);
      if (dd) {
        return this.makeDateObjFromDdmmyyyyDate(dd, /[/-]+/);
      }
    }
  }

  getDeathPlaceObj() {
    let placeString;
    let primary = this.findPrimary();
    if (primary) {
      placeString = this.findAnyField(primary, personFields.deathplace);
    }
    /*if (!placeString && (this.recordType == RT.DeathRegistration || this.recordType == RT.Burial)) {
      return this.getEventPlaceObj();
    }*/

    if (placeString || this.recordType == RT.Death || this.recordType == RT.DeathRegistration) {
      let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
      if (placeObj) {
        return placeObj;
      }
    }
    return undefined;
  }

  getResidencePlaceObj() {
    let placeString;
    let primary = this.findPrimary();
    if (primary) {
      placeString = this.findAnyField(primary, personFields.residence);
    }
    if (placeString) {
      let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
      if (placeObj) {
        return placeObj;
      }
    }
    return undefined;
  }

  getAgeAtEvent() {
    let primary = this.findPrimary();
    if (primary) {
      return this.normalizeAge(this.findAnyField(primary, personFields.age));
    }
  }

  getOccupation() {
    let primary = this.findPrimary();
    if (primary) {
      return this.findAnyField(primary, personFields.profession);
    }
  }

  getSpouses() {
    if (this.type) {
      let spouse = this.findPersonMatchingAny(this.type["spouse"]);
      let date = undefined,
        place = undefined;
      if (this.recordType == RT.Marriage) {
        date = this.findAnyField(this.ed.metadata, metadataFields.record_date);
        place = this.findAnyField(this.ed.metadata, metadataFields.location);
        if (!spouse && this.recordType == RT.Marriage) {
          if (this.primaryPersonIndex == 0) {
            spouse = this.findPersonMatchingAny(this.type["groom"]);
          } else {
            spouse = this.findPersonMatchingAny(this.type["bride"]);
          }
        }
      }
      if (spouse) {
        let spouseName = this.makeNameObjFromFullName(this.findAnyField(spouse, personFields.fullname));
        let age = this.normalizeAge(this.findAnyField(spouse, personFields.age));
        return [this.makeSpouseObj(spouseName, date, place, age)];
      }
    }
  }

  getParents() {
    let fatherName, motherName;
    if (this.type) {
      let father = this.findPersonMatchingAny(this.type["father"]);
      if (father) {
        fatherName = this.findAnyField(father, personFields.fullname);
      }
      let mother = this.findPersonMatchingAny(this.type["mother"]);
      if (mother) {
        motherName = this.findAnyField(mother, personFields.fullname);
      }
    }
    return this.makeParentsFromFullNames(fatherName, motherName);
  }

  setCustomFields(gd) {
    if (this.ed.isRecord) {
      let projectURL = this.findAnyField(this.ed.metadata, metadataFields.project);
      if (projectURL) {
        let parts = projectURL.split("/");
        gd.project = parts[parts.length - 1];
      }
    }
  }

  getPrimaryPersonOptions() {
    if (this.recordType == RT.Marriage) {
      let bride = this.findPersonMatchingAny(this.type.bride);
      let groom = this.findPersonMatchingAny(this.type.groom);
      let brideName = this.findAnyField(bride, personFields.fullname);
      let groomName = this.findAnyField(groom, personFields.fullname);

      if (brideName && groomName) {
        let options = [brideName + " (bride)", groomName + " (groom)"];
        return options;
      }
    }

    return undefined;
  }
}

export { AgathaEdReader };
