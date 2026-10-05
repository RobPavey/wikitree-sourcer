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

const categories = [
  { value: "births", text: "Births" },
  { value: "deaths", text: "Deaths" },
  { value: "marriages", text: "Marriages" },
  { value: "all", text: "All Collections" },
];

// The Digital Archives name search only has first name, last name and collection so there
// are no parameters for parents or spouses.
const SearchWithParametersData = {
  includeCategories: function (generalizedData, parameters) {
    return true;
  },

  includeSpouses: function (generalizedData, parameters) {
    return false;
  },

  includeParents: function (generalizedData, parameters) {
    return false;
  },

  getCategories: function (generalizedData, parameters, options) {
    return categories;
  },

  setDefaultSearchParameters: function (generalizedData, parameters, options) {
    parameters.category = "births";
  },

  updateParametersOnCategoryChange: function (generalizedData, parameters, options) {
    let lastNamesArray = generalizedData.inferPersonLastNamesArray(generalizedData);
    if (!lastNamesArray || lastNamesArray.length < 2) {
      return;
    }

    if (parameters.category == "births") {
      let birthNameIndex = lastNamesArray.indexOf(generalizedData.inferLastNameAtBirth());
      parameters.lastNameIndex = birthNameIndex != -1 ? birthNameIndex : 0;
    } else if (parameters.category == "deaths") {
      let deathNameIndex = lastNamesArray.indexOf(generalizedData.inferLastNameAtDeath());
      parameters.lastNameIndex = deathNameIndex != -1 ? deathNameIndex : lastNamesArray.length - 1;
    }
  },

  updateParametersOnSubcategoryChange: function (generalizedData, parameters, options) {},

  updateParametersOnCollectionChange: function (generalizedData, parameters, options) {},
};

export { SearchWithParametersData };
