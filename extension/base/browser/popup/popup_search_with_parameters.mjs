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

import { addBackMenuItem, beginMainMenu, endMainMenu, addBreak } from "/base/browser/popup/popup_menu_building.mjs";
import { options } from "/base/browser/options/options_loader.mjs";

function getCategoriesLabelText(siteData, gd, parameters) {
  let labelText = "Choose category: ";
  if (typeof siteData.getCategorySelectorLabel === "function") {
    labelText = siteData.getCategorySelectorLabel(gd, parameters);
  }

  return labelText;
}

function getSubcategoriesLabelText(siteData, gd, parameters) {
  let labelText = "Choose subcategory: ";
  if (typeof siteData.getSubcategorySelectorLabel === "function") {
    labelText = siteData.getSubcategorySelectorLabel(gd, parameters);
  }

  return labelText;
}

function addSelector(listElement, id, labelText, fillFunction, changeFunction) {
  let selector = document.createElement("select");
  selector.id = id;
  selector.className = "dialogSelector";
  fillFunction(selector);
  selector.addEventListener("change", changeFunction);
  let label = document.createElement("label");
  label.className = "dialogInput";
  label.appendChild(document.createTextNode(labelText));
  addBreak(label);
  label.appendChild(selector);

  let div = document.createElement("div");
  div.className = "dialogDiv";
  div.appendChild(label);

  listElement.appendChild(div);

  return selector;
}

function addCategorySelector(data, siteData, listElement, parameters) {
  let gd = data.generalizedData;

  function fillCategorySelector(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }

    const values = siteData.getCategories(gd, parameters, options);
    for (const val of values) {
      let option = document.createElement("option");
      option.value = val.value;
      option.text = val.text;
      selector.appendChild(option);
    }
    selector.value = parameters.category;
  }

  if (typeof siteData.includeCategories === "function") {
    if (siteData.includeCategories(gd, parameters)) {
      let labelText = getCategoriesLabelText(siteData, gd, parameters);
      let categorySelector = addSelector(
        listElement,
        "categorySelector",
        labelText,
        fillCategorySelector,
        function (event) {
          parameters.category = event.target.value;
          siteData.updateParametersOnCategoryChange(gd, parameters, options);
          setupParametersElements(data, siteData, listElement, parameters);
        }
      );
      categorySelector.value = parameters.category;
    }
  }
}

function addSubcategorySelector(data, siteData, listElement, parameters) {
  let gd = data.generalizedData;

  function fillSubcategorySelector(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }

    const values = siteData.getSubcategories(gd, parameters, options);
    for (const val of values) {
      let option = document.createElement("option");
      option.value = val.value;
      option.text = val.text;
      selector.appendChild(option);
    }
    selector.value = parameters.subcategory;
  }

  if (typeof siteData.includeSubcategories === "function") {
    if (siteData.includeSubcategories(gd, parameters)) {
      let labelText = getSubcategoriesLabelText(siteData, gd, parameters);
      let subcategorySelector = addSelector(
        listElement,
        "subcategorySelector",
        labelText,
        fillSubcategorySelector,
        function (event) {
          parameters.subcategory = event.target.value;
          siteData.updateParametersOnSubcategoryChange(gd, parameters, options);
          setupParametersElements(data, siteData, listElement, parameters);
        }
      );
      subcategorySelector.value = parameters.subcategory;
    }
  }
}

function addCollectionSelector(data, siteData, listElement, parameters) {
  let gd = data.generalizedData;

  function fillCollectionSelector(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }

    const values = siteData.getCollections(gd, parameters, options);
    for (const val of values) {
      let option = document.createElement("option");
      option.value = val.value;
      option.text = val.text;
      selector.appendChild(option);
    }
  }

  if (typeof siteData.includeCollections === "function") {
    if (siteData.includeCollections(gd, parameters)) {
      let collectionSelector = addSelector(
        listElement,
        "collectionSelector",
        "Choose collection: ",
        fillCollectionSelector,
        function (event) {
          parameters.collection = event.target.value;
          siteData.updateParametersOnCollectionChange(gd, parameters, options);
          setupParametersElements(data, siteData, listElement, parameters);
        }
      );
      collectionSelector.value = parameters.collection;
    }
  }
}

