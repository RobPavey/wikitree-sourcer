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

import { cachedDataCache, isCachedDataCacheReady } from "/base/browser/common/data_cache.mjs";
import {
  addSameRecordMenuItem,
  addBackMenuItem,
  addMenuItem,
  addMenuItemWithSubtitle,
  beginMainMenu,
  endMainMenu,
  doAsyncActionWithCatch,
} from "/base/browser/popup/popup_menu_building.mjs";

import {
  doSearch,
  registerSearchMenuItemFunction,
  shouldShowSiteSearch,
  doBackgroundSearchWithSearchData,
} from "/base/browser/popup/popup_search.mjs";
import { RT } from "/base/core/record_type.mjs";
import { checkPermissionForSite } from "/base/browser/popup/popup_permissions.mjs";
import { options } from "/base/browser/options/options_loader.mjs";

import { getOverallGroYearRange, getGroYearRanges } from "../core/gro_years.mjs";

//////////////////////////////////////////////////////////////////////////////////////////
// Helper functions
//////////////////////////////////////////////////////////////////////////////////////////

function shouldShowSearchMenuItem(data, filter) {
  let groRange = getOverallGroYearRange();

  const siteConstraints = {
    startYear: groRange.startYear,
    endYear: groRange.endYear,
    countryList: ["England and Wales"],
    exactCountryList: ["United Kingdom"],
    dateTestType: "bd",
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
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

function birthYearInOverallGroRange(data) {
  let groRanges = getGroYearRanges("births");

  // currently starts at 1837 and there is a gap from 1935-1983
  let birthYear = data.generalizedData.inferBirthYear();
  return birthYear && birthYear >= groRanges.startYear && birthYear <= groRanges.endYear;
}

function deathYearInOverallGroRange(data) {
  let groRanges = getGroYearRanges("deaths");

  // currently starts at 1837 and there is a gap from 1958-1983
  let deathYear = data.generalizedData.inferDeathYear();
  return deathYear && deathYear >= groRanges.startYear && deathYear <= groRanges.endYear;
}

function yearRangeOverlapsOverallGroRange(range) {
  let groRanges = getGroYearRanges("deaths");

  if (range.startYear && range.endYear) {
    if (range.endYear < groRanges.startYear || range.startYear > groRanges.endYear) {
      return false;
    }
  }

  return true;
}

function yearInInGroRanges(type, year) {
  if (!year) {
    return false;
  }
  let groRanges = getGroYearRanges(type);
  let inOverallRange = year >= groRanges.startYear && year <= groRanges.endYear;
  let inGap = year >= groRanges.gapStartYear && year <= groRanges.gapEndYear;

  return inOverallRange && !inGap;
}

function yearRangeOverlapsGroRanges(type, range) {
  if (!range || !range.startYear || !range.endYear) {
    return false;
  }
  let groRanges = getGroYearRanges(type);
  let overlapsOverallRange = range.endYear >= groRanges.startYear && range.startYear <= groRanges.endYear;
  let inGap = range.startYear >= groRanges.gapStartYear && range.endYear <= groRanges.gapEndYear;

  return overlapsOverallRange && !inGap;
}

function getYearRangesAsText(type) {
  let groRanges = getGroYearRanges(type);
  let text =
    "(" +
    groRanges.startYear +
    "-" +
    (groRanges.gapStartYear - 1) +
    ", " +
    (groRanges.gapEndYear + 1) +
    "-" +
    groRanges.endYear +
    ")";

  return text;
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

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function groSearch(generalizedData, typeOfSearch) {
  if (!isCachedDataCacheReady) {
    // dependencies not ready, wait a few milliseconds and try again
    console.log("groSearch, waiting another 10ms");
    setTimeout(function () {
      groSearch(generalizedData, typeOfSearch);
    }, 10);
    return;
  }

  doAsyncActionWithCatch("GRO Search", generalizedData, async function () {
    let loadedModule = await import(`../core/gro_build_search_url.mjs`);
    const input = {
      typeOfSearch: typeOfSearch,
      generalizedData: generalizedData,
      dataCache: cachedDataCache,
    };
    doSearch(loadedModule, input);
  });
}

async function groSmartSearch(gd, typeOfSearch, spouse) {
  // request permission if needed
  const checkPermissionsOptions = {
    reason: "Sourcer needs to send search requests to the GRO site.",
    needsPopupDisplayed: true,
  };

  if (!(await checkPermissionForSite("*://www.gro.gov.uk/gro/content/certificates/*", checkPermissionsOptions))) {
    return result;
  }

  let searchUrl = "/site/gro/browser/gro_smart_search.html";
  let searchData = {
    timeStamp: Date.now(),
    url: searchUrl,
  };

  let parameters = {};

  if (typeOfSearch == "birthsOfChildren") {
    parameters.type = "births";

    parameters.surname = gd.inferLastName();
    parameters.gender = gd.personGender;

    let yearRange = getReproductiveYearRangeForCouple(gd, spouse);
    if (yearRange.startYear > yearRange.endYear) {
      return;
    }
    parameters.startYear = yearRange.startYear;
    parameters.endYear = yearRange.endYear;

    parameters.surname = gd.inferLastName();
    parameters.gender = "both"; //gd.personGender;

    if (spouse) {
      let spouseLnab = spouse.lastNameAtBirth;
      if (!spouseLnab) {
        if (spouse.name) {
          spouseLnab = spouse.name.inferLastName();
        }
      }
      if (spouseLnab) {
        if (gd.personGender == "female") {
          parameters.surname = spouseLnab;
          parameters.mmn = gd.inferLastNameAtBirth();
        } else {
          parameters.mmn = spouseLnab;
        }
      }
    } else {
      // no spouse, we have to search with surname of this person
      // So, if this is a woman, we cannot search for births with any registered father because
      // the surname in search cannot be left blank
    }
  } else if (typeOfSearch == "deaths") {
    parameters.type = "deaths";

    let deathRange = getPossibleDeathRange(gd);
    parameters.startYear = deathRange.startYear;
    parameters.endYear = deathRange.endYear;
    parameters.startBirthYear = deathRange.startBirthYear;
    parameters.endBirthYear = deathRange.endBirthYear;

    parameters.surname = gd.inferLastNameAtDeath();
    parameters.forename1 = gd.inferFirstName();
    // Second forename. This should never be an initial. So if what we have is an initial

    // we should either not add it or expand it if we have other sources of information
    let secondForename = gd.inferSecondForename();
    if (secondForename) {
      if (secondForename.length == 1) {
        if (gd.personGeneralizedData) {
          let pgd = gd.personGeneralizedData;
          let personFirstName = pgd.inferFirstName();
          let personSecondForename = pgd.inferSecondForename();
          if (personSecondForename && personSecondForename.length > 1) {
            if (personSecondForename[0] == secondForename) {
              if (gd.inferFirstName() == personFirstName) {
                let lastNameAtBirth = gd.inferLastNameAtBirth();
                let lastNameAtDeath = gd.inferLastNameAtDeath(options);
                let personLastNameAtBirth = pgd.inferLastNameAtBirth();
                let personLastNameAtDeath = pgd.inferLastNameAtDeath(options);
                if (personLastNameAtBirth == lastNameAtBirth || personLastNameAtDeath == lastNameAtDeath) {
                  parameters.forename2 = personSecondForename;
                }
              }
            }
          }
        }
      } else {
        parameters.forename2 = secondForename;
      }
    }

    parameters.gender = gd.personGender;
    parameters.district = gd.registrationDistrict;
  }

  searchData.parameters = parameters;

  //console.log("nswbdmSearch, searchData is:");
  //console.log(searchData);

  let reuseTabIfPossible = false; // options.search_nswbdm_reuseExistingTab;

  doBackgroundSearchWithSearchData("groSmartSearch", searchData, reuseTabIfPossible);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addGroSearchBirthsMenuItem(menu, data, filter) {
  if (!filter && !birthYearInOverallGroRange(data)) {
    return;
  }

  const onClick = function (element) {
    groSearch(data.generalizedData, "births");
  };

  const menuItemText = "Search GRO Births " + getYearRangesAsText("births");

  let year = data.generalizedData.inferBirthYear();
  let subtitle = "";

  if (year) {
    if (!yearInInGroRanges("births", year)) {
      subtitle = "Birth year " + year + " is not covered by GRO";
    }
  } else {
    subtitle = "Birth year not known";
  }

  if (subtitle) {
    addMenuItemWithSubtitle(menu, menuItemText, onClick, subtitle);
  } else {
    addMenuItem(menu, menuItemText, onClick);
  }
}

function addGroSearchDeathsMenuItem(menu, data, filter) {
  if (!filter && !deathYearInOverallGroRange(data)) {
    return;
  }

  const onClick = function (element) {
    groSearch(data.generalizedData, "deaths");
  };

  const menuItemText = "Search GRO Deaths " + getYearRangesAsText("deaths");
  let year = data.generalizedData.inferDeathYear();
  let subtitle = "";

  if (year) {
    if (!yearInInGroRanges("deaths", year)) {
      subtitle = "Death year " + year + " is not covered by GRO";
    }
  } else {
    subtitle = "Death year not known";
  }

  if (subtitle) {
    addMenuItemWithSubtitle(menu, menuItemText, onClick, subtitle);
  } else {
    addMenuItem(menu, menuItemText, onClick);
  }
}

function addGroSmartSearchChildBirthsMenuItem(menu, data, filter, spouse) {
  let yearRange = getReproductiveYearRangeForCouple(data.generalizedData, spouse);
  if (!yearRangeOverlapsOverallGroRange(yearRange) || yearRange.startYear > yearRange.endYear) {
    return;
  }

  const onClick = function (element) {
    groSmartSearch(data.generalizedData, "birthsOfChildren", spouse);
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
    let gender = data.extractedData.personGender;

    if (gender == "female") {
      menuItemText = "Do smart search for children with no registered father";
    } else {
      menuItemText = "Do smart search for children with any mother";
    }
    subtitle += "Possible child birth years: " + getYearRangeAsText(yearRange.startYear, yearRange.endYear);
  }

  if (!yearRangeOverlapsGroRanges("births", yearRange)) {
    let rangeText = getYearRangeAsText(yearRange.startYear, yearRange.endYear);
    subtitle += "\nBirth years " + rangeText + " are not covered by GRO";
  }

  if (subtitle) {
    addMenuItemWithSubtitle(menu, menuItemText, onClick, subtitle);
  } else {
    addMenuItem(menu, menuItemText, onClick);
  }
}

function addGroSmartSearchDeathsMenuItem(menu, data, filter) {
  let yearRange = getPossibleDeathRange(data.generalizedData);
  if (!yearRangeOverlapsOverallGroRange(yearRange)) {
    return;
  }

  const onClick = function (element) {
    groSmartSearch(data.generalizedData, "deaths");
  };

  let menuItemText = "Do smart search for possible deaths";
  let subtitle = "";

  if (data.generalizedData.inferDeathYear()) {
    menuItemText = "Do smart search for other possible deaths";
  }
  subtitle += "Possible death years: " + getYearRangeAsText(yearRange.startYear, yearRange.endYear);

  if (subtitle) {
    addMenuItemWithSubtitle(menu, menuItemText, onClick, subtitle);
  } else {
    addMenuItem(menu, menuItemText, onClick);
  }
}

function addGroDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItem(menu, "Search GRO (UK)...", function (element) {
    setupGroSearchSubMenu(data, backFunction, filter);
  });

  return true;
}

function addGroSameRecordMenuItem(menu, data) {
  let gd = data.generalizedData;
  let subtitle = "";
  let recordType = gd.recordType;
  if (recordType == RT.BirthRegistration) {
    let year = data.generalizedData.inferBirthYear();
    if (year) {
      if (!yearInInGroRanges("births", year)) {
        subtitle = "Birth year " + year + " is not covered by GRO";
      }
    }
  } else if (recordType == RT.DeathRegistration) {
    let year = data.generalizedData.inferDeathYear();
    if (year) {
      if (!yearInInGroRanges("deaths", year)) {
        subtitle = "Death year " + year + " is not covered by GRO";
      }
    }
  }

  addSameRecordMenuItem(
    menu,
    data,
    "gro",
    function (element) {
      groSearch(data.generalizedData, "SameCollection");
    },
    "",
    subtitle
  );
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupGroSearchSubMenu(data, backFunction, filter) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  addGroSameRecordMenuItem(menu, data, filter);
  addGroSearchBirthsMenuItem(menu, data, filter);
  addGroSearchDeathsMenuItem(menu, data, filter);

  if (options.search_gro_enableSmartSearch) {
    if (data.generalizedData.spouses) {
      for (let spouse of data.generalizedData.spouses) {
        addGroSmartSearchChildBirthsMenuItem(menu, data, filter, spouse);
      }
    }
    addGroSmartSearchChildBirthsMenuItem(menu, data, filter);
    addGroSmartSearchDeathsMenuItem(menu, data, filter);
  }

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("gro", "GRO (UK)", addGroDefaultSearchMenuItem, shouldShowSearchMenuItem);
