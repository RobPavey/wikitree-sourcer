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

import { AncestryUriBuilder } from "./ancestry_uri_builder.mjs";
import { RC } from "../../../base/core/record_collections.mjs";
import { AncestryData } from "./ancestry_data.mjs";
import { RT } from "../../../base/core/record_type.mjs";

function buildSearchUrl(buildUrlInput) {
  let data = buildUrlInput.generalizedData;
  let options = buildUrlInput.options;

  //console.log("buildSearchUrlAncestry, gd is:");
  //console.log(data);

  let sameCollection = false;
  let ancestryCollectionId = undefined;
  let category = undefined;
  let subcategory = undefined;
  let parameters = undefined;

  let collection = undefined;
  if (buildUrlInput.typeOfSearch == "SameCollection") {
    if (data.collectionData && data.collectionData.id) {
      ancestryCollectionId = RC.mapCollectionId(
        data.sourceOfData,
        data.collectionData.id,
        "ancestry",
        data.inferEventCountry(),
        data.inferEventYear()
      );
      if (ancestryCollectionId) {
        collection = RC.findCollection("ancestry", ancestryCollectionId);
        sameCollection = true;
      }
    }
  } else if (buildUrlInput.typeOfSearch == "SpecifiedCollection") {
    let searchParams = buildUrlInput.searchParameters;
    if (searchParams.collectionWtsId) {
      collection = RC.findCollectionByWtsId(searchParams.collectionWtsId);
      if (collection) {
        ancestryCollectionId = collection.sites["ancestry"].id;
      }
    }
  } else if (buildUrlInput.typeOfSearch == "SpecifiedParameters") {
    parameters = buildUrlInput.searchParameters;
    if (parameters.category != "all") {
      category = parameters.category;
    }
    if (parameters.subcategory != "all") {
      subcategory = parameters.subcategory;
    }
  } else if (buildUrlInput.typeOfSearch == "FamilyTree") {
    category = "42";
  }

  var builder = new AncestryUriBuilder(
    ancestryCollectionId,
    category,
    subcategory,
    options
  );

  let hasAnyName = false;
  let lastNames = data.inferLastNameGivenParametersAndCollection(
    parameters,
    collection,
    true
  );

  if (lastNames) {
    hasAnyName = true;
  }

  let forenames = data.inferForenames();
  if (forenames) {
    hasAnyName = true;
  }

  if (hasAnyName) {
    builder.addName(forenames, lastNames);
  }

  builder.addBirth(data.inferBirthYear(), data.inferBirthPlace());
  builder.addDeath(data.inferDeathYear(), data.inferDeathPlace());

  if (data.personGender) {
    if (data.personGender == "male") {
      builder.addGenderMale();
    } else if (data.personGender == "female") {
      builder.addGenderFemale();
    }
  }

  if (data.parents) {
    if (data.parents.father && (!parameters || parameters.father)) {
      let fatherForeNames = data.parents.father.name.inferForenames();
      let fatherLastNames = data.inferPersonLastNames(data.parents.father);
      builder.addFather(fatherForeNames, fatherLastNames);
    }
    if (data.parents.mother && (!parameters || parameters.mother)) {
      let motherForeNames = data.parents.mother.name.inferForenames();
      let motherLastNames = data.inferPersonLastNames(data.parents.mother);
      builder.addMother(motherForeNames, motherLastNames);
    }
  }

  // sometimes we just have the mother's maiden name and no mother
  if (!data.parents || !data.parents.mother) {
    if (data.mothersMaidenName && (!parameters || parameters.mother)) {
      builder.addMother("", data.mothersMaidenName);
    }
  }

  // The Ancestry search does allow multiple spouse but only seems to allow one
  // marriage event (at least in form). For now we just put one spouse in the search.
  // The parameters allow the user to select which one.
  if (data.spouses && data.spouses.length > 0) {
    let spouse = undefined;
    if (parameters) {
      if (
        parameters.spouseIndex != -1 &&
        parameters.spouseIndex < data.spouses.length
      ) {
        spouse = data.spouses[parameters.spouseIndex];
      }
    } else {
      spouse = data.spouses[0];
    }

    if (spouse) {
      if (spouse.name) {
        let spouseForeNames = spouse.name.inferForenames();
        let spouseLastNames = data.inferPersonLastNames(spouse);
        builder.addSpouse(spouseForeNames, spouseLastNames);
      }

      if (spouse.marriageDate || spouse.marriagePlace) {
        let marriageYear = spouse.marriageDate
          ? spouse.marriageDate.getYearString()
          : "";
        let marriagePlace = spouse.marriagePlace
          ? spouse.marriagePlace.placeString
          : "";
        builder.addMarriage(marriageYear, marriagePlace);
      }
    }
  }

  // For a sameCollection census add a residence place
  if (sameCollection && data.recordType == RT.Census) {
    let eventPlace = data.inferEventPlace();
    builder.addResidence(eventPlace);
  }

  // restrict search by region if it makes sense
  let countryArray = data.inferCountries();
  if (countryArray.length == 1) {
    let country = countryArray[0];
    let priority = AncestryData.getPriorityFromStdCountry(country);
    if (priority) {
      builder.addPriority(priority);
    }
  }

  if (sameCollection && data.collectionData) {
    // In theory we could add volume and page. But it seems like that could be collection specific.
    // This is a search in Ancestry England Civil Births with Volume and Page specified:
    // https://www.ancestry.com/search/collections/8912/?name=Harry+Alfred_Pavey&birth=1852_Plymouth
    // &f-F00056EC=5b&f-F0005906=238
    let colData = data.collectionData;
    builder.addVolume(colData.volume);
    builder.addPage(colData.page);
    builder.addFolio(colData.folio);
    builder.addPiece(colData.piece);
    builder.addSchedule(colData.schedule);
    builder.addRegistrationNumber(colData.registrationNumber);
    builder.addEnumerationDistrict(colData.enumerationDistrict);

    builder.addMaritalStatus(data.maritalStatus);
    builder.addRelationship(data.relationshipToHead);
    builder.addDistrict(data.registrationDistrict);
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
