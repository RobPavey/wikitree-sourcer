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

const matriculaStartYear = 1500;
const matriculaEndYear = 2000;

function shouldShowSearchMenuItem(data, filter) {
  const siteConstraints = {
    startYear: matriculaStartYear,
    endYear: matriculaEndYear,
    dateTestType: "bmd",
    countryList: [],
  };

  if (!shouldShowSiteSearch(data.generalizedData, filter, siteConstraints)) {
    return false;
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function matriculaSearch(generalizedData) {
  const input = { generalizedData: generalizedData, options: options };
  doAsyncActionWithCatch("Matricula Search", input, async function () {
    let loadedModule = await import(`../core/matricula_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

async function matriculaLocationSearch(searchParameters) {
  const input = { searchParameters: searchParameters };
  doAsyncActionWithCatch("Matricula Search", input, async function () {
    let loadedModule = await import(`../core/matricula_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function extractPlaceStrings(ed, gd) {
  let locations = [];

  let placeObj = gd.inferBirthPlaceObj();
  if (placeObj) {
    let placeParts = placeObj.separatePlaceIntoParts();
    locations.push({ descriptor: "Birth", place: placeParts.localPlace });
  }

  placeObj = gd.inferResidencePlaceObj();
  if (placeObj) {
    let placeParts = placeObj.separatePlaceIntoParts();
    locations.push({ descriptor: "Residence", place: placeParts.localPlace });
  }

  // from inferPlaceNames()
  // add marriage places
  if (gd.sourceType == "profile" && gd.spouses) {
    for (let spouse of gd.spouses) {
      if (spouse.marriagePlace && spouse.marriagePlace.placeString) {
        locations.push({ descriptor: "Marriage", place: spouse.marriagePlace.placeString });
      }
    }
  }
  // Marriage records on FS are not included in above, but we can work around this issue
  else if (gd.sourceType == "record" && gd.recordType.toLowerCase() == "marriage") {
    const place = gd.eventPlace.placeString;
    if (place) {
      locations.push({ descriptor: "Marriage", place: place });
    }
  }

  placeObj = gd.inferDeathPlaceObj();
  if (placeObj) {
    let placeParts = placeObj.separatePlaceIntoParts();
    locations.push({ descriptor: "Death", place: placeParts.localPlace });
  }

  if (!locations) {
    placeObj = gd.inferEventPlaceObj();
    if (placeObj) {
      let placeParts = placeObj.separatePlaceIntoParts();
      locations.push({ descriptor: "Event", place: placeParts.localPlace });
    }
  }

  return locations;
}

function addMatriculaDefaultSearchMenuItem(menu, data, backFunction, filter) {
  const locations = extractPlaceStrings(data.extractedData, data.generalizedData);

  // Display the submenu only when there are locations which we have extracted
  if (locations.length > 0) {
    addMenuItemWithSubMenu(
      menu,
      "Search Matricula",
      function (element) {
        matriculaSearch(data.generalizedData, "");
      },
      function () {
        setupMatriculaSearchSubMenu(data, backFunction, filter, locations);
      }
    );
  } else {
    addMenuItem(menu, "Search Matricula", function (element) {
      matriculaSearch(data.generalizedData, "");
    });
  }

  return true;
}

function addMatriculaLocationSearch(data, backFunction, item) {
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
      matriculaLocationSearch({ place: part });
    });
  }

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupMatriculaSearchSubMenu(data, backFunction, filter, locations) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  if (locations) {
    for (let i = 0; i < locations.length; i++) {
      addMenuItemWithSubMenu(
        menu,
        "Search for " + locations[i].descriptor,
        function (element) {},
        function () {
          addMatriculaLocationSearch(data, backFunction, locations[i]);
        }
      );
    }
  } else {
    // TODO: add note that no places could be found
  }

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("matricula", "Matricula", addMatriculaDefaultSearchMenuItem, shouldShowSearchMenuItem);
