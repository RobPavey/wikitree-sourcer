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
  let personGender = generalizedData.inferPersonGender();

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
  const gd = buildUrlInput.generalizedData;
  const dataCache = buildUrlInput.dataCache;
  const typeOfSearch = buildUrlInput.typeOfSearch;
  const options = buildUrlInput.options;

  var builder = new GroUriBuilder();

  let type = typeOfSearch.toLowerCase();
  if (typeOfSearch == "SameCollection") {
    if (gd.collectionData && gd.collectionData.id) {
      type = RC.mapCollectionId(
        gd.sourceOfData,
        gd.collectionData.id,
        "gro",
        gd.inferEventCountry(),
        gd.inferEventYear()
      );
    } else {
      // should never happen
      type = "births";
    }
  }

  if (type == "births") {
    builder.addIndex("EW_Birth");
    builder.addYear(gd.inferBirthYear());
    builder.addYearRange("1");
    if (gd.lastNameAtBirth) {
      builder.addSurname(gd.lastNameAtBirth);
    } else {
      let lastName = gd.inferLastName();
      if (lastName) {
        builder.addSurname(lastName);
      }
    }
    builder.addMothersSurname(gd.mothersMaidenName);

    if (gd.recordType == RT.BirthRegistration) {
      if (gd.registrationDistrict) {
        builder.addDistrict(gd.registrationDistrict);
      }
    }
  } else {
    builder.addIndex("EW_Death");
    builder.addYear(gd.inferDeathYear());
    builder.addYearRange("1");
    builder.addSurname(gd.inferLastNameAtDeath(options));

    builder.addAge(gd.inferAgeAtDeathAsString());
    builder.addAgeRange("5");

    if (gd.recordType == RT.DeathRegistration) {
      if (gd.registrationDistrict) {
        builder.addDistrict(gd.registrationDistrict);
      }
    }
  }

  builder.addFirstForename(gd.inferFirstName());

  // Second forename. This should never be an initial. So if what we have is an initial
  // we should either not add it or expand it if we have other sources of information
  let secondForename = gd.inferSecondForename();
  if (secondForename) {
    if (secondForename.length == 1) {
      if (gd.personGeneralizedData) {
        let pgd = gd.personGeneralizedData;
        let personFirstName = pgd.inferFirstName();
        let personSecondForename = pgd.inferSecondForename();
        if (personSecondForename && personSecondForename.length > 1) {
          if (personSecondForename[0] == secondForename) {
            if (gd.inferFirstName() == personFirstName) {
              let lastNameAtBirth = gd.inferLastNameAtBirth();
              let lastNameAtDeath = gd.inferLastNameAtDeath(options);
              let personLastNameAtBirth = pgd.inferLastNameAtBirth();
              let personLastNameAtDeath = pgd.inferLastNameAtDeath(options);
              if (personLastNameAtBirth == lastNameAtBirth || personLastNameAtDeath == lastNameAtDeath) {
                builder.addSecondForename(personSecondForename);
              }
            }
          }
        }
      }
    } else {
      builder.addSecondForename(secondForename);
    }
  }

  let personGender = getPersonGenderFromGeneralizedDataOrDataCache(
    gd,
    dataCache,
    buildUrlInput.typeOfSearch == "births"
  );
  if (personGender) {
    if (personGender.toLowerCase() == "male") {
      builder.addGenderMale();
    } else {
      builder.addGenderFemale();
    }
  }

  if (gd.eventDate && gd.eventDate.quarter) {
    const quarterLetters = ["M", "J", "S", "D"];
    let quarterLetter = quarterLetters[gd.eventDate.quarter - 1];
    builder.addQuarter(quarterLetter);
  }

  // Add collection reference data if this is SameCollection
  if (typeOfSearch == "SameCollection") {
    builder.addVolume(gd.collectionData.volume);
    builder.addPage(gd.collectionData.page);
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
