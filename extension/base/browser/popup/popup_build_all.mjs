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

function getUserClassification(source) {
  return new Promise((resolve, reject) => {
    let menu = beginMainMenu();

    let gd = source.generalizedData;
    if (!gd) {
      reject("gd undefined");
    }

    let recordType = gd.recordType;
    let refTitle = "";
    let textInputField = undefined;

    let needsRecordType = true; // needs work
    let needsRefTitle = true; // needs work

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

    function addSelector(id, labelText, fillFunction, changeFunction) {
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

    function addTextInput(id, labelText, changeFunction) {
      let textInput = document.createElement("input");
      textInput.type = "text";
      textInput.id = id;
      textInput.className = "dialogTextInput";
      textInput.addEventListener("change", changeFunction);
      let label = document.createElement("label");
      label.className = "dialogInput";
      label.appendChild(document.createTextNode(labelText));
      addBreak(label);
      label.appendChild(textInput);
      menu.list.appendChild(label);

      return textInput;
    }

    // Explanation
    let reasonLabel = document.createElement("label");
    reasonLabel.className = "dialogInput";
    reasonLabel.appendChild(document.createTextNode("Could not identify the record type."));
    menu.list.appendChild(reasonLabel);

    if (needsRecordType) {
      addBreak(menu.list);
      addBreak(menu.list);

      // Record Type
      let recordTypeSelector = addSelector(
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
      textInputField = addTextInput("refTitleInput", "Choose label: ", function (event) {
        refTitle = event.target.value;
        //console.log("set ref title to: " + refTitle);
      });
    }

    addBreak(menu.list);
    addBreak(menu.list);

    let button = document.createElement("button");
    button.className = "dialogButton";
    button.innerText = "Keep source with changes";
    button.onclick = function (element) {
      resolve();
    };
    menu.list.appendChild(button);

    endMainMenu(menu);
  });
}

function getUserProvidedVitals(source) {
  return new Promise((resolve, reject) => {
    let menu = beginMainMenu();

    let recordType = RT.Unclassified;
    let refTitle = "";
    let textInputField = undefined;

    let needsRecordType = true; // needs work
    let needsRefTitle = true; // needs work

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

    function addSelector(id, labelText, fillFunction, changeFunction) {
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

    function addTextInput(id, labelText, changeFunction) {
      let textInput = document.createElement("input");
      textInput.type = "text";
      textInput.id = id;
      textInput.className = "dialogTextInput";
      textInput.addEventListener("change", changeFunction);
      let label = document.createElement("label");
      label.className = "dialogInput";
      label.appendChild(document.createTextNode(labelText));
      addBreak(label);
      label.appendChild(textInput);
      menu.list.appendChild(label);

      return textInput;
    }

    // Explanation
    let reasonLabel = document.createElement("label");
    reasonLabel.className = "dialogInput";
    reasonLabel.appendChild(document.createTextNode("More details are required for narrative"));

    if (needsRecordType) {
      addBreak(menu.list);
      addBreak(menu.list);

      // Record Type
      let recordTypeSelector = addSelector(
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
      textInputField = addTextInput("refTitleInput", "Choose label: ", function (event) {
        refTitle = event.target.value;
        //console.log("set ref title to: " + refTitle);
      });
    }

    addBreak(menu.list);
    addBreak(menu.list);

    let button = document.createElement("button");
    button.className = "dialogButton";
    button.innerText = "Keep source with changes";
    button.onclick = function (element) {
      let result = {
        recordType: recordType,
        refTitle: refTitle,
      };
      resolve(result);
    };
    menu.list.appendChild(button);

    endMainMenu(menu);
  });
}

export { getUserClassification, getUserProvidedVitals };
