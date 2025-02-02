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

import { options } from "/base/browser/options/options_loader.mjs";
import {
  addMenuItem,
  addBackMenuItem,
  beginMainMenu,
  endMainMenu,
  addBreak,
  closePopup,
  keepPopupOpen,
  displayUnexpectedErrorMessage,
} from "/base/browser/popup/popup_menu_building.mjs";
import { CD } from "/base/core/country_data.mjs";
import { getLocalStorageItem } from "/base/browser/common/browser_compat.mjs";
import { popupState } from "./popup_state.mjs";

var filterState = {
  filterByDate: true,
  filterByCountry: true,
};

async function savePopupSearchFilterState() {
  //console.log("savePopupSearchFilterState, filterState is")
  //console.log(filterState);
  let items = { searchPopup_filter: filterState };
  chrome.storage.local.set(items);
}

async function restorePopupSearchFilterState() {
  let savedFilterState = await getLocalStorageItem("searchPopup_filter");
  //console.log("restorePopupSearchFilterState, savedFilterState is")
  //console.log(savedFilterState);
  if (savedFilterState) {
    filterState = savedFilterState;
  }
}

function openUrlInNewTab(link) {
  if (keepPopupOpen) {
    return;
  }

  const tabOption = options.search_general_newTabPos;

  if (tabOption == "newWindow") {
    chrome.windows.create({ url: link });
  } else if (tabOption == "nextToRight") {
    let tabIndex = undefined;
    // this is a bit of a hacky way of getting the active tab index
    if (popupState && popupState.initialStateInDefaultPopup) {
      tabIndex = popupState.initialStateInDefaultPopup.tabIndex;
    }
    if (!tabIndex && popupState && popupState.initialStateInSitePopup) {
      tabIndex = popupState.initialStateInSitePopup.tabIndex;
    }

    if (tabIndex) {
      chrome.tabs.create({ url: link, index: tabIndex + 1 });
    } else {
      chrome.tabs.create({ url: link });
    }
  } else {
    chrome.tabs.create({ url: link });
  }
}

async function doSearch(loadedModule, input) {
  const result = loadedModule.buildSearchUrl(input);
  var newURL = result.url;
  openUrlInNewTab(newURL);
  closePopup();
}

function testFilterForDatesAndCountries(filter, siteConstraints) {
  let siteStartYear = siteConstraints.startYear;
  let siteEndYear = siteConstraints.endYear;
  let siteCountryList = siteConstraints.countryList;

  //console.log("testFilterForDatesAndCountries, siteConstraints is:");
  //console.log(siteConstraints);
  //console.log("testFilterForDatesAndCountries, filter is: ");
  //console.log(filter);

  if (filter.filterByDate) {
    if ((siteEndYear && filter.startYear > siteEndYear) || (siteStartYear && filter.endYear < siteStartYear)) {
      return false;
    }
  }

  if (filter.filterByCountry && siteCountryList && siteCountryList.length > 0) {
    let countryMatch = false;
    if (filter.countryArray.length == 0) {
      // if the filter has no country it should match all countries rather than none
      countryMatch = true;
    } else {
      for (let country of filter.countryArray) {
        for (let targetCountry of siteCountryList) {
          if (country == targetCountry || CD.isPartOf(country, targetCountry)) {
            countryMatch = true;
            break;
          }
        }
        if (countryMatch) {
          break;
        }
      }
    }
    if (!countryMatch) {
      return false;
    }
  }

  //console.log("testFilterForDatesAndCountries, returning true");

  return true;
}

