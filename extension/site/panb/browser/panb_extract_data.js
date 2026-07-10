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

// Support of additional PANB databases will likely require this function
function getSelectedRow(document) {
  const highlightStyle = "font-weight: bold; font-style: italic";
  const elResultsTable = document.querySelector("table.Details");
  if (elResultsTable) {
    const selectedRow = elResultsTable.querySelector("div.detail-columns[style='" + highlightStyle + "']");
    return selectedRow;
  }
}

function extractTwoRowTable(document) {
  const table = document.querySelector('table.table.table-sm.mt-4.w-auto');
  const headers = [...table.querySelectorAll('thead tr th')]
  .map(th => th.textContent.trim());

  const values = [...table.querySelectorAll('tbody tr td')]
  .map(td => parseInt(td.textContent.trim(), 10));

const result = { headers, values };

return result;
}

function getTextOfImmediateTextNodes(element) {
  let text = "";
  for (let child of element.childNodes) {
    if (child.nodeType === 3) {
      // Node.TEXT_NODE not available in Node.js
      text += child.textContent;
    }
  }

  return text;
}

function extractCardBodyData(cardBodyElement, leadSuffix) {
  const result = {};
 
  // Select all label divs
  const labels = cardBodyElement.querySelectorAll(".small.text-muted, .small.text-muted.mt-2");

  labels.forEach((labelDiv) => {
    // Extract ONLY text nodes (ignore buttons, icons, etc.)
    let label = Array.from(labelDiv.childNodes)
      .filter((node) => node.nodeType === 3)              //Node.TEXT_NODE)
      .map((node) => node.textContent.trim())
      .join(" ")
      .trim();
    if (!label.startsWith("Need") && !label.startsWith("Have")) {
      if (label.startsWith("Date ")) {
        label = "Date";
      }
      else if (leadSuffix == "A") {
        if (label == "Child") {
          label = "Name";
        }
        //else if (label.startsWith("Place of Birth")) {
        //  label = "Place";
        //}
      }
      else if (leadSuffix == "B") {
        if (label == "Spouse") {
          label = "Married";
        }
      }
      else if (leadSuffix == "C") {
        if (label.startsWith("Registration")) {
          label = "Registration";
        }
        else if (label == 'Where Killed' || label == 'Where Died') {
          label = "Place";
        }
        else if (label.startsWith("Place of Death")) {
          label = "Place";
        }        
      }

      const valueDiv = labelDiv.nextElementSibling;

      // Extract the main value from <strong>
      const strong = valueDiv.querySelector("strong");
      let value = strong ? strong.textContent.trim() : valueDiv.textContent.trim();

      // Optional: extract link if present
      //const link = valueDiv.querySelector('a')?.href || null;

      if (value.startsWith("-")) {
        value = "";
      }
      result[label] = value; // {value, link };
    }
  });
  return result;
}

