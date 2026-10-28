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

import { registerSearchMenuItemFromConfig } from "/base/browser/popup/popup_search_config.mjs";

function buildLocalStorageDataFromBuildResult(buildResult, typeOfSearch) {
  // https://www.bdmhistoricalrecords.dia.govt.nz/search/search?path=%2FqueryEntry.m%3Ftype%3Dbirths
  let searchUrl = "https://www.bdmhistoricalrecords.dia.govt.nz/search/search?path=%2FqueryEntry.m%3Ftype%3D";
  if (typeOfSearch) {
    searchUrl += typeOfSearch.toLowerCase();
  }

  const searchData = {
    timeStamp: Date.now(),
    url: searchUrl,
    fieldData: buildResult.fieldData,
    selectData: buildResult.selectData,
    searchType: typeOfSearch,
  };

  return searchData;
}

//////////////////////////////////////////////////////////////////////////////////////////
// Configuration
//////////////////////////////////////////////////////////////////////////////////////////

const searchMenuConfig = {
  siteName: "nzbdm",
  siteDisplayName: "New Zealand BDM",
  siteConstraints: {
    startYear: 1848,
    dateTestType: "bmd",
    countryList: ["New Zealand"],
  },
  localStorageConfig: {
    permissionsMessage:
      "To perform a search on Victoria BDM a content script needs to be loaded on the bdm.vic.gov.au search page.",
    buildLocalStorageDataFunction: buildLocalStorageDataFromBuildResult,
  },
  defaultMenuItem: {
    menuItemText: "Search New Zealand BDM",
    includeDefaultSearch: false,
    includeSearchSubmenu: true,
    submenuConfig: {
      submenuMenuItems: [
        {
          menuItemText: "Search New Zealand BDM Births",
          typeOfSearch: "Births",
          constraints: {
            endYearDynamic: { beforeNow: true, offset: 79 },
            dateTestType: "born",
          },
        },
        {
          menuItemText: "Search New Zealand BDM Deaths",
          typeOfSearch: "Deaths",
          constraints: {
            endYearDynamic: { beforeNow: true, offset: 0 },
            dateTestType: "died",
          },
        },
        {
          menuItemText: "Search New Zealand BDM Marriages",
          typeOfSearch: "Marriages",
          constraints: {
            endYearDynamic: { beforeNow: true, offset: 74 },
            dateTestType: "married",
          },
        },
      ],
    },
  },
};

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFromConfig(searchMenuConfig);
