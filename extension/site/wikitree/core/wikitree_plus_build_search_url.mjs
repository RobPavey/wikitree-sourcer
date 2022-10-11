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

import { WikiTreePlusUriBuilder } from "./wikitree_plus_uri_builder.mjs";
import { WTS_Date } from "../../../base/core/wts_date.mjs";

function convertDateToWtpSearchFormat(dateString) {
  let parsedDate = WTS_Date.parseDateString(dateString);

  let wtpDate = "";
  if (!parsedDate.isValid) {
    return wtpDate;
  }

  wtpDate = parsedDate.yearNum.toString();
  if (parsedDate.hasMonth) {
    wtpDate += parsedDate.monthNum.toString().padStart(2, "0");

    if (parsedDate.hasDay) {
      wtpDate += parsedDate.dayNum.toString().padStart(2, "0");
    }
  }

  return wtpDate;
}

function addToQueryString(queryString, fieldName, fieldValue) {
  if (fieldName) {
    if (queryString) {
      queryString += " ";
    }

    queryString += fieldName;

    if (fieldValue) {
      //if (fieldValue.includes(" ")) {
      //  fieldValue = '"' + fieldValue + '"';
      //}
      queryString += "=" + fieldValue;
    }
  }

  return queryString;
}

function buildSearchUrl(input) {
  //console.log("buildSearchData, input is:");
  //console.log(input);

  const data = input.generalizedData;
  const options = input.options;
  let parameters = undefined;

  if (input.typeOfSearch == "SpecifiedParameters") {
    parameters = input.searchParameters;
  }

  var builder = new WikiTreePlusUriBuilder();

  let query = "";

  let firstName = data.inferFirstName();
  if (firstName) {
    query = addToQueryString(query, "FirstName", firstName);
  }

  let lastNameAtBirth = data.inferLastNameAtBirth();
  if (lastNameAtBirth) {
    query = addToQueryString(query, "LastNameatBirth", lastNameAtBirth);
  }

  let lastNameAtDeath = data.inferLastNameAtDeath();
  if (lastNameAtDeath && lastNameAtDeath != lastNameAtBirth) {
    query = addToQueryString(query, "CurrentLastName", lastNameAtDeath);
  }

  let birthDate = data.inferBirthDate();
  if (birthDate) {
    let wtpDate = convertDateToWtpSearchFormat(birthDate);
    if (wtpDate) {
      query = addToQueryString(query, "B" + wtpDate);
    }
  }

  let deathDate = data.inferDeathDate();
  if (deathDate) {
    let wtpDate = convertDateToWtpSearchFormat(deathDate);
    if (wtpDate) {
      query = addToQueryString(query, "D" + wtpDate);
    }
  }

  let birthPlace = "";
  if (parameters) {
    birthPlace = parameters.birthPlace;
  } else {
    birthPlace = data.inferBirthPlace();
  }
  if (birthPlace) {
    let birthPlaceString = birthPlace.replace(/\s*\,\s+/g, " ");
    query = addToQueryString(query, "BirthLocation", birthPlaceString);
  }

  let deathPlace = "";
  if (parameters) {
    deathPlace = parameters.deathPlace;
  } else {
    deathPlace = data.inferDeathPlace();
  }
  if (deathPlace) {
    let deathPlaceString = deathPlace.replace(/\s*\,\s+/g, " ");
    query = addToQueryString(query, "DeathLocation", deathPlaceString);
  }

  builder.addSearchParameter("Query", query);
  builder.addSearchParameter("render", "1");

  let url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
