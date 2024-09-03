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

import { CD } from "../../../base/core/country_data.mjs";

function modifyLocationForSearch(type, location, dateString, options) {
  // type should be "birth" or "death"
  let exactnessOptionName = "search_wikitree_" + type + "LocationExactness";
  let exactness = options[exactnessOptionName];

  if (exactness == "none") {
    return "";
  }

  if (!location) {
    return "";
  }

  if (options.search_wikitree_removeInvalidCountryName) {
    let countryExtract = CD.extractCountryFromPlaceName(location);
    if (countryExtract) {
      let isValidForDate = CD.isCountryNameValidForDate(countryExtract.country.stdName, dateString);
      if (!isValidForDate) {
        if (exactness == "full") {
          return countryExtract.remainder;
        } else {
          return "";
        }
      }
    }
  }

  if (exactness == "full") {
    return location;
  }

  // option is country only
  let country = CD.matchCountryFromPlaceName(location);
  if (country) {
    return country.stdName;
  }

  // no country found - omit location
  return "";
}

function buildSearchData(input) {
  //console.log("buildSearchData, input is:");
  //console.log(input);

  const gd = input.generalizedData;
  const options = input.options;

  let parameters = undefined;

  if (input.typeOfSearch == "SpecifiedParameters") {
    parameters = input.searchParameters;
  }

  let fieldData = {
    utf8: true,
    simpleIdFields: {},
    simpleNameFields: {},
    radioFields: [],
    options: {},
  };

  let firstName = gd.inferFirstName();
  if (firstName) {
    fieldData.simpleIdFields["wpFirst"] = firstName;
  }

  let lastName = gd.inferLastNameGivenParametersAndCollection(parameters, undefined);
  if (lastName) {
    fieldData.simpleIdFields["wpLast"] = lastName;
  }

  let birthDate = gd.inferBirthDate();
  if (birthDate) {
    let includeBirthDate = false;
    if (parameters) {
      if (parameters.includeBirthDate) {
        includeBirthDate = true;
      }
    } else {
      if (options.search_wikitree_includeBirthDate) {
        includeBirthDate = true;
      }
    }

    if (includeBirthDate) {
      fieldData.simpleNameFields["wpBirthDate"] = birthDate;
    }
  }

  let deathDate = gd.inferDeathDate();
  if (deathDate) {
    let includeDeathDate = false;
    if (parameters) {
      if (parameters.includeDeathDate) {
        includeDeathDate = true;
      }
    } else {
      if (options.search_wikitree_includeDeathDate) {
        includeDeathDate = true;
      }
    }

    if (includeDeathDate) {
      fieldData.simpleNameFields["wpDeathDate"] = deathDate;
    }
  }

  let birthPlace = "";
  if (parameters) {
    if (parameters.birthPlace != "<none>") {
      birthPlace = parameters.birthPlace;
    }
  } else {
    birthPlace = modifyLocationForSearch("birth", gd.inferBirthPlace(), birthDate, options);
  }
  if (birthPlace) {
    fieldData.simpleNameFields["birth_location"] = birthPlace;
  }

  let deathPlace = "";
  if (parameters) {
    if (parameters.deathPlace != "<none>") {
      deathPlace = parameters.deathPlace;
    }
  } else {
    deathPlace = modifyLocationForSearch("death", gd.inferDeathPlace(), deathDate, options);
  }
  if (deathPlace) {
    fieldData.simpleNameFields["death_location"] = deathPlace;
  }

  let parents = gd.parents;
  if (parents) {
    let includeFatherName = false;
    let includeMotherName = false;
    if (parameters) {
      includeFatherName = parameters.father;
      includeMotherName = parameters.mother;
    } else {
      includeFatherName = options["search_wikitree_includeFatherName"];
      includeMotherName = options["search_wikitree_includeMotherName"];
    }
    if (includeFatherName) {
      let father = parents.father;
      if (father && father.name) {
        let firstName = father.name.inferFirstName();
        let lastName = father.name.inferLastName();
        if (firstName) {
          fieldData.simpleNameFields["father_first_name"] = firstName;
        }
        if (lastName) {
          fieldData.simpleNameFields["father_last_name"] = lastName;
        }
      }
    }
    if (includeMotherName) {
      let mother = parents.mother;
      if (mother && mother.name) {
        let firstName = mother.name.inferFirstName();
        let lastName = mother.name.inferLastName();
        if (firstName) {
          fieldData.simpleNameFields["mother_first_name"] = firstName;
        }
        if (lastName) {
          fieldData.simpleNameFields["mother_last_name"] = lastName;
        }
      }
    }
  }

  let sex = gd.inferPersonGender();
  if (sex && sex != "-") {
    if (sex == "male") {
      fieldData.radioFields.push({ name: "gender", value: "Male" });
    } else if (sex == "female") {
      fieldData.radioFields.push({ name: "gender", value: "Female" });
    }
  }

  let dateExactness = options.search_wikitree_dateExactness;
  if (dateExactness) {
    if (dateExactness == "auto") {
      if (gd.sourceOfData == "wikitree") {
        dateExactness = "exactDate";
      } else {
        dateExactness = "2";
      }
    }
    let value = "";
    if (dateExactness == "exactDate") {
      value = "-1";
    } else if (dateExactness == "exactYear") {
      value = "0";
    } else if (dateExactness == "2") {
      value = "2";
    } else if (dateExactness == "12") {
      value = "12";
    } else if (dateExactness == "30") {
      value = "30";
    }

    if (value) {
      fieldData.radioFields.push({ name: "date_spread", value: value });
    }
  }

  let nameExactness = options.search_wikitree_nameExactness;
  if (nameExactness) {
    let value = "";
    if (nameExactness == "bothVariant") {
      value = "0";
    } else if (nameExactness == "firstVariant") {
      value = "2";
    } else if (nameExactness == "lastVariant") {
      value = "3";
    } else if (nameExactness == "exact") {
      value = "1";
    }

    if (value) {
      fieldData.radioFields.push({ name: "skip_variants", value: value });
    }
  }

  // More exact census place involves generating a special place ID. This is too much effort.
  // search_query[freecen2_place_ids][]: 5fc6db0ef4040beff4813f18
  // Only allowed if an exact census place specified
  // search_query[search_nearby_places]: true

  //console.log("fieldData is:");
  //console.log(fieldData);

  var result = {
    fieldData: fieldData,
  };

  return result;
}

export { buildSearchData };
