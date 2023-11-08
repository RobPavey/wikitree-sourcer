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

const useOldSystem = false;

function cleanText(text) {
  if (!text) {
    return "";
  }

  text = text.replace(/\s+/g, " "); // eliminate nbsp and multiple spaces etc

  // sometimes the text is something like "Zachariah Davey[Zechariah Pavey]"
  // in that case add a space before the [
  text = text.replace(/([^\s])\[/, "$1 [");

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

function getVisibleTextInNode(node) {
  let text = "";

  if (query.length > 0) {
    // loop over all the contents (which includes text nodes) and add in only the visbile ones
    let contents = node.childNodes;
    if (contents) {
      for (let childIndex = 0; childIndex < contents.length; childIndex++) {
        let child = contents[childIndex];

        if (child.getAttribute("style") != "display: none;") {
          text += child.textContent;
        }
      }
    }
  }

  return text;
}

function extractRecordData(table, result) {
  var recordDataRows = table.querySelectorAll("tr");

  result.recordData = Object.create(null);
  let recordData = result.recordData;

  if (!recordDataRows) {
    return;
  }

  for (let rowIndex = 0; rowIndex < recordDataRows.length; rowIndex++) {
    let row = recordDataRows[rowIndex];

    if (row.getAttribute("style") == "display: none;") {
      // There can be rows for many records present if this is a model popup dialog
      // and multiple records have been clicked on one after the other
      continue;
    }

    if (row.getAttribute("class") == "non-principal-info") {
      result.otherPersonRecordData = Object.create(null);
      recordData = result.otherPersonRecordData;
    }

    // Get the label of the row (must be immediate child)
    let label = row.querySelector("> th").textContent;
    if (label != "") {
      label = cleanLabel(label);
      let numChildren = row.querySelector("td").children.length;

      if (numChildren == 0) {
        let value = row.querySelector("td").textContent;
        value = value.replace(/\s+/g, " ").trim();
        recordData[label] = value;
      } else {
        // there are children. There are several cases to handle here
        if (numChildren == 1) {
          // sometimes there is a shadowRoot
          let child = row.querySelector("td").children[0];
          if (child.shadowRoot) {
            let span = child.shadowRoot.querySelector("span");

            let value = getVisibleTextInNode(span);
            value = cleanText(value);
            if (value != "") {
              recordData[label] = value;
            }
          } else {
            // for now just get the text of all the children, this can happen for "Name:" in death reg
            // If can also happen for "Inferred Spouse:" in 1939 reg.
            let value = getVisibleTextInNode(row.querySelector("td"));
            value = cleanText(value);
            if (value != "") {
              recordData[label] = value;
            }
          }
        } else {
          //console.log("Num children = " + numChildren + ". " + label);
          // for now just use the text of the TD itself and not children (if any)
          let value = getVisibleTextInNode(row.querySelector("td"));
          value = cleanText(value);
          if (value) {
            recordData[label] = value;
          } else {
            console.log("Unhandled case: Num children = " + numChildren + ". " + label);
          }
        }
      }
    } else {
      // this row doesn't have a <th> label. Could be something like "Household members"
      if (row.classList.contains("tableContainerRow")) {
        let table = row.querySelector("table");

        // collect all the headings and put them in a string with line breaks between them
        let headings = table.querySelectorAll.find("thead tr th");
        let label = "";
        if (headings) {
          for (let colIndex = 0; colIndex < headings.length; colIndex++) {
            let headingQ = headings[colIndex];
            if (label) {
              label += "<br/>";
            }
            label += cleanText(heading.textContent);
          }
        }

        // now get each row of data and put them all in one string with line breaks between rows
        let subTableRows = table.querySelectorAll("tbody tr");
        if (subTableRows) {
          let value = "";
          for (let subRowIndex = 0; subRowIndex < subTableRows.length; subRowIndex++) {
            let subRow = subTableRows[subRowIndex];
            if (value) {
              value += "<br/>";
            }
            value += cleanText(subRow.textContent);
          }
          if (value) {
            recordData[label] = value;
          }
        }
      }
    }
  }
}

function extractRelatives(relatives, result) {
  if (relatives.length > 0) {
    let rows = relatives.querySelectorAll("div.relative");

    if (rows && rows.length > 0) {
      result.relatives = [];

      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        let row = rows[rowIndex];

        if (row.getAttribute("style") == "display: none;") {
          // There can be rows for many records present if this is a model popup dialog
          // and multiple records have been clicked on one after the other
          continue;
        }

        let cells = row.querySelectorAll("div[role=gridcell]");
        if (cells && cells.length > 0) {
          let rowObject = Object.create(null);
          result.relatives.push(rowObject);

          for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
            let cell = cells[cellIndex];

            let label = cell.getAttribute("aria-label");
            let value = cleanText(cell.textContent);

            if (label != "") {
              rowObject[label] = value;
            }
          }
        }
      }
    }
  }
}

