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

function testFilterForDatesAndCountries(filter, startYear, endYear, countryArray) {
  //console.log("testFilterForDatesAndCountries, startYear is: " + startYear + ", endYear is: " + endYear);
  //console.log("testFilterForDatesAndCountries, filter is: ");
  //console.log(filter);
  //console.log("testFilterForDatesAndCountries, countryArray is: ");
  //console.log(countryArray);

  if (filter.filterByDate) {
    if ((endYear && filter.startYear > endYear) || (startYear && filter.endYear < startYear)) {
      return false;
    }
  }

  if (filter.filterByCountry) {
    let countryMatch = false;
    for (let country of filter.countryArray) {
      for (let targetCountry of countryArray) {
        if (country == targetCountry || CD.isPartOf(country, targetCountry)) {
          countryMatch = true;
          break;
        }
      }
      if (countryMatch) {
        break;
      }
    }
    if (!countryMatch) {
      return false;
    }
  }

  //console.log("testFilterForDatesAndCountries, returning true");

  return true;
}

var registeredSearchMenuItemFunctions = [];

function buildSortedMenuItemFunctions(optionName) {
  let functionList = [];

  for (let registeredFunction of registeredSearchMenuItemFunctions) {
    let siteName = registeredFunction.siteName;
    let menuItemFunction = registeredFunction.menuItemFunction;
    let fullOptionName = "search_" + siteName + "_" + optionName;
    let optionValue = options[fullOptionName];

    //console.log("buildSortedMenuItemFunctions: fullOptionName is: " + fullOptionName + ", optionValue is: " + optionValue);

    let priority = 0;

    if (typeof optionValue === "undefined") {
      console.log("buildSortedMenuItemFunctions: missing option value for: " + fullOptionName);
      priority = 10000; // don't exclude it - put at end of list
    } else {
      let optionNumber = parseInt(optionValue);
      if (optionNumber != NaN) {
        priority = optionNumber;
      }
    }

    if (priority > 0) {
      functionList.push({
        siteName: siteName,
        menuItemFunction: menuItemFunction,
        priority: priority,
      });
    }
  }

  let sortedList = functionList.sort(function (a, b) {
    if (a.priority == b.priority) {
      return 0;
    }
    if (a.priority < b.priority) {
      return -1;
    }
    return +1;
  });

  return sortedList;
}

function buildTopLevelMenuItemFunctions() {
  return buildSortedMenuItemFunctions("popup_priorityOnTopMenu");
}

function buildSubMenuItemFunctions() {
  return buildSortedMenuItemFunctions("popup_priorityOnSubMenu");
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

function setupAllSitesSubmenu(data, filter, backFunction, subMenuFunctionList) {
  //console.log("setupAllSitesSubmenu called, subMenuFunctionList.length = " + subMenuFunctionList.length);
  let backToHereFunction = function () {
    setupAllSitesSubmenu(data, filter, backFunction, subMenuFunctionList);
  };

  let menu = beginMainMenu();
  addBackMenuItem(menu, backFunction);

  let numSitesExcludedByPriority = 0;
  for (let registeredFunction of registeredSearchMenuItemFunctions) {
    let siteName = registeredFunction.siteName;
    let priorityOptionName = "search_" + siteName + "_popup_priorityOnSubMenu";

    //console.log("setupAllSitesSubmenu, options[" + priorityOptionName + "] = " + options[priorityOptionName]);
    if (options[priorityOptionName] <= 0) {
      numSitesExcludedByPriority++;
      //console.log("setupAllSitesSubmenu, incremented numSitesExcludedByPriority. Now: " + numSitesExcludedByPriority);
    }
  }

  addSearchFilterMenuItem(menu, filter, numSitesExcludedByPriority, backToHereFunction);

  for (let registeredFunction of subMenuFunctionList) {
    let siteName = registeredFunction.siteName;
    let menuItemFunction = registeredFunction.menuItemFunction;
    if (options.search_general_popup_showSameSite || siteName != excludeSite) {
      menuItemFunction(menu, data, backToHereFunction, filter);
    }
  }

  endMainMenu(menu);
}

async function addSearchMenus(menu, data, backFunction, excludeSite) {
  await restorePopupSearchFilterState();

  let itemsAdded = 0;
  let maxItems = options.search_general_popup_maxSearchItemsInTopMenu;

  let topMenuFunctionList = buildTopLevelMenuItemFunctions();

  // Note: we use the last param to exclude searching the same site
  // that we are searching from. But that is controlled by an option also.
  if (maxItems > 0) {
    for (let registeredFunction of topMenuFunctionList) {
      let siteName = registeredFunction.siteName;
      let menuItemFunction = registeredFunction.menuItemFunction;
      if (options.search_general_popup_showSameSite || siteName != excludeSite) {
        let addedItem = menuItemFunction(menu, data, backFunction);
        if (addedItem) {
          itemsAdded++;
          if (itemsAdded >= maxItems) {
            break;
          }
        }
      }
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

  let subMenuFunctionList = buildSubMenuItemFunctions();

  let subMenuText = "Show All Search Sites...";
  if (maxItems <= 0) {
    subMenuText = "Search...";
  }

  if (itemsAdded < registeredSearchMenuItemFunctions.length) {
    // add the "All search sites.." submenu item
    addMenuItem(menu, subMenuText, function (element) {
      setupAllSitesSubmenu(data, filter, backFunction, subMenuFunctionList);
    });
  }
}

function registerSearchMenuItemFunction(siteName, siteTitle, menuItemFunction) {
  registeredSearchMenuItemFunctions.push({
    siteName: siteName,
    siteTitle: siteTitle,
    menuItemFunction: menuItemFunction,
  });
}

export { openUrlInNewTab, doSearch, addSearchMenus, registerSearchMenuItemFunction, testFilterForDatesAndCountries };
