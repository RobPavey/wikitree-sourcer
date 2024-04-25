/*
MIT License

Copyright (c) 2024 Robert M Pavey

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

import { addMenuItem, closePopup, doAsyncActionWithCatch } from "/base/browser/popup/popup_menu_building.mjs";

import { options } from "/base/browser/options/options_loader.mjs";

import { registerSearchMenuItemFunction, openUrlInNewTab } from "/base/browser/popup/popup_search.mjs";

import { checkPermissionForSite } from "/base/browser/popup/popup_permissions.mjs";

//////////////////////////////////////////////////////////////////////////////////////////
// Menu actions
//////////////////////////////////////////////////////////////////////////////////////////

async function vicbdmSearch(generalizedData) {
  const input = { generalizedData: generalizedData, options: options };
  doAsyncActionWithCatch("Victoria BDM (Aus) Search", input, async function () {
    let loadedModule = await import(`../core/vicbdm_build_search_data.mjs`);
    let buildResult = loadedModule.buildSearchData(input);

    let fieldData = buildResult.fieldData;
    let selectData = buildResult.selectData;

    const checkPermissionsOptions = {
      reason:
        "To perform a search on WieWasWie a content script needs to be loaded on the www.wiewaswie.nl search page.",
    };
    let allowed = await checkPermissionForSite("*://*.bdm.vic.gov.au/*", checkPermissionsOptions);
    if (!allowed) {
      closePopup();
      return;
    }

    let searchUrl = "https://my.rio.bdm.vic.gov.au/efamily-history/-";

    try {
      const vicbdmSearchData = {
        timeStamp: Date.now(),
        url: searchUrl,
        fieldData: fieldData,
        selectData: selectData,
      };

      // this stores the search data in local storage which is then picked up by the
      // content script in the new tab/window
      chrome.storage.local.set({ vicbdmSearchData: vicbdmSearchData }, function () {
        //console.log('saved vicbdmSearchData, vicbdmSearchData is:');
        //console.log(vicbdmSearchData);
      });
    } catch (ex) {
      console.log("storeDataCache failed");
    }

    openUrlInNewTab(searchUrl);
    closePopup();
  });
}

//////////////////////////////////////////////////////////////////////////////////////////
// Menu items
//////////////////////////////////////////////////////////////////////////////////////////

function addVicbdmDefaultSearchMenuItem(menu, data, backFunction, filter) {
  addMenuItem(menu, "Search Victoria BDM (Aus)", function (element) {
    vicbdmSearch(data.generalizedData);
  });

  return true;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Submenus
//////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFunction("vicbdm", "Victoria BDM (Aus)", addVicbdmDefaultSearchMenuItem);
