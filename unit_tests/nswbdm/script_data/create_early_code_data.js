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

import fs from "fs";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

async function createEarlyCodeData() {
  let dirPath = "unit_tests/nswbdm/script_data/";
  const htmlPath = dirPath + "early_church_and_district_codes.html";

  let dom = undefined;
  try {
    dom = await JSDOM.fromFile(htmlPath);
  } catch (e) {
    console.log("Error:", e.stack);
    console.log("Failed to read input file");
    return;
  }
  const doc = dom.window.document;

  let rowElements = doc.querySelectorAll("div.nsw-accordion__content table tbody > tr");

  let earlyChurchCodes = {};

  for (let rowElement of rowElements) {
    let cellParaItems = rowElement.querySelectorAll("td > p");
    if (cellParaItems.length == 3) {
      let code = cellParaItems[0].textContent.trim();
      let parishCircuitDistrict = cellParaItems[2].textContent.trim();
      if (code && parishCircuitDistrict) {
        earlyChurchCodes[code] = parishCircuitDistrict;
      }
    }
  }

  //console.log(categories);
  //console.log(collections);

  // write out result file.
  const resultPath = dirPath + "generated_early_code_data.js";

  let earlyChurchCodesJsonString = JSON.stringify(earlyChurchCodes, null, 2);

  let outputString = "const earlyChurchCodes = " + earlyChurchCodesJsonString + ";\n\n";

  try {
    fs.writeFileSync(resultPath, outputString, { mode: 0o755 });
  } catch (err) {
    // An error occurred
    //console.error(err);
    console.log("Failed to write output test file: " + resultPath);
  }
}

createEarlyCodeData();
