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

import { DateUtils } from "../../../base/core/date_utils.mjs";
import { RC } from "../../../base/core/record_collections.mjs";
import { RT, Role } from "../../../base/core/record_type.mjs";

import { NodaUriBuilder } from "./noda_uri_builder.mjs";
import { lookupPlaceObj } from "./noda_places.mjs";

function addEventPlace(builder, gd) {
  // add a place if known
  // https://www.digitalarkivet.no/en/search/persons/advanced?
  // from=1766&to=2010
  // &sc%5B%5D=kb
  // &c%5B%5D=12
  // &firstname=Knut&lastname=
  // &genders%5B%5D=m
  // &birth_year_from=&birth_year_to=&birth_date=&birth_place=
  // &domicile=&position=
  // &event_year_from=1888&event_year_to=1888&event_date=4-22
  // &related_first_name=Lars&related_last_name=Knutsen&related_birth_year=&related_roles%5B%5D=far&related_roles%5B%5D=mor&sort=rel
  let eventPlaceObj = gd.inferEventPlaceObj();
  if (!eventPlaceObj) {
    return;
  }

  let placeData = lookupPlaceObj(gd.inferEventPlaceObj());

  if (placeData) {
    if (placeData.place) {
      builder.addPlace(placeData.place.code);
      return;
    }

    if (placeData.county) {
      builder.addCounty(placeData.county.code);
      return;
    }
  }
}

function addEventDate(builder, gd) {
  // add event date if known
  let eventDateObj = gd.inferEventDateObj();
  if (eventDateObj) {
    let dateString = eventDateObj.getDateString();
    if (dateString) {
      let parsedDate = DateUtils.parseDateString(dateString);
      if (parsedDate.isValid) {
        builder.addEventDate(parsedDate.yearNum, parsedDate.monthNum, parsedDate.dayNum);
      }
    }
  }
}

function addRelatedPerson(builder, gd) {
  // add a related person if known
  let addedRelatedPerson = false;
  if (gd.parents) {
    let parentNames = gd.inferParentForenamesAndLastName();
    if (parentNames.fatherForenames && parentNames.fatherLastName) {
      builder.addRelatedPerson(parentNames.fatherForenames, parentNames.fatherLastName, "far");
      addedRelatedPerson = true;
    } else if (parentNames.motherForenames && parentNames.motherLastName) {
      builder.addRelatedPerson(parentNames.motherForenames, parentNames.motherLastName, "mor");
      addedRelatedPerson = true;
    }
  }
  if (!addedRelatedPerson && gd.spouses && gd.spouses.length == 1) {
    let spouse = gd.spouses[0];
    if (spouse.name) {
      let firstName = spouse.name.inferForenames();
      let lastName = spouse.name.inferLastName();
      if (gd.personGender == "male") {
        builder.addRelatedPerson(firstName, lastName, "brud");
      } else if (gd.personGender == "female") {
        builder.addRelatedPerson(firstName, lastName, "brudgom");
      }
    }
  }

  if (gd.role && gd.role != Role.Primary && gd.primaryPerson) {
    let relatedPerson = gd.primaryPerson;
    if (gd.role == Role.Parent) {
      let firstName = relatedPerson.name.inferForenames();
      let lastName = relatedPerson.name.inferLastName();
      builder.addRelatedPerson(firstName, lastName, "barn");
    }
  }
}

function addRole(builder, gd) {
  if (gd.role && gd.role != Role.Primary) {
    if (gd.role == Role.Parent) {
      if (gd.personGender == "male") {
        builder.addRole("far");
      } else if (gd.personGender == "female") {
        builder.addRole("mor");
      }
    }
  }
}

function addNames(builder, gd) {
  let forenames = gd.inferForenames();
  builder.addFirstName(forenames);

  let lastName = gd.inferLastNames();
  if (lastName) {
    let lastNameParts = lastName.split(" ");
    if (lastNameParts.length > 0) {
      let lastNames = lastNameParts[0];
      for (let index = 1; index < lastNameParts.length; index++) {
        lastNames += " | " + lastNameParts[index];
      }
      builder.addLastName(lastNames);
    }
  }
}

