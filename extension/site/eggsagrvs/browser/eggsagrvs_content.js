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

const PENDING_SEARCH = "eggsagrvsSearchData";
const PREVIOUS_SEARCH = "eggsagrvsPrevSearchData";
const PREVIOUS_SUBMIT = "eggsagrvsPrevSubmitData";

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

async function setSearchData(key, data) {
  chrome.storage.local.set({ [key]: data }, function () {
    // console.log(eggsabdmSearchData);
  });
}

async function clearSearchData(key) {
  chrome.storage.local.remove([key], function () {
    //console.log(`cleared ${key}`);
  });
}

async function checkForAndProcessPendingSearch() {
  //   console.log("checkForPendingSearch: called, URL is " + document.URL);
  //   console.log("checkForPendingSearch: document.referrer is: " + document.referrer);

  if (document.referrer) {
    // when this page was opened by the extension referrer is an empty string
    return false;
  }

  const lcUrl = document.URL.toLowerCase();
  if (lcUrl.includes("graves.eggsa.org") && lcUrl.includes("searchgraves")) {
    // console.log("checkForPendingSearch: URLs match");

    const searchData = await getSearchData(PENDING_SEARCH);

    if (searchData) {
      // console.log("checkForPendingSearch got searcData:", searchData);
      clearSearchData(PENDING_SEARCH);

      const searchUrl = searchData.url;
      const timeStamp = searchData.timeStamp;
      const timeStampNow = Date.now();
      const timeSinceSearch = timeStampNow - timeStamp;

      //   console.log("checkForPendingSearch: searchUrl is :" + searchUrl);
      //   console.log("checkForPendingSearch: timeStamp is :" + timeStamp);
      //   console.log("checkForPendingSearch: timeStampNow is :" + timeStampNow);
      //   console.log("checkForPendingSearch: timeSinceSearch is :" + timeSinceSearch);

      if (timeSinceSearch < 10000 && searchUrl == document.URL) {
        const [firstName, lastName] = populateForm(searchData);
        if (firstName || lastName) {
          setSearchData(PREVIOUS_SEARCH, searchData);

          // try to submit form
          // but first add a message to the page so that the user knows what is happening
          const formElement = document.querySelector("form");
          const titleElement = document.querySelector("#content h2");
          if (titleElement) {
            const text = titleElement.textContent;
            titleElement.innerText = "Sourcer: " + text;
          }
          const div = document.querySelector(".form-style-search");
          const p = document.createElement("p");
          p.textContent = `Searching for ${firstName} ${lastName}...`;
          div.prepend(p);

          // Now hide the form so that the user doesn't try to use it.
          formElement.style.display = "none";

          // Submit the form to do the search
          formElement.submit();
          return true;
        }
      } else {
        console.log(`searcTarget mismatch: ${searchData.searchTarget}`);
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
  const formElement = document.querySelector("form");
  if (formElement) {
    const fieldData = searchData.fieldData;
    // console.log("populateForm: fieldData is:", fieldData);

    for (var key in fieldData.simpleNameFields) {
      if (key) {
        const value = fieldData.simpleNameFields[key];
        const selector = "input[name=" + CSS.escape(key) + "]";
        const inputElement = formElement.querySelector(selector);
        if (inputElement) {
          inputElement.value = value;
        }
        // This so we can display an informative message during the search
        if (key == "what_firstname") {
          firstName = value;
        } else if (key == "what_surname") {
          lastName = value;
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
  }
  return [firstName, lastName];
}

function getForm() {
  const submitButton = document.querySelector('input[type="submit"][name="Search"]');
  return submitButton.closest("form"); // gets the enclosing form
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
  Array.from(form.elements).forEach((el) => {
    if (!el.name || !(el.name in saved)) return;

    if (el.type === "radio" || el.type === "checkbox") {
      el.checked = el.value === saved[el.name];
    } else {
      el.value = saved[el.name];
    }
  });
  clearSearchData(PREVIOUS_SUBMIT);
}

async function checkForSearchThenInit() {
  // check for a pending search first, there is no need to do the site init if there is one
  // since the search will cause a reload of the page.
  const hadPendingSearch = await checkForAndProcessPendingSearch();
  if (hadPendingSearch) return;

  siteContentInit(`eggsagrvs`, `site/eggsagrvs/core/eggsagrvs_extract_data.mjs`);
  const prevSearchData = await getSearchData(PREVIOUS_SEARCH);
  if (prevSearchData) {
    populateForm(prevSearchData);
    clearSearchData(PREVIOUS_SEARCH);
  } else {
    await restorePreviousSubmit();
  }
  addFormSaveListener();
}

checkForSearchThenInit();
