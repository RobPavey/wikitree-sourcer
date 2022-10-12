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
  {
    value: "life+events+(bmds)",
    text: "Birth, Marriage, Death & Parish Records",
  },
  { value: "census,+land+&+surveys", text: "Census, land & surveys" },
  { value: "churches+&+religion", text: "Churches & religion" },
  {
    value: "directories+&+social+history",
    text: "Directories & social history",
  },
  { value: "education+&+work", text: "Education & work" },
  {
    value: "institutions+&+organisations",
    text: "Institutions & organisations",
  },
  {
    value: "armed+forces+&+conflict",
    text: "Military, armed forces & conflict",
  },
  { value: "travel+&+migration", text: "Travel & migration" },
];

const subcategories = [
  { value: "all", text: "All Subcategories" },

  {
    value: "civil+births",
    text: "Civil Births",
    category: "life+events+(bmds)",
  },
  {
    value: "civil+deaths+&+burials",
    text: "Civil Deaths & Burials",
    category: "life+events+(bmds)",
  },
  {
    value: "civil+marriage+&+divorce",
    text: "Civil Marriage & Divorce",
    category: "life+events+(bmds)",
  },
  {
    value: "parish+baptisms",
    text: "Parish Baptisms",
    category: "life+events+(bmds)",
  },
  {
    value: "parish+burials",
    text: "Parish Burials",
    category: "life+events+(bmds)",
  },
  {
    value: "parish+marriages",
    text: "Parish Marriages",
    category: "life+events+(bmds)",
  },
  {
    value: "parish+registers",
    text: "Parish Registers",
    category: "life+events+(bmds)",
  },
  {
    value: "religious+ceremonies",
    text: "Religious Ceremonies",
    category: "life+events+(bmds)",
  },
  {
    value: "wills+&+probate",
    text: "Wills & Probate",
    category: "life+events+(bmds)",
  },

  { value: "census", text: "Census", category: "census,+land+&+surveys" },
  {
    value: "courts+&+legal",
    text: "Courts & Legal",
    category: "census,+land+&+surveys",
  },
  {
    value: "electoral+rolls",
    text: "Electoral Rolls",
    category: "census,+land+&+surveys",
  },
  {
    value: "land+&+estates",
    text: "Land & Estates",
    category: "census,+land+&+surveys",
  },
  {
    value: "rate+books",
    text: "Rate Books",
    category: "census,+land+&+surveys",
  },
  { value: "surveys", text: "Surveys", category: "census,+land+&+surveys" },

  {
    value: "administration",
    text: "Administration",
    category: "churches+&+religion",
  },
  {
    value: "religious+ceremonies",
    text: "Religious Ceremonies",
    category: "churches+&+religion",
  },

  {
    value: "directories+&+almanacs",
    text: "Directories & Almanacs",
    category: "directories+&+social+history",
  },
  {
    value: "family+histories+&+pedigrees",
    text: "Family Histories & Pedigrees",
    category: "directories+&+social+history",
  },
  {
    value: "newspapers+&+magazines",
    text: "Newspapers & Magazines",
    category: "directories+&+social+history",
  },
  {
    value: "social+history",
    text: "Social History",
    category: "directories+&+social+history",
  },

  { value: "apprentices", text: "Apprentices", category: "education+&+work" },
  {
    value: "guild+&+trade+associations",
    text: "Guild & Trade Associations",
    category: "education+&+work",
  },
  {
    value: "merchant+navy+&+maritime",
    text: "Merchant Navy & Maritime",
    category: "education+&+work",
  },
  { value: "occupations", text: "Occupations", category: "education+&+work" },
  { value: "professions", text: "Professions", category: "education+&+work" },
  {
    value: "schools+&+education",
    text: "Schools & Education",
    category: "education+&+work",
  },
  {
    value: "workhouses+and+poor+law",
    text: "Workhouses and Poor Law",
    category: "education+&+work",
  },

  {
    value: "clubs+&+societies",
    text: "Clubs & Societies",
    category: "institutions+&+organisations",
  },
  {
    value: "courts+&+legal",
    text: "Courts & Legal",
    category: "institutions+&+organisations",
  },
  {
    value: "government",
    text: "Government",
    category: "institutions+&+organisations",
  },
  {
    value: "guild+&+trade+associations",
    text: "Guild & Trade Associations",
    category: "institutions+&+organisations",
  },
  {
    value: "hospitals",
    text: "Hospitals",
    category: "institutions+&+organisations",
  },
  {
    value: "hospitals+&+institutions",
    text: "Hospitals & Institutions",
    category: "institutions+&+organisations",
  },
  {
    value: "prison+registers",
    text: "Prison Registers",
    category: "institutions+&+organisations",
  },
  {
    value: "schools+&+education",
    text: "Schools & Education",
    category: "institutions+&+organisations",
  },
  {
    value: "social+history",
    text: "Social History",
    category: "institutions+&+organisations",
  },
  {
    value: "workhouses+and+poor+law",
    text: "Workhouses and Poor Law",
    category: "institutions+&+organisations",
  },

  {
    value: "boer+wars",
    text: "Boer Wars",
    category: "armed+forces+&+conflict",
  },
  {
    value: "first+world+war",
    text: "First World War",
    category: "armed+forces+&+conflict",
  },
  {
    value: "medal+rolls+and+honours",
    text: "Medal Rolls and Honours",
    category: "armed+forces+&+conflict",
  },
  {
    value: "other+wars+&+conflicts",
    text: "Other Wars & Conflicts",
    category: "armed+forces+&+conflict",
  },
  {
    value: "regimental+&+service+records",
    text: "Regimental & Service Records",
    category: "armed+forces+&+conflict",
  },
  {
    value: "second+world+war",
    text: "Second World War",
    category: "armed+forces+&+conflict",
  },

  { value: "migration", text: "Migration", category: "travel+&+migration" },
  {
    value: "passenger+lists",
    text: "Passenger Lists",
    category: "travel+&+migration",
  },
  { value: "travel", text: "Travel", category: "travel+&+migration" },
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

const FmpData = {
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

  getCountryNameFromStdCountry: function (stdCountry) {
    return countryStdNameToSourceCountry[stdCountry];
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

export { FmpData };
