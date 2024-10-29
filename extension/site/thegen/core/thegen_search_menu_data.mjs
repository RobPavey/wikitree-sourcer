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
    value: "1939 Register",
    text: "1939 Register",
  },
  {
    value: "Births & Baptisms",
    text: "Births & Baptisms",
  },
  {
    value: "Census",
    text: "Census",
  },
  {
    value: "Census Ireland",
    text: "Census Ireland",
  },
  {
    value: "Census US",
    text: "Census US",
  },
  {
    value: "Court & Criminal",
    text: "Court & Criminal",
  },
  {
    value: "Deaths & Burials",
    text: "Deaths & Burials",
  },
  {
    value: "Education Records",
    text: "Education Records",
  },
  {
    value: "Immigration, Emigration & Travel",
    text: "Immigration, Emigration & Travel",
  },
  {
    value: "Insolvents & Bankrupts",
    text: "Insolvents & Bankrupts",
  },
  {
    value: "International",
    text: "International",
  },
  {
    value: "Landowner & Occupier",
    text: "Landowner & Occupier",
  },
  {
    value: "Marriages",
    text: "Marriages",
  },
  {
    value: "Newspapers & Magazines",
    text: "Newspapers & Magazines",
  },
  {
    value: "Occupational",
    text: "Occupational",
  },
  {
    value: "Parish Record Books",
    text: "Parish Record Books",
  },
  {
    value: "Peerage, Gentry & Royalty",
    text: "Peerage, Gentry & Royalty",
  },
  {
    value: "Polls & Electoral Rolls",
    text: "Polls & Electoral Rolls",
  },
  {
    value: "Reference Books",
    text: "Reference Books",
  },
  {
    value: "Trade, Residential & Telephone",
    text: "Trade, Residential & Telephone",
  },
  {
    value: "Wills",
    text: "Wills",
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

const ThegenData = {
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
      placeControl.label = "Keywords to use in search";
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

export { ThegenData };
