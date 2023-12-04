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

function cleanLabel(label) {
  if (!label) {
    return label;
  }
  label = label.trim();
  if (label.endsWith(":")) {
    label = label.substring(0, label.length - 1);
  }

  // I considered changing all labels to lower case but that doesn't
  // work when I want to include the label in a string like the Source Reference

  return label;
}

function getPlaceElementText(placeElement) {
  let placeString = "";
  if (placeElement) {
    let calloutLink = placeElement.querySelector("div.mapCalloutContainer > span.map_callout_link ");
    if (calloutLink) {
      for (let node of calloutLink.childNodes) {
        if (node.nodeType == 3) {
          placeString = node.textContent;
          break;
        }
      }
    }
    if (!placeString) {
      placeString = placeElement.textContent;
    }
  }
  if (placeString) {
    return placeString.trim();
  }
}

function addField(resultObject, labelElement, valueElement, rowElement) {
  if (labelElement && valueElement) {
    let labelText = cleanLabel(labelElement.textContent);

    let dataFieldId = "";
    if (rowElement) {
      let id = rowElement.getAttribute("data-field-id");
      if (id) {
        dataFieldId = id;
      }
    }
    if (!dataFieldId) {
      dataFieldId = labelText;
    }

    if (labelText) {
      let valueObj = { label: labelText };

      let eventDateElement = valueElement.querySelector("span.event_date");
      let eventPlaceElement = valueElement.querySelector("span.event_place");
      if (eventDateElement || eventPlaceElement) {
        if (eventDateElement) {
          let dateString = eventDateElement.textContent;
          if (dateString) {
            valueObj.dateString = dateString;
          }
        }
        if (eventPlaceElement) {
          let placeString = getPlaceElementText(eventPlaceElement);
          if (placeString) {
            valueObj.placeString = placeString.trim();
          }
        }
      } else {
        // for a person page the events do not have spans, check for that
        let eventSeparators = valueElement.querySelectorAll("div.eventSeparator");
        if (eventSeparators.length > 0) {
          let hasValueBeforeDate = false;
          if (eventSeparators.length > 1) {
            hasValueBeforeDate = true;
          }

          let childNodes = valueElement.childNodes;
          if (
            hasValueBeforeDate &&
            childNodes.length > 4 &&
            childNodes[0].nodeType == 3 &&
            childNodes[2].nodeType == 3
          ) {
            let descriptionString = childNodes[0].textContent;
            if (descriptionString) {
              valueObj.descriptionString = descriptionString.trim();
            }
            let dateString = childNodes[2].textContent;
            if (dateString) {
              valueObj.dateString = dateString.trim();
            }
          } else if (childNodes.length > 0 && childNodes[0].nodeType == 3) {
            let dateString = childNodes[0].textContent;
            if (dateString) {
              valueObj.dateString = dateString.trim();
            }
          }

          let placeString = getPlaceElementText(valueElement);
          if (placeString) {
            valueObj.placeString = placeString.trim();
          }
        } else {
          // it could be a sub-table
          let valueTable = valueElement.querySelector("table");
          if (valueTable) {
            let valueRows = valueTable.querySelectorAll("tr");
            for (let valueRow of valueRows) {
              let cells = valueRow.querySelectorAll("td");
              if (cells.length == 2) {
                let subLabel = cleanLabel(cells[0].textContent);

                let value = "";
                let placeString = getPlaceElementText(cells[1]);
                if (placeString) {
                  value = placeString;
                } else {
                  value = cells[1].textContent.trim();
                }
                valueObj[subLabel] = value;
              }
            }
          } else {
            // it could be a simple value or multiple values (like "Siblings")
            let spanElements = valueElement.querySelectorAll("span");
            if (spanElements.length > 0) {
              let valueString = "";
              let values = [];
              for (let span of spanElements) {
                if (!span.classList.contains("record_annotation")) {
                  let textContent = span.textContent.trim();
                  if (textContent) {
                    if (valueString) {
                      valueString += ", ";
                    }
                    valueString += textContent;
                    values.push(textContent);
                  }
                }
              }
              if (!valueString) {
                let textContent = valueElement.textContent.trim();
                if (textContent) {
                  valueString = textContent;
                }
              }
              valueObj.value = valueString;

              if (values.length > 1) {
                valueObj.values = values;
              }
            } else {
              let valueString = valueElement.textContent.trim();
              valueObj.value = valueString;
            }
          }
        }
      }
      resultObject[dataFieldId] = valueObj;
    }
  }
}

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  let recordBody = document.querySelector("#record_body");
  if (!recordBody) {
    return result;
  }

  let recordDectective = document.querySelector("#record_detective_root");

  let collectionInfoBoxTitle = recordDectective.querySelector("div.collection_info_box_title");

  if (collectionInfoBoxTitle) {
    result.collectionTitle = collectionInfoBoxTitle.textContent.trim();
  }

  if (result.collectionTitle == "MyHeritage Family Trees") {
    result.pageType = "person";
  } else if (result.collectionTitle == "Geni World Family Tree") {
    result.pageType = "person";
  } else {
    result.pageType = "record";
  }

  let recordHeader = recordBody.querySelector("div.record_header");
  if (!recordHeader) {
    return result;
  }

  let recordTitle = recordHeader.querySelector("div.record_title");
  if (recordTitle) {
    result.recordTitle = recordTitle.textContent.trim();
  }

  let recordMainContent = recordBody.querySelector("div.record_main_content");
  if (!recordMainContent) {
    return result;
  }

  let recordImage = recordMainContent.querySelector("div.recordImage");
  if (recordImage) {
    let maleImage = recordImage.querySelector("div[class*='_M_']");
    if (maleImage) {
      result.personGender = "male";
    } else {
      let femaleImage = recordImage.querySelector("div[class*='_F_']");
      if (femaleImage) {
        result.personGender = "female";
      }
    }
  }

  let recordFieldsTables = recordMainContent.querySelectorAll("table.recordFieldsTable");
  if (recordFieldsTables.length == 0) {
    return result;
  }

  let primaryTable = recordFieldsTables[0];
  let rows = primaryTable.querySelectorAll("tr.recordFieldsRow");
  if (rows.length > 0) {
    result.recordData = {};
    for (let row of rows) {
      let labelElement = row.querySelector("td.recordFieldLabel");
      let valueElement = row.querySelector("td.recordFieldValue");

      addField(result.recordData, labelElement, valueElement, row);

      /*
      if (labelElement && valueElement) {
        let labelText = cleanLabel(labelElement.textContent);

        if (labelText) {
          let eventDateElement = valueElement.querySelector("span.event_date");
          let eventPlaceElement = valueElement.querySelector("span.event_place");
          if (eventDateElement || eventPlaceElement) {
            let valueObj = {};
            if (eventDateElement) {
              let dateString = eventDateElement.textContent;
              if (dateString) {
                valueObj.dateString = dateString;
              }
            }
            if (eventPlaceElement) {
              let placeString = getPlaceElementText(eventPlaceElement);
              if (placeString) {
                valueObj.placeString = placeString.trim();
              }
            }
            result.recordData[labelText] = valueObj;
          } else {
            // for a person page the events do not have spans, check for that
            let eventSeparators = valueElement.querySelectorAll("div.eventSeparator");
            if (eventSeparators.length > 0) {
              let valueObj = {};

              let hasValueBeforeDate = false;
              if (eventSeparators.length > 1) {
                hasValueBeforeDate = true;
              }

              let childNodes = valueElement.childNodes;
              if (
                hasValueBeforeDate &&
                childNodes.length > 4 &&
                childNodes[0].nodeType == 3 &&
                childNodes[2].nodeType == 3
              ) {
                let descriptionString = childNodes[0].textContent;
                if (descriptionString) {
                  valueObj.descriptionString = descriptionString.trim();
                }
                let dateString = childNodes[2].textContent;
                if (dateString) {
                  valueObj.dateString = dateString.trim();
                }
              } else if (childNodes.length > 0 && childNodes[0].nodeType == 3) {
                let dateString = childNodes[0].textContent;
                if (dateString) {
                  valueObj.dateString = dateString.trim();
                }
              }

              let placeString = getPlaceElementText(valueElement);
              if (placeString) {
                valueObj.placeString = placeString.trim();
              }
              result.recordData[labelText] = valueObj;
            } else {
              // it could be a sub-table
              let valueTable = valueElement.querySelector("table");
              if (valueTable) {
                let valueRows = valueTable.querySelectorAll("tr");
                let valueObj = {};
                for (let valueRow of valueRows) {
                  let cells = valueRow.querySelectorAll("td");
                  if (cells.length == 2) {
                    let subLabel = cleanLabel(cells[0].textContent);

                    let value = "";
                    let placeString = getPlaceElementText(cells[1]);
                    if (placeString) {
                      value = placeString;
                    } else {
                      value = cells[1].textContent.trim();
                    }
                    valueObj[subLabel] = value;
                  }
                }
                result.recordData[labelText] = valueObj;
              } else {
                // it could be a simple value or multiple values (like "Siblings")
                let spanElements = valueElement.querySelectorAll("span");
                if (spanElements.length > 0) {
                  let valueString = "";
                  let values = [];
                  for (let span of spanElements) {
                    if (!span.classList.contains("record_annotation")) {
                      let textContent = span.textContent.trim();
                      if (textContent) {
                        if (valueString) {
                          valueString += ", ";
                        }
                        valueString += textContent;
                        values.push(textContent);
                      }
                    }
                  }
                  if (!valueString) {
                    let textContent = valueElement.textContent.trim();
                    if (textContent) {
                      valueString = textContent;
                    }
                  }
                  if (values.length > 1) {
                    result.recordData[labelText] = { value: valueString, values: values };
                  } else if (valueString) {
                    result.recordData[labelText] = { value: valueString };
                  }
                } else {
                  let valueText = valueElement.textContent;
                  result.recordData[labelText] = { value: valueText.trim() };
                }
              }
            }
          }
        }
      }
      */
    }
  }

  // additional data - recordSections
  if (recordFieldsTables.length > 1) {
    // there are two cases seen so far,
    // 1. For a census for example recordFieldsContainer only has children that are tables
    // 2. For a person, recordFieldsContainer has childredn that are both divs and tables
    //    The Div in this case is the title "Family members"

    // this code handles case 1, it will do noting for case 2 because the recordSectionTitle
    // is not in a row of the child table.
    result.recordSections = {};
    for (let i = 1; i < recordFieldsTables.length; i++) {
      let outerTable = recordFieldsTables[i];
      let rows = outerTable.querySelectorAll("tr.recordFieldsRow");
      for (let row of rows) {
        let recordSectionTitle = row.querySelector("td.recordFieldValue > div.recordSectionTitle");
        if (recordSectionTitle) {
          let title = recordSectionTitle.textContent;
          if (title) {
            let sectionData = {};
            result.recordSections[title] = sectionData;

            let multiTable = row.querySelector("table.multi_table");
            if (multiTable) {
              let innerRows = multiTable.querySelectorAll("tr");
              for (let innerRow of innerRows) {
                let cells = innerRow.querySelectorAll("td");
                let label = "";
                for (let cell of cells) {
                  if (cell.classList.contains("infoGroup")) {
                    label = cleanLabel(cell.textContent);
                  } else {
                    let value = cell.textContent;
                    if (label && value) {
                      sectionData[label.trim()] = value.trim();
                      label = "";
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // this code handles case 2.
    let recordSectionTitles = recordMainContent.querySelectorAll(
      "div.recordFieldsContainer > div.recordSectionTitle.fieldGroupTitle"
    );
    if (recordSectionTitles.length > 0) {
      for (let titleElement of recordSectionTitles) {
        let title = titleElement.textContent.trim();
        if (title) {
          let tableElement = titleElement.nextSibling;
          if (tableElement && tableElement.classList.contains("recordFieldsTable")) {
            let sectionData = {};
            result.recordSections[title] = sectionData;

            let rows = tableElement.querySelectorAll("tr.recordFieldsRow");
            for (let row of rows) {
              let labelElement = row.querySelector("td.recordFieldLabel");
              let valueElement = row.querySelector("td.recordFieldValue");
              if (labelElement && valueElement) {
                let label = cleanLabel(labelElement.textContent);

                // the value could have different structures, for a "Family members"
                // section it is a list of people
                let people = [];
                sectionData[label] = people;
                let personContainers = valueElement.querySelectorAll("div.individualsListContainer");
                for (let personContainer of personContainers) {
                  let person = {};
                  people.push(person);

                  let personLink = personContainer.querySelector("a.individualNameLink");
                  if (personLink) {
                    person.name = personLink.textContent.trim();
                    person.link = personLink.getAttribute("href");

                    let nextElement = personLink.nextSibling;
                    if (nextElement && nextElement.classList.contains("immediateMemberDateRange")) {
                      let dateRange = nextElement.textContent.trim();
                      if (dateRange) {
                        person.dateRange = dateRange;
                      }
                    }

                    // try to get gender
                    let personImage = personContainer.querySelector("div.profile_photo_wrapper");
                    if (personImage) {
                      if (personImage.classList.contains("gender_M")) {
                        person.gender = "male";
                      } else if (personImage.classList.contains("gender_F")) {
                        person.gender = "female";
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
  }

  let householdSection = recordMainContent.querySelector("div.recordSection.record_page_household");
  if (householdSection) {
    let groupTable = householdSection.querySelector("table.groupTable");
    if (groupTable) {
      let colHeadings = groupTable.querySelectorAll("tr > td.groupRowTitle");
      let headings = [];
      for (let heading of colHeadings) {
        if (!heading.classList.contains("hidden_column_value")) {
          headings.push(heading.textContent.trim());
        }
      }

      let members = [];
      let groupRows = groupTable.querySelectorAll("tr.groupRow");
      for (let row of groupRows) {
        let member = {};
        members.push(member);

        if (row.classList.contains("currentRow")) {
          member.isSelected = true;
        }

        let cells = row.querySelectorAll("td.groupRowValue");
        for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
          if (cellIndex < headings.length) {
            let label = cleanLabel(headings[cellIndex]);
            let cell = cells[cellIndex];
            let personLink = cell.querySelector("a");
            if (personLink) {
              let value = personLink.textContent.trim();
              if (value) {
                let link = personLink.getAttribute("href");
                if (link) {
                  member.link = link;
                }
                member[label] = value;
              }
            } else {
              let value = cell.textContent.trim();
              if (value) {
                member[label] = value;
              }
            }
          }
        }
      }

      if (headings.length > 0) {
        result.household = { headings: headings, members: members };
      }
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
