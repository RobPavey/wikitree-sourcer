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
import { RT } from "../../../base/core/record_type.mjs";
import { WTS_String } from "../../../base/core/wts_string.mjs";
import { ScotpRecordType } from "./scotp_record_type.mjs";

const categories = [
  { value: "statutory", text: "Statutory registers" },
  { value: "church_cos", text: "Church of Scotland registers" },
  { value: "church_rcc", text: "Roman Catholic Church registers" },
  { value: "church_other", text: "Other church registers" },
  { value: "census", text: "Census returns" },
  { value: "valuation", text: "Valuation rolls" },
  { value: "legal", text: "Legal records" },
  { value: "poor-relief", text: "Poor relief and migration records" },
  { value: "prison", text: "Prison registers" },
];

const subcategories = [
  {
    value: "stat_births",
    text: "Births",
    category: "statutory",
    includeParents: true,
  },
  {
    value: "stat_marriages",
    text: "Marriages",
    category: "statutory",
    includeSpouses: true,
  },
  {
    value: "stat_divorces",
    text: "Divorces",
    category: "statutory",
    includeSpouses: true,
  },
  {
    value: "stat_deaths",
    text: "Deaths",
    category: "statutory",
    includeParents: true,
  },
  {
    value: "civilpartnership",
    text: "Civil partnerships",
    category: "statutory",
    includeSpouses: true,
  },
  {
    value: "dissolutions",
    text: "Dissolutions",
    category: "statutory",
    includeSpouses: true,
  },

  {
    value: "opr_births",
    text: "Birth and baptisms",
    category: "church_cos",
    includeParents: true,
  },
  {
    value: "opr_marriages",
    text: "Banns and marriages",
    category: "church_cos",
    includeSpouses: true,
  },
  { value: "opr_deaths", text: "Deaths and burials", category: "church_cos" },

  {
    value: "crbirths_baptism",
    text: "Birth and baptisms",
    category: "church_rcc",
    includeParents: true,
  },
  {
    value: "crbanns_marriages",
    text: " Banns and marriages",
    category: "church_rcc",
    includeSpouses: true,
  },
  {
    value: "crdeath_burial",
    text: " Deaths and burials",
    category: "church_rcc",
  },
  { value: "cr_other", text: "Other events", category: "church_rcc" },

  {
    value: "ch3_baptism",
    text: "Birth and baptisms",
    category: "church_other",
    includeParents: true,
  },
  {
    value: "ch3_marriages",
    text: "Banns and marriages",
    category: "church_other",
    includeSpouses: true,
  },
  {
    value: "ch3_burials",
    text: "Deaths and burials",
    category: "church_other",
  },
  { value: "ch3_other", text: "Other events", category: "church_other" },

  { value: "census", text: "Census returns 1841-1911", category: "census" },
  {
    value: "census_lds",
    text: "Census returns 1881 (LDS)",
    category: "census",
  },

  { value: "valuation_rolls", text: "Valuation rolls", category: "valuation" },

  {
    value: "wills_testaments",
    text: "Wills and testaments",
    category: "legal",
  },
  { value: "coa", text: "Coats of arms", category: "legal" },
  {
    value: "soldiers_wills",
    text: "Soldiers' and airmens' wills",
    category: "legal",
  },
  {
    value: "military_tribunals",
    text: "Military service appeals tribunal",
    category: "legal",
  },

  {
    value: "hie",
    text: "Highland and Island Emigration",
    category: "poor-relief",
  },

  { value: "prison_records", text: "Prison registers", category: "prison" },
];

const collections = [
  { value: "all", text: "All (1841-1911)", subcategory: "census" },
  { value: "1841", text: "1841 Census", subcategory: "census" },
  { value: "1851", text: "1851 Census", subcategory: "census" },
  { value: "1861", text: "1861 Census", subcategory: "census" },
  { value: "1871", text: "1871 Census", subcategory: "census" },
  { value: "1881", text: "1881 Census", subcategory: "census" },
  { value: "1891", text: "1891 Census", subcategory: "census" },
  { value: "1901", text: "1901 Census", subcategory: "census" },
  { value: "1911", text: "1911 Census", subcategory: "census" },
];

function isSubCategoryInYearRange(subcategory, yearRange) {
  let isInYearRange = true;
  let recordType = subcategory.value;
  let dates = ScotpRecordType.getDatesCovered(recordType);
  if (dates) {
    // check if the date range overlaps the lifespan
    if (yearRange.endYear < dates.from || (dates.to && yearRange.startYear > dates.to)) {
      isInYearRange = false;
    }
  }
  return isInYearRange;
}

