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

const groStartYear = 1837;
const groEndYear = 2022;

//////////////////////////////////////////////////////////////////////////////////////////
// Helper functions
//////////////////////////////////////////////////////////////////////////////////////////

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: groStartYear,
    endYear: groEndYear,
    countryList: ["England and Wales"],
    exactCountryList: ["United Kingdom"],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

function birthYearInGroRange(data) {
  // currently starts at 1837 and there is a gap from 1935-1983
  let birthYear = data.generalizedData.inferBirthYear();
  return birthYear && birthYear >= groStartYear;
}

function deathYearInGroRange(data) {
  // currently starts at 1837 and there is a gap from 1958-1983
  let deathYear = data.generalizedData.inferDeathYear();
  return deathYear && deathYear >= groStartYear;
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

async function groSmartSearch(gd, typeOfSearch) {
  // !!!!!!!!!
  // need permisions check
  // !!!!!!

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

  let searchUrl = "/site/gro/browser/gro_smart_search.html";
  let searchData = {
    timeStamp: Date.now(),
    url: searchUrl,
  };

  let parameters = {};

  if (typeOfSearch == "birthsOfChildren") {
    parameters.type = "birth";

    parameters.surname = gd.inferLastName();
    parameters.gender = gd.personGender;

    const startReproductiveAge = 14;
    let endReproductiveAge = 80;
    if (gd.personGender == "female") {
      endReproductiveAge = 50;
    }
    let birthYear = yearStringToNumber(gd.inferBirthYear());
    if (birthYear) {
      parameters.startYear = birthYear + startReproductiveAge;
      parameters.endYear = birthYear + endReproductiveAge;
      let deathYear = yearStringToNumber(gd.inferDeathYear());
      if (deathYear) {
        if (parameters.endYear > deathYear + 1) {
          parameters.endYear = deathYear + 1;
        }
      }
    }

    parameters.surname = gd.inferLastName();
    parameters.gender = "both"; //gd.personGender;

    if (gd.spouses && gd.spouses.length > 0) {
      let spouse = gd.spouses[0];
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
    }
  } else if (typeOfSearch == "deaths") {
    parameters.type = "death";

    const maxLifespan = 120;
    let birthYear = yearStringToNumber(gd.inferBirthYear());
    if (birthYear) {
      parameters.startYear = birthYear - 2;
      parameters.endYear = birthYear + maxLifespan;

      parameters.startBirthYear = birthYear - 2;
      parameters.endBirthYear = birthYear + 2;
    }

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
  if (!filter && !birthYearInGroRange(data)) {
    return;
  }

  const onClick = function (element) {
    groSearch(data.generalizedData, "births");
  };

  const menuItemText = "Search GRO Births (1837-1934, 1984-2022)";
  let year = data.generalizedData.inferBirthYear();
  let subtitle = "";

  if (year) {
    if (year < groStartYear || year > groEndYear || (year > 1934 && year < 1984)) {
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
  if (!filter && !deathYearInGroRange(data)) {
    return;
  }

  const onClick = function (element) {
    groSearch(data.generalizedData, "deaths");
  };

  const menuItemText = "Search GRO Deaths (1837-1957, 1984-2022)";
  let year = data.generalizedData.inferDeathYear();
  let subtitle = "";

  if (year) {
    if (year < groStartYear || year > groEndYear || (year > 1957 && year < 1984)) {
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

function addGroSmartSearchChildBirthsMenuItem(menu, data, filter) {
  const onClick = function (element) {
    groSmartSearch(data.generalizedData, "birthsOfChildren");
  };

  const menuItemText = "Do smart search for children of this person";
  let subtitle = "";

  if (subtitle) {
    addMenuItemWithSubtitle(menu, menuItemText, onClick, subtitle);
  } else {
    addMenuItem(menu, menuItemText, onClick);
  }
}

function addGroSmartSearchDeathsMenuItem(menu, data, filter) {
  const onClick = function (element) {
    groSmartSearch(data.generalizedData, "deaths");
  };

  const menuItemText = "Do smart search for possible deaths";
  let subtitle = "";

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
      if (year < groStartYear || year > groEndYear || (year > 1934 && year < 1984)) {
        subtitle = "Birth year " + year + " is not covered by GRO";
      }
    }
  } else if (recordType == RT.DeathRegistration) {
    let year = data.generalizedData.inferDeathYear();
    if (year) {
      if (year < groStartYear || year > groEndYear || (year > 1957 && year < 1984)) {
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
  addGroSmartSearchChildBirthsMenuItem(menu, data, filter);
  addGroSmartSearchDeathsMenuItem(menu, data, filter);

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("gro", "GRO (UK)", addGroDefaultSearchMenuItem, shouldShowSearchMenuItem);