function extractDataForImage(filmViewerNode, result) {
  // Example images:

  // This one has transcribed data under "Image Index"
  // https://www.familysearch.org/ark:/61903/3:1:S3HT-DR17-4Y9?i=5&wc=M8VJ-GZ9%3A160750101%2C160953901%2C161035601&cc=1824690

  // No index on this one from Whiting-2417
  // https://www.familysearch.org/ark:/61903/3:1:3QS7-89WL-VKSC?i=379&wc=M7CD-S6D%3A358132901%2C360400601&cc=2078654

  // Hood-6574 has many images cited.
  // This one has transcription:
  // https://www.familysearch.org/ark:/61903/3:1:3QS7-89SS-998T?i=31&cc=1804888

  // This one does not:
  // https://www.familysearch.org/ark:/61903/3:1:3Q9M-CS3J-D77F-1?cat=157396

  let filmNumberNode = filmViewerNode.querySelector("div.film-number");
  if (filmNumberNode) {
    let filmNumberText = filmNumberNode.textContent;
    result.filmNumber = filmNumberText.replace(/^Film\s*\#\s*/, "").trim();
  }

  let crumbsNode = filmViewerNode.querySelector("fs-waypoint-crumbs");
  if (crumbsNode) {
    let browsePath = "";
    let crumbList = crumbsNode.querySelector("nav > ul");
    if (crumbList) {
      let children = crumbList.children;
      for (let index = 0; index < children.length; index++) {
        let child = children[index];
        let childDataNgRepeat = child.getAttribute("data-ng-repeat");
        if (childDataNgRepeat && childDataNgRepeat.includes("crumb in crumbs")) {
          let childTitle = child.getAttribute("title");
          if (childTitle) {
            if (browsePath) {
              browsePath += " > ";
            }
            browsePath += childTitle;
          }
        }
      }
    }
    if (browsePath) {
      result.imageBrowsePath = browsePath;
    }

    let titleNode = crumbsNode.querySelector("li.visible-phone > span");
    //console.log("titleQ.length = " + titleQ.length);
    if (titleNode) {
      result.filmTitle = titleNode.textContent;
    }
    if (!result.filmNumber) {
      filmNumberNode = crumbsNode.querySelector("li.hidden-phone > span.ng-scope");
      if (filmNumberNode) {
        result.filmNumber = titleNode.textContent;
      }
    }
  }

  let pager = filmViewerNode.querySelector("div.openSDPager");
  if (pager) {
    let input = pager.querySelector("input[name=currentTileNumber]");
    if (input) {
      result.imageNumber = input.value;
    }
    let afterInput = pager.querySelector("label.afterInput");
    if (afterInput) {
      let totalText = afterInput.textContent;
      result.totalImages = totalText.replace(/^of\s*/, "").trim();
    }
  }

  let imageInfo = filmViewerNode.querySelector("fs-image-info-panel");
  if (imageInfo) {
    let table = imageInfo.querySelector("table[data-ng-if=imageInfo\\.filmNotes]");
    if (table) {
      let tableRows = table.querySelectorAll("tr.ng-scope");
      if (tableRows) {
        if (tableRows.length == 1) {
          let catalogLink = tableRows[0].querySelector("a.ng-binding");
          if (catalogLink) {
            result.catalogRecordName = catalogLink.textContent;
            // this link is relative to https://www.familysearch.org
            result.catalogRecordLink = "https://www.familysearch.org" + catalogLink.getAttribute("href");
          }

          let imageInfoCols = tableRows[0].querySelectorAll("td");
          if (imageInfoCols.length > 1) {
            let itemNumberCol = imageInfoCols[1];
            let itemNumber = itemNumberCol.textContent;
            if (itemNumber) {
              result.itemNumber = itemNumber;
            }
          }
          if (imageInfoCols.length > 2) {
            let noteCol = imageInfoCols[2];
            let note = noteCol.textContent;
            if (note) {
              result.filmNote = note;
            }
          }
        } else {
          // there are multiple rows. See if they are all the same catalog
          let catalogRecordName = "";
          let catalogRecordLink = "";
          let allAreTheSame = true;
          for (let index = 0; index < tableRows.length; index++) {
            let row = tableRows[index];
            let catalogLink = row.querySelector("a.ng-binding");
            if (catalogLink) {
              let newCatalogRecordName = catalogLink.textContent;
              // this link is sometime relative to https://www.familysearch.org
              let newCatalogRecordLink = catalogLink.getAttribute("href");
              if (!newCatalogRecordLink.startsWith("http")) {
                newCatalogRecordLink = "https://www.familysearch.org" + newCatalogRecordLink;
              }

              if (catalogRecordName == "" && catalogRecordLink == "") {
                catalogRecordName = newCatalogRecordName;
                catalogRecordLink = newCatalogRecordLink;
              } else {
                if (catalogRecordName != newCatalogRecordName || catalogRecordLink != newCatalogRecordLink) {
                  allAreTheSame = false;
                  break;
                }
              }
            }
          }

          if (allAreTheSame) {
            result.catalogRecordName = catalogRecordName;
            result.catalogRecordLink = catalogRecordLink;
          }
        }
      }
    }

    let citationNode = imageInfo.querySelector("p#image-citation");
    if (citationNode) {
      result.citation = citationNode.textContent;
    }
  }

  //console.log("extractDataForImage, result is:");
  //console.log(result);

  if (result.filmNumber || result.imageNumber) {
    result.pageType = "image";
  } else {
    // FS is an example of a site that says it's page load is complete but the data may not be
    // there to extract.
    //console.log("FS extractData, treating as incomplete");
    result.dataMayBeIncomplete = true;
    result.pageType = "unknown";
  }
}

function extractDataForPersonPage(document, result) {
  function extractDateAndPlaceFromVitalsSection(cardSection, prefix) {
    let dateElement = cardSection.querySelector("div.display-date");
    if (dateElement) {
      let moreLessElement = dateElement.querySelector("fs-more-less");
      if (moreLessElement) {
        let date = moreLessElement.getAttribute("title");
        //console.log("moreLessElement is :");
        //console.log(moreLessElement);
        if (date) {
          //console.log("date is :");
          //console.log(date);
          result[prefix + "Date"] = date;
        }

        if (moreLessElement.shadowRoot) {
          let spanElement = moreLessElement.shadowRoot.querySelector("span[data-test-more-less-text]");
          if (spanElement) {
            let originalDate = spanElement.textContent;
            if (originalDate && originalDate != "false") {
              result[prefix + "DateOriginal"] = originalDate;
            }
          }
        }
      }
    }
    let placeElement = cardSection.querySelector("div.display-place");
    if (placeElement) {
      let valueElement = placeElement.querySelector("[data-test-place]");
      if (valueElement) {
        // can also use textContent to get place as entered.
        let standardizedPlace = valueElement.getAttribute("title");
        if (standardizedPlace) {
          result[prefix + "Place"] = standardizedPlace;
        }
        let originalPlace = valueElement.textContent;
        if (originalPlace && originalPlace != "false") {
          result[prefix + "PlaceOriginal"] = originalPlace;
        }
      }
    }
  }

  function extractNamesFromFsTreePerson(fsTreePersonElement, resultObject) {
    let nameDiv = fsTreePersonElement.querySelector("div.fs-person__name");
    if (nameDiv) {
      let givenNameElement = nameDiv.querySelector("span.fs-person__given-name");
      if (givenNameElement) {
        resultObject.givenName = givenNameElement.textContent;
      }
      let familyNameElement = nameDiv.querySelector("span.fs-person__family-name");
      if (familyNameElement) {
        resultObject.surname = familyNameElement.textContent;
      }
      let fullNameElement = nameDiv.querySelector("span.fs-person__full-name");
      if (fullNameElement) {
        resultObject.fullName = fullNameElement.textContent;
      }
    }
  }

  //console.log("extractDataForPersonPage:");

  result.pageType = "person";

  let personPageElement = document.querySelector("fs-person-page");
  if (personPageElement && personPageElement.shadowRoot) {
    // there are two places to get the person's name, one in header and one in vitals
    let personElement = personPageElement.shadowRoot.querySelector("div.person-header-container > fs-tree-person");
    if (personElement) {
      extractNamesFromFsTreePerson(personElement, result);
    }

    let detailsElement = personPageElement.shadowRoot.querySelector("#pages > fs-tree-person-details");

    if (detailsElement && detailsElement.shadowRoot) {
      let vitalsElement = detailsElement.shadowRoot.querySelector("fs-tree-person-vitals");

      if (vitalsElement && vitalsElement.shadowRoot) {
        //console.log("vitalsElement is :");
        //console.log(vitalsElement);

        let cardElement = vitalsElement.shadowRoot.querySelector("fs-tree-collapsable-card.vitals");

        if (cardElement) {
          //console.log("cardElement is :");
          //console.log(cardElement);

          let listItems = cardElement.querySelectorAll("li");
          for (let listItem of listItems) {
            //console.log("listItem is :");
            //console.log(listItem);

            //console.log("listItem.style.display is :");
            //console.log(listItem.style.display);

            // There can be random list items from previous people that have their display style set to none!
            if (listItem.style.display != "none") {
              let cardItem = listItem.querySelector("fs-tree-conclusion");
              if (cardItem) {
                //console.log("cardItem is :");
                //console.log(cardItem);

                if (cardItem.shadowRoot) {
                  let cardSection = cardItem.shadowRoot.querySelector("section");
                  if (cardSection) {
                    //console.log("cardSection is :");
                    //console.log(cardSection);

                    let conclusionType = cardSection.getAttribute("data-test-conclusion-type");

                    if (conclusionType == "NAME") {
                      let nameElement = cardSection.querySelector("div.display-name");
                      if (nameElement) {
                        let name = nameElement.textContent;
                        // we may already have name from header
                        if (!result.fullName) {
                          result.fullName = name;
                        }
                      }
                    } else if (conclusionType == "GENDER") {
                      let genderElement = cardSection.querySelector("div.display-gender");
                      if (genderElement) {
                        let gender = genderElement.textContent;
                        result.gender = gender;
                      }
                    } else if (conclusionType == "BIRTH") {
                      extractDateAndPlaceFromVitalsSection(cardSection, "birth");
                    } else if (conclusionType == "DEATH") {
                      extractDateAndPlaceFromVitalsSection(cardSection, "death");
                    }
                  }
                }
              }
            }
          }
        }
      }

      let familyElement = detailsElement.shadowRoot.querySelector("fs-tree-person-family");

      if (familyElement && familyElement.shadowRoot) {
        let cardElement = familyElement.shadowRoot.querySelector("fs-tree-collapsable-card.family");

        if (cardElement) {
          let familyMembersElement = cardElement.querySelector("fs-family-members");

          if (familyMembersElement && familyMembersElement.shadowRoot) {
            // Get spouses

            let spousesElement = familyMembersElement.shadowRoot.querySelector("#spouses");

            if (spousesElement) {
              let spouses = spousesElement.querySelectorAll("fs-family-members-block");
              for (let spouseBlockElement of spouses) {
                if (spouseBlockElement.shadowRoot) {
                  let familyBlock = spouseBlockElement.shadowRoot.querySelector("div.family-block");
                  if (familyBlock) {
                    let couple = familyBlock.querySelector("fs-family-members-couple");
                    if (couple && couple.shadowRoot) {
                      let spouse = {};

                      let spouseElement = couple.shadowRoot.querySelector("fs-tree-person:not(.focusPerson)");
                      if (spouseElement) {
                        extractNamesFromFsTreePerson(spouseElement, spouse);
                      }

                      let marriageDateElement = couple.shadowRoot.querySelector("span.marriage-date");
                      if (marriageDateElement) {
                        let dateString = marriageDateElement.textContent;
                        if (dateString) {
                          dateString = dateString.replace(/^Marriage\:\s*/, "");
                          spouse.marriageDateOriginal = dateString.trim();
                        }
                        let stdDateString = marriageDateElement.getAttribute("title");
                        if (stdDateString) {
                          stdDateString = stdDateString.replace(/^Standard\:\s*/, "");
                          spouse.marriageDate = stdDateString.trim();
                        }
                      }

                      let marriagePlaceElement = couple.shadowRoot.querySelector("span.marriage-place");
                      if (marriagePlaceElement) {
                        let placeString = marriagePlaceElement.textContent;
                        if (placeString) {
                          spouse.marriagePlaceOriginal = placeString.trim();
                        }
                        let stdPlaceString = marriagePlaceElement.getAttribute("title");
                        if (stdPlaceString) {
                          stdPlaceString = stdPlaceString.replace(/^Standard\:\s*/, "");
                          spouse.marriagePlace = stdPlaceString.trim();
                        }
                      }

                      // add the spouse
                      if (!result.spouses) {
                        result.spouses = [];
                      }
                      result.spouses.push(spouse);
                    }
                  }
                }
              }
            }

            // Get parents

            let parentsElement = familyMembersElement.shadowRoot.querySelector("#parents");
            if (parentsElement) {
              let familyMembersBlock = parentsElement.querySelector("fs-family-members-block");
              if (familyMembersBlock && familyMembersBlock.shadowRoot) {
                let familyBlock = familyMembersBlock.shadowRoot.querySelector("div.family-block");
                if (familyBlock) {
                  let couple = familyBlock.querySelector("fs-family-members-couple");
                  if (couple && couple.shadowRoot) {
                    let fatherElement = couple.shadowRoot.querySelector("fs-tree-person.male");
                    if (fatherElement) {
                      let father = {};
                      extractNamesFromFsTreePerson(fatherElement, father);
                      result.father = father;
                    }

                    let motherElement = couple.shadowRoot.querySelector("fs-tree-person.female");
                    if (motherElement) {
                      let mother = {};
                      extractNamesFromFsTreePerson(motherElement, mother);
                      result.mother = mother;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  //console.log(result);
}

// As of 12 Sep 2022  this new format page is an option from the old format page
function extractDataForPersonPageFormat2(document, personId, result) {
  function extractDateAndPlaceFromVitalsSection(conclusionElement, resultObject, prefix) {
    let dateElement = conclusionElement.querySelector("span[data-testid='conclusion-date']");
    if (dateElement) {
      let date = dateElement.textContent;
      if (date) {
        //console.log("date is :");
        //console.log(date);
        if (prefix) {
          resultObject[prefix + "Date"] = date;
        } else {
          resultObject["date"] = date;
        }
      }
    }
    let placeElement = conclusionElement.querySelector("span[data-testid='conclusion-place']");
    if (placeElement) {
      let place = placeElement.textContent;
      if (place) {
        if (prefix) {
          resultObject[prefix + "Place"] = place;
        } else {
          resultObject["place"] = place;
        }
      }
    }
  }

  function extractNamesFromPersonItem(personItemElement, resultObject) {
    let nameSpan = personItemElement.querySelector("span[data-testid='fullName']");
    if (nameSpan) {
      resultObject.fullName = nameSpan.textContent;
    }
  }

  //console.log("extractDataForPersonPageFormat2:");

  let mainContentNode = document.querySelector("main#main");
  if (!mainContentNode) {
    return;
  }

  result.pageType = "person";
  result.personId = personId;

  let vitalsElement = mainContentNode.querySelector("div[data-testid='section-card-vitals']");
  if (vitalsElement) {
    //console.log("vitalsElement:");
    //console.log(vitalsElement);

    let nameConclusionElement = vitalsElement.querySelector("div[data-testid='conclusionDisplay:NAME']");
    if (nameConclusionElement) {
      let nameElement = nameConclusionElement.querySelector("span[data-testid='conclusion-name-template']");
      if (nameElement) {
        result.fullName = nameElement.textContent;
      }
    }

    let genderConclusionElement = vitalsElement.querySelector("div[data-testid='conclusionDisplay:GENDER']");
    if (genderConclusionElement) {
      let genderElement = genderConclusionElement.querySelector("span[data-testid='conclusion-gender']");
      if (genderElement) {
        result.gender = genderElement.textContent;
      }
    }

    let birthConclusionElement = vitalsElement.querySelector("div[data-testid='conclusionDisplay:BIRTH']");
    if (birthConclusionElement) {
      extractDateAndPlaceFromVitalsSection(birthConclusionElement, result, "birth");
    }

    let deathConclusionElement = vitalsElement.querySelector("div[data-testid='conclusionDisplay:DEATH']");
    if (deathConclusionElement) {
      extractDateAndPlaceFromVitalsSection(deathConclusionElement, result, "death");
    }
  }

  let familyElement = mainContentNode.querySelector("div[data-testid='section-card-family']");
  if (familyElement) {
    let families = familyElement.querySelectorAll("div[data-testid^='family-']");
    for (let family of families) {
      let familyId = family.getAttribute("data-testid");
      if (familyId.includes(personId)) {
        // this is a spouse and children
        let coupleElement = family.querySelector("ul[data-testid='couple-persons']");
        if (coupleElement) {
          let couplePersons = coupleElement.querySelectorAll("li[data-testid='person-item']");
          if (couplePersons.length == 2) {
            let spouseElement = undefined;
            for (let person of couplePersons) {
              if (!person.hasAttribute("focus-person")) {
                spouseElement = person;
                break;
              }
            }
            if (spouseElement) {
              let spouse = {};
              extractNamesFromPersonItem(spouseElement, spouse);

              extractDateAndPlaceFromVitalsSection(coupleElement, spouse, "marriage");

              if (!result.spouses) {
                result.spouses = [];
              }
              result.spouses.push(spouse);
            }
          }
        }
      } else {
        // this must be parents and siblings
        let coupleElement = family.querySelector("ul[data-testid='couple-persons']");
        if (coupleElement) {
          let couplePersons = coupleElement.querySelectorAll("li[data-testid='person-item']");
          if (couplePersons.length == 2) {
            let fatherElement = couplePersons[0];
            let motherElement = couplePersons[1];

            let father = {};
            extractNamesFromPersonItem(fatherElement, father);
            result.father = father;

            let mother = {};
            extractNamesFromPersonItem(motherElement, mother);
            result.mother = mother;
          }
        }
      }
    }
  }

  //console.log(result);
}

function extractDataForPopup(searchArtifactResults, result) {
  let shadowRoot1 = searchArtifactResults.shadowRoot;

  let fsRecordDetailsModal = shadowRoot1.querySelector("fs-record-details-modal");

  if (fsRecordDetailsModal) {
    let shadowRoot2 = fsRecordDetailsModal.shadowRoot;

    let fsRecordDetails = shadowRoot2.querySelector("fs-record-details");

    if (fsRecordDetails) {
      let shadowRoot3 = fsRecordDetails.shadowRoot;

      let recordDetails = shadowRoot3.querySelector("record-details");

      if (recordDetails) {
        let shadowRoot4 = recordDetails.shadowRoot;

        result.pageType = "record popup";

        //  Document Info

        let rdDocumentInfo = shadowRoot4.querySelector("rd-document-info");
        if (rdDocumentInfo) {
          let shadowRoot5 = rdDocumentInfo.shadowRoot;

          let collectionLink = shadowRoot5.querySelector("a.collection-link");

          if (collectionLink) {
            result.collectionName = collectionLink.textContent;
            // this link is relative to familysearch.org
            result.collectionLink = collectionLink.getAttribute("href");
          }

          let documentInfoFields = shadowRoot5.querySelector("div.document-info-inner > table.fields");
          if (documentInfoFields) {
            var docTableResult = {};
            extractRecordData(documentInfoFields, docTableResult);

            result.docInfoData = docTableResult.recordData;
          }

          let citationNode = shadowRoot5.querySelector("p.citation");

          if (citationNode) {
            result.citation = citationNode.textContent;
          }
        }

        // Record details

        let rdPerson = shadowRoot4.querySelector("rd-person");
        if (rdPerson) {
          let shadowRoot5 = rdPerson.shadowRoot;

          // Not sure if we need the person header - it gives the gender, name and collection title
          // unless in the record of someone else (like a child) in which case it says that
          let personHeader = shadowRoot5.querySelector("div.person-header");

          // get the main table data
          let table = shadowRoot5.querySelector("table.fields");
          if (table) {
            extractRecordData(table, result);
          }

          // sometimes (e.g. a census) there are relatives in a pseudo table
          let relatives = shadowRoot5.querySelector("div.relatives");
          if (relatives) {
            extractRelatives(relatives, result);
          }
        }
      }
    }
  }
}

function extractData(document, url) {
  //console.log("fs extractData, url = " + url);

  var result = {};

  result.url = url;

  // first determine what kind of page we are in.

  let mainContent = document.querySelector("#main-content-section");

  //console.log("mainContent is");
  //console.log(mainContent);

  if (mainContent) {
    let filmViewerNode = mainContent.querySelector("fs-film-viewer");
    if (filmViewerNode) {
      extractDataForImage(filmViewerNode, result);
      return result;
    } else if (url.startsWith("https://www.familysearch.org/tree/person/details/")) {
      // it is a person page
      //console.log("extractData, it is a person:");

      extractDataForPersonPage(document, result);
      return result;
    }
  } else {
    mainContent = document.querySelector("#main");
    if (mainContent) {
      // this is a newer format page, only supported for person pages currently
      if (url.startsWith("https://www.familysearch.org/tree/person/details/")) {
        // it is a person page
        //console.log("extractData, it is a person:");

        let personId = url.replace("https://www.familysearch.org/tree/person/details/", "");

        extractDataForPersonPageFormat2(document, personId, result);
        return result;
      } else {
        console.log("page type is unknown but has a #main element");
        result.pageType = "unknown";
      }
    } else {
      let unknown = true;
      // could be a book
      if (url.startsWith("https://www.familysearch.org/library/books/")) {
        let content = document.querySelector("#content");
        if (content) {
          let heading = content.querySelector("div.p_right > h1");
          let table = content.querySelector("#single-table");
          if (heading && table) {
            unknown = false;
            result.pageType = "book";
            result.title = heading.textContent;
            let rows = table.querySelectorAll("dl");
            result.recordData = {};
            for (let row of rows) {
              let dt = row.querySelector("dt");
              let dd = row.querySelector("dd");
              if (dt && dd) {
                let key = dt.textContent;
                let value = dd.textContent;
                if (key && value) {
                  result.recordData[key] = value;
                }
              }
            }
          }
        }
      }

      if (unknown) {
        // page may be partially loaded
        console.log("page type is unknown");

        result.pageType = "unknown";
        result.dataMayBeIncomplete = true;
      }
    }
  }

  return result;

  // Currently it never gets this far because we use fetch for non-image pages
  // The below has been converted to not use jQuery but not tested
  /*
  let searchArtifactResults = document.querySelector("#main-content-section > div.full-width > search-artifact-results");
  if (searchArtifactResults) {
    extractDataForPopup(searchArtifactResults, result)
  }
  else {
    
    let recordSection = document.querySelector("#main > div.css-1c8s46c-appCss > div > div > div.css-1psu6mv-readyCss");

    let header = recordSection.querySelector("> div > div.css-13hiha-headerCss");
    let leftSide = recordSection.querySelector("> div > div.css-dqaew8-recordCss > div > div:nth-child(1)");
    let rightSide = recordSection.querySelector("> div > div.css-dqaew8-recordCss > div > div:nth-child(2)");

    // left side
    let mainPersonTable = leftSide.querySelector("> table");

    let additionalPersonsTable = document.querySelector("#additionalPersons > div > div.css-mt5p7h-additionalPersonRowCss > div.css-dfawkr-lowerBorderCss > div > div > table");

    let citationQ = rightSide.querySelector("#citation");
    result.citation = citation.textContent;


    result.recordSection = recordSection;
    result.header = header;
    result.leftSide = leftSide;
    result.rightSide = rightSide;
    result.mainPersonTable = mainPersonTable;
    result.additionalPersonsTable = additionalPersonsTable;
  }

  return result;
  */
}

function getDateValueFromDate(date, fieldTypeEnding, labelId) {
  let closeMatch = undefined;
  if (date.fields) {
    for (let field of date.fields) {
      let type = field.type;
      if (type && type.endsWith(fieldTypeEnding)) {
        for (let value of field.values) {
          if (value.labelId == labelId) {
            return value.text; // matches both type and labelId
          }
        }

        if (!closeMatch && field.values.length > 0) {
          closeMatch = field.values[0].text;
        }
      } else {
        if (field.values) {
          for (let value of field.values) {
            if (value.labelId == labelId) {
              if (!closeMatch && field.values.length > 0) {
                closeMatch = field.values[0].text;
              }
            }
          }
        }
      }
    }
  }

  return closeMatch;
}

function getCleanDateValueFromDate(date, fieldTypeEnding, labelId) {
  let value = getDateValueFromDate(date, fieldTypeEnding, labelId);
  if (value) {
    // clean date
    value = value.trim();
    if (/^0\d\s/.test(value)) {
      // remove leading zero
      value = value.substring(1);
    }
    if (/^from /.test(value)) {
      // can be like "from 1861 to 1865" in which case change to "1861-1865"
      value = value.replace(/from (\d+) to (\d+)/, "$1-$2");
    }
  }
  return value;
}

function setFieldFromDate(date, fieldTypeEnding, labelId, result, resultFieldName) {
  let value = getCleanDateValueFromDate(date, fieldTypeEnding, labelId);
  if (value) {
    result[resultFieldName] = value;
  }
}

function setFieldFromNormalizedValue(valueContainer, result, resultFieldName) {
  if (valueContainer.normalized && valueContainer.normalized.length > 0) {
    for (let normalizedValue of valueContainer.normalized) {
      if (normalizedValue.lang == "en") {
        result[resultFieldName] = normalizedValue.value;
      }
    }
  }
}

function setOriginalAndNormalizedField(valueContainer, result, resultFieldName) {
  // Date in a person tends to look like this:
  //       "date" : {
  //        "original" : "19210425",
  //        "formal" : "+1921-04-25",
  //        "normalized" : [ {
  //          "lang" : "en",
  //          "value" : "25 April 1921"
  //        } ]
  //      },

  if (!valueContainer) {
    return;
  }

  if (valueContainer.original) {
    result[resultFieldName + "Original"] = valueContainer.original;
  }
  setFieldFromNormalizedValue(valueContainer, result, resultFieldName);
}

function getPlaceValueFromPlace(place, fieldTypeEnding, labelId) {
  if (place.values) {
    if (labelId) {
      for (let value of place.values) {
        if (value.labelId == labelId) {
          return value.text;
        }
      }
    } else if (!fieldTypeEnding) {
      if (values.length == 1) {
        return values[0].text;
      }
    }
  }
  if (place.fields) {
    for (let field of place.fields) {
      if (field.values) {
        let type = field.type;
        for (let value of field.values) {
          if ((type && fieldTypeEnding && type.endsWith(fieldTypeEnding)) || value.labelId == labelId) {
            return value.text;
          } else if (!fieldTypeEnding && !labelId) {
            if (value.text) {
              return value.text;
            }
          }
        }
      }
    }
  }

  return undefined;
}

function cleanPlaceString(value) {
  if (!value) {
    return value;
  }

  while (value.startsWith(",")) {
    value = value.substring(1).trim();
  }

  while (value.endsWith(",")) {
    value = value.substring(0, value.length - 1).trim();
  }

  return value;
}

function getCleanPlaceValueFromPlace(place, fieldTypeEnding, labelId) {
  let value = getPlaceValueFromPlace(place, fieldTypeEnding, labelId);
  if (value) {
    value = cleanPlaceString(value);
  }
  return value;
}

function setFieldFromPlace(place, fieldTypeEnding, labelId, result, resultFieldName) {
  let value = getCleanPlaceValueFromPlace(place, fieldTypeEnding, labelId);
  if (value) {
    result[resultFieldName] = value;
  }
}

function setFieldFromPlaceWithLabels(place, labelIdList, result, resultFieldName) {
  for (let labelId of labelIdList) {
    let value = getCleanPlaceValueFromPlace(place, "", labelId);
    if (value) {
      result[resultFieldName] = value;
      return;
    }
  }
}

function checkForBadFmpLinks(result) {
  // It seems pretty impossible to fix bad image links since within one document they can be off by varying
  // offsets. I'm guessing that at some point the FMP document had multiple scans of the same page and that
  // these were then removed which threw all the image numbers off.
  // So perhaps the best solution is to make a list of document numbers that have issues and do not include
  // FMP links for those.

  const fmpDocsWithBadLinksFromFs = ["GBC/1851/4307762/"];

  let url = result.externalImageUrl;

  if (!url) {
    return;
  }

  if (url.indexOf("findmypast.") == -1) {
    return;
  }

  // example FMP URL
  // https://search.findmypast.co.uk/record?id=GBC/1851/4294847/01287&parentid=GBC/1851/0012732317

  let queryIndex = url.indexOf("?");
  if (queryIndex != -1) {
    let query = url.substring(queryIndex);

    let idString = query.replace(/\?id\=([^&]+).*/, "$1");
    //console.log("idString = " + idString);
    if (!idString || idString == query) {
      return;
    }

    for (let badDoc of fmpDocsWithBadLinksFromFs) {
      if (idString.startsWith(badDoc)) {
        // do not use the FMP link - it is bad
        //console.log("bad link");
        result.externalImageUrl = "bad";
        return;
      }
    }
  }
}

function isUrlAValidFullOrPartialFmpImageLink(url) {
  // URL can be something like this:   "GBC/1841/0276/0192&parentid=GBC/1841/0000933316"
  // In which case it requires some work to make this into a valid FMP url like
  // https://search.findmypast.co.uk/record?id=GBC%2F1841%2F0276%2F0192&parentid=GBC%2F1841%2F0000933316
  // Sometimes it is something like: "GBC/1871/3907/0156"
  // In which case it needs an extra "browse" in the URL:
  // https://search.findmypast.co.uk/record/browse?id=GBC/1871/3907/0156
  // Sometimes it is not a valid FindMyPast image partial URL. Examples:
  // "43004_162028006053_0100-00630.j2k"  (on a US Virginia death which does have a valid FS image)
  // "TNA%2FR39%2F1041%2F1041C%2F011%2F15"  (on a UK 1939 register record)

  if (!url) {
    return false;
  }

  let isFindMyPast = false;

  // Check for known formats that would not be valid
  // example non-FMP link: "D3608/1/4"
  let badFormats = [
    /^\w\d+\/\d+\/\d+$/, // e.g. "D3608/1/4"
    /^\d+$/, // e.g. "84"
    /^[\w\d]+$/, // e.g. "D3608"
    /^[\w\d]+\/$/, // e.g. "nai001442165/"
    /^[\w\d_\-]+$/, // e.g. "31394_203756-01496"
  ];

  let isBadArchiveIdFormat = false;
  for (let regex of badFormats) {
    if (regex.test(url)) {
      isBadArchiveIdFormat = true;
      break;
    }
  }

  let hadParentId = false;

  let parentIdIndex = url.toLowerCase().indexOf("parentid");
  if (parentIdIndex != -1) {
    url = url.substring(0, parentIdIndex);
    hadParentId = true;
  }

  if (!isBadArchiveIdFormat) {
    let percentIndex = url.indexOf("%");
    let dotIndex = url.indexOf(".");
    if (percentIndex == -1 && dotIndex == -1) {
      // there may be more tests that we could do but for now say this is valid FMP
      isFindMyPast = true;
    }
  }

  return isFindMyPast;
}

function processImageLinks(document, result, options) {
  let externalImageId = result.externalImageId;
  let extImageUrl = result.extImageUrl;
  let externalImageReference = result.externalImageReference;
  let externalRecordSeqOrig = result.externalRecordSeqOrig;

  let externalFilmNumber = undefined;
  if (result.referenceData) {
    externalFilmNumber = result.referenceData.externalFilmNumber;
  }

  if (result.digitalArtifact) {
    const arkString = "ark:/61903/3:1:";
    if (result.fsImageUrl) {
      // we have both, delete the digitalArtifact if it is the same as the fsImageUrl
      let iuArkIndex = result.fsImageUrl.indexOf(arkString);
      let daArkIndex = result.digitalArtifact.indexOf(arkString);
      if (iuArkIndex != -1 && daArkIndex != -1) {
        let iuId = result.fsImageUrl.substring(iuArkIndex);
        let daId = result.digitalArtifact.substring(daArkIndex);
        let iuTermIndex = iuId.search(/[\/\?\&]/);
        if (iuTermIndex != -1) {
          iuId = iuId.substring(0, iuTermIndex);
        }
        let daTermIndex = daId.search(/[\/\?\&]/);
        if (daTermIndex != -1) {
          daId = daId.substring(0, daTermIndex);
        }
        if (iuId == daId) {
          delete result.digitalArtifact;
        }
      }
    } else {
      let daArkIndex = result.digitalArtifact.indexOf(arkString);
      let daFsIndex = result.digitalArtifact.indexOf("familysearch");

      if (daArkIndex != -1 && daFsIndex != -1) {
        result.fsImageUrl = result.digitalArtifact;
        delete result.digitalArtifact;
      } else {
        // it could be an FMP link like:
        // http://search.findmypast.co.uk/record?id=GBC/1911/RG14/06751/0025&parentid=GBC/1911/RG14/06751/0025/4
        // or an Ancestry link like:
        // http://search.ancestry.com/iexec?htx=View&r=an&dbid=2703&iid=32848_B094051-00469

        let fmpIndex = result.digitalArtifact.indexOf("findmypast");
        let ancestryIndex = result.digitalArtifact.indexOf(".ancestry.");
        if (fmpIndex != -1 && !extImageUrl) {
          extImageUrl = result.digitalArtifact;
          delete result.digitalArtifact;
        } else if (ancestryIndex != -1 && !extImageUrl) {
          extImageUrl = result.digitalArtifact;
          delete result.digitalArtifact;
        } else {
          // leave digitalArtifact for now, it may be related to the externalImageUrl
        }
      }
    }
  }

  if (document) {
    // use the document to determine if there is a valid image thumbnail
    let restrictedImageThumb = document.querySelector("button[class*=restrictedImageThumbCss]");
    let imageThumb = document.querySelector("img[class*=-imageThumbCss]");

    if (result.fsImageUrl && imageThumb && restrictedImageThumb) {
      // this implies that there is a valid FamilySearch image - so do not set externalImageUrl
      return;
    }
  }

  if (extImageUrl) {
    // if it is an FMP link and starts with http then change it to https
    let prefix = "http://search.findmypast.";
    let prefixIndex = extImageUrl.indexOf(prefix);
    if (prefixIndex != -1) {
      let remainder = extImageUrl.substring(prefix.length);
      extImageUrl = "https://search.findmypast." + remainder;
    }

    result.externalImageUrl = extImageUrl;
  } else if (externalImageId || externalFilmNumber) {
    if (externalImageId && externalImageId.startsWith("http")) {
      result.externalImageUrl = externalImageId;
    } else if (externalFilmNumber && externalFilmNumber.startsWith("http")) {
      result.externalImageUrl = externalFilmNumber;
    } else {
      let isFindMyPast = false;
      let url = externalImageId;

      if (result.citation.includes("findmypast")) {
        isFindMyPast = true;
      } else {
        if (isUrlAValidFullOrPartialFmpImageLink(externalImageId)) {
          isFindMyPast = true;
        }
        // The code below was when I though the externalFilmNumber could be a value FMP partial URL
        // I was looking at this FS record: england_baptism_1810_john_abberley
        // But it turns out in that case it is a partial RECORD link
        //else if (isUrlAValidFullOrPartialFmpImageLink(externalFilmNumber)) {
        //  isFindMyPast = true;
        //  url = externalFilmNumber;
        //}
      }

      if (isFindMyPast) {
        // is is possible that an externalUir of "971304" means FMP, have not confirmed yet
        // Just assume the link is FMP for now

        let isImage = true;
        if (result.externalRecordId && result.externalRecordId == externalImageId) {
          isImage = false;
        }

        if (isImage) {
          let domain = "findmypast.co.uk";
          if (options && options.search_fmp_domain && options.search_fmp_domain != "none") {
            domain = options.search_fmp_domain;
          }

          // sometimes the externalImageId actuall points to the record not the image.
          // Example from england_baptism_1902_ella_giles
          // "externalImageId": "GBPRS/CANT/B/96288131",
          // "externalImageReference": "GBPRS/CANT/005265403/00684",
          // "externalRecordSeqOrig": "96288131",
          // In this case we want to use "GBPRS/CANT/005265403/00684"
          if (externalImageReference && externalRecordSeqOrig) {
            if (externalImageId.includes(externalRecordSeqOrig)) {
              url = externalImageReference;
            }
            delete result.externalImageReference;
            delete result.externalRecordSeqOrig;
          }

          let uriQuery = encodeURI(url);

          let prefix = "https://search." + domain + "/record?id=";

          // if there is no parentId on the URL then the "/browse" part is required
          if (!uriQuery.toLowerCase().includes("parentid")) {
            prefix = "https://search." + domain + "/record/browse?id=";
          }

          let uri = prefix + uriQuery;
          result.externalImageUrl = uri;
        }
      }
    }

    checkForBadFmpLinks(result);
  }

  if (result.digitalArtifact) {
    if (result.digitalArtifact == result.externalImageUrl) {
      delete result.digitalArtifact;
    } else {
      // In the cases I have seen that get here digitalArtifact is a variation of a findmypast link
      // Sometimes it is a better link - i.e. externalImageUrl doesn't resolve but digitalArtifact does.
      // But we don't have a way to test that. For now rmove it if it contains findmypast
      if (result.digitalArtifact.indexOf("findmypast") != -1) {
        delete result.digitalArtifact;
      }
    }
  }
}

function buildBestDateFromDateObject(date) {
  /*
  Here is an example date object from https://www.familysearch.org/ark:/61903/1:1:XRP7-LN5

  The original date is a bad form.

        "date" : {
        "original" : "14 12 1853",
        "fields" : [ {
          "type" : "http://gedcomx.org/Date",
          "values" : [ {
            "id" : "c76a9bfc-e380-4599-8392-62e156209cb1",
            "attribution" : {
              "contributor" : {
                "resource" : "http://treatment/StandardsDateTreatment/ver/2"
              },
              "modified" : 1694014225785
            },
            "type" : "http://gedcomx.org/Original",
            "labelId" : "EVENT_DATE_ORIG",
            "text" : "14 12 1853"
          }, {
            "id" : "0d8635d8-9b92-4214-9c88-0384199a82b9",
            "attribution" : {
              "contributor" : {
                "resource" : "http://treatment/StandardsDateTreatment/ver/2"
              },
              "modified" : 1580401204701
            },
            "type" : "http://gedcomx.org/Interpreted",
            "labelId" : "EVENT_DATE",
            "text" : "14 Dec 1853",
            "resource" : "+1853-12-14"
          } ]
        }, {
          "type" : "http://gedcomx.org/Month",
          "values" : [ {
            "id" : "06c16a79-0c51-4359-b326-62172e4b6f29",
            "type" : "http://gedcomx.org/Original",
            "labelId" : "EVENT_MONTH_ORIG",
            "text" : "12"
          }, {
            "id" : "457be1ed-b0e8-403f-9283-2b35597a3091",
            "attribution" : {
              "contributor" : {
                "resource" : "http://treatment/StandardsDateTreatment/ver/2"
              },
              "modified" : 1580401204701
            },
            "type" : "http://gedcomx.org/Interpreted",
            "labelId" : "EVENT_MONTH",
            "text" : "12"
          } ]
        }, {
          "type" : "http://gedcomx.org/Day",
          "values" : [ {
            "id" : "87792cd3-9cd9-4a4c-86c0-f52df61fccc6",
            "type" : "http://gedcomx.org/Original",
            "labelId" : "EVENT_DAY_ORIG",
            "text" : "14"
          }, {
            "id" : "c7f672d6-0f7b-4cb7-be0b-f6f4f026349a",
            "attribution" : {
              "contributor" : {
                "resource" : "http://treatment/StandardsDateTreatment/ver/2"
              },
              "modified" : 1580401204701
            },
            "type" : "http://gedcomx.org/Interpreted",
            "labelId" : "EVENT_DAY",
            "text" : "14"
          } ]
        }, {
          "type" : "http://gedcomx.org/Year",
          "values" : [ {
            "id" : "1faeabcb-5b98-4540-b781-ae847dc107ef",
            "type" : "http://gedcomx.org/Original",
            "labelId" : "EVENT_YEAR_ORIG",
            "text" : "1853"
          }, {
            "id" : "8c3ea753-c156-4949-88f8-cc31dd657381",
            "attribution" : {
              "contributor" : {
                "resource" : "http://treatment/StandardsDateTreatment/ver/2"
              },
              "modified" : 1580401204701
            },
            "type" : "http://gedcomx.org/Interpreted",
            "labelId" : "EVENT_YEAR",
            "text" : "1853"
          } ]
        } ]
      },
  */

  let goodDateRexExp = /\s*\d\d?\s+[a-zA-Z]+\s+\d\d\d\d/;

  let bestBackupDate = "";
  let originalDate = date.original;
  if (originalDate) {
    bestBackupDate = originalDate;
    if (goodDateRexExp.test(originalDate)) {
      return originalDate;
    }
  }

  // see if there is a better date in the fields
  for (let field of date.fields) {
    if (field.type == "http://gedcomx.org/Date") {
      for (let value of field.values) {
        let text = value.text;
        if (!bestBackupDate) {
          bestBackupDate = test;
        }
        if (goodDateRexExp.test(text)) {
          return text;
        }
      }
    }
  }

  return bestBackupDate;
}

function addRecordDataForFact(result, fact, factType) {
  let factTypeWithSpaces = factType.replace(/([a-z])([A-Z])/g, "$1 $2");
  if (fact.date) {
    let date = buildBestDateFromDateObject(fact.date);
    if (date) {
      let label = factTypeWithSpaces + " Date";
      let value = date;
      result.recordData[label] = value;
    }
  }
  if (fact.place) {
    const placeLabelIdsToOverrideForFacts = {
      Death: [{ label: "LAST_RESIDENCE", overrideKey: "Last Residence" }],
    };

    let labelIdsToOverride = placeLabelIdsToOverrideForFacts[factType];
    let overrideKey = "";
    if (labelIdsToOverride) {
      let fieldLabelId = "";
      if (fact.place.fields && fact.place.fields.length == 1) {
        let values = fact.place.fields[0].values;
        if (values && values.length == 1) {
          fieldLabelId = values[0].labelId;
        }
      }
      if (fieldLabelId) {
        for (let labelToOverride of labelIdsToOverride) {
          if (labelToOverride.label == fieldLabelId) {
            overrideKey = labelToOverride.overrideKey;
            break;
          }
        }
      }
    }

    if (fact.place.original) {
      let label = factTypeWithSpaces + " Place";
      if (overrideKey) {
        label = overrideKey;
      }
      let value = fact.place.original;
      result.recordData[label] = value;
    }
  }
  if (fact.value) {
    let label = factTypeWithSpaces;
    let value = fact.value;
    result.recordData[label] = value;
  }
}

// Identifying a field:
//  fieldFsType, fieldGcType, fieldCdsType
//  fieldFsTypePrefix, fieldGcTypePrefix
//  sourceSection - the section containing fields ("topLevel", "primaryPerson", "primaryFact", "otherFact", "relationship")
// Selecting a value in the field (if none specified first is used)
//  valueType - this is a preference if there are multiple
//  labelId
//  labelIdPrefix
// Specifying where to put value:
//  recordDataField
//  dataField
//  referenceDataField
// if none of the above exist then the field is ignored
// As soon as a match is found later entries in fieldData are ignored?

const fieldData = [
  // data and record data fields
  {
    fieldFsType: "EventRegQtr",
    dataField: "registrationQuarter",
    recordDataField: "Registration Quarter",
  },
  {
    fieldFsType: "EventRegDate",
    dataField: "registrationDate",
    recordDataField: "Registration Date",
  },
  {
    fieldGcType: "Age",
    sourceSection: "primaryPerson",
    valueType: "Interpreted",
    dataField: "age",
    recordDataField: "Age",
  },

  //  data fields
  { fieldFsType: "ExternalImageId", dataField: "externalImageId" },
  { fieldFsType: "ExtImageReference", dataField: "externalImageReference" },
  { fieldFsType: "ExtRecordSeqOrig", dataField: "externalRecordSeqOrig" },
  { fieldFsType: "ExtImageUrl", dataField: "extImageUrl" },
  { fieldFsType: "ExtRecordId", dataField: "externalRecordId" },
  { fieldFsType: "ExtRecordType", dataField: "externalRecordType" },
  { fieldFsType: "ExtUir", dataField: "externalUir" },
  { fieldFsType: "ExtData", dataField: "extData" },
  { fieldCdsType: "ForwardPersonToArk", dataField: "forwardPersonToArk" },

  { fieldFsType: "ImageArk", dataField: "fsImageUrl" },
  { fieldFsType: "ImageNumber", dataField: "fsImageNumber" },
  { fieldFsType: "CollectionId", dataField: "fsCollectionId" },

  // record data fields
  {
    fieldFsType: "MilBeginRank",
    valueType: "Interpreted",
    recordDataField: "Miitary Beginning Rank",
  },
  {
    fieldFsType: "MilEndRank",
    valueType: "Interpreted",
    recordDataField: "Miitary Final Rank",
  },
  {
    fieldFsType: "MilSide",
    valueType: "Interpreted",
    recordDataField: "Miitary Side",
  },
  {
    fieldFsType: "MilUnit",
    valueType: "Interpreted",
    recordDataField: "Miitary Unit",
  },
  {
    fieldFsType: "MilCompany",
    valueType: "Interpreted",
    recordDataField: "Military Company",
  },
  // reference fields
  {
    fieldFsType: "SourceScheduleType",
    referenceDataField: "sourceScheduleType",
  },
  { fieldFsType: "SourcePieceFolio", referenceDataField: "sourcePieceFolio" },
  { fieldFsType: "SourceVolume", referenceDataField: "sourceVolume" },
  { fieldFsType: "SourcePage", referenceDataField: "sourcePageNbr" },
  { fieldFsType: "SourcePageNbr", referenceDataField: "sourcePageNbr" },
  { fieldFsType: "SourceLineNbr", referenceDataField: "sourceLineNbr" },
  { fieldFsType: "SourceEntryNbr", referenceDataField: "sourceEntryNbr" },
  { fieldFsType: "SourceRegNbr", referenceDataField: "sourceRegNbr" },
  { fieldFsType: "LineNbr", referenceDataField: "lineNumber" },
  { fieldFsType: "RefId", referenceDataField: "referenceId" },
  { fieldFsType: "RecNbr", referenceDataField: "recordNumber" },
  { fieldFsType: "RecNumber", referenceDataField: "recordNumber" },
  { fieldFsType: "RecordNumber", referenceDataField: "recordNumber" },
  { fieldFsType: "FileNumber", referenceDataField: "fileNumber" },

  { fieldFsType: "DigitalFilmNumber", referenceDataField: "digitalFilmNumber" },
  { fieldFsType: "DigitalFilmNbr", referenceDataField: "digitalFilmNumber" },
  { fieldFsType: "FilmNumber", referenceDataField: "filmNumber" }, // e.g. https://www.familysearch.org/ark:/61903/1:1:N493-65L
  { fieldFsType: "FilmNbr", referenceDataField: "filmNumber" }, // e.g. https://www.familysearch.org/ark:/61903/1:1:M2Z2-T24
  { fieldFsType: "ImageNbr", referenceDataField: "imageNumber" },
  { fieldFsType: "ExtRepositoryName", referenceDataField: "externalRepositoryName" },
  { fieldFsType: "UdeBatchNbr", referenceDataField: "indexingBatchNumber" },

  { fieldFsType: "PacketLtr", referenceDataField: "packetLetter" },
  { fieldFsType: "PacketLetter", referenceDataField: "packetLetter" },
  { fieldFsType: "SheetNumberLetter", referenceDataField: "sheetNumberLetter" },
  { fieldFsType: "SheetNumber", referenceDataField: "sheetNumber" },
  { fieldFsType: "SheetLtr", referenceDataField: "sheetLetter" },
  { fieldFsType: "SourceSheetNbrLtr", referenceDataField: "sheetNumberLetter" },
  { fieldFsType: "SourceSheetNbr", referenceDataField: "sheetNumber" },
  { fieldFsType: "SourceSheetLtr", referenceDataField: "sheetLetter" },

  { fieldFsType: "ExtFilmNbr", referenceDataField: "externalFilmNumber" },
  { fieldFsType: "ExtPubNbr", referenceDataField: "externalPublicationNumber" },
  {
    fieldFsType: "ExtPubTitle",
    referenceDataField: "externalPublicationTitle",
  },
  { fieldFsType: "ExtLineNbr", referenceDataField: "externalLineNumber" },

  // fields to ignore
  { fieldFsType: "UniqueId" },
  { fieldFsType: "UniqueIdentifier" },

  { fieldFsType: "EventPlaceLevel1Type" },
  { fieldFsType: "EventPlaceLevel2Type" },
  { fieldFsType: "EventPlaceLevel3Type" },
  { fieldFsType: "EventPlaceLevel4Type" },
  { fieldFsType: "EventPlaceLevel5Type" },
  { fieldFsType: "EventPlaceLevelType" },

  { fieldFsType: "EventPlaceLowestLevel" },
  { fieldFsType: "EventCountry", dataField: "eventCountry" },
  { fieldFsType: "EventCounty", dataField: "eventCounty" },
  { fieldFsType: "EventState", dataField: "eventState" },
  { fieldFsType: "EventDistrict", dataField: "eventDistrict" },
  { fieldFsType: "EventCity", dataField: "eventCity" },
  { fieldFsType: "MinorCivilDivision" },

  { fieldFsType: "Evquarter" },

  { fieldFsType: "ExtCountyCode" },
  { fieldFsType: "CountyCode" },
  { fieldFsType: "CountyId" },
  { fieldFsType: "FolioNo" },
  { fieldFsType: "DigitalFilmNumber" },
  { fieldFsType: "FilmNumber" },
  { fieldFsType: "ImageApid" },
  { fieldFsType: "ImageId" },
  { fieldFsType: "PpqId" },
  { fieldFsType: "RecordGroup" },
  { fieldFsType: "SortKey" },
  { fieldFsType: "HouseholdId" },
  { fieldFsType: "RelationshipToHeadCode" },
  { fieldFsType: "SourceHouseholdId" },

  { fieldFsType: "ExtLineNbrSuf" },
  { fieldFsType: "ExtOccupationCode" },
  { fieldFsType: "ExtPrBirPlaceCode" },
  { fieldFsType: "ExtUarn" },
  { fieldFsType: "ExtUrn" },
  { fieldFsType: "ExtUrprn" },

  { fieldFsType: "ExtAdditionalEntryFlag" },
  { fieldFsType: "ExtLineNbr" },
  { fieldFsType: "ExtPageCode" },
  { fieldFsType: "ExtRefNbr" },
  { fieldFsType: "AdditionalRelativesFlag" },
  { fieldFsType: "TravelerTitle" },
  { fieldFsType: "TravelerName" },

  { fieldFsType: "Names" }, // used for "OTHER_NAMES" label text

  { fieldFsType: "SourceDocumentType" },
  { fieldFsType: "SourcePageType" },
  { fieldFsType: "SourcePieceNbr" },
  { fieldFsType: "SourceRecordType" },
  { fieldFsType: "SourceScheduleType" },
  { fieldFsType: "SourceComposite" },
  { fieldFsType: "SourceBookNbr" },
  { fieldFsType: "SourcePostalCode" },
  { fieldFsType: "SystemOfOrigin" },

  { fieldFsType: "RecordVersion" },
  { fieldFsType: "UserModified" },
  { fieldFsType: "CdsBatchId" },
  { fieldFsType: "PublicationStatus" },
  { fieldFsType: "PublishableUnit" },

  { fieldFsType: "UdeBatchNumber" },
  { fieldFsType: "BatchId" },
  { fieldFsType: "BatchLocality" },
  { fieldFsType: "Folder" },
  { fieldFsType: "FolderImageSequence" },
  { fieldFsType: "FolderImageSeq" },

  { fieldFsType: "DasVerify" }, // a date
  { fieldFsType: "EasyImageId" },
  { fieldFsType: "RecordId" },
  { fieldFsType: "ProjectId" },
  { fieldFsType: "CtlFileId" },
  { fieldFsType: "ImsImageId" },
  { fieldFsType: "Language" },
  { fieldFsType: "VerifyOrProofCode" },
  { fieldFsType: "VerifyOrProofCode" },

  { fieldFsTypeRegEx: /^Pr[A-Z]/ },
  { fieldFsTypeRegEx: /^Ed[A-Z]/ },
  { fieldFsTypeRegEx: /Css$/ }, // fields with type ending "Css" can be ignored

  { fieldFsTypePrefix: "OtherOnPageNameGn" },
  { fieldFsTypePrefix: "OtherOnPageNameSurn" },
  { fieldFsTypePrefix: "OtherOnPageUrl" },

  { fieldFsTypePrefix: "Ext" },
  { fieldFsTypePrefix: "Fs" },
  { fieldFsTypePrefix: "Idx" },
  { fieldFsTypePrefix: "Nara" },

  // catchAll
  {
    recordDataFieldUseFsType: true,
    recordDataFieldUseGcType: true,
    valueType: "Interpreted",
  },
];

function doesFieldDataMatch(entry, result, field, sourceSection) {
  if (entry.sourceSection) {
    if (entry.sourceSection != sourceSection) {
      return false;
    }
  }

  if (entry.fieldFsType) {
    let match = false;
    const fsTypePrefix = "http://familysearch.org/types/fields/";
    if (field.type && field.type.startsWith(fsTypePrefix)) {
      let fieldFsType = field.type.substring(fsTypePrefix.length);
      if (fieldFsType == entry.fieldFsType) {
        match = true;
      }
    }
    if (!match) {
      return false;
    }
  }

  if (entry.fieldCdsType) {
    let match = false;
    // e.g. https://cds.familysearch.org/ForwardPersonToArk
    const fsCdsTypePrefix = "https://cds.familysearch.org/";
    if (field.type && field.type.startsWith(fsCdsTypePrefix)) {
      let fieldCdsType = field.type.substring(fsCdsTypePrefix.length);
      if (fieldCdsType == entry.fieldCdsType) {
        match = true;
      }
    }
    if (!match) {
      return false;
    }
  }

  if (entry.fieldFsTypePrefix) {
    let match = false;
    const fsTypePrefix = "http://familysearch.org/types/fields/";
    if (field.type && field.type.startsWith(fsTypePrefix)) {
      let fieldFsType = field.type.substring(fsTypePrefix.length);
      if (fieldFsType.startsWith(entry.fieldFsTypePrefix)) {
        match = true;
      }
    }
    if (!match) {
      return false;
    }
  }

  if (entry.fieldFsTypeRegEx) {
    let match = false;
    const fsTypePrefix = "http://familysearch.org/types/fields/";
    if (field.type && field.type.startsWith(fsTypePrefix)) {
      let fieldFsType = field.type.substring(fsTypePrefix.length);
      if (entry.fieldFsTypeRegEx.test(fieldFsType)) {
        match = true;
      }
    }
    if (!match) {
      return false;
    }
  }

  if (entry.fieldGcType) {
    let match = false;
    const gcTypePrefix = "http://gedcomx.org/";
    if (field.type && field.type.startsWith(gcTypePrefix)) {
      let fieldGcType = field.type.substring(gcTypePrefix.length);
      if (fieldGcType == entry.fieldGcType) {
        match = true;
      }
    }
    if (!match) {
      return false;
    }
  }

  return true;
}

function determineFieldValue(entry, field) {
  if (!field.values || field.values.length < 1) {
    return undefined;
  }

  let valueObj = field.values[0];
  if (field.values.length > 1 && entry.valueType) {
    // there can be an orig and an interpreted for example
    for (let value of field.values) {
      let valueType = value.type;
      const gcTypePrefix = "http://gedcomx.org/";
      if (valueType.startsWith(gcTypePrefix)) {
        valueType = valueType.substring(gcTypePrefix.length);
      }
      if (valueType == entry.valueType) {
        valueObj = value;
        break;
      }
    }
  }

  return valueObj;
}

function addFieldDataValue(entry, result, field, valueObj) {
  let value = valueObj.text;
  if (!value) {
    return;
  }

  if (entry.dataField) {
    result[entry.dataField] = value;
  }

  let recordDataAdded = false;
  if (entry.recordDataField) {
    if (!result.recordData) {
      result.recordData = {};
    }
    result.recordData[entry.recordDataField] = value;
    recordDataAdded = true;
  }

  if (!recordDataAdded && entry.recordDataFieldUseFsType) {
    let fieldType = undefined;
    const fsTypePrefix = "http://familysearch.org/types/fields/";
    if (field.type && field.type.startsWith(fsTypePrefix)) {
      fieldType = field.type.substring(fsTypePrefix.length);
    }

    if (fieldType) {
      let fieldName = fieldType.replace(/([a-z])([A-Z])/g, "$1 $2");

      if (!result.recordData) {
        result.recordData = {};
      }
      result.recordData[fieldName] = value;
      recordDataAdded = true;
    }
  }

  if (!recordDataAdded && entry.recordDataFieldUseGcType) {
    let fieldType = undefined;
    const gcTypePrefix = "http://gedcomx.org/";
    if (field.type && field.type.startsWith(gcTypePrefix)) {
      fieldType = field.type.substring(gcTypePrefix.length);
    }

    if (fieldType) {
      let fieldName = fieldType.replace(/([a-z])([A-Z])/g, "$1 $2");

      if (!result.recordData) {
        result.recordData = {};
      }
      result.recordData[fieldName] = value;
      recordDataAdded = true;
    }
  }

  if (entry.referenceDataField) {
    if (!result.referenceData) {
      result.referenceData = {};
    }
    result.referenceData[entry.referenceDataField] = value;
  }
}

function processField(result, field, sourceSection) {
  for (let entry of fieldData) {
    if (doesFieldDataMatch(entry, result, field, sourceSection)) {
      let valueObj = determineFieldValue(entry, field);
      if (valueObj) {
        addFieldDataValue(entry, result, field, valueObj);
        break;
      }
    }
  }
}

function processFields(result, fields, sourceSection) {
  if (!fields) {
    return;
  }

  for (let field of fields) {
    processField(result, field, sourceSection);
  }
}

function isFieldTypeValidForRecordData(type) {
  const typesToExclude = [
    "SourcePieceFolio",
    "SourceLineNbr",
    "SourceRegNbr",
    "SourceEntryNbr",
    "SourcePageNbr",
    "SourceBookNbr",
    "SourceHouseholdId",
    "HouseholdId",
    "FolioNo",
    "CountyId",
    "RelationshipToHead",
    "RelationshipToHeadCode",
  ];

  for (let fieldType of typesToExclude) {
    if (type == fieldType) {
      return false;
    }
  }

  return true;
}

function getFactType(fact) {
  let factType = fact.type;
  const fsTypePrefix = "http://familysearch.org/types/facts/";
  const gcTypePrefix = "http://gedcomx.org/";
  if (factType.startsWith(fsTypePrefix)) {
    factType = factType.substring(fsTypePrefix.length);
  } else if (factType.startsWith(gcTypePrefix)) {
    factType = factType.substring(gcTypePrefix.length);
  }
  return factType;
}

function getFactTypeFromRecordType(recordType) {
  let factType = recordType;
  const gcTypePrefix = "http://gedcomx.org/";
  if (factType.startsWith(gcTypePrefix)) {
    factType = factType.substring(gcTypePrefix.length);
  }
  return factType;
}

function setEventDateAndPlaceForFact(result, fact) {
  if (fact.date) {
    if (fact.date.original) {
      result.eventDateOriginal = fact.date.original;
    }
    setFieldFromDate(fact.date, "/Date", "EVENT_DATE", result, "eventDate");
    setFieldFromDate(fact.date, "/Year", "EVENT_YEAR", result, "eventYear");
  }
  if (fact.place) {
    if (fact.place.original) {
      result.eventPlaceOriginal = fact.place.original;
    }
    setFieldFromPlace(fact.place, "", "EVENT_PLACE", result, "eventPlace");
    setFieldFromPlace(fact.place, "/RegistrationDistrict", "", result, "registrationDistrict");
    setFieldFromPlace(fact.place, "", "EVENT_PLACE_LEVEL_3", result, "eventPlaceL3");
    setFieldFromPlace(fact.place, "/County", "EVENT_PLACE_LEVEL_2", result, "eventPlaceL2");
    setFieldFromPlace(fact.place, "/Country", "EVENT_PLACE_LEVEL_1", result, "eventPlaceL1");
  }
}

function setDateAndPlaceForAdditionalFact(result, fact) {
  let factType = getFactType(fact);
  let prefix = factType;
  if (fact.date) {
    let date = getCleanDateValueFromDate(fact.date, "/Date", "EVENT_DATE");
    if (date) {
      result.recordData[prefix + " Date"] = date;
    }

    if (fact.date.original && fact.date.original != date) {
      result.recordData[prefix + " Date (Original)"] = fact.date.original;
    }

    if (!fact.date.original && !date) {
      let year = getCleanDateValueFromDate(fact.date, "/Year", "EVENT_YEAR");
      if (year) {
        result.recordData[prefix + " Year"] = year;
      }
    }
  }
  if (fact.place) {
    let place = getCleanPlaceValueFromPlace(fact.place, "", "EVENT_PLACE");
    if (place) {
      result.recordData[prefix + " Place"] = place;
    }

    if (fact.place.original && fact.place.original != place) {
      result.recordData[prefix + " Place (Original)"] = fact.place.original;
    }
  }
}

function doesLabelOverride(labelId, usedLabelId) {
  const overrides = {
    PR_AGE: ["PR_AGE_ORIG", "PR_AGE_IN_YEARS_ORIG"],
    PR_AGE_IN_YEARS_ORIG: ["NOTE_PR_AGE_ORIG"], // NOTE_PR_AGE_ORIG can be an invalid age like 0320000 (yyymmdd)
    PR_AGE_ORIG: ["NOTE_PR_AGE_ORIG"],
    PR_RELATIONSHIP_TO_HEAD: ["PR_RELATIONSHIP_TO_HEAD_ORIG"],
  };

  if (!labelId) {
    return false;
  }

  if (!usedLabelId) {
    return true;
  }

  let labelOverrides = overrides[labelId];
  if (labelOverrides && labelOverrides.includes(usedLabelId)) {
    return true;
  }

  return false;
}

var usedLabelIds = {};

function extractFields(result, fields, map) {
  if (!fields) {
    return;
  }

  for (let field of fields) {
    let fieldType = field.type;
    if (fieldType && field.values && field.values.length > 0) {
      const fsTypePrefix = "http://familysearch.org/types/fields/";
      const gcTypePrefix = "http://gedcomx.org/";
      if (fieldType.startsWith(fsTypePrefix)) {
        fieldType = fieldType.substring(fsTypePrefix.length);
      } else if (fieldType.startsWith(gcTypePrefix)) {
        fieldType = fieldType.substring(gcTypePrefix.length);
      }

      let resultProperty = map[fieldType];
      if (resultProperty) {
        for (let value of field.values) {
          const labelId = value.labelId;
          let doesOverride = doesLabelOverride(labelId, usedLabelIds[resultProperty]);

          if (!result[resultProperty] || doesOverride) {
            result[resultProperty] = value.text;
            usedLabelIds[resultProperty] = labelId;
          }
        }
      }
    }
  }
}

function findPersonById(dataObj, personId) {
  let persons = dataObj.persons;
  if (persons) {
    for (let person of persons) {
      if (person.id == personId) {
        return person;
      }
    }
  }
}

function getPrimaryNameForm(person) {
  // There can be multiple names and each name can have multiple nameforms.
  // Usually one name is marked as perferred.
  // First pick the promaryName

  let nameArray = person.names;
  if (!nameArray || nameArray.length == 0) {
    return undefined;
  }

  let preferredName = undefined;
  for (let name of nameArray) {
    if (name.preferred) {
      preferredName = name;
      break;
    }
  }

  let nameForms = [];

  if (preferredName) {
    for (let nameForm of preferredName.nameForms) {
      if (nameForm.parts) {
        nameForms.push(nameForm);
        break;
      }
    }
  } else {
    for (let name of nameArray) {
      // this usually seems to be "http://gedcomx.org/BirthName" but can also be
      // "http://gedcomx.org/AlsoKnownAs" which we ignore
      let nameType = name.type;
      if (nameType == "http://gedcomx.org/BirthName") {
        for (let nameForm of name.nameForms) {
          if (nameForm.parts) {
            nameForms.push(nameForm);
            break;
          }
        }
      }
    }
  }

  if (nameForms.length == 0) {
    // for some records there are no parts - just a full name
    if (nameArray && nameArray.length > 0) {
      for (let name of nameArray) {
        if (name.nameForms && name.nameForms.length > 0) {
          for (let nameForm of name.nameForms) {
            if (nameForm.fields) {
              nameForms.push(nameForm);
              break;
            }
          }
        }
      }
    }
  }

  if (nameForms.length == 0) {
    return undefined;
  }
  if (nameForms.length == 1) {
    return nameForms[0];
  }

  // there was more than one. The later ones could be corrected names. But sometimes the
  // corrected one is missing fields like fullName
  let firstNameForm = nameForms[0];
  let lastNameForm = nameForms[nameForms.length - 1];

  if (!lastNameForm.fullText) {
    let lastParts = {};
    if (lastNameForm.parts) {
      for (let part of lastNameForm.parts) {
        if (part.type.endsWith("Given")) {
          lastParts.givenName = part.value;
        } else if (part.type.endsWith("Surname")) {
          lastParts.surname = part.value;
        }
      }
    }
    if (lastParts.givenName && lastParts.surname) {
      lastNameForm.fullText = lastParts.givenName + " " + lastParts.surname;
    } else {
      let firstParts = {};
      if (firstNameForm.parts) {
        for (let part of firstNameForm.parts) {
          if (part.type.endsWith("Given")) {
            firstParts.givenName = part.value;
          } else if (part.type.endsWith("Surname")) {
            firstParts.surname = part.value;
          }
        }
      }

      if (!lastParts.givenName && firstParts.givenName) {
        lastParts.givenName = firstParts.givenName;
      }
      if (!lastParts.surname && firstParts.surname) {
        lastParts.surname = firstParts.surname;
      }

      if (lastParts.givenName && lastParts.surname) {
        lastNameForm.fullText = lastParts.givenName + " " + lastParts.surname;
      } else {
        // still can't make full name
        if (firstNameForm.fullText) {
          lastNameForm.fullText = firstNameForm.fullText;
        }
      }
    }
  }

  return lastNameForm;
}

function getNameForPersonObj(person, result) {
  let nameForm = getPrimaryNameForm(person);
  if (nameForm) {
    if (nameForm.fullText) {
      result.fullName = nameForm.fullText;
    }
    if (nameForm.parts) {
      for (let part of nameForm.parts) {
        if (part.value) {
          if (part.type.endsWith("Given")) {
            result.givenName = part.value;
          } else if (part.type.endsWith("Surname")) {
            result.surname = part.value;
          } else if (part.type.endsWith("Prefix")) {
            result.prefix = part.value;
          } else if (part.type.endsWith("Suffix")) {
            result.suffix = part.value;
          }
        }
      }
    }
  }
}

function getGenderForPersonObj(person, result) {
  // get gender
  if (person.gender && person.gender.type) {
    if (person.gender.type.endsWith("/Male")) {
      result.gender = "male";
    } else if (person.gender.type.endsWith("/Female")) {
      result.gender = "female";
    }
  }
}

function processRecordDataFactsForPersonObj(person, result) {
  // check the facts of this primary person for this persons vitals
  if (person.facts) {
    for (let fact of person.facts) {
      // the fact contains the place etc
      // it gets complicated when there is more than one person.
      // .principal seems to be whether they are one of the people being recorded
      // In a census all the people in the household are principals
      // In a birth registration the child is a principal and the mother is not
      if (fact.type) {
        let factType = getFactType(fact);
        if (fact.primary) {
          result.factType = factType;
          setEventDateAndPlaceForFact(result, fact);
        }

        //console.log("factType is " + factType);
        if (factType == "Birth") {
          //console.log("type is birth");
          if (fact.date) {
            if (fact.date.original) {
              result.birthDateOriginal = fact.date.original;
            }
            setFieldFromDate(fact.date, "/Date", "PR_BIR_DATE_EST", result, "birthDate");
            setFieldFromDate(fact.date, "/Year", "PR_BIR_YEAR_EST", result, "birthYear");
          }
          if (fact.place) {
            setFieldFromPlaceWithLabels(
              fact.place,
              [
                "PR_BIR_PLACE",
                "PR_BIR_PLACE_ORIG",
                "PR_BIRTH_PLACE",
                "PR_BIRTH_PLACE_ORIG",
                "BIRTH_PLACE",
                "BIRTH_PLACE_ORIG",
              ],
              result,
              "birthPlace"
            );
            if (!result.birthPlace && !person.principal) {
              // this birth information about a non-principal. e.g. the birth place of father
              // in a child's birth or death record. The label could be something like:
              // PR_FTHR_BIRTH_PLACE
              setFieldFromPlace(fact.place, "", "", result, "birthPlace");
            }
          }
        } else if (factType == "Death") {
          if (fact.date) {
            if (fact.date.original) {
              result.deathDateOriginal = fact.date.original;
            }
            setFieldFromDate(fact.date, "/Date", "PR_DEA_DATE", result, "deathDate");
            if (!result.deathDate) {
              setFieldFromDate(fact.date, "/Date", "PR_DEA_DATE_EST", result, "deathDate");
            }
            if (!result.deathDate) {
              setFieldFromDate(fact.date, "/Date", "PR_DEA_DATE_ORIG", result, "deathDate");
            }
            setFieldFromDate(fact.date, "/Year", "PR_DEA_YEAR_EST", result, "deathYear");
            setFieldFromDate(fact.date, "/Month", "PR_DEA_MONTH", result, "deathMonth");
          }
          if (fact.place) {
            setFieldFromPlace(fact.place, "", "PR_DEA_PLACE", result, "deathPlace");
          }
        } else if (factType == "Residence" || factType == "Census") {
          if (fact.place) {
            setFieldFromPlace(fact.place, "", "NOTE_PR_RES_PLACE", result, "residence");
          }
        }

        // build up record data that could be included in a data table
        addRecordDataForFact(result, fact, factType);
      }
    }
  }
}

function processPersonPageFactsForPersonObj(person, result) {
  // check the facts of this primary person for this persons vitals
  if (person.facts) {
    for (let fact of person.facts) {
      // the fact contains the place etc
      // it gets complicated when there is more than one person.
      // .principal seems to be whether they are one of the people being recorded
      // In a census all the people in the household are principals
      // In a birth registration the child is a principal and the mother is not
      if (fact.type) {
        let factType = getFactType(fact);

        //console.log("factType is " + factType);
        if (factType == "Birth") {
          //console.log("type is birth");
          setOriginalAndNormalizedField(fact.date, result, "birthDate");
          setOriginalAndNormalizedField(fact.place, result, "birthPlace");
        } else if (factType == "Death") {
          setOriginalAndNormalizedField(fact.date, result, "deathDate");
          setOriginalAndNormalizedField(fact.place, result, "deathPlace");
        } else if (factType == "Baptism" || factType == "Christening") {
          setOriginalAndNormalizedField(fact.date, result, "baptismDate");
          setOriginalAndNormalizedField(fact.place, result, "baptismPlace");
        } else if (factType == "Burial") {
          setOriginalAndNormalizedField(fact.date, result, "burialDate");
          setOriginalAndNormalizedField(fact.place, result, "burialPlace");
        }
      }
    }
  }
}

function addParentFromPerson(otherPerson, result) {
  // look for their name
  let parent = {};
  let nameForm = getPrimaryNameForm(otherPerson);
  if (nameForm) {
    parent.fullName = nameForm.fullText;
    if (nameForm.parts) {
      for (let part of nameForm.parts) {
        if (part.type.endsWith("Given")) {
          parent.givenName = part.value;
        } else if (part.type.endsWith("Surname")) {
          parent.surname = part.value;
        }
      }
    }
  }

  if (otherPerson.gender) {
    if (otherPerson.gender.type.endsWith("/Male")) {
      // it is the father
      result.father = parent;
    } else if (otherPerson.gender.type.endsWith("/Female")) {
      result.mother = parent;
    }
  }
}

function createParentForPerson(otherPerson) {
  // look for their name
  let parent = {};
  let nameForm = getPrimaryNameForm(otherPerson);
  if (nameForm) {
    parent.fullName = nameForm.fullText;
    if (nameForm.parts) {
      for (let part of nameForm.parts) {
        if (part.type.endsWith("Given")) {
          parent.givenName = part.value;
        } else if (part.type.endsWith("Surname")) {
          parent.surname = part.value;
        }
      }
    }
  }

  return parent;
}

function addParentFromRelationship(relationship, person, otherPerson, parentRelationships) {
  let gender = undefined;
  if (otherPerson.gender) {
    if (otherPerson.gender.type.endsWith("/Male")) {
      // it is the father
      gender = "male";
    } else if (otherPerson.gender.type.endsWith("/Female")) {
      gender = "female";
    }
  }

  let parentRelationship = {
    id: relationship.id,
    parentId: otherPerson.id,
    gender: gender,
  };

  parentRelationships.push(parentRelationship);
}

function extractDataFromPersonChildAndParentsRelationships(dataObj, parentRelationships) {
  function updateParentRelationship(cpRelationship, parentId, parentFacts, parentRelationships) {
    if (!parentFacts) {
      return;
    }
    for (let fact of parentFacts) {
      let typeId = "";
      let type = fact.type;
      if (type) {
        // "http://gedcomx.org/AdoptiveParent"
        if (type.includes("AdoptiveParent")) {
          typeId = "adoptive";
        }
      }

      if (typeId) {
        // go through result.parentRelationships and add the type
        for (let parentRelationship of parentRelationships) {
          let parentRelationshipId = parentRelationship.id;
          if (parentRelationshipId.length == 10) {
            // these ID typically have an extra P1 or P2 on the front
            parentRelationshipId = parentRelationshipId.substring(2);
          }
          if (parentRelationshipId == cpRelationship.id && parentRelationship.parentId == parentId) {
            if (!parentRelationship.type) {
              parentRelationship.type = typeId;
            }
          }
        }
      }
    }
  }

  let cpRelationships = dataObj.childAndParentsRelationships;
  for (let cpRelationship of cpRelationships) {
    if (cpRelationship.parent1) {
      updateParentRelationship(
        cpRelationship,
        cpRelationship.parent1.resourceId,
        cpRelationship.parent1Facts,
        parentRelationships
      );
    }

    if (cpRelationship.parent2) {
      updateParentRelationship(
        cpRelationship,
        cpRelationship.parent2.resourceId,
        cpRelationship.parent2Facts,
        parentRelationships
      );
    }
  }
}

function identifyPreferredParents(document, parentPairs) {
  // There is no way that I can see to get this through the API without special access
  // So we use the document to get it.
  if (!document) {
    return;
  }

  let couplePersonNodes = document.querySelectorAll("ul[data-testid=couple-persons]");

  for (let couple of couplePersonNodes) {
    let personNodes = couple.querySelectorAll("div[data-testid=person]");
    let coupleIds = [];
    for (let personNode of personNodes) {
      let pidButton = personNode.querySelector("button[data-testid=pid]");
      if (pidButton) {
        let pid = pidButton.textContent;
        coupleIds.push(pid);
      }
    }
    let isPreferred = false;
    let nodeBeforeCouple = couple.previousSibling;
    if (nodeBeforeCouple) {
      if (nodeBeforeCouple.textContent == "Preferred") {
        isPreferred = true;
      }
    }

    // now try to update parentRelationships if this one if preferred
    if (isPreferred) {
      for (let parentPair of parentPairs) {
        if (parentPair.parentCount == coupleIds.length) {
          let isMatch = true;
          if (parentPair.father && !coupleIds.includes(parentPair.father)) {
            isMatch = false;
          }
          if (parentPair.mother && !coupleIds.includes(parentPair.mother)) {
            isMatch = false;
          }

          if (isMatch) {
            parentPair.isPreferred = true;
            break;
          }
        }
      }
    }
  }
}

function extractPersonDataFromFetch(document, dataObj, options) {
  let result = {};

  if (document) {
    result.url = document.URL;
  }

  // there could be many people in this data, the description is one way to find out which
  // is the one that is being focused on
  let description = dataObj.description;

  if (!description) {
    // this could be an image page which is not handled currently
    return result;
  }

  // For a person page the descript will be something like: "#SD-G8S8-5FJ" meaning the personId is:
  // "G8S8-5FJ"
  let personId = description.replace(/^\#SD\-/, "");
  result.personId = personId;

  if (!dataObj.persons || dataObj.persons.length < 1) {
    return result;
  }

  let person = dataObj.persons[0];

  if (person.id != personId) {
    return result;
  }

  getNameForPersonObj(person, result);
  getGenderForPersonObj(person, result);
  processPersonPageFactsForPersonObj(person, result);

  // now look for relationships for spouse and parents
  if (dataObj.relationships) {
    let parentRelationships = [];

    for (let relationship of dataObj.relationships) {
      let otherPersonId = "";
      let type = relationship.type;
      if (relationship.person1.resourceId == personId) {
        otherPersonId = relationship.person2.resourceId;
      } else if (relationship.person2.resourceId == personId) {
        otherPersonId = relationship.person1.resourceId;
      }

      if (otherPersonId) {
        let otherPerson = findPersonById(dataObj, otherPersonId);

        if (type == "http://gedcomx.org/Couple") {
          let spouse = {};
          getNameForPersonObj(otherPerson, spouse);

          if (relationship.facts) {
            for (let fact of relationship.facts) {
              if (fact.type == "http://gedcomx.org/Marriage") {
                if (fact.date) {
                  if (fact.date.original) {
                    spouse.marriageDateOriginal = fact.date.original;
                  }
                  if (fact.date.normalized) {
                    for (let normDate of fact.date.normalized) {
                      if (normDate.value && normDate.lang == "en") {
                        spouse.marriageDate = normDate.value;
                        break;
                      }
                    }
                  }
                }
                if (fact.place) {
                  if (fact.place.original) {
                    spouse.marriagePlaceOriginal = fact.place.original;
                  }
                  if (fact.place.normalized) {
                    for (let normPlace of fact.place.normalized) {
                      if (normPlace.value && normPlace.lang == "en") {
                        spouse.marriagePlace = normPlace.value;
                        break;
                      }
                    }
                  }
                }
              }
            }
          }

          if (!result.spouses) {
            result.spouses = [];
          }
          result.spouses.push(spouse);
        } else if (type == "http://gedcomx.org/ParentChild") {
          if (relationship.person2.resourceId == personId) {
            // this person is the child
            addParentFromRelationship(relationship, person, otherPerson, parentRelationships);
          }
        }
      }
    }

    // use this to identify adoptive parents
    if (dataObj.childAndParentsRelationships) {
      extractDataFromPersonChildAndParentsRelationships(dataObj, parentRelationships);
    }

    // there can be multiple parents, we need to select the best ones
    // We know if they are marked as adoptive.
    // We have to use the document to see which is marked preferred.
    // So we prioritize the first unless it is adoptive and there is another one.

    let parentPairs = [];
    for (let parentRelationship of parentRelationships) {
      let id = parentRelationship.id;
      if (id.length == 10) {
        // relationship tends to have P1 or P2 on start like P19Y97-QFV
        id = id.substring(2);
      }
      let parentPair = parentPairs.find((element) => element.id == id);
      if (!parentPair) {
        parentPair = { id: id, parentCount: 0, adoptiveCount: 0 };
        parentPairs.push(parentPair);
      }

      if (parentRelationship.gender == "male") {
        if (!parentPair.father) {
          parentPair.father = parentRelationship.parentId;
          parentPair.fatherType = parentRelationship.type;
          parentPair.parentCount++;
          if (parentRelationship.type == "adoptive") {
            parentPair.adoptiveCount++;
          }
        }
      } else if (parentRelationship.gender == "female") {
        if (!parentPair.mother) {
          parentPair.mother = parentRelationship.parentId;
          parentPair.motherType = parentRelationship.type;
          parentPair.parentCount++;
          if (parentRelationship.type == "adoptive") {
            parentPair.adoptiveCount++;
          }
        }
      }
    }

    identifyPreferredParents(document, parentPairs);

    let bestRelationshipPair = undefined;

    for (let parentPair of parentPairs) {
      if (!bestRelationshipPair) {
        bestRelationshipPair = parentPair;
      } else {
        // only change if this one if better
        if (!bestRelationshipPair.isPreferred && parentPair.isPreferred) {
          bestRelationshipPair = parentPair;
        } else if (bestRelationshipPair.parentCount < parentPair.parentCount) {
          if (!(bestRelationshipPair.adoptiveCount == 0 && parentPair.adoptiveCount > 0)) {
            bestRelationshipPair = parentPair;
          }
        } else if (bestRelationshipPair.adoptiveCount > parentPair.adoptiveCount) {
          bestRelationshipPair = parentPair;
        }
      }
    }

    if (bestRelationshipPair) {
      let father = findPersonById(dataObj, bestRelationshipPair.father);
      if (father) {
        result.father = createParentForPerson(father);
      }
      let mother = findPersonById(dataObj, bestRelationshipPair.mother);
      if (mother) {
        result.mother = createParentForPerson(mother);
      }
    }
  }

  // extract the source IDs we can use these to fetch the source data if needed
  if (person && person.sources) {
    result.sourceIds = [];

    for (let source of person.sources) {
      if (source.descriptionId) {
        result.sourceIds.push(source.descriptionId);
      }
    }
  }

  result.pageType = "person";
  return result;
}

function extractDataFromFetch(document, url, dataObjects, fetchType, options) {
  usedLabelIds = {};

  let result = {};

  let dataObj = dataObjects.dataObj;

  if (document) {
    result.url = document.URL;
  }

  if (fetchType == "person") {
    return extractPersonDataFromFetch(document, dataObj, options);
  }

  // there could be many people in this data, the description is one way to find out which
  // is the one that is being focused on
  let description = dataObj.description;

  if (!description) {
    // this could be an image page which is not handled currently
    return result;
  }

  let personId = description.replace(/^.*(p_\d*)$/, "$1");

  let personIdWithRelatedFact = undefined;
  let relatedPersonFactType = undefined;

  result.recordData = {};

  let thisPersonIsAPrincipal = false;

  let persons = dataObj.persons;
  if (persons) {
    for (let person of persons) {
      if (person.id == personId) {
        // this is the person that the page is about
        getNameForPersonObj(person, result);
        if (result.fullName) {
          result.recordData["Name"] = result.fullName;
        }

        getGenderForPersonObj(person, result);
        processRecordDataFactsForPersonObj(person, result);

        // check the fields associated with this person
        if (person.fields) {
          processFields(result, person.fields, "primaryPerson");
        }
      }
      if (person.facts) {
        for (let fact of person.facts) {
          // the fact contains the place etc
          // it gets complicated when there is more than one person.
          // .principal seems to be whether they are one of the people being recorded
          // In a census all the people in the household are principals
          // In a birth registration the child is a principal and the mother is not
          if (fact.type) {
            let factType = getFactType(fact);

            if (fact.primary) {
              setEventDateAndPlaceForFact(result, fact);

              if (person.principal) {
                if (person.id == personId) {
                  thisPersonIsAPrincipal = true;
                  // forget any other person who was a principal
                  personIdWithRelatedFact = undefined;
                  relatedPersonFactType = undefined;
                } else if (!thisPersonIsAPrincipal && !personIdWithRelatedFact) {
                  // We have a fact type but it is not for the person of interest
                  // This is the first such case we have found
                  relatedPersonFactType = factType;
                  personIdWithRelatedFact = person.id;
                }
              }
            }
          }
        }
      }
    }
  }

  let relationships = dataObj.relationships;
  if (relationships) {
    let personIdWithRelatedFact2 = undefined;
    // go through the list one looking for relationships with facts
    // we need to do this before looking at the relationships with no facts since we need the
    // factType to process those.
    for (let relationship of relationships) {
      if (relationship.facts) {
        for (let fact of relationship.facts) {
          if (fact.type && !result.factType) {
            let factType = getFactType(fact);

            if (fact.primary) {
              setEventDateAndPlaceForFact(result, fact);
            }

            // if one of the people in this fact is the selected person
            if (relationship.person1.resourceId == personId || relationship.person2.resourceId == personId) {
              result.factType = factType;

              // build up record data that could be included in a data table
              addRecordDataForFact(result, fact, factType);

              // if this is a marriage then add a spouse if possible
              if (factType.startsWith("Marriage")) {
                let otherPersonId = relationship.person2.resourceId;
                if (relationship.person2.resourceId == personId) {
                  otherPersonId = relationship.person1.resourceId;
                }

                let otherPerson = findPersonById(dataObj, otherPersonId);

                if (otherPerson) {
                  // look for their name
                  let nameForm = getPrimaryNameForm(otherPerson);
                  if (nameForm) {
                    result.spouseFullName = nameForm.fullText;
                    if (nameForm.parts) {
                      for (let part of nameForm.parts) {
                        if (part.type.endsWith("Given")) {
                          result.spouseGivenName = part.value;
                        } else if (part.type.endsWith("Surname")) {
                          result.spouseSurname = part.value;
                        }
                      }
                    }
                  }

                  if (otherPerson.fields) {
                    const personFieldsMap = {
                      Age: "spouseAge",
                    };
                    extractFields(result, otherPerson.fields, personFieldsMap);
                  }
                }
              }
            } else if (!personIdWithRelatedFact) {
              relatedPersonFactType = factType;
              personIdWithRelatedFact = relationship.person1.resourceId;
              personIdWithRelatedFact2 = relationship.person2.resourceId;
            }
          } else if (fact.type) {
            // we already have a factType for the result and we have found a new fact
            // It could contain useful dates and places so don't ignore it. For example:
            // https://www.familysearch.org/ark:/61903/1:1:QVJ8-SFH9?from=lynx1UIV8&treeref=L8PL-J4M
            // The main (primary) fact (MarriageRegistration) has no date. But there is a Marriage
            // fact with a date.
            setDateAndPlaceForAdditionalFact(result, fact);
          }
        }
      }
    }

    // go through the list a second time looking for relationships with no facts
    for (let relationship of relationships) {
      if (!relationship.facts) {
        // relationship has no fact. this tends to be the case for a baptism or christening and
        // we need these relationships to find the parents
        if (
          result.factType == "Christening" ||
          result.factType == "Baptism" ||
          result.factType == "Birth" ||
          result.factType == "Death" ||
          result.factType == "Marriage"
        ) {
          // if one of the people in this fact is the selected person
          let otherPersonId = undefined;
          if (relationship.person1.resourceId == personId) {
            otherPersonId = relationship.person2.resourceId;
          } else if (relationship.person2.resourceId == personId) {
            otherPersonId = relationship.person1.resourceId;
          }
          if (otherPersonId) {
            let otherPerson = findPersonById(dataObj, otherPersonId);
            if (otherPerson) {
              let relationType = relationship.type;
              if (relationType.endsWith("/ParentChild")) {
                // other person is either father or mother
                addParentFromPerson(otherPerson, result);
              } else if (relationType.endsWith("/Couple")) {
                // other person is spouse
                // look for their name
                let nameForm = getPrimaryNameForm(otherPerson);
                if (nameForm) {
                  result.spouseFullName = nameForm.fullText;
                  if (nameForm.parts) {
                    for (let part of nameForm.parts) {
                      if (part.type.endsWith("Given")) {
                        result.spouseGivenName = part.value;
                      } else if (part.type.endsWith("Surname")) {
                        result.spouseSurname = part.value;
                      }
                    }
                  }
                }
                if (otherPerson.fields) {
                  const personFieldsMap = {
                    Age: "spouseAge",
                  };
                  extractFields(result, otherPerson.fields, personFieldsMap);
                }
              }
            }
          }
        }
      }
    }

    if (relatedPersonFactType) {
      // go through relationships again looking for the relationship
      // We have three possible person IDs that are principal to the fact:
      // personIdWithRelatedFact (usually set for a child death/baptism, or could be bride or groom)
      // personIdWithRelatedFact2 (usually set for a child marriage - will be bride or groom)
      result.relatedPersonFactType = relatedPersonFactType;

      let primaryPersonId = undefined;
      let twoStepRelationshipToPerson = undefined;
      let twoStepPrimaryPersonId = undefined;

      for (let relationship of relationships) {
        let relationType = undefined;
        let relationshipToPerson = undefined;
        let otherPersonId = undefined;
        if (relationship.person1.resourceId == personId) {
          // This relationship involves the selected person
          otherPersonId = relationship.person2.resourceId;
          relationType = relationship.type;
          if (relationType.endsWith("/ParentChild")) {
            relationshipToPerson = "Parent";
          } else if (relationType.endsWith("/Couple")) {
            relationshipToPerson = "Spouse";
          }
        } else if (relationship.person2.resourceId == personId) {
          otherPersonId = relationship.person1.resourceId;
          // person 1 of this relationship is the person that the fact is about and is related to our person
          relationType = relationship.type;
          if (relationType.endsWith("/ParentChild")) {
            relationshipToPerson = "Child";
          } else if (relationType.endsWith("/Couple")) {
            relationshipToPerson = "Spouse";
          }
        }

        if (relationshipToPerson) {
          if (otherPersonId == personIdWithRelatedFact || otherPersonId == personIdWithRelatedFact2) {
            result.relationshipToFactPerson = relationshipToPerson;
            primaryPersonId = otherPersonId;
            break; // we have found the relationship and set relationshipToFactPerson
          }
        }

        // if we still don't have relationshipToFactPerson set then it could be a two step
        // relationship. E.g. a baptism of the grandchild of the primary person.
        // e.g.: https://www.familysearch.org/ark:/61903/1:1:XTYV-JG6
        // So, this relationship is not a direct relationship to personIdWithRelatedFact
        // but it could be indirect

        if (otherPersonId && relationshipToPerson && !twoStepRelationshipToPerson) {
          for (let twoStepRelationship of relationships) {
            let step2RelationType = undefined;
            let step2RelationshipToPerson = undefined;
            let nextOtherPersonId = undefined;
            if (twoStepRelationship.person1.resourceId == otherPersonId) {
              nextOtherPersonId = twoStepRelationship.person2.resourceId;
              step2RelationType = twoStepRelationship.type;
              if (step2RelationType.endsWith("/ParentChild")) {
                step2RelationshipToPerson = "Parent";
              } else if (step2RelationType.endsWith("/Couple")) {
                step2RelationshipToPerson = "Spouse";
              }
            } else if (twoStepRelationship.person2.resourceId == otherPersonId) {
              nextOtherPersonId = twoStepRelationship.person1.resourceId;
              step2RelationType = twoStepRelationship.type;
              if (step2RelationType.endsWith("/ParentChild")) {
                step2RelationshipToPerson = "Child";
              } else if (step2RelationType.endsWith("/Couple")) {
                step2RelationshipToPerson = "Spouse";
              }
            }

            if (step2RelationshipToPerson) {
              if (nextOtherPersonId == personIdWithRelatedFact || nextOtherPersonId == personIdWithRelatedFact2) {
                // we have found a 2 step relationship

                twoStepRelationshipToPerson = "Other";
                if (relationshipToPerson == "Child") {
                  if (step2RelationshipToPerson == "Child") {
                    twoStepRelationshipToPerson = "Grandchild";
                  } else if (step2RelationshipToPerson == "Spouse") {
                    twoStepRelationshipToPerson = "SpouseOfChild";
                  }
                } else if (relationshipToPerson == "Parent") {
                  if (step2RelationshipToPerson == "Parent") {
                    twoStepRelationshipToPerson = "Grandparent";
                  }
                } else if (relationshipToPerson == "Spouse") {
                  if (step2RelationshipToPerson == "Parent") {
                    twoStepRelationshipToPerson = "ParentOfSpouse";
                  }
                }
                twoStepPrimaryPersonId = nextOtherPersonId;
                break;
              }
            }
          }
        }
      }

      if (!(result.relationshipToFactPerson && primaryPersonId)) {
        if (twoStepRelationshipToPerson && twoStepPrimaryPersonId) {
          result.relationshipToFactPerson = twoStepRelationshipToPerson;
          primaryPersonId = twoStepPrimaryPersonId;
        }
      }

      if (result.relationshipToFactPerson && primaryPersonId) {
        let otherPerson = findPersonById(dataObj, primaryPersonId);

        if (otherPerson) {
          // look for their name
          let nameForm = getPrimaryNameForm(otherPerson);
          if (nameForm) {
            result.relatedPersonFullName = nameForm.fullText;
            if (nameForm.parts) {
              for (let part of nameForm.parts) {
                if (part.type.endsWith("Given")) {
                  result.relatedPersonGivenName = part.value;
                } else if (part.type.endsWith("Surname")) {
                  result.relatedPersonSurname = part.value;
                }
              }
            }
          }

          // get gender
          if (otherPerson.gender) {
            if (otherPerson.gender.type.endsWith("/Male")) {
              result.relatedPersonGender = "male";
            } else if (otherPerson.gender.type.endsWith("/Female")) {
              result.relatedPersonGender = "female";
            }
          }

          if (relatedPersonFactType == "Marriage") {
            let spouse = undefined;

            if (primaryPersonId == personIdWithRelatedFact && personIdWithRelatedFact2) {
              spouse = findPersonById(dataObj, personIdWithRelatedFact2);
            } else if (primaryPersonId == personIdWithRelatedFact2 && personIdWithRelatedFact) {
              spouse = findPersonById(dataObj, personIdWithRelatedFact);
            }

            if (spouse) {
              let nameForm = getPrimaryNameForm(spouse);
              if (nameForm) {
                result.relatedPersonSpouseFullName = nameForm.fullText;
                if (nameForm.parts) {
                  for (let part of nameForm.parts) {
                    if (part.type.endsWith("Given")) {
                      result.relatedPersonSpouseGivenName = part.value;
                    } else if (part.type.endsWith("Surname")) {
                      result.relatedPersonSpouseSurname = part.value;
                    }
                  }
                }
              }
            }
          }

          // If we could not get an event date we may be able to get a birth or death date
          // from this related person. For example if this record is a child burial with no burial
          // date for the child but does have a death dae for the child.
          if (!result.eventDate && !result.eventDateOriginal) {
            if (otherPerson.facts) {
              for (let fact of otherPerson.facts) {
                if (fact.type) {
                  let factType = getFactType(fact);
                  if (factType == "Birth") {
                    setFieldFromDate(fact.date, "/Date", "PR_BIR_DATE", result, "relatedPersonBirthDate");
                    setFieldFromDate(fact.date, "/Year", "PR_BIR_YEAR", result, "relatedPersonBirthYear");
                  } else if (factType == "Death") {
                    setFieldFromDate(fact.date, "/Date", "PR_DEA_DATE", result, "relatedPersonDeathDate");
                    setFieldFromDate(fact.date, "/Year", "PR_DEA_YEAR", result, "relatedPersonDeathYear");
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // build household table for census
  if (result.factType == "Census" || (result.factType == "Residence" && persons.length > 1)) {
    let persons = dataObj.persons;

    result.household = {};
    result.household.headings = [
      "fullName",
      "givenName",
      "surname",
      "relationship",
      "maritalStatus",
      "gender",
      "age",
      "occupation",
      "birthDateOriginal",
      "birthYear",
      "birthPlaceOriginal",
      "birthPlace",
    ];
    result.household.members = [];

    let allowSortByLineNumber = true;

    for (let person of persons) {
      let member = {};

      if (person.id == personId) {
        member.isSelected = true;
      }

      // look for their name
      if (person.names) {
        let nameForm = getPrimaryNameForm(person);
        if (nameForm) {
          member.fullName = nameForm.fullText;
          if (nameForm.parts) {
            for (let part of nameForm.parts) {
              if (part.type.endsWith("Given")) {
                member.givenName = part.value;
              } else if (part.type.endsWith("Surname")) {
                member.surname = part.value;
              }
            }
          }
        }
      } else {
        // no name, this happes for closed records (e.g. england_census_1939_ellen_day)
        // but also for slaves (e.g. us_va_census_slaves_1850_jesse_jeter)
        if (!person.gender) {
          member.isClosed = true;
        }
      }

      // get gender
      if (person.gender && person.gender.type) {
        if (person.gender.type.endsWith("/Male")) {
          member.gender = "male";
        } else if (person.gender.type.endsWith("/Female")) {
          member.gender = "female";
        }
      }

      // check the facts of this primary person for this persons vitals
      if (person.facts) {
        for (let fact of person.facts) {
          if (fact.type) {
            let factType = getFactType(fact);

            //console.log("factType is " + factType);
            if (factType == "Birth") {
              //console.log("type is birth");
              if (fact.date) {
                if (fact.date.original) {
                  member.birthDateOriginal = fact.date.original;
                }
                setFieldFromDate(fact.date, "/Date", "PR_BIR_DATE_EST", member, "birthDate");
                setFieldFromDate(fact.date, "/Year", "PR_BIR_YEAR_EST", member, "birthYear");
              }
              if (fact.place) {
                if (fact.place.original) {
                  member.birthPlaceOriginal = fact.place.original;
                }
                setFieldFromPlace(fact.place, "", "PR_BIR_PLACE", member, "birthPlace");
              }
            } else if (factType == "MaritalStatus") {
              if (fact.value) {
                member.maritalStatus = fact.value;
              }
            } else if (factType == "Occupation") {
              if (fact.value) {
                member.occupation = fact.value;
              }
            } else if (factType == "Age") {
              if (fact.values) {
                for (let value of fact.values) {
                  if (value.labelId == "PR_AGE") {
                    member.age = value.text;
                  }
                }
              }
            } else if (factType == "RelationshipToHead") {
              if (fact.values) {
                for (let value of fact.values) {
                  if (value.labelId == "PR_RELATIONSHIP_TO_HEAD_ORIG") {
                    member.relationship = value.text;
                  }
                }
              }
            } else if (factType == "RelationshipToHeadCode" && !member.relationship) {
              if (fact.values) {
                for (let value of fact.values) {
                  if (value.labelId == "PR_RELATIONSHIP_CODE") {
                    member.relationship = value.text;
                  }
                }
              }
            }
          }
        }
      }

      if (person.fields) {
        const personFieldsMap = {
          Age: "age",
          RelationshipToHeadCode: "relationship",
          RelationshipToHead: "relationship",
          RelationshipToOwner: "relationship", // only for slaves
          Relationship: "relationship",
          SourceSheetNbr: "sheetNumber",
          SourceLineNbr: "lineNumber",
        };
        extractFields(member, person.fields, personFieldsMap);
      }

      result.household.members.push(member);
    }

    // special case for slave records
    let isSlaveCensus = false;
    let ownerIndex = 0;
    for (let memberIndex = 0; memberIndex < result.household.members.length; memberIndex++) {
      let member = result.household.members[memberIndex];
      if (member.relationship && member.relationship.toLowerCase() == "slave") {
        // this is a slave record
        isSlaveCensus = true;
      } else if (member.relationship && member.relationship.toLowerCase() == "owner") {
        // this is the owner in a slave record
        if (!ownerIndex) {
          ownerIndex = memberIndex;
        }
      }
    }

    if (isSlaveCensus) {
      // For some reason the owner of often after the first slave, try to correct
      if (ownerIndex == 1) {
        let swap = result.household.members[0];
        result.household.members[0] = result.household.members[1];
        result.household.members[1] = swap;
      }

      // there may be a better way to do this. In the slaves example there are two
      // columns so we don't want to search by line number.
      allowSortByLineNumber = false;
    }

    // The members can be in a different order to how they appear in the census
    // I have only seen this in the US 1940 Federal Census. E.g. us_census_1940_addie_bullock
    // if we have line numbers we can reorder them
    // However, if there are two columns on the page this messes things up. e.g.
    // us_va_census_slaves_1850_jesse_jeter
    if (allowSortByLineNumber) {
      let hasLineNumbers = true;
      for (let member of result.household.members) {
        if (!member.lineNumber) {
          hasLineNumbers = false;
          break;
        }
        if (isNaN(Number(member.lineNumber))) {
          hasLineNumbers = false;
          break;
        }
      }
      let hasSheetNumbers = true;
      for (let member of result.household.members) {
        if (!member.sheetNumber) {
          hasSheetNumbers = false;
          break;
        }
        if (isNaN(Number(member.sheetNumber))) {
          hasSheetNumbers = false;
          break;
        }
      }

      if (hasLineNumbers && hasSheetNumbers) {
        // sort by line number
        result.household.members.sort(function (a, b) {
          let sheetDiff = Number(a.sheetNumber) - Number(b.sheetNumber);
          let lineDiff = Number(a.lineNumber) - Number(b.lineNumber);
          if (sheetDiff === 0) {
            return lineDiff;
          }
          return sheetDiff;
        });
      } else if (hasLineNumbers) {
        // sort by line number
        result.household.members.sort((a, b) => (Number(a.lineNumber) > Number(b.lineNumber) ? 1 : -1));
      }
    }

    // now remove any line numbers as we don't need them in the extracted data
    for (let member of result.household.members) {
      delete member.lineNumber;
      delete member.sheetNumber;
    }
  }

  processFields(result, dataObj.fields, "topLevel");

  if (dataObj.sourceDescriptions) {
    for (let source of dataObj.sourceDescriptions) {
      // there are different source descriptions for different people or records
      if (source.id && source.id.endsWith(personId)) {
        if (source.citations && source.citations.length > 0) {
          result.citation = source.citations[0].value.trim();
        }
        if (source.titles && source.titles.length > 0) {
          result.sourceTitleForPerson = source.titles[0].value;
        }
        result.personRecordUrl = source.about;
      }

      if (source.resourceType) {
        if (source.resourceType.endsWith("Collection")) {
          if (source.titles && source.titles.length > 0) {
            result.collectionTitle = source.titles[0].value;
          }
          // The US 1950 census doesn't have the collection Id in the normal place
          if (!result.fsCollectionId) {
            if (source.about && source.about.indexOf("/records/collections/") != -1) {
              let collectionId = source.about.replace(/^.*\/records\/collections\/(\d+)$/, "$1");
              if (collectionId && collectionId != source.about) {
                result.fsCollectionId = collectionId;
              }
            }
          }
          if (!result.fsCollectionId) {
            // example:
            //       "http://gedcomx.org/Primary" : [ "https://api.familysearch.org/platform/records/collections/4464515" ]
            if (source.identifiers && source.identifiers["http://gedcomx.org/Primary"]) {
              let idArray = source.identifiers["http://gedcomx.org/Primary"];
              if (idArray.length > 0 && idArray[0]) {
                let collectionId = idArray[0].replace(/^.*\/records\/collections\/(\d+)$/, "$1");
                if (collectionId && collectionId != idArray[0]) {
                  result.fsCollectionId = collectionId;
                }
              }
            }
          }
        }

        if (source.resourceType.endsWith("Record")) {
          result.recordUrl = source.about;
        }

        if (source.resourceType.endsWith("DigitalArtifact") && !result.digitalArtifact) {
          // digitalArtifact property will get deleted later in processImageLinks in all but rare cases
          // There can be multiple digitalArctifact sources, we just use the first for now
          // An example is a census (see england_census_1911_peter_delamotte), there can be an image link
          // to the same image for each houshold member, not obvious how to find the one for the primary person
          result.digitalArtifact = source.about;
        }
      }
    }
  }

  processImageLinks(document, result, options);

  result.pageType = "record";

  //console.log("extractDataFromFetch result is:");
  //console.log(result);

  return result;
}

export { extractData, extractDataFromFetch };
