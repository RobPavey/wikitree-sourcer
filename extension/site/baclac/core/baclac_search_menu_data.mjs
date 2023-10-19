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

import { RC } from "../../../base/core/record_collections.mjs";

const categories = [
  { value: "all", text: "All Collections" },

  { value: "Archives", text: "- All Archives" },
  { value: "Archives|CabCon", text: "- - Cabinet Conclusions" },
  { value: "Archives|FonAndCol", text: "- - Collections and Fonds" },
  { value: "Archives|DiaWlmKing", text: "- - Diaries of William Lyon Mackenzie King" },
  { value: "Archives|FilVidAndSou", text: "- - Film, Video and Sound" },
  { value: "Archives|IndResWesCan", text: "- - First Nations Reserves – Western Canada" },
  { value: "Archives|OrdInCou", text: "- - Orders-in-Council" },
  { value: "Archives|PosOffPosMas", text: "- - Post Offices and Postmasters" },

  { value: "Genealogy", text: "- All Genealogy" },

  { value: "Genealogy|ImmCit", text: "- - All Genealogy / Immigration & Citizenship" },
  {
    value: "Genealogy|ImmCit|CitRegMtlCirCou",
    text: "Citizenship Registration, Montreal Circuit Court , 1851 to 1945",
  },
  { value: "Genealogy|ImmCit|ImmBef1865", text: "- - - Immigrants before 1865" },
  { value: "Genealogy|ImmCit|ImmFroChi", text: "- - - Immigrants from China, 1885 to 1952" },
  { value: "Genealogy|ImmCit|ImmFroChi", text: "- - - Immigrants" },
  { value: "Genealogy|ImmCit|ImmFroChi", text: "- - - Immigrants" },
  { value: "Genealogy|ImmCit|ImmFroChi", text: "- - - Immigrants" },
  { value: "Genealogy|ImmCit|ImmFroChi", text: "- - - Immigrants" },
  { value: "Genealogy|ImmCit|ImmFroChi", text: "- - - Immigrants" },
  { value: "Genealogy|ImmCit|ImmFroChi", text: "- - - Immigrants" },

  { value: "Library", text: "- All Library" },
  { value: "Library|CanGaz", text: "- - Library / Canada Gazette, 1841 to 1997" },
  { value: "Library|LacCat", text: "- - National Library Collections " },
];

const BaclacData = {
  includeCategories: function (generalizedData, parameters) {
    return true;
  },

  includeSubcategories: function (generalizedData, parameters) {
    return false;
  },

  includeCollections: function (generalizedData, parameters) {
    return false;
  },

  getCategories: function (generalizedData, parameters, options) {
    return categories;
  },

  getSubcategories: function (generalizedData, parameters, options) {},

  setDefaultSearchParameters: function (generalizedData, parameters, options) {},

  updateParametersOnCategoryChange: function (generalizedData, parameters, options) {},

  updateParametersOnSubcategoryChange: function (generalizedData, parameters, options) {},

  updateParametersOnCollectionChange: function (generalizedData, parameters, options) {},
};

export { BaclacData };
