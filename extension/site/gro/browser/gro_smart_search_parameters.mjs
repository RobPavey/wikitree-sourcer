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

import { showErrorDialog, showWarningDialog } from "./gro_smart_search_dialog.mjs";
import { getGroYearRanges } from "../core/gro_years.mjs";

var searchParameters = {};

function checkSearchParameters() {
  let result = {
    errorInputIds: [],
    warningInputIds: [],
    errorMessages: [],
    warningMessages: [],
  };

  if (
    !searchParameters.startYear ||
    !searchParameters.endYear ||
    searchParameters.startYear > searchParameters.endYear
  ) {
    let message = "Invalid start and end years.";
    if (!searchParameters.startYear) {
      message += "\nNo start year specified.";
      result.errorInputIds.push("searchParamStartYear");
    }
    if (!searchParameters.endYear) {
      message += "\nNo end year specified.";
      result.errorInputIds.push("searchParamEndYear");
    }
    if (
      searchParameters.startYear &&
      searchParameters.endYear &&
      searchParameters.startYear > searchParameters.endYear
    ) {
      result.errorInputIds.push("searchParamStartYear");
      result.errorInputIds.push("searchParamEndYear");
      message += "\nStart year is greater than end year.";
    }
    result.errorMessages.push(message);
  }

  if (!searchParameters.surname) {
    result.errorInputIds.push("searchParamSurname");
    result.errorMessages.push("Surname is required.");
  }

  if (!searchParameters.gender) {
    result.errorInputIds.push("searchParamGender");
    result.errorMessages.push("Gender is required.");
  }

  let groRanges = getGroYearRanges(searchParameters.type);
  let groStartYear = groRanges.startYear;
  let groEndYear = groRanges.endYear;
  let gapStartYear = groRanges.gapStartYear;
  let gapEndYear = groRanges.gapEndYear;

  let invalidRangeMessage = "Invalid start and end years.";
  let invalidRange = false;
  let startYear = searchParameters.startYear;
  let endYear = searchParameters.endYear;
  if (endYear < groStartYear) {
    invalidRange = true;
    invalidRangeMessage += "\nEnd year is less than GRO start year of " + groStartYear + ".";
    result.errorInputIds.push("searchParamEndYear");
  } else if (startYear > groEndYear) {
    invalidRange = true;
    invalidRangeMessage += "\nStart year is greater than GRO end year of " + groEndYear + ".";
    result.errorInputIds.push("searchParamStartYear");
  } else if (startYear >= gapStartYear && endYear <= gapEndYear) {
    invalidRange = true;
    invalidRangeMessage += "\nRange is fully within the gap in GRO records of " + gapStartYear + "-" + gapEndYear + ".";
    result.errorInputIds.push("searchParamStartYear");
    result.errorInputIds.push("searchParamEndYear");
  }
  if (invalidRange) {
    result.errorMessages.push(invalidRangeMessage);
  }

  let clampedRange = false;
  let clampedMessage = "Year range checks.";
  if (startYear < groStartYear) {
    startYear = groStartYear;
    clampedRange = true;
    clampedMessage += "\nStart year is less than GRO start year of " + groStartYear + ".";
    clampedMessage += " Will use start year of " + startYear + ".";
    result.warningInputIds.push("searchParamStartYear");
  }
  if (endYear > groEndYear) {
    endYear = groEndYear;
    clampedRange = true;
    clampedMessage += "\nEnd year is greater than GRO end year of " + groEndYear + ".";
    clampedMessage += " Will use end year of " + endYear + ".";
    result.warningInputIds.push("searchParamEndYear");
  }
  if (startYear >= gapStartYear && startYear <= gapEndYear) {
    startYear = gapEndYear + 1;
    clampedRange = true;
    clampedMessage += "\nStart year is in the gap in GRO records between " + gapStartYear + " and " + gapEndYear + ".";
    clampedMessage += " Will use start year of " + startYear + ".";
    result.warningInputIds.push("searchParamStartYear");
  }
  if (endYear >= gapStartYear && endYear <= gapEndYear) {
    endYear = gapStartYear - 1;
    clampedRange = true;
    clampedMessage += "\nEnd year is in the gap in GRO records between " + gapStartYear + " and " + gapEndYear + ".";
    clampedMessage += " Will use end year of " + endYear + ".";
    result.warningInputIds.push("searchParamEndYear");
  }
  searchParameters.startYear = startYear;
  searchParameters.endYear = endYear;

  if (clampedRange) {
    result.warningMessages.push(clampedMessage);
  }

  if (startYear < gapStartYear && endYear > gapEndYear) {
    let message =
      "The year range includes the gap years " +
      gapStartYear +
      "-" +
      gapEndYear +
      ". These years will not be searched.";
    result.warningMessages.push(message);
    result.warningInputIds.push("searchParamStartYear");
    result.warningInputIds.push("searchParamEndYear");
  }

  if (searchParameters.type == "births") {
    if (searchParameters.endYear > 1923 && searchParameters.mmn) {
      let message = "Mother's Maiden Name is specified but range includes years greater than 1923.";
      message += "\n\nFor those years the GRO search cannot narrow the search results using the MMN";
      message += " but it does return the MMN in the result if it matches,";
      message += " so there will be extra search results with blank MMNs.";
      if (searchParameters.startYear <= 1924 && searchParameters.endYear >= 1924) {
        message += "\n\nThe year 1924 is a special case. It does return the MMN for non-matching results.";
        message += " So there may be extra search results with non-matching MMNs.";
      }
      message += "\n\nYou can use the MMN results filter to only show the results with the MMNs that you want.";
      result.warningMessages.push(message);
      result.warningInputIds.push("searchParamMmn");
    }
  }

  return result;
}

