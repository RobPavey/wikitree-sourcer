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

function extractData(document, url) {
  var result = {};

  result.success = false;

  if (url) {
    result.url = url;

    let urlObj = new URL(url);
    if (urlObj) {
      let pathname = urlObj.pathname;
      if (pathname && pathname.startsWith("/")) {
        let pathParts = pathname.split("/");
        let lastPart = pathParts[pathParts.length - 1];
        lastPart = lastPart.trim().toLowerCase();
        if (lastPart == "recorddisplay") {
          result.pageType = "record";
        } else if (lastPart == "transcript") {
          result.pageType = "transcript";
        } else if (lastPart == "image") {
          result.pageType = "image";
        }
      }
    }
  }

  if (!result.pageType) {
    return result;
  }

  let titleElement = document.querySelector("div.header-results h3");
  if (titleElement) {
    result.title = titleElement.textContent.trim();
  }

  let volumeElement = document.getElementById("volume");
  if (volumeElement) {
    result.volumeId = volumeElement.value;
    let selectedIndex = volumeElement.selectedIndex;
    if (selectedIndex >= 0 && volumeElement.options && selectedIndex < volumeElement.options.length) {
      let selectedOptionElement = volumeElement.options[selectedIndex];
      if (selectedOptionElement) {
        result.volumeName = selectedOptionElement.innerHTML;
      }
    }
  }

  let pagesElement = document.getElementById("pages");
  if (pagesElement) {
    let pageNumber = pagesElement.textContent.trim();
    if (!pageNumber) {
      pageNumber = pagesElement.value;
    }
    if (pageNumber) {
      result.page = pageNumber.trim();
    }

    let pagesListItem = pagesElement.closest("li");
    if (pagesListItem) {
      let pageCountElement = pagesListItem.nextElementSibling;
      if (pageCountElement) {
        let pageCount = pageCountElement.textContent.trim();
        pageCount = pageCount.replace(/^of /, "");
        result.pageCount = pageCount;
      }
    }
  }

  let recordDataTable = document.getElementById("tblRecordDislpay");
  if (recordDataTable) {
    let tableRows = recordDataTable.querySelectorAll("tbody > tr");

    if (tableRows.length > 0) {
      result.recordData = {};

      for (let row of tableRows) {
        let tableDataElements = row.querySelectorAll("td");
        if (tableDataElements.length == 2) {
          let labelElement = tableDataElements[0];
          let valueElement = tableDataElements[1];

          let label = labelElement.textContent.trim();
          let value = valueElement.textContent.trim();

          if (label && value) {
            result.recordData[label] = value;
          }
        }
      }
    }
  } else {
    // different table - possibly only when you don't have a paid sub
    recordDataTable = document.getElementById("recordtable");
    if (recordDataTable) {
      let actualTable = recordDataTable.querySelector("tr > td > table.db-table");
      if (actualTable) {
        let tableRows = actualTable.querySelectorAll("tbody > tr");

        if (tableRows.length > 0) {
          result.recordData = {};

          for (let row of tableRows) {
            let tableDataElements = row.querySelectorAll("td");
            if (tableDataElements.length == 2) {
              let labelElement = tableDataElements[0];
              let valueElement = tableDataElements[1];

              let label = labelElement.textContent.trim();
              let value = valueElement.textContent.trim();

              if (label && value) {
                result.recordData[label] = value;
              }
            }
          }
        }
      }
    } else {
      // no transcription
    }
  }

  let citationElement = document.getElementById("divClipboardURLTranscript");
  if (citationElement) {
    let citationParas = citationElement.querySelectorAll("p");
    if (citationParas.length) {
      result.citationParts = [];
      for (let citationPara of citationParas) {
        result.citationParts.push(citationPara.textContent.trim());
      }
    }
  }

  let imgRecord = document.getElementById("imgRecord");

  if (imgRecord) {
    result.hasImage = true;
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