function testGeneralizedDataForDatesAndCountries(gd, siteConstraints) {
  let siteStartYear = siteConstraints.startYear;
  let siteEndYear = siteConstraints.endYear;
  let siteCountryList = siteConstraints.countryList;
  let siteExactCountryList = siteConstraints.exactCountryList;
  let dateTestType = siteConstraints.dateTestType;

  let filterByDate = options.search_general_filterMainMenuByDate;
  let filterByCountries = options.search_general_filterMainMenuByCountries;

  //console.log("testGeneralizedDataForDatesAndCountries: filterByDate = " + filterByDate);
  //console.log("testGeneralizedDataForDatesAndCountries: filterByCountries = " + filterByCountries);

  if (filterByDate) {
    let maxLifespan = Number(options.search_general_maxLifespan);

    if (dateTestType == "bmd") {
      let birthPossibleInRange = gd.couldPersonHaveBeenBornInDateRange(siteStartYear, siteEndYear, maxLifespan);
      let deathPossibleInRange = gd.couldPersonHaveDiedInDateRange(siteStartYear, siteEndYear, maxLifespan);
      let marriagePossibleInRange = gd.couldPersonHaveMarriedInDateRange(siteStartYear, siteEndYear, maxLifespan);

      if (!(birthPossibleInRange || deathPossibleInRange || marriagePossibleInRange)) {
        return false;
      }
    } else if (dateTestType == "bd") {
      let birthPossibleInRange = gd.couldPersonHaveBeenBornInDateRange(siteStartYear, siteEndYear, maxLifespan);
      let deathPossibleInRange = gd.couldPersonHaveDiedInDateRange(siteStartYear, siteEndYear, maxLifespan);

      if (!(birthPossibleInRange || deathPossibleInRange)) {
        return false;
      }
    } else if (dateTestType == "died") {
      if (!gd.couldPersonHaveDiedInDateRange(siteStartYear, siteEndYear, maxLifespan)) {
        return false;
      }
    } else if (dateTestType == "lived") {
      if (!gd.couldPersonHaveLivedInDateRange(siteStartYear, siteEndYear, maxLifespan)) {
        return false;
      }
    }
  }

  if (filterByCountries && siteCountryList && siteCountryList.length > 0) {
    //console.log("testGeneralizedDataForDatesAndCountries: siteCountryList is:");
    //console.log(siteCountryList);

    if (siteExactCountryList && siteExactCountryList.length > 0) {
      let countryArray = gd.inferCountries();

      if (countryArray.length > 0) {
        for (let country of countryArray) {
          for (let siteExactCountry of siteExactCountryList) {
            if (country == siteExactCountry) {
              // For example, for GRO:
              // Some Ancestry death registrations have a place like: Hoxne, Suffolk, United Kingdom
              // We want that to match, but do not want Scotland to match, which is part of United Kingdom
              return true;
            }
          }
        }
      }
    }

    let treatNoCountryAsAllCountries = options.search_general_treatNoCountryAsAllCountries;

    if (!gd.didPersonLiveInCountryList(siteCountryList, treatNoCountryAsAllCountries)) {
      //console.log("testGeneralizedDataForDatesAndCountries: didPersonLiveInCountryList returned false");
      return false;
    }
  }

  return true;
}

function shouldShowSiteSearch(gd, filter, siteConstraints) {
  if (filter) {
    if (!testFilterForDatesAndCountries(filter, siteConstraints)) {
      return false;
    }
  } else {
    if (!testGeneralizedDataForDatesAndCountries(gd, siteConstraints)) {
      return false;
    }
  }

  return true;
}

var registeredSearchMenuItemFunctions = [];

