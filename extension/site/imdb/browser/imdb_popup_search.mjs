/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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
  addMenuItemWithSubmenu,
  addBackMenuItem,
  beginMainMenu,
  endMainMenu,
  doAsyncActionWithCatch,
} from "/base/browser/popup/popup_menu_building.mjs";

import { doSearch, registerSearchMenuItemFunction, dataHasName } from "/base/browser/popup/popup_search.mjs";
import { buildNameVariants } from "../core/imdb_name_variants.mjs";
import { options } from "/base/browser/options/options_loader.mjs";

function shouldShowSearchMenuItem(data, filter) {
  return dataHasName(data);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

// typeOfSearch is undefined to search with the default name or "name:<name>" to search with a specific name
async function imdbSearch(generalizedData, typeOfSearch) {
  const input = { generalizedData: generalizedData, typeOfSearch: typeOfSearch, options: options };
  doAsyncActionWithCatch("IMDb Search", input, async function () {
    let loadedModule = await import(`../core/imdb_build_search_url.mjs`);
    doSearch(loadedModule, input);
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

// IMDb knows people by the name they work under which is often not their birth name (or "aka"). This
// lists each of the names that the profile could be known by.
function setupImdbNamesSubmenu(data, backFunction) {
  let menu = beginMainMenu();
  addBackMenuItem(menu, backFunction);

  for (let variant of buildNameVariants(data.generalizedData)) {
    addMenuItem(menu, "Search for " + variant.name + " (" + variant.label + ")", function (element) {
      imdbSearch(data.generalizedData, "name:" + variant.name);
    });
  }

  endMainMenu(menu);
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addImdbDefaultSearchMenuItem(menu, data, backFunction, filter) {
  const variants = buildNameVariants(data.generalizedData);

  if (variants.length > 1) {
    addMenuItemWithSubmenu(
      menu,
      "Search IMDb",
      function (element) {
        imdbSearch(data.generalizedData);
      },
      function () {
        setupImdbNamesSubmenu(data, backFunction);
      }
    );
  } else {
    addMenuItem(menu, "Search IMDb", function (element) {
      imdbSearch(data.generalizedData);
    });
  }

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("imdb", "IMDb", addImdbDefaultSearchMenuItem, shouldShowSearchMenuItem);
