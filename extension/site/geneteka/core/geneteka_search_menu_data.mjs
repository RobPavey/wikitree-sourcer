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

const PROVINCES = [
  { value: "01ds", text: "dolnośląskie" },
  { value: "02kp", text: "kujawsko-pomorskie" },
  { value: "03lb", text: "lubelskie" },
  { value: "04ls", text: "lubuskie" },
  { value: "05ld", text: "łódzkie" },
  { value: "06mp", text: "małopolskie" },
  { value: "07mz", text: "mazowieckie" },
  { value: "71wa", text: "Warszawa" },
  { value: "08op", text: "opolskie" },
  { value: "09pk", text: "podkarpackie" },
  { value: "10pl", text: "podlaskie" },
  { value: "11pm", text: "pomorskie" },
  { value: "12sl", text: "śląskie" },
  { value: "13sk", text: "świętokrzyskie" },
  { value: "14wm", text: "warmińsko-mazurskie" },
  { value: "15wp", text: "wielkopolskie" },
  { value: "16zp", text: "zachodniopomorskie" },
  { value: "21uk", text: "Ukraina" },
  { value: "22br", text: "Białoruś" },
  { value: "23lt", text: "Litwa" },
  { value: "25po", text: "Pozostałe" },
];

const RECORD_TYPES = [
  { value: "B", text: "Birth" },
  { value: "S", text: "Marriage" },
  { value: "D", text: "Death" },
];

const genetekaData = {
  includeCategories: function (generalizedData, parameters) {
    return false;
  },

  includeSubcategories: function (generalizedData, parameters) {
    return false;
  },

  includeCollections: function (generalizedData, parameters) {
    return false;
  },

  includeSpouses: function (generalizedData, parameters) {
    return false;
  },

  includeParents: function (generalizedData, parameters) {
    return false;
  },

  includeOtherPerson: function (generalizedData, parameters) {
    return false;
  },

  getAdditionalControls(generalizedData, parameters, options) {
    const provinceMenu = {
      elementId: "province",
      parameterName: "province",
      type: "select",
      label: "Province",
      values: PROVINCES,
    };
    const recordTypeMenu = {
      elementId: "recordType",
      parameterName: "recordType",
      type: "select",
      label: "Record type",
      values: RECORD_TYPES,
    };
    return [provinceMenu, recordTypeMenu];
  },

  getOtherPersonList: function (generalizedData, parameters, options) {},

  setDefaultSearchParameters: function (generalizedData, parameters, options) {
    // Look for a province that is as a substring of the birth or death place.
    const birthPlace = generalizedData.inferBirthPlace() || "";
    const deathPlace = generalizedData.inferDeathPlace() || "";
    const places = (birthPlace + deathPlace).toLowerCase();
    const province = PROVINCES.find((entry) => places.includes(entry.text.toLowerCase()))?.value;

    parameters.province = generalizedData.collectionData?.provinceId || province || "07mz";
    parameters.recordType = "B";
  },

  updateParametersOnCategoryChange: function (generalizedData, parameters, options) {},

  updateParametersOnSubcategoryChange: function (generalizedData, parameters, options) {},

  updateParametersOnCollectionChange: function (generalizedData, parameters, options) {},
};

export { genetekaData };
