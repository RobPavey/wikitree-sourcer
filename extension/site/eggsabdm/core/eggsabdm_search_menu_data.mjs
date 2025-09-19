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

import { multiWordSurnamePrefix } from "../../eggsagrvs/core/eggsagrvs_ed_reader.mjs";

const townCodes = new Map([
  ["All", "0"],
  ["Barkly West", "1"],
  ["Grahamstown", "2"],
  ["East London", "3"],
  ["Potchefstroom", "4"],
  ["Tulbagh", "5"],
  ["Colesberg", "6"],
  ["Sidbury", "7"],
  ["Stellenbosch", "8"],
  ["Cape Town", "9"],
  ["Swartland (Malmesbury)", "10"],
  ["Beaufort West", "11"],
  ["Griqualand", "12"],
  ["King William's Town", "13"],
  ["Adelaide", "14"],
  ["Uniondale", "15"],
  ["Fort Beaufort", "16"],
  ["Drakenstein (Paarl)", "17"],
  ["Port Elizabeth", "18"],
  ["Tulbagh (Kruisvallei)", "19"],
  ["Graaff-Reinet", "20"],
  ["Berlin", "21"],
  ["Pietermaritzburg", "22"],
  ["Voortrekker Baptisms", "24"],
]);

// If the main attributes of parameterDefs are changed, you must update searchAreas in eggsabdm_popup_search.mjs
const parameterDefs = {
  Baptisms: {
    towns: [
      "All",
      "Adelaide",
      "Barkly West",
      "Cape Town",
      "Colesberg",
      "Drakenstein (Paarl)",
      "Fort Beaufort",
      "Graaff-Reinet",
      "Grahamstown",
      "King William's Town",
      "Potchefstroom",
      "Sidbury",
      "Stellenbosch",
      "Swartland (Malmesbury)",
      "Tulbagh",
      "Uniondale",
      "Voortrekker Baptisms",
    ],
    roles: ["Child", "Father", "Mother", "Witness"],
  },

  Marriages: {
    towns: [
      "All",
      "Barkly West",
      "Beaufort West",
      "Cape Town",
      "Drakenstein / Paarl",
      "Fort Beaufort",
      "Grahamstown",
      "Griqualand",
      "Potchefstroom",
      "Tulbagh",
      "Tulbagh (Kruisvallei)",
    ],
    roles: ["Groom", "Bride", "Witness"],
  },

  Burials: {
    towns: [
      "All",
      "Barkly West",
      "Berlin",
      "Cape Town",
      "East London",
      "Fort Beaufort",
      "Grahamstown",
      "Pietermaritzburg",
      "Port Elizabeth",
      "Potchefstroom",
      "Sidbury",
      "Stellenbosch",
      "Tulbagh",
    ],
  },
};

// We don't currently use this (i.e. send the place parameter by value) because
// on the search page, while we're searching we want to display where we're searching
function makePlaceSelectEntry(placeName) {
  const value = townCodes.get(placeName);
  if (value) {
    return { value: value, text: placeName };
  } else {
    return { value: "0", text: placeName };
  }
}

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
  const prefix = multiWordSurnamePrefix(surname);
  if (prefix) {
    return surname.substring(prefix.length).trim();
  }
  return surname;
}

function buildDefaultParameters(category, generalizedData, parameters, options) {
  parameters.category = category;
  parameters.lastName = lastWordInSurname(generalizedData.inferLastName());
  parameters.surnameMode = options.search_eggsabdm_surnameMode;

  let firstNames = [];
  const optFullFirstname = options.search_eggsabdm_fullFirstName;
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
  parameters.firstNameMode = options.search_eggsabdm_firstNameMode;

  switch (category) {
    case "Baptisms":
      parameters.role = "Child";
      break;
    case "Marriages":
      parameters.role = generalizedData.personGender === "female" ? "Bride" : "Groom";
      break;
    case "Burials":
    default:
      break;
  }
  parameters.town = "All";
  parameters.order = options.search_eggsabdm_resultOrder;
}

const EggsabdmData = {
  includeCategories: function (generalizedData, parameters) {
    return true;
  },

  getCategories: function (generalizedData, parameters, options) {
    return Object.keys(parameterDefs).map((key) => aSelectEntry(key));
  },

  // We do need a last name selector, but we need to construct our own in order to
  // provide an option where the prefix(es) of multi-word last names are stripped off
  includeLastNameSelector: function (generalizedData, parameters) {
    return false;
  },

  getAdditionalControls(generalizedData, parameters, options) {
    const category = parameters.category;
    const controls = [];

    // Last name(s)
    const surnamesArray = generalizedData.inferPersonLastNamesArray(generalizedData);
    if (surnamesArray.length > 0) {
      const surnameOptions = [];
      for (let surnameIndex = 0; surnameIndex < surnamesArray.length; ++surnameIndex) {
        const surname = surnamesArray[surnameIndex];
        const lastWord = lastWordInSurname(surname);
        if (lastWord !== surname) {
          addSelectEntry(surnameOptions, lastWord);
        }
        addSelectEntry(surnameOptions, surname);
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
    surnameModeControl.defaultValue = options.search_eggsabdm_surnameMode;
    controls.push(surnameModeControl);

    // First names
    const firstNamesArray = [
      ...new Set(generalizedData.name.inferForenamesPlusPreferredAndNicknames().split(" ")).keys(),
    ];
    if (firstNamesArray.length > 1) {
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
    firstNameModeControl.defaultValue = options.search_eggsabdm_firstNameMode;
    controls.push(firstNameModeControl);

    // Role
    const roles = parameterDefs[category] ? parameterDefs[category].roles : [];
    if (roles && roles.length > 0) {
      const roleModeControl = {};
      roleModeControl.elementId = "role";
      roleModeControl.parameterName = "role";
      roleModeControl.type = "select";
      roleModeControl.label = "Role";
      roleModeControl.values = roles.map((role) => aSelectEntry(role));
      controls.push(roleModeControl);
    }

    // Place
    const placeNames = parameterDefs[category] ? parameterDefs[category].towns : [];
    if (placeNames && placeNames.length > 0) {
      const placeControl = {};
      placeControl.elementId = "town";
      placeControl.parameterName = "town";
      placeControl.type = "select";
      placeControl.label = "Town to use in search";
      placeControl.values = placeNames.map((town) => aSelectEntry(town));
      controls.push(placeControl);
    }

    // Order of results
    const orderControl = {};
    orderControl.elementId = "order";
    orderControl.parameterName = "order";
    orderControl.type = "select";
    orderControl.label = "Order results by";
    orderControl.values = [
      { value: "by_Surname", text: "Surname" },
      { value: "by_Year", text: "Year" },
    ];
    orderControl.defaultValue = options.search_eggsabdm_resultOrder;
    controls.push(orderControl);

    return controls;
  },

  setDefaultSearchParameters: function (generalizedData, parameters, options) {
    buildDefaultParameters("Baptisms", generalizedData, parameters, options);
  },

  updateParametersOnCategoryChange: function (generalizedData, parameters, options) {
    const category = parameters.category;
    parameters.town = "All";

    switch (category) {
      case "Baptisms":
        parameters.role = "Child";
        break;
      case "Marriages":
        parameters.role = generalizedData.personGender === "female" ? "Bride" : "Groom";
        break;
      case "Burials":
      default:
        parameters.role = undefined;
        break;
    }
  },

  updateParametersOnSubcategoryChange: function (generalizedData, parameters, options) {},

  updateParametersOnCollectionChange: function (generalizedData, parameters, options) {},
};

export { EggsabdmData, buildDefaultParameters };
