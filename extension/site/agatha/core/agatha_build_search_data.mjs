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

import { dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";

function buildSearchData(input) {
  const gd = input.generalizedData;

  let fieldData = {};

  const lastName = gd.inferLastName();
  if (lastName) {
    fieldData["NAME"] = lastName;
  }
  const firstName = gd.inferForenames();
  if (firstName) {
    fieldData["FIRST_NAME"] = firstName;
  }
  const birthDateObj = gd.inferBirthDateObj();
  if (birthDateObj) {
    const birthYear = birthDateObj.getYearString();
    switch (birthDateObj.qualifier) {
      case dateQualifiers.NONE:
      case dateQualifiers.EXACT:
      case dateQualifiers.AFTER:
        fieldData["exactYear_PERS"] = birthYear;
        break;
      case dateQualifiers.ABOUT:
        fieldData["exactYear_PERS"] = birthYear - 10;
        break;
    }
  }

  var result = {
    fieldData: fieldData,
  };

  return result;
}

export { buildSearchData };
