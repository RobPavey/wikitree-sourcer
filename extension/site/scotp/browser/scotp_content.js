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

const highlightStyle = "font-weight: bold; font-style: italic";
const cellHighlightStyle = "background-color: palegoldenrod";

function highlightRow(selectedRow) {
  selectedRow.setAttribute("style", highlightStyle);
  const cells = selectedRow.querySelectorAll("td");
  for (let cell of cells) {
    cell.setAttribute("style", cellHighlightStyle);
  }
}

function unHighlightRow(selectedRow) {
  selectedRow.removeAttribute("style");
  const cells = selectedRow.querySelectorAll("td");
  for (let cell of cells) {
    cell.removeAttribute("style");
  }
}

function getRefRecordKey(recordType) {
  // this is a cut-down version of the scotpRecordTypes in scotp_record_type.mjs since we do not want
  // to import that in the content script
  const scotpRecordTypes = {
    ///////////////////// Statutory Registers ///////////////////////
    stat_births: { ref: "Ref" },
    stat_marriages: { ref: "Ref" },
    stat_divorces: { ref: "Serial Number" },
    stat_deaths: { ref: "Ref" },
    civilpartnership: { ref: "RD/EntryNumber" },
    dissolutions: { ref: "Serial Number" },
    ///////////////////// Church Registers ///////////////////////
    opr_births: { ref: "Ref" },
    opr_marriages: { ref: "Ref" },
    opr_deaths: { ref: "Ref" },
    ///////////////////// Census ///////////////////////
    census: { ref: "Ref" },
    census_lds: { ref: "Ref" },
    ///////////////////// Valuation Rolls ///////////////////////
    valuation_rolls: { ref: "Reference Number" },
    ///////////////////// Legal ///////////////////////
    wills_testaments: { ref: "Reference Number" },
    coa: { ref: "Record Number" },
  };

  let value = "";
  let type = scotpRecordTypes[recordType];
  if (type) {
    value = type.ref;
  }

  return value;
}

function addClickedRowListener() {
  //console.log("addClickedRowListener");

  const elResultsTable = document.querySelector("table.results-table tbody");
  if (elResultsTable && !elResultsTable.hasAttribute("listenerOnClick")) {
    elResultsTable.setAttribute("listenerOnClick", "true");
    elResultsTable.addEventListener("click", function (ev) {
      //console.log("clickedRowListener: ev is");
      //console.log(ev);

      // clear existing selected row if any
      let selectedRow = getClickedRow();
      if (selectedRow) {
        unHighlightRow(selectedRow);
      }
      selectedRow = ev.target;
      if (selectedRow) {
        //console.log("clickedRowListener: selectedRow is ");
        //console.log(selectedRow);

        selectedRow = selectedRow.closest("tr");
        if (selectedRow) {
          highlightRow(selectedRow);
        }
      }
    });
  }
}

function getClickedRow() {
  const elResultsTable = document.querySelector("table.results-table tbody");
  if (elResultsTable) {
    const selectedRow = elResultsTable.querySelector("tr[style='" + highlightStyle + "']");
    return selectedRow;
  }
}

