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

import {
  addSameRecordMenuItem,
  addBackMenuItem,
  addMenuItem,
  addMenuItemWithSubtitle,
  addItalicMessageMenuItem,
  beginMainMenu,
  endMainMenu,
  doAsyncActionWithCatch,
} from "/base/browser/popup/popup_menu_building.mjs";

import {
  doSearch,
  registerSearchMenuItemFunction,
  shouldShowSiteSearch,
  getReproductiveYearRangeForCouple,
  getPossibleDeathRange,
  getYearRangeAsText,
} from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

const freebmdStartYear = 1837;
const freebmdEndYear = 1992;

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: freebmdStartYear,
    endYear: freebmdEndYear,
    dateTestType: "bmd",
    countryList: ["England and Wales"],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

function yearRangeOverlapsFreebmdRange(range) {
  if (!range || !range.startYear || !range.endYear) {
    return false;
  }
  let overlapsRange = range.endYear >= freebmdStartYear && range.startYear <= freebmdEndYear;

  return overlapsRange;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function freebmdSearch(generalizedData, typeOfSearch, parameters) {
  const input = {
    typeOfSearch: typeOfSearch,
    generalizedData: generalizedData,
    options: options,
    parameters: parameters,
  };
  doAsyncActionWithCatch("FreeBMD Search", input, async function () {
    let loadedModule = await import(`../core/freebmd_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addFreebmdDefaultSearchMenuItem(menu, data, backFunction, filter) {
  //console.log("addFreebmdDefaultSearchMenuItem, data is:");
  //console.log(data);

  addMenuItem(menu, "Search FreeBMD (UK)...", function (element) {
    setupFreebmdSearchSubMenu(data, backFunction, filter);
  });

  return true;
}

function addFreebmdSameRecordMenuItem(menu, data) {
  addSameRecordMenuItem(menu, data, "freebmd", function (element) {
    freebmdSearch(data.generalizedData, "SameCollection");
  });
}

function addFreebmdSearchBirthsMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let birthPossibleInRange = data.generalizedData.couldPersonHaveBeenBornInDateRange(
      freebmdStartYear,
      freebmdEndYear,
      maxLifespan
    );
    if (!birthPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search FreeBMD Births", function (element) {
    freebmdSearch(data.generalizedData, "Births");
  });
}

function addFreebmdSearchMarriagesMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let marriagePossibleInRange = data.generalizedData.couldPersonHaveMarriedInDateRange(
      freebmdStartYear,
      freebmdEndYear,
      maxLifespan
    );
    if (!marriagePossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search FreeBMD Marriages", function (element) {
    freebmdSearch(data.generalizedData, "Marriages");
  });
}

function addFreebmdSearchDeathsMenuItem(menu, data, filter) {
  if (!filter) {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let deathPossibleInRange = data.generalizedData.couldPersonHaveDiedInDateRange(
      freebmdStartYear,
      freebmdEndYear,
      maxLifespan
    );
    if (!deathPossibleInRange) {
      return;
    }
  }
  addMenuItem(menu, "Search FreeBMD Deaths", function (element) {
    freebmdSearch(data.generalizedData, "Deaths");
  });
}

function addFreebmdSearchChildBirthsMenuItem(menu, data, backFunction, filter, spouse) {
  let yearRange = getReproductiveYearRangeForCouple(data.generalizedData, spouse);
  if (!yearRangeOverlapsFreebmdRange(yearRange) || yearRange.startYear > yearRange.endYear) {
    return;
  }

  const parameters = {
    startYear: yearRange.startYear,
    endYear: yearRange.endYear,
    startQuarter: 1,
    endQuarter: 4,
    spouse: spouse,
  };

  let onClick = function (element) {
    freebmdSearch(data.generalizedData, "BirthsOfChildren", parameters);
  };

  let menuItemText = "";
  let subtitle = "";

  let couldUseMmn = true;

  if (spouse) {
    let spouseName = spouse.name.inferFullName();
    menuItemText = "Do search for children with spouse:";
    subtitle = spouseName;
    if (spouse.birthDate || spouse.deathDate) {
      subtitle += " (";
      if (spouse.birthDate) {
        subtitle += spouse.birthDate.getYearString();
      }
      subtitle += "-";
      if (spouse.deathDate) {
        subtitle += spouse.deathDate.getYearString();
      }
      subtitle += ")";
    }
    if (spouse.marriageDate) {
      subtitle += " m. ";
      subtitle += spouse.marriageDate.getYearString();
    }
    subtitle += "\nPossible child birth years: " + getYearRangeAsText(yearRange.startYear, yearRange.endYear);
  } else {
    let gender = data.generalizedData.personGender;

    if (gender == "female") {
      menuItemText = "Do search for children with no registered father";
    } else {
      menuItemText = "Do search for children with any mother";
      couldUseMmn = false;
    }
    subtitle += "Possible child birth years: " + getYearRangeAsText(yearRange.startYear, yearRange.endYear);
  }

  // if the end year is less than 1912 add note that MMN cannot be used
  if (couldUseMmn && yearRange.startYear < 1912) {
    if (yearRange.endYear < 1911) {
      // whole year range is before MMNs
      subtitle += "\nNOTE: MMN cannot be used in search prior to Q3 1911";
    } else {
      subtitle += "\nNOTE: MMN cannot be used in search prior to Q3 1911. You will be given a choice in submenu.";
      menuItemText += "...";
      onClick = function (element) {
        setupFreebmdSearchForBirthsAround1911Submenu(data, backFunction, parameters);
      };
    }
  }

  if (!yearRangeOverlapsFreebmdRange(yearRange)) {
    let rangeText = getYearRangeAsText(yearRange.startYear, yearRange.endYear);
    subtitle += "\nBirth years " + rangeText + " are not covered by GRO";
  }

  if (subtitle) {
    addMenuItemWithSubtitle(menu, menuItemText, onClick, subtitle);
  } else {
    addMenuItem(menu, menuItemText, onClick);
  }
}

function addFreebmdSearchChildBirthsOverlapMenuItem(menu, data, parameters, type) {
  let onClick = function (element) {
    freebmdSearch(data.generalizedData, "BirthsOfChildren", parameters);
  };

  let menuItemText = "";

  const spouse = parameters.spouse;

  if (type == "twoSearches") {
    menuItemText = "Do two separate searches in two tabs/windows";
    let parameters1 = { ...parameters };
    let parameters2 = { ...parameters };

    parameters1.endYear = 1911;
    parameters1.endQuarter = 2;
    parameters2.startYear = 1911;
    parameters2.startQuarter = 3;

    onClick = function (element) {
      freebmdSearch(data.generalizedData, "BirthsOfChildren", parameters1);
      freebmdSearch(data.generalizedData, "BirthsOfChildren", parameters2);
    };
  } else if (type == "q31911AndLater") {
    menuItemText = "Only search from Q3 1911 onwards and include MMN";
    parameters = { ...parameters };
    parameters.startYear = 1911;
    parameters.startQuarter = 3;
  } else if (type == "q21911AndEarlier") {
    menuItemText = "Only search up to Q2 1911 and do not include MMN";
    parameters = { ...parameters };
    parameters.endYear = 1911;
    parameters.endQuarter = 2;
  } else if (type == "fullRange") {
    menuItemText = "Search the whole year range and do not include MMN";
  }
  addMenuItem(menu, menuItemText, onClick);
}

function addFreebmdSearchPossibleDeathsMenuItem(menu, data, filter) {
  let yearRange = getPossibleDeathRange(data.generalizedData);
  if (!yearRangeOverlapsFreebmdRange(yearRange)) {
    return;
  }

  const parameters = {
    startYear: yearRange.startYear,
    endYear: yearRange.endYear,
    startQuarter: 1,
    endQuarter: 4,
  };

  const onClick = function (element) {
    freebmdSearch(data.generalizedData, "PossibleDeaths", parameters);
  };

  let menuItemText = "Do search for possible deaths";
  let subtitle = "";

  if (data.generalizedData.inferDeathYear()) {
    menuItemText = "Do search for other possible deaths";
  }
  subtitle += "Possible death years: " + getYearRangeAsText(yearRange.startYear, yearRange.endYear);

  if (subtitle) {
    addMenuItemWithSubtitle(menu, menuItemText, onClick, subtitle);
  } else {
    addMenuItem(menu, menuItemText, onClick);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupFreebmdSearchSubMenu(data, backFunction, filter) {
  let backToHereFunction = function () {
    setupFreebmdSearchSubMenu(data, backFunction, filter);
  };

  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addFreebmdSameRecordMenuItem(menu, data, filter);
  addFreebmdSearchBirthsMenuItem(menu, data, filter);
  addFreebmdSearchMarriagesMenuItem(menu, data, filter);
  addFreebmdSearchDeathsMenuItem(menu, data, filter);

  if (data.generalizedData.spouses) {
    for (let spouse of data.generalizedData.spouses) {
      addFreebmdSearchChildBirthsMenuItem(menu, data, backToHereFunction, filter, spouse);
    }
  }
  addFreebmdSearchChildBirthsMenuItem(menu, data, backToHereFunction, filter);
  addFreebmdSearchPossibleDeathsMenuItem(menu, data, filter);
  addItalicMessageMenuItem(menu, "To search for births of siblings, do the search from a parent.");

  endMainMenu(menu);
}

function setupFreebmdSearchForBirthsAround1911Submenu(data, backFunction, parameters) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  let yearRangeText = getYearRangeAsText(parameters.startYear, parameters.endYear);

  let message =
    "The year range " +
    yearRangeText +
    " overlaps Q3 1911 which is when FreeBMD starts allowing searches using the mother's maiden name.";
  message += " Searching the whole year range with the MMN would omit any possible births prior to Q3 1911.";
  message += " Choose one of the options below.";

  addItalicMessageMenuItem(menu, message);

  // There are 4 menu items to add:
  // do two separate searches (in separate tabs)
  // only search Q3 1911 and later with the mmn
  // only search Q2 1911 and earlier without mmn
  // search whole range without mmn

  addFreebmdSearchChildBirthsOverlapMenuItem(menu, data, parameters, "twoSearches");
  addFreebmdSearchChildBirthsOverlapMenuItem(menu, data, parameters, "q31911AndLater");
  addFreebmdSearchChildBirthsOverlapMenuItem(menu, data, parameters, "q21911AndEarlier");
  addFreebmdSearchChildBirthsOverlapMenuItem(menu, data, parameters, "fullRange");

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("freebmd", "FreeBMD (UK)", addFreebmdDefaultSearchMenuItem, shouldShowSearchMenuItem);
