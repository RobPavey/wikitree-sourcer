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

async function matriculaLocationSearch(place) {
  const input = { place: place };
  doAsyncActionWithCatch("Matricula Search", input, async function () {
    let loadedModule = await import(`../core/matricula_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addMatriculaDefaultSearchMenuItem(menu, data, backFunction, filter) {
  // addMenuItem(menu, "Search Matricula", function (element) {
  //   matriculaSearch(data.generalizedData);
  // });
  addMenuItemWithSubMenu(
    menu,
    "Search Matricula",
    function (element) {
      matriculaSearch(data.generalizedData, "");
    },
    function () {
      setupMatriculaSearchSubMenu(data, backFunction, filter);
    }
  );

  return true;
}

function addMatriculaLocationSearch(menu, data, backFunction, item) {
  var fragments = item.place.split(",");

  for (let i = 0; i < 3; i++) {
    let part = fragments[i];
    if (!part || fragments.indexOf(part) != i) {
      continue;
    }
    part = part.trim();
    addMenuItem(menu, "Search for " + item.descriptor + " (" + part + ")", function (element) {
      matriculaLocationSearch(part);
    });
  }
}

async function setupMatriculaSearchSubMenu(data, backFunction, filter) {
  let ed = data.extractedData;
  let locations = [];

  if (ed.birthLocation) {
    locations.push({ descriptor: "Birth", place: ed.birthLocation });
  } else if (ed.birthPlace) {
    locations.push({ descriptor: "Birth", place: ed.birthPlace });
  }
  if (ed.spouses) {
    const spouses = ed.spouses;
    for (let i = 0; i < spouses.length; i++) {
      const spouse = spouses[i];

      if (spouse.marriagePlace) {
        locations.push({ descriptor: "Marriage", place: spouse.marriagePlace });
      }
    }
  } else if (ed.marriages) {
    const spouses = ed.marriages;
    for (let i = 0; i < spouses.length; i++) {
      const spouse = spouses[i];

      if (spouse.marriagePlace) {
        locations.push({ descriptor: "Marriage", place: spouse.marriagePlace });
      }
    }
  }
  if (ed.deathLocation) {
    locations.push({ descriptor: "Death", place: ed.deathLocation });
  } else if (ed.deathPlace) {
    locations.push({ descriptor: "Death", place: ed.deathPlace });
  }

  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  if (locations) {
    for (let i = 0; i < locations.length; i++) {
      addMatriculaLocationSearch(menu, data, backFunction, locations[i]);
    }
  } else {
    // TODO: add note that no places could be found
  }

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("matricula", "Matricula", addMatriculaDefaultSearchMenuItem, shouldShowSearchMenuItem);