async function doHighlightForRefQuery() {
  let url = location.href;

  //console.log("doHighlightForRefQuery: url = " + url);

  const refQuery = "&ref=";
  let refIndex = url.indexOf(refQuery);
  if (refIndex != -1) {
    // there is a ref query, extract the ref value from the URL
    let ampIndex = url.indexOf("&", refIndex + refQuery.length);
    if (ampIndex == -1) {
      ampIndex = url.length;
    }
    let refValue = url.substring(refIndex + refQuery.length, ampIndex);
    if (!refValue) {
      return;
    }

    //console.log("doHighlightForRefQuery: refValue = " + refValue);

    // extract the record_type from url
    const rt1Query = "&record_type=";
    let rtIndex = url.indexOf(rt1Query);
    if (rtIndex != -1) {
      rtIndex += rt1Query.length;
    } else {
      const rt2Query = "&record_type%5B0%5D=";
      rtIndex = url.indexOf(rt2Query);
      if (rtIndex != -1) {
        rtIndex += rt2Query.length;
      } else {
        return;
      }
    }
    ampIndex = url.indexOf("&", rtIndex);
    if (ampIndex == -1) {
      ampIndex = url.length;
    }
    let recordType = url.substring(rtIndex, ampIndex);

    // work out what key to look for
    let refKey = getRefRecordKey(recordType);
    if (!refKey) {
      return;
    }

    let resultsTableWrapper = document.querySelector("div.results-table-wrapper");
    if (!resultsTableWrapper) {
      return;
    }
    let resultsTable = resultsTableWrapper.querySelector("table.table");
    if (!resultsTable) {
      return;
    }
    let headerRow = resultsTable.querySelector("thead > tr");
    if (!headerRow) {
      return;
    }
    let headerCells = headerRow.querySelectorAll("th");

    // find the refKey in the header cells to get the right column index
    let refKeyColumnIndex = -1;
    for (let index = 0; index < headerCells.length; index++) {
      let headerCell = headerCells[index];
      let text = headerCell.textContent;
      if (text && text.trim() == refKey) {
        refKeyColumnIndex = index;
        break;
      }
    }
    if (refKeyColumnIndex == -1) {
      return;
    }

    let rowElements = resultsTable.querySelectorAll("tbody > tr");
    for (let index = 0; index < rowElements.length; index++) {
      let rowElement = rowElements[index];

      let rowCells = rowElement.querySelectorAll("td");
      if (rowCells.length > refKeyColumnIndex) {
        let rowCell = rowCells[refKeyColumnIndex];
        let rowDataElement = rowCell.querySelector("div.table-cell-data");
        if (rowDataElement) {
          let text = rowDataElement.textContent;
          if (text) {
            text = text.trim();
            text = text.replace(/\s+/g, " "); // remove double spaces
            text = encodeURIComponent(text);
            //console.log("doHighlightForRefQuery: text = '" + text + "', refValue = '" + refValue + "'");
            if (text == refValue) {
              // we have found the row to highlight
              highlightRow(rowElement);
              return;
            }
          }
        }
      }
    }
  }
}

async function getPendingSearch(storageName) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get([storageName], function (value) {
        // clear the search data
        chrome.storage.local.remove([storageName], function () {
          //console.log('cleared scotpSearchData');
          resolve(value[storageName]);
        });
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

function hideElementsDuringSearch() {
  function hideBySelector(selector) {
    let element = document.querySelector(selector);
    if (element) {
      element.style.display = "none";
    }
  }

  const titleElement = document.querySelector("#page-wrapper div.content h1.title");
  if (titleElement) {
    titleElement.innerText = "Performing WikiTree Sourcer search on ScotlandsPeople...";
  }

  hideBySelector("#cart_summary");
  hideBySelector("#header");
  hideBySelector("div.primary-menu-wrapper");
  hideBySelector("#main-wrapper");
  hideBySelector("#main-wrapper");
  hideBySelector("#block-advancedsearchpageintro");
  hideBySelector("div.region.region-quicklinks");
  hideBySelector("footer.site-footer");
}

function parseQuery() {
  let result = undefined;
  let url = document.URL;

  let queryIndex = url.indexOf("?");
  if (queryIndex != -1) {
    let queryString = url.substring(queryIndex + 1);
    result = {};
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
        key = decodeURIComponent(key);
        value = decodeURIComponent(value);
        // O&#039;Connor
        value = value.replace(/\&\#\d\d\d\;/g, function (escapeString) {
          const numString = escapeString.replace(/\&\#(\d\d\d)\;/, "$1");
          if (numString && numString != escapeString) {
            let num = parseInt(numString);
            if (!isNaN(num)) {
              return String.fromCharCode(num);
            }
          }
          return escapeString;
        });
        result[key] = value;
      }
    }
  }

  //console.log("parseQuery, result is:");
  //console.log(result);

  return result;
}

