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

function convertTableToObjectPropertiesInVariant(censusTableNode, censusTableObject) {
  let rowNodes = censusTableNode.querySelectorAll("tbody > tr");

  if (!rowNodes || rowNodes.length == 0) return false;

  for (let index = 0; index < rowNodes.length; index++) {
    let rowNode = rowNodes[index];
    let cellNodes = rowNode.querySelectorAll("td");
    if (!cellNodes || cellNodes.length != 2) {
      return false;
    }

    let key = cleanText(cellNodes[0].textContent);
    let value = cleanText(cellNodes[1].textContent);
    censusTableObject[key] = value;
  }

  return true;
}

function convertTableToObjectProperties(censusTableNode, censusTableObject) {
  let censusHeaderNodes = censusTableNode.querySelectorAll("thead > tr > th");

  // in 1911 census there are td's in the thead
  if (censusHeaderNodes.length == 0) {
    censusHeaderNodes = censusTableNode.querySelectorAll("thead > tr > td");
  }

  // it could be a different layout where there is no heading row and the field names
  // are in the left column
  if (censusHeaderNodes.length == 0) {
    return convertTableToObjectPropertiesInVariant(censusTableNode, censusTableObject);
  }

  let censusBodyNodes = censusTableNode.querySelectorAll("tbody > tr > td");

  if (censusHeaderNodes.length != censusBodyNodes.length) return false;

  for (let index = 0; index < censusHeaderNodes.length; index++) {
    let key = cleanText(censusHeaderNodes[index].textContent);
    let value = cleanText(censusBodyNodes[index].textContent);
    censusTableObject[key] = value;
  }

  return true;
}

function setSelectedFromUrl(url, householdMembers) {
  // On iPhone sometimes the selected person is not highlighted in bold
  // It is sometimes possible to work out the selected person from the URL
  // It can be in different forms. e.g.:
  // https://www.freecen.org.uk/search_records/616ee428f493fda018407a1b
  // https://www.freecen.org.uk/search_records/616ee428f493fda018407a1b/ann-gadsby-1891-lincolnshire-grantham-1882-?locale=en
  // If it is the latter we can work out who the selected person should be.
  let urlExtraData = url.replace(/https\:\/\/www.freecen.org.uk\/search_records\/[^\/]+\/(.*)$/, "$1");
  if (urlExtraData && urlExtraData != url) {
    //console.log("urlExtraData is: " + urlExtraData);
    // found the extra data that could identify the person.
    let personString = urlExtraData;
    let queryIndex = urlExtraData.indexOf("?");
    if (queryIndex != -1) {
      personString = urlExtraData.substring(0, queryIndex);
    }
    //console.log("personString is: " + personString);
    // the person string has a variable number of parts depending on how many forenames
    // e.g.: edith-annie-smith-1891-lincolnshire-louth-1880-
    // or    ann-gadsby-1891-lincolnshire-grantham-1882-
    // The two place parts are country and district of the census (not birth)
    // So the only useful parts to ID the person are the forename and surname plus the birth date.
    let namePart = personString.replace(/([a-z\-]+)\-\d+\-.*$/, "$1");
    let censusDate = personString.replace(/[a-z\-]+\-(\d+)\-.*$/, "$1");
    let birthDate = personString.replace(/[a-z\-]+\-\d+\-[a-z\-]+\-(\d+)\-.*$/, "$1");
    if (
      namePart &&
      namePart != personString &&
      birthDate &&
      birthDate != personString &&
      censusDate &&
      censusDate != personString
    ) {
      //console.log("namePart is: " + namePart);
      //console.log("birthDate is: " + birthDate);
      //console.log("censusDate is: " + censusDate);

      namePart = namePart.toLowerCase(); // should be already
      while (namePart[namePart.length - 1] == "-") {
        namePart - namePart.substring(0, namePart.length - 1);
      }
      let lastDashIndex = namePart.lastIndexOf("-");
      if (lastDashIndex != -1) {
        let surname = namePart.substring(lastDashIndex + 1);
        let forenames = namePart.substring(0, lastDashIndex);
        forenames = forenames.replace(/\-/g, " ").trim();

        //console.log("surname is: " + surname);
        //console.log("forenames is: " + forenames);

        let censusYearNum = parseInt(censusDate);
        let birthYearNum = parseInt(birthDate);
        if (censusYearNum != NaN && birthYearNum != NaN) {
          let expectedAge = censusYearNum - birthYearNum;
          let expectedAgeString = expectedAge.toString();
          //console.log("expectedAgeString is: " + expectedAgeString);

          for (let member of householdMembers) {
            //console.log("member.Surname is: " + member.Surname);
            //console.log("member.Forenames is: " + member.Forenames);
            //console.log("member.Age is: " + member.Age);
            if (member.Surname && member.Forenames && member.Age) {
              if (
                member.Surname.toLowerCase() == surname &&
                member.Forenames.toLowerCase() == forenames &&
                member.Age == expectedAgeString
              ) {
                //console.log("Setting isSelected");
                member.isSelected = true;
                break;
              }
            }
          }
        }
      }
    }
  }
}

