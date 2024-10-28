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

function extractDataForRecordCensus(document, url, result) {
  let titleElement = document.querySelector("#framework-advanced-search > h3");
  if (titleElement) {
    let title = titleElement.textContent.trim();
    title = title.replace(/\s+/g, " ").trim();
    result.title = title;
  }

  let recordDataElement = document.querySelector("#framework-advanced-search > table.table");
  if (recordDataElement) {
    result.recordData = {};

    let rows = recordDataElement.querySelectorAll("tr");
    for (let row of rows) {
      let labelElement = row.querySelector("th");
      let valueElement = row.querySelector("td");
      if (labelElement && valueElement) {
        let label = labelElement.textContent.trim();
        let value = valueElement.textContent.trim();
        if (label && value) {
          result.recordData[label] = value;
        }
      }
    }
  }

  let tableDataElement = document.querySelector("#results > table");
  if (tableDataElement) {
    let headingElements = tableDataElement.querySelectorAll("thead > tr > th");
    let rowElements = tableDataElement.querySelectorAll("tbody > tr");
    let table = { headings: [], rows: [] };
    for (let headingElement of headingElements) {
      let heading = headingElement.textContent.trim();
      table.headings.push(heading);
    }
    for (let rowElement of rowElements) {
      let cellElements = rowElement.querySelectorAll("td");
      if (cellElements.length == table.headings.length) {
        let rowData = {};
        for (let cellIndex = 0; cellIndex < cellElements.length; cellIndex++) {
          let cellElement = cellElements[cellIndex];
          let label = table.headings[cellIndex];
          let value = cellElement.textContent.trim();
          if (label) {
            rowData[label] = value;
          }
        }
        table.rows.push(rowData);
      }
    }
    result.tableData = table;
  }

  let sourceInfoElement = document.querySelector("#collapseSource");
  if (sourceInfoElement) {
    let sourceInfoPara = sourceInfoElement.querySelector("p");
    if (sourceInfoPara) {
      let sourceInfo = sourceInfoPara.textContent.trim();
      if (sourceInfo) {
        result.sourceInfo = sourceInfo;
      }
    }
  }

  result.success = true;

  return result;
}

function extractDataForRecordResultsFull(document, url, result) {
  let resultsFullElement = document.querySelector("#results-full");
  if (!resultsFullElement) {
    return result;
  }

  let breadcrumbElement = document.querySelector("#results-full > div.panel-heading");
  if (breadcrumbElement) {
    let breadcrumb = breadcrumbElement.textContent.trim();
    result.breadcrumb = breadcrumb;
  }

  let recordDataElement = document.querySelector("#framework-advanced-search table.table");
  if (recordDataElement) {
    result.recordData = {};

    let rows = recordDataElement.querySelectorAll("tr");
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      let row = rows[rowIndex];
      let tableElement = row.querySelector("div.table-responsive > table.table");
      let labelElements = row.querySelectorAll("th");
      let valueElements = row.querySelectorAll("td");
      if (tableElement) {
        let headingElements = tableElement.querySelectorAll("thead > tr > th");
        let rowElements = tableElement.querySelectorAll("tbody > tr");
        let table = { headings: [], rows: [] };
        for (let headingElement of headingElements) {
          let heading = headingElement.textContent.trim();
          table.headings.push(heading);
        }
        for (let rowElement of rowElements) {
          let cellElements = rowElement.querySelectorAll("td");
          let numCols = Math.min(cellElements.length, table.headings.length);
          let rowData = {};
          let headingIndex = 0;
          for (let cellElement of cellElements) {
            let isSpecial = false;
            let colspan = cellElement.getAttribute("colspan");
            let colspanNum = 1;
            if (colspan) {
              colspanNum = Number(colspan);
              if (!isNaN(colspanNum) && colspanNum > 1) {
                isSpecial = true;
              }
            }
            if (!isSpecial) {
              let label = table.headings[headingIndex];
              let value = cellElement.textContent.trim();
              if (label) {
                label = label.replace(/\s+/g, " ");
                value = value.replace(/\s+/g, " ");
                rowData[label] = value;
              }
            } else {
              let label = table.headings[headingIndex];
              if (label) {
                let value = cellElement.textContent.trim();
                let childNodes = cellElement.childNodes;
                if (childNodes.length > 1) {
                  value = childNodes[0].textContent.trim();
                }

                label = label.replace(/\s+/g, " ");
                value = value.replace(/\s+/g, " ");
                rowData[label] = value;
              }
            }

            headingIndex += colspanNum;
            if (headingIndex >= table.headings.length) {
              break;
            }
          }
          table.rows.push(rowData);
        }
        result.tableData = table;
      } else if (labelElements.length == valueElements.length) {
        for (let index = 0; index < labelElements.length; index++) {
          let labelElement = labelElements[index];
          let valueElement = valueElements[index];
          if (labelElement && valueElement) {
            let label = labelElement.textContent.trim();
            let value = valueElement.textContent.trim();

            if (valueElement.children) {
              // this is a more complex data value
              let listGroupElement = valueElement.querySelector("div.list-group");
              if (listGroupElement) {
                let listGroupItems = listGroupElement.querySelectorAll(".list-group-item");
                if (listGroupItems.length == 1) {
                  let listGroupItem = listGroupItems[0];
                  let listGroupValue = listGroupItem.textContent.trim();
                  if (listGroupValue) {
                    value = listGroupValue;
                  }
                } else if (listGroupItems.length > 1) {
                  let newValue = "";
                  for (let listGroupItem of listGroupItems) {
                    let text = listGroupItem.textContent.trim();
                    if (text && !text.startsWith("Why is")) {
                      if (newValue) {
                        newValue += ", ";
                      }
                      newValue += text;
                    }
                  }
                  if (newValue) {
                    value = newValue;
                  }
                }
              }
            }
            if (label && value) {
              result.recordData[label] = value;
            } else if (!label && rowIndex == 0) {
              value = value.replace(/\s+/g, " ");
              result.title = value;
            }
          }
        }
      }
    }
  }

  let sourceInfoElement = document.querySelector("#accordion-more-info");
  if (sourceInfoElement) {
    let sourceInfoPara = sourceInfoElement.querySelector("p");
    if (sourceInfoPara) {
      let sourceInfo = sourceInfoPara.textContent.trim();
      if (sourceInfo) {
        result.sourceInfo = sourceInfo;
      }
    }
  }

  result.success = true;

  return result;
}