function buildSortedMenuItemFunctions(maxItems, includeOptionName, sortAlphaOptionName, data, filter, excludeSite) {
  let result = {
    functionList: [],
    numSitesExcludedByFilter: 0,
    numSitesExcludedByPriority: 0,
    numSitesExcludedBySiteName: 0,
  };

  let functionList = [];

  let priorityOrderList = options["search_general_priorityOrder"];
  if (!priorityOrderList) {
    priorityOrderList = [];
  }

  for (let registeredFunction of registeredSearchMenuItemFunctions) {
    let siteName = registeredFunction.siteName;

    //console.log("buildSortedMenuItemFunctions: siteName = " + siteName);

    if (!options.search_general_popup_showSameSite && siteName == excludeSite) {
      //console.log("buildSortedMenuItemFunctions: excluded by site name");
      result.numSitesExcludedBySiteName++;
      continue;
    }

    //console.log("buildSortedMenuItemFunctions: registeredFunction is:");
    //console.log(registeredFunction);

    if (registeredFunction.shouldShowFunction && !registeredFunction.shouldShowFunction(data, filter)) {
      //console.log("buildSortedMenuItemFunctions: excluded by filter");
      result.numSitesExcludedByFilter++;
      continue;
    }

    let menuItemFunction = registeredFunction.menuItemFunction;
    let fullIncludeOptionName = "search_" + siteName + "_" + includeOptionName;
    let includeOptionValue = options[fullIncludeOptionName];

    let priority = priorityOrderList.indexOf(siteName);
    if (priority == -1) {
      priority = priorityOrderList.length;
    }

    /*
    console.log(
      "buildSortedMenuItemFunctions: fullPriorityOptionName is: " +
        fullPriorityOptionName +
        ", priorityOptionValue is: " +
        priorityOptionValue
    );
    */

    if (typeof includeOptionValue === "undefined") {
      console.log("buildSortedMenuItemFunctions: missing option value for: " + fullIncludeOptionName);
      includeOptionValue = true; // don't exclude it
    }

    if (includeOptionValue) {
      //console.log("buildSortedMenuItemFunctions: pushing to functionList");

      functionList.push({
        siteName: siteName,
        menuItemFunction: menuItemFunction,
        priority: priority,
        alphaSortKey: registeredFunction.siteTitle,
      });
    } else {
      result.numSitesExcludedByPriority++;
      //console.log("buildSortedMenuItemFunctions: excluded by priority");
    }
  }

  let sortedList = functionList.sort(function (a, b) {
    if (a.priority == b.priority) {
      // if priority is same then sort alphabetically by site title
      return a.alphaSortKey.localeCompare(b.alphaSortKey);
    }
    if (a.priority < b.priority) {
      return -1;
    }
    return +1;
  });

  if (maxItems != -1 && sortedList.length > maxItems) {
    // there is a max number of items. Prune the list.
    sortedList = sortedList.slice(0, maxItems);
  }

  let fullSortAlphaOptionName = "search_general_" + sortAlphaOptionName;
  let sortAlphaOptionValue = options[fullSortAlphaOptionName];

  if (sortAlphaOptionValue) {
    sortedList = sortedList.sort(function (a, b) {
      return a.alphaSortKey.localeCompare(b.alphaSortKey);
    });
  }

  result.functionList = sortedList;

  //console.log("buildSortedMenuItemFunctions: result is:");
  //console.log(result);
  return result;
}

function buildTopLevelMenuItemFunctions(maxItems, data, excludeSite) {
  return buildSortedMenuItemFunctions(
    maxItems,
    "popup_includeOnTopMenu",
    "popup_sortAlphaInTopMenu",
    data,
    undefined,
    excludeSite
  );
}

function buildSubMenuItemFunctions(data, filter, excludeSite) {
  return buildSortedMenuItemFunctions(
    -1,
    "popup_includeOnSubMenu",
    "popup_sortAlphaInSubmenu",
    data,
    filter,
    excludeSite
  );
}

function addSearchFilterMenuItem(menu, filter, numSitesExcludedByPriority, backFunction) {
  let filterText = "Filter: ";

  if (!filter.filterByDate && !filter.filterByCountry) {
    filterText += "None";
  } else {
    filterText += "Date: ";
    if (filter.filterByDate) {
      if (filter.startYear) {
        filterText += filter.startYear;
      } else {
        filterText += "unknown";
      }
      filterText += " - ";
      if (filter.endYear) {
        filterText += filter.endYear;
      } else {
        filterText += "unknown";
      }
    } else {
      filterText += "all dates";
    }

    filterText += "; Countries: ";
    if (filter.filterByCountry) {
      if (filter.countryArray.length > 0) {
        let addedCountry = false;
        for (let country of filter.countryArray) {
          if (addedCountry) {
            filterText += ", ";
          }
          filterText += country;
          addedCountry = true;
        }
      } else {
        filterText += "unknown";
      }
    } else {
      filterText += "all countries";
    }
  }

  if (numSitesExcludedByPriority > 0) {
    let siteText = "sites";
    if (numSitesExcludedByPriority == 1) {
      siteText = "site";
    }
    filterText += "; " + numSitesExcludedByPriority + " " + siteText + " excluded by zero priority in options";
  }

  // create a list item and add it to the list
  let listItem = document.createElement("li");
  listItem.className = "menuItem dividerBelow yellowBackground";

  let button = document.createElement("button");
  button.className = "menuButton";
  button.onclick = function (element) {
    setupSearchMenuItemFilterSubmenu(filter, numSitesExcludedByPriority, backFunction);
  };
  button.innerText = filterText;
  listItem.appendChild(button);

  menu.list.appendChild(listItem);
}

