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

import { ScotpFormDataBuilder } from "./scotp_form_data_builder.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { PlaceObj, GeneralizedData } from "../../../base/core/generalize_data_utils.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";
import { ScotpRecordType, SpField, SpFeature, SpEventClass } from "./scotp_record_type.mjs";
import { getSearchCountyFromPlaceObj } from "./scotp_county_data.mjs";
import { getPlaceSearchTerms } from "./scotp_place_search_terms.mjs";

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
    if (yearNum < 0) {
      yearNum = 0; // we currently use this for age range also
    }
    return yearNum.toString();
  } else {
    return yearString;
  }
}

function isYearInDateRange(dates, yearString) {
  let startNum = DateUtils.getYearNumFromYearString(dates.startYear);
  let endNum = DateUtils.getYearNumFromYearString(dates.endYear);
  let yearNum = DateUtils.getYearNumFromYearString(yearString);
  if (yearNum && startNum && endNum) {
    if (yearNum >= startNum && yearNum <= endNum) {
      return true;
    }
  }
  return false;
}

const minScotpYear = 1500;
const maxScotpYear = 2500;

function constrainYear(yearString, scotpRecordType) {
  if (!yearString) {
    return yearString;
  }

  let datesCovered = ScotpRecordType.getDatesCovered(scotpRecordType);

  let minYear = minScotpYear;
  let maxYear = maxScotpYear;
  if (datesCovered) {
    if (datesCovered.from) {
      minYear = datesCovered.from;
    }
    if (datesCovered.to) {
      maxYear = datesCovered.to;
    }
  }

  let currentDate = new Date();
  let currentYear = currentDate.getFullYear();
  if (maxYear > currentYear) {
    maxYear = currentYear;
  }

  let yearNum = DateUtils.getYearNumFromYearString(yearString);
  if (yearNum) {
    if (yearNum < minYear) {
      yearNum = minYear;
    } else if (yearNum > maxYear) {
      yearNum = maxYear;
    }
    return yearNum.toString();
  } else {
    return yearString;
  }
}

function setDatesToRangeAroundYear(dates, yearString, range) {
  dates.startYear = subtractNumFromYearString(yearString, range);
  dates.endYear = addNumToYearString(yearString, range);
}

function constrainYears(dates, scotpRecordType) {
  dates.startYear = constrainYear(dates.startYear, scotpRecordType);
  dates.endYear = constrainYear(dates.endYear, scotpRecordType);
}

function getRangeFromExactnessOption(options, optionName) {
  let range = options[optionName];
  if (range != "auto") {
    // although the values are ints in options sometimes they come through as strings in browser
    range = Number(range);
  }

  return range;
}

function getSourceDataEventClass(gd) {
  // eventClass is : birth, death, marriage, divorce, census or other

  const recordType = gd.recordType;
  switch (recordType) {
    case RT.Birth:
    case RT.BirthRegistration:
    case RT.Baptism:
    case RT.BirthOrBaptism:
      return SpEventClass.birth;

    case RT.Death:
    case RT.DeathRegistration:
    case RT.Burial:
      return SpEventClass.death;

    case RT.Marriage:
    case RT.MarriageRegistration:
      return SpEventClass.marriage;

    case RT.Divorce:
      return SpEventClass.divorce;

    case RT.Census:
      return SpEventClass.census;
  }

  return SpEventClass.other;
}

