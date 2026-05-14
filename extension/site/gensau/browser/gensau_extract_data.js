/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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

// No imports or requires allowed. See docs/dev_notes/extract_data_design

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  let headingElement = document.querySelector("div.header div.heading");
  if (!headingElement) {
    return result;
  }

  let headingH2 = headingElement.querySelector("h2");
  if (headingH2) {
    const firstTextNode = headingH2.firstChild;
    if (firstTextNode) {
      result.titleSurname = firstTextNode.textContent;
    }
    const spanElement = headingH2.querySelector("span");
    if (spanElement) {
      let givenNames = spanElement.textContent;
      if (givenNames.startsWith(", ")) {
        givenNames = givenNames.substring(2).trim();
      }
      if (givenNames) {
        result.titleGivenNames = givenNames;
      }
    }
  }

  const dbElement = headingElement.querySelector("p");
  if (dbElement) {
    let dbText = dbElement.textContent;
    // example: Found in 'Birth Registrations' Database
    const regex = /^\s*Found\s+in\s+'([^']+)'\s+Database\s*$/i;
    if (regex.test(dbText)) {
      let dbName = dbText.replace(regex, "$1");
      if (dbName) {
        result.databaseName = dbName;
      }
    }
  }

  let headingSubtitle = headingElement.querySelector("p");

  const dataRows = document.querySelectorAll("form div.gsa_userdetail > div.gsa_row");
  if (dataRows.length < 1) {
    return result;
  }

  result.recordData = {};

  for (let dataRowElement of dataRows) {
    let fieldNameElement = dataRowElement.querySelector("span.gsa_field_name");
    let fieldValueElement = dataRowElement.querySelector("span.gsa_field_value");

    if (fieldNameElement && fieldValueElement) {
      let isDisabled = false;
      let disabledElement = fieldValueElement.querySelector("a.disabled1");
      if (disabledElement) {
        isDisabled = true;
      }
      let name = fieldNameElement.textContent;
      let value = fieldValueElement.textContent;
      if (value == "(members only)") {
        isDisabled = true;
      }
      if (!isDisabled && value != "Not Recorded") {
        if (name.endsWith(":")) {
          name = name.substring(0, name.length - 1);
        }
        result.recordData[name] = value;
      }
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
