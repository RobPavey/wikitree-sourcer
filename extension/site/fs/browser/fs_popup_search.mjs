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

import {
  setupSearchCollectionsSubMenu,
  addSameRecordMenuItem,
  hasBirthOrDeathYear,
  addBackMenuItem,
  addMenuItemWithSubMenu,
  addMenuItemWithSubtitle,
  addMenuItem,
  beginMainMenu,
  endMainMenu,
  doAsyncActionWithCatch,
} from "/base/browser/popup/popup_menu_building.mjs";

import { doSearch, registerSearchMenuItemFunction } from "/base/browser/popup/popup_search.mjs";
import { options } from "/base/browser/options/options_loader.mjs";

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function familySearchDoSearch(input) {
  doAsyncActionWithCatch("FamilySearch Search", input, async function () {
    let loadedModule = await import(`../core/fs_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

async function familySearchSearch(generalizedData, typeOfSearch) {
  const input = {
    typeOfSearch: typeOfSearch,
    generalizedData: generalizedData,
    options: options,
  };
  familySearchDoSearch(input);
}

async function familySearchSearchCollection(generalizedData, collectionWtsId) {
  let searchParams = {
    collectionWtsId: collectionWtsId,
  };
  const input = {
    typeOfSearch: "SpecifiedCollection",
    searchParameters: searchParams,
    generalizedData: generalizedData,
    options: options,
  };
  familySearchDoSearch(input);
}

async function familySearchSearchWithParameters(generalizedData, parameters) {
  const input = {
    typeOfSearch: "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options,
  };
  familySearchDoSearch(input);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addFamilySearchDefaultSearchMenuItem(menu, data, backFunction, filter) {
  if (!hasBirthOrDeathYear(data)) {
    return false;
  }
  addMenuItemWithSubMenu(
    menu,
    "Search FamilySearch",
    function (element) {
      familySearchSearch(data.generalizedData, "");
    },
    function () {
      setupFamilySearchSearchSubMenu(data, backFunction);
    }
  );
  return true;
}

function addFsSameRecordMenuItem(menu, data) {
  addSameRecordMenuItem(menu, data, "fs", function (element) {
    familySearchSearch(data.generalizedData, "SameCollection");
  });
}

function addFsSearchCollectionsMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search a specific collection...", function (element) {
    setupSearchCollectionsSubMenu(data, "fs", familySearchSearchCollection, backFunction);
  });
}

function addFsSearchTreeMenuItem(menu, data) {
  addMenuItem(menu, "Search family tree", function (element) {
    familySearchSearch(data.generalizedData, "FamilyTree");
  });
}

function addFsSearchWithParametersMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search with specified parameters...", function (element) {
    setupFsSearchWithParametersSubMenu(data, backFunction);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////
async function setupFamilySearchSearchSubMenu(data, backFunction) {
  let backToHereFunction = function () {
    setupFamilySearchSearchSubMenu(data, backFunction);
  };

  let menu = beginMainMenu();
  addBackMenuItem(menu, backFunction);

  addFsSameRecordMenuItem(menu, data);
  addFsSearchCollectionsMenuItem(menu, data, backToHereFunction);
  addFsSearchTreeMenuItem(menu, data);
  addFsSearchWithParametersMenuItem(menu, data, backToHereFunction);

  endMainMenu(menu);
}

function setupFsSearchWithParametersSubMenu(data, backFunction) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  let parameters = {
    type: "all",
    lastNames: [],
    spouses: [],
    father: true,
    mother: true,
  };

  let gd = data.generalizedData;

  // Type
  let typeSelector = document.createElement("select");
  typeSelector.id = "typeSelector";
  const values = [
    { value: "all", text: "All" },
    { value: "0", text: "Birth, Baptism, and Christening" },
    { value: "1", text: "Marriage" },
    { value: "2", text: "Death" },
    { value: "3", text: "Census, Residence, and Lists" },
    { value: "4", text: "Immigration and Naturalization" },
    { value: "5", text: "Military" },
    { value: "6", text: "Probate" },
    { value: "7", text: "Other" },
  ];
  for (const val of values) {
    let option = document.createElement("option");
    option.value = val.value;
    option.text = val.text;
    typeSelector.appendChild(option);
  }
  typeSelector.addEventListener("change", function (event) {
    parameters.type = event.target.value;
  });
  let label = document.createElement("label");
  label.className = "dialogInput";
  label.appendChild(document.createTextNode("Choose type: "));
  label.appendChild(typeSelector);
  menu.list.appendChild(label);

  // Last names
  let lastNamesArray = gd.inferPersonLastNamesArray(gd);
  if (lastNamesArray.length > 1) {
    let br = document.createElement("br");
    menu.list.appendChild(br);
    br = document.createElement("br");
    menu.list.appendChild(br);

    let heading = document.createElement("label");
    heading.className = "dialogHeading";
    heading.appendChild(document.createTextNode("There are multiple last names, select which to use"));
    menu.list.appendChild(heading);

    for (let lastNameIndex = 0; lastNameIndex < lastNamesArray.length; ++lastNameIndex) {
      let lastName = lastNamesArray[lastNameIndex];
      let br = document.createElement("br");
      menu.list.appendChild(br);
      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      parameters.lastNames.push(true);
      checkbox.addEventListener("change", function () {
        if (this.checked) {
          parameters.lastNames[lastNameIndex] = true;
        } else {
          parameters.lastNames[lastNameIndex] = false;
        }
      });
      let label = document.createElement("label");
      label.className = "dialogInput";
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(lastName));
      menu.list.appendChild(label);
    }
  }

  if (gd.spouses && gd.spouses.length > 0) {
    let br = document.createElement("br");
    menu.list.appendChild(br);
    br = document.createElement("br");
    menu.list.appendChild(br);
    let heading = document.createElement("label");
    heading.className = "dialogHeading";
    heading.appendChild(document.createTextNode("Spouses/marriages to include:"));
    menu.list.appendChild(heading);
    let firstSpouse = true;

    for (let spouseIndex = 0; spouseIndex < gd.spouses.length; ++spouseIndex) {
      let spouse = gd.spouses[spouseIndex];
      parameters.spouses.push(true);

      let br = document.createElement("br");
      menu.list.appendChild(br);
      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = firstSpouse;
      firstSpouse = false;
      checkbox.addEventListener("change", function () {
        if (this.checked) {
          parameters.spouses[spouseIndex] = true;
        } else {
          parameters.spouses[spouseIndex] = false;
        }
      });
      let label = document.createElement("label");
      label.className = "dialogInput";
      label.appendChild(checkbox);
      let spouseName = spouse.name ? spouse.name.inferFullName() : "Unknown";
      let marriageYear = spouse.marriageDate ? spouse.marriageDate.getYearString() : "????";
      let labelText = spouseName + " (m. " + marriageYear + ")";

      label.appendChild(document.createTextNode(labelText));
      menu.list.appendChild(label);
    }
  }

  if (gd.parents && (gd.parents.father || gd.parents.mother)) {
    let br = document.createElement("br");
    menu.list.appendChild(br);
    br = document.createElement("br");
    menu.list.appendChild(br);
    let heading = document.createElement("label");
    heading.innerText = "Parents to include:";
    //heading.appendChild(document.createTextNode("Parents to include:"));
    heading.className = "dialogHeading";
    menu.list.appendChild(heading);

    if (gd.parents.father) {
      let father = gd.parents.father;
      parameters.father = true;

      let br = document.createElement("br");
      menu.list.appendChild(br);
      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;
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
      menu.list.appendChild(label);
    }

    if (gd.parents.mother) {
      let mother = gd.parents.mother;
      parameters.mother = true;

      let br = document.createElement("br");
      menu.list.appendChild(br);
      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;
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
      menu.list.appendChild(label);
    }
  }

  // final button
  let br = document.createElement("br");
  menu.list.appendChild(br);
  br = document.createElement("br");
  menu.list.appendChild(br);

  let button = document.createElement("button");
  button.className = "dialogButton";
  button.innerText = "Do Search";
  button.onclick = function (element) {
    familySearchSearchWithParameters(gd, parameters);
  };
  menu.list.appendChild(button);

  endMainMenu(menu);
}

function addFamilySearchImageBuildCitationMenuItems(menu, data) {
  addMenuItemWithSubtitle(
    menu,
    "Build Inline Image Citation",
    function (element) {
      data.type = "inline";
      familySearchBuildCitation(data);
    },
    "It is recommended to Build Inline Citation on the Record Page instead if one exists."
  );
  addMenuItemWithSubtitle(
    menu,
    "Build Source Image Citation",
    function (element) {
      data.type = "source";
      familySearchBuildCitation(data);
    },
    "It is recommended to Build Source Citation on the Record Page instead if one exists."
  );
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("fs", "FamilySearch", addFamilySearchDefaultSearchMenuItem);