function legacyUrlQueryToFormData(urlQuery) {
  let formData = {};
  formData.fields = [];

  //console.log("legacyUrlQueryToFormData, urlQuery is:");
  //console.log(urlQuery);

  // https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=census&record_type=census&surname=O'CONNOR&forename=BARTLEY&year%5B0%5D=1871&sex=M&age_from=28&age_to=28&county=Shipping&rd_real_name%5B0%5D=SHIPPING%20-%20MERCHANT%20NAVY&rd_display_name%5B0%5D=SHIPPING%20-%20MERCHANT%20NAVY_SHIPPING%20-%20MERCHANT%20NAVY&rdno%5B0%5D=%20&ref=903%2FS%201%2F%2016

  let recordType = urlQuery.record_type;
  if (!recordType) {
    recordType = urlQuery["record_type[0]"];
    if (!recordType) {
      return formData;
    }
  }

  const recordTypeToUrlPart = {
    stat_births: "statutory-records/stat-births",
    stat_marriages: "statutory-records/stat-marriages",
    stat_divorces: "statutory-records/stat-divorces",
    stat_deaths: "statutory-records/stat-deaths",
    civilpartnership: "statutory-records/stat-civilpartnerships",
    dissolutions: "statutory-records/stat-dissolutions",

    opr_births: "church-registers/church-births-baptisms/opr-births",
    opr_marriages: "church-registers/church-banns-marriages/opr-marriages",
    opr_deaths: "church-registers/church-deaths-burials/opr-deaths",

    crbirths_baptism: "church-registers/church-births-baptisms/cr-baptisms",
    crbanns_marriages: "church-registers/church-banns-marriages/cr-banns",
    crdeath_burial: "church-registers/church-deaths-burials/cr-burials",
    cr_other: "church-registers/church-other/cr-other",

    ch3_baptism: "church-registers/church-births-baptisms/ch3-baptisms",
    ch3_marriages: "church-registers/church-banns-marriages/ch3-banns",
    ch3_burials: "church-registers/church-deaths-burials/ch3-burials",
    ch3_other: "church-registers/church-other/ch3-other",

    census: "census-returns/census",
    census_lds: "census-returns/census",

    valuation_rolls: "valuation-rolls/vr",
    wills_testaments: "legal-records/wills",
    coa: "legal-records/coa",
    soldiers_wills: "legal-records/soldiers-wills",
    military_tribunals: "legal-records/military-tribunals",
    hie: "poor-relief/hie",
    prison_records: "prison-registers/prison-records",
  };

  let urlPart = recordTypeToUrlPart[recordType];

  //console.log("legacyUrlQueryToFormData, urlPart is:");
  //console.log(urlPart);

  if (!urlPart) {
    return formData;
  }
  formData.urlPart = urlPart;

  const useNrsYearField = [
    "opr_births",
    "opr_marriages",
    "opr_deaths",
    "crbirths_baptism",
    "crbanns_marriages",
    "crdeath_burial",
    "cr_other",
    "ch3_baptism",
    "ch3_marriages",
    "ch3_burials",
    "ch3_other",
  ];

  const useNumberForGender = ["stat_marriages", "crbirths_baptism", "crdeath_burial", "cr_other"];

  const useRdName = ["opr_births", "opr_marriages", "opr_deaths"];

  for (let key in urlQuery) {
    let value = urlQuery[key];
    if (!value) {
      continue;
    }

    // https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=census&record_type=census
    // &year%5B0%5D=1841&year%5B1%5D=1851&year%5B2%5D=1861&year%5B3%5D=1871&year%5B4%5D=1881&year%5B5%5D=1891
    // &year%5B6%5D=1901&year%5B7%5D=1911
    // &surname=Fraser&surname_so=soundex&forename=James&forename_so=soundex
    // &sex=M
    // &rd_real_name%5B0%5D=MILTON&rd_display_name%5B0%5D=MILTON_MILTON&rdno%5B0%5D=%20

    let addField = true;
    let field = { type: "text" };

    if (key == "surname" || key == "surname_so") {
      field.fieldKey = "edit-search-params-nrs-surname";
      field.value = value;
      if (key == "surname_so") {
        field.type = "so";
      }
    } else if (key == "forename" || key == "forename_so") {
      if (recordType == "census_lds") {
        field.fieldKey = "edit-search-params-nrs-given-name";
      } else if (recordType == "hie") {
        field.fieldKey = "edit-search-params-nrs-forenames";
      } else {
        field.fieldKey = "edit-search-params-nrs-forename";
      }
      field.value = value;
      if (key == "forename_so") {
        field.type = "so";
      }
    } else if (key == "forenames" || key == "forenames_so") {
      field.fieldKey = "edit-search-params-nrs-forenames";
      field.value = value;
      if (key == "forenames_so") {
        field.type = "so";
      }
    } else if (key == "spsurname" || key == "spsurname_so") {
      field.fieldKey = "edit-search-params-nrs-spsurname";
      field.value = value;
      if (key == "spsurname_so") {
        field.type = "so";
      }
    } else if (key == "spouse_surname" || key == "spouse_surname_so") {
      field.fieldKey = "edit-search-params-nrs-spouse-surname";
      field.value = value;
      if (key == "spouse_surname_so") {
        field.type = "so";
      }
    } else if (key == "spforename" || key == "spforename_so") {
      field.fieldKey = "edit-search-params-nrs-spforename";
      field.value = value;
      if (key == "spforename_so") {
        field.type = "so";
      }
    } else if (key == "spouse_forename" || key == "spouse_forename_so") {
      field.fieldKey = "edit-search-params-nrs-spouse-forename";
      field.value = value;
      if (key == "spouse_forename_so") {
        field.type = "so";
      }
    } else if (key == "psurname" || key == "psurname_so") {
      if (recordType == "civilpartnership") {
        field.fieldKey = "edit-search-params-nrs-spsurname";
      } else {
        field.fieldKey = "edit-search-params-nrs-ptsurname";
      }
      field.value = value;
      if (key == "psurname_so") {
        field.type = "so";
      }
    } else if (key == "mmsurname" || key == "mmsurname_so") {
      field.fieldKey = "edit-search-params-nrs-mmsurname";
      field.value = value;
      if (key == "mmsurname_so") {
        field.type = "so";
      }
    } else if (key == "parent_names" || key == "parent_names_so") {
      // These are now only available in refine search - I could implement a 2 step process
      addField = false; // unknown key
    } else if (key == "parent_name_two" || key == "parent_name_two_so") {
      // These are now only available in refine search - I could implement a 2 step process
      addField = false; // unknown key
    } else if (key == "spouse_name") {
      if (recordType == "opr_marriages") {
        field.fieldKey = "edit-search-params-nrs-motherspousename";
      } else {
        field.fieldKey = "edit-search-params-nrs-spouse-name";
      }
      field.value = value;
    } else if (key == "name") {
      field.fieldKey = "edit-search-params-nrs-name";
      field.value = value;
    } else if (key.startsWith("year[")) {
      if (recordType == "census") {
        field.fieldKey = "edit-search-params-nrs-census-year-" + value;
        field.type = "checkbox";
        field.value = true;
      } else if (recordType == "census_lds") {
        const suffix = "_LDS";
        if (value.endsWith(suffix)) {
          value = value.substring(0, value.length - suffix.length);
        }
        field.fieldKey = "edit-search-params-nrs-census-year-" + value + "-lds";
        field.type = "checkbox";
        field.value = true;
      } else {
        // valuation_rolls
        field.fieldKey = "edit-search-params-nrs-year-" + value;
        field.type = "radio";
        field.value = true;
      }
    } else if (key == "from_year") {
      if (useNrsYearField.includes(recordType)) {
        field.fieldKey = "edit-search-params-nrs-year-field-year-from";
      } else if (recordType == "prison_records") {
        field.fieldKey = "edit-search-params-hss-yearadmitted-year-from";
      } else if (recordType == "wills_testaments") {
        field.fieldKey = "edit-search-params-nrs-year-year-from";
      } else if (recordType == "coa") {
        field.fieldKey = "edit-search-params-nrs-grantyear-year-from";
      } else if (recordType == "soldiers_wills") {
        field.fieldKey = "edit-search-params-nrs-date-of-death-year-from";
      } else if (recordType == "dissolutions") {
        field.fieldKey = "edit-search-params-nrs-dissolution-year-year-from";
      } else if (recordType == "stat_divorces") {
        field.fieldKey = "edit-search-params-nrs-divorce-year-year-from";
      } else {
        field.fieldKey = "edit-search-params-nrs-search-year-year-from";
      }
      field.value = value;
    } else if (key == "to_year") {
      if (useNrsYearField.includes(recordType)) {
        field.fieldKey = "edit-search-params-nrs-year-field-year-to";
      } else if (recordType == "prison_records") {
        field.fieldKey = "edit-search-params-hss-yearadmitted-year-to";
      } else if (recordType == "wills_testaments") {
        field.fieldKey = "edit-search-params-nrs-year-year-to";
      } else if (recordType == "coa") {
        field.fieldKey = "edit-search-params-nrs-grantyear-year-to";
      } else if (recordType == "soldiers_wills") {
        field.fieldKey = "edit-search-params-nrs-date-of-death-year-to";
      } else if (recordType == "dissolutions") {
        field.fieldKey = "edit-search-params-nrs-dissolution-year-year-to";
      } else if (recordType == "stat_divorces") {
        field.fieldKey = "edit-search-params-nrs-divorce-year-year-to";
      } else {
        field.fieldKey = "edit-search-params-nrs-search-year-year-to";
      }
      field.value = value;
    } else if (key == "sex") {
      if (useNumberForGender.includes(recordType)) {
        let code = value.toLowerCase();
        let suffix = "";
        if (code == "m") {
          suffix = "1";
        } else if (code == "f") {
          suffix = "2";
        }
        field.fieldKey = "edit-search-params-nrs-sex-" + suffix;
      } else {
        field.fieldKey = "edit-search-params-nrs-sex-" + value.toLowerCase();
      }
      field.type = "radio";
      field.value = true;
    } else if (key == "age_from") {
      field.fieldKey = "edit-search-params-hss-age-age-from";
      field.value = value;
    } else if (key == "age_to") {
      field.fieldKey = "edit-search-params-hss-age-age-to";
      field.value = value;
    } else if (key == "birth_year") {
      // &birth_year=1895&birth_year_range=1
      field.fieldKey = "edit-search-params-nrs-dob";
      field.value = value;
    } else if (key == "birth_year_range") {
      field.fieldKey = "edit-search-params-nrs-birth-year-range";
      field.type = "select";
      field.value = value;
    } else if (key == "county") {
      field.fieldKey = "edit-search-params-str-county";
      field.type = "select";
      field.value = value.toUpperCase();
    } else if (key.startsWith("rd_display_name")) {
      let fieldKey = "edit-search-params-str-district";
      if (useRdName.includes(recordType)) {
        fieldKey = "edit-search-params-nrs-rd-name";
      }

      const existing = formData.fields.find((element) => element.fieldKey == fieldKey);
      if (existing) {
        existing.values.push(value);
        addField = false;
      } else {
        field.fieldKey = fieldKey;
        field.type = "multipleSelect";
        field.values = [value];
      }
    } else if (key.startsWith("parish_title")) {
      // &mp_code%5B0%5D=MP&mp_no%5B0%5D=6&parish_title%5B0%5D=GREENOCK%2C%20ST%20MARY'S
      let fieldKey = "edit-search-params-str-parish-congregation";
      let suffix = "";
      let bracketIndex = key.indexOf("[");
      if (bracketIndex != -1) {
        suffix = key.substring(bracketIndex);
      }
      const mpCode = urlQuery["mp_code" + suffix];
      const mpNo = urlQuery["mp_no" + suffix];
      if (mpCode && mpNo) {
        value = mpCode + "|" + mpNo + "|" + value;
      }

      const existing = formData.fields.find((element) => element.fieldKey == fieldKey);
      if (existing) {
        existing.values.push(value);
        addField = false;
      } else {
        field.fieldKey = fieldKey;
        field.type = "multipleSelect";
        field.values = [value];
      }
    } else if (key.startsWith("congregation")) {
      //&congregation%5B0%5D=AIRDRIE%20-%20WELLWYND%20ASSOCIATE
      let fieldKey = "edit-search-params-nrs-congregation";

      const existing = formData.fields.find((element) => element.fieldKey == fieldKey);
      if (existing) {
        existing.values.push(value);
        addField = false;
      } else {
        field.fieldKey = fieldKey;
        field.type = "multipleSelect";
        field.values = [value];
      }
    } else if (key == "occupation") {
      field.fieldKey = "edit-search-params-wrd-occupation";
      field.value = value;
    } else if (key == "tribunal") {
      field.fieldKey = "edit-search-params-nrs-tribunal";
      field.type = "select";
      field.value = value;
    } else if (key.startsWith("court")) {
      field.fieldKey = "edit-search-params-nrs-court";
      field.type = "select";
      field.value = value.trim().toUpperCase();
    } else if (key == "service_number") {
      field.fieldKey = "edit-search-params-nrs-service-number";
      field.value = value;
    } else if (key == "description") {
      field.fieldKey = "edit-search-params-wrd-designation";
      field.value = value;
    } else if (key == "census_place") {
      field.fieldKey = "edit-search-params-nrs-census-place";
      field.value = "*" + value + "*";
    } else if (key == "birthplace") {
      field.fieldKey = "edit-search-params-nrs-birth-place";
      field.value = "*" + value + "*";
    } else {
      addField = false; // unknown key
    }

    if (addField) {
      formData.fields.push(field);
    }
  }

  return formData;
}

