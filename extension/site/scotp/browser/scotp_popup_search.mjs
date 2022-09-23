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
  doAsyncActionWithCatch
} from "/base/browser/popup/popup_menu_building.mjs";
import {
  setupSearchWithParametersSubMenu,
} from "/base/browser/popup/popup_search_with_parameters.mjs";

import { doSearch, registerSearchMenuItemFunction, testFilterForDatesAndCountries } from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

// it varies based on record type, make broad for now
const scotpStartYear = 1000;
const scotpEndYear = 2500;

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function scotpSearch(generalizedData, parameters) {
  const input = {
    typeOfSearch: "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options
  };
  doAsyncActionWithCatch("ScotlandsPeople Search", input, async function() {
    let loadedModule = await import(`../core/scotp_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addScotpDefaultSearchMenuItem(menu, data, backFunction, filter) {
  //console.log("addScotpDefaultSearchMenuItem, data is:");
  //console.log(data);

  if (filter) {
    if (!testFilterForDatesAndCountries(filter, scotpStartYear, scotpEndYear, ["Scotland"])) {
      return;
    }
  }
  else {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let birthPossibleInRange = data.generalizedData.couldPersonHaveBeenBornInDateRange(scotpStartYear, scotpEndYear, maxLifespan);
    let deathPossibleInRange = data.generalizedData.couldPersonHaveDiedInDateRange(scotpStartYear, scotpEndYear, maxLifespan);
    let marriagePossibleInRange = data.generalizedData.couldPersonHaveMarriedInDateRange(scotpStartYear, scotpEndYear, maxLifespan);

    if (!(birthPossibleInRange || deathPossibleInRange || marriagePossibleInRange)) {
      //console.log("addScotpDefaultSearchMenuItem: dates not in range");
      return;
    }

    if (!data.generalizedData.didPersonLiveInCountryList(["Scotland"])) {
      //console.log("addScotpDefaultSearchMenuItem: didPersonLiveInCountryList returned false");
      return;
    }
  }
  
  addMenuItem(menu, "Search ScotlandsPeople...", function(element) {
    setupScotpSearchSubMenu(data, backFunction);
  });

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupScotpSearchSubMenu(data, backFunction) {

  let dataModule = await import(`../core/scotp_search_menu_data.mjs`);
  setupSearchWithParametersSubMenu(data, backFunction, dataModule.ScotpData, scotpSearch);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("scotp", "ScotlandsPeople", addScotpDefaultSearchMenuItem);
