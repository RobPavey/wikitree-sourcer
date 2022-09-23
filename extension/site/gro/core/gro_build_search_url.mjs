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

import { GroUriBuilder } from "./gro_uri_builder.mjs";
import { RC } from "../../../base/core/record_collections.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { DataCache } from "../../../base/core/data_cache.mjs";

function getPersonGenderFromGeneralizedDataOrDataCache(generalizedData, dataCache, isBirth) {

  let personGender = generalizedData.personGender;

  if (!personGender) {
    // search the data cache for the person
    let entry = DataCache.findClosestWikiTreeProfilePrioritizingFirstName(generalizedData, dataCache, isBirth);
    if (entry) {
      personGender = entry.generalizedData.personGender;
    }
  }

  return personGender;
}


function buildSearchUrl(buildUrlInput) {

  const data = buildUrlInput.generalizedData;
  const dataCache = buildUrlInput.dataCache;
  const typeOfSearch = buildUrlInput.typeOfSearch;

  var builder = new GroUriBuilder;

  let type = typeOfSearch.toLowerCase();
  if (typeOfSearch == "SameCollection") {
    if (data.collectionData && data.collectionData.id) {
      type = RC.mapCollectionId(data.sourceOfData, data.collectionData.id, "gro",
        data.inferEventCountry(), data.inferEventYear());
    }
    else {
      // should never happen
      type = "births";
    }
  }

  if (type == "births") {
    builder.addIndex("EW_Birth");
    builder.addYear(data.inferBirthYear());
    builder.addYearRange("1");
    if (data.lastNameAtBirth) {
      builder.addSurname(data.lastNameAtBirth);
    }
    else {
      let lastName = data.inferLastName();
      if (lastName) {
        builder.addSurname(lastName);
      }
    }
    builder.addMothersSurname(data.mothersMaidenName);

    if (data.recordType == RT.BirthRegistration) {
      if (data.registrationDistrict) {
        builder.addDistrict(data.registrationDistrict);
      }
    }
  }
  else {
    builder.addIndex("EW_Death");
    builder.addYear(data.inferDeathYear());
    builder.addYearRange("1");
    builder.addSurname(data.inferLastNameAtDeath());
    builder.addAge(data.inferAgeAtDeath());
    builder.addAgeRange("5");

    if (data.recordType == RT.DeathRegistration) {
      if (data.registrationDistrict) {
        builder.addDistrict(data.registrationDistrict);
      }
    }
  }

  builder.addFirstForename(data.inferFirstName())
  builder.addSecondForename(data.inferSecondForename());

  let personGender = getPersonGenderFromGeneralizedDataOrDataCache(data, dataCache, buildUrlInput.typeOfSearch == "groBirth");
  if (personGender) {
    if (personGender.toLowerCase() == "male") {
      builder.addGenderMale();
    }
    else {
      builder.addGenderFemale();
    }
  }

  if (data.eventDate && data.eventDate.quarter) {
    const quarterLetters = [ "M", "J", "S", "D"];
    let quarterLetter = quarterLetters[data.eventDate.quarter-1];
    builder.addQuarter(quarterLetter);
  }

  // Add collection reference data if this is SameCollection
  if (typeOfSearch == "SameCollection") {
    builder.addVolume(data.collectionData.volume);
    builder.addPage(data.collectionData.page);
  }
  
  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    'url' : url,
  }

  return result;
}

export { buildSearchUrl };
