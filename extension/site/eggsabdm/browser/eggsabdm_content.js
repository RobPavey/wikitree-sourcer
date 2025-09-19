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

async function setSearchData(key, data) {
  chrome.storage.local.set({ [key]: data }, function () {
    // console.log(eggsabdmSearchData);
  });
}

const PENDING_SEARCH = "eggsabdmSearchData";
const PREVIOUS_SEARCH = "eggsabdmPrevSearchData";

async function getPendingSearch() {
  return getSearchData(PENDING_SEARCH);
}

async function getPreviousSearch() {
  return getSearchData(PREVIOUS_SEARCH);
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

async function checkForPendingSearch() {
  //   console.log("checkForPendingSearch: called, URL is " + document.URL);
  //   console.log("checkForPendingSearch: document.referrer is: " + document.referrer);

  if (document.referrer) {
    // when this page was opened by the extension referrer is an empty string
    return;
  }

  const lcUrl = document.URL.toLowerCase();
  if (lcUrl.includes("eggsa.org/bdms")) {
    // console.log("checkForPendingSearch: URLs match");

    const searchData = await getSearchData(PENDING_SEARCH);

    if (searchData) {
      console.log("checkForPendingSearch got searcData:", searchData);

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
        }
      } else {
        console.log(`searchTarget mismatch: ${searchData.searchTarget}`);
      }

      // clear the search data
      clearSearchData(PENDING_SEARCH);
    } else {
      console.log("No search data found");
    }
  }
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

function selectByText(select, text) {
  for (const option of select.options) {
    if (option.text.trim() === text) {
      select.value = option.value; // equivalent to option.selected = true
      break;
    }
  }
}

async function checkForSearchThenInit() {
  // check for a pending search first, there is no need to do the site init if there is one
  await checkForPendingSearch();
  siteContentInit(`eggsabdm`, `site/eggsabdm/core/eggsabdm_extract_data.mjs`);
  const prevSearch = await getSearchData(PREVIOUS_SEARCH);
  if (prevSearch) {
    populateForm(prevSearch);
    // clearSearchData(PREVIOUS_SEARCH);
  }
}

checkForSearchThenInit();
