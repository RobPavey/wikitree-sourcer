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

import { IrishgUriBuilder } from "./irishg_uri_builder.mjs";
import { WTS_Date } from "../../../base/core/wts_date.mjs";

function addNumToYearString(yearString, num) {
  let yearNum = WTS_Date.getYearNumFromYearString(yearString);
  if (yearNum) {
    yearNum += num;
    return yearNum.toString();
  } else {
    return yearString;
  }
}

function subtractNumFromYearString(yearString, num) {
  let yearNum = WTS_Date.getYearNumFromYearString(yearString);
  if (yearNum) {
    yearNum -= num;
    return yearNum.toString();
  } else {
    return yearString;
  }
}

function addAppropriateSurname(data, parameters, builder) {
  let lastName = "";
  let lastNamesArray = data.inferPersonLastNamesArray(data);
  if (lastNamesArray.length > 0) {
    if (lastNamesArray.length == 1) {
      lastName = lastNamesArray[0];
    } else if (lastNamesArray.length > parameters.lastNameIndex) {
      lastName = lastNamesArray[parameters.lastNameIndex];
    }
  }
  if (lastName) {
    builder.addSurname(lastName);
  }
}

function addAppropriateGivenNames(data, builder) {
  let firstName = data.inferFirstName();
  let givenNames = firstName;
  builder.addGivenNames(givenNames);
}

function getExactnessRange(type, options) {
  // type is birth, death or marriage
  let optionName = "search_irishg_" + type + "YearExactness";

  let exactness = options[optionName];

  let range = 0;
  if (exactness == "auto") {
    range = 5; // room for improvement here
  } else {
    range = Number(exactness);
  }

  return range;
}

function adjustStartYear(yearString, type, options) {
  const range = getExactnessRange(type, options);
  return subtractNumFromYearString(yearString, range);
}

function adjustEndYear(yearString, type, options) {
  const range = getExactnessRange(type, options);
  return addNumToYearString(yearString, range);
}

