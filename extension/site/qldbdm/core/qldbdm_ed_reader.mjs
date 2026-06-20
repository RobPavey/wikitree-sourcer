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
import { DateUtils } from "../../../base/core/date_utils.mjs";

function cleanDate(edReader, inputString) {
  let dateString = DateUtils.getStdShortDateStringFromDayMonthYearString(inputString);
  if (dateString) {
    return dateString;
  }
  return inputString;
}

const recordTypes = [
  // BDM
  {
    recordType: RT.BirthRegistration,
    matchData: {
      type: ["Birth registration"],
    },
    rules: {
      eventDate: {
        recordDataKeys: ["Birth date"],
        cleanFunction: cleanDate,
      },
      motherFullName: {
        recordDataKeys: ["Mother's name"],
      },
      fatherFullName: {
        recordDataKeys: ["Father/parent's name"],
      },
    },
  },
  {
    recordType: RT.DeathRegistration,
    matchData: {
      type: ["Death registration"],
    },
    rules: {
      eventDate: {
        recordDataKeys: ["Death date"],
        cleanFunction: cleanDate,
      },
      motherFullName: {
        recordDataKeys: ["Mother's name"],
      },
      fatherFullName: {
        recordDataKeys: ["Father/parent's name"],
      },
    },
  },
  {
    recordType: RT.MarriageRegistration,
    matchData: {
      type: ["Marriage registration"],
    },
    rules: {
      eventDate: {
        recordDataKeys: ["Marriage date"],
        cleanFunction: cleanDate,
      },
      spouseFullName: {
        recordDataKeys: ["Spouse's name"],
      },
    },
  },
];

const baseRecordTypeData = {
  rules: {
    fullName: {
      recordDataKeys: ["Name"],
    },
  },
  advancedPlaceRules: {
    addImpliedPartsToBlankPlace: true,
    impliedCountryName: "Australia",
    impliedStateName: "Queensland",
  },
};

class QldbdmEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    this.baseRecordTypeData = baseRecordTypeData;

    let matchConfig = {
      type: {
        matchType: ExtractedDataReader.MatchType.EqualsOneOf,
        value: ed.recordData["Type"],
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
  // style you may not need to override them here.
  ////////////////////////////////////////////////////////////////////////////////////////////////////
}

export { QldbdmEdReader };