function setupSearchMenuItemFilterSubmenu(filter, numSitesExcludedByPriority, backFunction) {
  let menu = beginMainMenu();
  addBackMenuItem(menu, backFunction);

  let filterDivElement = document.createElement("div");
  filterDivElement.className = "searchFilterContainer";

  let filterByDateCheckboxElement = document.createElement("input");
  {
    filterByDateCheckboxElement.type = "checkbox";
    filterByDateCheckboxElement.className = "searchFilterCheckbox";
    filterByDateCheckboxElement.checked = filter.filterByDate;
    filterByDateCheckboxElement.onclick = function () {
      filter.filterByDate = this.checked;
      filterState.filterByDate = filter.filterByDate;
      savePopupSearchFilterState();
    };
    let labelTextNode = document.createTextNode(" Filter by date");
    let labelElement = document.createElement("label");
    labelElement.appendChild(filterByDateCheckboxElement);
    labelElement.appendChild(labelTextNode);
    filterDivElement.appendChild(labelElement);
    addBreak(filterDivElement);
  }

  let startDateLabelElement = document.createElement("label");
  {
    let inputElement = document.createElement("input");
    inputElement.type = "number";
    inputElement.className = "searchFilterYearInput";
    inputElement.value = filter.startYear;
    inputElement.addEventListener("change", (event) => {
      filter.startYear = event.target.value;
    });
    let labelTextNode = document.createTextNode("Start year: ");
    startDateLabelElement.appendChild(labelTextNode);
    startDateLabelElement.appendChild(inputElement);
    startDateLabelElement.className = "searchFilterYear";
    filterDivElement.appendChild(startDateLabelElement);
  }

  let endDateLabelElement = document.createElement("label");
  {
    let inputElement = document.createElement("input");
    inputElement.type = "number";
    inputElement.className = "searchFilterYearInput";
    inputElement.value = filter.endYear;
    inputElement.addEventListener("change", (event) => {
      filter.endYear = event.target.value;
    });
    let labelTextNode = document.createTextNode("End year: ");
    endDateLabelElement.appendChild(labelTextNode);
    endDateLabelElement.appendChild(inputElement);
    endDateLabelElement.className = "searchFilterYear";
    filterDivElement.appendChild(endDateLabelElement);
    addBreak(filterDivElement);
  }

  let filterByCountryCheckboxElement = document.createElement("input");
  {
    filterByCountryCheckboxElement.type = "checkbox";
    filterByCountryCheckboxElement.className = "searchFilterCheckbox";
    filterByCountryCheckboxElement.checked = filter.filterByCountry;
    filterByCountryCheckboxElement.onclick = function () {
      filter.filterByCountry = this.checked;
      filterState.filterByCountry = filter.filterByCountry;
      savePopupSearchFilterState();
    };
    let labelTextNode = document.createTextNode(" Filter by country");
    let labelElement = document.createElement("label");
    labelElement.appendChild(filterByCountryCheckboxElement);
    labelElement.appendChild(labelTextNode);
    filterDivElement.appendChild(labelElement);
    addBreak(filterDivElement);
  }

  let countriesLabelElement = document.createElement("label");
  {
    let inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.className = "searchFilterCountriesInput";

    let countriesString = "";
    for (let country of filter.countryArray) {
      if (countriesString) {
        countriesString += ", ";
      }
      countriesString += country;
    }
    inputElement.value = countriesString;
    inputElement.addEventListener("change", (event) => {
      filter.countryArray = [];
      let string = event.target.value;
      let commaIndex = string.indexOf(",");
      while (commaIndex != -1) {
        let country = string.substring(0, commaIndex).trim();
        if (country) {
          filter.countryArray.push(country);
        }
        string = string.substring(commaIndex + 1).trim();
        commaIndex = string.indexOf(",");
      }
      if (string) {
        filter.countryArray.push(string);
      }

      for (let countryIndex = 0; countryIndex < filter.countryArray.length; countryIndex++) {
        let stdName = CD.standardizeCountryName(filter.countryArray[countryIndex]);
        if (stdName) {
          filter.countryArray[countryIndex] = stdName;
        }
      }
    });

    let labelTextNode = document.createTextNode("Countries: ");
    countriesLabelElement.appendChild(labelTextNode);
    countriesLabelElement.appendChild(inputElement);
    countriesLabelElement.className = "searchFilterCountries";
    filterDivElement.appendChild(countriesLabelElement);
    //addBreak(filterDivElement);

    let commentElement = document.createElement("label");
    commentElement.innerText = "Country list is comma separated.";
    commentElement.className = "searchFilterComment";
    filterDivElement.appendChild(commentElement);
  }

  if (numSitesExcludedByPriority > 0) {
    addBreak(filterDivElement);
    addBreak(filterDivElement);

    let excludedSitesLabelElement = document.createElement("label");
    excludedSitesLabelElement.innerText = "These sites are excluded by options settings:";
    excludedSitesLabelElement.className = "searchFilterExcludedSiteHeader";

    for (let registeredFunction of registeredSearchMenuItemFunctions) {
      let siteName = registeredFunction.siteName;
      let priorityOptionName = "search_" + siteName + "_popup_priorityOnSubMenu";

      if (options[priorityOptionName] <= 0) {
        addBreak(excludedSitesLabelElement);
        let excludedSiteElement = document.createElement("label");
        excludedSiteElement.innerText = registeredFunction.siteTitle;
        excludedSiteElement.className = "searchFilterExcludedSite";
        excludedSitesLabelElement.appendChild(excludedSiteElement);
      }
    }
    filterDivElement.appendChild(excludedSitesLabelElement);
  }

  menu.list.appendChild(filterDivElement);

  endMainMenu(menu);
}

