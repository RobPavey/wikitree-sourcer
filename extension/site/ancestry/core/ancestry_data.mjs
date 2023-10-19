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

// the key here is the stdName from country_data.js
const countryStdNameToPriority = {
  England: "english",
  Wales: "welsh",
  Scotland: "scottish",
  "England and Wales": "united-kingdom",
  "United Kingdom": "united-kingdom",

  Ireland: "irish",
  France: "french",
  Germany: "german",
  Italy: "italian",
  Netherlands: "netherlands",
  Sweden: "swedish",
  Norway: "norway",

  "United States": "usa",
  Canada: "canada",
  Mexico: "mexico",
  Australia: "australian",
  "New Zealand": "new-zealand",
};

const countryStdNameToSourceCountry = {
  England: "england",
  Wales: "wales",
  Scotland: "scotland",
  "England and Wales": "great britain",
  "United Kingdom": "great britain",

  Ireland: "ireland",

  "United States": "united states",
  Canada: "canada",
  Australia: "australasia",
  "New Zealand": "australasia",
};

const categories = [
  { value: "all", text: "All Categories" },
  { value: "35", text: "Census & Voter Lists" },
  { value: "34", text: "Birth, Marriage & Death" },
  { value: "39", text: "Military" },
  { value: "40", text: "Immigration & Emigration" },
  { value: "33", text: "Stories, Memories & Histories" },
  { value: "37", text: "Directories & Member Lists" },
  { value: "36", text: "Court, Land, Wills & Financial" },
  { value: "41", text: "Dictionaries, Encyclopedias & Reference" },
];

const subcategories = [
  { value: "all", text: "All Subcategories" },

  {
    value: "cen_century1700",
    text: "Census & Voter Lists 1700s",
    category: "35",
  },
  {
    value: "cen_century1800",
    text: "Census & Voter Lists 1800s",
    category: "35",
  },
  {
    value: "cen_century1900",
    text: "Census & Voter Lists 1900s",
    category: "35",
  },

  { value: "bmd_birth", text: "Birth, Baptism & Christening", category: "34" },
  { value: "bmd_marriage", text: "Marriage & Divorce", category: "34" },
  {
    value: "bmd_death",
    text: "Death, Burial, Cemetery & Obituaries",
    category: "34",
  },

  { value: "mil_draft", text: "Draft, Enlistment and Service", category: "39" },
  { value: "mil_casualties", text: "Casualties", category: "39" },
  {
    value: "mil_lists",
    text: "Soldier, Veteran & Prisoner Rolls & Lists",
    category: "39",
  },
  { value: "mil_pension", text: "Pension Records", category: "39" },

  { value: "img_passlists", text: "Passenger Lists", category: "40" },
  { value: "img_crewlists", text: "Crew Lists", category: "40" },
  { value: "img_citizenship", text: "Citizenship Records", category: "40" },
  {
    value: "img_books",
    text: "Immigration & Emigration Books",
    category: "40",
  },

  {
    value: "flh_family",
    text: "Family Histories, Journals & Biographies",
    category: "33",
  },
  { value: "flh_oral", text: "Oral Histories & Interviews", category: "33" },
  { value: "flh_place", text: "Social & Place Histories", category: "33" },

  { value: "dir_city", text: "City & Area Directories", category: "37" },
  {
    value: "dir_society",
    text: "Society & Employment Directories",
    category: "37",
  },
  { value: "dir_church", text: "Church Records & Histories", category: "37" },
  { value: "dir_school", text: "School Lists & Yearbooks", category: "37" },

  {
    value: "clp_court",
    text: "Court, Governmental & Criminal Records",
    category: "36",
  },
  {
    value: "clp_wills",
    text: "Wills, Estates & Guardian Records",
    category: "36",
  },

  {
    value: "ref_guides",
    text: "Research Guides & Finding Aids",
    category: "41",
  },
];

const wtsCollectionData = {
  EnglandAndWalesBirthReg: { category: "34", subcategory: "bmd_birth" },
  EnglandAndWalesMarriageReg: { category: "34", subcategory: "bmd_marriage" },
  EnglandAndWalesDeathReg: { category: "34", subcategory: "bmd_death" },

  EnglandWalesAndScotlandCensus1841: {
    category: "35",
    subcategory: "cen_century1800",
  },
  EnglandWalesAndScotlandCensus1851: {
    category: "35",
    subcategory: "cen_century1800",
  },
  EnglandWalesAndScotlandCensus1861: {
    category: "35",
    subcategory: "cen_century1800",
  },
  EnglandWalesAndScotlandCensus1871: {
    category: "35",
    subcategory: "cen_century1800",
  },
  EnglandWalesAndScotlandCensus1881: {
    category: "35",
    subcategory: "cen_century1800",
  },
  EnglandWalesAndScotlandCensus1891: {
    category: "35",
    subcategory: "cen_century1800",
  },
  EnglandWalesAndScotlandCensus1901: {
    category: "35",
    subcategory: "cen_century1900",
  },
  EnglandWalesAndScotlandCensus1911: {
    category: "35",
    subcategory: "cen_century1900",
  },
};

const AncestryData = {
  includeCategories: function (generalizedData, parameters) {
    return true;
  },

  includeSubcategories: function (generalizedData, parameters) {
    return true;
  },

  includeCollections: function (generalizedData, parameters) {
    return false;
  },

  includeSpouses: function (generalizedData, parameters) {
    return true;
  },

  includeParents: function (generalizedData, parameters) {
    return true;
  },

  getPriorityFromStdCountry: function (stdCountry) {
    return countryStdNameToPriority[stdCountry];
  },

  getCategories: function (generalizedData, parameters, options) {
    return categories;
  },

  getSubcategories: function (generalizedData, parameters, options) {
    let result = [];

    if (parameters.category == "all") {
      for (let subcategory of subcategories) {
        let isDuplicate = false;
        for (let otherSubcategory of result) {
          if (otherSubcategory.value == subcategory.value) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          result.push(subcategory);
        }
      }
    } else {
      for (let subcategory of subcategories) {
        if (!subcategory.category || subcategory.category == parameters.category) {
          result.push(subcategory);
        }
      }
    }

    return result;
  },

  setDefaultSearchParameters: function (generalizedData, parameters, options) {
    //console.log("setDefaultSearchParameters: generalizedData is")
    //console.log(generalizedData)
    if (generalizedData.collectionData) {
      let source = generalizedData.sourceOfData;
      let sourceId = generalizedData.collectionData.id;
      let country = generalizedData.inferEventCountry();
      let collection = RC.findCollection(source, sourceId);

      if (collection) {
        let catAndSubCat = wtsCollectionData[collection.wtsId];
        if (catAndSubCat) {
          parameters.category = catAndSubCat.category;
          parameters.subcategory = catAndSubCat.subcategory;
        }
      }
    }
  },

  updateParametersOnCategoryChange: function (generalizedData, parameters, options) {
    let subcategories = this.getSubcategories(generalizedData, parameters, options);
    if (subcategories && subcategories.length > 0) {
      parameters.subcategory = subcategories[0].value;
    }
  },

  updateParametersOnSubcategoryChange: function (generalizedData, parameters, options) {},

  updateParametersOnCollectionChange: function (generalizedData, parameters, options) {},
};

export { AncestryData };
