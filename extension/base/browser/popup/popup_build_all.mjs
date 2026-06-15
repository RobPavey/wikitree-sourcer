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

import { beginMainMenu, endMainMenu, addBreak, rtToRefTitle } from "./popup_menu_building.mjs";
import { RT } from "/base/core/record_type.mjs";

function addHeading(menu, text) {
  let label = document.createElement("label");
  label.className = "dialogInput";
  label.appendChild(document.createTextNode(text));

  let div = document.createElement("div");
  div.className = "yellowBackground";
  div.appendChild(label);

  menu.list.appendChild(div);
}

function addDivWithLabel(menu, text) {
  let label = document.createElement("label");
  label.className = "dialogInput";
  label.appendChild(document.createTextNode(text));

  let div = document.createElement("div");
  div.className = "menuRowDiv";
  div.appendChild(label);

  menu.list.appendChild(div);
}

function addSourceKeyValuePair(parentElement, key, value, doTruncate) {
  let dt = document.createElement("dt");
  dt.textContent = key;
  let dd = document.createElement("dd");
  if (value) {
    dd.textContent = value;
    if (doTruncate) {
      dd.className = "truncate";
    }
  }

  parentElement.appendChild(dt);
  parentElement.appendChild(dd);
}

function addTextInput(menu, id, labelText, defaultValue, changeFunction) {
  if (!defaultValue) {
    defaultValue = "";
  }
  let textInput = document.createElement("input");
  textInput.type = "text";
  textInput.id = id;
  textInput.className = "dialogTextInput";
  textInput.value = defaultValue;
  textInput.addEventListener("change", changeFunction);
  let label = document.createElement("label");
  label.className = "dialogInput";
  label.appendChild(document.createTextNode(labelText));
  addBreak(label);
  label.appendChild(textInput);
  menu.list.appendChild(label);

  return textInput;
}

function addSourceDetailsToMenu(menu, source) {
  let ed = source.extractedData;
  let gd = source.generalizedData;

  let dl = document.createElement("dl");
  menu.list.appendChild(dl);

  let title = source.title;
  if (ed) {
    // this is a bit site specific
    if (ed.collectionTitle) {
      title = ed.collectionTitle;
    } else if (ed.titleCollection) {
      title = ed.collectionTitle;
    }
  }

  addSourceKeyValuePair(dl, "Title", title);

  if (gd) {
    let role = gd.role;
    let nameString = gd.inferFullName();
    let dateString = gd.inferEventDate();
    let placeString = gd.inferEventPlace();
    addSourceKeyValuePair(dl, "Name", nameString);

    addSourceKeyValuePair(dl, "Date", dateString);

    addSourceKeyValuePair(dl, "Place", placeString);

    if (role) {
      let value = role;
      if (gd.primaryPerson) {
        if (gd.primaryPerson.name) {
          let primaryNameString = gd.primaryPerson.name.inferFullName();
          if (primaryNameString) {
            value += " of " + primaryNameString;
          }
        }
      }
      addSourceKeyValuePair(dl, "Role", role);
    }
  } else {
    let dateString = source.eventDate;
    let notes = source.notes;
    let citation = source.citation;
    let uri = source.uri;
    addSourceKeyValuePair(dl, "Date", dateString);
    addSourceKeyValuePair(dl, "Link", uri, true);
    addSourceKeyValuePair(dl, "Citation", citation);
    addSourceKeyValuePair(dl, "Notes", notes);
  }
}

function addSelector(menu, id, labelText, fillFunction, changeFunction) {
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
  menu.list.appendChild(label);

  return selector;
}

function addKeepButton(menu, clickFunction) {
  let button = document.createElement("button");
  button.className = "dialogButton";
  button.innerText = "Keep source with changes";
  button.onclick = clickFunction;
  menu.list.appendChild(button);
}

function addExcludeButton(menu, clickFunction) {
  let button = document.createElement("button");
  button.className = "dialogButton";
  button.innerText = "Exclude source";
  button.onclick = clickFunction;
  menu.list.appendChild(button);
}

