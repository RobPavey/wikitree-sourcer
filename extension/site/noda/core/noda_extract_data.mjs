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

  let fileTitleSpan = viewerContainer.querySelector("#file-title-text");
  if (fileTitleSpan) {
    let fileTitle = fileTitleSpan.textContent.trim();
    if (fileTitle) {
      result.fileTitle = fileTitle;
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
      valueObj.textString = value;

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
              if (dataItems.length) {
                // it is a list of people
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

                  let panelDataRows = panelGroup.querySelectorAll("div.panel-body > div.row > div > div.row");
                  extractLabelValuePairs(panelData, panelDataRows);

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

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
