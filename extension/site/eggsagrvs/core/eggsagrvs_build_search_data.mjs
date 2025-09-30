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

import { EggsaCommon } from "./eggsa_common.mjs";

function buildSearchData(input) {
  // console.log("buildSearchData, input is:");
  // console.log(input);

  const gd = input.generalizedData;
  const options = input.options;

  const fieldData = {
    utf8: true,
    simpleNameFields: {},
    selectFieldsByValue: {},
  };
  let result = {};

  if (input.searchParameters) {
    //
    // Search with parameters
    //
    const parameters = input.searchParameters;
    result.urlPart = parameters.urlPart;
    // "lastName": "Toijt",
    // "surnameMode": "1",
    // "includeFirstName_Johannes": true,
    // "firstNameMode": "1"

    // First names and first name mode
    const firstNames = Object.keys(parameters)
      .filter((key) => key.startsWith("includeFirstName_") && parameters[key] === true)
      .map((k) => k.split("_")[1])
      .filter(Boolean);
    if (firstNames.length) {
      fieldData.simpleNameFields["what_firstname"] = firstNames.join(" ");
    }
    fieldData.selectFieldsByValue["firstname_mode"] = parameters.firstNameMode;

    // Surname and surname mode
    fieldData.simpleNameFields["what_surname"] = parameters.lastName;
    fieldData.selectFieldsByValue["surname_mode"] = parameters.surnameMode;
  } else {
    //
    // Default search
    //
    result.urlPart = input.urlPart;
    // First name
    const optFullFirstname = options.search_eggsagrvs_fullFirstname;
    const firstName = optFullFirstname ? gd.inferForenames() : gd.inferFirstName();
    if (firstName) {
      fieldData.simpleNameFields["what_firstname"] = firstName;
    }
    fieldData.selectFieldsByValue["firstname_mode"] = options.search_eggsagrvs_firstNameMode;

    // Surname
    let lastName = gd.inferLastName();
    if (lastName) {
      const prefix = EggsaCommon.multiWordSurnamePrefixAtStart(lastName);
      if (prefix) {
        // eGGSA recommends one searches only for the main part of a multi-word last name
        lastName = lastName.substring(prefix.length);
      }
      fieldData.simpleNameFields["what_surname"] = lastName;
    }
    fieldData.selectFieldsByValue["surname_mode"] = options.search_eggsagrvs_surnameMode;
  }

  //console.log("fieldData is:");
  //console.log(fieldData);

  result.fieldData = fieldData;

  return result;
}

export { buildSearchData };
