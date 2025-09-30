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

import { EggsaCommon } from "./eggsa_common.mjs";
import { EggsaGrvsCommon } from "../core/eggsagrvs_common.mjs";

const modeOptions = [
  { value: "1", text: "appear anywhere in the surname" },
  { value: "2", text: "appear at the start of the surname" },
  { value: "3", text: "appear at the end of the surname " },
  { value: "4", text: "match exactly" },
];

function modeOptionsFor(who) {
  if (who == "surname") return modeOptions;
  const options = [];
  for (const option of modeOptions) {
    options.push({ value: option.value, text: option.text.replace("surname", who) });
  }
  return options;
}

function aSelectEntry(valueStr) {
  return { value: valueStr, text: valueStr };
}

function addSelectEntry(entries, valueStr) {
  if (!entries.some((entry) => entry.value === valueStr)) {
    entries.push(aSelectEntry(valueStr));
  }
}

function lastWordInSurname(surname) {
  const prefix = EggsaCommon.multiWordSurnamePrefixAtStart(surname);
  if (prefix) {
    return surname.substring(prefix.length).trim();
  }
  return surname;
}

function buildDefaultParameters(province, generalizedData, parameters, options) {
  parameters.urlPart = province;
  parameters.lastName = lastWordInSurname(generalizedData.inferLastName());
  parameters.surnameMode = options.search_eggsagrvs_surnameMode;

  let firstNames = [];
  const optFullFirstname = options.search_eggsagrvs_fullFirstName;
  if (optFullFirstname) {
    const foreNames = generalizedData.inferForenames();
    if (foreNames) {
      firstNames = foreNames.split(" ");
    }
  } else {
    firstNames = [generalizedData.inferFirstName()];
  }

  for (const firstName of firstNames) {
    parameters["includeFirstName_" + firstName] = true;
  }
  parameters.firstNameMode = options.search_eggsagrvs_firstNameMode;
}

const EggsaGrvsData = {
  includeCategories: function (generalizedData, parameters) {
    return false;
  },

  getCategories: function (generalizedData, parameters, options) {
    EggsaGrvsCommon.searchAreas.map((e) => {
      return { value: e.urlPart, text: e.name };
    });
  },

  // We do need a last name selector, but we need to construct our own in order to
  // provide an option where the prefix(es) of multi-word last names are stripped off
  // so we don't want the default one
  includeLastNameSelector: function (generalizedData, parameters) {
    return false;
  },

  getAdditionalControls(generalizedData, parameters, options) {
    const controls = [];

    // Place
    const placeControl = {};
    placeControl.elementId = "province";
    placeControl.parameterName = "urlPart";
    placeControl.type = "select";
    placeControl.label = "Where to search";
    placeControl.values = EggsaGrvsCommon.searchAreas.map((e) => {
      return { value: e.urlPart, text: e.name };
    });
    controls.push(placeControl);

    // Last name(s)
    const surnamesArray = generalizedData.inferPersonLastNamesArray(generalizedData);
    if (surnamesArray.length > 0) {
      const surnameOptions = [];
      const added = new Set();
      for (let surnameIndex = 0; surnameIndex < surnamesArray.length; ++surnameIndex) {
        const surname = surnamesArray[surnameIndex].trim();
        const lastWord = lastWordInSurname(surname);
        if (lastWord !== surname && !added.has(lastWord)) {
          addSelectEntry(surnameOptions, lastWord);
          added.add(lastWord);
        }
        if (!added.has(surname)) {
          addSelectEntry(surnameOptions, surname);
          added.add(surname);
        }
      }

      const surnameControl = {};
      surnameControl.elementId = "surnameToFind";
      surnameControl.parameterName = "lastName";
      surnameControl.type = "select";
      surnameControl.label = "Surname to use in search";
      surnameControl.values = surnameOptions;
      controls.push(surnameControl);
    }

    // Surname mode
    const surnameModeControl = {};
    surnameModeControl.elementId = "surnameMode";
    surnameModeControl.parameterName = "surnameMode";
    surnameModeControl.type = "select";
    surnameModeControl.label = "Surname should";
    surnameModeControl.values = modeOptionsFor("surname");
    surnameModeControl.defaultValue = options.search_EggsaGrvs_surnameMode;
    controls.push(surnameModeControl);

    // First names
    const firstNamesArray = [
      ...new Set(generalizedData.name.inferForenamesPlusPreferredAndNicknames().split(" ")).keys(),
    ];
    if (firstNamesArray.length > 0) {
      const firstNamesHeadingControl = {};
      firstNamesHeadingControl.type = "heading";
      firstNamesHeadingControl.label = "Select which first names should be used";
      controls.push(firstNamesHeadingControl);

      for (let firstNameIndex = 0; firstNameIndex < firstNamesArray.length; ++firstNameIndex) {
        const firstName = firstNamesArray[firstNameIndex];

        const nameControl = {};
        nameControl.elementId = "includeFirstName_" + firstName;
        nameControl.parameterName = "includeFirstName_" + firstName;
        nameControl.type = "checkbox";
        nameControl.label = firstName;
        controls.push(nameControl);
      }
    }

    // First name mode
    const firstNameModeControl = {};
    firstNameModeControl.elementId = "firstNameMode";
    firstNameModeControl.parameterName = "firstNameMode";
    firstNameModeControl.type = "select";
    firstNameModeControl.label = "First name(s) should";
    firstNameModeControl.values = modeOptionsFor("first name");
    firstNameModeControl.defaultValue = options.search_EggsaGrvs_firstNameMode;
    controls.push(firstNameModeControl);

    return controls;
  },

  setDefaultSearchParameters: function (generalizedData, parameters, options) {
    buildDefaultParameters("wcsearchGraves", generalizedData, parameters, options);
  },

  updateParametersOnCategoryChange: function (generalizedData, parameters, options) {},

  updateParametersOnSubcategoryChange: function (generalizedData, parameters, options) {},

  updateParametersOnCollectionChange: function (generalizedData, parameters, options) {},
};

export { EggsaGrvsData, buildDefaultParameters };