function buildSearchUrl(buildUrlInput) {
  const data = buildUrlInput.generalizedData;
  const dataCache = buildUrlInput.dataCache;
  const typeOfSearch = buildUrlInput.typeOfSearch;
  const parameters = buildUrlInput.searchParameters;
  const options = buildUrlInput.options;

  let urlStart = parameters.category + "records";
  var builder = new IrishgUriBuilder(urlStart);

  addAppropriateGivenNames(data, builder);

  addAppropriateSurname(data, parameters, builder);

  if (parameters.subcategory == "civil_lifetime" || parameters.subcategory == "church_lifetime") {
    let startYear = adjustStartYear(data.inferBirthYear(), "birth", options);
    let endYear = adjustEndYear(data.inferDeathYear(), "death", options);
    builder.addStartYear(startYear);
    builder.addEndYear(endYear);
  } else if (parameters.subcategory == "civil_events" || parameters.subcategory == "church_events") {
    let birthYear = data.inferBirthYear();
    if (birthYear) {
      builder.addType("B");
      let startYear = adjustStartYear(birthYear, "birth", options);
      let endYear = adjustEndYear(birthYear, "birth", options);
      builder.addBirthStartYear(startYear);
      builder.addBirthEndYear(endYear);
    }

    let deathYear = data.inferDeathYear();
    if (deathYear) {
      builder.addType("D");
      let startYear = adjustStartYear(deathYear, "death", options);
      let endYear = adjustEndYear(deathYear, "death", options);
      builder.addDeathStartYear(startYear);
      builder.addDeathEndYear(endYear);
    }

    let marriageStartYear = "";
    let marriageEndYear = "";
    let spouse = undefined;
    if (data.spouses && data.spouses.length > 0) {
      // there are marriages in generalizedData
      if (parameters) {
        if (parameters.spouseIndex != -1 && parameters.spouseIndex < data.spouses.length) {
          spouse = data.spouses[parameters.spouseIndex];
          if (spouse.marriageDate) {
            marriageStartYear = spouse.marriageDate.getYearString();
            marriageEndYear = marriageStartYear;
          }
        }
      } else {
        if (data.spouses[0].marriageDate) {
          marriageStartYear = data.spouses[0].marriageDate.getYearString();
        }
        if (data.spouses[data.spouses.length - 1].marriageDate) {
          marriageEndYear = data.spouses[data.spouses.length - 1].marriageDate.getYearString();
        }
      }
    }

    if (!marriageStartYear) {
      if (birthYear) {
        let startYearNum = WTS_Date.getYearNumFromYearString(birthYear);
        marriageStartYear = startYearNum + 14;
      }
    }

    if (!marriageEndYear) {
      if (deathYear) {
        marriageEndYear = deathYear;
      }
    }

    if (marriageStartYear || marriageEndYear) {
      builder.addType("M");
      let startYear = adjustStartYear(marriageStartYear, "marriage", options);
      let endYear = adjustEndYear(marriageEndYear, "marriage", options);
      builder.addMarriageStartYear(startYear);
      builder.addMarriageEndYear(endYear);
    }

    if (spouse && spouse.name) {
      if (parameters.subcategory == "church_events") {
        let spouseForenames = spouse.name.inferForenames();
        let spouseLastNames = data.inferPersonLastNames(spouse);
        builder.addSpouseName(spouseForenames, spouseLastNames);
      } else {
        let spouseNames = spouse.name.inferFullName();
        builder.addSpouseKeywords(spouseNames);
      }
    }
  } else if (parameters.subcategory == "civil_births" || parameters.subcategory == "church_baptisms") {
    let birthYear = data.inferBirthYear();
    builder.addType("B");
    let startYear = adjustStartYear(birthYear, "birth", options);
    let endYear = adjustEndYear(birthYear, "birth", options);
    builder.addBirthStartYear(startYear);
    builder.addBirthEndYear(endYear);

    if (parameters.subcategory == "civil_births") {
      let mmn = data.mothersMaidenName;
      if (mmn && parameters.mmn) {
        builder.addMothersMaidenName(mmn);
      }
    }
  } else if (parameters.subcategory == "civil_marriages" || parameters.subcategory == "church_marriages") {
    builder.addType("M");

    let addedDateRange = false;
    if (data.spouses && data.spouses.length > 0) {
      let spouse = undefined;
      if (parameters) {
        if (parameters.spouseIndex != -1 && parameters.spouseIndex < data.spouses.length) {
          spouse = data.spouses[parameters.spouseIndex];
        }
      } else {
        spouse = data.spouses[0];
      }

      if (spouse) {
        if (spouse.marriageDate) {
          let marriageYear = spouse.marriageDate ? spouse.marriageDate.getYearString() : "";
          let startYear = adjustStartYear(marriageYear, "marriage", options);
          let endYear = adjustEndYear(marriageYear, "marriage", options);

          builder.addMarriageStartYear(startYear);
          builder.addMarriageEndYear(endYear);
          addedDateRange = true;
        }

        if (spouse.name) {
          if (parameters.subcategory == "church_marriages") {
            let spouseForenames = spouse.name.inferForenames();
            let spouseLastNames = data.inferPersonLastNames(spouse);
            builder.addSpouseName(spouseForenames, spouseLastNames);
          } else {
            let spouseNames = spouse.name.inferFullName();
            builder.addSpouseKeywords(spouseNames);
          }
        }
      }
    }

    if (!addedDateRange) {
      let startYear = adjustStartYear(data.inferBirthYear(), "birth", options);
      let endYear = adjustEndYear(data.inferDeathYear(), "death", options);
      let startYearNum = WTS_Date.getYearNumFromYearString(startYear);
      builder.addStartYear(startYearNum + 14);
      builder.addEndYear(endYear);
    }
  } else if (parameters.subcategory == "civil_deaths" || parameters.subcategory == "church_burials") {
    let deathYear = data.inferDeathYear();
    builder.addType("D");
    let startYear = adjustStartYear(deathYear, "death", options);
    let endYear = adjustEndYear(deathYear, "death", options);
    builder.addDeathStartYear(startYear);
    builder.addDeathEndYear(endYear);

    if (parameters.subcategory == "civil_deaths") {
      let ageAtDeath = data.inferAgeAtDeath();
      if (ageAtDeath && parameters.ageAtDeath) {
        builder.addAgeAtDeath(ageAtDeath);
      }
    }
  }

  if (parameters.category == "church") {
    let parentNames = data.inferParentForenamesAndLastName();

    if (parameters.father) {
      builder.addParentName(parentNames.fatherForenames, parentNames.fatherLastName);
    }
    if (parameters.mother) {
      builder.addParentName(parentNames.motherForenames, parentNames.motherLastName);
    }
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
