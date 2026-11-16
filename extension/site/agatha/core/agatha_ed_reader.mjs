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

function cleanDate(edReader, value) {
  let cleanString = value;
  cleanString = cleanString.replaceAll("-", "/"); // Sometimes dates are dd-mm-yyyy
  return cleanString;
}

function cleanAge(edReader, ageString) {
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

const marriageTemplate = {
  groomFullName: {
    recordDataKeys: [
      "époux::nom et prénom",
      "époux::prénom et nom",
      "bruidegom::naam en voornaam",
      "bruidegom::voornaam en naam",
      "bräutigam::name und vorname",
      "bräutigam::vorname und name",
      "groom::name and first name",
      "groom::first name and name",
    ],
  },
  groomBirthDate: {
    recordDataKeys: [
      "époux::date de naissance",
      "bruidegom::geboortedatum",
      "bräutigam::geburtsdatum",
      "groom::date of birth",
    ],
    cleanFunction: cleanDate,
  },
  groomBirthPlace: {
    recordDataKeys: [
      "époux::lieu de naissance",
      "bruidegom::geboorteplaats",
      "bräutigam::geburtsort",
      "groom::place of birth",
    ],
  },
  groomAge: {
    recordDataKeys: ["époux::age", "bruidegom::leeftijd", "bräutigam::alter", "groom::age"],
    cleanFunction: cleanAge,
  },
  groomFatherFullName: {
    recordDataKeys: [
      "père de l'époux::nom et prénom",
      "père de l'époux::prénom et nom",
      "vader van de bruidegom::naam en voornaam",
      "vader van de bruidegom::voornaam en naam",
      "vater des bräutigams::name und vorname",
      "vater des bräutigams::vorname und name",
      "father of the groom::name and first name",
      "father of the groom::first name and name",
    ],
  },
  groomMotherFullName: {
    recordDataKeys: [
      "mère de l'époux::nom et prénom",
      "mère de l'époux::prénom et nom",
      "moeder van de bruidegom::naam en voornaam",
      "moeder van de bruidegom::voornaam en naam",
      "mutter des bräutigams::name und vorname",
      "mutter des bräutigams::vorname und name",
      "mother of the husband::name and first name",
      "mother of the husband::first name and name",
    ],
  },
  brideFullName: {
    recordDataKeys: [
      "épouse::nom et prénom",
      "épouse::prénom et nom",
      "bruid::naam en voornaam",
      "bruid::voornaam en naam",
      "braut::name und vorname",
      "braut::vorname und name",
      "bride::name and first name",
      "bride::first name and name",
    ],
  },
  brideBirthDate: {
    recordDataKeys: [
      "épouse::date de naissance",
      "bruid::geboortedatum",
      "braut::geburtsdatum",
      "bride::date of birth",
    ],
    cleanFunction: cleanDate,
  },
  brideBirthPlace: {
    recordDataKeys: [
      "épouse::lieu de naissance",
      "bruid::geboorteplaats",
      "braut::geburtsort",
      "bride::place of birth",
    ],
  },
  brideAge: {
    recordDataKeys: ["épouse::age", "bruid::leeftijd", "braut::alter", "bride::age"],
    cleanFunction: cleanAge,
  },
  brideFatherFullName: {
    recordDataKeys: [
      "père de l'épouse::nom et prénom",
      "père de l'épouse::prénom et nom",
      "vader van de bruid::naam en voornaam",
      "vader van de bruid::voornaam en naam",
      "vater der braut::name und vorname",
      "vater der braut::vorname und name",
      "father of the bride::name and first name",
      "father of the bride::first name and name",
    ],
  },
  brideMotherFullName: {
    recordDataKeys: [
      "mère de l'épouse::nom et prénom",
      "mère de l'épouse::prénom et nom",
      "moeder van de bruid::naam en voornaam",
      "moeder van de bruid::voornaam en naam",
      "mutter der braut::name und vorname",
      "mutter der braut::vorname und name",
      "mother of the bride::name and first name",
      "mother of the bride::first name and name",
    ],
  },
};

function initializeRulesMarriage(type, primaryPersonIndex) {
  if (primaryPersonIndex == 1) {
    // Groom selected
    type.rules.fullName = marriageTemplate.groomFullName;
    type.rules.birthDate = marriageTemplate.groomBirthDate;
    type.rules.birthPlace = marriageTemplate.groomBirthPlace;
    type.rules.ageAtEvent = marriageTemplate.groomAge;
    type.rules.fatherFullName = marriageTemplate.groomFatherFullName;
    type.rules.motherFullName = marriageTemplate.groomMotherFullName;
    type.rules.spouseFullName = marriageTemplate.brideFullName;
    type.rules.spouseBirthDate = marriageTemplate.brideBirthDate;
    type.rules.spouseBirthPlace = marriageTemplate.brideBirthPlace;
    type.rules.spouseAge = marriageTemplate.brideAge;
    type.rules.spouseFatherFullName = marriageTemplate.brideFatherFullName;
    type.rules.spouseMotherFullName = marriageTemplate.brideMotherFullName;
  } else {
    // Default or bride is selected
    type.rules.fullName = marriageTemplate.brideFullName;
    type.rules.birthDate = marriageTemplate.brideBirthDate;
    type.rules.birthPlace = marriageTemplate.brideBirthPlace;
    type.rules.ageAtEvent = marriageTemplate.brideAge;
    type.rules.fatherFullName = marriageTemplate.brideFatherFullName;
    type.rules.motherFullName = marriageTemplate.brideMotherFullName;
    type.rules.spouseFullName = marriageTemplate.groomFullName;
    type.rules.spouseBirthDate = marriageTemplate.groomBirthDate;
    type.rules.spouseBirthPlace = marriageTemplate.groomBirthPlace;
    type.rules.spouseAge = marriageTemplate.groomAge;
    type.rules.spouseFatherFullName = marriageTemplate.groomFatherFullName;
    type.rules.spouseMotherFullName = marriageTemplate.groomMotherFullName;
  }
}

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

const recordTypes = [
  {
    recordType: RT.BirthRegistration, // Belgium only has baptism records and birth registrations
    matchData: {
      type: ["actes de naissances", "geboorteakten", "geburtsurkunden", "birth certificates"],
    },
    rules: {
      fullName: {
        recordDataKeys: [
          "enfant::nom et prénom",
          "enfant::prénom et nom",
          "kind::naam en voornaam",
          "kind::voornaam en naam",
          "kind::name und vorname",
          "kind::vorname und name",
          "child::name and first name",
          "child::first name and name",
        ],
      },
      birthDate: {
        recordDataKeys: [
          "enfant::date de naissance",
          "kind::geboortedatum",
          "kind::geburtsdatum",
          "child::date of birth",
        ],
        cleanFunction: cleanDate,
      },
      birthPlace: {
        recordDataKeys: [
          "enfant::lieu de naissance",
          "kind::geboorteplaats",
          "kind::geburtsort",
          "child::place of birth",
        ],
      },
      fatherFullName: {
        recordDataKeys: [
          "père::nom et prénom",
          "père::prénom et nom",
          "vader::naam en voornaam",
          "vader::voornaam en naam",
          "vater::name und vorname",
          "vater::vorname und name",
          "father::name and first name",
          "father::first name and name",
        ],
      },
      motherFullName: {
        recordDataKeys: [
          "mère::nom et prénom",
          "mère::prénom et nom",
          "moeder::naam en voornaam",
          "moeder::voornaam en naam",
          "mutter::name und vorname",
          "mutter::vorname und name",
          "mother::name and first name",
          "mother::first name and name",
        ],
      },
    },
  },
  {
    recordType: RT.DeathRegistration,
    matchData: {
      type: ["actes de décès", "overlijdensakten", "sterbeurkunden", "death certificates"],
    },
    rules: {
      fullName: {
        recordDataKeys: [
          "défunt / défunte::nom et prénom",
          "défunt / défunte::prénom et nom",
          "overledene::naam en voornaam",
          "overledene::voornaam en naam",
          "verstorbener::name und vorname",
          "verstorbener::vorname und name",
          "deceased::name and first name",
          "deceased::first name and name",
        ],
      },
      birthDate: {
        recordDataKeys: [
          "défunt / défunte::date de naissance",
          "overledene::geboortedatum",
          "verstorbener::geburtsdatum",
          "deceased::date of birth",
        ],
        cleanFunction: cleanDate,
      },
      birthPlace: {
        recordDataKeys: [
          "défunt / défunte::lieu de naissance",
          "overledene::geboorteplaats",
          "verstorbener::geburtsort",
          "deceased::place of birth",
        ],
      },
      deathDate: {
        recordDataKeys: [
          "défunt / défunte::date de décès",
          "overledene::overlijdensdatum",
          "verstorbener::sterbedatum",
          "deceased::date of death",
        ],
        cleanFunction: cleanDate,
      },
      deathPlace: {
        recordDataKeys: [
          "défunt / défunte::lieu de décès",
          "overledene::overlijdensplaats",
          "verstorbener::sterbeort",
          "deceased::place of death",
        ],
      },
      ageAtEvent: {
        recordDataKeys: ["défunt / défunte::age", "overledene::leeftijd", "verstorbener::alter", "deceased::age"],
        cleanFunction: cleanAge,
      },
      fatherFullName: {
        recordDataKeys: [
          "père du défunt / de la défunte::nom et prénom",
          "père du défunt / de la défunte::prénom et nom",
          "vader van de overledene::naam en voornaam",
          "vader van de overledene::voornaam en naam",
          "vater des verstorbenen::name und vorname",
          "vater des verstorbenen::vorname und name",
          "father of the deceased::name and first name",
          "father of the deceased::first name and name",
        ],
      },
      motherFullName: {
        recordDataKeys: [
          "mère du défunt / de la défunte::nom et prénom",
          "mère du défunt / de la défunte::prénom et nom",
          "moeder van de overledene::naam en voornaam",
          "moeder van de overledene::voornaam en naam",
          "mutter des verstorbenen::name und vorname",
          "mutter des verstorbenen::vorname und name",
          "mother of the deceased::name and first name",
          "mother of the deceased::first name and name",
        ],
      },
      spouseFullName: {
        recordDataKeys: [
          "partenaire du défunt / de la défunte::nom et prénom",
          "partenaire du défunt / de la défunte::prénom et nom",
          "partner van de overledene::naam en voornaam",
          "partner van de overledene::voornaam en naam",
          "partner des verstorbenen::name und vorname",
          "partner des verstorbenen::vorname und name",
          "partner of the deceased::name and first name",
          "partner of the deceased::first name and name",
        ],
      },
      spouseAge: {
        recordDataKeys: [
          "partenaire du défunt / de la défunte::age",
          "partner van de overledene::leeftijd",
          "partner des verstorbenen::alter",
          "partner of the deceased::age",
        ],
        cleanFunction: cleanAge,
      },
    },
  },
  {
    recordType: RT.Burial,
    matchData: {
      type: ["actes de sépultures", "begrafenisakten", "bestattungsurkunden", "funeral certificates"],
    },
    rules: {
      fullName: {
        recordDataKeys: [
          "défunt / défunte::nom et prénom",
          "défunt / défunte::prénom et nom",
          "overledene::naam en voornaam",
          "overledene::voornaam en naam",
          "verstorbener::name und vorname",
          "verstorbener::vorname und name",
          "deceased::name and first name",
          "deceased::first name and name",
        ],
      },
      birthDate: {
        recordDataKeys: [
          "défunt / défunte::date de naissance",
          "overledene::geboortedatum",
          "verstorbener::geburtsdatum",
          "deceased::date of birth",
        ],
        cleanFunction: cleanDate,
      },
      birthPlace: {
        recordDataKeys: [
          "défunt / défunte::lieu de naissance",
          "overledene::geboorteplaats",
          "verstorbener::geburtsort",
          "deceased::place of birth",
        ],
      },
      deathDate: {
        recordDataKeys: [
          "défunt / défunte::date de décès",
          "overledene::overlijdensdatum",
          "verstorbener::sterbedatum",
          "deceased::date of death",
        ],
        cleanFunction: cleanDate,
      },
      deathPlace: {
        recordDataKeys: [
          "défunt / défunte::lieu de décès",
          "overledene::overlijdensplaats",
          "verstorbener::sterbeort",
          "deceased::place of death",
        ],
      },
      ageAtEvent: {
        recordDataKeys: ["défunt / défunte::age", "overledene::leeftijd", "verstorbener::alter", "deceased::age"],
        cleanFunction: cleanAge,
      },
      fatherFullName: {
        recordDataKeys: [
          "père du défunt / de la défunte::nom et prénom",
          "père du défunt / de la défunte::prénom et nom",
          "vader van de overledene::naam en voornaam",
          "vader van de overledene::voornaam en naam",
          "vater des verstorbenen::name und vorname",
          "vater des verstorbenen::vorname und name",
          "father of the deceased::name and first name",
          "father of the deceased::first name and name",
        ],
      },
      motherFullName: {
        recordDataKeys: [
          "mère du défunt / de la défunte::nom et prénom",
          "mère du défunt / de la défunte::prénom et nom",
          "moeder van de overledene::naam en voornaam",
          "moeder van de overledene::voornaam en naam",
          "mutter des verstorbenen::name und vorname",
          "mutter des verstorbenen::vorname und name",
          "mother of the deceased::name and first name",
          "mother of the deceased::first name and name",
        ],
      },
      spouseFullName: {
        recordDataKeys: [
          "partenaire du défunt / de la défunte::nom et prénom",
          "partenaire du défunt / de la défunte::prénom et nom",
          "partner van de overledene::naam en voornaam",
          "partner van de overledene::voornaam en naam",
          "partner des verstorbenen::name und vorname",
          "partner des verstorbenen::vorname und name",
          "partner of the deceased::name and first name",
          "partner of the deceased::first name and name",
        ],
      },
      spouseAge: {
        recordDataKeys: [
          "partenaire du défunt / de la défunte::age",
          "partner van de overledene::leeftijd",
          "partner des verstorbenen::alter",
          "partner of the deceased::age",
        ],
        cleanFunction: cleanAge,
      },
    },
  },
  {
    recordType: RT.Baptism,
    matchData: {
      type: ["actes de baptêmes", "doopakten", "taufurkunden", "baptism certificates"],
    },
    rules: {
      fullName: {
        recordDataKeys: [
          "enfant baptisé::nom et prénom",
          "enfant baptisé::prénom et nom",
          "dopeling::naam en voornaam",
          "dopeling::voornaam en naam",
          "täufling::name und vorname",
          "täufling::vorname und name",
          "baptized child::name and first name",
          "baptized child::first name and name",
        ],
      },
      birthDate: {
        recordDataKeys: [
          "enfant baptisé::date de naissance",
          "dopeling::geboortedatum",
          "täufling::geburtsdatum",
          "baptized child::date of birth",
        ],
        cleanFunction: cleanDate,
      },
      birthPlace: {
        recordDataKeys: [
          "enfant baptisé::lieu de naissance",
          "dopeling::geboorteplaats",
          "täufling::geburtsort",
          "baptized child::place of birth",
        ],
      },
      fatherFullName: {
        recordDataKeys: [
          "père de l'enfant baptisé::nom et prénom",
          "père de l'enfant baptisé::prénom et nom",
          "vader van de dopeling::naam en voornaam",
          "vader van de dopeling::voornaam en naam",
          "vater des täuflings::name und vorname",
          "vater des täuflings::vorname und name",
          "father of the baptized child::name and first name",
          "father of the baptized child::first name and name",
        ],
      },
      motherFullName: {
        recordDataKeys: [
          "mère de l'enfant baptisé::nom et prénom",
          "mère de l'enfant baptisé::prénom et nom",
          "moeder van de dopeling::naam en voornaam",
          "moeder van de dopeling::voornaam en naam",
          "mutter des täuflings::name und vorname",
          "mutter des täuflings::vorname und name",
          "mother of the baptized child::name and first name",
          "mother of the baptized child::first name and name",
        ],
      },
    },
  },
  {
    recordType: RT.Marriage,
    matchData: {
      type: ["actes de mariages", "huwelijksakten", "eheschließungsurkunden", "marriage certificates"],
    },
    initRulesFunction: initializeRulesMarriage,
    rules: {},
  },
];

const baseRecordTypeData = {
  rules: {
    recordType: {
      recordDataKeys: [
        "type d'actes",
        "aktetype",
        "art der urkunde",
        "type of records",
        "type d'acte",
        "type of record",
        "aktentyp",
      ],
    },
    project: {
      recordDataKeys: ["projet", "project", "projekt"], // project is the same for both Dutch and English
    },
    eventPlace: {
      recordDataKeys: ["lieu", "plaats", "ort", "location"],
    },
    description: {
      recordDataKeys: ["description", "beschrijving", "beschreibung"], // description is the same for both French and English
    },
    remark: {
      recordDataKeys: ["remarque", "opmerking", "bemerkung", "remark"],
    },
    eventDate: {
      recordDataKeys: ["date de l'acte", "aktedatum", "datum der urkunde", "date of record", "datum van de akte"],
      cleanFunction: cleanDate,
    },
  },
};

const imageRecordTypes = [
  {
    // Births
    typeIfParish: RT.BirthRegistration,
    typeIfCivil: RT.BirthRegistration,
    matchData: {
      type: ["geboorteakten", "actes de naissances", "birth certificates", "geburtsurkunden"],
    },
  },
  {
    // Baptisms
    typeIfParish: RT.Baptism,
    typeIfCivil: RT.Baptism,
    matchData: {
      type: ["doopakten", "actes de baptêmes", "baptism certificates", "taufurkunden"],
    },
  },
  {
    // Marriages
    typeIfParish: RT.Marriage,
    typeIfCivil: RT.Marriage,
    matchData: {
      type: [
        "huwelijksbeloften en -akten",
        "actes de promesses de mariage et mariages",
        "nuptial vow and marriage certificates",
        "eheversprechens- und eheschließungsurkunden",
        "huwelijksakten",
        "actes de mariages",
        "marriage certificates",
        "eheschließungsurkunden",
      ],
    },
  },
  {
    // Deaths+Burials
    typeIfParish: RT.DeathOrBurial,
    typeIfCivil: RT.DeathOrBurial,
    matchData: {
      type: [
        "begrafenis- en overlijdensakten",
        "actes de sépultures et décès",
        "funeral and death certificates",
        "bestattungs- und sterbeurkunden",
      ],
    },
  },
  {
    // Deaths
    typeIfParish: RT.Death,
    typeIfCivil: RT.DeathRegistration,
    matchData: {
      type: ["overlijdensakten", "actes de décès", "death certificates", "sterbeurkunden"],
    },
  },
  {
    // Burials
    typeIfParish: RT.Burial,
    typeIfCivil: RT.Burial,
    matchData: {
      type: ["begrafenisakten", "actes de sépultures", "funeral certificates", "bestattungsurkunden"],
    },
  },
];

const unclassifiedTypeData = {
  recordType: RT.Unclassified,
};

class AgathaEdReader extends ExtractedDataReader {
  constructor(ed, primaryPersonIndex) {
    super(ed);
    if (!primaryPersonIndex) {
      primaryPersonIndex = 0;
    }
    this.primaryPersonIndex = primaryPersonIndex;

    if (ed.isRecord) {
      this.baseRecordTypeData = baseRecordTypeData;
      const typeFieldValue = this.getRecordDataValueForKeys(baseRecordTypeData.rules.recordType.recordDataKeys);
      let matchConfig = {
        type: {
          matchType: ExtractedDataReader.MatchType.EqualsOneOf,
          value: typeFieldValue,
        },
      };

      let recordTypeData = this.getRecordTypeMatch(recordTypes, matchConfig);
      if (recordTypeData.initRulesFunction) {
        recordTypeData.initRulesFunction(recordTypeData, this.primaryPersonIndex);
      }
      this.setRecordData(recordTypeData, unclassifiedTypeData);
    } else {
      if (ed.selection) {
        let matchConfig = {
          type: {
            matchType: ExtractedDataReader.MatchType.StartsWithOneOf,
            value: ed.selection.toLowerCase(),
          },
        };
        let recordTypeData = this.getRecordTypeMatch(imageRecordTypes, matchConfig);
        if (recordTypeData) {
          if (matchConfig.type.value.includes(":")) {
            // Parish record (e.g., Dworp (Beersel): Sint-Gaugericus)
            recordTypeData.recordType = recordTypeData.typeIfParish;
          } else {
            recordTypeData.recordType = recordTypeData.typeIfCivil;
          }
          this.setRecordData(recordTypeData, unclassifiedTypeData);
        }
      }
    }
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

  getEventDateObj() {
    let dateString = this.getValueUsingRecordTypeData("eventDate");
    return this.makeDateObjFromDdmmyyyyDate(dateString, "/");
  }

  getBirthDateObj() {
    let dateString = this.getValueUsingRecordTypeData("birthDate");
    return this.makeDateObjFromDdmmyyyyDate(dateString, "/");
  }

  getDeathDateObj() {
    let dateString = this.getValueUsingRecordTypeData("deathDate");
    return this.makeDateObjFromDdmmyyyyDate(dateString, "/");
  }

  setCustomFields(gd) {
    if (this.ed.isRecord) {
      let projectURL = this.getRecordDataValueForKeys(["projet", "project", "projekt"]); //this.findAnyField(this.ed.metadata, metadataFields.project);
      if (projectURL) {
        let parts = projectURL.split("/");
        gd.project = parts[parts.length - 1];
      }
    }
  }

  getPrimaryPersonOptions() {
    if (this.recordType == RT.Marriage) {
      const brideFullName = this.getRecordDataValueForKeys(marriageTemplate.brideFullName.recordDataKeys);
      const groomFullName = this.getRecordDataValueForKeys(marriageTemplate.groomFullName.recordDataKeys);

      if (brideFullName && groomFullName) {
        let options = [brideFullName + " (bride)", groomFullName + " (groom)"];
        return options;
      }
    }

    return undefined;
  }
}

export { AgathaEdReader };