function extractData(document, url) {
  var result = {};
  result.url = url;

  result.success = false;

  const tables = document.querySelectorAll("main.site__content table.table--bordered");

  // we expect 2 tables in most censuses, one for census details and one for household
  // but in 1911 there are three
  let censusTableNode = undefined;
  let censusTableNode2 = undefined;
  let houseHoldTableNode = undefined;

  //console.log("freecen: extractData: tables.length is: " + tables.length);

  if (tables.length == 2) {
    censusTableNode = tables[0];
    houseHoldTableNode = tables[1];
  } else if (tables.length == 3) {
    censusTableNode = tables[0];
    censusTableNode2 = tables[1];
    houseHoldTableNode = tables[2];
  } else {
    return result;
  }

  //console.log("freecen: extractData: censusTableNode is: " + censusTableNode);
  //console.log("freecen: extractData: censusTableNode2 is: " + censusTableNode2);
  //console.log("freecen: extractData: houseHoldTableNode is: " + houseHoldTableNode);

  // build a simple object from first table
  let censusTableObject = {};
  if (!convertTableToObjectProperties(censusTableNode, censusTableObject)) {
    console.log("freecen: extractData: convertTableToObjectProperties on censusTableNode failed");
    return result;
  }

  if (censusTableNode2) {
    if (!convertTableToObjectProperties(censusTableNode2, censusTableObject)) {
      console.log("freecen: extractData: convertTableToObjectProperties on censusTableNode2 failed");
      return result;
    }
  }

  //console.log("freecen: extractData: converted tables");

  result.censusDetails = censusTableObject;

  let householdHeaderNodes = houseHoldTableNode.querySelectorAll("thead > tr > th");
  // in 1911 census there are td's in the thead
  if (householdHeaderNodes.length == 0) {
    householdHeaderNodes = houseHoldTableNode.querySelectorAll("thead > tr > td");
  }

  //console.log("freecen: extractData: householdHeaderNodes.length is: " + householdHeaderNodes.length);

  if (householdHeaderNodes.length == 0) return result;

  let householdHeadings = [];
  for (let headerNode of householdHeaderNodes) {
    let heading = cleanText(headerNode.textContent);
    householdHeadings.push(heading);
  }

  let householdMembers = [];
  let householdRowNodes = houseHoldTableNode.querySelectorAll("tbody > tr");
  if (householdRowNodes.length == 0) return result;

  let foundSelected = false;
  for (let rowIndex = 0; rowIndex < householdRowNodes.length; rowIndex++) {
    let rowNode = householdRowNodes[rowIndex];
    let cellNodes = rowNode.querySelectorAll("td");

    if (cellNodes.length == 0) continue; // there can be empty rows on iPhone
    if (cellNodes.length != householdHeaderNodes.length) return result;

    let member = {};
    for (let colIndex = 0; colIndex < cellNodes.length; colIndex++) {
      let cellNode = cellNodes[colIndex];

      let key = householdHeadings[colIndex];
      let value = cleanText(getTextOfImmediateTextNodes(cellNode));
      member[key] = value;

      let classNames = cellNode.className;
      if (!foundSelected && classNames && classNames.includes("bold")) {
        member.isSelected = true;
        foundSelected = true;
      }
    }

    householdMembers.push(member);
  }

  if (!foundSelected && url) {
    setSelectedFromUrl(url, householdMembers);
  }

  result.householdHeadings = householdHeadings;
  result.householdMembers = householdMembers;

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