function sendFormDataToSearchPage(path, formData) {
  const scotpSearchData = {
    timeStamp: Date.now(),
    url: path,
    formData: formData,
  };

  //console.log("sendFormDataToSearchPage, scotpSearchData is:");
  //console.log(scotpSearchData);

  // this stores the search data in local storage which is then picked up by the
  // content script in the new tab/window
  chrome.storage.local.set({ scotpSearchData: scotpSearchData }, async function () {
    //console.log("saved scotpSearchData, scotpSearchData is:");
    //console.log(scotpSearchData);
    window.location.href = path;
  });
}

function doLegacySearch() {
  // example legacy search URL:
  // https://www.scotlandspeople.gov.uk/record-results?search_type=people&dl_cat=census&record_type=census&surname=O'CONNOR&forename=BARTLEY&year%5B0%5D=1871&sex=M&age_from=28&age_to=28&county=Shipping&rd_real_name%5B0%5D=SHIPPING%20-%20MERCHANT%20NAVY&rd_display_name%5B0%5D=SHIPPING%20-%20MERCHANT%20NAVY_SHIPPING%20-%20MERCHANT%20NAVY&rdno%5B0%5D=%20&ref=903%2FS%201%2F%2016

  //console.log("legacy search");

  let urlQuery = parseQuery();

  let formData = legacyUrlQueryToFormData(urlQuery);

  //console.log("doLegacySearch, formData is:");
  //console.log(formData);

  if (formData && formData.fields && formData.fields.length > 0) {
    hideElementsDuringSearch();
    const searchUrl = "https://www.scotlandspeople.gov.uk/search-records/" + formData.urlPart;
    sendFormDataToSearchPage(searchUrl, formData);
  }
}

