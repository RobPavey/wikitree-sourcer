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
import { DateUtils } from "../../../base/core/date_utils.mjs";

function buildSearchData(input) {
  const gd = input.generalizedData;
  const typeOfSearch = input.typeOfSearch;

  let stage1TextFieldData = {
    lastname: "",
    firstname: "",
    yearofdeath: "",
  };

  let stage1RadioFieldData = {
    wasasoldier: false,
  };

  let stage2TextFieldData = {
    keywords: "",
    monthofdeath: "",
    dayofdeath: "",
    yearofprobate: "",
    monthofprobate: "",
    dayofprobate: "",
  };

  stage1TextFieldData.lastname = gd.inferLastNameAtDeath();
  stage1TextFieldData.firstname = gd.inferForenames();
  stage1TextFieldData.yearofdeath = gd.inferDeathYear();

  // stage 2

  let deathDate = gd.inferDeathDate();
  let parsedDeathDate = DateUtils.parseDateString(deathDate);
  if (parsedDeathDate.isValid) {
    if (parsedDeathDate.hasMonth) {
      let month = parsedDeathDate.monthNum.toString();
      if (month.length == 1) {
        month = "0" + month;
      }
      stage2TextFieldData.monthofdeath = month;
    }
    if (parsedDeathDate.hasDay) {
      let day = parsedDeathDate.dayNum.toString();
      if (day.length == 1) {
        day = "0" + day;
      }
      stage2TextFieldData.dayofdeath = day;
    }
  }

  if (gd.recordType == RT.Probate) {
    let probateDate = gd.inferEventDate();
    let parsedProbateDate = DateUtils.parseDateString(probateDate);
    if (parsedProbateDate.isValid) {
      let year = parsedProbateDate.yearNum.toString();
      stage2TextFieldData.yearofprobate = year;

      if (parsedProbateDate.hasMonth) {
        let month = parsedProbateDate.monthNum.toString();
        if (month.length == 1) {
          month = "0" + month;
        }
        stage2TextFieldData.monthofprobate = month;
      }
      if (parsedProbateDate.hasDay) {
        let day = parsedProbateDate.dayNum.toString();
        if (day.length == 1) {
          day = "0" + day;
        }
        stage2TextFieldData.dayofprobate = day;
      }
    }
  }

  var result = {
    stage1TextFieldData: stage1TextFieldData,
    stage1RadioFieldData: stage1RadioFieldData,
    stage2TextFieldData: stage2TextFieldData,
  };

  //console.log("result is:");
  //console.log(result);

  return result;
}

export { buildSearchData };
