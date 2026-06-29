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

//////////////////////////////////////////////////////////////////////////////////////////
// Configuration
//////////////////////////////////////////////////////////////////////////////////////////

const searchMenuConfig = {
  siteName: "qldbdm",
  siteDisplayName: "Queensland BDM (Aus)",
  siteConstraints: {
    startYear: 1829,
    dateTestType: "bmd",
    countryList: ["Australia", "Colony of Queensland"],
  },
  localStorageConfig: {
    searchUrl: "https://www.familyhistory.bdm.qld.gov.au/reset",
  },
  defaultMenuItem: {
    menuItemText: "Search Queensland BDM (Aus)",
    includeDefaultSearch: true,
    includeSearchSubmenu: true,
    submenuConfig: {
      includeSameCollection: true,
      includeSearchWithParameters: true,
      submenuMenuItems: [
        {
          menuItemText: "Search Births",
          typeOfSearch: "births",
          constraints: {
            startYear: 1829,
            endYearDynamic: { beforeNow: true, offset: 100 },
            dateTestType: "born",
          },
        },
        {
          menuItemText: "Search Deaths",
          typeOfSearch: "deaths",
          constraints: {
            startYear: 1829,
            endYearDynamic: { beforeNow: true, offset: 30 },
            dateTestType: "died",
          },
        },
        {
          menuItemText: "Search Marriages",
          typeOfSearch: "marriages",
          constraints: {
            startYear: 1829,
            endYearDynamic: { beforeNow: true, offset: 75 },
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
