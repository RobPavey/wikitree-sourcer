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
import { vicbdmPlaceAbbreviationTable } from "./vicbdm_place_abbreviations.mjs";
import { vicbdmPlaceAbbreviationTable2 } from "./vicbdm_place_abbreviations2.mjs";

function pushPlaceAbbreviations(placeName, values) {
  if (!placeName) {
    return;
  }

  let abbrevs = [];

  let lcPlaceName = placeName.toLowerCase();
  for (let key of Object.keys(vicbdmPlaceAbbreviationTable)) {
    let value = vicbdmPlaceAbbreviationTable[key];
    if (value && value.toLowerCase() == lcPlaceName) {
      abbrevs.push(key);
    }
  }

  for (let row of vicbdmPlaceAbbreviationTable2) {
    if (row.name.toLowerCase() == lcPlaceName) {
      abbrevs.push(row.abbrev);
    }
  }

  for (let abbrev of abbrevs) {
    let lcAbbrev = abbrev.toLowerCase();
    if (!values.some((entry) => entry.value.toLowerCase() == lcAbbrev)) {
      let value = { value: abbrev, text: abbrev };
      values.push(value);
    }
  }
}

function buildSelectValuesForPlaces(placeNames) {
  let values = [];

  console.log("buildSelectValuesForPlace: placeNames is:");
  console.log(placeNames);

  function addValue(valueString) {
    if (valueString) {
      let value = { value: valueString, text: valueString };
      if (!values.some((entry) => entry.value === valueString)) {
        values.push(value);

        pushPlaceAbbreviations(valueString, values);
      }
    }
  }

  addValue("<none>");

  for (let placeName of placeNames) {
    let place = new PlaceObj();
    place.placeString = placeName;
    let placeParts = place.separatePlaceIntoParts();

    console.log("buildSelectValuesForPlace: placeParts is:");
    console.log(placeParts);

    if (placeParts.localPlace) {
      let localPlace = placeParts.localPlace;
      const commaIndex = localPlace.indexOf(",");
      if (commaIndex != -1) {
        localPlace = localPlace.substring(0, commaIndex).trim();
      }
      addValue(localPlace);
    }
  }

  console.log("buildSelectValuesForPlace: values is:");
  console.log(values);

  return values;
}

const categories = [
  { value: "Births", text: "Births" },
  { value: "Deaths", text: "Deaths" },
  { value: "Marriages", text: "Marriages" },
  { value: "All", text: "All" },
];

const VicbdmData = {
  includeCategories: function (generalizedData, parameters) {
    return true;
  },

  getCategories: function (generalizedData, parameters, options) {
    return categories;
  },

  getAdditionalControls(generalizedData, parameters, options) {
    let controls = [];

    let placeNames = generalizedData.inferPlaceNames();
    if (placeNames && placeNames.length > 0) {
      let placeControl = {};
      placeControl.elementId = "place";
      placeControl.parameterName = "place";
      placeControl.type = "select";
      placeControl.label = "Place to use in search";
      placeControl.values = buildSelectValuesForPlaces(placeNames);
      controls.push(placeControl);
    }

    return controls;
  },

  setDefaultSearchParameters: function (generalizedData, parameters, options) {
    parameters.category = "Births";

    parameters.place = "<none>";
  },

  updateParametersOnCategoryChange: function (generalizedData, parameters, options) {},

  updateParametersOnSubcategoryChange: function (generalizedData, parameters, options) {},

  updateParametersOnCollectionChange: function (generalizedData, parameters, options) {},
};

export { VicbdmData };
