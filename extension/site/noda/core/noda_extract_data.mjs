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

function extractDataForImage(document, url, result) {
  let viewerContainer = document.querySelector("div.main-container-viewer");

  if (!viewerContainer) {
    return;
  }

  result.success = true;
  result.pageType = "image";

  let breadcrumbs = viewerContainer.querySelectorAll("nav.breadcrumb-container li");
  if (breadcrumbs.length) {
    result.breadcrumbs = [];
    for (let breadcrumb of breadcrumbs) {
      let value = breadcrumb.textContent.trim();
      result.breadcrumbs.push(value);
    }
  }

  let permanentIdInput = document.querySelector("#permanent_image_id");
  if (permanentIdInput) {
    let permanentId = permanentIdInput.value;
    if (permanentId) {
      result.permanentId = permanentId;
    }
  }

  let fileTitleSpan = viewerContainer.querySelector("#file-title-text");
  if (fileTitleSpan) {
    let fileTitle = fileTitleSpan.textContent.trim();
    if (fileTitle) {
      result.fileTitle = fileTitle;
    }
  }
}

function cleanLabel(label) {
  if (label) {
    label = label.trim();
    if (label.endsWith(":")) {
      label = label.substring(0, label.length - 1);
    }
  }
  return label;
}

function extractValueObj(valueDiv) {
  let valueObj = undefined;
  let value = valueDiv.textContent.trim();
  if (value != "-") {
    valueObj = {};
    value = value.replace(/\s+/g, " ");
    valueObj.textString = value.trim();

    let childNodes = valueDiv.childNodes;
    if (childNodes && childNodes.length > 1) {
      let textParts = [];
      for (let childNode of childNodes) {
        if (childNode.nodeType === 3) {
          let text = childNode.textContent.trim();
          if (text) {
            text = text.replace(/\s+/g, " ");
            textParts.push(text);
          }
        }
      }
      if (textParts.length > 1) {
        valueObj.textParts = textParts;
      }
    }
  }

  return valueObj;
}

function extractLabelValuePairs(dataObject, rows) {
  for (let dataRow of rows) {
    let rowDivs = dataRow.querySelectorAll("div");
    if (rowDivs.length == 2) {
      let labelDiv = rowDivs[0];
      let valueDiv = rowDivs[1];
      if (labelDiv && valueDiv) {
        let label = cleanLabel(labelDiv.textContent);
        let valueObj = extractValueObj(valueDiv);
        if (label && valueObj) {
          dataObject[label] = valueObj;
        }
      }
    }
  }
}

function extractPeopleFromDataItems(panelData, panelGroup, dataItems) {
  // it is a list of people in list view
  panelData.people = [];
  for (let person of dataItems) {
    let personData = {};
    panelData.people.push(personData);
    if (person.classList.contains("current")) {
      personData.current = true;
    }

    let personHeadingElement = person.querySelector("h4");
    if (personHeadingElement) {
      let personLinkElement = personHeadingElement.querySelector("a");
      if (personLinkElement) {
        let personLabelElement = personLinkElement.querySelector("span");
        if (personLabelElement) {
          let personLabel = personLabelElement.textContent.trim();
          if (personLabel) {
            personData.personLabel = personLabel;
          }
        }
        personData.personNameParts = [];
        for (let childNode of personLinkElement.childNodes) {
          if (childNode.nodeType === 3) {
            let text = childNode.textContent.trim();
            if (text) {
              text = text.replace(/\s+/g, " ");
              personData.personNameParts.push(text);
            }
          }
        }
      }

      let personHeading = personHeadingElement.textContent.trim();
      if (personHeading) {
        personHeading = personHeading.replace(/\s+/g, " ");
        personData.personHeading = personHeading;
      }
    }

    let dataDivs = person.querySelectorAll("div.row > div > div.row > div");
    let lastLabel = "";
    for (let dataDiv of dataDivs) {
      if (dataDiv.classList.contains("ssp-semibold")) {
        if (lastLabel) {
          let valueObj = extractValueObj(dataDiv);
          if (valueObj) {
            personData[lastLabel] = valueObj;
          }
        }
      } else {
        lastLabel = cleanLabel(dataDiv.textContent);
      }
    }
  }
}

