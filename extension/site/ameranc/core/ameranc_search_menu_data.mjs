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
  {
    value: "all",
    text: "All Categories",
  },
  {
    value: "Atlases, Maps and Reference Materials",
    text: "Atlases, Maps and Reference Materials",
  },
  {
    value: "Census, Tax and Voter Lists",
    text: "Census, Tax and Voter Lists",
  },
  {
    value: "Court, Land and Probate Records",
    text: "Court, Land and Probate Records",
  },
  {
    value: "Genealogies, Biographies, Heraldry, and Local Histories",
    text: "Genealogies, Biographies, Heraldry, and Local Histories",
  },
  {
    value: "Great Migration Study Project",
    text: "Great Migration Study Project",
  },
  {
    value: "Immigration Records",
    text: "Immigration Records",
  },
  {
    value: "Journals and Periodicals",
    text: "Journals and Periodicals",
  },
  {
    value: "Military Records",
    text: "Military Records",
  },
  {
    value: "Vital Records (incl. Bible, Cemetery, Church and SSDI)",
    text: "Vital Records (incl. Bible, Cemetery, Church and SSDI)",
  },
];

function buildSelectValuesForPlaces(generalizedData) {
  let values = [];

  function addValue(valueString) {
    if (valueString) {
      let value = { value: valueString, text: valueString };
      if (!values.some((entry) => entry.value === valueString)) {
        values.push(value);
      }
    }
  }

  function addValueAndAllCombinations(placeName) {
    if (!placeName) {
      return;
    }
    addValue(placeName);
    let placeParts = placeName.split(",");
    if (placeParts.length > 1) {
      for (let startIndex = 0; startIndex < placeParts.length; startIndex++) {
        let cumulativeParts = "";
        for (let endIndex = startIndex; endIndex < placeParts.length; endIndex++) {
          if (cumulativeParts) {
            cumulativeParts += ", ";
          }
          cumulativeParts += placeParts[endIndex].trim();
          addValue(cumulativeParts);
        }
      }
    }
  }

  addValue("<none>");

  let placeNames = generalizedData.inferPlaceNames();
  for (let placeName of placeNames) {
    addValueAndAllCombinations(placeName);
  }

  if (generalizedData.collectionData) {
    addValueAndAllCombinations(generalizedData.collectionData.documentPlace);
    addValueAndAllCombinations(generalizedData.collectionData.place);
  }

  function compareFunction(a, b) {
    if (a.text < b.text) {
      return -1;
    }
    if (a.text > b.text) {
      return 1;
    }
    return 0;
  }

  values.sort(compareFunction);

  //console.log("buildSelectValuesForPlace: values is:");
  //console.log(values);

  return values;
}

const AmerancData = {
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
    return false;
  },

  includeOtherPerson: function (generalizedData, parameters) {
    return false;
  },

  getCategories: function (generalizedData, parameters, options) {
    return categories;
  },

  getCollections: function (generalizedData, parameters, options) {},

  getAdditionalControls(generalizedData, parameters, options) {
    let controls = [];

    let placeValues = buildSelectValuesForPlaces(generalizedData);

    if (placeValues && placeValues.length > 0) {
      let placeControl = {};
      placeControl.elementId = "place";
      placeControl.parameterName = "place";
      placeControl.type = "select";
      placeControl.label = "Place to use in search";
      placeControl.values = placeValues;
      controls.push(placeControl);
    }

    return controls;
  },

  setDefaultSearchParameters: function (generalizedData, parameters, options) {
    parameters.place = "<none>";
  },

  updateParametersOnCategoryChange: function (generalizedData, parameters, options) {},
};

export { AmerancData };
