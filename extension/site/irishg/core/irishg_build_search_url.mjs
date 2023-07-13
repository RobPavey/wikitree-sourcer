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
import { DateUtils } from "../../../base/core/date_utils.mjs";
import { dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";

function addNumToYearString(yearString, num) {
  let yearNum = DateUtils.getYearNumFromYearString(yearString);
  if (yearNum) {
    yearNum += num;
    return yearNum.toString();
  } else {
    return yearString;
  }
}

function subtractNumFromYearString(yearString, num) {
  let yearNum = DateUtils.getYearNumFromYearString(yearString);
  if (yearNum) {
    yearNum -= num;
    return yearNum.toString();
  } else {
    return yearString;
  }
}

function addAppropriateSurname(gd, parameters, builder) {
  let lastName = "";
  let lastNamesArray = gd.inferPersonLastNamesArray(gd);
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

function addAppropriateGivenNames(gd, builder) {
  let firstName = gd.inferFirstName();
  let givenNames = firstName;
  builder.addGivenNames(givenNames);
}

function getAutoYearsToAddOrSubtract(isAdd, qualifier, type, dateInput) {
  // this is complicated because it depends on the source and the parameters
  // So it could be an NxN issue.
  let yearAdjustment = 0; // default if not special cases

  let recordType = RT.Unclassified;
  let sourceType = dateInput.gd.sourceType;
  if (sourceType == "record") {
    recordType = dateInput.gd.recordType;
  }

  let subcategory = dateInput.parameters.subcategory;
  if (subcategory == "civil_events") {
    if (type == "birth") {
      subcategory = "civil_births";
    } else if (type == "marriage") {
      subcategory = "civil_marriages";
    } else if (type == "death") {
      subcategory = "civil_deaths";
    }
  } else if (subcategory == "church_events") {
    if (type == "birth") {
      subcategory = "church_baptisms";
    } else if (type == "marriage") {
      subcategory = "church_marriages";
    } else if (type == "death") {
      subcategory = "church_deaths";
    }
  }

  switch (dateInput.parameters.subcategory) {
    case "civil_births": {
      // can be registered up to a year after actual birth
      if (recordType == RT.BirthRegistration) {
        yearAdjustment = 0;
      } else {
        if (isAdd) {
          yearAdjustment = 1;
        }
      }
      break;
    }
    case "civil_deaths": {
      // can be registered up to a year after actual death
      if (recordType == RT.DeathRegistration) {
        yearAdjustment = 0;
      } else {
        if (isAdd) {
          yearAdjustment = 1;
        }
      }
      break;
    }
    case "civil_marriages": {
      if (recordType == RT.MarriageRegistration) {
        yearAdjustment = 0;
      } else {
        if (isAdd) {
          yearAdjustment = 1;
        }
      }
      break;
    }

    case "church_lifetime": {
      // burial can be after death
      if (isAdd) {
        yearAdjustment = 1;
      }
      break;
    }

    case "church_baptism": {
      if (recordType == RT.Baptism) {
        yearAdjustment = 0;
      } else if (isAdd) {
        yearAdjustment = 2; // baptism can be a few years after birth
      }
      break;
    }

    case "church_burial": {
      if (recordType == RT.Burial) {
        yearAdjustment = 0;
      } else if (isAdd) {
        yearAdjustment = 1; // burial can be after death
      }
      break;
    }
  }

  switch (qualifier) {
    case qualifier.NONE:
      break;
    case qualifier.EXACT:
      break;
    case qualifier.ABOUT:
      yearAdjustment += isAdd ? 5 : -5;
      break;
    case qualifier.BEFORE:
      yearAdjustment += isAdd ? 0 : -5;
      break;
    case qualifier.AFTER:
      yearAdjustment += isAdd ? 5 : 0;
      break;
  }

  return yearAdjustment;
}

function getYearsToAddOrSubtract(isAdd, qualifier, type, dateInput) {
  // type is birth, death or marriage
  let optionName = "search_irishg_" + type + "YearExactness";

  let exactness = dateInput.options[optionName];

  let yearAdjustment = 0;
  if (exactness == "auto") {
    yearAdjustment = getAutoYearsToAddOrSubtract(isAdd, qualifier, type, dateInput);
  } else {
    yearAdjustment = Number(exactness);
  }

  return yearAdjustment;
}

function adjustStartYear(yearString, qualifier, type, dateInput) {
  const yearsToSubtract = getYearsToAddOrSubtract(false, qualifier, type, dateInput);
  return subtractNumFromYearString(yearString, yearsToSubtract);
}

function adjustEndYear(yearString, qualifier, type, dateInput) {
  const yearsToAdd = getYearsToAddOrSubtract(true, qualifier, type, dateInput);
  return addNumToYearString(yearString, yearsToAdd);
}

function setLifetimeStartAndEndDates(builder, dateInput) {
  const birthDateObj = dateInput.gd.inferBirthDateObj();
  if (birthDateObj) {
    let startYear = adjustStartYear(birthDateObj.getYearString(), birthDateObj.qualifier, "birth", dateInput);
    builder.addStartYear(startYear);
  }
  const deathDateObj = dateInput.gd.inferDeathDateObj();
  if (deathDateObj) {
    let endYear = adjustEndYear(deathDateObj.getYearString(), deathDateObj.qualifier, "death", dateInput);
    builder.addEndYear(endYear);
  }
}

function setBirthStartAndEndDates(builder, type, dateInput) {
  const birthDateObj = dateInput.gd.inferBirthDateObj();
  if (birthDateObj) {
    let startYear = adjustStartYear(birthDateObj.getYearString(), birthDateObj.qualifier, "birth", dateInput);
    builder.addBirthStartYear(startYear);
    let endYear = adjustEndYear(birthDateObj.getYearString(), birthDateObj.qualifier, "birth", dateInput);
    builder.addBirthEndYear(endYear);
  }
}

function setDeathStartAndEndDates(builder, type, dateInput) {
  const deathDateObj = dateInput.gd.inferDeathDateObj();
  if (deathDateObj) {
    let startYear = adjustStartYear(deathDateObj.getYearString(), deathDateObj.qualifier, "death", dateInput);
    builder.addDeathStartYear(startYear);
    let endYear = adjustEndYear(deathDateObj.getYearString(), deathDateObj.qualifier, "death", dateInput);
    builder.addDeathEndYear(endYear);
  }
}

function buildSearchUrl(buildUrlInput) {
  // typeOfSearch is current allways specifiedParameters
  const gd = buildUrlInput.generalizedData;
  const parameters = buildUrlInput.searchParameters;
  const options = buildUrlInput.options;

  const dateInput = { gd: gd, parameters: parameters, options: options };

  let urlStart = parameters.category + "records";
  var builder = new IrishgUriBuilder(urlStart);

  addAppropriateGivenNames(gd, builder);

  addAppropriateSurname(gd, parameters, builder);

  if (parameters.subcategory == "civil_lifetime" || parameters.subcategory == "church_lifetime") {
    setLifetimeStartAndEndDates(builder, dateInput);
  } else if (parameters.subcategory == "civil_events" || parameters.subcategory == "church_events") {
    let birthYear = gd.inferBirthYear();
    if (birthYear) {
      builder.addType("B");
      setBirthStartAndEndDates(builder, "birth", dateInput);
    }

    let deathYear = gd.inferDeathYear();
    if (deathYear) {
      builder.addType("D");
      setDeathStartAndEndDates(builder, "death", dateInput);
    }

    let marriageStartYear = "";
    let marriageEndYear = "";
    let marriageStartQualifier = dateQualifiers.NONE;
    let marriageEndQualifier = dateQualifiers.NONE;
    let spouse = undefined;
    if (gd.spouses && gd.spouses.length > 0) {
      // there are marriages in generalizedData
      if (parameters) {
        if (parameters.spouseIndex != -1 && parameters.spouseIndex < gd.spouses.length) {
          spouse = gd.spouses[parameters.spouseIndex];
          if (spouse.marriageDate) {
            marriageStartYear = spouse.marriageDate.getYearString();
            marriageEndYear = marriageStartYear;
          }
        }
      } else {
        if (gd.spouses[0].marriageDate) {
          marriageStartYear = gd.spouses[0].marriageDate.getYearString();
        }
        if (gd.spouses[gd.spouses.length - 1].marriageDate) {
          marriageEndYear = gd.spouses[gd.spouses.length - 1].marriageDate.getYearString();
        }
      }
    }

    if (!marriageStartYear) {
      if (birthYear) {
        let startYearNum = DateUtils.getYearNumFromYearString(birthYear);
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
      let startYear = adjustStartYear(marriageStartYear, marriageStartQualifier, "marriage", dateInput);
      let endYear = adjustEndYear(marriageEndYear, marriageEndQualifier, "marriage", dateInput);
      builder.addMarriageStartYear(startYear);
      builder.addMarriageEndYear(endYear);
    }

    if (spouse && spouse.name) {
      if (parameters.subcategory == "church_events") {
        let spouseForenames = spouse.name.inferForenames();
        let spouseLastNames = gd.inferPersonLastNames(spouse);
        builder.addSpouseName(spouseForenames, spouseLastNames);
      } else {
        // don't add spouse keywords as this will cause all birth and death hits to be ignored
        //let spouseNames = spouse.name.inferFullName();
        //builder.addSpouseKeywords(spouseNames);
      }
    }
  } else if (parameters.subcategory == "civil_births" || parameters.subcategory == "church_baptisms") {
    builder.addType("B");
    setBirthStartAndEndDates(builder, "birth", dateInput);

    if (parameters.subcategory == "civil_births") {
      let mmn = gd.mothersMaidenName;
      if (mmn && parameters.mmn) {
        builder.addMothersMaidenName(mmn);
      }
    }
  } else if (parameters.subcategory == "civil_marriages" || parameters.subcategory == "church_marriages") {
    builder.addType("M");

    let addedDateRange = false;
    if (gd.spouses && gd.spouses.length > 0) {
      let spouse = undefined;
      if (parameters) {
        if (parameters.spouseIndex != -1 && parameters.spouseIndex < gd.spouses.length) {
          spouse = gd.spouses[parameters.spouseIndex];
        }
      } else {
        spouse = gd.spouses[0];
      }

      if (spouse) {
        if (spouse.marriageDate) {
          let marriageYear = spouse.marriageDate ? spouse.marriageDate.getYearString() : "";
          let marriageQualifier = spouse.marriageDate ? spouse.marriageDate.qualifier : "";
          let startYear = adjustStartYear(marriageYear, marriageQualifier, "marriage", dateInput);
          let endYear = adjustEndYear(marriageYear, marriageQualifier, "marriage", dateInput);

          builder.addMarriageStartYear(startYear);
          builder.addMarriageEndYear(endYear);
          addedDateRange = true;
        }

        if (spouse.name) {
          if (parameters.subcategory == "church_marriages") {
            let spouseForenames = spouse.name.inferForenames();
            let spouseLastNames = gd.inferPersonLastNames(spouse);
            builder.addSpouseName(spouseForenames, spouseLastNames);
          } else {
            let spouseNames = spouse.name.inferFullName();
            builder.addSpouseKeywords(spouseNames);
          }
        }
      }
    }

    if (!addedDateRange) {
      let startYear = adjustStartYear(gd.inferBirthYear(), gd.inferBirthDateQualifier(), "birth", dateInput);
      let endYear = adjustEndYear(gd.inferDeathYear(), gd.inferDeathDateQualifier(), "death", dateInput);
      let startYearNum = DateUtils.getYearNumFromYearString(startYear);
      builder.addStartYear(startYearNum + 14);
      builder.addEndYear(endYear);
    }
  } else if (parameters.subcategory == "civil_deaths" || parameters.subcategory == "church_burials") {
    builder.addType("D");
    setDeathStartAndEndDates(builder, "death", dateInput);

    if (parameters.subcategory == "civil_deaths") {
      let ageAtDeath = gd.inferAgeAtDeath();
      if (ageAtDeath && parameters.ageAtDeath) {
        builder.addAgeAtDeath(ageAtDeath);
      }
    }
  }

  if (parameters.category == "church") {
    let parentNames = gd.inferParentForenamesAndLastName();

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
