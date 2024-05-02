/*
MIT License

Copyright (c) 2024 Robert M Pavey

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

import { setupSimplePopupMenu } from "/base/browser/popup/popup_simple_base.mjs";
import { addMenuItem, displayTextMenu } from "/base/browser/popup/popup_menu_building.mjs";
import { initPopup } from "/base/browser/popup/popup_init.mjs";
import { generalizeData } from "../core/vicbdm_generalize_data.mjs";
import { buildCitation } from "../core/vicbdm_build_citation.mjs";
import { VicbdmEdReader } from "../core/vicbdm_ed_reader.mjs";

async function suggestPlaceNames(menu, data) {
  let placeNamesModule = await import("../core/vicbdm_place_names.mjs");
  if (!placeNamesModule) {
    return;
  }

  let edReader = new VicbdmEdReader(data.extractedData);

  let placeName = edReader.getCitationPlace();

  //console.log("suggestPlaceNames, placeName is:");
  //console.log(placeName);

  let realNames = [];
  if (placeName) {
    const ausSuffix = ", Australia";
    if (placeName.endsWith(ausSuffix)) {
      placeName = placeName.substring(0, placeName.length - ausSuffix.length);
    }

    realNames = placeNamesModule.mapVicbdmPlaceNameToRealPlaceNames(placeName);
  }

  let displayString = "";
  for (let name of realNames) {
    displayString += name + "\n";
  }

  let backFunction = function () {
    setupVicbdmPopupMenu(data.extractedData);
  };

  let titleText = "Possible place names meant by '" + placeName + "':";
  displayTextMenu(titleText, displayString, backFunction);
}

async function setupVicbdmPopupMenu(extractedData) {
  let input = {
    extractedData: extractedData,
    extractFailedMessage: "It looks like a Victoria BDM page but not a record page.",
    generalizeFailedMessage: "It looks like a Victoria BDM page but does not contain the required data.",
    generalizeDataFunction: generalizeData,
    buildCitationFunction: buildCitation,
    siteNameToExcludeFromSearch: "vicbdm",
  };

  input.customMenuFunction = function (menu, data) {
    addMenuItem(menu, "Suggest place names...", function (element) {
      suggestPlaceNames(menu, data);
    });
  };

  setupSimplePopupMenu(input);
}

initPopup("vicbdm", setupVicbdmPopupMenu);
