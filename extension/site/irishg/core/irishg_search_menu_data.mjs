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

import { RT } from "../../../base/core/record_type.mjs";
import { WTS_String } from "../../../base/core/wts_string.mjs";

const categories = [
  { value: "civil", text: "Civil Records" },
  { value: "church", text: "Church Records" },
];

const subcategories = [
  {
    value: "civil_lifetime",
    text: "All records in lifetime",
    category: "civil",
    startYear: 1845,
    endYear: 1972,
  },
  {
    value: "civil_events",
    text: "All records for events on this page",
    category: "civil",
    includeSpouses: true,
    includeMmn: true,
    startYear: 1845,
    endYear: 1972,
  },
  {
    value: "civil_births",
    text: "Civil Births",
    category: "civil",
    includeMmn: true,
    startYear: 1864,
    endYear: 1922,
  },
  {
    value: "civil_marriages",
    text: "Civil Marriages",
    category: "civil",
    includeSpouses: true,
    startYear: 1845,
    endYear: 1947,
  },
  {
    value: "civil_deaths",
    text: "Civil Deaths",
    category: "civil",
    includeAgeAtDeath: true,
    startYear: 1871,
    endYear: 1972,
  },

  {
    value: "church_lifetime",
    text: "All records in lifetime",
    category: "church",
    startYear: 1520, // earliest observed in 1571
    endYear: 1930, // latest observed is 1927
  },
  {
    value: "church_events",
    text: "All records for events on this page",
    category: "church",
    startYear: 1520,
    endYear: 1930,
    includeSpouses: true,
    includeParents: true,
  },
  {
    value: "church_baptisms",
    text: "Church Baptisms",
    category: "church",
    includeParents: true,
    startYear: 1520,
    endYear: 1930,
  },
  {
    value: "church_marriages",
    text: "Church Marriages",
    category: "church",
    includeSpouses: true,
    startYear: 1520,
    endYear: 1930,
  },
  {
    value: "church_deaths",
    text: "Church Burials",
    category: "church",
    startYear: 1520,
    endYear: 1930,
  },
];

const collections = [];

function isSubCategoryInYearRange(subcategory, yearRange) {
  let isInYearRange = true;
  // check if the date range overlaps the lifespan
  if (yearRange.endYear < subcategory.startYear || yearRange.startYear > subcategory.endYear) {
    isInYearRange = false;
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

const IrishgData = {
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
    let subcategory = getSubcategoryByValue(parameters.subcategory);
    if (subcategory && subcategory.includeSpouses) {
      return true;
    }
    return false;
  },

  includeParents: function (generalizedData, parameters) {
    let subcategory = getSubcategoryByValue(parameters.subcategory);
    if (subcategory && subcategory.includeParents) {
      return true;
    }
    return false;
  },

  includeMmn: function (generalizedData, parameters) {
    let subcategory = getSubcategoryByValue(parameters.subcategory);
    if (subcategory && subcategory.includeMmn) {
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
        let from = subcategory.startYear || "";
        let to = subcategory.endYear || "";
        text = text + " (" + from + "-" + to + ")";

        // check if the date range overlaps the lifespan
        if (!isSubCategoryInYearRange(subcategory, lifeDates)) {
          text = "[" + text + "]";
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

  getAdditionalControls: function (generalizedData, parameters, options) {
    let controls = [];

    let subcategory = getSubcategoryByValue(parameters.subcategory);

    if (subcategory && subcategory.includeAgeAtDeath) {
      let ageAtDeath = generalizedData.inferAgeAtDeath();
      if (ageAtDeath !== undefined) {
        const label = "Include age at death (" + ageAtDeath + ")";
        const ageAtDeathControl = {
          elementId: "ageAtDeath",
          parameterName: "ageAtDeath",
          type: "checkbox",
          label: label,
        };

        controls.push(ageAtDeathControl);
      }
    }

    return controls;
  },

  getWarningMessages: function (generalizedData, parameters, options) {
    let messages = [];
    let subcategory = getSubcategoryByValue(parameters.subcategory);
    if (!subcategory) {
      return;
    }

    // check subcategory date range overlaps life range
    let maxLifespan = Number(options.search_general_maxLifespan);
    let lifeDates = generalizedData.inferPossibleLifeYearRange(maxLifespan);

    // check if the date range overlaps the lifespan
    if (!isSubCategoryInYearRange(subcategory, lifeDates)) {
      let subcategoryRangeString = subcategory.startYear.toString() + "-";
      if (subcategory.endYear) {
        subcategoryRangeString += subcategory.endYear.toString();
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

    if (subcategory.value.includes("marriage") && parameters.spouseIndex != -1) {
      let spouse = generalizedData.spouses[parameters.spouseIndex];

      if (spouse && spouse.marriageDate) {
        let yearString = spouse.marriageDate.getYearString();
        let yearNum = parseInt(yearString);
        if (yearNum && yearNum != NaN) {
          // check if the date range overlaps the lifespan
          if (yearNum < subcategory.startYear || (subcategory.endYear && yearNum > subcategory.endYear)) {
            let rangeString = subcategory.startYear.toString() + "-";
            if (subcategory.endYear) {
              rangeString += subcategory.endYear.toString();
            }
            let message =
              "Marriage year " + yearString + " is out of range for collection range of " + rangeString + ".";
            messages.push(message);
          }
        }
      }
    }

    if (subcategory.includeMmn && parameters.mmn) {
      let message =
        "Many records do not have the mother's maiden name transcribed. Including in search will exclude these records.";
      messages.push(message);
    }

    //console.log("messages returned is:");
    //console.log(messages);

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

      // check if the date range includes the given year
      if (yearNum < subcategory.startYear || yearNum > subcategory.endYear) {
        return false;
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

    parameters.category = "civil";
    parameters.subcategory = "civil_lifetime";

    // Use a subcategory that corresponds to the source record if it works with date ranges
    // Only do this for the common bases
    if (generalizedData.recordType == RT.BirthRegistration || generalizedData.recordType == RT.Birth) {
      const scList = ["civil_births", "church_baptisms"];
      if (defaultToSubcategoryList(parameters, scList, generalizedData.inferBirthYear())) {
        return;
      }
    }
    if (generalizedData.recordType == RT.MarriageRegistration) {
      const scList = ["civil_marriages", "church_marriages"];
      if (defaultToSubcategoryList(parameters, scList, generalizedData.inferEventYear())) {
        return;
      }
    }
    if (generalizedData.recordType == RT.DeathRegistration) {
      const scList = ["civil_deaths", "church_burials"];
      if (defaultToSubcategoryList(parameters, scList, generalizedData.inferDeathYear())) {
        return;
      }
    }
    if (generalizedData.recordType == RT.Baptism || generalizedData.recordType == RT.BirthOrBaptism) {
      const scList = ["church_baptisms", "civil_births"];
      if (defaultToSubcategoryList(parameters, scList, generalizedData.inferBirthYear())) {
        return;
      }
    }
    if (generalizedData.recordType == RT.Marriage) {
      const scList = ["church_marriages", "civil_marriages"];
      if (defaultToSubcategoryList(parameters, scList, generalizedData.inferEventYear())) {
        return;
      }
    }
    if (generalizedData.recordType == RT.Burial) {
      const scList = ["church_burials", "civil_deaths"];
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

    // default this to off because a lot are untranscribed
    parameters.mmn = false;
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

export { IrishgData };
