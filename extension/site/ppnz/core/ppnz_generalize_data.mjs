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

import { GeneralizedData, dateQualifiers, WtsName } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { titleToPlace } from "./ppnz_titles.mjs";

// This function generalizes the data extracted web page.
// We know what fields can be there. And we know the ones we want in generalizedData.
function generalizeData(input) {
  let data = input.extractedData;

  let result = new GeneralizedData();

  result.sourceOfData = "ppnz";

  if (!data.success == undefined) {
    return result; //the extract failed
  }

  result.sourceType = "record";
  result.recordType = RT.Newspaper;

  const issue = data.issueDate;
  if (issue) {
    result.setEventDate(issue);
  }

  const place = titleToPlace(data.paperTitle, issue);
  result.setEventPlace(place);

  if (data.paperTitle) {
    result.newspaperName = data.paperTitle;
  }

  result.hasValidData = true;

  //console.log("ppnz; generalizeData: result is:");
  //console.log(result);

  return result;
}

export { generalizeData, GeneralizedData, dateQualifiers };
