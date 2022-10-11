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

function cleanText(inputText) {
  let text = inputText;
  if (text) {
    text = text.trim();
    text = text.replace(/\s+/g, " ");
    text = text.replace(/\s([,;.])/g, "$1");
  }
  return text;
}

function getRecordDataValueForKeys(result, keys) {
  for (let key of keys) {
    let value = result.recordData[key];
    if (value) {
      return value;
    }
  }
}

function buildFullName(result, forenameKeys, surnameKeys) {
  let forename = getRecordDataValueForKeys(result, forenameKeys);
  let surname = getRecordDataValueForKeys(result, surnameKeys);

  if (forename && surname) {
    return forename + " " + surname;
  } else if (surname) {
    return surname;
  } else if (forename) {
    return forename;
  }
}

function convertTableToObjectProperties(tableNode, tableObject) {
  let headerNodes = tableNode.querySelectorAll("thead > tr > th");

  // Not sure if this ever happens - it does on FreeCen
  if (headerNodes.length == 0) {
    headerNodes = tableNode.querySelectorAll("thead > tr > td");
  }

  if (headerNodes.length != 2) {
    return false;
  }

  let rowNodes = tableNode.querySelectorAll("tbody > tr");

  if (rowNodes.length == 0) {
    return false;
  }

  for (let index = 0; index < rowNodes.length; index++) {
    let rowNode = rowNodes[index];
    let cellNodes = rowNode.querySelectorAll("td");

    if (cellNodes.length != 2) {
      continue; // there can be a row with a single empty cell at end
    }

    let key = cleanText(cellNodes[0].textContent);
    let value = cleanText(cellNodes[1].textContent);

    key = key.replace("(Links to more information)", "").trim();

    tableObject[key] = value;
  }

  return true;
}

function extractData(document, url) {
  var result = {};
  result.url = url;

  result.success = false;

  const tables = document.querySelectorAll(
    "main.site__content table.table--bordered"
  );

  if (tables.length != 1) {
    return result;
  }

  let tableNode = tables[0];

  //console.log("freereg: extractData: tableNode is: " + tableNode);

  let captionNode = tableNode.querySelector("caption");
  if (captionNode && captionNode.childNodes.length > 0) {
    let firstChildNode = captionNode.childNodes[0];
    let text = firstChildNode.nodeValue;
    if (text) {
      text = text.replace(" entry", "").trim();
      result.recordType = text.toLowerCase();
    }
  }
  if (!result.recordType) {
    return result;
  }

  // build a simple object from table
  let tableObject = {};
  if (!convertTableToObjectProperties(tableNode, tableObject)) {
    console.log(
      "freereg: extractData: convertTableToObjectProperties on tableNode failed"
    );
    return result;
  }
  result.recordData = tableObject;

  if (result.recordType == "marriage") {
    let groomName = buildFullName(
      result,
      ["Groom forename"],
      ["Groom surname"]
    );
    let brideName = buildFullName(
      result,
      ["Bride forename"],
      ["Bride surname"]
    );

    if (groomName && brideName) {
      result.ambiguousPerson = true;
      result.ambiguousPersonArray = [
        { name: groomName + " (groom)", id: "groom" },
        { name: brideName + " (bride)", id: "bride" },
      ];
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