async function checkForAndReportErrorsAndWarnings() {
  let checkData = checkSearchParameters();

  if (checkData.errorMessages.length) {
    showErrorDialog(checkData.errorMessages[0]);
    return false;
  }

  for (let message of checkData.warningMessages) {
    let response = await showWarningDialog(message);
    if (response == "buttonCancel") {
      return false;
    }
  }

  // If we clamped values change them in the input fields
  fillControlsFromSearchParameters();

  return true;
}

function getRadioButtonValue(name) {
  // Get the radio buttons by their name attribute
  const radioButtons = document.getElementsByName(name);
  // Find the selected radio button
  let selectedValue = "";
  for (const radioButton of radioButtons) {
    if (radioButton.checked) {
      selectedValue = radioButton.value;
      break;
    }
  }
  return selectedValue;
}

function getSelectValue(id) {
  const selectElement = document.getElementById(id);
  if (selectElement) {
    return selectElement.value;
  }
  return "0";
}

function createRadioButtonGroup(parent, labelText, name, options, required) {
  let labelTdElement = document.createElement("td");
  parent.appendChild(labelTdElement);
  let valueTdElement = document.createElement("td");
  parent.appendChild(valueTdElement);

  let label = document.createElement("label");
  labelTdElement.appendChild(label);
  label.innerText = labelText;
  if (required) {
    label.classList.add("searchParamsRequired");
  }

  for (let option of options) {
    let inputDiv = document.createElement("div");
    inputDiv.className = "radioButtonAndLabel";
    valueTdElement.appendChild(inputDiv);
    let inputElement = document.createElement("input");
    inputDiv.appendChild(inputElement);
    inputElement.type = "radio";
    inputElement.className = "radio";
    inputElement.name = name;
    inputElement.value = option.value;
    inputElement.id = option.id;
    let labelElement = document.createElement("label");
    inputDiv.appendChild(labelElement);
    labelElement.className = "radioLabel";
    labelElement.innerText = option.label;
  }
}

