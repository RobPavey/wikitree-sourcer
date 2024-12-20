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

import { PlaceObj } from "../../../base/core/generalize_data_utils.mjs";

const categories = [
  { value: "wikitree_person_search", text: "WikiTree Person Search" },
  { value: "wikitree_plus_search", text: "WikiTree Plus" },
];

function buildSelectValuesForPlace(placeString, countries) {
  let values = [];

  function addValue(valueString) {
    if (valueString) {
      let value = { value: valueString, text: valueString };
      if (!values.some((entry) => entry.value === valueString)) {
        values.push(value);
      }
    }
  }

  addValue(placeString);

  let place = new PlaceObj();
  place.placeString = placeString;
  let placeParts = place.separatePlaceIntoParts();

  if (placeParts.localPlace && placeParts.county && placeParts.country) {
    if (placeParts.state) {
      addValue(placeParts.localPlace + ", " + placeParts.state + ", " + placeParts.county + ", " + placeParts.country);
    }
    addValue(placeParts.localPlace + ", " + placeParts.county + ", " + placeParts.country);
  }

  if (placeParts.localPlace && placeParts.county) {
    if (placeParts.state) {
      addValue(placeParts.localPlace + ", " + placeParts.state + ", " + placeParts.county);
    }
    addValue(placeParts.localPlace + ", " + placeParts.county);
  }

  if (placeParts.localPlace && placeParts.country) {
    if (placeParts.state) {
      addValue(placeParts.localPlace + ", " + placeParts.state + ", " + placeParts.country);
    }
    addValue(placeParts.localPlace + ", " + placeParts.country);
  }

  if (placeParts.county && placeParts.country) {
    if (placeParts.state) {
      addValue(placeParts.county + ", " + placeParts.state + ", " + placeParts.country);
    }
    addValue(placeParts.county + ", " + placeParts.country);
  }

  if (placeParts.localPlace) {
    if (placeParts.state) {
      addValue(placeParts.localPlace + ", " + placeParts.state);
    }
    addValue(placeParts.localPlace);
  }

  if (placeParts.county) {
    if (placeParts.state) {
      addValue(placeParts.county + ", " + placeParts.state);
    }
    addValue(placeParts.county);
  }

  if (!placeParts.country) {
    for (let country of countries) {
      addValue(placeString + ", " + country);
    }
  }

  for (let country of countries) {
    addValue(country);
  }

  addValue("<none>");

  //console.log("buildSelectValuesForPlace: values is:");
  //console.log(values);

  return values;
}

const WikitreeData = {
  includeCategories: function (generalizedData, parameters) {
    return true;
  },

  includeSubcategories: function (generalizedData, parameters) {
    return false;
  },

  includeCollections: function (generalizedData, parameters) {
    return false;
  },

  includeSpouses: function (generalizedData, parameters) {
    return false;
  },

  includeParents: function (generalizedData, parameters) {
    if (parameters.category == "wikitree_person_search") {
      return true;
    }
    return false;
  },

  getCategories: function (generalizedData, parameters, options) {
    return categories;
  },

  getCollections: function (generalizedData, parameters, options) {},

  getCategorySelectorLabel: function (gd, parameters) {
    return "Choose type of search: ";
  },

  getAdditionalControls(generalizedData, parameters, options) {
    let controls = [];

    let birthDate = generalizedData.inferBirthDate();
    if (birthDate) {
      let birthDateControl = {};
      birthDateControl.elementId = "birthDate";
      birthDateControl.parameterName = "includeBirthDate";
      birthDateControl.type = "checkbox";
      birthDateControl.label = "Include birth date of " + birthDate;
      controls.push(birthDateControl);
    }

    let deathDate = generalizedData.inferDeathDate();
    if (deathDate) {
      let deathDateControl = {};
      deathDateControl.elementId = "deathDate";
      deathDateControl.parameterName = "includeDeathDate";
      deathDateControl.type = "checkbox";
      deathDateControl.label = "Include death date of " + deathDate;
      controls.push(deathDateControl);
    }

    let countries = generalizedData.inferCountries();

    let birthPlace = generalizedData.inferBirthPlace();
    if (birthPlace) {
      let birthPlaceControl = {};
      birthPlaceControl.elementId = "birthPlace";
      birthPlaceControl.parameterName = "birthPlace";
      birthPlaceControl.type = "select";
      birthPlaceControl.label = "Birth place to use in search";
      birthPlaceControl.values = buildSelectValuesForPlace(birthPlace, countries);
      controls.push(birthPlaceControl);
    }

    let deathPlace = generalizedData.inferDeathPlace();
    if (deathPlace) {
      let deathPlaceControl = {};
      deathPlaceControl.parameterName = "deathPlace";
      deathPlaceControl.type = "select";
      deathPlaceControl.label = "Death place to use in search";
      deathPlaceControl.values = buildSelectValuesForPlace(deathPlace, countries);
      controls.push(deathPlaceControl);
    }

    return controls;
  },

  setDefaultSearchParameters: function (generalizedData, parameters, options) {
    parameters.category = "wikitree_person_search";

    parameters.includeBirthDate = true;
    parameters.includeDeathDate = true;

    let birthPlace = generalizedData.inferBirthPlace();
    if (birthPlace) {
      parameters.birthPlace = birthPlace;
    }

    let deathPlace = generalizedData.inferDeathPlace();
    if (deathPlace) {
      parameters.deathPlace = deathPlace;
    }
  },

  updateParametersOnCategoryChange: function (generalizedData, parameters, options) {},
};

export { WikitreeData };