function adjustCountyForSpecialCases(countyName, scotpRecordType, placeObj, dates) {
  const statutoryDistrictRecordTypes = ["stat_births", "stat_marriages", "stat_deaths", "stat_civilpartnerships"];

  // FORFAR and ANGUS are a special case. FORFAR was renamed to ANGUS in 1928 but Scotland's People
  // is inconsistent about which county name it requires for records.
  // Assume for now that the issue is only related to statutory counties
  if (countyName == "FORFAR" || countyName == "ANGUS") {
    // if this is a statutory record
    if (statutoryDistrictRecordTypes.includes(scotpRecordType)) {
      // we only use Forfar for certain districts so use the placeObj to determin district
      let districtName = "";

      {
        let firstCommaIndex = placeObj.placeString.indexOf(",");
        if (firstCommaIndex != -1) {
          let townName = placeObj.placeString.substring(0, firstCommaIndex).trim();
          let searchTerms = getPlaceSearchTerms(townName, "statutory", false);
          if (searchTerms && Array.isArray(searchTerms) && searchTerms.length > 0) {
            // this is a valid district name
            districtName = townName;
          }
        }
      }

      if (!districtName) {
        let townName = placeObj.inferTown();
        if (townName) {
          let searchTerms = getPlaceSearchTerms(townName, "statutory", false);
          if (searchTerms && Array.isArray(searchTerms) && searchTerms.length > 0) {
            // this is a valid district name
            districtName = townName;
          }
        }
      }

      let useAngus = true;

      if (districtName) {
        let ucName = districtName.toUpperCase();
        if (districtName == "COUPAR ANGUS") {
          useAngus = false;
        } else if (districtName == "MAINS") {
          useAngus = false;
        } else if (districtName == "FORFAR") {
          if (scotpRecordType == "stat_deaths") {
            if (dates && dates.endYear > 1862) {
              useAngus = false;
            }
          } else {
            useAngus = false;
          }
        }
      }

      if (useAngus) {
        if (countyName == "FORFAR") {
          countyName = "ANGUS";
        }
      } else {
        if (countyName == "ANGUS") {
          countyName = "FORFAR";
        }
      }
    }
  }

  return countyName;
}

function setDates(gd, scotpRecordType, parameters, options, builder) {
  // start off by setting dates to the years the person could have lived
  // then we could refine it depending on recordType and source data
  // e.g. if the source data is a birth and the scotpRecordType is OPR births
  // then use a range around the source birth date
  let maxLifespan = Number(options.search_general_maxLifespan);
  let dates = gd.inferPossibleLifeYearRange(maxLifespan);

  let eventClass = ScotpRecordType.getEventClass(scotpRecordType);

  // census is special in that there is no date range
  if (eventClass == SpEventClass.census) {
    if (scotpRecordType == "census_lds") {
      builder.addYear("1881");
      return;
    }

    if (parameters.collection && parameters.collection != "all") {
      let censusYear = parameters.collection;
      builder.addYear(censusYear);
    } else {
      // enable all the years within lifespan, this results in something like:
      // &year%5B0%5D=1861&year%5B1%5D=1871&year%5B2%5D=1881&year%5B3%5D=1891
      let censusYears = ["1841", "1851", "1861", "1871", "1881", "1891", "1901", "1911", "1921"];
      for (let censusYear of censusYears) {
        if (isYearInDateRange(dates, censusYear)) {
          builder.addYear(censusYear);
        }
      }
    }
    return; // return as census is special case
  }

  if (scotpRecordType == "vr") {
    // another special case. In this case only one year can be specified
    let rollYears = ["1855", "1865", "1875", "1885", "1895", "1905", "1915", "1920", "1925", "1930", "1935", "1940"];
    for (let rollYear of rollYears) {
      if (isYearInDateRange(dates, rollYear)) {
        builder.addYear(rollYear);
        return { startYear: rollYear, endYear: rollYear };
        // only one year is allowed in UI, possibly years have differing numbers of columns
      }
    }
    return; // return as vr is special case
  }

  if (scotpRecordType == "military_tribunals") {
    // another special case. In this case we just don't specify a year
    // A year can be specified by the user by "All" is an option and doesn't add a year query
    return;
  }

  if (scotpRecordType == "hie") {
    // another special case. In this case no year can be specified
    return;
  }

  if (eventClass == SpEventClass.birth) {
    let birthYear = gd.inferBirthYear();
    if (birthYear) {
      let range = getRangeFromExactnessOption(options, "search_scotp_birthYearExactness");
      if (range == "auto") {
        range = 5;
        if (gd.recordType == RT.Birth) {
          range = 1;
        } else if (gd.recordType == RT.Baptism) {
          range = 2;
        }
      }

      setDatesToRangeAroundYear(dates, birthYear, range);
    }
  } else if (eventClass == SpEventClass.death) {
    let deathYear = gd.inferDeathYear();
    if (deathYear) {
      let range = getRangeFromExactnessOption(options, "search_scotp_deathYearExactness");
      if (range == "auto") {
        range = 5;
        if (gd.recordType == RT.Death) {
          range = 1;
        } else if (gd.recordType == RT.Burial) {
          range = 1;
        }
      }

      setDatesToRangeAroundYear(dates, deathYear, range);
      if (scotpRecordType == "wills_testaments") {
        // add two years to end date to allow for confirmation
        dates.endYear = addNumToYearString(dates.endYear, 2);
      }
    }
  } else if (eventClass == SpEventClass.marriage) {
    let datesAdjusted = false;
    if (parameters.spouseIndex != -1) {
      // we may have a marriage date
      if (gd.spouses && parameters.spouseIndex != -1 && parameters.spouseIndex < gd.spouses.length) {
        let spouse = gd.spouses[parameters.spouseIndex];
        if (spouse.marriageDate) {
          let marriageYear = spouse.marriageDate.getYearString();

          // if the marriage date is outside collection range then ignore it
          let constrainedYear = constrainYear(marriageYear, scotpRecordType);
          if (constrainedYear == marriageYear) {
            let range = getRangeFromExactnessOption(options, "search_scotp_marriageYearExactness");
            if (range == "auto") {
              range = 5;
              if (gd.recordType == RT.Marriage) {
                range = 1;
              }
            }
            setDatesToRangeAroundYear(dates, marriageYear, range);
            datesAdjusted = true;
          }
        }
      }
    }

    if (!datesAdjusted) {
      // no marriage date - but should add 15 to birth date. Must be 16 to marry but allow a year rounding
      let earliestMarriageYear = dates.startYear + 15;
      if (earliestMarriageYear <= dates.endYear) {
        dates.startYear = earliestMarriageYear;
      } else {
        // did not live long enough to marry. We can't abort search at this point, just leave dates
      }
    }
  }

  // constrain years to the range covered by Scotp
  constrainYears(dates, scotpRecordType);

  // set the date parameters
  if (dates.startYear) {
    builder.addStartYear(dates.startYear);
  }
  if (dates.endYear) {
    builder.addEndYear(dates.endYear);
  }

  // in some cases the search allows the birth date - e.g. searching stat deaths
  if (ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.birthYear)) {
    let birthYear = gd.inferBirthYear();
    if (birthYear) {
      let range = getRangeFromExactnessOption(options, "search_scotp_birthYearExactness");
      if (range == "auto") {
        range = 1;
      }
      builder.addBirthYear(birthYear, range);
    }
  }

  return dates;
}