function createSelect(parent, label, id, options) {
  let labelTdElement = document.createElement("td");
  parent.appendChild(labelTdElement);
  let valuelTdElement = document.createElement("td");
  parent.appendChild(valuelTdElement);

  let labelElement = document.createElement("label");
  labelTdElement.appendChild(labelElement);
  labelElement.innerText = label;

  let selectElement = document.createElement("select");
  selectElement.id = id;
  selectElement.class = "dropdown";
  valuelTdElement.appendChild(selectElement);

  let isFirst = true;
  for (let option of options) {
    let optionElement = document.createElement("option");
    selectElement.appendChild(optionElement);
    optionElement.value = option.value;
    optionElement.innerText = option.text;
    if (isFirst) {
      selectElement.value = option.value;
      isFirst = false;
    }
  }
}

function addTextInput(parent, label, id, inputClass, required) {
  let labelTdElement = document.createElement("td");
  parent.appendChild(labelTdElement);
  let valueTdElement = document.createElement("td");
  parent.appendChild(valueTdElement);

  let labelElement = document.createElement("label");
  labelTdElement.appendChild(labelElement);
  labelElement.innerText = label;
  if (required) {
    labelElement.classList.add("searchParamsRequired");
  }

  let inputElement = document.createElement("input");
  valueTdElement.appendChild(inputElement);
  inputElement.type = "text";
  inputElement.id = id;
  inputElement.className = inputClass;
}

function updateSearchControlsOnChange() {
  //console.log("updateSearchControlsOnChange");
  setSearchParametersFromControls();
  //console.log("updateSearchControlsOnChange, searchParameters is:");
  //console.log(searchParameters);

  const allSearchParamInputIds = [
    "searchParamStartYear",
    "searchParamEndYear",
    "searchParamStartBirthYear",
    "searchParamEndBirthYear",
    "searchParamSurname",
    "searchParamForename1",
    "searchParamForename2",
    "searchParamMmn",
    "searchParamDistrict",
  ];

  for (let id of allSearchParamInputIds) {
    let element = document.getElementById(id);
    if (element) {
      element.classList.remove("searchParamError");
      element.classList.remove("searchParamWarning");
    }
  }

  let checkData = checkSearchParameters();
  //console.log("checkData is:");
  //console.log(checkData);

  for (let id of checkData.errorInputIds) {
    let element = document.getElementById(id);
    element.classList.add("searchParamError");
  }

  for (let id of checkData.warningInputIds) {
    let element = document.getElementById(id);
    if (!element.classList.contains("searchParamError")) {
      element.classList.add("searchParamWarning");
    }
  }
}

