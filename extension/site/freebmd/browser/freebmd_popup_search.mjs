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

function addFreebmdSearchChildBirthsMenuItem(menu, data, filter, spouse) {
  let yearRange = getReproductiveYearRangeForCouple(data.generalizedData, spouse);
  if (!yearRangeOverlapsFreebmdRange(yearRange) || yearRange.startYear > yearRange.endYear) {
    return;
  }

  const parameters = {
    startYear: yearRange.startYear,
    endYear: yearRange.endYear,
    spouse: spouse,
  };

  const onClick = function (element) {
    freebmdSearch(data.generalizedData, "BirthsOfChildren", parameters);
  };

  let menuItemText = "";
  let subtitle = "";

  if (spouse) {
    let spouseName = spouse.name.inferFullName();
    menuItemText = "Do smart search for children with spouse:";
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
      menuItemText = "Do smart search for children with no registered father";
    } else {
      menuItemText = "Do smart search for children with any mother";
    }
    subtitle += "Possible child birth years: " + getYearRangeAsText(yearRange.startYear, yearRange.endYear);
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

function addFreebmdSearchPossibleDeathsMenuItem(menu, data, filter) {
  let yearRange = getPossibleDeathRange(data.generalizedData);
  if (!yearRangeOverlapsFreebmdRange(yearRange)) {
    return;
  }

  const parameters = {
    startYear: yearRange.startYear,
    endYear: yearRange.endYear,
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
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addFreebmdSameRecordMenuItem(menu, data, filter);
  addFreebmdSearchBirthsMenuItem(menu, data, filter);
  addFreebmdSearchMarriagesMenuItem(menu, data, filter);
  addFreebmdSearchDeathsMenuItem(menu, data, filter);

  if (data.generalizedData.spouses) {
    for (let spouse of data.generalizedData.spouses) {
      addFreebmdSearchChildBirthsMenuItem(menu, data, filter, spouse);
    }
  }
  addFreebmdSearchChildBirthsMenuItem(menu, data, filter);
  addFreebmdSearchPossibleDeathsMenuItem(menu, data, filter);
  addItalicMessageMenuItem(menu, "To search for births of siblings, do the search from a parent.");

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("freebmd", "FreeBMD (UK)", addFreebmdDefaultSearchMenuItem, shouldShowSearchMenuItem);
