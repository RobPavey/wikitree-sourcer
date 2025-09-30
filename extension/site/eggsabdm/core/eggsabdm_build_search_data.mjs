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

import { buildDefaultParameters } from "./eggsabdm_search_menu_data.mjs";

// The keys below are members of input.searchParameters
const parameterToSearchFieldMap = {
  Baptisms: {
    firstName: { name: "Person_one_first_name", type: "input" },
    lastName: { name: "Person_one_surname", type: "input" },
    firstNameMode: { name: "firstname_mode", type: "select", byValue: true },
    surnameMode: { name: "surname_mode", type: "select", byValue: true },
    role: { name: "Role_of_Person_One", type: "select" },
    town: { name: "Which_Town", type: "select" },
    order: { name: "Result_order", type: "radio" },
    urlPart: "Baptisms",
  },
  Marriages: {
    firstName: { name: "Person_one_first_name", type: "input" },
    lastName: { name: "Person_one_surname", type: "input" },
    firstNameMode: { name: "firstname_mode", type: "select", byValue: true },
    surnameMode: { name: "surname_mode", type: "select", byValue: true },
    role: { name: "Role_of_Person_One", type: "select" },
    town: { name: "Which_Town", type: "select" },
    order: { name: "Result_order", type: "radio" },
    urlPart: "Marriages",
  },
  Burials: {
    firstName: { name: "what_firstname", type: "input" },
    lastName: { name: "what_surname", type: "input" },
    firstNameMode: { name: "firstname_mode", type: "select", byValue: true },
    surnameMode: { name: "surname_mode", type: "select", byValue: true },
    town: { name: "Which_Town", type: "select" },
    order: { name: "Result_order", type: "radio" },
    urlPart: "Burials",
  },
};

function buildSearchData(input) {
  // console.log("buildSearchData, input is:");
  // console.log(input);

  const generalizedData = input.generalizedData;
  const options = input.options;
  let searchType = input.typeOfSearch;
  let parameters = input.searchParameters;
  if (!parameters) {
    parameters = {};
    buildDefaultParameters(searchType, generalizedData, parameters, options);
  }

  let thisCatagoryFields = parameterToSearchFieldMap[searchType];
  if (!thisCatagoryFields) {
    console.error(`buildSearchData: unknown search type '${searchType}', assuming Baptisms`);
    searchType = "Baptisms";
    thisCatagoryFields = parameterToSearchFieldMap[searchType];
  }

  const fieldData = {
    utf8: true,
    simpleNameFields: {},
    selectFieldsByText: {},
    selectFieldsByValue: {},
    radioNameFields: {},
  };

  const firstNames = Object.keys(parameters)
    .filter((key) => key.startsWith("includeFirstName_") && parameters[key] === true)
    .map((k) => k.split("_")[1])
    .filter(Boolean);

  if (firstNames.length) {
    fieldData.simpleNameFields[thisCatagoryFields.firstName.name] = firstNames.join(" ");
  }

  for (const [paramFieldName, searchField] of Object.entries(thisCatagoryFields)) {
    if (paramFieldName == "urlPart" || paramFieldName == "firstName") continue;

    if (searchField.type == "select") {
      if (searchField.byValue) {
        fieldData.selectFieldsByValue[searchField.name] = parameters[paramFieldName];
      } else {
        fieldData.selectFieldsByText[searchField.name] = parameters[paramFieldName];
      }
    } else if (searchField.type == "input") {
      fieldData.simpleNameFields[searchField.name] = parameters[paramFieldName];
    } else if (searchField.type == "radio") {
      fieldData.radioNameFields[searchField.name] = parameters[paramFieldName];
    }
  }

  //console.log("fieldData is:");
  //console.log(fieldData);

  var result = {
    category: parameters.category,
    fieldData: fieldData,
    urlPart: thisCatagoryFields.urlPart,
  };

  return result;
}

export { buildSearchData };
