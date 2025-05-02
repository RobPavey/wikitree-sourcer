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
  const endingsToRemove = [", United Kingdom", ",United Kingdom"];

  for (let ending of endingsToRemove) {
    if (place.endsWith(ending)) {
      place = place.substring(0, place.length - ending.length);
    }
  }

  return place;
}

function fixedEncodeURIComponent(str) {
  return encodeURI(str).replace(/[()&,]/g, function (c) {
    return "%" + c.charCodeAt(0).toString(16);
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
  let gd = buildUrlInput.generalizedData;
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
    } else if (gender == "female") {
      code = "f";
    }
    return code;
  }

  // root person
  url += "root=";
  addField("fn", gd.inferForenames());
  addField("ln", gd.inferLastName());
  addField("g", encodeGender(gd.inferPersonGender()));
  addField("yob", gd.inferBirthYear());
  addField("pob", gd.inferBirthPlace());

  // parents
  if (gd.parents) {
    if (gd.parents.father) {
      let father = gd.parents.father;
      if (father.name) {
        addRelative();
        addField("fn", father.name.inferForenames());
        addField("ln", father.name.inferLastName());
        addField("r", "p");
        addField("g", "m");
      }
    }
    if (gd.parents.mother) {
      let mother = gd.parents.mother;
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
  if (gd.spouses) {
    for (let spouse of gd.spouses) {
      if (spouse.name) {
        addRelative();
        addField("fn", spouse.name.inferForenames());
        addField("ln", spouse.name.inferLastName());
        addField("r", "sp");
      }
    }
  }

  var result = {
    url: url,
  };

  return result;
}

function buildSearchUrl(buildUrlInput) {
  let gd = buildUrlInput.generalizedData;
  let options = buildUrlInput.options;

  //console.log("buildSearchUrl, gd is:");
  //console.log(gd);

  let sameCollection = false;
  let collection = undefined;
  let category = undefined;
  let subcategory = undefined;
  let dataSetName = undefined;
  let parameters = undefined;

  let eventYearRange = 2;
  let birthYearRange = 2;
  let deathYearRange = 2;

  if (buildUrlInput.typeOfSearch == "FamilyTree") {
    // tree search uses a different syntax
    return buildTreeSearchUrl(buildUrlInput);
  } else if (buildUrlInput.typeOfSearch == "SameCollection") {
    if (gd.collectionData && gd.collectionData.id) {
      let fmpCollectionId = RC.mapCollectionId(
        gd.sourceOfData,
        gd.collectionData.id,
        "fmp",
        gd.inferEventCountry(),
        gd.inferEventYear()
      );
      if (fmpCollectionId) {
        collection = RC.findCollection("fmp", fmpCollectionId);
        if (collection) {
          sameCollection = true;
          dataSetName = encodeDataSetName(collection.sites.fmp.id);
          eventYearRange = 0;
          deathYearRange = 0;
          if (gd.recordType == RT.Birth || gd.recordType == RT.BirthRegistration) {
            birthYearRange = 0;
          }
        }
      }
    }
  } else if (buildUrlInput.typeOfSearch == "SpecifiedCollection") {
    let searchParams = buildUrlInput.searchParameters;
    if (searchParams.collectionWtsId) {
      collection = RC.findCollectionByWtsId(searchParams.collectionWtsId);
      if (collection) {
        dataSetName = encodeDataSetName(collection.sites.fmp.id);
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
  }

  var builder = new FmpUriBuilder(collection, options);

  builder.addSourceCategory(category);
  builder.addCollection(subcategory);
  builder.addDataSetName(dataSetName);

  // It used to be that gender was used in most FMP record searches but now it is not
  // and adding it caused it to fail to find meny records where gender is not known.
  // See: https://github.com/RobPavey/wikitree-sourcer/issues/94
  // builder.addGender(gd.inferPersonGender());

  let hasAnyName = false;
  let lastName = gd.inferLastNameGivenParametersAndCollection(parameters, collection);
  if (lastName) {
    hasAnyName = true;
  }

  let forenames = gd.inferForenames();
  if (forenames) {
    hasAnyName = true;
  }

  if (hasAnyName) {
    builder.addPersonName(forenames, lastName);
  }

  if (collection && collection.isBirth) {
    // if we are searching a birth collection then the event date
    // is the date of birth and we don't want another date
    builder.addEventYear(gd.inferBirthYear(), eventYearRange);
  } else {
    builder.addBirthYear(gd.inferBirthYear(), birthYearRange);
  }

  if (collection && collection.isDeath) {
    // if we are searching a death collection then the event date
    // is the date of death and we don't want another date
    builder.addEventYear(gd.inferDeathYear(), eventYearRange);
  } else {
    // we only want to add a death date if we are either:
    // a) not searching for any specific category/subcategory
    // b) searching for a category/subcategory where a death date is relevant
    if (FmpData.doCategoryAndSubCategoryUseDeathYear(category, subcategory)) {
      builder.addDeathYear(gd.inferDeathYear(), deathYearRange);
    }
  }

  if (sameCollection) {
    if (!collection.dates || !collection.dates.year) {
      // we don't want to add a date when searching collection that is already for a fixed date
      builder.addEventYear(gd.inferEventYear(), eventYearRange);
    }
    builder.addEventQuarter(gd.inferEventQuarter());
  }

  // set place
  let eventPlace = undefined;
  if (sameCollection) {
    eventPlace = gd.inferEventPlace();
  } else if (collection) {
    if (collection.isBirth) {
      eventPlace = gd.inferBirthPlace();
    } else if (collection.isDeath) {
      eventPlace = gd.inferDeathPlace();
    }
  } else if (parameters) {
    if (subcategory == "parish+baptisms") {
      eventPlace = gd.inferBirthPlace();
    } else if (subcategory == "parish+burials") {
      eventPlace = gd.inferDeathPlace();
    }
  } else if (gd.sourceType == "profile") {
    eventPlace = gd.inferGeneralPlace();
  }

  if (!eventPlace) {
    eventPlace = gd.inferEventPlace();
  }
  // for a general search using the birth or death place as a location may be OK
  // but when searcg a collection then it rules out too much. For example someone may not be living near
  // where they were born or died
  if (!eventPlace && !collection) {
    eventPlace = gd.inferBirthPlace();
    if (!eventPlace) {
      eventPlace = gd.inferDeathPlace();
    }
  }
  builder.addEventPlace(eventPlace);

  // this only adds birth place if there is a collection and collection has a setting for it
  let birthPlace = gd.inferBirthPlace();
  birthPlace = cleanNamePlaceForSearch(birthPlace);
  builder.addBirthPlace(birthPlace);

  // parents. Only add if searching for same record/collection or with parameters
  if (parameters || sameCollection) {
    let isBaptism = false;
    if (parameters && subcategory == "parish+baptisms") {
      isBaptism = true;
    }

    let addedMotherLastName = false;
    let fatherLastNamesUsed = "";
    if (gd.parents) {
      if (gd.parents.father && (!parameters || parameters.father)) {
        let fatherForenames = gd.parents.father.name.inferForenames();
        let fatherLastNames = gd.inferPersonLastNames(gd.parents.father);
        if (isBaptism) {
          fatherLastNames = undefined; // giving the father's last name on baptism causes search to fail
        } else {
          fatherLastNamesUsed = fatherLastNames;
        }
        builder.addFather(fatherForenames, fatherLastNames);
      }
      if (gd.parents.mother && (!parameters || parameters.mother)) {
        let motherForenames = gd.parents.mother.name.inferForenames();
        let motherLastNames = gd.inferPersonLastNames(gd.parents.mother);
        if (isBaptism) {
          motherLastNames = undefined; // giving the mother's last name on baptism causes search to fail
        } else if (fatherLastNamesUsed) {
          motherLastNames = undefined; // we don't want multiple names
        } else {
          addedMotherLastName = true;
        }
        builder.addMother(motherForenames, motherLastNames);
      }
    }

    // sometimes we just have the mother's maiden name and no mother
    if (!gd.parents || !gd.parents.mother || !addedMotherLastName) {
      if (gd.mothersMaidenName && sameCollection) {
        // this is causing some issues. For example Littlemore-13 searching for a baptism
        // There is no mother's maiden name on the baptism so there are no matches
        // It would be better to have an option in parameters to use MMN
        // If not parameters the should only include MMN if the collection says it accepts it.
        if (!isBaptism) {
          builder.addMother("", gd.mothersMaidenName);
        }
      }
    }
  }

  // spouses/marriages. Only add if searching for same record/collection or with parameters
  if (parameters || sameCollection) {
    // census search doesn't work with spouse specified
    if (gd.spouses && gd.spouses.length > 0 && gd.recordType != RT.Census) {
      let spouse = undefined;
      if (parameters) {
        if (parameters.spouseIndex != -1 && parameters.spouseIndex < gd.spouses.length) {
          spouse = gd.spouses[parameters.spouseIndex];
        }
      } else {
        spouse = gd.spouses[0];
      }

      if (spouse) {
        if (spouse.name) {
          let spouseForenames = spouse.name.inferForenames();
          let spouseLastNames = gd.inferPersonLastNames(spouse);
          // if coming from somewhere with more than one last name (basically a WT profile)
          // then, depending on the type of search we may be able to chose one
          if (gd.sourceType == "profile") {
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
            builder.addOtherPerson(spouseForenames, lastName);
          } else {
            builder.addSpouse(spouseForenames, spouseLastNames);
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
    if (gd.recordType == RT.Census) {
      // Note that the registration district for 1939 register doesn't work
      // Coming from Ancestry it would put something like 319/4 in the
      // "Borough / District" field on FMP which makes the search fail
      if (collection.wtsId != "EnglandAndWales1939Register") {
        builder.addRegistrationDistrict(gd.registrationDistrict);
      }
    } else {
      builder.addDistrict(gd.registrationDistrict);
    }

    // certain census searches include birth county
    if (collection.title.toLowerCase().includes("census")) {
      if (collection.country == "United Kingdom" || collection.country == "England" || collection.country == "Wales") {
        builder.addBirthCounty(gd.inferBirthCounty());
      }
    }
  }

  if (sameCollection) {
    // In theory we could add volume and page. But it seems like that could be collection specific.

    if (gd.collectionData) {
      builder.addParish(gd.collectionData.parish);
      builder.addVolume(gd.collectionData.volume);

      // Scotland census has Folio and Page on FS but not on FMP
      // This is hard to handle through collections data because FMP census collection
      // is for England, Wales and Scotland
      if (!(gd.recordType == RT.Census && gd.inferEventCountry() == "Scotland")) {
        builder.addPage(gd.collectionData.page);
        builder.addPiece(gd.collectionData.piece);
        builder.addFolio(gd.collectionData.folio);
      }
    }

    builder.addMaritalStatus(gd.maritalStatus);
    builder.addRelationship(gd.relationshipToHead);
  }

  // restrict search by region if it makes sense
  // Note, this can prevent an exact dataset search from occuring
  if (!dataSetName) {
    let countryArray = gd.inferCountries();
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
    url: url,
  };

  return result;
}

export { buildSearchUrl };