function addLastNameSelector(data, siteData, listElement, parameters) {
  function fillLastNameSelector(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }

    let lastNamesArray = gd.inferPersonLastNamesArray(gd);
    for (let lastNameIndex = 0; lastNameIndex < lastNamesArray.length; ++lastNameIndex) {
      let lastName = lastNamesArray[lastNameIndex];
      let option = document.createElement("option");
      option.value = lastNameIndex;
      option.text = lastName;
      selector.appendChild(option);
    }
  }

  let gd = data.generalizedData;

  let includeLastNameSelector = true; // default to showing unless siteData overrides
  if (typeof siteData.includeLastNameSelector === "function") {
    includeLastNameSelector = siteData.includeLastNameSelector(gd, parameters);
  }

  if (includeLastNameSelector) {
    let lastNamesArray = gd.inferPersonLastNamesArray(gd);
    if (lastNamesArray.length > 1) {
      let lastNameSelector = addSelector(
        listElement,
        "lastNameSelector",
        "Multiple last names, select which to use: ",
        fillLastNameSelector,
        function (event) {
          parameters.lastNameIndex = event.target.value;
        }
      );
      lastNameSelector.value = parameters.lastNameIndex;
    }
  }
}

function addSpouseSelector(data, siteData, listElement, parameters) {
  function fillSpouseSelector(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }

    let option = document.createElement("option");
    option.value = -1;
    option.text = "None";
    selector.appendChild(option);

    for (let spouseIndex = 0; spouseIndex < gd.spouses.length; ++spouseIndex) {
      let spouse = gd.spouses[spouseIndex];
      let spouseName = "Unknown spouse";
      if (spouse.name) {
        let name = spouse.name.inferFullName();
        if (name) {
          spouseName = name;
        }
      }
      let marriageYear = spouse.marriageDate ? spouse.marriageDate.getYearString() : "????";
      let labelText = spouseName + " (m. " + marriageYear + ")";

      option = document.createElement("option");
      option.value = spouseIndex;
      option.text = labelText;
      selector.appendChild(option);
    }

    selector.value = parameters.spouseIndex;
  }

  let gd = data.generalizedData;
  if (typeof siteData.includeSpouses === "function") {
    if (siteData.includeSpouses(gd, parameters)) {
      if (gd.spouses && gd.spouses.length > 0) {
        let spouseSelector = addSelector(
          listElement,
          "spouseSelector",
          "Spouse/marriage to include: ",
          fillSpouseSelector,
          function (event) {
            parameters.spouseIndex = event.target.value;
            if (typeof siteData.updateParametersOnSpouseChange === "function") {
              siteData.updateParametersOnSpouseChange(gd, parameters, options);
            }
            setupParametersElements(data, siteData, listElement, parameters);
          }
        );
        spouseSelector.value = parameters.spouseIndex;
      }
    }
  }
}

function addParentCheckboxes(data, siteData, listElement, parameters) {
  if (typeof siteData.includeParents !== "function") {
    return;
  }

  let gd = data.generalizedData;
  if (siteData.includeParents(gd, parameters)) {
    if (gd.parents && (gd.parents.father || gd.parents.mother)) {
      let heading = document.createElement("label");
      heading.innerText = "Parents to include:";
      //heading.appendChild(document.createTextNode("Parents to include:"));
      heading.className = "dialogHeading";
      listElement.appendChild(heading);

      if (gd.parents.father) {
        let father = gd.parents.father;
        if (parameters.father === undefined) {
          parameters.father = true;
        }

        let br = document.createElement("br");
        listElement.appendChild(br);
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = parameters.father;
        checkbox.addEventListener("change", function () {
          if (this.checked) {
            parameters.father = true;
          } else {
            parameters.father = false;
          }
        });
        let label = document.createElement("label");
        label.className = "dialogInput";
        label.appendChild(checkbox);
        let fatherName = father.name ? father.name.inferFullName() : "Unknown";
        let labelText = "Father: " + fatherName;

        label.appendChild(document.createTextNode(labelText));
        listElement.appendChild(label);
      }

      if (gd.parents.mother) {
        let mother = gd.parents.mother;
        if (parameters.mother === undefined) {
          parameters.mother = true;
        }

        let br = document.createElement("br");
        listElement.appendChild(br);
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = parameters.mother;
        checkbox.addEventListener("change", function () {
          if (this.checked) {
            parameters.mother = true;
          } else {
            parameters.mother = false;
          }
        });
        let label = document.createElement("label");
        label.className = "dialogInput";
        label.appendChild(checkbox);
        let motherName = mother.name ? mother.name.inferFullName() : "Unknown";
        let labelText = "Mother: " + motherName;
        label.appendChild(document.createTextNode(labelText));
        listElement.appendChild(label);
      }
    }
  } else {
    parameters.father = undefined;
    parameters.mother = undefined;
  }

  if (siteData.includeMmn && siteData.includeMmn(gd, parameters)) {
    console.log("gd.mothersMaidenName is: " + gd.mothersMaidenName);
    if (gd.mothersMaidenName) {
      let mmn = gd.mothersMaidenName;
      if (parameters.mmn === undefined) {
        parameters.mmn = true;
      }

      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = parameters.mmn;
      checkbox.addEventListener("change", function () {
        if (this.checked) {
          parameters.mmn = true;
        } else {
          parameters.mmn = false;
        }
        setupParametersElements(data, siteData, listElement, parameters);
      });
      let br = document.createElement("br");
      listElement.appendChild(br);
      let label = document.createElement("label");
      label.className = "dialogInput";
      label.appendChild(checkbox);
      let labelText = "Mother's Maiden Name: " + mmn;

      label.appendChild(document.createTextNode(labelText));
      listElement.appendChild(label);
    }
  } else {
    parameters.mmn = false;
  }
}