function setAge(gd, scotpRecordType, parameters, options, builder) {
  let targetHasAgeRange = ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.ageRange);
  let targetHasAge = ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.age);

  if (!targetHasAgeRange && !targetHasAge) {
    return;
  }

  let searchYear = "";
  if (scotpRecordType == "census") {
    if (parameters.collection != "all") {
      searchYear = parameters.collection;
    }
  } else if (scotpRecordType == "census_lds") {
    searchYear = "1881";
  }

  if (!searchYear) {
    return;
  }

  let sourceEventYear = gd.inferEventYear();

  // first check for a source record for same year that has the age
  if (gd.ageAtEvent && sourceEventYear == searchYear) {
    builder.addAgeRange(gd.ageAtEvent, gd.ageAtEvent);
    return;
  }

  // if we have a birth date we can estimate age
  let birthDate = gd.inferBirthDate();
  if (birthDate) {
    let estimatedAge = GeneralizedData.getAgeAtDate(birthDate, searchYear);

    let range = getRangeFromExactnessOption(options, "search_scotp_ageExactness");
    if (range == "auto") {
      range = 3;
    }
    let dates = {};
    setDatesToRangeAroundYear(dates, estimatedAge, range);

    builder.addAgeRange(dates.startYear, dates.endYear);
  }
}

function setNames(gd, scotpRecordType, parameters, options, builder) {
  if (scotpRecordType == "coa") {
    let fullName = gd.inferFullName();
    builder.addFullName(fullName, "soundex");
  } else {
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
      let searchOption = options.search_scotp_surnameSoundex ? "soundex" : "exact";
      builder.addSurname(lastName, searchOption);
    }

    let forename = gd.inferForenames();
    if (forename) {
      let searchOption = options.search_scotp_forenameSoundex ? "soundex" : "exact";
      builder.addForename(forename, searchOption);
    }
  }
}

