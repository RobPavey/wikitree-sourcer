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

import { buildQueryString, setDefaultTextQueryParameters } from "./text_query.mjs";

const proximityValues = [
  { value: "exact", text: "Exact phrase" },
  { value: "1", text: "Proximity 1" },
  { value: "2", text: "Proximity 2" },
  { value: "3", text: "Proximity 3" },
  { value: "5", text: "Proximity 5" },
  { value: "10", text: "Proximity 10" },
  { value: "20", text: "Proximity 20" },
];

function addNameCheckboxes(gd, parameters, options, controls) {
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

  function getInitials(names) {
    if (!names) {
      return "";
    }

    let words = names.split(" ");
    let initials = "";
    for (let word of words) {
      if (initials) {
        initials += " ";
      }
      initials += word[0];
    }
    return initials;
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

  let firstNameInitial = getInitials(firstName);
  let givenNameInitials = getInitials(givenNames);
  let prefNameInitials = getInitials(prefNames);

  let forenamesHeading = {};
  forenamesHeading.type = "heading";
  forenamesHeading.label = "Forename variants:";
  controls.push(forenamesHeading);

  addCheckbox("includeFirstName", "Include first name", firstName);
  if (givenNames != firstName) {
    addCheckbox("includeGivenNames", "Include given names", givenNames);
  }
  if (prefNames != firstName && prefNames != givenNames) {
    addCheckbox("includePrefName", "Include preferred name", prefNames);
  }
  addCheckboxesPerWord("includeNickname", "Include nickname", nicknames);
  addCheckbox("includeFirstNameInitial", "Include first name initial", firstNameInitial);
  if (givenNameInitials != firstNameInitial) {
    addCheckbox("includeGivenNameInitials", "Include given name initials", givenNameInitials);
  }
  if (prefNameInitials != firstNameInitial && prefNames != givenNameInitials) {
    addCheckbox("includePrefNameInitials", "Include preferred name initials", prefNameInitials);
  }

  let lastNamesHeading = {};
  lastNamesHeading.type = "heading";
  lastNamesHeading.label = "Last name variants:";
  controls.push(lastNamesHeading);

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

  // spouse names
  if (gd.spouses && gd.spouses.length > 0) {
    let suffix = 1;
    for (let spouse of gd.spouses) {
      if (spouse.name) {
        let spouseNamesHeading = {};
        spouseNamesHeading.type = "heading";
        if (gd.spouses.length > 1) {
          spouseNamesHeading.label = "Spouse (" + suffix + "):";
        } else {
          spouseNamesHeading.label = "Spouse:";
        }
        controls.push(spouseNamesHeading);

        let lnab = spouse.lastNameAtBirth;
        if (!lnab) {
          lnab = spouse.name.inferLastName();
        }
        let givenNames = spouse.name.inferForenames();
        let firstName = spouse.name.inferFirstName();

        addCheckbox("includeFirstNameSpouse" + suffix, "Include first name", firstName);
        if (firstName != givenNames) {
          addCheckbox("includeGivenNamesSpouse" + suffix, "Include given names", givenNames);
        }

        addCheckbox("includeLnabSpouse" + suffix, "Include last name at birth", lnab);
      }
      suffix++;
    }
  }
}

const TextSearchMenuData = {
  includeLastNameSelector: function (generalizedData, parameters) {
    return false;
  },

  getAdditionalControls(generalizedData, parameters, options) {
    let controls = [];

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

    addNameCheckboxes(generalizedData, parameters, options, controls);

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
    setDefaultTextQueryParameters(parameters, generalizedData, options);
  },
};

export { TextSearchMenuData };
