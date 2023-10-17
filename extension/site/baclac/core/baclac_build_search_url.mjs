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

import { BaclacUriBuilder } from "./baclac_uri_builder.mjs";
import { RC } from "../../../base/core/record_collections.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";

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

const minBaclacYear = 1837;
const maxBaclacYear = 1992;

function constrainYear(yearString) {
  if (!yearString) {
    return yearString;
  }

  let yearNum = DateUtils.getYearNumFromYearString(yearString);
  if (yearNum) {
    if (yearNum < minBaclacYear) {
      yearNum = minBaclacYear;
    } else if (yearNum > maxBaclacYear) {
      yearNum = maxBaclacYear;
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

function addAppropriateSurname(gd, type, builder) {
  let lastName = gd.lastNameAtBirth;
  if (type == "deaths" || !lastName) {
    lastName = gd.inferLastNameAtDeath();
  }

  if (!lastName) {
    lastName = gd.inferLastName();
  }

  if (lastName) {
    builder.addSurname(lastName);
  }
}

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  const typeOfSearch = buildUrlInput.typeOfSearch;

  var builder = new BaclacUriBuilder();

  // typeOfSearch can be:
  // "SameCollection"
  // "SpecifiedCollection"
  // "Census"
  // "All Collections"
  // "SpecifiedParameters"

  if (typeOfSearch == "Census") {
    builder.addDataSource("Genealogy", "Census");
    builder.addLastName(gd.inferLastName());
    builder.addFirstName(gd.inferForenames());

    builder.addBirthYear(gd.inferBirthYear(), 2);

    // This can fail if there is no birth country specified in the census being searched
    // Could possibly have some data in RC
    //builder.addBirthPlace(gd.inferBirthCountry());
  } else if (typeOfSearch == "SameCollection") {
    let collectionId = "";
    if (gd.collectionData && gd.collectionData.id) {
      collectionId = RC.mapCollectionId(
        gd.sourceOfData,
        gd.collectionData.id,
        "baclac",
        gd.inferEventCountry(),
        gd.inferEventYear()
      );
    } else {
      // should never happen
    }

    if (collectionId) {
      // Assume it will be a census for now
      builder.addDataSource("Genealogy", "Census");
      builder.addCensusApplicationCode(collectionId);

      builder.addLastName(gd.inferLastName());
      builder.addFirstName(gd.inferForenames());

      builder.addAge(gd.ageAtEvent, 0);
      builder.addBirthPlace(gd.inferBirthCountry());

      // Add collection reference gd if this is SameCollection
      builder.addDistrict(gd.collectionData.district);
      builder.addSubDistrict(gd.collectionData.subDistrict);
      builder.addPageNumber(gd.collectionData.page);
    }
  } else if (typeOfSearch == "AllCollections") {
    let searchString = gd.inferForenames() + " " + gd.inferLastName();
    builder.addSearchStringExact(searchString);

    let dateRange = gd.inferPossibleLifeYearRange();
    if (dateRange && dateRange.startYear && dateRange.endYear) {
      builder.addDateRange(dateRange.startYear.toString(), dateRange.endYear.toString());
    }
  } else if (typeOfSearch == "SpecifiedCollection") {
    let searchParams = buildUrlInput.searchParameters;
    if (searchParams.collectionWtsId) {
      let collection = RC.findCollectionByWtsId(searchParams.collectionWtsId);
      if (collection && collection.sites["baclac"]) {
        let baclacCollectionId = collection.sites["baclac"].id;
        builder.addCensusApplicationCode(baclacCollectionId);

        builder.addDataSource("Genealogy", "Census");

        builder.addLastName(gd.inferLastNameGivenParametersAndCollection(undefined, collection, true));
        builder.addFirstName(gd.inferForenames());
      }
    }
  } else if (typeOfSearch == "SpecifiedParameters") {
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
