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

import { RT } from "../../../base/core/record_type.mjs";
import { WTS_String } from "../../../base/core/wts_string.mjs";
import { buildQueryString, getDefaultSearchParameters } from "./ppnz_build_search_url.mjs";

const proximityValues = [
  { value: "exact", text: "Exact phrase" },
  { value: "0", text: "Words in any order" },
  { value: "1", text: "Words in any order with 1 extra word between them" },
  { value: "2", text: "Words in any order with 2 extra word between them" },
  { value: "3", text: "Words in any order with 3 extra word between them" },
  { value: "5", text: "Words in any order with 5 extra word between them" },
  { value: "10", text: "Words in any order with 10 extra word between them" },
];

function buildSelectValuesForQueryType() {
  let values = [
    { value: "phrases", text: "Phrases" },
    { value: "wordGroups", text: "Word Groups" },
    { value: "words", text: "Words" },
  ];

  return values;
}

function addNameCheckboxes(gd, parameters, options, controls, namePart) {
  function addCheckbox(parameterName, text, value) {
    if (value) {
      let checkboxControl = {};
      checkboxControl.elementId = parameterName;
      checkboxControl.parameterName = parameterName;
      checkboxControl.type = "checkbox";
      checkboxControl.label = text + ": " + value;

      checkboxControl.updateOnChangeFunction = function (parameterName, parameters, options) {
        // do nothing - just need this function so that menu gets rebuilt on change
      };

      controls.push(checkboxControl);
    }
  }

  function addCheckboxesPerWord(parameterName, text, value) {
    if (value) {
      value = value.trim();
      let words = value.split(" ");
      let suffix = 1;
      for (let word of words) {
        word = word.trim();
        if (word) {
          let newParameterName = parameterName + suffix;
          addCheckbox(newParameterName, text, word);
          suffix++;
        }
      }
    }
  }

  let lnab = gd.inferLastNameAtBirth();
  let cln = gd.inferLastNameAtDeath();
  let givenNames = gd.inferForenames();
  let firstName = gd.inferFirstName();

  let prefNames = "";
  let nicknames = "";
  let otherLastNames = "";
  if (gd.name) {
    prefNames = gd.name.prefNames;
    if (!prefNames) {
      prefNames = gd.name.prefName;
    }
    nicknames = gd.name.nicknames;
    otherLastNames = gd.name.otherLastNames;
  }

  if (namePart == "forenames") {
    addCheckbox("includeFirstName", "Include first name", firstName);
    addCheckbox("includeGivenNames", "Include given names", givenNames);
    addCheckbox("includePrefName", "Include preferred name", prefNames);
    addCheckboxesPerWord("includeNickname", "Include nickname", nicknames);
  } else if (namePart == "lastNames") {
    addCheckbox("includeLnab", "Include last name at birth", lnab);
    if (cln && lnab != cln) {
      addCheckbox("includeCln", "Include current last name", cln);
    }
    addCheckboxesPerWord("includeOtherLastName", "Include other last name", otherLastNames);

    if (parameters.proximity == "exact") {
      addCheckbox("includeLnabAtStart", "Include LNAB at start of phrase", lnab);
      if (cln && lnab != cln) {
        addCheckbox("includeClnAtStart", "Include CLN at start of phrase", cln);
      }
      addCheckboxesPerWord("includeOtherLastNameAtStart", "Include OLN at start of phrase", otherLastNames);
    }
  }
}

const PpnzData = {
  includeLastNameSelector: function (generalizedData, parameters) {
    return false;
  },

  getAdditionalControls(generalizedData, parameters, options) {
    let controls = [];

    let queryTypeControl = {};
    queryTypeControl.elementId = "queryType";
    queryTypeControl.parameterName = "queryType";
    queryTypeControl.type = "select";
    queryTypeControl.label = "Type of query to use in search";
    queryTypeControl.values = buildSelectValuesForQueryType();
    queryTypeControl.updateOnChangeFunction = function (parameterName, parameters, options) {
      // do nothing - just need this function so that menu get rebuilt on change
    };
    controls.push(queryTypeControl);

    let proximityControl = {};
    proximityControl.elementId = "proximity";
    proximityControl.parameterName = "proximity";
    proximityControl.type = "select";
    proximityControl.label = "Proximity value to use for phrases";
    proximityControl.values = proximityValues;
    proximityControl.updateOnChangeFunction = function (parameterName, parameters, options) {
      // do nothing - just need this function so that menu get rebuilt on change
    };
    controls.push(proximityControl);

    let forenamesHeading = {};
    forenamesHeading.type = "heading";
    forenamesHeading.label = "Forename variants:";
    controls.push(forenamesHeading);

    addNameCheckboxes(generalizedData, parameters, options, controls, "forenames");

    let lastNamesHeading = {};
    lastNamesHeading.type = "heading";
    lastNamesHeading.label = "Last name variants:";
    controls.push(lastNamesHeading);

    addNameCheckboxes(generalizedData, parameters, options, controls, "lastNames");

    let queryDisplayControl = {};
    queryDisplayControl.elementId = "queryDisplay";
    queryDisplayControl.parameterName = "queryDisplay";
    queryDisplayControl.type = "readOnlyText";
    queryDisplayControl.label = "Query: ";
    queryDisplayControl.value = buildQueryString(generalizedData, parameters, options);
    controls.push(queryDisplayControl);

    return controls;
  },

  setDefaultSearchParameters: function (generalizedData, parameters, options) {
    let defaultParameters = getDefaultSearchParameters(generalizedData, options);
    Object.assign(parameters, defaultParameters);
  },
};

export { PpnzData };