function setPlace(gd, scotpRecordType, parameters, options, builder, dates) {
  // we need to find a place name that could be used as a place to search
  // which one to use depends on the type of record being searched and on the
  // source data.

  // eventClass is : birth, death, marriage, divorce, census or other
  let searchEventClass = ScotpRecordType.getEventClass(scotpRecordType);
  let sourceDataEventClass = getSourceDataEventClass(gd);

  let placeObj = undefined;
  if (searchEventClass == SpEventClass.birth) {
    if (gd.birthPlace) {
      placeObj = gd.birthPlace;
    } else {
      let birthPlaceString = gd.inferBirthPlace();
      if (birthPlaceString) {
        placeObj = new PlaceObj();
        placeObj.placeString = birthPlaceString;
      }
    }
  } else if (searchEventClass == SpEventClass.death) {
    if (gd.deathPlace) {
      placeObj = gd.deathPlace;
    } else {
      let deathPlaceString = gd.inferDeathPlace();
      if (deathPlaceString) {
        placeObj = new PlaceObj();
        placeObj.placeString = deathPlaceString;
      }
    }
  } else if (searchEventClass == SpEventClass.marriage && parameters.spouseIndex != -1) {
    if (gd.spouses && parameters.spouseIndex != -1 && parameters.spouseIndex < gd.spouses.length) {
      let spouse = gd.spouses[parameters.spouseIndex];
      if (spouse.marriagePlace) {
        placeObj = spouse.marriagePlace;
      }
    }
  } else if (searchEventClass == SpEventClass.census) {
    if (sourceDataEventClass == "census") {
      if (parameters.collection == gd.inferEventYear()) {
        // the source record is a census for the same year so use the event place
        if (gd.eventPlace) {
          placeObj = gd.eventPlace;
        } else {
          let eventPlaceString = gd.inferEventPlace();
          if (eventPlaceString) {
            placeObj = new PlaceObj();
            placeObj.placeString = eventPlaceString;
          }
        }
      }
    }
  }

  let countySearchParam = ScotpRecordType.getSearchField(scotpRecordType, SpField.county);
  if (countySearchParam && ScotpRecordType.hasSearchFeature(SpFeature.county)) {
    if (placeObj) {
      let countyName = getSearchCountyFromPlaceObj(scotpRecordType, placeObj);
      countyName = adjustCountyForSpecialCases(countyName, scotpRecordType, placeObj, dates);

      if (countyName) {
        builder.addSelectField(countySearchParam, countyName);
      }
    }
  }

  let addedPlace = false;
  // Registration district
  if (ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.rd)) {
    if (gd.registrationDistrict) {
      if (sourceDataEventClass != SpEventClass.other && searchEventClass == sourceDataEventClass) {
        // for a census or residence we should only add district if same year
        if (builder.addRdName(gd.registrationDistrict, false)) {
          addedPlace = true;
        }
      }
    }

    if (
      !addedPlace &&
      placeObj &&
      (gd.recordType == RT.BirthRegistration || gd.recordType == RT.Birth) &&
      !gd.registrationDistrict
    ) {
      // coming from a birth registration or birth and the place name should be a district
      // sometimes the place string is something like:
      // "Saint George, Edinburgh, Edinburghshire, Scotland, United Kingdom"
      // and inferTown will get "Edinburgh" but we want "Saint George"
      let firstCommaIndex = placeObj.placeString.indexOf(",");
      if (firstCommaIndex != -1) {
        let districtName = placeObj.placeString.substring(0, firstCommaIndex).trim();
        if (builder.addRdName(districtName, false)) {
          addedPlace = true;
        }
      }
    }

    // say we are coming from a WikiTree profile. Do we want to use the place name to find the RD?
    // Example where it would fail: https://www.wikitree.com/wiki/Black-16695
    if (!addedPlace && placeObj && (gd.recordType == RT.BirthRegistration || gd.recordType == RT.Birth)) {
      let townName = placeObj.inferTown();
      if (townName) {
        if (builder.addRdName(townName, false)) {
          addedPlace = true;
        }
      }
    }
  }

  // OPR parish
  if (!addedPlace && ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.oprParish)) {
    if (gd.registrationDistrict) {
      if (searchEventClass == sourceDataEventClass) {
        if (builder.addOprParishName(gd.registrationDistrict, false)) {
          addedPlace = true;
        }
      }
    }

    if (!addedPlace && placeObj) {
      let townName = placeObj.inferTown();
      if (townName) {
        if (builder.addOprParishName(townName, false)) {
          addedPlace = true;
        }
      }
    }
  }

  // Catholic parish
  if (!addedPlace && ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.rcParish)) {
    if (gd.registrationDistrict) {
      if (builder.addCatholicParishName(parish.rc_parish, false)) {
        addedPlace = true;
      }
    }

    if (!addedPlace && placeObj) {
      let townName = placeObj.inferTown();
      if (townName) {
        if (builder.addCatholicParishName(townName, false)) {
          addedPlace = true;
        }
      }
    }
  }
}

