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

import { addMenuItem, doAsyncActionWithCatch } from "/base/browser/popup/popup_menu_building.mjs";

import { setupSearchWithParametersSubMenu } from "/base/browser/popup/popup_search_with_parameters.mjs";

import {
  doSearch,
  registerSearchMenuItemFunction,
  testFilterForDatesAndCountries,
} from "/base/browser/popup/popup_search.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

// The years covered by the release of the historic records of Births, Marriages and Deaths are:
// Births: 1864 to 1922
// Marriages: 1845* to 1947
// Deaths: 1871** to 1972
// * The General Register Office are currently working on updating further records of Deaths dating back to 1864.
//   These will be included in future updates to the records available on the website.

const irishgStartYear = 1520;
const irishgEndYear = 1930;

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function irishgSearch(generalizedData, parameters) {
  const input = {
    typeOfSearch: "SpecifiedParameters",
    searchParameters: parameters,
    generalizedData: generalizedData,
    options: options,
  };

  doAsyncActionWithCatch("IrishGenealogy.ie Search", input, async function () {
    let loadedModule = await import(`../core/irishg_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

// There are a lot of different ways the search could be setup. For IrishGenealogy the best way
// might be like ScotP - with a default menu that is like "Search with Specific Parameters"

function addIrishgDefaultSearchMenuItem(menu, data, backFunction, filter) {
  //console.log("addIrishgDefaultSearchMenuItem, data is:");
  //console.log(data);

  const stdCountryName = "Ireland";

  if (filter) {
    if (!testFilterForDatesAndCountries(filter, irishgStartYear, irishgEndYear, [stdCountryName])) {
      return;
    }
  } else {
    let maxLifespan = Number(options.search_general_maxLifespan);
    let possibleInRange = data.generalizedData.couldPersonHaveLivedInDateRange(
      irishgStartYear,
      irishgEndYear,
      maxLifespan
    );

    if (!possibleInRange) {
      //console.log("addIrishgDefaultSearchMenuItem: dates not in range");
      return;
    }

    if (!data.generalizedData.didPersonLiveInCountryList([stdCountryName])) {
      //console.log("addIrishgDefaultSearchMenuItem: didPersonLiveInCountryList returned false");
      return;
    }
  }

  addMenuItem(menu, "Search IrishGenealogy.ie...", function (element) {
    setupIrishgSearchSubMenu(data, backFunction, filter);
  });

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

async function setupIrishgSearchSubMenu(data, backFunction, filter) {
  let dataModule = await import(`../core/irishg_search_menu_data.mjs`);
  setupSearchWithParametersSubMenu(data, backFunction, dataModule.IrishgData, irishgSearch);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("irishg", "IrishGenealogy.ie", addIrishgDefaultSearchMenuItem);
