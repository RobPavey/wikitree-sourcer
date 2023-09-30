/*
MIT License

Copyright (c) 2022 Robert M Pavey

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

import { optionsRegistry } from "../../core/options/options_database.mjs";
import { restoreOptions, saveOptionsFromPage } from "./options_save_restore.mjs";
import { openDialog } from "./options_dialog.mjs";
import { restoreOptionsUiStateAndSetState, updateAndSaveOptionsUiState } from "./options_ui_state.mjs";

// keeps track of the elements for tabs an subsections
var tabElements = {};

function setActiveTab(tabName) {
  //console.log("setActiveTab called: tabName is: " + tabName);

  for (let tab in tabElements) {
    let tabElement = tabElements[tab];
    if (!tabElement) {
      console.log("setActiveTab: No tab element found for '" + tab + "'");
      continue;
    }
    let tabButtonElement = tabElement.buttonElement;
    let tabPanelElement = tabElement.panelElement;

    if (tabName == tab) {
      tabPanelElement.style.display = "block";
      if (!tabButtonElement.className.includes(" active")) {
        tabButtonElement.className += " active";
      }
    } else {
      tabPanelElement.style.display = "none";
      tabButtonElement.className = tabButtonElement.className.replace(" active", "");
    }
  }
}

function setActiveSubsection(tabName, subsectionName) {
  //console.log("setActiveSubsection called: tabName is: " + tabName + " subsectionName is " + subsectionName);

  let tabElement = tabElements[tabName];
  if (!tabElement) {
    console.log("setActiveSubsection: No tab element found for '" + tabName + "'");
    return;
  }

  for (let subsectionKey in tabElement.subsections) {
    let subsection = tabElement.subsections[subsectionKey];
    let panelElement = subsection.panelElement;

    if (subsectionName == subsectionKey) {
      panelElement.style.display = "block";
    } else {
      panelElement.style.display = "none";
    }
  }

  if (tabElement.selectElement) {
    tabElement.selectElement.value = subsectionName;
  }
}

var lastSubsectionSelected = undefined;

function activeTabChanged(tabName) {
  setActiveTab(tabName);

  // try to keep the same subsection as the last one specifically selected by the user
  // if this subsection exists on this tab
  let subsectionToSet = undefined;
  let tabElement = tabElements[tabName];
  if (lastSubsectionSelected && tabElement) {
    let matchingSubsection = tabElement.subsections[lastSubsectionSelected];
    if (matchingSubsection) {
      subsectionToSet = lastSubsectionSelected;
      setActiveSubsection(tabName, lastSubsectionSelected);
    }
  }

  updateAndSaveOptionsUiState(tabName, subsectionToSet);
}

function activeSubsectionChanged(tabName, subsectionName) {
  setActiveSubsection(tabName, subsectionName);
  updateAndSaveOptionsUiState(tabName, subsectionName);
  lastSubsectionSelected = subsectionName;
}

function getRegistryTab(tabName) {
  for (let tab of optionsRegistry.tabs) {
    if (tab.name == tabName) {
      return tab;
    }
  }

  console.log("getRegistryTab: not found: " + tabName);
}

function getRegistrySubsection(tabName, subsectionName) {
  let tab = getRegistryTab(tabName);

  if (tab) {
    for (let subsection of tab.subsections) {
      if (subsection.name == subsectionName) {
        return subsection;
      }
    }
  }
  console.log("getRegistrySubsection: not found: " + tabName + ", " + subsectionName);
}

function getRegistrySubheading(tabName, subsectionName, subheadingName) {
  let subsection = getRegistrySubsection(tabName, subsectionName);

  if (subsection) {
    for (let subheading of subsection.subheadings) {
      if (subheading.name == subheadingName) {
        return subheading;
      }
    }
  }
  console.log("getRegistrySubheading: not found: " + tabName + ", " + subsectionName + ", " + subheadingName);
}

function buildPage() {
  // these refer to names in the .html. These elements could be constructed programatically but
  // are not yet for historical reasons
  const tabMapping = {
    search: { panelElement: "search-panel", buttonElement: "search-tab" },
    citation: { panelElement: "citation-panel", buttonElement: "citation-tab" },
    narrative: {
      panelElement: "narrative-panel",
      buttonElement: "narrative-tab",
    },
    table: { panelElement: "table-panel", buttonElement: "table-tab" },
    addMerge: {
      panelElement: "addMerge-panel",
      buttonElement: "addMerge-tab",
    },
    context: {
      panelElement: "context-panel",
      buttonElement: "context-tab",
    },
  };

  tabElements = {};
  for (let tab in tabMapping) {
    let tabElementData = tabMapping[tab];
    if (!tabElementData) {
      console.log("buildPage: no tabElementData found for name: " + tab);
      continue;
    }

    let tabPanelElement = document.getElementById(tabElementData.panelElement);
    let tabButtonElement = document.getElementById(tabElementData.buttonElement);

    if (!tabPanelElement) {
      console.log("buildPage: no tabPanelElement found for name: " + tab);
      continue;
    }
    if (!tabButtonElement) {
      console.log("buildPage: no tabButtonElement found for name: " + tab);
      continue;
    }

    tabElements[tab] = {
      panelElement: tabPanelElement,
      buttonElement: tabButtonElement,
      subsections: {},
    };
  }

  // Link up the tab panels and buttons and create all the subsection elements
  for (let tab of optionsRegistry.tabs) {
    let tabButtonElement = tabElements[tab.name].buttonElement;
    tabButtonElement.onclick = function (event) {
      activeTabChanged(tab.name);
    };

    let tabPanelElement = tabElements[tab.name].panelElement;

    // this is currently empty
    let elementSubsections = tabElements[tab.name].subsections;

    if (tab.comment) {
      let commentElement = document.createElement("label");
      commentElement.innerText = tab.comment;
      commentElement.className = "tabComment";
      tabPanelElement.appendChild(commentElement);

      let breakElement = document.createElement("br");
      tabPanelElement.appendChild(breakElement);
      let breakElement2 = document.createElement("br");
      tabPanelElement.appendChild(breakElement2);
    }

    // Add select for the subsections, we do this even if there is only one subsection
    // for consistency of appearance
    {
      let subsectionSelectElement = document.createElement("select");
      for (let subsection of tab.subsections) {
        let selectOptionElement = document.createElement("option");
        selectOptionElement.value = subsection.name;
        selectOptionElement.innerText = subsection.label;
        subsectionSelectElement.appendChild(selectOptionElement);
      }
      let labelTextNode = document.createTextNode("Subsection: ");
      let labelElement = document.createElement("label");

      labelElement.appendChild(labelTextNode);
      labelElement.appendChild(subsectionSelectElement);
      labelElement.className = "subsectionSelector";
      tabPanelElement.appendChild(labelElement);

      subsectionSelectElement.onchange = function () {
        activeSubsectionChanged(tab.name, this.value);
      };

      tabElements[tab.name].selectElement = subsectionSelectElement;
    }

    let tabPanelInnerDiv = document.createElement("div");
    tabPanelInnerDiv.className = "subsectionsContainer";
    tabPanelElement.appendChild(tabPanelInnerDiv);

    // add subsections for tab
    for (let subsection of tab.subsections) {
      let divElement = document.createElement("div");
      divElement.className = "subsectionPanel";

      // We used to hae a heading element for the option group but it was just the same
      // as the selector text so there seems no need
      //let headingElement = document.createElement("h3");
      //headingElement.innerText = subsection.label + ":";
      //divElement.appendChild(headingElement);

      if (subsection.comment) {
        let commentElement = document.createElement("label");
        commentElement.innerText = subsection.comment;
        commentElement.className = "subsectionComment";
        divElement.appendChild(commentElement);

        let breakElement = document.createElement("br");
        divElement.appendChild(breakElement);
        let breakElement2 = document.createElement("br");
        divElement.appendChild(breakElement2);
      }

      tabPanelInnerDiv.appendChild(divElement);

      elementSubsections[subsection.name] = { panelElement: divElement };
    }
  }

  // create all the individual option elements (and subheading elements)
  for (let optionsGroup of optionsRegistry.optionsGroups) {
    if (!optionsGroup.tab) {
      console.log("buildPage: optionsGroup has no tab, optionsGroup is:");
      console.log(optionsGroup);
      continue;
    }

    if (!optionsGroup.subsection) {
      console.log("buildPage: optionsGroup has no subsection, optionsGroup is:");
      console.log(optionsGroup);
      continue;
    }

    let tabName = optionsGroup.tab;
    let subsectionName = optionsGroup.subsection;

    let tabElementObj = tabElements[tabName];
    if (!tabElementObj) {
      console.log("buildPage: no element found for tab: " + tabName);
      continue;
    }

    let subSection = tabElementObj.subsections[subsectionName];
    if (!subSection) {
      console.log("buildPage: no subSection found for name: " + subsectionName + ", for tab: " + tabName);
      console.log(tabElements);
      console.log("optionsGroup is:");
      console.log(optionsGroup);
      continue;
    }

    let subsectionPanelElement = subSection.panelElement;

    if (!subsectionPanelElement) {
      console.log("buildPage: no subsectionElement found for name: " + subsectionName);
      console.log(tabElements);
      console.log("optionsGroup is:");
      console.log(optionsGroup);
      continue;
    }

    // if this group has a subheading then create a heading element
    if (optionsGroup.subheading) {
      let subheading = getRegistrySubheading(tabName, subsectionName, optionsGroup.subheading);
      if (subheading) {
        let label = subheading.label;
        let subheadingElement = document.createElement("h4");
        subheadingElement.innerText = label + ":";
        subsectionPanelElement.appendChild(subheadingElement);
      }
    }

    let optionNamePrefix = optionsGroup.category + "_" + optionsGroup.subcategory + "_";

    for (let option of optionsGroup.options) {
      let fullOptionName = optionNamePrefix + option.optionName;

      let optionDivElement = document.createElement("div");

      let optionElement = undefined;
      if (option.type == "checkbox") {
        optionElement = document.createElement("input");
        optionElement.type = "checkbox";
        optionElement.className = "optionCheckbox";

        let labelTextNode = document.createTextNode(" " + option.label);

        let labelElement = document.createElement("label");

        labelElement.appendChild(optionElement);
        labelElement.appendChild(labelTextNode);
        optionDivElement.appendChild(labelElement);
      } else if (option.type == "select") {
        optionElement = document.createElement("select");
        optionElement.className = "optionSelect";

        for (let value of option.values) {
          let selectOptionElement = document.createElement("option");
          selectOptionElement.value = value.value;
          selectOptionElement.innerText = value.text;
          optionElement.appendChild(selectOptionElement);
        }

        let labelTextNode = document.createTextNode(option.label + ": ");

        let labelElement = document.createElement("label");

        labelElement.appendChild(labelTextNode);
        labelElement.appendChild(optionElement);
        optionDivElement.appendChild(labelElement);
      } else if (option.type == "number") {
        optionElement = document.createElement("input");
        optionElement.type = "number";
        optionElement.className = "optionNumber";

        let labelTextNode = document.createTextNode(option.label + ": ");

        let labelElement = document.createElement("label");

        labelElement.appendChild(labelTextNode);
        labelElement.appendChild(optionElement);
        optionDivElement.appendChild(labelElement);
      } else if (option.type == "text") {
        optionElement = document.createElement("input");
        optionElement.type = "text";
        optionElement.className = "optionText";

        let labelTextNode = document.createTextNode(option.label + ": ");

        let labelElement = document.createElement("label");

        labelElement.appendChild(labelTextNode);
        labelElement.appendChild(optionElement);
        optionDivElement.appendChild(labelElement);
      } else if (option.type == "color") {
        optionElement = document.createElement("input");
        optionElement.type = "color";
        optionElement.className = "optionNumber";

        let labelTextNode = document.createTextNode(option.label + ": ");

        let labelElement = document.createElement("label");

        labelElement.appendChild(labelTextNode);
        labelElement.appendChild(optionElement);
        optionDivElement.appendChild(labelElement);
      }
      optionElement.id = fullOptionName;

      if (option.comment) {
        let breakElement = document.createElement("br");
        optionDivElement.appendChild(breakElement);

        let commentElement = document.createElement("label");
        commentElement.innerText = option.comment;
        commentElement.className = "optionComment";
        optionDivElement.appendChild(commentElement);
      }

      let breakElement = document.createElement("br");
      optionDivElement.appendChild(breakElement);

      subsectionPanelElement.appendChild(optionDivElement);
    }
  }

  restoreOptionsUiStateAndSetState(setActiveTab, setActiveSubsection);

  restoreOptions();

  document.getElementById("tabArea").addEventListener("change", saveOptionsFromPage);
  document.getElementById("dialogButton").addEventListener("click", openDialog);
}

document.addEventListener("DOMContentLoaded", buildPage);
