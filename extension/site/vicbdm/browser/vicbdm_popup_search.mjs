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

import { registerSearchMenuItemFromConfig } from "/base/browser/popup/popup_search_config.mjs";

//////////////////////////////////////////////////////////////////////////////////////////
// Configuration
//////////////////////////////////////////////////////////////////////////////////////////

const searchMenuConfig = {
  siteName: "vicbdm",
  siteDisplayName: "Victoria BDM (Aus)",
  siteConstraints: {
    startYear: 1836,
    endYearDynamic: { beforeNow: true, offset: 29 },
    dateTestType: "bmd",
    countryList: ["Australia", "Colony of Victoria"],
  },
  localStorageConfig: {
    permissionsMessage:
      "To perform a search on Victoria BDM a content script needs to be loaded on the bdm.vic.gov.au search page.",
    searchUrl: "https://my.rio.bdm.vic.gov.au/efamily-history/-",
  },
  includeDefaultSearch: false,
  includeSearchSubmenu: true,
  submenuConfig: {
    includeSameCollection: true,
    includeSearchWithParameters: true,
    submenuOtherSearches: [
      {
        menuItemText: "Search Victoria BDM Births",
        typeOfSearch: "Births",
        constraints: {
          startYear: 1836,
          endYearDynamic: { beforeNow: true, offset: 99 },
          dateTestType: "born",
        },
      },
      {
        menuItemText: "Search Victoria BDM Deaths",
        typeOfSearch: "Deaths",
        constraints: {
          startYear: 1836,
          endYearDynamic: { beforeNow: true, offset: 59 },
          dateTestType: "died",
        },
      },
      {
        menuItemText: "Search Victoria BDM Marriages",
        typeOfSearch: "Marriages",
        constraints: {
          startYear: 1836,
          endYearDynamic: { beforeNow: true, offset: 29 },
          dateTestType: "bdm",
        },
      },
    ],
  },
};

//////////////////////////////////////////////////////////////////////////////////////////
// Register the search menu - it can be used on the popup for lots of sites
//////////////////////////////////////////////////////////////////////////////////////////

registerSearchMenuItemFromConfig(searchMenuConfig);
