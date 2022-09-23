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

import { countyMap } from "../../freecen/core/freecen_chapman_codes.mjs";

const categories = [
  { value: "baptism", text: "Baptisms", },
  { value: "marriage", text: "Marriages", },
  { value: "burial", text: "Burials", },
  { value: "all", text: "All Types", },
];

const collections = [];

const FreeregData = {

  includeCategories : function(generalizedData, parameters) {
    return true;
  },

  includeSubcategories : function(generalizedData, parameters) {
    return true;
  },

  includeCollections : function(generalizedData, parameters) {
    return false;
  },

  includeSpouses : function(generalizedData, parameters) {
    return false;
  },

  includeParents : function(generalizedData, parameters) {
    return false;
  },

  getCategories : function(generalizedData, parameters, options) {
    return categories;
  },

  getSubcategories : function(generalizedData, parameters, options) {
    // this gets the counties
    let counties = [];
    counties.push({ value: "allCounties", text: "All counties" });

    for (let countyCode in countyMap) {
      let county = countyMap[countyCode];
      let countyName = county.names[0];
      let countryName = county.country;
      let text = countyName + ", " + countryName;
      counties.push({ value: countyCode, text: text });
    }
    return counties;
  },

  getCollections : function(generalizedData, parameters, options) {
    return collections;
  },

  setDefaultSearchParameters: function(generalizedData, parameters, options) {
    parameters.subcategory = "allCounties";
  },

  getCategorySelectorLabel: function(gd, parameters) {
    return "Choose type of search: ";
  },

  getSubcategorySelectorLabel: function(gd, parameters) {
    return "Choose county to search: ";
  },

  updateParametersOnCategoryChange: function(generalizedData, parameters, options) {
  },

  updateParametersOnSubcategoryChange: function(generalizedData, parameters, options) {
  },

  updateParametersOnCollectionChange: function(generalizedData, parameters, options) {
  },

}

export { FreeregData };