function setParents(gd, scotpRecordType, parameters, options, builder) {
  if (ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.parents)) {
    let searchOption = options.search_scotp_parentNameSoundex ? "soundex" : "exact";

    let parentNames = gd.inferParentNamesForDataString();
    if (parameters.father) {
      builder.addParentName(parentNames.fatherName, searchOption);
    }
    if (parameters.mother) {
      builder.addParentName(parentNames.motherName, searchOption);
    }
  }

  if (ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.mmn)) {
    let searchOption = options.search_scotp_parentNameSoundex ? "soundex" : "exact";

    let mmn = gd.mothersMaidenName;
    if (mmn && parameters.mmn) {
      builder.addMothersMaidenName(mmn, searchOption);
    }
  }
}

function setSpouse(gd, scotpRecordType, parameters, options, builder) {
  if (ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.spouse)) {
    let spouseName = "";
    if (gd.spouses && parameters.spouseIndex != -1 && parameters.spouseIndex < gd.spouses.length) {
      let spouse = gd.spouses[parameters.spouseIndex];
      if (spouse.name) {
        spouseName = spouse.name;
      }
    }

    if (!spouseName) {
      return;
    }

    let lastName = spouseName.inferLastName();

    // rather than use all forename just use the first - more likely to get a match
    let forename = spouseName.inferFirstName();

    if (lastName) {
      let searchOption = options.search_scotp_surnameSoundex ? "soundex" : "exact";
      builder.addSpouseSurname(lastName, searchOption);
    }

    if (forename) {
      let searchOption = options.search_scotp_forenameSoundex ? "soundex" : "exact";
      builder.addSpouseForename(forename, searchOption);
    }

    // some record types use full name instead of separate names
    let fullName = spouseName.inferFullName();

    if (fullName) {
      let searchOption = options.search_scotp_surnameSoundex ? "soundex" : "exact";
      builder.addSpouseFullName(fullName, searchOption);
    }
  }
}

function setOtherPerson(gd, scotpRecordType, parameters, options, builder) {
  if (!ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.otherPerson)) {
    return;
  }

  if (parameters.otherPerson) {
    builder.addOtherPersonForename(parameters.otherPerson, "soundex");
  }
}

function buildSearchData(input) {
  const gd = input.generalizedData;
  const options = input.options;
  const parameters = input.searchParameters;
  let scotpRecordType = parameters.subcategory;
  var builder = new ScotpFormDataBuilder(scotpRecordType);

  let dates = setDates(gd, scotpRecordType, parameters, options, builder);

  setAge(gd, scotpRecordType, parameters, options, builder);

  setNames(gd, scotpRecordType, parameters, options, builder);

  if (ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.gender)) {
    builder.addGender(gd.personGender);
  }

  setParents(gd, scotpRecordType, parameters, options, builder);

  setSpouse(gd, scotpRecordType, parameters, options, builder);

  setOtherPerson(gd, scotpRecordType, parameters, options, builder);

  setPlace(gd, scotpRecordType, parameters, options, builder, dates);

  let result = builder.getFormData();

  //console.log("result is " + result);

  return result;
}

export { buildSearchData };