function addSourcePeriod(builder, gd, options) {
  let sourcePeriodExactness = options.search_noda_sourcePeriodExactness;

  let exactness = sourcePeriodExactness;
  if (exactness == "exact") {
    exactness = 0;
  } else {
    exactness = Number(exactness);
  }
  let dateRange = gd.inferPossibleLifeYearRange(undefined, undefined, exactness);
  builder.addStartYear(dateRange.startYear);
  builder.addEndYear(dateRange.endYear);
}

function addBirth(builder, gd, options) {
  let birthYearExactness = options.search_noda_birthYearExactness;
  let useExactBirthYear = options.search_noda_useExactBirthDate;

  let birthDate = gd.inferBirthDate();
  let parsedDate = DateUtils.parseDateString(birthDate);
  if (parsedDate && parsedDate.hasMonth && useExactBirthYear) {
    builder.addBirthDate(parsedDate.yearNum, parsedDate.monthNum, parsedDate.dayNum);
  } else {
    let exactness = birthYearExactness;
    if (exactness == "exact") {
      exactness = 0;
    } else {
      exactness = Number(exactness);
    }
    let birthYear = gd.inferBirthYear();
    let yearNum = Number(birthYear);
    if (yearNum && !isNaN(yearNum)) {
      if (!isNaN(yearNum)) {
        let startYear = yearNum - exactness;
        let endYear = yearNum + exactness;
        builder.addBirthYearRange(startYear, endYear);
      } else {
        builder.addBirthDate(birthYear);
      }
    }
  }
}

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;
  let options = buildUrlInput.options;
  let typeOfSearch = buildUrlInput.typeOfSearch;

  var builder = new NodaUriBuilder();

  // call methods on builder here

  addNames(builder, gd);

  let gender = gd.personGender;
  builder.addGender(gender);

  let sameCollection = false;
  let sameEvent = false;
  let parameters = undefined;
  let collection = undefined;

  if (typeOfSearch == "SameCollection") {
    if (gd.collectionData && gd.collectionData.id) {
      let nodaCollectionId = RC.mapCollectionId(
        gd.sourceOfData,
        gd.collectionData.id,
        "noda",
        gd.inferEventCountry(),
        gd.inferEventYear()
      );
      if (nodaCollectionId) {
        collection = RC.findCollection("fs", nodaCollectionId);
        builder.addCategory(nodaCollectionId);
        sameCollection = true;
      }
    }
  } else if (typeOfSearch == "SameEvent") {
    sameEvent = true;
  } else if (typeOfSearch == "SpecifiedCollection") {
    let searchParams = buildUrlInput.searchParameters;
    if (searchParams.collectionWtsId) {
      collection = RC.findCollectionByWtsId(searchParams.collectionWtsId);
      if (collection) {
        let nodaCollectionId = collection.sites["noda"].id;
        builder.addCategory(nodaCollectionId);
      }
    }
  } else if (typeOfSearch == "SpecifiedParameters") {
    parameters = buildUrlInput.searchParameters;
    if (parameters.collection && parameters.collection != "all") {
      builder.addCategory(parameters.collection);
    } else if (parameters.category && parameters.category != "all") {
      builder.addCategory(parameters.category);
    }
  }

  let sourcePeriodOption = options.search_noda_includeSourcePeriod;
  let birthYearExactness = options.search_noda_birthYearExactness;

  let birthDate = gd.inferBirthDate();

  let useBirth = false;
  if (birthDate && birthYearExactness != "none") {
    useBirth = true;
  }

  if (sourcePeriodOption == "always" || (sourcePeriodOption == "ifNoBirth" && !useBirth)) {
    addSourcePeriod(builder, gd, options);
  }

  if (useBirth) {
    addBirth(builder, gd, options);
  }

  if (sameCollection || sameEvent) {
    // add a place if known
    addEventPlace(builder, gd);
    addEventDate(builder, gd);
    // add a related person if known
    addRelatedPerson(builder, gd);
    addRole(builder, gd);
  } else if (parameters) {
    if (parameters.place && parameters.place != "all") {
      builder.addPlace(parameters.place);
    } else if (parameters.county && parameters.county != "all") {
      builder.addCounty(parameters.county);
    } else if (parameters.region && parameters.region != "all") {
      builder.addRegion(parameters.region);
    }
  }

  /*
  Don't add birth place by default
  let birthPlace = gd.inferBirthPlace();
  builder.addBirthPlace(birthPlace);
  */

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