function setupAllSitesSubmenu(data, filter, backFunction, excludeSite) {
  let subMenuFunctions = buildSubMenuItemFunctions(data, filter, excludeSite);
  let subMenuFunctionList = subMenuFunctions.functionList;

  //console.log("setupAllSitesSubmenu, subMenuFunctions is:");
  //console.log(subMenuFunctions);

  let backToHereFunction = function () {
    setupAllSitesSubmenu(data, filter, backFunction, excludeSite);
  };

  let menu = beginMainMenu();
  addBackMenuItem(menu, backFunction);

  addSearchFilterMenuItem(menu, filter, subMenuFunctions.numSitesExcludedByPriority, backToHereFunction);

  // add the search menu items for each site in list
  for (let registeredFunction of subMenuFunctionList) {
    //console.log("registeredFunction is:");
    //console.log(registeredFunction);
    let menuItemFunction = registeredFunction.menuItemFunction;
    menuItemFunction(menu, data, backToHereFunction, filter);
  }

  endMainMenu(menu);
}

async function addSearchMenus(menu, data, backFunction, excludeSite) {
  await restorePopupSearchFilterState();

  let maxItems = options.search_general_popup_maxSearchItemsInTopMenu;

  let topMenuFunctions = buildTopLevelMenuItemFunctions(maxItems, data, excludeSite);
  let topMenuFunctionList = topMenuFunctions.functionList;

  // Note: we use the last param to exclude searching the same site
  // that we are searching from. But that is controlled by an option also.
  if (maxItems > 0) {
    for (let registeredFunction of topMenuFunctionList) {
      let menuItemFunction = registeredFunction.menuItemFunction;
      menuItemFunction(menu, data, backFunction);
    }
  }

  await restorePopupSearchFilterState();

  let gd = data.generalizedData;
  let maxLifespan = Number(options.search_general_maxLifespan);
  let range = gd.inferPossibleLifeYearRange(maxLifespan);
  let filter = {
    filterByDate: filterState.filterByDate,
    filterByCountry: filterState.filterByCountry,
    startYear: range.startYear,
    endYear: range.endYear,
    countryArray: gd.inferCountries(),
  };

  let subMenuText = "Show All Search Sites...";
  if (maxItems <= 0) {
    subMenuText = "Search...";
  }

  // If the top level menu is showing every single search site option then there is no need for
  // a submenu
  if (topMenuFunctionList.length < registeredSearchMenuItemFunctions.length) {
    // add the "All search sites.." submenu item
    addMenuItem(menu, subMenuText, function (element) {
      setupAllSitesSubmenu(data, filter, backFunction, excludeSite);
    });
  }
}

