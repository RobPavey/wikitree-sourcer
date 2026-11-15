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

const nameMatchValues = [
  { value: "exact", text: 'Exact phrase ("John Power")' },
  { value: "near", text: 'Words near each other ("John Power"~2)' },
  { value: "all", text: "Both words anywhere" },
];

const forenamesValues = [
  { value: "first", text: "First forename only" },
  { value: "all", text: "All forenames" },
];

const sortOrderValues = [
  { value: "relevance", text: "Relevance" },
  { value: "oldest", text: "Date, oldest first" },
  { value: "newest", text: "Date, newest first" },
];

const SearchWithParametersData = {
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

  includeMmn: function (generalizedData, parameters) {
    return false;
  },

  includeOtherPerson: function (generalizedData, parameters) {
    return false;
  },

  getCategories: function (generalizedData, parameters, options) {
    return undefined;
  },

  getSubcategories: function (generalizedData, parameters, options) {
    return undefined;
  },

  getCollections: function (generalizedData, parameters, options) {
    return undefined;
  },

  getAdditionalControls: function (generalizedData, parameters, options) {
    return [
      {
        elementId: "nameMatch",
        parameterName: "nameMatch",
        type: "select",
        label: "Name match",
        values: nameMatchValues,
      },
      {
        elementId: "forenames",
        parameterName: "forenames",
        type: "select",
        label: "Forenames",
        values: forenamesValues,
      },
      {
        elementId: "sortOrder",
        parameterName: "sortOrder",
        type: "select",
        label: "Sort by",
        values: sortOrderValues,
      },
    ];
  },

  getWarningMessages: function (generalizedData, parameters, options) {
    return [];
  },

  setDefaultSearchParameters: function (generalizedData, parameters, options) {
    parameters.nameMatch = options.search_ina_nameMatch ? options.search_ina_nameMatch : "exact";
    parameters.forenames = options.search_ina_forenames ? options.search_ina_forenames : "first";
    parameters.sortOrder = options.search_ina_sortOrder ? options.search_ina_sortOrder : "relevance";
  },

  updateParametersOnCategoryChange: function (generalizedData, parameters, options) {},

  updateParametersOnSubcategoryChange: function (generalizedData, parameters, options) {},

  updateParametersOnCollectionChange: function (generalizedData, parameters, options) {},
};

export { SearchWithParametersData };