function extractDataForRecord(document, url, result) {
  let titleElement = document.querySelector("#framework-advanced-search > h3");
  let recordDataElement = document.querySelector("#framework-advanced-search > table.table");
  let tableDataElement = document.querySelector("#results > table");
  let sourceInfoElement = document.querySelector("#collapseSource");

  if (titleElement && recordDataElement && tableDataElement && sourceInfoElement) {
    return extractDataForRecordCensus(document, url, result);
  }

  let resultsFullElement = document.querySelector("#results-full");
  if (resultsFullElement) {
    return extractDataForRecordResultsFull(document, url, result);
  }
  return result;
}

function extractDataForImage(document, url, result) {
  function addNavData(element) {
    if (element) {
      let labelElement = element.querySelector("strong");
      let valueElement = element.querySelector("button > span.ellipsis-outer > span.ellipsis-inner");
      if (labelElement && valueElement) {
        let label = labelElement.textContent.trim();
        let value = valueElement.textContent.trim();
        if (label && value) {
          result.navData[label] = value;
        }
      }
    }
  }

  let navigationElement = document.querySelector("#framework-image-viewer div.control-navigation");
  if (navigationElement) {
    result.navData = {};
    addNavData(navigationElement.querySelector("div[data-r='r1']"));
    addNavData(navigationElement.querySelector("div[data-r='r2']"));
    addNavData(navigationElement.querySelector("div[data-r='r3']"));
    addNavData(navigationElement.querySelector("div[data-r='r4']"));
    addNavData(navigationElement.querySelector("div[data-r='r5']"));
  }

  let bookmarkElement = document.querySelector("#framework-image-viewer div.panel-bookmark");
  if (bookmarkElement) {
    let linkElement = bookmarkElement.querySelector("div > div > a.text-bold");

    if (linkElement) {
      let selectedPath = "";
      let elementPath = [linkElement];
      let path = "";
      let prevElement = linkElement.previousElementSibling;
      let prevAnchorElement = linkElement;
      while (prevElement) {
        if (prevElement.tagName == "SPAN") {
          let iconText = "";
          if (prevElement.classList.contains("glyphicon-file")) {
            iconText = "f";
          } else if (prevElement.classList.contains("glyphicon-option-horizontal")) {
            iconText = "h";
          } else if (prevElement.classList.contains("glyphicon-option-vertical")) {
            iconText = "v";
          }
          path = iconText + path;
        } else if (prevElement.tagName == "A") {
          if (!selectedPath) {
            selectedPath = path;
          } else if (path.length < selectedPath.length) {
            selectedPath = path;
            elementPath.push(prevAnchorElement);
          }

          prevAnchorElement = prevElement;
          path = "";
        } else if (prevElement.tagName == "BR") {
        } else {
          elementPath.push(prevAnchorElement);
          break;
        }
        prevElement = prevElement.previousElementSibling;
      }

      if (elementPath.length > 0) {
        result.bookmarkPath = [];
        for (let index = elementPath.length - 1; index >= 0; index--) {
          let element = elementPath[index];
          let text = element.textContent.trim();
          result.bookmarkPath.push(text);
        }
      }
    }
  }

  result.success = true;
  return result;
}

