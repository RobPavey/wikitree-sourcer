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

const categories = [
  { value: "all", text: "All" },
  { value: "births", text: "Births" },
  { value: "deaths", text: "Deaths" },
  { value: "marriages", text: "Marriages" },
];

const SearchWithParametersData = {
  includeCategories: function (generalizedData, parameters) {
    return true;
  },

  includeSpouses: function (generalizedData, parameters) {
    if (parameters.category == "marriages") {
      return true;
    }
    return false;
  },

  includeParents: function (generalizedData, parameters) {
    if (parameters.category == "births" || parameters.category == "deaths") {
      return true;
    }
    return false;
  },

  getCategories: function (generalizedData, parameters, options) {
    return categories;
  },

  setDefaultSearchParameters: function (generalizedData, parameters, options) {
    parameters.category = "all";
  },

  updateParametersOnCategoryChange: function (generalizedData, parameters, options) {
    if (parameters.category == "births") {
      let lastNamesArray = generalizedData.inferPersonLastNamesArray(generalizedData);
      let lastNameAtBirth = generalizedData.inferLastNameAtBirth();
      if (lastNamesArray && lastNamesArray.length > 1) {
        if (lastNameAtBirth) {
          let birthNameIndex = lastNamesArray.indexOf(lastNameAtBirth);
          if (birthNameIndex != -1) {
            parameters.lastNameIndex = birthNameIndex;
          }
        } else {
          parameters.lastNameIndex = 0;
        }
      }
    } else if (parameters.category == "deaths") {
      let lastNamesArray = generalizedData.inferPersonLastNamesArray(generalizedData);
      let lastNameAtDeath = generalizedData.inferLastNameAtDeath();
      if (lastNamesArray && lastNamesArray.length > 1) {
        if (lastNameAtDeath) {
          let deathNameIndex = lastNamesArray.indexOf(lastNameAtDeath);
          if (deathNameIndex != -1) {
            parameters.lastNameIndex = deathNameIndex;
          }
        } else {
          parameters.lastNameIndex = lastNamesArray.length - 1;
        }
      }
    }
  },

  updateParametersOnSubcategoryChange: function (generalizedData, parameters, options) {},

  updateParametersOnCollectionChange: function (generalizedData, parameters, options) {},
};

export { SearchWithParametersData };
