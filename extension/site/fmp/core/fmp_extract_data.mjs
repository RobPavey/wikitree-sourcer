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

function cleanText(text) {
  if (!text) {
    return "";
  }

  text = text.replace(/\s+/g, " "); // eliminate nbsp and multiple spaces etc

  text = text.trim();

  return text;
}

function cleanLabel(text) {
  if (!text) {
    return "";
  }

  text = text.replace(/\s/g, " "); // eliminate nbsp etc
  text = text.trim();

  // remove trailing :
  text = text.replace(/\s*\:+$/, "");

  return text;
}

function extractUrlInfo(result, url) {
  // Devon baptisms
  // https://search.findmypast.co.uk/search-world-records/devon-baptisms
  // https://www.findmypast.co.uk/search/results?datasetname=devon+baptisms&sid=103&firstname=john&firstname_variants=true&lastname=davis
  // https://www.findmypast.co.uk/transcript?id=GBPRS%2FB%2F31077260%2F1
  // GBPRS B 31077260 1
  // https://www.findmypast.co.uk/transcript?id=GBPRS%2FB%2F31431126%2F1
  // GBPRS B 31431126 1
  // https://www.findmypast.co.uk/transcript?id=GBPRS%2FDEV%2FBAP%2F264915
  // GBPRS DEV BAP 264915

  // Birth reg:
  // https://search.findmypast.co.uk/search-world-records/england-and-wales-births-1837-2006
  // https://www.findmypast.co.uk/transcript?id=BMD%2FB%2F1852%2F3%2FIS%2F000879%2F027
  // BMD B 1852 3 IS 000879 027

  result.url = url;

  let doubleSlashIndex = url.indexOf("//");
  if (doubleSlashIndex == -1) {
    return false;
  }

  let slashIndex = url.indexOf("/", doubleSlashIndex + 2);
  if (slashIndex == -1) {
    return false;
  }

  let protocol = url.substring(0, doubleSlashIndex - 1);
  let fulldomain = url.substring(doubleSlashIndex + 2, slashIndex);
  let remainder = url.substring(slashIndex + 1);

  let domainDotIndex = fulldomain.indexOf(".");
  if (domainDotIndex == -1) {
    return false;
  }
  result.subDomain = fulldomain.substring(0, domainDotIndex);
  result.domain = fulldomain.substring(domainDotIndex + 1);

  let queryIndex = remainder.indexOf("?");
  if (queryIndex == -1) {
    // could be a tree like:
    // https://tree.findmypast.co.uk/#/trees/918c5b61-df62-4dec-b840-31cad3d86bf9/1181965009/profile
    if (/\#\/trees\/[a-f0-9\-]+\/[0-9]+\/profile/.test(remainder)) {
      result.urlPath = remainder;
      result.urlTreeId = remainder.replace(/\#\/trees\/([a-f0-9\-]+)\/[0-9]+\/profile/i, "$1");
      result.urlProfileId = remainder.replace(/\#\/trees\/[a-f0-9\-]+\/([0-9]+)\/profile/i, "$1");
      return true;
    }
    return false;
  }

  result.urlPath = remainder.substring(0, queryIndex);
  result.urlParameters = remainder.substring(queryIndex + 1);

  // It could still be a family tree found by searching family trees
  if (remainder.startsWith("search-family-tree")) {
    result.urlTreeId = result.urlParameters.replace(/.*id=([a-f0-9\-]+).*/i, "$1");
    result.urlProfileId = result.urlParameters.replace(/.*ref=([a-f0-9\-]+).*/i, "$1");
  }

  return true;
}

function reorderRecordData(result) {
  // often the web page has the record data in two columns and recordData
  // has them interleaved
  let keys = Object.keys(result.recordData);

  if (keys.length > 2) {
    if (keys[0].startsWith("First name") && keys[2].startsWith("Last name")) {
      // it is interleaved
      let leftKeys = [];
      let rightKeys = [];
      let left = true;
      for (let key of keys) {
        if (left) {
          leftKeys.push(key);
        } else {
          rightKeys.push(key);
        }
        left = !left;
      }

      let newRecordData = Object.create(null);

      for (let key of leftKeys) {
        newRecordData[key] = result.recordData[key];
      }
      for (let key of rightKeys) {
        newRecordData[key] = result.recordData[key];
      }

      result.recordData = newRecordData;
    }
  }
}

// From: https://stackoverflow.com/questions/3955803/chrome-extension-get-page-variables-in-content-script
function retrieveWindowVariables(document, variables) {
  var ret = {};

  var scriptContent = "";
  for (var i = 0; i < variables.length; i++) {
    var currVariable = variables[i];
    scriptContent +=
      "if (typeof " +
      currVariable +
      " !== 'undefined') $('body').attr('tmp_" +
      currVariable +
      "', JSON.stringify(" +
      currVariable +
      "));\n";
  }

  var script = document.createElement("script");
  script.id = "tmpScript";
  script.appendChild(document.createTextNode(scriptContent));
  (document.body || document.head || document.documentElement).appendChild(script);

  for (var i = 0; i < variables.length; i++) {
    var currVariable = variables[i];
    let bodyNode = document.querySelector("body");
    if (bodyNode) {
      let variable = bodyNode.getAttribute("tmp_" + currVariable);
      ret[currVariable] = JSON.parse(variable);
      bodyNode.removeAttribute("tmp_" + currVariable);
    }
  }

  (document.body || document.head || document.documentElement).removeChild(script);

  //console.log("retrieveWindowVariables: ret is:");
  //console.log(ret);

  return ret;
}

function camelCaseToSpaced(name) {
  let result = name;

  // special cases
  // FirstNameS => First name(s)
  // OtherHouseholdMemberSFirstNameS => Other household member's first name(s)
  function replacerForApostropheCase(match, p1, p2, offset, string) {
    // p1 is nondigits, p2 digits, and p3 non-alphanumerics
    return p1 + "'s " + p2.toLowerCase();
  }
  result = result.replace(/([a-z])S([A-Z])/g, replacerForApostropheCase);

  result = result.replace(/([a-z])S$/, "$1(s)");

  function replacer(match, p1, p2, offset, string) {
    // p1 is nondigits, p2 digits, and p3 non-alphanumerics
    return p1 + " " + p2.toLowerCase();
  }
  result = result.replace(/([a-z])([A-Z])/g, replacer);

  return result;
}

function createRecordDataFromImageTranscriptData(transcriptData, result) {
  const fieldsToExclude = [
    "",
    "HouseHoldID",
    "LatLon",
    "LatLonLevel",
    "LoggedIn",
    "RecordMetadataId",
    "RecordType",
    "RedactedFlag",
    "TranscriptImageOrPdf",
    "Version",
    "Where",
    "Year",
  ];

  result.recordData = {};

  for (let field in transcriptData) {
    if (!fieldsToExclude.includes(field)) {
      let fieldName = camelCaseToSpaced(field);
      result.recordData[fieldName] = transcriptData[field];
    }
  }
}

function isImageForOneHousehold(result) {
  if (result.collection == "1921 Census Of England & Wales" || result.collection == "1911 Census For England & Wales") {
    return true;
  }

  return false;
}

function extractImageData(document, result) {
  // Note that this worked when the 1921 census was first released on FMP.
  // This allowed us to extract the transcript if only the image had been purchased.
  // It also worked on other FMP images. Shortly after I implemented this code though
  // the FMP site was changed to remove this transcript information from all images.

  // But now it doesn't work and also it gets errors (at least in Chrome on MV3):
  //   Refused to execute inline script because it violates the following Content Security Policy directive:
  //   "script-src 'self'". Either the 'unsafe-inline' keyword,
  //   a hash ('sha256-hUIdItGO7bq6TJ9/1RoKfq6cRSjc14muEFt/ySgLhBI='),
  //   or a nonce ('nonce-...') is required to enable inline execution.

  /*
  var windowVariables = retrieveWindowVariables(document, ["dataLayer", ]);
  let dataLayer = windowVariables.dataLayer;

  if (dataLayer) {
    //console.log("extractImageData: dataLayer.length is:");
    //console.log(dataLayer.length);

    let transcriptData = undefined;

    for (let dataLayerObj of dataLayer) {
      if (dataLayerObj.RecordMetadataId) {
        transcriptData = dataLayerObj;
        break;
      }
    }

    if (transcriptData) {
      //console.log("extractImageData: transcriptData is:");
      //console.log(transcriptData);
      createRecordDataFromImageTranscriptData(transcriptData, result);
      if (transcriptData.RecordSet) {
        result.collection = transcriptData.RecordSet;
      }
      // since we don't have a heading we want this for the year
      if (transcriptData.Year) {
        result.year = transcriptData.Year;
      }
    }
  }

  // If this is a census with only one household per image then we can create a 
  // starting point for a transcript
  let transcriptsNode = document.querySelectorAll("#transcriptsOnImage > a");

  //console.log("extractImageData: transcriptsQ length is:" + transcriptsQ.length);

  if (transcriptsNode.length > 0 && isImageForOneHousehold(result)) {
    result.household = Object.create(null);
    result.household.headings = [];
    result.household.members = [];

    result.household.headings.push("Name");

    for (let transcriptIndex = 0; transcriptIndex < transcriptsNode.length; transcriptIndex++) {
      let transcriptNode = transcriptsNode[transcriptIndex];
      let iconNode = transcriptNode.querySelector("div.linked__transcript__card__icon");
      let textNode = transcriptNode.querySelector("div.linked__transcript__card__text");

      if (textNode) {
        let name = textNode.textContent;
        let isSelected = icon && iconNode.getAttribute("role") == "selected"; 

        if (name) {
          let householdMember = Object.create(null);
          householdMember["Name"] = name;
          householdMember.isSelected = isSelected;
          result.household.members.push(householdMember);
        }
      }
    }
  }

  console.log("result of extractData on FMP");
  console.log(result);
  */

  result.success = true; // it is OK for an image to have no data

  return result;
}

function extractProfileData(document, result) {
  function extractName(parentNode) {
    let name = {};
    let givenNode = parentNode.querySelector("h2.node__name > span.given");
    if (givenNode) {
      let givenName = givenNode.textContent;
      if (givenName) {
        name.givenName = givenName.trim();
      }
    }

    let surnameNode = parentNode.querySelector("h2.node__name > strong.surname");
    if (surnameNode) {
      let surname = surnameNode.textContent;
      if (surname) {
        name.surname = surname.trim();
      }
    }
    return name;
  }

  function extractParentName(relativesNode, relationship) {
    const selector = "a[tree-node-relationship='" + relationship + "']";
    let parentNode = relativesNode.querySelector(selector);
    let parentName = "";

    if (parentNode) {
      let nameParts = extractName(parentNode);
      if (nameParts.givenName) {
        parentName = nameParts.givenName;
      }
      if (nameParts.surname) {
        if (parentName) {
          parentName += " ";
        }
        parentName += nameParts.surname;
      }
    }
    return parentName;
  }

  let container = document.querySelector("#maincontent > div > div.container.ng-scope");

  if (!container) {
    return;
  }

  let topProfileNode = container.querySelector("div.node.node--profile > div.node__body");
  if (!topProfileNode) {
    return;
  }

  let name = extractName(topProfileNode);
  if (name.givenName) {
    result.givenName = name.givenName;
  }
  if (name.surname) {
    result.surname = name.surname;
  }

  let infoNode = topProfileNode.querySelector("div.node__info");
  if (infoNode) {
    let info = infoNode.textContent;
    if (info) {
      // example string:
      // Born 1800, Atherstone, Warwickshire, England • Died 1871, Mancetter, Warwickshire, England
      // Note that this only gives years. Exact date is available in timeline.
      // Another example:
      // Captain of the British steamship Mineola • Born 1869, Pill, Easton In Gordano, Somerset • Died 1947, Paignton, Devon, England
      let birthInfo = "";
      let deathInfo = "";
      let startIndex = 0;
      let sepIndex = info.indexOf("•");
      if (sepIndex != -1) {
        if (!info.startsWith("Born") && !info.startsWith("Died")) {
          // must be a top-line bio, skip it
          info = info.substring(sepIndex + 1).trim();
          sepIndex = info.indexOf("•");
        }
      }

      if (sepIndex != -1) {
        birthInfo = info.substring(0, sepIndex).trim();
        deathInfo = info.substring(sepIndex + 1).trim();
      } else {
        if (info.startsWith("Born")) {
          birthInfo = info.trim();
        } else if (info.startsWith("Died")) {
          birthInfo = info.trim();
        }
      }

      if (birthInfo) {
        let commaIndex = birthInfo.indexOf(",");
        if (commaIndex != -1) {
          let birthYear = birthInfo.substring(0, commaIndex).trim();
          let birthPlace = birthInfo.substring(commaIndex + 1).trim();

          if (birthYear) {
            let year = birthYear.replace(/^Born (\d+)$/, "$1");
            if (year && birthYear != year) {
              result.birthYear = year;
            }
          }

          if (birthPlace) {
            result.birthPlace = birthPlace;
          }
        }
      }

      if (deathInfo) {
        let commaIndex = deathInfo.indexOf(",");
        if (commaIndex != -1) {
          let deathYear = deathInfo.substring(0, commaIndex).trim();
          let deathPlace = deathInfo.substring(commaIndex + 1).trim();

          if (deathYear) {
            let year = deathYear.replace(/^Died (\d+)$/, "$1");
            if (year && deathYear != year) {
              result.deathYear = year;
            }
          }

          if (deathPlace) {
            result.deathPlace = deathPlace;
          }
        }
      }
    }
  }

  // get parents
  let relativesNode = container.querySelector("div.profile-relatives");
  if (relativesNode) {
    let fatherName = extractParentName(relativesNode, "Father");
    if (fatherName) {
      result.fatherName = fatherName;
    }
    let motherName = extractParentName(relativesNode, "Mother");
    if (motherName) {
      result.motherName = motherName;
    }
  }

  // get timeline events
  let timelineNode = container.querySelector("ol.timeline");
  if (timelineNode) {
    let events = timelineNode.querySelectorAll("li.timeline-event");

    for (let eventNode of events) {
      let birthIconNode = eventNode.querySelector("i.icon-birth");
      let deathIconNode = eventNode.querySelector("i.icon-death");
      let marriageIconNode = eventNode.querySelector("i.icon-marriage");
      let eventYearNode = eventNode.querySelector("strong.timeline-event__year");
      let eventYear = "";
      if (eventYearNode) {
        eventYear = eventYearNode.textContent.trim();
      } else if (birthIconNode) {
        eventYear = result.birthYear;
      } else if (deathIconNode) {
        eventYear = result.deathYear;
      }

      if (eventYear) {
        let infoNode = eventNode.querySelector("div.timeline-event__info");
        if (infoNode) {
          let info = infoNode.textContent;
          if (info) {
            info = info.trim();

            if (birthIconNode) {
              let yearIndex = info.indexOf(eventYear);
              if (yearIndex != -1) {
                let dateString = eventYear;
                let infoBeforeYear = info.substring(0, yearIndex).trim();
                let onIndex = infoBeforeYear.indexOf(" on ");
                if (onIndex != -1) {
                  let datePart = infoBeforeYear.substring(onIndex + 4).trim();
                  if (datePart) {
                    dateString = datePart + " " + eventYear;
                  }
                }

                // get place
                let placeString = info.substring(yearIndex + eventYear.length).trim();
                if (placeString) {
                  if (placeString.startsWith("in ")) {
                    placeString = placeString.substring(3);
                  }
                  if (placeString.endsWith(".")) {
                    placeString = placeString.substring(0, placeString.length - 1).trim();
                  }
                }

                if (dateString && dateString.length > result.birthYear.length) {
                  result.birthDate = dateString;
                }

                if (placeString && (!result.birthPlace || placeString.length > result.birthPlace.length)) {
                  result.birthPlace = placeString;
                }
              }
            } else if (deathIconNode) {
              let yearIndex = info.indexOf(eventYear);
              if (yearIndex != -1) {
                let dateString = eventYear;
                let infoBeforeYear = info.substring(0, yearIndex).trim();
                let onIndex = infoBeforeYear.indexOf(" on ");
                if (onIndex != -1) {
                  let datePart = infoBeforeYear.substring(onIndex + 4).trim();
                  if (datePart) {
                    dateString = datePart + " " + eventYear;
                  }
                }

                // get place
                let placeString = info.substring(yearIndex + eventYear.length).trim();
                if (placeString) {
                  if (placeString.startsWith("in ")) {
                    placeString = placeString.substring(3);
                  } else if (placeString.startsWith("at age ")) {
                    let inIndex = placeString.indexOf(" in ");
                    if (inIndex != -1) {
                      placeString = placeString.substring(inIndex + 4).trim();
                    } else {
                      placeString = "";
                    }
                  }

                  if (placeString.endsWith(".")) {
                    placeString = placeString.substring(0, placeString.length - 1).trim();
                  }
                }

                if (dateString && dateString.length > result.deathYear.length) {
                  result.deathDate = dateString;
                }

                if (placeString && (!result.deathPlace || placeString.length > result.deathPlace.length)) {
                  result.deathPlace = placeString;
                }
              }
            } else if (marriageIconNode) {
              // this is a marriage event
              let andIndex = info.indexOf(" and ");
              if (andIndex != -1) {
                let thisPersonName = info.substring(0, andIndex).trim();
                // we could check this matches the name we have for the person
                info = info.substring(andIndex + 5);
                const marriedString = " were married ";
                let marriedIndex = info.indexOf(marriedString);
                if (marriedIndex != -1) {
                  let spouseName = info.substring(0, marriedIndex).trim();
                  info = info.substring(marriedIndex + marriedString.length);

                  let yearIndex = info.indexOf(eventYear);
                  if (yearIndex != -1) {
                    let dateString = eventYear;
                    let infoBeforeYear = info.substring(0, yearIndex).trim();
                    if (infoBeforeYear.startsWith("on")) {
                      let datePart = infoBeforeYear.substring(3);
                      dateString = datePart + " " + eventYear;
                    }

                    // get place
                    let placeString = info.substring(yearIndex + eventYear.length).trim();
                    if (placeString) {
                      if (placeString.startsWith("in ")) {
                        placeString = placeString.substring(3);
                      }
                      if (placeString.endsWith(".")) {
                        placeString = placeString.substring(0, placeString.length - 1).trim();
                      }
                    }

                    let spouse = {};
                    spouse.name = spouseName;
                    spouse.marriageDate = dateString;
                    spouse.marriagePlace = placeString;
                    if (!result.spouses) {
                      result.spouses = [];
                    }
                    result.spouses.push(spouse);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  result.success = true;

  //console.log("result of extractData on FMP");
  //console.log(result);
}

function extractReadOnlyProfileData(document, result) {
  function extractName(article) {
    let name = "";

    let labelText = article.getAttribute("aria-label");
    if (labelText) {
      const prefix = "Tree node transcript for ";
      if (labelText.startsWith(prefix)) {
        name = labelText.substring(prefix.length);
      }
    }
    return name;
  }

  function extractBirthFact(para) {
    let datePara = para.nextSibling;
    if (datePara) {
      let blankPara = datePara.nextSibling;
      if (blankPara) {
        let placePara = blankPara.nextSibling;
        if (placePara) {
          result.birthDate = datePara.textContent;
          result.birthPlace = placePara.textContent;
        }
      }
    }
  }

  function extractDeathFact(para) {
    let datePara = para.nextSibling;
    if (datePara) {
      let blankPara = datePara.nextSibling;
      if (blankPara) {
        let placePara = blankPara.nextSibling;
        if (placePara) {
          result.deathDate = datePara.textContent;
          result.deathPlace = placePara.textContent;
        }
      }
    }
  }

  function extractMarriageFact(para) {
    let namePara = para.nextSibling;
    if (namePara) {
      let datePara = namePara.nextSibling;
      if (datePara) {
        let blankPara = datePara.nextSibling;
        if (blankPara) {
          let placePara = blankPara.nextSibling;
          if (placePara) {
            let spouse = {};
            spouse.name = namePara.textContent;
            spouse.marriageDate = datePara.textContent;
            spouse.marriagePlace = placePara.textContent;
            if (!result.spouses) {
              result.spouses = [];
            }
            let isDuplicate = false;
            for (let existingSpouse of result.spouses) {
              if (
                existingSpouse.name == spouse.name &&
                existingSpouse.marriageDate == spouse.marriageDate &&
                existingSpouse.marriagePlace == spouse.marriagePlace
              ) {
                isDuplicate = true;
              }
            }
            if (!isDuplicate) {
              result.spouses.push(spouse);
            }
          }
        }
      }
    }
  }

  let article = document.querySelector("#main > article");
  if (!article) {
    return;
  }

  let name = extractName(article);
  if (name) {
    result.fullName = name;
  }

  // find the birth section
  let paras = article.querySelectorAll("div > div > div > div > div > div > div > div > div > p");
  for (let para of paras) {
    if (para.textContent == "Birth") {
      extractBirthFact(para);
    } else if (para.textContent == "Death") {
      extractDeathFact(para);
    } else if (para.textContent == "Marriage") {
      extractMarriageFact(para);
    }
  }

  result.success = true;
}

function extractStyle1TranscriptionData(document, result) {
  // the class names seem generated and may not be consistent
  // the attribute data-testid seems useful.
  let headerContentNode = document.querySelector("div[data-testid=transcript-header-content]");
  let transcriptTableHeadingNode = document.querySelector("tr[data-testid=transcript-table-heading]");
  let recordTableNode = document.querySelector("tbody[data-testid=transcript-record-table]");
  let householdTableNode = document.querySelector("table[data-testid=transcript-household-table]");

  if (!headerContentNode || !recordTableNode) {
    return result;
  }

  // Header
  let headingNode = headerContentNode.querySelector("div > h1");
  result.heading = cleanText(headingNode.textContent);

  let childDivNodeList = headerContentNode.querySelectorAll(":scope div:nth-child(2) > div");
  if (childDivNodeList.length > 0) {
    result.collection = "";
    for (let divNode of childDivNodeList) {
      let text = divNode.textContent;
      if (text) {
        result.collection += cleanText(text);
      }
    }
  }

  let placeNode = headerContentNode.querySelector("div > span");
  result.place = cleanText(placeNode.textContent);

  // Attempt to get gender from table heading
  if (transcriptTableHeadingNode) {
    let pictureNode = transcriptTableHeadingNode.querySelector("picture");
    if (pictureNode) {
      let imgNode = pictureNode.querySelector("img");
      if (imgNode) {
        let genderString = cleanText(imgNode.getAttribute("alt"));
        if (genderString == "Male" || genderString == "Female") {
          result.personGender = genderString.toLowerCase();
        }
      }
    }
  }

  // Record Data

  result.recordData = Object.create(null);

  let tableRowsNodes = recordTableNode.querySelectorAll("tr");
  for (let rowIndex = 0; rowIndex < tableRowsNodes.length; rowIndex++) {
    let rowNode = tableRowsNodes[rowIndex];

    let tds = rowNode.children;
    if (tds.length == 2) {
      let label = tds[0].textContent;
      let value = tds[1].textContent;

      label = cleanLabel(label);
      value = cleanText(value);

      if (label && value) {
        result.recordData[label] = value;
      }
    }
  }

  reorderRecordData(result);

  // Household
  if (householdTableNode) {
    result.household = Object.create(null);
    result.household.headings = [];
    result.household.members = [];

    let tableHeadings = householdTableNode.querySelectorAll("thead > tr > th");
    for (let colIndex = 0; colIndex < tableHeadings.length; colIndex++) {
      let colNode = tableHeadings[colIndex];
      let label = colNode.textContent;
      label = cleanLabel(label);
      if (label) {
        result.household.headings.push(label);
      }
    }

    let tableRows = householdTableNode.querySelectorAll("tbody > tr");
    for (let rowIndex = 0; rowIndex < tableRows.length; rowIndex++) {
      let rowNode = tableRows[rowIndex];

      let tds = rowNode.querySelectorAll("td");
      if (tds.length == tableHeadings.length) {
        let householdMember = Object.create(null);

        let isSelected = rowNode.getAttribute("aria-selected");
        householdMember.isSelected = isSelected == "true" ? true : false;

        for (let colIndex = 0; colIndex < tds.length; colIndex++) {
          let colNode = tds[colIndex];

          let label = tableHeadings[colIndex].textContent;
          let value = colNode.textContent;

          label = cleanLabel(label);
          value = cleanText(value);

          if (label && value) {
            householdMember[label] = value;
          }
        }

        result.household.members.push(householdMember);
      } else {
        // could be a closed record
        if (tds.length == 1) {
          let householdMember = Object.create(null);
          householdMember.isClosed = true;
          result.household.members.push(householdMember);
        }
      }
    }

    // check if expanded
    let nextSibling = householdTableNode.nextElementSibling;
    while (nextSibling) {
      if (nextSibling.tagName.toLowerCase() === "button") {
        let expandedAttr = nextSibling.getAttribute("aria-expanded");
        if (expandedAttr) {
          if (expandedAttr.toLowerCase() == "false") {
            result.household.expanded = false;
          } else if (expandedAttr.toLowerCase() == "true") {
            result.household.expanded = true;
          }
          break;
        }
      }
      nextSibling = nextSibling.nextElementSibling;
    }
  }

  // image link, note there can be 2 matches for the first query
  let transcriptHeaderNodeList = document.querySelectorAll("article[data-testid=transcript-header]");
  for (let transcriptHeaderNode of transcriptHeaderNodeList) {
    let divHeader = transcriptHeaderNode.parentNode;
    if (divHeader) {
      let imgNode = divHeader.querySelector('a[href^="https://search.findmypast."]');
      //console.log("imgNode is:");
      //console.log(imgNode);
      if (imgNode) {
        let link = imgNode.getAttribute("href");
        if (link) {
          result.imageUrl = link;
        }
      }
    }
  }

  result.success = true;

  //console.log("result of extractData on FMP");
  //console.log(result);
}

function extractStyle2TranscriptionData(document, result) {
  // the class names seem generated and may not be consistent
  // the attribute data-testid seems useful.
  let recordTableNode = document.querySelector("#transcriptionDisplayTable");

  if (!recordTableNode) {
    return result;
  }

  // Record Data

  result.recordData = Object.create(null);

  let tableRowsNodes = recordTableNode.querySelectorAll("tr");
  for (let rowIndex = 0; rowIndex < tableRowsNodes.length; rowIndex++) {
    let rowNode = tableRowsNodes[rowIndex];

    let tds = rowNode.children;
    if (tds.length == 2) {
      let label = tds[0].textContent;
      let value = tds[1].textContent;

      label = cleanLabel(label);
      value = cleanText(value);

      if (label && value) {
        result.recordData[label] = value;
      }
    }
  }

  reorderRecordData(result);

  if (result.recordData["Record set"]) {
    result.collection = result.recordData["Record set"];
  }

  // image link,
  let imgNode = document.querySelector("div.node__image-wrap > a");
  //console.log("imgNode is:");
  //console.log(imgNode);
  if (imgNode) {
    let link = imgNode.getAttribute("href");
    if (link) {
      result.imageUrl = link;
    }
  }

  result.success = true;

  //console.log("result of extractData on FMP");
  //console.log(result);
}

function extractData(document, url) {
  var result = {
    success: false,
  };

  //console.log("FMP extractData, url is: " + url + ", document is:");
  //console.log(document);

  // How do we determine the collection? I guess search the collections for the title

  if (!extractUrlInfo(result, url)) {
    return result;
  }

  //console.log("FMP extractData, result.urlPath is: " + result.urlPath);
  //console.log(result);

  let isValidPath = true;

  // for any valid transcript of style 1 the urlPath should be "transcript"
  if (result.urlPath == "transcript") {
    //console.log("FMP extractData, treating as style1 transcript");
    extractStyle1TranscriptionData(document, result);
  } else if (result.urlPath == "record") {
    // this could be an image or it could by a different style of transcription
    let displayTableNode = document.querySelector("#transcriptionDisplayTable");
    if (displayTableNode) {
      //console.log("FMP extractData, treating as style2 transcript");
      extractStyle2TranscriptionData(document, result);
    } else {
      //console.log("FMP extractData, treating as image");
      result = extractImageData(document, result);
    }
  } else if (result.urlTreeId && result.urlProfileId) {
    // it is a tree but could either be an editable on or a view of someone else's
    if (result.urlPath.startsWith("search-family-tree")) {
      extractReadOnlyProfileData(document, result);
    } else {
      extractProfileData(document, result);
    }
  } else {
    //console.log("FMP extractData, urlPath doesn't look like a valid page");
    isValidPath = false;
  }

  if (!result.success && isValidPath) {
    // FMP is an example of a site that says it's page load is complete but the data may not be
    // there to extract.
    //console.log("FMP extractData, treating as incomplete");
    result.dataMayBeIncomplete = true;
  }

  return result;
}

export { extractData };
