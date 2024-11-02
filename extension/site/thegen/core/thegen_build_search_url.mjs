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

import { ThegenUriBuilder } from "./thegen_uri_builder.mjs";

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  const typeOfSearch = buildUrlInput.typeOfSearch;
  const parameters = buildUrlInput.searchParameters;
  const options = buildUrlInput.options;

  var builder = new ThegenUriBuilder();

  // call methods on builder here

  let lastName = gd.inferLastName();
  if (typeOfSearch == "SpecifiedParameters") {
    let lastNamesArray = gd.inferPersonLastNamesArray(gd);
    if (lastNamesArray.length > 0) {
      if (lastNamesArray.length == 1) {
        lastName = lastNamesArray[0];
      } else if (lastNamesArray.length > parameters.lastNameIndex) {
        lastName = lastNamesArray[parameters.lastNameIndex];
      }
    }
  }
  builder.addSurname(lastName);

  builder.addGivenNames(gd.inferForenames());

  let exactness = 2;
  const exactnessOption = options.search_thegen_dateExactness;
  if (exactnessOption == "exact") {
    exactness = 0;
  } else if (/^\d+$/.test(exactnessOption)) {
    exactness = Number(exactnessOption);
  }

  if (typeOfSearch == "SameEvent") {
    let eventDateObj = gd.inferEventDateObj();
    if (eventDateObj) {
      let eventYear = eventDateObj.getYearString();
      if (eventYear) {
        builder.addYear(eventYear);
        builder.addRange(exactness);
      }
    }
  } else {
    const maxLifespan = Number(options.search_general_maxLifespan);

    let lifeRange = gd.inferPossibleLifeYearRange(maxLifespan, Date.now(), exactness);
    let diff = lifeRange.endYear - lifeRange.startYear;

    let midpoint = Math.floor((lifeRange.endYear + lifeRange.startYear) / 2);
    let targetRange = Math.floor((diff + 1) / 2);
    targetRange += exactness;
    let rangeValues = [0, 1, 2, 5, 10, 15, 20, 25, 30, 40, 50];
    let range = 50;
    for (let rangeValue of rangeValues) {
      if (targetRange < rangeValue) {
        range = rangeValue;
        break;
      }
    }

    let eventDateObj = gd.inferEventDateObj();
    if (diff >= maxLifespan && eventDateObj) {
      // there is a risk that the midpoint +- 50 will not include the event date
      let eventYear = eventDateObj.getYearString();
      if (eventYear) {
        let yearNum = Number(eventYear);
        if (yearNum && !isNaN(yearNum)) {
          if (yearNum < midpoint - range) {
            midpoint = yearNum + range;
          } else if (yearNum > midpoint + range) {
            midpoint = yearNum - range;
          }
        }
      }
    }

    builder.addYear(midpoint);
    builder.addRange(range);
  }

  if (typeOfSearch == "SpecifiedParameters") {
    let placeName = parameters.place;
    if (placeName && placeName != "<none>") {
      builder.addKeywords(placeName);
    }
  } else if (typeOfSearch == "SameEvent") {
    builder.addKeywords(gd.inferEventPlace());
  } else {
    let placeNames = gd.inferPlaceNames();
    if (placeNames.length == 1) {
      builder.addKeywords(placeNames[0]);
    } else if (placeNames.length > 1) {
      // do the place names all have something in common
      let commonPlace = placeNames[0];
      for (let index = 1; index < placeNames.length; index++) {
        let thisPlace = placeNames[index];
        if (thisPlace != commonPlace) {
          if (commonPlace.includes(thisPlace)) {
            commonPlace = thisPlace;
          } else if (!thisPlace.includes(commonPlace)) {
            // neither includes the other but they may share a common ending
            let placeParts = thisPlace.split(",");
            let commonParts = commonPlace.split(",");
            let shortestLength = placeParts.length;
            if (commonParts.length < shortestLength) {
              shortestLength = commonParts.length;
            }
            commonPlace = "";
            for (let index = 0; index < shortestLength; index++) {
              let placePart = placeParts[placeParts.length - 1 - index].trim();
              let commonPart = commonParts[commonParts.length - 1 - index].trim();
              if (placePart == commonPart) {
                if (commonPlace) {
                  commonPlace = placePart + ", " + commonPlace;
                } else {
                  commonPlace = placePart;
                }
              }
            }
            if (!commonPlace) {
              break;
            }
          }
        }
      }
      if (commonPlace) {
        builder.addKeywords(commonPlace);
      }
    }
  }

  if (typeOfSearch == "SpecifiedParameters") {
    let category = parameters.category;
    if (category && category != "all") {
      builder.addMasterEvent(category);
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
