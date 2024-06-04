/*
MIT License

Copyright (c) 2024 Robert M Pavey

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

import {
  beginMainMenu,
  endMainMenu,
  addMenuItem,
  addBackMenuItem,
  addSameRecordMenuItem,
  doAsyncActionWithCatch,
  closePopup,
  displayUnexpectedErrorMessage,
} from "/base/browser/popup/popup_menu_building.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

import {
  registerSearchMenuItemFunction,
  testFilterForDatesAndCountries,
  openUrlInNewTab,
} from "/base/browser/popup/popup_search.mjs";

import { setupSearchWithParametersSubMenu } from "/base/browser/popup/popup_search_with_parameters.mjs";

import { checkPermissionForSite } from "/base/browser/popup/popup_permissions.mjs";

function getSupportedDates() {
  const recordStartYear = 1836;
  const date = new Date();
  const year = date.getFullYear();
  const recordEndYear = year - 29;

  let birthEndYear = year - 99;
  let marriageEndYear = year - 59;
  let deathEndYear = year - 29;

  const dates = {
    startYear: recordStartYear,
    endYear: recordEndYear,
    birthEndYear: birthEndYear,
    marriageEndYear: marriageEndYear,
    deathEndYear: deathEndYear,
  };

  return dates;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function doVicbdmSearch(input, isRetry = false) {
  doAsyncActionWithCatch("Victoria BDM (Aus) Search", input, async function () {
    let loadedModule = await import(`../core/vicbdm_build_search_data.mjs`);
    let buildResult = loadedModule.buildSearchData(input);

    let fieldData = buildResult.fieldData;
    let selectData = buildResult.selectData;

    let searchUrl = "https://my.rio.bdm.vic.gov.au/efamily-history/-";

    const checkPermissionsOptions = {
      reason:
        "To perform a search on Victoria BDM a content script needs to be loaded on the bdm.vic.gov.au search page.",
    };
    let allowed = await checkPermissionForSite("*://*.bdm.vic.gov.au/*", checkPermissionsOptions);
    if (!allowed) {
      closePopup();
      return;
    }

    const searchData = {
      timeStamp: Date.now(),
      url: searchUrl,
      fieldData: fieldData,
      selectData: selectData,
    };

    //console.log("doVicbdmSearch, searchData is:");
    //console.log(searchData);

    let reuseTabIfPossible = options.search_vicbdm_reuseExistingTab;

    // send message to background to do search so that we can close popup
    try {
      chrome.runtime.sendMessage(
        {
          type: "doSearchWithSearchData",
          siteName: "vicbdm",
          searchData: searchData,
          reuseTabIfPossible: reuseTabIfPossible,
        },
        function (response) {
          // We get a detailed response for debugging this
          //console.log("doSearchWithSearchData got response: ");
          //console.log(response);

          // the message should only ever get a successful response but it could be delayed
          // if the background is asleep.
          if (chrome.runtime.lastError) {
            const message = "Failed to open search page, runtime.lastError is set";
            displayUnexpectedErrorMessage(message, chrome.runtime.lastError, true);
          } else if (!response) {
            // I'm getting this on Safari but it may be due to dev environment
            // If I run from xcode it works OK. It I then close Safari, reopen
            // it doesn't seem to start the background script and I get this error.
            // I changes Safari macOS back to using service_worker in the manifest and
            // that seemed to fix that. I still see it in iOS (simulator) though. It seems
            // to happen when the background has been unloaded and doig the search again
            // immediately after seems to fix it. So adding a timeout and retry here
            if (isRetry) {
              let message = "Failed to open search page, no response from background script.";
              message += "\nTry disabling and re-enabling the WikiTree Sourcer extension.";
              displayUnexpectedErrorMessage(message, undefined, false);
            } else {
              setTimeout(function () {
                doVicbdmSearch(input, true);
              }, 100);
            }
          } else if (!response.success) {
            const message = "Failed to open search page, success=false";
            displayUnexpectedErrorMessage(message, response, true);
          } else {
            // message was received OK
            closePopup();
          }
        }
      );
    } catch (error) {
      const message = "Failed to open search page, caught exception";
      displayUnexpectedErrorMessage(message, error, true);
    }
  });
}

async function vicbdmSearch(generalizedData, typeOfSearch) {
  const input = { generalizedData: generalizedData, typeOfSearch: typeOfSearch, options: options };
  doVicbdmSearch(input);
}

async function vicbdmSearchWithParameters(generalizedData, parameters) {
  const input = {
    typeOfSearch: "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options,
  };
  doVicbdmSearch(input);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addVicbdmDefaultSearchMenuItem(menu, data, backFunction, filter) {
  const stdCountryNames = ["Australia", "Colony of Victoria"];
  const supportedDates = getSupportedDates();

  if (filter) {
    if (!testFilterForDatesAndCountries(filter, supportedDates.startYear, supportedDates.endYear, stdCountryNames)) {
      return;
    }
  } else {
    let maxLifespan = Number(options.search_general_maxLifespan);

    let birthPossibleInRange = data.generalizedData.couldPersonHaveBeenBornInDateRange(
      supportedDates.startYear,
      supportedDates.birthEndYear,
      maxLifespan
    );
    let deathPossibleInRange = data.generalizedData.couldPersonHaveDiedInDateRange(
      supportedDates.startYear,
      supportedDates.deathEndYear,
      maxLifespan
    );
    let marriagePossibleInRange = data.generalizedData.couldPersonHaveMarriedInDateRange(
      supportedDates.startYear,
      supportedDates.marriageEndYear,
      maxLifespan
    );

    if (!(birthPossibleInRange || deathPossibleInRange || marriagePossibleInRange)) {
      //console.log("addVicbdmDefaultSearchMenuItem: dates not in range");
      return;
    }

    if (!data.generalizedData.didPersonLiveInCountryList(stdCountryNames)) {
      //console.log("addVicbdmDefaultSearchMenuItem: didPersonLiveInCountryList returned false");
      return;
    }
  }

  addMenuItem(menu, "Search Victoria BDM (Aus)...", function (element) {
    setupVicbdmSearchSubMenu(data, backFunction, filter);
  });

  return true;
}

function addVicbdmSameRecordMenuItem(menu, data) {
  addSameRecordMenuItem(menu, data, "fmp", function (element) {
    vicbdmSearch(data.generalizedData, "SameCollection");
  });
}

function addVicbdmSearchBirthsMenuItem(menu, data, filter) {
  if (!filter) {
    const supportedDates = getSupportedDates();

    let maxLifespan = Number(options.search_general_maxLifespan);
    let birthPossibleInRange = data.generalizedData.couldPersonHaveBeenBornInDateRange(
      supportedDates.startYear,
      supportedDates.birthEndYear,
      maxLifespan
    );
    if (!birthPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Victoria BDM Births", function (element) {
    vicbdmSearch(data.generalizedData, "Births");
  });
}

function addVicbdmSearchMarriagesMenuItem(menu, data, filter) {
  if (!filter) {
    const supportedDates = getSupportedDates();

    let maxLifespan = Number(options.search_general_maxLifespan);
    let marriagePossibleInRange = data.generalizedData.couldPersonHaveMarriedInDateRange(
      supportedDates.startYear,
      supportedDates.marriageEndYear,
      maxLifespan
    );
    if (!marriagePossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Victoria BDM Marriages", function (element) {
    vicbdmSearch(data.generalizedData, "Marriages");
  });
}

function addVicbdmSearchDeathsMenuItem(menu, data, filter) {
  if (!filter) {
    const supportedDates = getSupportedDates();

    let maxLifespan = Number(options.search_general_maxLifespan);
    let deathPossibleInRange = data.generalizedData.couldPersonHaveDiedInDateRange(
      supportedDates.startYear,
      supportedDates.deathEndYear,
      maxLifespan
    );
    if (!deathPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search Victoria BDM Deaths", function (element) {
    vicbdmSearch(data.generalizedData, "Deaths");
  });
}

function addVicbdmSearchWithParametersMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Search with specified parameters...", function (element) {
    setupVicbdmSearchWithParametersSubMenu(data, backFunction);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupVicbdmSearchSubMenu(data, backFunction, filter) {
  let backToHereFunction = function () {
    setupVicbdmSearchSubMenu(data, backFunction, filter);
  };

  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addVicbdmSameRecordMenuItem(menu, data);
  addVicbdmSearchBirthsMenuItem(menu, data, filter);
  addVicbdmSearchMarriagesMenuItem(menu, data, filter);
  addVicbdmSearchDeathsMenuItem(menu, data, filter);
  addVicbdmSearchWithParametersMenuItem(menu, data, backToHereFunction);

  endMainMenu(menu);
}

async function setupVicbdmSearchWithParametersSubMenu(data, backFunction) {
  let dataModule = await import(`../core/vicbdm_search_menu_data.mjs`);
  setupSearchWithParametersSubMenu(data, backFunction, dataModule.VicbdmData, vicbdmSearchWithParameters);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("vicbdm", "Victoria BDM (Aus)", addVicbdmDefaultSearchMenuItem);
