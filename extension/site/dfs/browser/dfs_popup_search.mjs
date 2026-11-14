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
registerSearchMenuItemFromConfig({
  siteName: "dfs",
  siteDisplayName: "Danish Family Search",
  localStorageConfig: { searchUrl: "https://www.danishfamilysearch.dk/search/" },
  defaultMenuItem: {
    menuItemText: "Search Danish Family Search",
    includeDefaultSearch: true,
    includeSearchSubmenu: true,
    submenuConfig: {
      includeSearchWithParameters: true,
      submenuMenuItems: [
        { menuItemText: "Search church books", typeOfSearch: "churchbook", includeDefaultSearch: true },
        { menuItemText: "Search censuses", typeOfSearch: "census", includeDefaultSearch: true },
        { menuItemText: "Search school protocols", typeOfSearch: "skoleprotokol", includeDefaultSearch: true },
        { menuItemText: "Search military levy rolls", typeOfSearch: "laegsruller", includeDefaultSearch: true },
      ],
    },
  },
});