function extractPeopleFromTable(panelData, panelGroup) {
  // it is a list of people in list view
  panelData.people = [];

  // There are two tables the first is hidden and only contains headings
  let tableWithHeadings = panelGroup.querySelector("div.panel-body > div > div[aria-hidden=true] > table.table");
  let tableWithRows = panelGroup.querySelector("div.panel-body > div > table.table");

  let headings = tableWithHeadings.querySelectorAll("thead th");
  let rows = tableWithRows.querySelectorAll("tbody tr.data-item");

  let heading0 = "";
  if (headings.length > 0) {
    heading0 = headings[0].textContent.trim();
  }

  for (let row of rows) {
    let columns = row.querySelectorAll("td");
    if (columns.length != headings.length) {
      return;
    }

    let personData = {};
    panelData.people.push(personData);
    if (row.classList.contains("current")) {
      personData.current = true;
    }

    let personLinkElement = columns[0].querySelector("a");
    if (personLinkElement) {
      let personHeading = "";
      let personLabelElement = personLinkElement.querySelector("span");
      if (heading0) {
        personData.personLabel = heading0;
        personHeading += heading0;
      } else if (personLabelElement) {
        let personLabel = personLabelElement.textContent.trim();
        if (personLabel) {
          personData.personLabel = personLabel;
          personHeading += personLabel;
        }
      }
      personData.personNameParts = [];
      for (let childNode of personLinkElement.childNodes) {
        if (childNode.nodeType === 3) {
          let text = childNode.textContent.trim();
          if (text) {
            text = text.replace(/\s+/g, " ");
            personData.personNameParts.push(text);
            personHeading += " " + text;
          }
        }
      }
      if (personHeading) {
        personData.personHeading = personHeading;
      }
    }

    for (let columnIndex = 1; columnIndex < columns.length; columnIndex++) {
      let column = columns[columnIndex];
      let heading = headings[columnIndex];

      if (heading && column) {
        let label = cleanLabel(heading.textContent);
        let value = column.textContent;

        if (label && value) {
          value = value.replace(/\s+/g, " ").trim();
          if (value && value != "-") {
            personData[label] = { textString: value };
          }
        }
      }
    }
  }
}

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  let lang = document.documentElement.lang;
  if (lang) {
    result.lang = lang;
  }

  let article = document.querySelector("article");
  if (!article) {
    // could be an image
    let viewerContainer = document.querySelector("div.main-container-viewer");
    if (viewerContainer) {
      extractDataForImage(document, url, result);
    }
    return result;
  }

  result.pageType = "record";

  let breadcrumbs = document.querySelectorAll("div.breadcrumbs li");
  if (breadcrumbs.length) {
    result.breadcrumbs = [];
    for (let breadcrumb of breadcrumbs) {
      let value = breadcrumb.textContent.trim();
      result.breadcrumbs.push(value);
    }
  }

  let h4Elements = article.querySelectorAll("div.data-view > div.info > div > h4");
  if (h4Elements.length) {
    result.collectionParts = [];
    for (let h4Element of h4Elements) {
      let collectionPart = {};
      result.collectionParts.push(collectionPart);
      let heading = h4Element.textContent;
      if (heading) {
        heading = heading.replace(/\s+/g, " ");
        collectionPart.collectionHeading = heading.trim();
      }

      collectionPart.collectionNameParts = [];
      for (let childNode of h4Element.childNodes) {
        if (childNode.nodeType === 3) {
          let text = childNode.textContent.trim();
          if (text) {
            text = text.replace(/\s+/g, " ");
            text = text.trim();
            if (text.endsWith(":")) {
              text = text.substring(0, text.length - 1);
            }

            collectionPart.collectionNameParts.push(text);
          }
        }
      }

      let collectionLinkElement = h4Element.querySelector("a");
      if (collectionLinkElement) {
        for (let childNode of collectionLinkElement.childNodes) {
          if (childNode.nodeType === 3) {
            let text = childNode.textContent.trim();
            if (text) {
              text = text.replace(/\s+/g, " ");

              collectionPart.collectionNameParts.push(text);
            }
          }
        }
      }
    }
  }

  let headingElement = article.querySelector("div.data-view > div.info > div.heading > h1");
  if (headingElement) {
    let heading = headingElement.textContent;
    if (heading) {
      // This is the full heading text
      heading = heading.trim().replace(/\s+/g, " ");
      result.heading = heading;
    }

    // also get the parts of the heading text, usially this is two spans and a text node
    let headingLabelElements = headingElement.querySelectorAll("span");
    result.headingSpanParts = [];
    for (let headingLabelElement of headingLabelElements) {
      let headingLabel = headingLabelElement.textContent.trim();
      if (headingLabel) {
        result.headingSpanParts.push(headingLabel);
      }
    }
    result.headingTextParts = [];
    for (let childNode of headingElement.childNodes) {
      if (childNode.nodeType === 3) {
        let text = childNode.textContent.trim();
        if (text) {
          text = text.replace(/\s+/g, " ");
          result.headingTextParts.push(text);
        }
      }
    }

    let imageLinkElement = headingElement.nextElementSibling;
    if (imageLinkElement) {
      let imageLink = imageLinkElement.getAttribute("href");
      if (imageLink) {
        result.imageLink = imageLink;
      }
    }
  }

  // check if the page represents a residence rather than a person
  if (!result.heading) {
    return result;
  }
  if (result.headingSpanParts && result.headingSpanParts.length) {
    let startOfHeading = result.headingSpanParts[0];
    const invalidHeadingParts = [
      // en
      "Census district:",
      "Urban residence:",
      "Rural residence:",

      // bo
      "Tellingskrets:",
      "Bosted by:",
      "Bosted land:",

      // nn
      "Teljingskrets:",
      "Bustad by:",
      "Bustad land:",
    ];
    if (invalidHeadingParts.includes(startOfHeading)) {
      return result;
    }
  }

  let leftViewColumn = article.querySelector("div.data-view div.left-view-column");
  let rightViewColumn = article.querySelector("div.data-view div.right-view-column");

  if (leftViewColumn) {
    result.recordData = {};
    result.panelGroups = [];

    // get only the top level lows of the left-view-column
    let columnRows = article.querySelectorAll("div.data-view div.left-view-column > div.row");

    if (columnRows.length) {
      for (let row of columnRows) {
        let permanentIdSpan = row.querySelector("#permanentId");
        if (permanentIdSpan) {
          result.permanentId = permanentIdSpan.textContent.trim();
        } else {
          let panelGroups = row.querySelectorAll("div.panel-group");
          if (panelGroups.length) {
            for (let panelGroup of panelGroups) {
              let panelData = {};
              result.panelGroups.push(panelData);
              let panelTitleElement = panelGroup.querySelector("h4.panel-title");
              if (panelTitleElement) {
                let panelTitle = cleanLabel(panelTitleElement.textContent);
                if (panelTitle) {
                  panelData.panelTitle = panelTitle;
                }
              }

              // it could be a row with a single set of data or a list of people
              let dataItems = panelGroup.querySelectorAll("div.panel-body div.data-item");
              // There are two tables the first is hidden and only contains headings
              let panelTable = panelGroup.querySelector("div.panel-body table.table");
              if (dataItems.length) {
                // it is a list of people
                extractPeopleFromDataItems(panelData, panelGroup, dataItems);
              } else if (panelTable) {
                // it is a table of people
                extractPeopleFromTable(panelData, panelGroup);
              } else {
                let panelDataRows = panelGroup.querySelectorAll("div.panel-body > div.row > div > div.row");
                extractLabelValuePairs(panelData, panelDataRows);
              }
            }
          } else {
            // this is the main row
            let dataRows = row.querySelectorAll("div.row div.row");
            extractLabelValuePairs(result.recordData, dataRows);
          }
        }
      }
    }
  }

  if (rightViewColumn) {
    let title = rightViewColumn.querySelector("h4.title");
    if (title) {
      let sourcePara = title.nextElementSibling;
      if (sourcePara) {
        let sourceInformation = sourcePara.textContent.trim();
        if (sourceInformation) {
          result.sourceInformation = sourceInformation;
        }
      }
    }
    result.sourceData = {};
    let dataRows = rightViewColumn.querySelectorAll("div.row");
    extractLabelValuePairs(result.sourceData, dataRows);
  }

  // another way to reject non-person records is from the permanentId
  // All person records seem to start with p
  if (!result.permanentId || result.permanentId.length < 1) {
    return result;
  }
  let idStart = result.permanentId[0];
  if (idStart != "p") {
    return result;
  }

  if (result.heading && result.recordData) {
    result.success = true;
  }

  //console.log(result);

  return result;
}

export { extractData };