function getSubcategoryByValue(value) {
  for (let subcategory of subcategories) {
    if (subcategory.value == value) {
      return subcategory;
    }
  }
  return undefined;
}

const ScotpData = {
  includeCategories: function (generalizedData, parameters) {
    return true;
  },

  includeSubcategories: function (generalizedData, parameters) {
    return true;
  },

  includeCollections: function (generalizedData, parameters) {
    if (parameters.subcategory == "census") {
      return true;
    }
    return false;
  },

  includeSpouses: function (generalizedData, parameters) {
    let selectedSubcategory = undefined;
    for (let subcategory of subcategories) {
      if (!subcategory.category || subcategory.category == parameters.category) {
        if (subcategory.value == parameters.subcategory) {
          selectedSubcategory = subcategory;
        }
      }
    }

    if (selectedSubcategory && selectedSubcategory.includeSpouses) {
      return true;
    }
    return false;
  },

  includeParents: function (generalizedData, parameters) {
    let selectedSubcategory = undefined;
    for (let subcategory of subcategories) {
      if (!subcategory.category || subcategory.category == parameters.category) {
        if (subcategory.value == parameters.subcategory) {
          selectedSubcategory = subcategory;
        }
      }
    }

    if (selectedSubcategory && selectedSubcategory.includeParents) {
      return true;
    }
    return false;
  },

  includeOtherPerson: function (generalizedData, parameters) {
    if (parameters.subcategory == "census") {
      if (generalizedData.householdArray && generalizedData.householdArray.length > 1) {
        let sourceEventYear = generalizedData.inferEventYear();
        if (parameters.collection == sourceEventYear) {
          return true;
        }
      }
    }
    return false;
  },

  getCategories: function (generalizedData, parameters, options) {
    return categories;
  },

  getSubcategories: function (generalizedData, parameters, options) {
    let result = [];

    let maxLifespan = Number(options.search_general_maxLifespan);
    let lifeDates = generalizedData.inferPossibleLifeYearRange(maxLifespan);

    for (let subcategory of subcategories) {
      if (!subcategory.category || subcategory.category == parameters.category) {
        let value = subcategory.value;
        let text = subcategory.text;
        let recordType = subcategory.value;
        let dates = ScotpRecordType.getDatesCovered(recordType);
        if (dates) {
          let from = dates.from || "";
          let to = dates.to || "";
          text = text + " (" + from + "-" + to + ")";

          // check if the date range overlaps the lifespan
          if (!isSubCategoryInYearRange(subcategory, lifeDates)) {
            text = "[" + text + "]";
          }
        }

        result.push({ value: value, text: text });
      }
    }

    return result;
  },

  getCollections: function (generalizedData, parameters, options) {
    return collections;
  },

  getOtherPersonList: function (generalizedData, parameters, options) {
    let result = [{ value: "", text: "None" }];

    if (generalizedData.householdArray) {
      for (let member of generalizedData.householdArray) {
        if (!member.isSelected) {
          let name = member.name;
          let firstName = WTS_String.getFirstWord(name);
          let text = firstName + " (" + member.age + ", " + member.relationship + ")";
          result.push({ value: firstName, text: text });
        }
      }
    }

    return result;
  },

  getWarningMessages: function (generalizedData, parameters, options) {
    let messages = [];
    let subcategory = getSubcategoryByValue(parameters.subcategory);
    if (!subcategory) {
      return;
    }

    let recordType = subcategory.value;
    let eventClass = ScotpRecordType.getEventClass(recordType);

    // check subcategory date range overlaps life range
    let dates = ScotpRecordType.getDatesCovered(recordType);
    if (dates) {
      let maxLifespan = Number(options.search_general_maxLifespan);
      let lifeDates = generalizedData.inferPossibleLifeYearRange(maxLifespan);

      // check if the date range overlaps the lifespan
      if (!isSubCategoryInYearRange(subcategory, lifeDates)) {
        let subcategoryRangeString = dates.from.toString() + "-";
        if (dates.to) {
          subcategoryRangeString += dates.to.toString();
        }

        let lifeRangeString = lifeDates.startYear.toString() + "-";
        if (lifeDates.endYear) {
          lifeRangeString += lifeDates.endYear.toString();
        }

        let message =
          "Subcategory range " +
          subcategoryRangeString +
          " does not overlap possible life range of " +
          lifeRangeString +
          ".";
        messages.push(message);
      }
    }

    if (eventClass == "marriage" && parameters.spouseIndex != -1) {
      let spouse = generalizedData.spouses[parameters.spouseIndex];

      if (spouse && spouse.marriageDate) {
        let yearString = spouse.marriageDate.getYearString();
        let yearNum = parseInt(yearString);
        if (yearNum && yearNum != NaN) {
          if (dates) {
            // check if the date range overlaps the lifespan
            if (yearNum < dates.from || (dates.to && yearNum > dates.to)) {
              let rangeString = dates.from.toString() + "-";
              if (dates.to) {
                rangeString += dates.to.toString();
              }
              let message =
                "Marriage year " + yearString + " is out of range for collection range of " + rangeString + ".";
              messages.push(message);
            }
          }
        }
      }
    }

    console.log("messages returned is:");
    console.log(messages);

    return messages;
  },

  setDefaultSearchParameters: function (generalizedData, parameters, options) {
    function defaultToSubcategory(parameters, subcategoryName, yearString) {
      if (!yearString) {
        return false;
      }

      var yearNum = parseInt(yearString);
      if (yearNum == NaN) {
        return false;
      }

      let subcategory = getSubcategoryByValue(subcategoryName);

      let recordType = subcategory.value;
      let dates = ScotpRecordType.getDatesCovered(recordType);
      if (dates) {
        // check if the date range includes the given year
        if (yearNum < dates.from || (dates.to && yearNum > dates.to)) {
          return false;
        }
      }

      parameters.category = subcategory.category;
      parameters.subcategory = subcategoryName;
      return true;
    }

    function defaultToSubcategoryList(parameters, subcategoryNameList, yearString) {
      if (!yearString) {
        return false;
      }

      for (let subcategoryName of subcategoryNameList) {
        if (defaultToSubcategory(parameters, subcategoryName, yearString)) {
          return true;
        }
      }
      return false;
    }

    let maxLifespan = Number(options.search_general_maxLifespan);
    let lifeDates = generalizedData.inferPossibleLifeYearRange(maxLifespan);

    parameters.category = "statutory";
    parameters.subcategory = "stat_births";

    if (generalizedData.recordType == RT.Census) {
      let censusSubcategory = getSubcategoryByValue("census");
      if (isSubCategoryInYearRange(censusSubcategory, lifeDates)) {
        parameters.category = "census";
        parameters.subcategory = "census";

        let sourceEventYear = generalizedData.inferEventYear();
        parameters.collection = "all";
        for (let collection of collections) {
          if (collection.value == sourceEventYear) {
            parameters.collection = sourceEventYear;
          }
        }
        return;
      }
    }

    // Use a subcategory that corresponds to the source record if it works with date ranges
    // Only do this for the common bases
    if (generalizedData.recordType == RT.BirthRegistration || generalizedData.recordType == RT.Birth) {
      const scList = ["stat_births", "opr_births", "crbirths_baptism", "ch3_baptism"];
      if (defaultToSubcategoryList(parameters, scList, generalizedData.inferBirthYear())) {
        return;
      }
    }
    if (generalizedData.recordType == RT.MarriageRegistration) {
      const scList = ["stat_marriages", "opr_marriages", "crbanns_marriages", "ch3_marriages"];
      if (defaultToSubcategoryList(parameters, scList, generalizedData.inferEventYear())) {
        return;
      }
    }
    if (generalizedData.recordType == RT.DeathRegistration) {
      const scList = ["stat_deaths", "opr_deaths", "crdeath_burial", "ch3_burials"];
      if (defaultToSubcategoryList(parameters, scList, generalizedData.inferDeathYear())) {
        return;
      }
    }
    if (generalizedData.recordType == RT.Baptism || generalizedData.recordType == RT.BirthOrBaptism) {
      const scList = ["opr_births", "crbirths_baptism", "ch3_baptism", "stat_births"];
      if (defaultToSubcategoryList(parameters, scList, generalizedData.inferBirthYear())) {
        return;
      }
    }
    if (generalizedData.recordType == RT.Marriage) {
      const scList = ["opr_marriages", "crbanns_marriages", "ch3_marriages", "stat_marriages"];
      if (defaultToSubcategoryList(parameters, scList, generalizedData.inferEventYear())) {
        return;
      }
    }
    if (generalizedData.recordType == RT.Burial) {
      const scList = ["opr_deaths", "crdeath_burial", "ch3_burials", "stat_deaths"];
      if (defaultToSubcategoryList(parameters, scList, generalizedData.inferDeathYear())) {
        return;
      }
    }

    // else determine the default category and subcategory based on collection dates
    let firstSubcategoryInRange = undefined;
    for (let subcategory of subcategories) {
      if (isSubCategoryInYearRange(subcategory, lifeDates)) {
        firstSubcategoryInRange = subcategory;
        break;
      }
    }

    if (firstSubcategoryInRange) {
      parameters.category = firstSubcategoryInRange.category;
      parameters.subcategory = firstSubcategoryInRange.value;
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

export { ScotpData };
