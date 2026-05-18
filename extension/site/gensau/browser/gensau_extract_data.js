/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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

// No imports or requires allowed. See docs/dev_notes/extract_data_design

function extractData(document, url) {
  var result = {};

  // for local testing
  const localRegex = /^.*unit_tests\/([^\/]+)\/saved_pages\/.*$/;
  if (localRegex.test(url)) {
    let scriptElement = document.querySelector("#ha-header div.hi-icon-wrap > script");
    if (scriptElement) {
      let scriptText = scriptElement.textContent;
      if (scriptText) {
        // example:
        // var sitePathURI = 'https://www.genealogysa.org.au/index.php?option=com_hikashop&view=product&layout=show&Itemid=223&uid=45682&coid=birth&cid=5&request_data=%7B%26quot%3Boption%26quot%3B%3A%26quot%3Bcom_gsa%26quot%3B%2C%26quot%3Bview%26quot%3B%3A%26quot%3Bgsa%26quot%3B%2C%26quot%3Blayout%26quot%3B%3A%26quot%3Bessearch%26quot%3B%2C%26quot%3BItemid%26quot%3B%3A%26quot%3B193%26quot%3B%2C%26quot%3Bcollection_id%26quot%3B%3A%26quot%3Bbirth%26quot%3B%2C%26quot%3Bpage_no%26quot%3B%3A%26quot%3B3%26quot%3B%2C%26quot%3Bsort_by%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3Bsort_direction%26quot%3B%3A%26quot%3Basc%26quot%3B%2C%26quot%3BSurname%26quot%3B%3A%26quot%3BSmith%26quot%3B%2C%26quot%3BGivenName%26quot%3B%3A%26quot%3BJohn%26quot%3B%2C%26quot%3Byear_from%26quot%3B%3A%26quot%3B1898%26quot%3B%2C%26quot%3Baccuracy%26quot%3B%3A%26quot%3B50%26quot%3B%2C%26quot%3BGender%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3BFather%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3BDistrict%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3BBook_Page%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3B95626bcc2d5a516407fc742f25713c8c%26quot%3B%3A%26quot%3B37a43995e1ee5db334fb81752793208d%26quot%3B%2C%26quot%3B_ga%26quot%3B%3A%26quot%3BGA1.3.1675802975.1778714438%26quot%3B%2C%26quot%3B_gid%26quot%3B%3A%26quot%3BGA1.3.1485660444.1778714438%26quot%3B%2C%26quot%3B_ga_QXKDZTP4JE%26quot%3B%3A%26quot%3BGS2.3.s1778714438%24o1%24g1%24t1778715328%24j40%24l0%24h0%26quot%3B%7D';

        //     var sitePathURI = 'https://www.genealogysa.org.au/index.php?option=com_hikashop&view=product&layout=show&Itemid=223&uid=45682&coid=birth&cid=5&request_data=%7B%26quot%3Boption%26quot%3B%3A%26quot%3Bcom_gsa%26quot%3B%2C%26quot%3Bview%26quot%3B%3A%26quot%3Bgsa%26quot%3B%2C%26quot%3Blayout%26quot%3B%3A%26quot%3Bessearch%26quot%3B%2C%26quot%3BItemid%26quot%3B%3A%26quot%3B193%26quot%3B%2C%26quot%3Bcollection_id%26quot%3B%3A%26quot%3Bbirth%26quot%3B%2C%26quot%3Bpage_no%26quot%3B%3A%26quot%3B3%26quot%3B%2C%26quot%3Bsort_by%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3Bsort_direction%26quot%3B%3A%26quot%3Basc%26quot%3B%2C%26quot%3BSurname%26quot%3B%3A%26quot%3BSmith%26quot%3B%2C%26quot%3BGivenName%26quot%3B%3A%26quot%3BJohn%26quot%3B%2C%26quot%3Byear_from%26quot%3B%3A%26quot%3B1898%26quot%3B%2C%26quot%3Baccuracy%26quot%3B%3A%26quot%3B50%26quot%3B%2C%26quot%3BGender%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3BFather%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3BDistrict%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3BBook_Page%26quot%3B%3A%26quot%3B%26quot%3B%2C%26quot%3B95626bcc2d5a516407fc742f25713c8c%26quot%3B%3A%26quot%3B37a43995e1ee5db334fb81752793208d%26quot%3B%2C%26quot%3B_ga%26quot%3B%3A%26quot%3BGA1.3.1675802975.1778714438%26quot%3B%2C%26quot%3B_gid%26quot%3B%3A%26quot%3BGA1.3.1485660444.1778714438%26quot%3B%2C%26quot%3B_ga_QXKDZTP4JE%26quot%3B%3A%26quot%3BGS2.3.s1778714438%24o1%24g1%24t1778715328%24j40%24l0%24h0%26quot%3B%7D';

        scriptText = scriptText.trim();
        const regex = /^.*var sitePathURI = '([^']+)'.*$/;
        if (regex.test(scriptText)) {
          let sitePathURI = scriptText.replace(regex, "$1");
          if (sitePathURI) {
            url = sitePathURI;
          }
        }
      }
    }
  }

  if (url) {
    result.url = url;
  }
  result.success = false;

  let headingElement = document.querySelector("div.header div.heading");
  if (!headingElement) {
    return result;
  }

  let headingH2 = headingElement.querySelector("h2");
  if (headingH2) {
    const firstTextNode = headingH2.firstChild;
    if (firstTextNode) {
      result.titleSurname = firstTextNode.textContent;
    }
    const spanElement = headingH2.querySelector("span");
    if (spanElement) {
      let givenNames = spanElement.textContent;
      if (givenNames.startsWith(", ")) {
        givenNames = givenNames.substring(2).trim();
      }
      if (givenNames) {
        result.titleGivenNames = givenNames;
      }
    }
  }

  const dbElement = headingElement.querySelector("p");
  if (dbElement) {
    let dbText = dbElement.textContent;
    // example: Found in 'Birth Registrations' Database
    const regex = /^\s*Found\s+in\s+'([^']+)'\s+Database\s*$/i;
    if (regex.test(dbText)) {
      let dbName = dbText.replace(regex, "$1");
      if (dbName) {
        result.databaseName = dbName;
      }
    }
  }

  let headingSubtitle = headingElement.querySelector("p");

  const dataRows = document.querySelectorAll("form div.gsa_userdetail > div.gsa_row");
  if (dataRows.length < 1) {
    return result;
  }

  result.recordData = {};

  for (let dataRowElement of dataRows) {
    let fieldNameElement = dataRowElement.querySelector("span.gsa_field_name");
    let fieldValueElement = dataRowElement.querySelector("span.gsa_field_value");

    if (fieldNameElement && fieldValueElement) {
      let isDisabled = false;
      let disabledElement = fieldValueElement.querySelector("a.disabled1");
      if (disabledElement) {
        isDisabled = true;
      }
      let name = fieldNameElement.textContent;
      let value = fieldValueElement.textContent;
      if (value == "(members only)") {
        isDisabled = true;
      }
      if (!isDisabled && value != "Not Recorded") {
        if (name.endsWith(":")) {
          name = name.substring(0, name.length - 1);
        }
        result.recordData[name] = value;
      }
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
