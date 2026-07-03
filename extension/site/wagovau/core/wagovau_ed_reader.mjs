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

function cleanName(edReader, inputString) {
  let cleanFamilyName = NameUtils.convertNameFromAllCapsToMixedCase(familyNameString);
}

const recordTypes = [
  // BDM
  {
    recordType: RT.BirthRegistration,
    matchData: {
      type: ["birth"],
    },
    rules: {
      birthDate: {
        recordDataKeys: ["Year of Birth"],
      },
      birthPlace: {
        recordDataKeys: ["Place of Birth"],
      },
    },
  },
  {
    recordType: RT.DeathRegistration,
    matchData: {
      type: ["death"],
    },
    rules: {
      deathDate: {
        recordDataKeys: ["Year of Death"],
      },
      deathPlace: {
        recordDataKeys: ["Place of Death"],
      },
    },
  },
  {
    recordType: RT.MarriageRegistration,
    matchData: {
      type: ["marriage"],
    },
    rules: {
      eventDate: {
        recordDataKeys: ["Year of Marriage"],
      },
      eventPlace: {
        recordDataKeys: ["Place of Marriage"],
      },
      spouseLastName: {
        recordDataKeys: ["Spouse Surname"],
      },
      spouseForenames: {
        recordDataKeys: ["Spouse Given Names"],
      },
    },
  },
];

const baseRecordTypeData = {
  rules: {
    lastName: {
      recordDataKeys: ["Surname"],
    },
    forenames: {
      recordDataKeys: ["Given Names"],
    },
    gender: {
      recordDataKeys: ["Sex"],
    },
    motherFullName: {
      recordDataKeys: ["Mother"],
    },
    fatherFullName: {
      recordDataKeys: ["Father"],
    },
    registrationDistrict: {
      recordDataKeys: ["Registration District"],
    },
  },
  advancedNameRules: {
    inFullNameLastNamesIsInUpperCase: true,
  },
  advancedPlaceRules: {
    addImpliedPartsToBlankPlace: true,
    impliedCountryName: "Australia",
    impliedStateName: "Western Australia",
  },
};

const unclassifiedTypeData = {
  recordType: RT.Unclassified,
};

class WagovauEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
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
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  // Note: there are default implementations in ExtractedDataReader and, if using a data-driven
  // style, you may not need to override them here.
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getCollectionData() {
    let id = "";
    if (this.recordType == RT.BirthRegistration) {
      id = "birth";
    } else if (this.recordType == RT.DeathRegistration) {
      id = "death";
    } else if (this.recordType == RT.MarriageRegistration) {
      id = "marriage";
    }
    let collectionData = { id: id };

    let registrationNumber = this.ed.recordData["Registration Number"];
    if (registrationNumber) {
      collectionData.registrationNumber = registrationNumber;
    }

    return collectionData;
  }
}

export { WagovauEdReader };
