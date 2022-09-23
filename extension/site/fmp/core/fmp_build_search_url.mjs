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

import { FmpUriBuilder } from "./fmp_uri_builder.mjs";
import { GeneralizedData, GD, dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";
import { RC } from "../../../base/core/record_collections.mjs";
import { FmpData } from "./fmp_data.mjs";
import { RT } from "../../../base/core/record_type.mjs";

function encodeDataSetName(name) {
  // , ( ) etc will get encoded by the builder
  name = name.replace(/\s/g, "+");
  name = name.toLowerCase();
  return name;
}

function cleanNamePlaceForSearch(place) {
  if (!place) {
    return place;
  }

  // FMP doesn't seem to like "United Kingdom" on the end of place names when searching
  const endingsToRemove = [ ", United Kingdom", ",United Kingdom", ];

  for (let ending of endingsToRemove) {
    if (place.endsWith(ending)) {
      place = place.substring(0, place.length - ending.length)
    }
  }

  return place;
}

function fixedEncodeURIComponent(str) {
  return encodeURI(str).replace(/[()&,]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}

function buildTreeSearchUrl(buildUrlInput) {
  // Example:
  // https://www.findmypast.co.uk/search-family-tree/results?
  // root=fn:arthur%20eli~ln:pavey~g:m~yob:1885~ybo:2~pob:kentish%20town%2C%20london%2C%20england~
  // &rel1=fn:harry%20alfred~ln:pavey~yob:1852~ybo:2~r:p~g:m~
  // &rel2=fn:amelia%20elizabeth~ln:littlemore~yob:1849~ybo:2~r:p~g:f~
  // &rel3=fn:emmeline%20may~ln:brain~r:sp~
  // &tsid=1999
  let data = buildUrlInput.generalizedData;
  let options = buildUrlInput.options;

  let domain = options.search_fmp_domain;
  if (domain == "none" || !domain) {
    domain = "findmypast.co.uk";
  }
  let url = "https://www." + domain + "/search-family-tree/results?";
  let relativeNumber = 1;


  function addField(fieldName, value) {
    if (value) {
      url += fieldName + ":" + fixedEncodeURIComponent(value) + "~";
    }
  }

  function addRelative() {
    url += "&rel" + relativeNumber + "=";
    relativeNumber++;
  }

  function encodeGender(gender) {
    let code = "";
    if (gender == "male") {
      code = "m";
    }
    else if (gender == "female") {
      code = "f";
    }
    return code;
  }

  // root person
  url += "root=";
  addField("fn", data.inferForenames());
  addField("ln", data.inferLastName());
  addField("g", encodeGender(data.personGender));
  addField("yob", data.inferBirthYear());
  addField("pob", data.inferBirthPlace());

  // parents
  if (data.parents) {
    if (data.parents.father) {
      let father = data.parents.father;
      if (father.name) {
        addRelative();
        addField("fn", father.name.inferForenames());
        addField("ln", father.name.inferLastName());
        addField("r", "p");
        addField("g", "m");
      }
    }
    if (data.parents.mother) {
      let mother = data.parents.mother;
      if (mother.name) {
        addRelative();
        addField("fn", mother.name.inferForenames());
        addField("ln", mother.name.inferLastName());
        addField("r", "p");
        addField("g", "f");
      }
    }
  }

  // spouses
  if (data.spouses) {
    for (let spouse of data.spouses) {
      if (spouse.name) {
        addRelative();
        addField("fn", spouse.name.inferForenames());
        addField("ln", spouse.name.inferLastName());
        addField("r", "sp");
      }
    }
  }

  var result = {
    'url' : url,
  }

  return result;
}

function buildSearchUrl(buildUrlInput) {

  let data = buildUrlInput.generalizedData;
  let options = buildUrlInput.options;


  //console.log("buildSearchUrl, gd is:");
  //console.log(data);

  let sameCollection = false;
  let collection = undefined;
  let category = undefined;
  let subcategory = undefined;
  let dataSetName = undefined;
  let parameters = undefined;

  if (buildUrlInput.typeOfSearch == "FamilyTree") {
    // tree search uses a different syntax
    return buildTreeSearchUrl(buildUrlInput);
  }
  else if (buildUrlInput.typeOfSearch == "SameCollection") {
    if (data.collectionData && data.collectionData.id) {
      let fmpCollectionId = RC.mapCollectionId(data.sourceOfData, data.collectionData.id, "fmp",
        data.inferEventCountry(), data.inferEventYear());
      if (fmpCollectionId) {
        collection = RC.findCollection("fmp", fmpCollectionId);
        if (collection) {
          sameCollection = true;
          dataSetName = encodeDataSetName(collection.sites.fmp.id);
        }
      }
    }
  }
  else if (buildUrlInput.typeOfSearch == "SpecifiedCollection") {
    let searchParams = buildUrlInput.searchParameters;
    if (searchParams.collectionWtsId) {
      collection = RC.findCollectionByWtsId(searchParams.collectionWtsId);
      if (collection) {
        dataSetName = encodeDataSetName(collection.sites.fmp.id);
      }
    }
  }
  else if (buildUrlInput.typeOfSearch == "SpecifiedParameters") {
    parameters = buildUrlInput.searchParameters;
    if (parameters.category != "all") {
      category = parameters.category;
    }
    if (parameters.subcategory != "all") {
      subcategory = parameters.subcategory;
    }
  }
  
  var builder = new FmpUriBuilder(collection, options);

  builder.addSourceCategory(category);
  builder.addCollection(subcategory);
  builder.addDataSetName(dataSetName);

  builder.addGender(data.personGender);

  let hasAnyName = false;
  let lastName = data.inferLastNameGivenParametersAndCollection(parameters, collection);
  if (lastName) {
    hasAnyName = true;
  }

  let forenames = data.inferForenames();
  if (forenames) {
    hasAnyName = true;
  }

  if (hasAnyName) {
    builder.addPersonName(forenames, lastName);
  }

  if (collection && collection.isBirth) {
    // if we are searching a birth collection then the event date
    // is the date of birth and we don't want another date
    builder.addEventYear(data.inferBirthYear());
  }
  else {
    builder.addBirthYear(data.inferBirthYear());
  }

  if (collection && collection.isDeath) {
    // if we are searching a death collection then the event date
    // is the date of death and we don't want another date
    builder.addEventYear(data.inferDeathYear());
  }
  else {
    builder.addDeathYear(data.inferDeathYear());
  }

  if (sameCollection) {
    if (!collection.dates || !collection.dates.year) {
      // we don't want to add a date when searching collection that is already for a fixed date
      builder.addEventYear(data.inferEventYear());
    }
    builder.addEventQuarter(data.inferEventQuarter());
  }

  // set place
  let eventPlace = undefined;
  if (sameCollection) {
    eventPlace = data.inferEventPlace();
  }
  else if (collection) {
    if (collection.isBirth) {
      eventPlace = data.inferBirthPlace();
    }
    else if (collection.isDeath) {
      eventPlace = data.inferDeathPlace();
    }
  }
  else if (parameters) {
    if (subcategory == "parish+baptisms") {
      eventPlace = data.inferBirthPlace();
    }
    else if (subcategory == "parish+burials") {
      eventPlace = data.inferDeathPlace();
    }
  }
  else if (data.sourceType == "profile") {
    eventPlace = data.inferGeneralPlace();
  }

  if (!eventPlace) {
    eventPlace = data.inferEventPlace();
  }
  // for a general search using the birth or death place as a location may be OK
  // but when searcg a collection then it rules out too much. For example someone may not be living near
  // where they were born or died
  if (!eventPlace && !collection) {
    eventPlace = data.inferBirthPlace();
    if (!eventPlace) {
      eventPlace = data.inferDeathPlace();
    }
  }
  builder.addEventPlace(eventPlace);

  // this only adds birth place if there is a collection and collection has a setting for it
  let birthPlace = data.inferBirthPlace();
  birthPlace = cleanNamePlaceForSearch(birthPlace);
  builder.addBirthPlace(birthPlace);

  // parents. Only add if searching for same record/collection or with parameters
  if (parameters || sameCollection) {

    let isBaptism = false;
    if (parameters && subcategory == "parish+baptisms") {
      isBaptism = true;
    }

    if (data.parents) {
      if (data.parents.father && (!parameters || parameters.father)) {
        let fatherForeNames = data.parents.father.name.inferForenames();
        let fatherLastNames = data.inferPersonLastNames(data.parents.father);
        if (isBaptism) {
          fatherLastNames = undefined; // giving the father's last name on baptism causes search to fail
        }
        builder.addFather(fatherForeNames, fatherLastNames);
      }
      if (data.parents.mother && (!parameters || parameters.mother)) {
        let motherForeNames = data.parents.mother.name.inferForenames();
        let motherLastNames = undefined;  // we don't want multiple names
        builder.addMother(motherForeNames, motherLastNames);
      }
    }

    // sometimes we just have the mother's maiden name and no mother
    if (!data.parents || !data.parents.mother) {
      if (data.mothersMaidenName && (!parameters || parameters.mother)) {
        builder.addMother("", data.mothersMaidenName);
      }
    }
  }

  // spouses/marriages. Only add if searching for same record/collection or with parameters
  if (parameters || sameCollection) {
    if (data.spouses && data.spouses.length > 0) {
      let spouse = undefined;
      if (parameters) {
        if (parameters.spouseIndex != -1 && parameters.spouseIndex < data.spouses.length) {
          spouse = data.spouses[parameters.spouseIndex];
        }
      }
      else {
        spouse = data.spouses[0];
      }

      if (spouse) {
        if (spouse.name) {
          let spouseForeNames = spouse.name.inferForenames();
          let spouseLastNames = data.inferPersonLastNames(spouse);
          // if coming from somewhere with more than one last name (basically a WT profile)
          // then, depending on the type of search we may be able to chose one
          if (data.sourceType == "profile") {
            if (parameters && parameters.subCategory == "parish+marriages") {
              // it is a marriage, we want the name before the marriage, we don't have enough
              // info to know that. Try using lastNameAtBirth
              if (spouse.name.lastNameAtBirth) {
                spouseLastNames = spouse.name.lastNameAtBirth;
              }
            }
          }

          if (parameters && (parameters.category == "census,+land+&+surveys" || parameters.subCategory == "census")) {
            // for a census the spouse will have the same name as the main person
            builder.addOtherPerson(spouseForeNames, lastName);
          }
          else {
            builder.addSpouse(spouseForeNames, spouseLastNames);
          }
        }

        // if searching for sameCollection we will have already added event place/date
        if (parameters) {
          if (collection && collection.isMarriage) {
            if (spouse.marriageDate) {
              builder.addEventYear(spouse.marriageDate.getYearString());
            }
            if (spouse.marriagePlace) {
              builder.addEventPlace(spouse.marriagePlace.placeString);
            }
          }
        }
      }
    }
  }

  if (collection) {
    // we are searching a collection that might have extra fields
    if (data.recordType == RT.Census) {
      // Note that the registration district for 1939 register doesn't work
      // Coming from Ancestry it would put something like 319/4 in the
      // "Borough / District" field on FMP which makes the search fail
      if (collection.wtsId != "EnglandAndWales1939Register") {
        builder.addRegistrationDistrict(data.registrationDistrict);
      }
    }
    else {
      builder.addDistrict(data.registrationDistrict);
    }

    // certain census searches include birth county
    if (collection.title.toLowerCase().includes("census")) {
      if (collection.country == "United Kingdom" || collection.country == "England" || collection.country == "Wales") {
        builder.addBirthCounty(data.inferBirthCounty());
      }
    }
  }

  if (sameCollection) {
    // In theory we could add volume and page. But it seems like that could be collection specific.

    if (data.collectionData) {
      builder.addVolume(data.collectionData.volume);
      builder.addPage(data.collectionData.page);
      builder.addPiece(data.collectionData.piece);
      builder.addFolio(data.collectionData.folio);
      builder.addParish(data.collectionData.parish);
    }

    builder.addMaritalStatus(data.maritalStatus);
    builder.addRelationship(data.relationshipToHead);
  }

  // restrict search by region if it makes sense
  // Note, this can prevent an exact dataset search from occuring
  if (!dataSetName) {
    let countryArray = data.inferCountries();
    if (countryArray.length == 1) {
      let country = countryArray[0];
      let sourceCountry = FmpData.getCountryNameFromStdCountry(country);
      if (sourceCountry) {
        builder.addSourceCountry(sourceCountry);
      }
    }
  }

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
      'url' : url,
  }

  return result;
}

export { buildSearchUrl };