function createSearchControls(type) {
  let parametersElement = document.getElementById("searchParametersContainer");

  // empty existing div
  while (parametersElement.firstChild) {
    parametersElement.removeChild(parametersElement.firstChild);
  }

  let fragment = document.createDocumentFragment();

  let searchControlsTable = document.createElement("table");
  searchControlsTable.id = "searchControlsTable";
  fragment.appendChild(searchControlsTable);
  let searchControlsBody = document.createElement("tbody");
  searchControlsTable.appendChild(searchControlsBody);

  // add the "type" radio button group
  {
    let typeRow = document.createElement("tr");
    searchControlsBody.appendChild(typeRow);

    let options = [
      { label: "Births", value: "births", id: "searchParamBirth" },
      { label: "Deaths", value: "deaths", id: "searchParamDeath" },
    ];
    createRadioButtonGroup(typeRow, "Select index to search:", "recordType", options, true);
  }

  {
    let genderRow = document.createElement("tr");
    searchControlsBody.appendChild(genderRow);
    let options = [
      { label: "Male", value: "male", id: "searchParamGenderMale" },
      { label: "Female", value: "female", id: "searchParamGenderFemale" },
      { label: "Both", value: "both", id: "searchParamGenderBoth" },
    ];
    createRadioButtonGroup(genderRow, "Sex/Gender:", "gender", options, true);
  }

  // start year and end year
  {
    let partialLabel = "";
    if (type == "births") {
      partialLabel = " year of birth reg: ";
    } else {
      partialLabel = " year of death reg: ";
    }

    let yearRow = document.createElement("tr");
    searchControlsBody.appendChild(yearRow);
    addTextInput(yearRow, "Earliest" + partialLabel, "searchParamStartYear", "textInputYear", true);
    addTextInput(yearRow, "Latest" + partialLabel, "searchParamEndYear", "textInputYear", true);
  }

  // if death add start birth year and end birth year
  if (type == "deaths") {
    let birthYearRow = document.createElement("tr");
    searchControlsBody.appendChild(birthYearRow);
    addTextInput(birthYearRow, "Earliest year of birth: ", "searchParamStartBirthYear", "textInputYear", false);
    addTextInput(birthYearRow, "Latest year of birth: ", "searchParamEndBirthYear", "textInputYear", false);
  }

  {
    let surnameRow = document.createElement("tr");
    searchControlsBody.appendChild(surnameRow);
    let label = type == "births" ? "Surname at birth: " : "Surname at death: ";
    addTextInput(surnameRow, label, "searchParamSurname", "textInputName", true);

    createSelect(surnameRow, "Surname matching: ", "searchParamSurnameMatches", [
      { text: "Exact Matches Only", value: "0" },
      { text: "Phonetically Similar Variations", value: "1" },
    ]);
  }

  {
    let forename1Row = document.createElement("tr");
    searchControlsBody.appendChild(forename1Row);
    addTextInput(forename1Row, "First Forename: ", "searchParamForename1", "textInputName", false);

    createSelect(forename1Row, "Forename matching: ", "searchParamForenameMatches", [
      { text: "Exact Matches Only", value: "0" },
      { text: "Phonetically Similar Variations", value: "1" },
      { text: "Derivative Name Variations", value: "5" },
    ]);
  }

  {
    let forename2Row = document.createElement("tr");
    searchControlsBody.appendChild(forename2Row);
    addTextInput(forename2Row, "Second Forename: ", "searchParamForename2", "textInputName", false);
  }

  if (type == "births") {
    let mmnRow = document.createElement("tr");
    mmnRow.id = "searchParamMmnRow";
    searchControlsBody.appendChild(mmnRow);
    addTextInput(mmnRow, "Mother's maiden name: ", "searchParamMmn", "textInputName", false);

    createSelect(mmnRow, "MMN matching: ", "searchParamMmnMatches", [
      { text: "Exact Matches Only", value: "0" },
      { text: "Phonetically Similar Variations", value: "1" },
      { text: "Similar Sounding Variations", value: "4" },
    ]);
  }

  {
    let districtRow = document.createElement("tr");
    searchControlsBody.appendChild(districtRow);
    addTextInput(districtRow, "Registration district: ", "searchParamDistrict", "textInputDistrict", false);
  }

  parametersElement.appendChild(fragment);

  // now initialize values
  let birthInput = document.getElementById("searchParamBirth");
  if (birthInput) {
    birthInput.addEventListener("click", (event) => {
      createSearchControls("births");
    });
    if (type == "births") {
      birthInput.checked = true;
    }
  }

  let deathInput = document.getElementById("searchParamDeath");
  if (deathInput) {
    deathInput.addEventListener("click", (event) => {
      createSearchControls("deaths");
    });
    if (type == "deaths") {
      deathInput.checked = true;
    }
  }

  let genderBothInput = document.getElementById("searchParamGenderBoth");
  if (genderBothInput) {
    genderBothInput.checked = true;
  }

  // add a listener for whenever controls changed
  searchControlsTable.addEventListener("change", (event) => {
    updateSearchControlsOnChange();
  });
}

