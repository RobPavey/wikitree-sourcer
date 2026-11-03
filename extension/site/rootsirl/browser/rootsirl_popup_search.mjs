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

import { registerSearchMenuItemFromConfig } from "/base/browser/popup/popup_search_config.mjs";

function buildLocalStorageDataFromBuildResult(buildResult, typeOfSearch) {
  // Each record type has its own form on the all-Ireland search. The site posts the form, so the search
  // terms can't go in the URL; the content script fills in the form instead.
  let formType = buildResult.formType ? buildResult.formType : "birth";
  let searchUrl = "https://rootsireland.ie/ifhf/quis.php?type=" + formType + "&new=1";

  const searchData = {
    timeStamp: Date.now(),
    url: searchUrl,
    fieldData: buildResult.fieldData,
    selectData: buildResult.selectData,
    searchType: buildResult.searchType ? buildResult.searchType : typeOfSearch,
    formType: formType,
  };

  return searchData;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Configuration
//////////////////////////////////////////////////////////////////////////////////////////

const searchMenuConfig = {
  siteName: "rootsirl",
  siteDisplayName: "Roots Ireland",
  siteConstraints: {
    // The databases are mostly church records from the 1600s on and civil records up to about 1925
    startYear: 1600,
    endYear: 1950,
    dateTestType: "bmd",
    countryList: ["Ireland"],
  },
  localStorageConfig: {
    permissionsMessage:
      "To perform a search on Roots Ireland a content script needs to be loaded on the rootsireland.ie search page.",
    buildLocalStorageDataFunction: buildLocalStorageDataFromBuildResult,
  },
  defaultMenuItem: {
    menuItemText: "Search Roots Ireland",
    includeDefaultSearch: true,
    includeSearchSubmenu: true,
    submenuConfig: {
      submenuMenuItems: [
        {
          menuItemText: "Search Roots Ireland Baptisms/Births",
          typeOfSearch: "Births",
          constraints: { dateTestType: "born" },
        },
        {
          menuItemText: "Search Roots Ireland Marriages",
          typeOfSearch: "Marriages",
          constraints: { dateTestType: "married" },
        },
        {
          menuItemText: "Search Roots Ireland Burials/Deaths",
          typeOfSearch: "Deaths",
          constraints: { dateTestType: "died" },
        },
      ],
    },
  },
};

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFromConfig(searchMenuConfig);
