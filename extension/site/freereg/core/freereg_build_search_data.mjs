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

import { WTS_Date } from "../../../base/core/wts_date.mjs";
import { countyNameToCountyCode } from "../../freecen/core/freecen_chapman_codes.mjs";
import { dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";

function addStartAndEndYearFromEventYear(
  data,
  options,
  eventYear,
  dateQualifier,
  fieldData
) {
  // compute the start and end birth dates
  let optYearRange = options.search_freereg_yearRange;
  if (optYearRange != "none") {
    let startAndEndDates = {
      startYear: undefined,
      endYear: undefined,
    };

    if (optYearRange == "auto") {
      data.setDatesUsingQualifier(startAndEndDates, eventYear, dateQualifier);
    } else {
      let range = 2;
      if (optYearRange == "exact") {
        range = 0;
      } else if (optYearRange == "2") {
        range = 2;
      } else if (optYearRange == "5") {
        range = 5;
      } else if (optYearRange == "10") {
        range = 10;
      }
      let yearNum = WTS_Date.getYearNumFromYearString(eventYear);
      if (yearNum) {
        startAndEndDates.startYear = yearNum - range;
        startAndEndDates.endYear = yearNum + range;
      }
    }
    if (startAndEndDates.startYear) {
      fieldData["start_year"] = startAndEndDates.startYear;
    }
    if (startAndEndDates.endYear) {
      fieldData["end_year"] = startAndEndDates.endYear;
    }
  }
}

function addStartAndEndYearFromBirthAndDeath(
  data,
  options,
  fieldData,
  startOffset
) {
  // compute the start and end birth dates
  let optYearRange = options.search_freereg_yearRange;
  if (optYearRange != "none") {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let startAndEndDates = data.inferPossibleLifeYearRange(maxLifespan);

    if (optYearRange == "auto") {
      let birthDateQualifier = data.inferBirthDateQualifier();
      let deathDateQualifier = data.inferDeathDateQualifier();

      let birthStartAndEndDates = {
        startYear: undefined,
        endYear: undefined,
      };
      let deathStartAndEndDates = {
        startYear: undefined,
        endYear: undefined,
      };

      data.setDatesUsingQualifierAndYearNum(
        birthStartAndEndDates,
        startAndEndDates.startYear,
        birthDateQualifier
      );
      data.setDatesUsingQualifierAndYearNum(
        deathStartAndEndDates,
        startAndEndDates.endYear,
        deathDateQualifier
      );
      startAndEndDates.startYear =
        birthStartAndEndDates.startYear + startOffset;
      startAndEndDates.endYear = deathStartAndEndDates.endYear;
    } else {
      let startYearNum = startAndEndDates.startYear + startOffset;
      let endYearNum = startAndEndDates.endYear;

      let range = 2;
      if (optYearRange == "exact") {
        range = 0;
      } else if (optYearRange == "2") {
        range = 2;
      } else if (optYearRange == "5") {
        range = 5;
      } else if (optYearRange == "10") {
        range = 10;
      }
      if (yearNum) {
        startAndEndDates.startYear = startYearNum - range;
        startAndEndDates.endYear = endYearNum + range;
      }
    }

    if (startAndEndDates.startYear) {
      fieldData["start_year"] = startAndEndDates.startYear;
    }
    if (startAndEndDates.endYear) {
      fieldData["end_year"] = startAndEndDates.endYear;
    }
  }
}

function buildSearchData(input) {
  //console.log("buildSearchData, input is:");
  //console.log(input);

  const data = input.generalizedData;
  const options = input.options;

  let fieldData = {
    utf8: true,
  };

  let parameters = undefined;

  let type = "baptism";
  let countyCode = undefined;
  if (input.typeOfSearch) {
    if (input.typeOfSearch == "SpecifiedParameters") {
      parameters = input.searchParameters;
      if (parameters.category != "all") {
        type = parameters.category;
      }
      if (parameters.subcategory != "allCounties") {
        countyCode = parameters.subcategory;
      }
    } else {
      type = input.typeOfSearch.toLowerCase();
    }
  }

  let lastName = data.inferLastName();
  let eventYear = data.inferEventYear();
  let dateQualifier = dateQualifiers.NONE;
  let county = undefined;

  if (type == "baptism") {
    lastName = data.inferLastNameAtBirth();
    eventYear = data.inferBirthYear();
    dateQualifier = data.inferBirthDateQualifier();
    county = data.inferBirthCounty();
    addStartAndEndYearFromEventYear(
      data,
      options,
      eventYear,
      dateQualifier,
      fieldData
    );
    fieldData["ba"] = true;
  } else if (type == "burial") {
    lastName = data.inferLastNameAtDeath();
    eventYear = data.inferDeathYear();
    dateQualifier = data.inferDeathDateQualifier();
    county = data.inferDeathCounty();
    addStartAndEndYearFromEventYear(
      data,
      options,
      eventYear,
      dateQualifier,
      fieldData
    );
    fieldData["bu"] = true;
  } else if (type == "marriage") {
    addStartAndEndYearFromBirthAndDeath(data, options, fieldData, 14);
    county = data.inferBirthCounty();
    if (!county) {
      county = data.inferDeathCounty();
    }
    fieldData["ma"] = true;
  } else if (type == "all") {
    addStartAndEndYearFromBirthAndDeath(data, options, fieldData, 0);
    county = data.inferBirthCounty();
    if (!county) {
      county = data.inferDeathCounty();
    }
    fieldData["all"] = true;
  }

  if (!county) {
    county = data.inferEventCounty();
  }

  let forenames = data.inferForenames();
  if (forenames) {
    fieldData["first_name"] = forenames;
  }

  if (parameters) {
    let lastNamesArray = data.inferPersonLastNamesArray(data);
    if (lastNamesArray.length > 0) {
      if (lastNamesArray.length == 1) {
        lastName = lastNamesArray[0];
      } else if (lastNamesArray.length > parameters.lastNameIndex) {
        lastName = lastNamesArray[parameters.lastNameIndex];
      }
    }
  }

  if (lastName) {
    fieldData["last_name"] = lastName;
  }

  let optFuzzy = options.search_freereg_fuzzy;
  fieldData["search_query_fuzzy"] = optFuzzy;

  if (countyCode) {
    fieldData["search_query_chapman_codes"] = countyCode;
  } else {
    let optCounty = options.search_freereg_includeCounty;
    if (optCounty) {
      if (county) {
        let chapmanCode = countyNameToCountyCode(county);
        if (chapmanCode) {
          fieldData["search_query_chapman_codes"] = chapmanCode;
        }
      }
    }
  }

  //console.log("fieldData is:");
  //console.log(fieldData);

  var result = {
    fieldData: fieldData,
  };

  return result;
}

export { buildSearchData };