function extractData(document, url) {
  var result = {};
  if (url) {
    result.url = url;
  }
  result.success = false;

  // At this time we will restrict data extraction to NB Vital Statistics from Government Records (RS141)
  let indexName = "";
  let suffix = "";
  result.databaseID = "this is not";
  let startIndexName = url.indexOf("141");
  if (startIndexName < 0) {
    //  This is not a New Brunswick Provincial Archives Vital Statistics Database.
    return result;
  }

  let isNewURL = false;
  let leadSuffix = "";
  let endSuffix = url.indexOf(".aspx", startIndexName);
  if (endSuffix < 0) {
    endSuffix = url.indexOf("/", startIndexName);
    if (endSuffix < 0) {
      //  This is not a New Brunswick Provincial Archives Vital Statistics Database.
      return result;
    }
    isNewURL = true;
    let tempSuffix = url.slice(startIndexName + 3, endSuffix);
    if(!tempSuffix || tempSuffix.length < 1) {
      //  This is not a New Brunswick Provincial Archives Vital Statistics Database.
      return result;
    }
    leadSuffix = tempSuffix[0].toUpperCase();
    indexName = "RS141" + leadSuffix + tempSuffix.slice(1);
  }
  else {
    indexName = "RS" + url.slice(startIndexName, endSuffix);
  }
  suffix = indexName.slice(5);
  //result.tableTitle = suffix;

  const choices = new Set(["A1b", "A5", "A2/2", "A2_2", "B5", "B7", "C4", "C5", "C1", "C6"]); // more to be added later

  if (suffix == "A2_2" || suffix == "A2") {
    suffix = "A2/2";
    indexName = "RS141" + suffix;
  }

  // RS141C6 has a different structure for its Url
  if (suffix == "C6/Details") {
    suffix = "C6";
    indexName = "RS141" + suffix;
 }

  if (!choices.has(suffix)) {
    // not yet a supported New Brunswick Provincial Archives Federated Database site.
    result.databaseID = indexName + " is not yet a supported";
    return result;
  }

  result.databaseID = "RS141" + suffix;
 
  if (isNewURL) {
    result.sourceTitle = "Provincial Archives of New Brunswick; Vital Statistics (RS141)";
  }
  else {
    result.sourceTitle = "New Brunswick Provincial Archives; Vital Statistics from Government Records (RS141)";
  }
  let recordTableTitle = "";
  switch (suffix) {
    case "A5":
      recordTableTitle = "Index to Provincial Registrations of Births";
      break;
    case "A1b":
      recordTableTitle = "Index to Late Registration of Births";
      break;
    case "A1c":
      recordTableTitle = "Index to Late Registration of Births: County Series";
      break;
    case "A2/2":
      recordTableTitle = "Index to County Birth Registers";
      break;
    case "B7":
      recordTableTitle = "Index to New Brunswick Marriages";
      break;
    case "B5":
      recordTableTitle = "Index to Late Registration of Marriages";
      break;
    case "C4":
      recordTableTitle = "Provincial Returns of Deaths";
      break;
    case "C5":
      recordTableTitle = "Index to Death Certificates";
      break;
    case "C1":
      recordTableTitle = "Index to County Death Registers";
      break;
    case "C6":
    recordTableTitle = "Index to Death registration of soldiers, 1941-1947";
  }
  result.tableTitle = recordTableTitle + " (" + indexName + ")";

  result.recordData = {};

  // Check to see if this is the new PANB  RS141 web page format
  const panbCard = document.querySelector(".card-body");

  if (panbCard) {
    result.webpageFormat = 202606;
    result.recordData = extractCardBodyData(panbCard, leadSuffix);
  
  // we need to extract the small table of data from the web page for RS141CA2/2
    if (suffix == "A2/2") {
      const {headers, values} = extractTwoRowTable(document);
      let rowCount = values.length;
      if (rowCount >= 2) {
        for (let index = 0; index < rowCount; index++) {
          result.recordData[headers[index]] = values[index];
        }
      }
    }
    result.numberTableEntries = Object.keys(result.recordData).length;
  }
  else {

    // We expect to find a single table of 2 to 3 columns and up to 12 rows
    let directTables = document.querySelector("table.Details");

    if (!directTables) {
      // No record tables were found.\nNB Provincial Archive may have been changed.
      result.databaseID = indexName + "has lack of required table stucture and is no longer a supported";
      return result;
    }
  
    const tables = Array.from(document.body.querySelectorAll("table"));
    const embededTable = tables[0];

    // If the first row starts with "Name" we will recognize the table as from a standard RS141 Vital Record
    const firstRow = embededTable.rows[0];
    const tableRowLength = firstRow.cells.length;
    const firstCell = firstRow.cells[0].textContent.trim();
    if (firstCell != "Name") {
      // This table does not have the expected RS141 record construction. NB Provincial Archive may have been changed.;
      result.databaseID = indexName + "table stucture was changed and is no longer a supported";
      return result;
    }

    //  Here we use approach of the working table being created as a pair of arrays of length equal to the number of rows in the first 2 columns in the table on the web page
    const columnLength = embededTable.rows.length;
    result.webpageFormat = 202601;
    result.recordData = {};

    for (let index = 0; index < columnLength; index++) {
      let nextRow = embededTable.rows[index];
      let headingNode = nextRow.cells[0];
      let valueNode = nextRow.cells[1];
      let heading = headingNode.textContent.trim();
      let value = valueNode.textContent.trim();
      if (heading) {
        result.recordData[heading] = value;
      }
    }
    result.numberTableEntries = columnLength;
  }

  // finally check if an image is attached
  const elems = Array.from(document.body.querySelectorAll('a[href$="jpg"]'));
  result.hasImage = false;
  for (let elem of elems) {
    if (elem.matches('a[href$="jpg"]')) {
      let frontIndex = elem.href.indexOf("App_Handler");
      let backIndex = elem.href.indexOf("Digit");
      result.imageUrl = elem.href.slice(0, frontIndex) + elem.href.slice(backIndex);
      result.hasImage = true;
      break;
    }
  }

  // This is where we load the return results
  if (!result.hasImage) {
    result.imageUrl = "";
  }
  const suffixType = suffix.slice(0, 1);
  if (suffixType == "A") {
    result.eventType = "Birth";
  }
  else if (suffixType == "B") {
    result.eventType = "Marriage";
    result.recordData["Sex"] = "";
    result.numberTableEntries += 1;
  }
  else if (suffixType == "C") {
    result.eventType = "Death";
  }
  else {
    result.eventType = "Unclassified";
  }
  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