function getUserClassification(source, isRecordTypeNeeded, isRefTitleNeeded) {
  return new Promise((resolve, reject) => {
    let menu = beginMainMenu();

    let gd = source.generalizedData;
    if (!gd) {
      reject("gd undefined");
    }

    let recordType = gd.recordType;
    let refTitle = "";
    let textInputField = undefined;

    let needsRecordType = isRecordTypeNeeded;
    let needsRefTitle = isRefTitleNeeded;

    function fillRecordTypeSelector(selector) {
      while (selector.firstChild) {
        selector.removeChild(selector.firstChild);
      }

      const keys = Object.keys(rtToRefTitle);
      for (const key of keys) {
        let option = document.createElement("option");
        option.value = key;
        option.text = rtToRefTitle[key];
        selector.appendChild(option);
      }
    }

    addHeading(menu, "Unclassified source");

    addSourceDetailsToMenu(menu, source);

    // Explanation
    addDivWithLabel(menu, "Could not identify the record type.");

    if (needsRecordType) {
      addBreak(menu.list);
      addBreak(menu.list);

      // Record Type
      let recordTypeSelector = addSelector(
        menu,
        "recordTypeSelector",
        "Choose record type: ",
        fillRecordTypeSelector,
        function (event) {
          recordType = event.target.value;
          //console.log("set record type to: " + recordType);
          // set ref title
          if (recordType == "Unclassified") {
            refTitle = "";
          } else {
            refTitle = rtToRefTitle[recordType];
          }
          if (textInputField) {
            textInputField.value = refTitle;
          }
        }
      );
    }

    if (needsRefTitle) {
      addBreak(menu.list);
      addBreak(menu.list);

      // text input
      textInputField = addTextInput(menu, "refTitleInput", "Choose label: ", "", function (event) {
        refTitle = event.target.value;
        //console.log("set ref title to: " + refTitle);
      });
    }

    addBreak(menu.list);
    addBreak(menu.list);

    addKeepButton(menu, function (element) {
      let result = {
        include: true,
        recordType: recordType,
        refTitle: refTitle,
      };
      resolve(result);
    });

    addExcludeButton(menu, function (element) {
      let result = {
        include: false,
      };
      resolve(result);
    });

    endMainMenu(menu);
  });
}

function getUserProvidedVitals(source, message) {
  return new Promise((resolve, reject) => {
    let menu = beginMainMenu();

    let needsName = false;
    let needsDate = true; // needs work
    let needsNarrative = true; // needs work

    let gd = source.generalizedData;
    let narrative = "";
    let eventDate = source.eventDate;
    let name = "";
    if (gd) {
      name = gd.inferFullName();
      if (!name) {
        needsName = true;
      }
      let gdEventDate = gd.inferEventDate(true);
      if (gdEventDate) {
        if (!eventDate || (eventDate.length <= 4 && gdEventDate.length > eventDate.length)) {
          eventDate = gdEventDate;
        }
      }
    }

    let textInputField = undefined;

    addHeading(menu, message);

    addSourceDetailsToMenu(menu, source);

    // Explanation
    addBreak(menu.list);
    addDivWithLabel(menu, "More details are required for narrative/sorting:");

    if (needsName) {
      addBreak(menu.list);

      // text input
      addTextInput(menu, "narrativeInput", "Name:", name, function (event) {
        name = event.target.value;
      });
    }

    if (needsDate) {
      addBreak(menu.list);

      // text input
      addTextInput(menu, "narrativeInput", "Event date:", eventDate, function (event) {
        eventDate = event.target.value;
      });
    }

    if (needsNarrative) {
      addBreak(menu.list);
      addBreak(menu.list);

      let message = "Narrative:";
      if (gd) {
        message = "Narrative override (optional):";
      }

      // text input
      addTextInput(menu, "narrativeInput", message, "", function (event) {
        narrative = event.target.value;
        //console.log("set ref title to: " + refTitle);
      });
    }

    addBreak(menu.list);
    addBreak(menu.list);

    addKeepButton(menu, function (element) {
      let result = {
        include: true,
        name: name,
        eventDate: eventDate,
        narrative: narrative,
      };
      resolve(result);
    });

    addExcludeButton(menu, function (element) {
      let result = {
        include: false,
      };
      resolve(result);
    });

    endMainMenu(menu);
  });
}

export { getUserClassification, getUserProvidedVitals };
