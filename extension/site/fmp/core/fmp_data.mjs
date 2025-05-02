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
    useDeathYear: true,
  },
  { value: "census,+land+&+surveys", text: "Census, land & surveys", useDeathYear: true },
  { value: "churches+&+religion", text: "Churches & religion", useDeathYear: true },
  {
    value: "directories+&+social+history",
    text: "Directories & social history",
    useDeathYear: true,
  },
  { value: "education+&+work", text: "Education & work", useDeathYear: true },
  {
    value: "institutions+&+organisations",
    text: "Institutions & organisations",
    useDeathYear: true,
  },
  {
    value: "armed+forces+&+conflict",
    text: "Military, armed forces & conflict",
    useDeathYear: true,
  },
  { value: "newspapers+&+publications", text: "Newspapers & Publications", useDeathYear: true },
  { value: "travel+&+migration", text: "Travel & migration" },
];

const subcategories = [
  { value: "all", text: "All Subcategories" },

  // Birth, Marriage, Death & Parish Records
  {
    value: "civil+births",
    text: "Civil Births",
    category: "life+events+(bmds)",
  },
  {
    value: "civil+deaths+&+burials",
    text: "Civil Deaths & Burials",
    category: "life+events+(bmds)",
    useDeathYear: true,
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
    useDeathYear: true,
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
    useDeathYear: true,
  },
  {
    value: "religious+ceremonies",
    text: "Religious Ceremonies",
    category: "life+events+(bmds)",
    useDeathYear: true,
  },
  {
    value: "wills+&+probate",
    text: "Wills & Probate",
    category: "life+events+(bmds)",
    useDeathYear: true,
  },

  // Census, land & surveys
  { value: "census", text: "Census", category: "census,+land+&+surveys" },
  {
    value: "courts+&+legal",
    text: "Courts & Legal",
    category: "census,+land+&+surveys",
    useDeathYear: true,
  },
  {
    value: "directories+&+almanacs",
    text: "Directories & Almanacs",
    category: "census,+land+&+surveys",
    useDeathYear: true,
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

  // Churches & religion
  {
    value: "administration",
    text: "Administration",
    category: "churches+&+religion",
    useDeathYear: true,
  },
  {
    value: "courts+&+legal",
    text: "Courts & Legal",
    category: "churches+&+religion",
    useDeathYear: true,
  },

  {
    value: "directories+&+almanacs",
    text: "Directories & Almanacs",
    category: "churches+&+religion",
    useDeathYear: true,
  },

  {
    value: "religious+ceremonies",
    text: "Religious Ceremonies",
    category: "churches+&+religion",
    useDeathYear: true,
  },

  // Directories & social history
  {
    value: "clubs+&+societies",
    text: "Clubs & Societies",
    category: "directories+&+social+history",
    useDeathYear: true,
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
    useDeathYear: true,
  },
  {
    value: "government",
    text: "Government",
    category: "directories+&+social+history",
    useDeathYear: true,
  },
  {
    value: "medal+rolls+&+honours",
    text: "Medal Rolls & Honours",
    category: "directories+&+social+history",
    useDeathYear: true,
  },
  {
    value: "newspapers+&+magazines",
    text: "Newspapers & Magazines",
    category: "directories+&+social+history",
    useDeathYear: true,
  },
  {
    value: "postal+&+telephone+directories",
    text: "Postal & Telephone Directories",
    category: "directories+&+social+history",
    useDeathYear: true,
  },
  {
    value: "social+history",
    text: "Social History",
    category: "directories+&+social+history",
    useDeathYear: true,
  },

  // Education & work
  { value: "apprentices", text: "Apprentices", category: "education+&+work", useDeathYear: true },
  { value: "civil+service", text: "Civil Service", category: "education+&+work", useDeathYear: true },
  { value: "colonial+service", text: "Colonial Service", category: "education+&+work", useDeathYear: true },
  {
    value: "farming+&+agriculture",
    text: "Farming & Agriculture",
    category: "education+&+work",
    useDeathYear: true,
  },
  {
    value: "guild+&+trade+associations",
    text: "Guild & Trade Associations",
    category: "education+&+work",
  },
  {
    value: "merchant+navy+&+maritime",
    text: "Merchant Navy & Maritime",
    category: "education+&+work",
    useDeathYear: true,
  },
  { value: "occupations", text: "Occupations", category: "education+&+work", useDeathYear: true },
  { value: "professions", text: "Professions", category: "education+&+work", useDeathYear: true },
  {
    value: "schools+&+education",
    text: "Schools & Education",
    category: "education+&+work",
    useDeathYear: true,
  },
  {
    value: "transports+&+railways",
    text: "Transport & Railways",
    category: "education+&+work",
    useDeathYear: true,
  },
  {
    value: "workhouses+and+poor+law",
    text: "Workhouses and Poor Law",
    category: "education+&+work",
    useDeathYear: true,
  },

  // Institutions & organisations
  {
    value: "clubs+&+societies",
    text: "Clubs & Societies",
    category: "institutions+&+organisations",
    useDeathYear: true,
  },
  {
    value: "courts+&+legal",
    text: "Courts & Legal",
    category: "institutions+&+organisations",
    useDeathYear: true,
  },
  {
    value: "directories+&+almanacs",
    text: "Directories & Almanacs",
    category: "institutions+&+organisations",
    useDeathYear: true,
  },
  {
    value: "government",
    text: "Government",
    category: "institutions+&+organisations",
    useDeathYear: true,
  },
  {
    value: "guild+&+trade+associations",
    text: "Guild & Trade Associations",
    category: "institutions+&+organisations",
    useDeathYear: true,
  },
  {
    value: "hospitals",
    text: "Hospitals",
    category: "institutions+&+organisations",
    useDeathYear: true,
  },
  {
    value: "hospitals+&+institutions",
    text: "Hospitals & Institutions",
    category: "institutions+&+organisations",
    useDeathYear: true,
  },
  {
    value: "postal+service",
    text: "Postal Service",
    category: "institutions+&+organisations",
    useDeathYear: true,
  },
  {
    value: "prison+registers",
    text: "Prison Registers",
    category: "institutions+&+organisations",
    useDeathYear: true,
  },
  {
    value: "schools+&+education",
    text: "Schools & Education",
    category: "institutions+&+organisations",
    useDeathYear: true,
  },
  {
    value: "social+history",
    text: "Social History",
    category: "institutions+&+organisations",
    useDeathYear: true,
  },
  {
    value: "workhouses+and+poor+law",
    text: "Workhouses and Poor Law",
    category: "institutions+&+organisations",
    useDeathYear: true,
  },

  // Military, armed forces & conflict
  {
    value: "boer+wars",
    text: "Boer Wars",
    category: "armed+forces+&+conflict",
  },
  {
    value: "civil+war+&+rebellion",
    text: "Civil War & Rebellion",
    category: "armed+forces+&+conflict",
    useDeathYear: true,
  },
  {
    value: "directories+&+almanacs",
    text: "Directories & Almanacs",
    category: "armed+forces+&+conflict",
    useDeathYear: true,
  },
  {
    value: "first+world+war",
    text: "First World War",
    category: "armed+forces+&+conflict",
    useDeathYear: true,
  },
  {
    value: "government",
    text: "Government",
    category: "armed+forces+&+conflict",
    useDeathYear: true,
  },
  {
    value: "medal+rolls+and+honours",
    text: "Medal Rolls and Honours",
    category: "armed+forces+&+conflict",
    useDeathYear: true,
  },
  {
    value: "newspapers+&+magazines",
    text: "Newspapers & Magazines",
    category: "armed+forces+&+conflict",
    useDeathYear: true,
  },
  {
    value: "other+wars+&+conflicts",
    text: "Other Wars & Conflicts",
    category: "armed+forces+&+conflict",
    useDeathYear: true,
  },
  {
    value: "regimental+&+service+records",
    text: "Regimental & Service Records",
    category: "armed+forces+&+conflict",
    useDeathYear: true,
  },
  {
    value: "second+world+war",
    text: "Second World War",
    category: "armed+forces+&+conflict",
    useDeathYear: true,
  },
  {
    value: "vietnam+war",
    text: "Vietnam War",
    category: "armed+forces+&+conflict",
    useDeathYear: true,
  },

  // Newspapers & Publications
  {
    value: "newspaper+birth+notices",
    text: "Newspaper Birth Notices",
    category: "newspapers+&+publications",
  },
  {
    value: "newspaper+death+&+in+memoriam+notices",
    text: "Newspaper Death & In Memoriam Notices",
    category: "newspapers+&+publications",
    useDeathYear: true,
  },
  {
    value: "newspaper+marriage+notices",
    text: "Newspaper Marriage Notices",
    category: "newspapers+&+publications",
  },

  // Travel & migration
  { value: "migration", text: "Migration", category: "travel+&+migration", useDeathYear: true },
  { value: "naturalizations", text: "Naturalizations", category: "travel+&+migration", useDeathYear: true },
  {
    value: "passenger+lists",
    text: "Passenger Lists",
    category: "travel+&+migration",
    useDeathYear: true,
  },
  { value: "transportation", text: "Transportation", category: "travel+&+migration", useDeathYear: true },
  { value: "travel", text: "Travel", category: "travel+&+migration", useDeathYear: true },
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

  doCategoryAndSubCategoryUseDeathYear(categoryValue, subcategoryValue) {
    if (subcategoryValue) {
      for (let subcategory of subcategories) {
        if (subcategory.value == subcategoryValue) {
          return subcategory.useDeathYear;
        }
      }
    } else if (categoryValue) {
      for (let category of categories) {
        if (category.value == categoryValue) {
          return category.useDeathYear;
        }
      }
    }
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

export { FmpData };