function addOtherPersonSelector(data, siteData, listElement, parameters) {
  function fillOtherPersonSelector(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }

    const values = siteData.getOtherPersonList(gd, parameters, options);
    for (const val of values) {
      let option = document.createElement("option");
      option.value = val.value;
      option.text = val.text;
      selector.appendChild(option);
    }
  }

  let gd = data.generalizedData;
  if (typeof siteData.includeOtherPerson === "function" && siteData.includeOtherPerson(gd, parameters)) {
    let otherPersonSelector = addSelector(
      listElement,
      "collectionSelector",
      "Other person: ",
      fillOtherPersonSelector,
      function (event) {
        parameters.otherPerson = event.target.value;
      }
    );
    otherPersonSelector.value = parameters.otherPerson;
  }
}

function addControlSelector(data, siteData, listElement, control, parameters) {
  function fillSelector(selector, control) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }

    const values = control.values;
    for (const val of values) {
      let option = document.createElement("option");
      option.value = val.value;
      option.text = val.text;
      selector.appendChild(option);
    }
  }

  let selector = document.createElement("select");
  selector.id = control.elementId;
  selector.className = "dialogSelector";
  fillSelector(selector, control);
  selector.addEventListener("change", function (event) {
    parameters[control.parameterName] = event.target.value;

    if (typeof control.updateOnChangeFunction === "function") {
      control.updateOnChangeFunction(control.parameterName, parameters, options);
      setupParametersElements(data, siteData, listElement, parameters);
    }
  });
  selector.value = parameters[control.parameterName];

  let label = document.createElement("label");
  label.className = "dialogInput";
  let labelText = control.label + ": ";
  label.appendChild(document.createTextNode(labelText));
  addBreak(label);
  label.appendChild(selector);

  let div = document.createElement("div");
  div.className = "dialogDiv";
  div.appendChild(label);
  listElement.appendChild(div);

  return selector;
}

function addControlCheckbox(data, siteData, listElement, control, parameters) {
  let checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = control.elementId;
  checkbox.className = "dialogCheckbox";
  checkbox.addEventListener("change", function (event) {
    parameters[control.parameterName] = event.target.checked;

    if (typeof control.updateOnChangeFunction === "function") {
      control.updateOnChangeFunction(control.parameterName, parameters, options);
      setupParametersElements(data, siteData, listElement, parameters);
    }
  });
  checkbox.checked = parameters[control.parameterName];

  let label = document.createElement("label");
  label.className = "dialogInput";
  label.appendChild(checkbox);
  let labelText = control.label;
  label.appendChild(document.createTextNode(labelText));

  let div = document.createElement("div");
  div.className = "dialogDivCheckbox";
  div.appendChild(label);
  listElement.appendChild(div);

  return checkbox;
}

