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

function extractFromSearchResults(document, url, userSelectedRowElement, result) {
  let resultsTable = document.querySelector("table.results-table");
  if (!resultsTable) {
    return;
  }

  let rowElements = resultsTable.querySelectorAll("tbody > tr");
  if (rowElements.length < 1) {
    return;
  }

  // by default we use the first row as the record to extract
  let selectedRowElement = rowElements[0];
  if (userSelectedRowElement) {
    // but if there is a user selected row we use that row
    selectedRowElement = userSelectedRowElement;
    result.isRowSelected = true;
  }

  let headerRow = resultsTable.querySelector("thead > tr");

  let headerCells = headerRow.querySelectorAll("th");
  let rowCells = selectedRowElement.querySelectorAll("td");

  if (headerCells.length != rowCells.length) {
    return;
  }

  console.log(
    `extractFromSearchResults: headerCells.length = ${headerCells.length}, rowCells.length = ${rowCells.length}`
  );

  result.numResultsOnPage = rowElements.length;

  result.recordData = {};

  for (let index = 0; index < headerCells.length; index++) {
    let headerCell = headerCells[index];
    let rowCell = rowCells[index];

    let headerText = headerCell.textContent;

    console.log(`extractFromSearchResults: headerText = ${headerText}`);

    if (headerText) {
      let rowDataElement = rowCell.querySelector("div.table-row-cell-data");
      if (rowDataElement) {
        let rowText = rowDataElement.textContent;
        rowText = rowText.replace(/\s+/g, " "); // remove double spaces
        result.recordData[headerText] = rowText;
      }
    } else {
      // Note that we can also get the key name from the row cell in a couple of ways
      console.log(`extractFromSearchResults: image column`);
      // The Image View column has three options:
      // 1. The user has bought this image
      // 2. The user hasn't bought image but has enough credits
      // 3. The user hasn't bought image and doesn't have enough credits (no image link available)
      let viewedImageLinkElement = rowCell.querySelector("a.view-image-button");
      console.log(`extractFromSearchResults: viewedImageLinkElement = ${viewedImageLinkElement}`);
      if (viewedImageLinkElement) {
        let linkText = viewedImageLinkElement.getAttribute("href");
        result.imageLink = linkText;
      }
    }
  }

  // gather some more data that could be useful
  let pageHeader = document.querySelector("h1.page-title");
  if (pageHeader) {
    let textString = pageHeader.textContent;
    if (textString) {
      textString = textString.replace(" - Search results", "");
      result.pageHeader = textString;
    }
  }

  let searchCriteria = document.querySelector("#you_searched_for");
  if (searchCriteria) {
    let textString = searchCriteria.textContent;
    if (textString) {
      result.searchCriteria = {};
      textString = textString.trim();
      textString = textString.replace("You searched for - ", "");
      textString = textString.trim();

      while (textString) {
        let separatorIndex = textString.indexOf(", ");
        let searchItem = "";
        if (separatorIndex != -1) {
          searchItem = textString.substring(0, separatorIndex);
          textString = textString.substring(separatorIndex + 2);
        } else {
          searchItem = textString;
          textString = "";
        }
        // searchItem is something like: "Surname: 'Bruce'"
        let colonIndex = searchItem.indexOf(":");
        if (colonIndex != -1) {
          let key = searchItem.substring(0, colonIndex).trim();
          let value = searchItem.substring(colonIndex + 1).trim();
          value = value.replace(/^\"([^\"]*)\"$/, "$1");
          result.searchCriteria[key] = value;
        }
      }
    }
  }

  /*
  document.querySelector("#refine_form_custom_wrapper > input[type=hidden]:nth-child(1)")
<input data-drupal-selector="edit-search-params-record-group" type="hidden" name="search_params[record_group]" value="census_returns">

document.querySelector("#refine_form_custom_wrapper > input[type=hidden]:nth-child(3)")
<input data-drupal-selector="edit-search-params-record-type" type="hidden" name="search_params[record_type]" value="census">
*/
  // to get the record group and record type we use the form on left
  const refineFormWrapper = document.querySelector("#refine_form_custom_wrapper");
  if (refineFormWrapper) {
    const recordGroupElement = refineFormWrapper.querySelector("input[name='search_params[record_group]'");
    if (recordGroupElement) {
      result.recordGroup = recordGroupElement.value;
    }
    const recordTypeElement = refineFormWrapper.querySelector("input[name='search_params[record_type]'");
    if (recordTypeElement) {
      result.recordType = recordTypeElement.value;
    }
  }

  if (false && url) {
    // URL no longer contains query
    // https://www.scotlandspeople.gov.uk/record-results?search_type=people&event=M&record_type%5B0%5D=opr_marriages&church_type=Old%20Parish%20Registers&dl_cat=church&dl_rec=church-banns-marriages&surname=McGregor&surname_so=exact&forename=Christane&forename_so=starts&spouse_name_so=exact&from_year=1600&to_year=1700&record=Church%20of%20Scotland%20%28old%20parish%20registers%29%20Roman%20Catholic%20Church%20Other%20churches
    let queryIndex = url.indexOf("?");
    if (queryIndex != -1) {
      let queryString = url.substring(queryIndex + 1);
      result.urlQuery = {};
      while (queryString) {
        let queryTerm = "";
        let ampIndex = queryString.indexOf("&");
        if (ampIndex != -1) {
          queryTerm = queryString.substring(0, ampIndex);
          queryString = queryString.substring(ampIndex + 1);
        } else {
          let poundIndex = queryString.indexOf("#");
          if (poundIndex != -1) {
            queryTerm = queryString.substring(0, poundIndex);
          } else {
            queryTerm = queryString;
          }
          queryString = "";
        }
        // searchItem is something like: "Surname: 'Bruce'"
        let equalsIndex = queryTerm.indexOf("=");
        if (equalsIndex != -1) {
          let key = queryTerm.substring(0, equalsIndex).trim();
          let value = queryTerm.substring(equalsIndex + 1).trim();
          key = decodeURI(key);
          value = decodeURI(value);
          result.urlQuery[key] = value;
        }
      }
    }
  }

  // quick look popup. This is available on some records like prison records
  let quickLookList = document.querySelector("#drupal-modal ul.quick-look");
  if (quickLookList) {
    let listElements = quickLookList.querySelectorAll("li");
    if (listElements.length > 0) {
      result.quickLookData = {};
      for (let listElement of listElements) {
        let keyElement = listElement.querySelector("span.key");
        let valueElement = listElement.querySelector("span.value");
        if (keyElement && valueElement) {
          let key = keyElement.textContent;
          let value = valueElement.textContent;
          if (key) {
            result.quickLookData[key] = value;
          }
        }
      }
    }
  }

  result.success = true;
}

function extractFromImageViewer(document, url, result) {
  // For now we should redirect the user to search results?
}

// siteSpecificInput is an optional parameter only passed from content
function extractData(document, url, siteSpecificInput) {
  let userSelectedRowElement = undefined;
  if (siteSpecificInput) {
    userSelectedRowElement = siteSpecificInput.selectedRowElement;
  }

  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  let resultsTable = document.querySelector("table.results-table");

  if (resultsTable) {
    extractFromSearchResults(document, url, userSelectedRowElement, result);
  } else {
    let imageViewer = document.querySelector("div.image-viewer");

    if (imageViewer) {
      extractFromImageViewer(document, url, result);
    }
  }

  //console.log(result);

  return result;
}

export { extractData };