// Usually a transcript or image is shown in an iframe
// but it is possible to get to a page by copying the document link from the iframe
// E.g.:
// https://www.thegenealogist.com/search/advanced/census/main-family/?hlt=14967669&county=241&y=1841&family_id=2&household_id=14390766&a=Search&hh=1&hs=1&cl=1&sscid=241&view_type=fullRecord
// So perhaps this is the URL that should be in the Extracted Data.

// The main document URL gives no indication that a transcript is being shown in iframe
// https://www.thegenealogist.com/search/master/?layout=compact&type=person&source=&master_event=&person_event=&include_uk=1&include_ireland=1&include_elsewhere=1&fn=Charles&sn=Pavey&yr=1840&range=5&kw=Sussex&kw_mode=simple&kw_simple_type=any&search=Search#loadwindow_754578296

function extractData(document, url) {
  var result = {};

  // look for modal content in iframe
  let modalContentIframe = document.querySelector("div.modal-content iframe");
  if (modalContentIframe) {
    let contentWindow = modalContentIframe.contentWindow;
    if (contentWindow) {
      let iframeUrl = contentWindow.location.href;
      let iframeDocument = contentWindow.document;

      if (iframeUrl && !iframeUrl.startsWith("file:")) {
        url = iframeUrl;
      }
      if (iframeDocument) {
        document = iframeDocument;
      }
    }
  }

  if (url) {
    result.url = url;
  }
  result.success = false;

  // determine page type.
  result.pageType = "unknown";

  // Image URL: https://www.thegenealogist.com/image_viewer_beta/?imagego=ZGVmNTAyMDAzZDBlODhiNmZmMTkxM2FlN2IzZWY1OTQyNDgyYmRjMDM0OGEwNTIwMTc1ZDg2ZGY1Yjk2Y2I5M2JjZWM0MWFiYTU3YmRhNzY1NTZlMDdhNmMxYmI2ZWFlNjdiYzMzNjk4ODJmMTcwODBmOGEyNTAyNmJkODAxNDkwMWQ0N2I1OWU0MTkzMjEyYjYwNmQ4NTEyOWE3YWE5YjZmZTMwNGQyODE0ZDg3ZGU4Y2Q5ZGVlZWIwYmNiNjYxMzFhZTQ2ZTczNzIzMTAzYTc1ZjQyMTZhYzAyM2QwMzE5YTlhYmUxMGU5YjQzMmRmOGQ5NjkwZGU0ZWM3YTZmNDNhNTczNGU2N2U1ZDVkYjg3MGUxZDY5MDExMTY2NTBkNjY2ZjM4ODdhZGRjZjJmZmRlNWI%3D
  if (url.includes("image_viewer")) {
    result.pageType = "image";
  } else if (url.includes("/search/")) {
    // Record URL: https://www.thegenealogist.com/search/advanced/census/main-household/?hlt=219560985&county=243&y=1861&household_id=16268345&a=Search&hh=1&hs=1&cl=1&sscid=243&view_type=fullRecord
    if (url.includes("view_type=fullRecord")) {
      result.pageType = "record";
    } else if (url.includes("search/advanced")) {
      result.pageType = "record";
    } else if (!modalContentIframe) {
      result.pageType = "searchResults";
    }
  }

  if (result.pageType == "record") {
    result = extractDataForRecord(document, url, result);
  } else if (result.pageType == "image") {
    result = extractDataForImage(document, url, result);
  }

  //console.log(result);

  return result;
}

export { extractData };
