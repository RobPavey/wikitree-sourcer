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

//////////////////////////////////////////////////////////////////////////////////////////
// Helper functions
//////////////////////////////////////////////////////////////////////////////////////////

const PENDING_SEARCH = "eggsabdmSearchData";
const PREVIOUS_SEARCH = "eggsabdmPrevSearchData";
const PREVIOUS_SUBMIT = "eggsabdmPrevSubmitData";

async function setSearchData(key, data) {
  chrome.storage.local.set({ [key]: data }, function () {
    // console.log(eggsabdmSearchData);
  });
}

async function getSearchData(key) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get([key], function (value) {
        resolve(value[key]);
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

async function clearSearchData(key) {
  chrome.storage.local.remove([key], function () {
    //console.log(`cleared ${key}`);
  });
}

function selectByText(select, text) {
  for (const option of select.options) {
    if (option.text.trim() === text) {
      select.value = option.value; // equivalent to option.selected = true
      break;
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Pendiing search processing
//////////////////////////////////////////////////////////////////////////////////////////

async function checkForAndProcessPendingSearch() {
  //   console.log("checkForPendingSearch: called, URL is " + document.URL);
  //   console.log("checkForPendingSearch: document.referrer is: " + document.referrer);

  if (document.referrer) {
    // when this page was opened by the extension referrer is an empty string
    return false;
  }

  const lcUrl = document.URL.toLowerCase();
  if (lcUrl.includes("eggsa.org/bdms")) {
    // console.log("checkForPendingSearch: URLs match");

    const searchData = await getSearchData(PENDING_SEARCH);
    // Example searchData:
    // {
    //     "fieldData": {
    //         "options": {},
    //         "radioNameFields": {
    //             "Result_order": "by_Surname"
    //         },
    //         "selectFieldsByText": {
    //             "Role_of_Person_One": "Bride",
    //             "Which_Town": "All"
    //         },
    //         "selectFieldsByValue": {
    //             "firstname_mode": "1",
    //             "surname_mode": "1"
    //         },
    //         "simpleNameFields": {
    //             "Person_one_first_name": "Hilletje",
    //             "Person_one_surname": "Smit"
    //         },
    //         "utf8": true
    //     },
    //     "search": "Marriages",
    //     "timeStamp": 1759143391554,
    //     "url": "https://www.eggsa.org/bdms/Marriages.html"
    // }
    if (searchData) {
      // console.log("checkForPendingSearch got searcData:", searchData);
      // clear the search data
      clearSearchData(PENDING_SEARCH);

      const searchUrl = searchData.url;
      const timeStamp = searchData.timeStamp;
      const timeStampNow = Date.now();
      const timeSinceSearch = timeStampNow - timeStamp;

      if (timeSinceSearch < 10000 && searchUrl == document.URL) {
        const [firstName, lastName, role, where] = populateForm(searchData);
        // console.log(`firstName:${firstName}, lastName:${lastName}, role=${role}, where:${where}`);
        if (firstName || lastName) {
          setSearchData(PREVIOUS_SEARCH, searchData);

          const formElement = document.querySelector("form");

          // Try to submit form
          // but first add a message to the page so that the user knows what is happening
          const titleElement = document.querySelector("#content h2");
          if (titleElement) {
            const text = titleElement.textContent;
            titleElement.innerText = "Sourcer searching: " + text;
          }
          const roleText = role ? ` as ${role}` : "";
          const whereText = where == "All" ? " anywhere" : ` in ${where}`;

          const p = document.createElement("p");
          p.textContent = `Searching for ${firstName} ${lastName}${roleText}${whereText}...`;
          formElement.before(p);

          // Now hide the form so that the user doesn't try to use it.
          formElement.style.display = "none";

          // now submit the form to do the search
          formElement.submit();
          return true;
        }
      } else {
        console.log(`searchTarget mismatch: ${searchData.searchTarget}`);
      }
    } else {
      console.log("No search data found");
    }
  }
  return false;
}

function populateForm(searchData) {
  let firstName;
  let lastName;
  let role;
  let where;
  const formElement = document.querySelector("form");
  if (formElement) {
    const fieldData = searchData.fieldData;
    // console.log("populateForm: fieldData is:", fieldData);

    for (const key in fieldData.simpleNameFields) {
      if (key) {
        const value = fieldData.simpleNameFields[key];
        const selector = "input[name=" + CSS.escape(key) + "]";
        const inputElement = formElement.querySelector(selector);
        if (inputElement) {
          inputElement.value = value;
        }
        // This so we can display an informative message during the search
        if (key == "Person_one_first_name" || key == "what_firstname") {
          firstName = value;
        } else if (key == "Person_one_surname" || key == "what_surname") {
          lastName = value;
        }
      }
    }
    for (const key in fieldData.selectFieldsByText) {
      if (key) {
        const value = fieldData.selectFieldsByText[key];
        const selector = "select[name=" + CSS.escape(key) + "]";
        const selectElement = formElement.querySelector(selector);

        if (selectElement) {
          selectByText(selectElement, value);

          // This so we can display an informative message during the search
          if (key == "Role_of_Person_One") {
            role = value;
          } else if (key == "Which_Town") {
            where = value;
          }
        }
      }
      for (const key in fieldData.selectFieldsByValue) {
        if (key) {
          const value = fieldData.selectFieldsByValue[key];

          const selector = "select[name=" + CSS.escape(key) + "]";
          const selectElement = formElement.querySelector(selector);

          if (selectElement) {
            selectElement.value = value;
          }
        }
      }
      for (const key in fieldData.radioNameFields) {
        const value = fieldData.radioNameFields[key];
        const selector = `input[name="${CSS.escape(key)}"][value="${CSS.escape(value)}"]`;
        const radioElement = formElement.querySelector(selector);
        if (radioElement) {
          radioElement.checked = true;
        }
      }
    }
    return [firstName, lastName, role, where];
  }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Processing for selecting records for citation processing
//////////////////////////////////////////////////////////////////////////////////////////

// We use the Row terminology here like elsewhere, but eGSSA BMD search results do not have
// tables and rows, just paragraphs

let EggsaBdmCommon;

function highlightRow(selectedRow) {
  selectedRow.setAttribute("style", EggsaBdmCommon.getHighlightStyle());
}

function unHighlightRow(selectedRows) {
  selectedRows.removeAttribute("style");
}

function wrapSectionsUpToFirstHR(content) {
  const children = Array.from(content.childNodes);
  let firstNbspSeen = false;

  const isNbspP = (node) =>
    node &&
    node.nodeType === Node.ELEMENT_NODE &&
    node.tagName === "P" &&
    /^[\s\u00A0]*$/.test(node.textContent) &&
    /\u00A0/.test(node.textContent);

  const isEmptyP = (node) =>
    node && node.nodeType === Node.ELEMENT_NODE && node.tagName === "P" && /^[\s\u00A0]*$/.test(node.textContent);

  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "HR") break;

    if (isNbspP(node)) {
      if (!firstNbspSeen) {
        // First &nbsp; seen → just mark previous non-empty <p>
        firstNbspSeen = true;
        const prev = children[i - 1];
        if (prev && prev.tagName === "P" && !isEmptyP(prev)) {
          prev.classList.add("wrapped-block");
        }
      }

      // Find the matching empty <p> (closing)
      let end = -1;
      for (let k = i + 1; k < children.length; k++) {
        const child = children[k];
        if (child.nodeType === Node.ELEMENT_NODE && child.tagName === "HR") break;
        if (isEmptyP(child)) {
          end = k;
          break;
        }
      }
      if (end === -1) continue;

      // Wrap content strictly between opener (i) and closer (end)
      if (end > i + 1) {
        const wrapper = document.createElement("div");
        wrapper.className = "wrapped-block";
        const firstInner = children[i + 1];
        firstInner.parentNode.insertBefore(wrapper, firstInner);

        for (let idx = i + 1; idx < end; idx++) {
          wrapper.appendChild(children[idx]);
        }
      }

      i = end; // continue after closer
    }
  }
}

function addClickedRowListener() {
  //console.log("addClickedRowListener");

  const resultContainer = document.querySelector("#content");
  if (resultContainer && !resultContainer.hasAttribute("sourcerOnClick")) {
    EggsaBdmCommon.stripUnknownTags(resultContainer);

    resultContainer.setAttribute("sourcerOnClick", "true");

    resultContainer.addEventListener("click", function (ev) {
      //console.log("clickedRowListener: ev is");
      //console.log(ev);

      // clear existing selected row if any
      let selectedRow = EggsaBdmCommon.getSelectedRow(document);
      if (selectedRow) {
        unHighlightRow(selectedRow);
      }
      selectedRow = ev.target;
      if (selectedRow) {
        const [pageType] = EggsaBdmCommon.getPageType(document);
        // const rowSelector = pageType === "Marriage" ? ".wrapped-block" : "p";
        const rowSelector = EggsaBdmCommon.getRowSelector(pageType);
        if (rowSelector) {
          selectedRow = selectedRow.closest(rowSelector);
          if (selectedRow && EggsaBdmCommon.isRecordOfType(selectedRow, pageType)) {
            highlightRow(selectedRow);
          }
        }
      }
    });
  }
}

function getForm() {
  const submitButton = document.querySelector('input[type="submit"][name="Search"]');
  if (submitButton) {
    return submitButton.closest("form"); // gets the enclosing form
  }
}

// Add a listener that will save all the form fields so we can restore them after the search.
// We do this because eGGSA clears the form after a search, but we want to allow a user
// to modify the search if they so wishes. Saving the values allows us to restore them
// after the search.
function addFormSaveListener() {
  const form = getForm();
  if (!form || form.hasAttribute("sourcerOnClick")) return;

  // We explicitely add the value "`sumbit" to the submit button because browsers don't
  // always add the type as a label after we've messed woth the page.
  const submitButton = document.querySelector('input[type="submit"][name="Search"]');
  submitButton.value = "Submit";

  form.setAttribute("sourcerOnClick", "true");

  form.addEventListener("submit", function (event) {
    const dataToSave = {};
    Array.from(form.elements).forEach((el) => {
      if (!el.name) return; // skip elements without name
      if (el.type === "hidden") return; // skip hidden elements
      if ((el.type === "radio" || el.type === "checkbox") && !el.checked) return;
      dataToSave[el.name] = el.value;
    });
    // console.log("prevSubmit", dataToSave);
    setSearchData(PREVIOUS_SUBMIT, dataToSave);
  });
}

// Repopulate the form fields (which are cleared by eGGSA after a search) with the
// values of the search, so it is easy for the user to modify something if they want
async function restorePreviousSubmit() {
  const saved = await getSearchData(PREVIOUS_SUBMIT);
  if (!saved) return;
  // console.log("previous submit", saved);

  const form = getForm();
  if (form) {
    Array.from(form.elements).forEach((el) => {
      if (!el.name || !(el.name in saved)) return;

      if (el.type === "radio" || el.type === "checkbox") {
        el.checked = el.value === saved[el.name];
      } else {
        el.value = saved[el.name];
      }
    });
  }
  clearSearchData(PREVIOUS_SUBMIT);
}

//////////////////////////////////////////////////////////////////////////////////////////
// On load processing
//////////////////////////////////////////////////////////////////////////////////////////

async function checkForSearchThenInit() {
  // check for a pending search first, there is no need to do the site init if there is one
  // since the search will cause a reload of the page.
  const hadPendingSearch = await checkForAndProcessPendingSearch();
  if (hadPendingSearch) return;

  siteContentInit(`eggsabdm`, `site/eggsabdm/core/eggsabdm_extract_data.mjs`);
  const prevSearch = await getSearchData(PREVIOUS_SEARCH);
  if (prevSearch) {
    // console.log("previous search", prevSearch);
    populateForm(prevSearch);
    clearSearchData(PREVIOUS_SEARCH);
  } else {
    await restorePreviousSubmit();
  }
  EggsaBdmCommon = await import(chrome.runtime.getURL("site/eggsabdm/core/eggsabdm_common.mjs"));
  addClickedRowListener();
  addFormSaveListener();
}

checkForSearchThenInit();
