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

import {
  GeneralizedData,
  dateQualifiers,
  PlaceObj,
  NameObj,
  DateObj,
} from "../../../base/core/generalize_data_utils.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { commonGeneralizeData } from "../../../base/core/generalize_data_creation.mjs";

import { FreebmdEdReader } from "./freebmd_ed_reader.mjs";

function freebmdQuarterToGdQuarter(quarter) {
  let string = quarter.toLowerCase();
  switch (string) {
    case "mar":
      return 1;
    case "jun":
      return 2;
    case "sep":
      return 3;
    case "dec":
      return 4;
    default:
      return 1;
  }
}
// This function generalizes the data (ed) extracted from the GRO page.
// We know what fields can be there. And we knw the ones we want in generalizedData.
function generalizeData(input) {
  let ed = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "freebmd";
  result.sourceType = "record";

  if (!ed.eventYear) {
    return result; //the extract failed to get enough useful data
  }

  let edReader = new FreebmdEdReader(input.extractedData);
  commonGeneralizeData(edReader, result);

  let collectionId = undefined;
  if (ed.eventType == "birth") {
    collectionId = "births";
  } else if (ed.eventType == "marriage") {
    collectionId = "marriages";
  } else if (ed.eventType == "death") {
    collectionId = "deaths";
  }

  // Collection
  if (collectionId) {
    result.collectionData = {
      id: collectionId,
    };
    if (ed.referenceVolume) {
      result.collectionData.volume = ed.referenceVolume;
    }
    if (ed.referencePage) {
      result.collectionData.page = ed.referencePage;
    }
  }

  result.hasValidData = true;

  //console.log("freebmd; generalizeData: result is:");
  //console.log(result);

  return result;
}

export { generalizeData, GeneralizedData, dateQualifiers };
