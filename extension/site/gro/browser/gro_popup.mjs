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
import { generalizeData } from "../core/gro_generalize_data.mjs";
import { buildCitation } from "../core/gro_build_citation.mjs";

async function setupGroPopupMenu(extractedData) {
  let input = {
    extractedData: extractedData,
    extractFailedMessage:
      "It looks like a GRO page but not a birth or death index with a succesfull search run.",
    generalizeFailedMessage:
      "It looks like a GRO page but does not contain the required data.",
    generalizeDataFunction: generalizeData,
    buildCitationFunction: buildCitation,
    siteNameToExcludeFromSearch: "gro",
  };
  setupSimplePopupMenu(input);
}

initPopup("gro", setupGroPopupMenu);