async function checkForPendingSearch() {
  //console.log("checkForPendingSearch: called, document.URL is: " + document.URL);

  if (document.URL) {
    let lcUrl = document.URL.toLowerCase();
    if (lcUrl.includes("search_type=people")) {
      let isLegacy = false;
      if (lcUrl.includes("/record-results?")) {
        isLegacy = true;
      } else if (lcUrl.includes("/advanced-search?")) {
        // a modified old search URL
        isLegacy = true;
      }
      if (isLegacy) {
        doLegacySearch();
        return;
      }
    }
  }

  //console.log("checkForPendingSearch: document.referrer is: " + document.referrer);

  if (document.referrer) {
    // when this page was opened by the extension referrer is an empty string
    return;
  }

  let isAdvancedSearch = false;
  let isSearchResults = false;
  let storageName = "";
  if (document.URL.startsWith("https://www.scotlandspeople.gov.uk/search-records/")) {
    isAdvancedSearch = true;
    storageName = "scotpSearchData";
  } else if (document.URL.startsWith("https://www.scotlandspeople.gov.uk/record-results/")) {
    isSearchResults = true;
    storageName = "scotpSearchRefineData";
  }

  if (isAdvancedSearch || isSearchResults) {
    //console.log("checkForPendingSearch: URL matches");

    // check logged in
    const loginElement = document.querySelector("div.log-in");
    if (loginElement) {
      return;
    }

    let searchData = await getPendingSearch(storageName);

    if (searchData) {
      //console.log("checkForPendingSearch: got searchData:");
      //console.log(searchData);

      let searchUrl = searchData.url;
      let timeStamp = searchData.timeStamp;
      let timeStampNow = Date.now();
      let timeSinceSearch = timeStampNow - timeStamp;

      //console.log("checkForPendingSearch: searchUrl is : '" + searchUrl + "'");
      //console.log("checkForPendingSearch: document.URL is : '" + document.URL + "'");
      //console.log("checkForPendingSearch: timeStamp is :" + timeStamp);
      //console.log("checkForPendingSearch: timeStampNow is :" + timeStampNow);
      //console.log("checkForPendingSearch: timeSinceSearch is :" + timeSinceSearch);

      if (timeSinceSearch < 10000 && (isSearchResults || searchUrl == document.URL)) {
        // we are doing a search
        hideElementsDuringSearch();

        let formData = searchData.formData;

        //console.log("checkForPendingSearch: formData is:");
        //console.log(formData);

        for (var field of formData.fields) {
          //console.log("checkForPendingSearch: field.fieldKey is: " + field.fieldKey);
          if (field.fieldKey) {
            const elementId = field.fieldKey;
            const fieldType = field.type;

            //console.log("checkForPendingSearch: fieldType is: " + fieldType);

            let inputElement = document.getElementById(elementId);

            if (!inputElement) {
              continue;
            }

            //console.log("checkForPendingSearch: inputElement found, existing value is: " + inputElement.value);
            //console.log("checkForPendingSearch: inputElement.tagName is: " + inputElement.tagName);
            let inputType = inputElement.getAttribute("type");
            //console.log("checkForPendingSearch: inputElement type is: " + inputType);
            //console.log("checkForPendingSearch: fieldType is: " + fieldType);

            let expectedType = fieldType;
            if (fieldType == "so") {
              expectedType = "text";
            } else if (fieldType == "select" || fieldType == "multipleSelect") {
              expectedType = null;
            }

            if (inputType != expectedType) {
              continue;
            }

            let expectedTag = "INPUT";
            if (fieldType == "select" || fieldType == "multipleSelect") {
              expectedTag = "SELECT";
            }

            if (inputElement.tagName != expectedTag) {
              continue;
            }

            if (fieldType == "text") {
              //console.log("checkForPendingSearch: text element, new value is : " + field.value);
              inputElement.value = field.value;
            } else if (fieldType == "so") {
              //console.log("checkForPendingSearch: so element, new value is : " + field.value);
              let soWrapper = inputElement.closest("div.so-wrapper");
              if (soWrapper) {
                let buttons = soWrapper.querySelectorAll("input.search-options");
                for (let button of buttons) {
                  //console.log("checkForPendingSearch: so element, button value is : " + button.value);
                  if (button.value == field.value) {
                    button.checked = true;
                  } else {
                    button.checked = false;
                  }
                }
              }
            } else if (fieldType == "radio") {
              inputElement.checked = field.value;
            } else if (fieldType == "checkbox") {
              inputElement.checked = field.value;
            } else if (fieldType == "select") {
              //console.log("checkForPendingSearch: select element, new value is : " + field.value);

              inputElement.value = field.value;
            } else if (fieldType == "multipleSelect") {
              //console.log("checkForPendingSearch: multipleSelect element, new values are : ");
              //console.log(field.values);
              let optionElements = inputElement.querySelectorAll("option");
              let optionIndex = 0;
              for (let option of optionElements) {
                option.selected = false;
                if (field.values.includes(option.value)) {
                  //console.log("checkForPendingSearch: multipleSelect element, found match : " + option.value);
                  option.selected = true;
                }
                optionIndex++;
              }
            }
          }
        }

        // try to submit form
        let formElementId = "advanced-search-form";
        if (isSearchResults) {
          formElementId = "refine-advanced-search-form";
        }

        let formElement = document.getElementById(formElementId);
        if (formElement) {
          //console.log("checkForPendingSearch: found formElement:");
          //console.log(formElement);
          // now submit the form to do the search
          formElement.submit();
        }
      }
    }
  }
}

async function checkForSearchThenInit() {
  // check for a pending search first, there is no need to do the site init if there is one
  await checkForPendingSearch();

  siteContentInit(`scotp`, `site/scotp/core/scotp_extract_data.mjs`);

  addClickedRowListener();
  doHighlightForRefQuery();
}

checkForSearchThenInit();
