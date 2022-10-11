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

const collections = [
  { value: "all", text: "All Censuses" },
  { value: "1841", text: "1841 England, Wales & Scotland Census" },
  { value: "1851", text: "1851 England, Wales & Scotland Census" },
  { value: "1861", text: "1861 England, Wales & Scotland Census" },
  { value: "1871", text: "1871 England, Wales & Scotland Census" },
  { value: "1881", text: "1881 England, Wales & Scotland Census" },
  { value: "1891", text: "1891 England, Wales & Scotland Census" },
  { value: "1901", text: "1901 England, Wales & Scotland Census" },
  { value: "1911", text: "1911 England & Wales Census" },
];

const FreecenData = {
  includeCategories: function (generalizedData, parameters) {
    return false;
  },

  includeSubcategories: function (generalizedData, parameters) {
    return false;
  },

  includeCollections: function (generalizedData, parameters) {
    return true;
  },

  includeSpouses: function (generalizedData, parameters) {
    return false;
  },

  includeParents: function (generalizedData, parameters) {
    return false;
  },

  getCollections: function (generalizedData, parameters, options) {
    return collections;
  },

  setDefaultSearchParameters: function (
    generalizedData,
    parameters,
    options
  ) {},

  updateParametersOnCollectionChange: function (
    generalizedData,
    parameters,
    options
  ) {},
};

export { FreecenData };