function registerSearchMenuItemFunction(siteName, siteTitle, menuItemFunction, shouldShowFunction) {
  //console.log("registerSearchMenuItemFunction, siteName = " + siteName);
  registeredSearchMenuItemFunctions.push({
    siteName: siteName,
    siteTitle: siteTitle,
    menuItemFunction: menuItemFunction,
    shouldShowFunction: shouldShowFunction,
  });
}

function doBackgroundSearchWithSearchData(siteName, searchData, reuseTabIfPossible, isRetry = false) {
  // Note that this requires the site to register the tab in order for reusing the tab
  try {
    chrome.runtime.sendMessage(
      {
        type: "doSearchWithSearchData",
        siteName: siteName,
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
              doBackgroundSearchWithSearchData(siteName, searchData, reuseTabIfPossible, true);
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
}

function yearStringToNumber(yearString) {
  if (!yearString) {
    return 0;
  }
  let yearNum = Number(yearString);

  if (!yearNum || isNaN(yearNum)) {
    yearNum = 0;
  }
  return yearNum;
}

function getReproductiveYearRangeForCouple(gd, spouse) {
  const startReproductiveAge = 14;

  let endReproductiveAge = 80;
  let spouseEndReproductiveAge = 80;
  if (gd.personGender == "female") {
    endReproductiveAge = 50;
  } else {
    spouseEndReproductiveAge = 50;
  }

  let range = {};

  let birthYear = yearStringToNumber(gd.inferBirthYear());
  if (birthYear) {
    range.startYear = birthYear + startReproductiveAge;
    range.endYear = birthYear + endReproductiveAge;
    let deathYear = yearStringToNumber(gd.inferDeathYear());
    if (deathYear) {
      if (range.endYear > deathYear + 1) {
        range.endYear = deathYear + 1;
      }
    }
  }

  if (spouse) {
    if (spouse.birthDate) {
      let spouseBirthYear = yearStringToNumber(spouse.birthDate.getYearString());
      if (spouseBirthYear) {
        let spouseStartReproductiveAge = spouseBirthYear + startReproductiveAge;
        if (spouseStartReproductiveAge > range.startYear) {
          range.startYear = spouseStartReproductiveAge;
        }
        let thisSpouseEndReproductiveAge = spouseBirthYear + spouseEndReproductiveAge;
        if (thisSpouseEndReproductiveAge < range.endYear) {
          range.endYear = thisSpouseEndReproductiveAge;
        }
      }
    }
    if (spouse.deathDate) {
      let spouseDeathYear = yearStringToNumber(spouse.deathDate.getYearString());
      if (spouseDeathYear) {
        if (spouseDeathYear + 1 < range.endYear) {
          range.endYear = spouseDeathYear + 1;
        }
      }
    }
    if (spouse.marriageDate) {
      let spouseMarriageYear = yearStringToNumber(spouse.marriageDate.getYearString());
      if (spouseMarriageYear) {
        if (spouseMarriageYear > range.startYear) {
          range.startYear = spouseMarriageYear;
        }
      }
    }
  }

  return range;
}

function getPossibleDeathRange(gd) {
  const maxLifespan = 120;
  let range = {};
  let birthYear = yearStringToNumber(gd.inferBirthYear());
  if (birthYear) {
    range.startYear = birthYear - 2;
    range.endYear = birthYear + maxLifespan;

    range.startBirthYear = birthYear - 2;
    range.endBirthYear = birthYear + 2;
  }

  return range;
}

function getYearRangeAsText(startYear, endYear) {
  if (!startYear) {
    startYear = "";
  }
  if (!endYear) {
    endYear = "";
  }
  let text = startYear + "-" + endYear;
  return text;
}

export {
  openUrlInNewTab,
  doSearch,
  doBackgroundSearchWithSearchData,
  addSearchMenus,
  registerSearchMenuItemFunction,
  testFilterForDatesAndCountries,
  testGeneralizedDataForDatesAndCountries,
  shouldShowSiteSearch,
  yearStringToNumber,
  getReproductiveYearRangeForCouple,
  getPossibleDeathRange,
  getYearRangeAsText,
};
