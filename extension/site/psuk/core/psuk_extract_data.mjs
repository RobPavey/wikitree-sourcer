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

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  function addInputValue(id, resultFieldName) {
    let element = document.getElementById(id);
    if (element) {
      let value = element.value;
      if (value) {
        result[resultFieldName] = value;
      }
    }
  }
  const keyToResultField = {
    "Last name": "lastName",
    "First name (Optional)": "firstName",
    "Year of death": "deathYear",
    "Was the person a soldier": "wasSoldier",
    "Last name": "lastName",
    "Last name": "lastName",
    "Last name": "lastName",
    "Last name": "lastName",
    "Last name": "lastName",
    "Last name": "lastName",
  };

  let summaryList = document.querySelector("#main-content > dl.govuk-summary-list");
  if (summaryList) {
    let recordData = {};
    let rows = summaryList.querySelectorAll("div.govuk-summary-list__row");
    for (let row of rows) {
      let keyElement = row.querySelector("dt.govuk-summary-list__key");
      let valueElement = row.querySelector("dd.govuk-summary-list__value");
      if (keyElement && valueElement) {
        let key = keyElement.textContent;
        let value = valueElement.textContent;
        if (key && value) {
          recordData[key] = value;
        }
      }

      result.recordData = recordData;
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
