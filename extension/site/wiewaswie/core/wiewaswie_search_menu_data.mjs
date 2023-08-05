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

function buildSelectValuesForPlaces(placeNames) {
  let values = [];

  function addValue(valueString) {
    if (valueString) {
      let value = { value: valueString, text: valueString };
      if (!values.some((entry) => entry.value === valueString)) {
        values.push(value);
      }
    }
  }

  addValue("<none>");

  for (let placeName of placeNames) {
    let place = new PlaceObj();
    place.placeString = placeName;
    let placeParts = place.separatePlaceIntoParts();

    if (placeParts.localPlace) {
      let localPlace = placeParts.localPlace;
      const commaIndex = localPlace.indexOf(",");
      if (commaIndex != -1) {
        localPlace = localPlace.substring(0, commaIndex).trim();
      }
      addValue(localPlace);
    }
  }

  //console.log("buildSelectValuesForPlace: values is:");
  //console.log(values);

  return values;
}

const WiewaswieData = {
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
    parameters.place = "<none>";
  },
};

export { WiewaswieData };
