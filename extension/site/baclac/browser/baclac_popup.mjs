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

import { setupSimplePopupMenu } from "/base/browser/popup/popup_simple_base.mjs";
import { initPopup } from "/base/browser/popup/popup_init.mjs";
import { generalizeData } from "../core/baclac_generalize_data.mjs";
import { buildCitation } from "../core/baclac_build_citation.mjs";
import { RT } from "/base/core/record_type.mjs";
import { doSearch } from "/base/browser/popup/popup_search.mjs";
import { addMenuItem, doAsyncActionWithCatch } from "/base/browser/popup/popup_menu_building.mjs";
import { options } from "/base/browser/options/options_loader.mjs";

async function baclacDoSearch(input) {
  doAsyncActionWithCatch("Canada Library and Archives Search", input, async function () {
    let loadedModule = await import(`../core/baclac_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

async function baclacSearchOldCensus(data) {
  let ed = data.extractedData;
  let gd = data.generalizedData;
  const input = { typeOfSearch: "SameOldCensus", extractedData: ed, generalizedData: gd, options: options };
  baclacDoSearch(input);
}

async function baclacSearchOldRecord(data) {
  let ed = data.extractedData;
  let gd = data.generalizedData;
  const input = { typeOfSearch: "SameOldCollection", extractedData: ed, generalizedData: gd, options: options };
  baclacDoSearch(input);
}

async function setupBaclacPopupMenu(extractedData) {
  let extractFailedMessage =
    "It looks like a Library and Archives Canada page but not an Entry Information page.\n\nTo get to the Entry Information page click the red rectangle with 'Info' in it next to the search result that you wish to cite.";
  let generalizeFailedMessage =
    "It looks like a Library and Archives Canada page but does not contain the required data.";
  if (extractedData.isFrenchPage && !extractedData.success) {
    extractFailedMessage =
      "This looks like a page in French/Français. " +
      "Sourcer does not currently support extracting the data from the French language site. " +
      "Try switching to the English version of the page.";
  }
  let input = {
    extractedData: extractedData,
    extractFailedMessage: extractFailedMessage,
    generalizeFailedMessage: generalizeFailedMessage,
    generalizeDataFunction: generalizeData,
    siteNameToExcludeFromSearch: "baclac",
  };

  if (extractedData.isOldPageStyle) {
    input.customMenuFunction = function (menu, data) {
      let gd = data.generalizedData;
      if (gd.recordType == RT.Census) {
        addMenuItem(menu, "Search new LAC site for this census record", function (element) {
          baclacSearchOldCensus(data);
        });
      } else {
        addMenuItem(menu, "Search new LAC site for this record", function (element) {
          baclacSearchOldRecord(data);
        });
      }
    };
  } else {
    input.buildCitationFunction = buildCitation;
  }

  setupSimplePopupMenu(input);
}

initPopup("baclac", setupBaclacPopupMenu);
