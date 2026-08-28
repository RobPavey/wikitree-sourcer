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
import { NameUtils } from "../../../base/core/name_utils.mjs";

function cleanName(edReader, valueObj) {
  let cleanString = valueObj.text;
  return cleanString;
}

function cleanDate(edReader, valueObj) {
  let cleanString = valueObj.text;
  cleanString = cleanString.replace(/\s*\(död\)\s*/i, "");
  cleanString = cleanString.replace(/\s*\(födelse\)\s*/i, "");
  return cleanString;
}

function cleanPlace(edReader, valueObj) {
  let cleanString = valueObj.text;
  return cleanString;
}

function cleanGender(edReader, valueObj) {
  let cleanString = valueObj.text;
  if (cleanString == "Man") {
    cleanString = "male";
  } else if (cleanString == "Kvinna") {
    cleanString = "female";
  }
  return cleanString;
}

function cleanMaritalStatus(edReader, valueObj) {
  let cleanString = valueObj.text;
  if (cleanString == "Ogift") {
    cleanString = "single";
  } else if (cleanString == "Gift") {
    cleanString = "married";
  } else if (cleanString == "Änka") {
    cleanString = "widowed";
  } else if (cleanString == "Änkling") {
    cleanString = "widowed";
  } else if (cleanString == "Frånskild") {
    cleanString = "divorced";
  }
  return cleanString;
}

function cleanOccupation(edReader, valueObj) {
  let cleanString = valueObj.text;
  return cleanString;
}

function cleanMarriageDate(edReader, valueObj) {
  let cleanString = valueObj.text;
  let inIndex = cleanString.indexOf(" i ");
  if (inIndex != -1) {
    cleanString = cleanString.substring(0, inIndex).trim();
  }
  return cleanString;
}

function cleanMarriagePlace(edReader, valueObj) {
  let cleanString = valueObj.text;
  let inIndex = cleanString.indexOf(" i ");
  if (inIndex != -1) {
    cleanString = cleanString.substring(inIndex + 3).trim();
  } else {
    cleanString = "";
  }
  return cleanString;
}

const recordTypes = [
  // BDM
  {
    recordType: RT.Birth,
    matchData: {
      type: ["Birth records", "Födelseregister"],
    },
    rules: {
      birthDate: {
        recordDataKeys: ["Birth date", "Födelsedatum", "Date of birth"],
        cleanFunction: cleanDate,
      },
      birthPlace: {
        recordDataKeys: ["Parish", "Församling"],
        cleanFunction: cleanPlace,
      },
    },
  },
  {
    recordType: RT.Death,
    matchData: {
      type: ["Death records", "Dödregister"],
    },
    rules: {
      fullName: {
        recordDataKeys: ["The deceased", "Den avlidne"],
        cleanFunction: cleanName,
      },
      deathDate: {
        recordDataKeys: ["Date", "Datum"],
        cleanFunction: cleanDate,
      },
      deathPlace: {
        recordDataKeys: ["Parish", "Församling"],
        cleanFunction: cleanPlace,
      },
    },
  },
  {
    recordType: RT.Marriage,
    matchData: {
      type: ["Marriage records", "Vigselregister"],
    },
    rules: {
      fullName: {
        recordDataKeys: ["Groom's name", "Brudgummens namn"],
        cleanFunction: cleanName,
      },
      eventDate: {
        recordDataKeys: ["Date", "Datum"],
        cleanFunction: cleanMarriageDate,
      },
      eventPlace: {
        recordDataKeys: ["Date", "Datum"],
        cleanFunction: cleanMarriagePlace,
      },
      spouseFullName: {
        recordDataKeys: ["Bride's name", "Brudens namn"],
        cleanFunction: cleanName,
      },
    },
  },
  {
    recordType: RT.Census,
    matchData: {
      type: [
        "Census 1860",
        "Census 1870",
        "Census 1880",
        "Census 1890",
        "Census 1900",
        "Census 1910",
        "Census 1930",
        "Folkräkningar (Sveriges befolkning) 1860",
        "Folkräkningar (Sveriges befolkning) 1870",
        "Folkräkningar (Sveriges befolkning) 1880",
        "Folkräkningar (Sveriges befolkning) 1890",
        "Folkräkningar (Sveriges befolkning) 1900",
        "Folkräkningar (Sveriges befolkning) 1910",
        "Folkräkningar (Sveriges befolkning) 1930",
      ],
    },
    rules: {
      eventDate: {
        recordDataKeys: ["Year", "Den avlidne"],
        cleanFunction: cleanDate,
      },
      eventPlace: {
        recordDataKeys: ["Home parish", "Hemförsamling"],
        cleanFunction: cleanPlace,
      },
      birthDate: {
        recordDataKeys: ["Birth year", "Födelseår"],
        cleanFunction: cleanDate,
      },
      birthPlace: {
        recordDataKeys: ["Birth parish", "Födelseförsamling"],
        cleanFunction: cleanPlace,
      },
    },
  },
  {
    recordType: RT.Census,
    matchData: {
      type: ["Index of SCB extracts", "Register till SCB"],
    },
    rules: {
      eventDate: {
        recordDataKeys: ["Year", "Årtal"],
        cleanFunction: cleanDate,
      },
    },
  },
];

