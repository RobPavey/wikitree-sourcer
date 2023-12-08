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
  { value: "all", text: "All Categories" },
  { value: "category-2000/birth-marriage-death", text: "Birth, Marriage & Death" },
  { value: "category-8020/books-publications", text: "Books & Publications" },
  { value: "category-1000/census-voter-lists", text: "Census & Voter Lists" },
  { value: "category-11000/directories-guides-references", text: "Directories, Guides & References" },
  { value: "category-5000/family-trees", text: "Family Trees" },
  { value: "category-9000/government-land-court-wills", text: "Government, Land, Court & Wills" },
  { value: "category-12000/histories-memories-biographies", text: "Histories, Memories & Biographies" },
  { value: "category-4000/immigration-travel", text: "Immigration & Travel" },
  { value: "category-13000/maps", text: "Maps" },
  { value: "category-3000/military", text: "Military" },
  { value: "category-8000/newspapers", text: "Newspapers" },
  { value: "category-6000/photos", text: "Photos" },
  { value: "category-15000/public-records", text: "Public Records" },
  { value: "category-10030/schools-universities", text: "Schools & Universities" },
];

const subcategories = [
  { value: "all", text: "All Subcategories" },

  // Birth, Marriage & Death
  {
    value: "category-2010/birth-records",
    category: "category-2000/birth-marriage-death",
    text: "Birth Records",
  },
  {
    value: "category-10020/church-records",
    category: "category-2000/birth-marriage-death",
    text: "Church Records",
  },
  {
    value: "category-2050/civil-registrations",
    category: "category-2000/birth-marriage-death",
    text: "Civil Registrations",
  },
  {
    value: "category-2030/death-burial-cemetery-obituaries",
    category: "category-2000/birth-marriage-death",
    text: "Death, Burial, Cemetery & Obituaries",
  },
  {
    value: "category-2020/marriage-divorce",
    category: "category-2000/birth-marriage-death",
    text: "Marriage & Divorce",
  },
  {
    value: "category-2040/other-vital-records",
    category: "category-2000/birth-marriage-death",
    text: "Other Vital Records",
  },
];

const wtsCollectionData = {
  EnglandAndWalesBirthReg: {
    category: "life+events+(bmds)",
    subcategory: "civil+births",
  },
  EnglandAndWalesMarriageReg: {
    category: "life+events+(bmds)",
    subcategory: "civil+marriage+&+divorce",
  },
  EnglandAndWalesDeathReg: {
    category: "life+events+(bmds)",
    subcategory: "civil+deaths+&+burials",
  },

  EnglandWalesAndScotlandCensus1841: {
    category: "census,+land+&+surveys",
    subcategory: "census",
  },
  EnglandWalesAndScotlandCensus1851: {
    category: "census,+land+&+surveys",
    subcategory: "census",
  },
  EnglandWalesAndScotlandCensus1861: {
    category: "census,+land+&+surveys",
    subcategory: "census",
  },
  EnglandWalesAndScotlandCensus1871: {
    category: "census,+land+&+surveys",
    subcategory: "census",
  },
  EnglandWalesAndScotlandCensus1881: {
    category: "census,+land+&+surveys",
    subcategory: "census",
  },
  EnglandWalesAndScotlandCensus1891: {
    category: "census,+land+&+surveys",
    subcategory: "census",
  },
  EnglandWalesAndScotlandCensus1901: {
    category: "census,+land+&+surveys",
    subcategory: "census",
  },
  EnglandWalesAndScotlandCensus1911: {
    category: "census,+land+&+surveys",
    subcategory: "census",
  },
};

const MhData = {
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

export { MhData };
