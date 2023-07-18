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
  addMenuItem,
  displayMessageWithIconThenClosePopup,
  displayMessageWithIcon,
  keepPopupOpenForDebug,
} from "./popup_menu_building.mjs";
import { options } from "../options/options_loader.mjs";

//////////////////////////////////////////////////////////////////////////////////////////
// Citation
//////////////////////////////////////////////////////////////////////////////////////////

async function getLatestPersonData() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(["latestPersonData"], function (value) {
        resolve(value.latestPersonData);
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

async function savePersonData(data, getAllCitationsFunction) {
  if (getAllCitationsFunction) {
    if (options.addMerge_addPerson_includeAllCitations || options.addMerge_mergeEdit_includeAllCitations) {
      let response = await getAllCitationsFunction(data);
      if (!response.success) {
        const message = "Could not save person data because could not build all citations.";
        displayMessageWithIcon("warning", message, response.errorMessage);
        return;
      }
    }
  }

  data.timeStamp = Date.now();

  chrome.storage.local.set({ latestPersonData: data }, function () {
    console.log("latestPersonData is set to");
    console.log(data);

    let message1 = "Person Data saved to local storage.";
    let message2 = "";
    displayMessageWithIconThenClosePopup("check", message1, message2);
  });
}

function addSavePersonDataMenuItem(menu, data, getAllCitationsFunction = undefined) {
  addMenuItem(menu, "Save Person Data", function (element) {
    savePersonData(data, getAllCitationsFunction);
  });
}

export { addSavePersonDataMenuItem, getLatestPersonData };
