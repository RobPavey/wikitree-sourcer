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
import { generalizeData, regeneralizeData } from "../core/wiewaswie_generalize_data.mjs";
import { buildCitation } from "../core/wiewaswie_build_citation.mjs";
import { buildHouseholdTable } from "/base/core/table_builder.mjs";

async function setupWiewaswiePopupMenu(extractedData) {
  let input = {
    extractedData: extractedData,
    extractFailedMessage:
      "It looks like a WieWasWie page but either not a detail page or not a search results page with an entry expanded.\n\nOn the search results page it will use the first expanded result.",
    generalizeFailedMessage: "It looks like a WieWasWie page but does not contain the required data.",
    generalizeDataFunction: generalizeData,
    regeneralizeFunction: regeneralizeData,
    buildCitationFunction: buildCitation,
    buildHouseholdTableFunction: buildHouseholdTable,
    siteNameToExcludeFromSearch: "wiewaswie",
  };
  setupSimplePopupMenu(input);
}

initPopup("wiewaswie", setupWiewaswiePopupMenu);
