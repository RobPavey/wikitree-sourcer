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

import { NsvrUriBuilder } from "./nsvr_uri_builder.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";

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

const minNsvrYear = 1763;
const maxNsvrYear = 1975;

function constrainYear(yearString) {
  if (!yearString) {
    return yearString;
  }

  let yearNum = DateUtils.getYearNumFromYearString(yearString);
  if (yearNum) {
    if (yearNum < minNsvrYear) {
      yearNum = minNsvrYear;
    } else if (yearNum > maxNsvrYear) {
      yearNum = maxNsvrYear;
    }
    return yearNum.toString();
  } else {
    return yearString;
  }
}

function constrainYears(dates) {
  dates.startYear = constrainYear(dates.startYear);
  dates.endYear = constrainYear(dates.endYear);
}

function addAppropriateSurname(gd, type, builder, options) {
  let lastName = gd.lastNameAtBirth;
  if (type == "deaths" || !lastName) {
    lastName = gd.inferLastNameAtDeath(options);
  }

  if (!lastName) {
    lastName = gd.inferLastName();
  }

  if (lastName) {
    builder.addSurname(lastName);
  }
}

function inferNSCounty(placeString) {
  if (placeString) {
    const counties = [
      "annapolis",
      "antigonish",
      "cape breton",
      "colchester",
      "cumberland",
      "digby",
      "guysborough",
      "halifax",
      "hants",
      "inverness",
      "kings",
      "lunenburg",
      "pictou",
      "queens",
      "richmond",
      "shelburne",
      "victoria",
      "yarmouth",
    ];
    let place = placeString.toLowerCase().replace(" county", "");
    const found = counties.find((v) => place.includes(v));
    //console.log("found is " + found);
    if (found) {
      // place string includes at least one match to county names
      if (place.includes("canada")) {
        place = place.substring(0, place.indexOf("canada")).replace(/,\s*$/, "");
      }
      if (place.includes("british north america")) {
        place = place.substring(0, place.indexOf("british north america")).replace(/,\s*$/, "");
      }
      if (place.includes("nova scotia")) {
        place = place.substring(0, place.indexOf("nova scotia")).replace(/,\s*$/, "");
      }
      const tokens = place.split(", ");
      let lastToken = tokens.pop();
      if (counties.includes(lastToken)) {
        return StringUtils.toInitialCapsEachWord(lastToken);
      } else {
        // unable to extract the match programmatically, fall back on the output of find
        return StringUtils.toInitialCapsEachWord(found);
      }
    }
  }
  return "";
}

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  const typeOfSearch = buildUrlInput.typeOfSearch;
  const options = buildUrlInput.options;

  var builder = new NsvrUriBuilder();

  // typeOfSearch can be:
  // "Births"
  // "Marriages"
  // "Deaths"
  let type = typeOfSearch.toLowerCase();

  // compute the start and end dates
  let dates = {
    startYear: undefined,
    endYear: undefined,
  };

  if (type == "births") {
    let birthYear = gd.inferBirthYear();
    let birthDateQualifier = gd.inferBirthDateQualifier();
    gd.setDatesUsingQualifier(dates, birthYear, birthDateQualifier);
  } else if (type == "marriages") {
    let eventYear = gd.inferEventYear();

    let birthYear = gd.inferBirthYear();
    if (birthYear) {
      dates.startYear = addNumToYearString(birthYear, 14);
    } else if (eventYear) {
      dates.startYear = subtractNumFromYearString(eventYear, 100);
    }

    let deathYear = gd.inferDeathYear();
    if (deathYear) {
      dates.endYear = deathYear;
    } else if (eventYear) {
      dates.endYear = addNumToYearString(eventYear, 100);
    }

    for (let spouse of gd.spouses) {
      if (spouse.marriageDate) {
        let marriageDate = DateUtils.parseDateString(spouse.marriageDate.dateString);
        if (marriageDate) {
          let marriageYear = marriageDate.yearNum;
          let marriageQualifier = 2; // "about"
          gd.setDatesUsingQualifier(dates, marriageYear, marriageQualifier);
        }
      }
    }
  } else if (type == "deaths") {
    let deathYear = gd.inferDeathYear();
    let deathDateQualifier = gd.inferDeathDateQualifier();
    gd.setDatesUsingQualifier(dates, deathYear, deathDateQualifier);
  }

  // constrain years to the range covered by Nova Scotia Vital Records
  constrainYears(dates);

  // get the location parameters
  let county = "";
  if (type == "births") {
    county = inferNSCounty(gd.inferBirthPlace());
  } else if (type == "marriages") {
    for (let spouse of gd.spouses) {
      if (spouse.marriagePlace) {
        county = inferNSCounty(spouse.marriagePlace.placeString);
      }
    }
  } else if (type == "deaths") {
    county = inferNSCounty(gd.inferDeathPlace());
  }

  // set the parameters
  builder.addGivenName(gd.inferFirstName());
  builder.addGivenNameStyle("");

  addAppropriateSurname(gd, type, builder, options);
  builder.addSurnameStyle("");

  builder.addSearchParameter("Place", "");
  builder.addSearchParameter("County", county);

  if (dates.startYear) {
    builder.addStartYear(dates.startYear);
  }
  if (dates.endYear) {
    builder.addEndYear(dates.endYear);
  }

  builder.addType(typeOfSearch);

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
