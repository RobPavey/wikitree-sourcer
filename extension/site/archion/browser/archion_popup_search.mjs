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
  addMenuItem,
  addMenuItemWithSubMenu,
  addBackMenuItem,
  beginMainMenu,
  endMainMenu,
  doAsyncActionWithCatch,
} from "/base/browser/popup/popup_menu_building.mjs";

import { doSearch, registerSearchMenuItemFunction, shouldShowSiteSearch } from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

const archionStartYear = 1800;
const archionEndYear = 2000;

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: archionStartYear,
    endYear: archionEndYear,
    dateTestType: "bmd",
    countryList: ["Germany", "Poland", "Luxembourg", "Austria", "Italy", "Ukraine"],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function archionSearch(generalizedData) {
  const input = { generalizedData: generalizedData, options: options };
  doAsyncActionWithCatch("Archion Search", input, async function () {
    let loadedModule = await import(`../core/archion_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

async function archionLocationSearch(searchParameters) {
  const input = { searchParameters: searchParameters };
  doAsyncActionWithCatch("Archion Search", input, async function () {
    let loadedModule = await import(`../core/archion_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function extractPlaceStrings(ed, gd) {
  let locations = [];

  let placeObj = gd.inferBirthPlaceObj();
  let dateObj = gd.inferBirthDateObj();
  if (placeObj) {
    let placeParts = placeObj.separatePlaceIntoParts();
    if (placeParts && placeParts.localPlace) {
      locations.push({ descriptor: "Birth", place: placeParts.localPlace, year: dateObj ? dateObj.getYearString() : -1 });
    }
  }

  placeObj = gd.inferResidencePlaceObj();
  dateObj = gd.inferResidenceDateObj();
  if (placeObj) {
    let placeParts = placeObj.separatePlaceIntoParts();
    if (placeParts && placeParts.localPlace) {
      locations.push({ descriptor: "Residence", place: placeParts.localPlace, year: dateObj ? dateObj.getYearString() : -1 });
    }
  }

  // from inferPlaceNames()
  // add marriage places
  if (gd.sourceType == "profile" && gd.spouses) {
    for (let spouse of gd.spouses) {
      let year = -1;
      if (spouse.marriageDate && spouse.marriageDate.dateString) {
        year = Number(spouse.marriageDate.dateString.split(" ")[2]);
      }
      if (spouse.marriagePlace && spouse.marriagePlace.placeString) {
        locations.push({ descriptor: "Marriage", place: spouse.marriagePlace.placeString, year : year });
      }
    }
  }

  placeObj = gd.inferDeathPlaceObj();
  dateObj = gd.inferDeathDateObj();
  if (placeObj) {
    let placeParts = placeObj.separatePlaceIntoParts();
    if (placeParts && placeParts.localPlace) {
      locations.push({ descriptor: "Death", place: placeParts.localPlace, year: dateObj ? dateObj.getYearString() : -1 });
    }
  }

  if (!locations) {
    placeObj = gd.inferEventPlaceObj();
    dateObj = gd.inferEventDateObj();
    if (placeObj) {
      let placeParts = placeObj.separatePlaceIntoParts();
      if (placeParts && placeParts.localPlace) {
        locations.push({ descriptor: "Event", place: placeParts.localPlace, year: dateObj ? dateObj.getYearString() : -1 });
      }
    }
  }

  return locations;
}

function addArchionDefaultSearchMenuItem(menu, data, backFunction, filter) {
  const locations = extractPlaceStrings(data.extractedData, data.generalizedData);

  // Display the submenu only when there are locations which we have extracted
  if (locations.length > 0) {
    addMenuItemWithSubMenu(
      menu,
      "Search Archion",
      function (element) {
        archionSearch(data.generalizedData, "");
      },
      function () {
        setupArchionSearchSubMenu(data, backFunction, filter, locations);
      }
    );
  } else {
    addMenuItem(menu, "Search Archion", function (element) {
      archionSearch(data.generalizedData, "");
    });
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupArchionSearchSubMenu(data, backFunction, filter, locations) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  if (locations) {
    for (let location of locations) {
      addMenuItem(menu, "Search for " + location.descriptor, function () {
        setupArchionLocationSubmenuLayer2(data, backFunction, location);
      });
    }
  }

  endMainMenu(menu);
}

function setupArchionLocationSubmenuLayer2(data, backFunction, item) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  var fragments = item.place.split(",");

  for (let i = 0; i < 3; i++) {
    let part = fragments[i];
    if (!part || fragments.indexOf(part) != i) {
      continue;
    }
    part = part.trim();
    addMenuItem(menu, part, function (element) {
      let kind = undefined;

      if (item.descriptor == "Birth") {
        kind = "TA";
      }
      if (item.descriptor == "Marriage") {
        kind = "TR";
      }
      if (item.descriptor == "Death") {
        kind = "BE";
      }

      archionLocationSearch({ place: part, year: item.year, kind: kind });
    });
  }

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("archion", "Archion", addArchionDefaultSearchMenuItem, shouldShowSearchMenuItem);