function fillControlsFromSearchParameters() {
  function fillTextInput(id, value) {
    let inputElement = document.getElementById(id);
    if (inputElement) {
      if (value) {
        inputElement.value = value;
      } else {
        inputElement.value = "";
      }
    }
  }

  function setRadioButton(name, value) {
    //console.log("setRadioButton: name = " + name + ", value = " + value);
    // Get the radio buttons by their name attribute
    const radioButtons = document.getElementsByName(name);
    //console.log("radioButtons.length = " + radioButtons.length);
    // Find the selected radio button
    for (const radioButton of radioButtons) {
      if (radioButton.value == value) {
        //console.log("found radioButton with value = " + value);

        radioButton.checked = true;
        break;
      }
    }
  }

  function fillSelect(id, value) {
    let inputElement = document.getElementById(id);
    if (inputElement) {
      if (value) {
        inputElement.value = value;
      } else {
        inputElement.value = "";
      }
    }
  }

  let type = searchParameters.type;
  createSearchControls(type);

  fillTextInput("searchParamStartYear", searchParameters.startYear);
  fillTextInput("searchParamEndYear", searchParameters.endYear);

  fillTextInput("searchParamSurname", searchParameters.surname);
  fillSelect("searchParamSurnameMatches", searchParameters.surnameMatches);
  fillTextInput("searchParamForename1", searchParameters.forename1);
  fillTextInput("searchParamForename2", searchParameters.forename2);
  fillSelect("searchParamForenameMatches", searchParameters.forenameMatches);

  setRadioButton("gender", searchParameters.gender);

  if (type == "births") {
    fillTextInput("searchParamMmn", searchParameters.mmn);
    fillSelect("searchParamMmnMatches", searchParameters.mmnMatches);
  } else {
    fillTextInput("searchParamStartBirthYear", searchParameters.startBirthYear);
    fillTextInput("searchParamEndBirthYear", searchParameters.endBirthYear);
  }

  updateSearchControlsOnChange();
}

function setSearchParametersFromControls() {
  function getTextInputValue(id, isNumber) {
    let value = "";
    if (isNumber) {
      value = 0;
    }
    let inputElement = document.getElementById(id);
    if (inputElement) {
      if (inputElement.value) {
        if (isNumber) {
          let number = Number(inputElement.value);
          if (number && !isNaN(number)) {
            value = number;
          }
        } else {
          value = inputElement.value;
        }
      }
    }
    return value;
  }

  searchParameters.type = getRadioButtonValue("recordType");
  searchParameters.gender = getRadioButtonValue("gender");

  searchParameters.startYear = getTextInputValue("searchParamStartYear", true);
  searchParameters.endYear = getTextInputValue("searchParamEndYear", true);

  searchParameters.surname = getTextInputValue("searchParamSurname");
  searchParameters.surnameMatches = getSelectValue("searchParamSurnameMatches");
  searchParameters.forename1 = getTextInputValue("searchParamForename1");
  searchParameters.forenameMatches = getSelectValue("searchParamForenameMatches");
  searchParameters.forename2 = getTextInputValue("searchParamForename2");

  if (searchParameters.type == "births") {
    searchParameters.mmn = getTextInputValue("searchParamMmn");
    searchParameters.mmnMatches = getTextInputValue("searchParamMmnMatches");
  } else {
    searchParameters.startBirthYear = getTextInputValue("searchParamStartBirthYear", true);
    searchParameters.endBirthYear = getTextInputValue("searchParamEndBirthYear", true);
  }

  searchParameters.mothersMaidenName = getTextInputValue("searchParamMmn");
  searchParameters.district = getTextInputValue("searchParamDistrict");
}

function setSearchParameters(parameters) {
  searchParameters = parameters;
}

export {
  searchParameters,
  setSearchParameters,
  createSearchControls,
  setSearchParametersFromControls,
  fillControlsFromSearchParameters,
  checkForAndReportErrorsAndWarnings,
};