const baseRecordTypeData = {
  rules: {
    fullName: {
      recordDataKeys: ["Name", "Namn"],
      cleanFunction: cleanName,
    },
    eventPlace: {
      recordDataKeys: ["Parish", "Församling"],
      cleanFunction: cleanPlace,
    },
    gender: {
      recordDataKeys: ["Gender", "Kön"],
      cleanFunction: cleanGender,
    },
    maritalStatus: {
      recordDataKeys: ["Marital status", "Civilstånd"],
      cleanFunction: cleanMaritalStatus,
    },
    occupation: {
      recordDataKeys: ["Occupation", "Yrke"],
      cleanFunction: cleanOccupation,
    },
    motherFullName: {
      recordDataKeys: ["Mother's name", "Moderns namn"],
      cleanFunction: cleanName,
    },
    fatherFullName: {
      recordDataKeys: ["Father's name", "Faderns namn"],
      cleanFunction: cleanName,
    },
  },
  advancedNameRules: {
    fullNameCanBeLastNameCommaForenames: true,
  },
  advancedPlaceRules: {
    addImpliedPartsToBlankPlace: true,
    impliedCountryName: "Sweden",
  },
};

const unclassifiedTypeData = {
  recordType: RT.Unclassified,
};

class RiksarkEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    if (ed.pageType == "record") {
      this.baseRecordTypeData = baseRecordTypeData;

      let matchConfig = {
        type: {
          matchType: ExtractedDataReader.MatchType.EqualsOneOf,
          value: ed.recordType,
        },
      };

      let recordTypeData = this.getRecordTypeMatch(recordTypes, matchConfig);
      if (recordTypeData) {
        this.recordTypeData = recordTypeData;
        this.recordType = recordTypeData.recordType;
      } else {
        this.recordTypeData = unclassifiedTypeData;
      }
    } else if (ed.pageType == "image") {
      if (ed.imageType == "archive") {
      } else if (ed.imageType == "dataset") {
        if (ed.imageDatasetName.startsWith("Census") || ed.imageDatasetName.startsWith("Folkräkning")) {
          ed.recordType = RT.Census;
          const regex = /\w+\s+(\d\d\d\d)/;
          const match = ed.imageDatasetName.match(regex);
          if (match) {
            let year = match[1].trim();
            this.imageYear = year;
          }
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
    if (this.ed.pageType == "record") {
      return "record";
    }
    if (this.ed.pageType == "image") {
      return "image";
    }

    return "unknown";
  }

  getEventDateObj() {
    if (this.ed.pageType == "image") {
      if (this.imageYear) {
        return this.makeDateObjFromYear(this.imageYear);
      }
    } else {
      return super.getEventDateObj();
    }
  }
}

export { RiksarkEdReader };
