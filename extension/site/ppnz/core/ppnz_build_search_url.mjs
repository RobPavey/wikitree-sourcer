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

import { PpnzUriBuilder } from "./ppnz_uri_builder.mjs";

const minPpnzYear = 1837;
const maxPpnzYear = 1992;

function constrainYear(yearNum) {
  if (yearNum < minPpnzYear) {
    yearNum = minPpnzYear;
  } else if (yearNum > maxPpnzYear) {
    yearNum = maxPpnzYear;
  }
  return yearNum;
}

function constrainYears(dates) {
  dates.startYear = constrainYear(dates.startYear);
  dates.endYear = constrainYear(dates.endYear);
}

function getDefaultSearchParameters(generalizedData, options) {
  let parameters = {};

  parameters.queryType = "phrases";

  parameters.proximity = "exact";

  parameters.includeFirstName = true;
  parameters.includeGivenNames = true;
  parameters.includePrefName = true;

  parameters.includeLnab = true;
  parameters.includeCln = true;

  parameters.includeLnabAtStart = false;
  parameters.includeClnAtStart = false;

  return parameters;
}

function buildQueryString(gd, parameters, options) {
  let query = "";

  let givenNameVariants = [];
  let lastNameVariants = [];
  let lastNameAtStartVariants = [];

  function addNameVariant(nameArray, name, parameterName) {
    if (name && parameters[parameterName]) {
      if (!nameArray.includes(name)) {
        nameArray.push(name);
      }
    }
  }

  function addNameWordVariants(nameArray, names, parameterName) {
    if (names) {
      names = names.trim();
      let splitNames = names.split(" ");
      let suffix = 1;
      for (let name of splitNames) {
        if (!nameArray.includes(name)) {
          let newParameterName = parameterName + suffix;
          if (parameters[newParameterName]) {
            nameArray.push(name);
          }
        }
        suffix++;
      }
    }
  }

  const proximityMap = {
    exact: -1,
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    5: 5,
    10: 10,
  };

  let proximity = proximityMap[parameters.proximity];

  addNameVariant(givenNameVariants, gd.inferFirstName(), "includeFirstName");
  addNameVariant(givenNameVariants, gd.inferForenames(), "includeGivenNames");

  addNameVariant(lastNameVariants, gd.inferLastNameAtBirth(), "includeLnab");
  addNameVariant(lastNameVariants, gd.inferLastNameAtDeath(), "includeCln");

  if (proximity == -1) {
    addNameVariant(lastNameAtStartVariants, gd.inferLastNameAtBirth(), "includeLnabAtStart");
    addNameVariant(lastNameAtStartVariants, gd.inferLastNameAtDeath(), "includeClnAtStart");
  }

  if (gd.name) {
    if (gd.name.prefName) {
      addNameVariant(givenNameVariants, gd.name.prefName, "includePrefName");
    } else if (gd.name.prefNames) {
      addNameVariant(givenNameVariants, gd.name.prefNames, "includePrefName");
    }
    addNameWordVariants(givenNameVariants, gd.name.nicknames, "includeNickname");
    addNameWordVariants(lastNameVariants, gd.name.otherLastNames, "includeOtherLastName");

    if (proximity == -1) {
      addNameWordVariants(lastNameAtStartVariants, gd.name.otherLastNames, "includeOtherLastNameAtStart");
    }
  }

  let phrases = [];

  function addPhrase(phrase) {
    let wordCount = phrase.split(" ").length;
    let stringToAdd = "";
    if (wordCount == 1) {
      stringToAdd = phrase;
    } else {
      let proximityString = "";
      if (proximity != -1) {
        proximityString = "~" + (wordCount + proximity);
      }
      stringToAdd = `"${phrase}"${proximityString}`;
    }

    if (!phrases.includes(stringToAdd)) {
      phrases.push(stringToAdd);
    }
  }

  if (givenNameVariants.length > 0) {
    for (let name1 of givenNameVariants) {
      if (lastNameVariants.length > 0 || lastNameAtStartVariants.length > 0) {
        for (let name2 of lastNameVariants) {
          addPhrase(`${name1} ${name2}`);
        }
        for (let name2 of lastNameAtStartVariants) {
          addPhrase(`${name2} ${name1}`);
        }
      } else {
        addPhrase(`${name1}`);
      }
    }
  } else {
    if (lastNameVariants.length > 0) {
      for (let name2 of lastNameVariants) {
        addPhrase(`${name2}`);
      }
    }
    if (lastNameAtStartVariants.length > 0) {
      for (let name2 of lastNameAtStartVariants) {
        addPhrase(`${name2}`);
      }
    }
  }

  if (phrases.length == 1) {
    query += phrases[0];
  } else if (phrases.length > 1) {
    query = "(";
    for (let phrase of phrases) {
      if (query.length > 1) {
        query += " OR ";
      }
      query += phrase;
    }
    query += ")";
  }

  return query;
}

function buildSearchUrl(buildUrlInput) {
  const data = buildUrlInput.generalizedData;
  let parameters = buildUrlInput.searchParameters;
  const options = buildUrlInput.options;

  if (!parameters) {
    parameters = getDefaultSearchParameters(data, options);
  }

  var builder = new PpnzUriBuilder();

  const dateRange = data.inferPossibleLifeYearRange();
  if (options.search_ppnz_addToDateRange != "none") {
    // although the values are ints in options sometimes they come through as strings in browser
    let offsetToRange = Number(options.search_ppnz_addToDateRange);
    if (!isNaN(offsetToRange)) {
      if (dateRange.startYear) {
        dateRange.startYear -= offsetToRange;
      }
      if (dateRange.endYear) {
        dateRange.endYear += offsetToRange;
      }
    }
  }

  // constrain years to the range covered by Ppnz
  constrainYears(dateRange);

  let queryString = buildQueryString(data, parameters, options);
  builder.addQueryString(queryString);

  // set the date parameters
  if (dateRange.startYear) {
    builder.addStartYear(dateRange.startYear);
  }
  if (dateRange.endYear) {
    builder.addEndYear(dateRange.endYear);
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl, buildQueryString, getDefaultSearchParameters };