function addControlReadOnlyText(data, siteData, listElement, control, parameters) {
  let label = document.createElement("label");
  label.className = "dialogInput";
  let labelText = control.label;
  label.appendChild(document.createTextNode(labelText));

  let contentLabel = document.createElement("label");
  contentLabel.className = "dialogReadOnlyText";
  let valueText = control.value;
  contentLabel.appendChild(document.createTextNode(valueText));

  let div = document.createElement("div");
  div.className = "dialogDiv";
  div.appendChild(label);
  div.appendChild(contentLabel);
  listElement.appendChild(div);

  return label;
}

function addControlHeading(data, siteData, listElement, control, parameters) {
  let heading = document.createElement("label");
  heading.innerText = control.label;
  heading.className = "dialogHeading";

  let div = document.createElement("div");
  div.className = "dialogDivHeading";
  div.appendChild(heading);
  listElement.appendChild(div);

  return heading;
}

function addAdditionalControls(data, siteData, listElement, parameters) {
  if (!(typeof siteData.getAdditionalControls === "function")) {
    return;
  }

  let gd = data.generalizedData;
  let controls = siteData.getAdditionalControls(gd, parameters, options);

  for (let control of controls) {
    if (control.type == "select") {
      addControlSelector(data, siteData, listElement, control, parameters);
    } else if (control.type == "checkbox") {
      addControlCheckbox(data, siteData, listElement, control, parameters);
    } else if (control.type == "readOnlyText") {
      addControlReadOnlyText(data, siteData, listElement, control, parameters);
    } else if (control.type == "heading") {
      addControlHeading(data, siteData, listElement, control, parameters);
    }
  }
}

function addWarningMessages(data, siteData, listElement, parameters) {
  if (!(typeof siteData.getWarningMessages === "function")) {
    return;
  }

  let gd = data.generalizedData;
  let messages = siteData.getWarningMessages(gd, parameters, options);

  for (let message of messages) {
    let label = document.createElement("label");
    label.className = "searchWarningMessage";
    let labelText = message;
    label.appendChild(document.createTextNode(labelText));
    listElement.appendChild(label);
  }
}

function setupParametersElements(data, siteData, listElement, parameters) {
  //console.log("setupParametersElements, parameters is:");
  //console.log(parameters);
  // remove any existing children (this function gets called recursively)
  while (listElement.firstChild) {
    listElement.removeChild(listElement.firstChild);
  }

  addCategorySelector(data, siteData, listElement, parameters);
  addSubcategorySelector(data, siteData, listElement, parameters);
  addCollectionSelector(data, siteData, listElement, parameters);
  addLastNameSelector(data, siteData, listElement, parameters);
  addSpouseSelector(data, siteData, listElement, parameters);
  addParentCheckboxes(data, siteData, listElement, parameters);
  addOtherPersonSelector(data, siteData, listElement, parameters);
  // addLargePlaceInput(data, siteData, listElement, parameters);
  // addSmallPlaceInput(data, siteData, listElement, parameters);
  addAdditionalControls(data, siteData, listElement, parameters);
  addWarningMessages(data, siteData, listElement, parameters);
}

function setupSearchWithParametersSubMenu(data, backFunction, siteData, searchFunction) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  let parameters = {
    category: "all",
    subcategory: "all",
    collection: "all",
    lastNameIndex: 0, // index in last names array
    spouseIndex: 0, // index into spouses array
    father: true,
    mother: true,
    otherPerson: "",
    largePlace: "",
    smallPlace: "",
  };

  if (siteData) {
    siteData.setDefaultSearchParameters(data.generalizedData, parameters, options);

    // we create a new nested list so that we can delete all the elements in the
    // dialog and recreate them easily
    let parametersDiv = document.createElement("div");
    let listElement = document.createElement("ul");
    listElement.className = "list";
    parametersDiv.appendChild(listElement);

    setupParametersElements(data, siteData, listElement, parameters);

    menu.list.appendChild(parametersDiv);
  }

  // final button
  let button = document.createElement("button");
  button.className = "dialogButton";
  button.innerText = "Do Search";
  button.onclick = function (element) {
    searchFunction(data.generalizedData, parameters);
  };
  let buttonDiv = document.createElement("div");
  buttonDiv.className = "dialogButtonDiv";
  buttonDiv.appendChild(button);
  menu.list.appendChild(buttonDiv);

  endMainMenu(menu);
}

export { setupSearchWithParametersSubMenu };
