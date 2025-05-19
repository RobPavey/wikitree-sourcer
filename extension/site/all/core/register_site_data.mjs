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

import { siteNames } from "./site_names.mjs";
// Importing each of these site modules causes them to register their options

// Currently the order that they are imported is the order that they appear in the
// options page subsection drop down
// Therefore this list is ordered by the visible string in the options dropdown
// rather than by sitename.

var isSiteDataRegistered = false;
async function registerSiteData() {
  if (isSiteDataRegistered) {
    return;
  }
  for (const siteName of siteNames) {
    const pathName = "site/" + siteName + "/core/" + siteName + "_site_data.mjs";
    try {
      // Note: Using chrome.runtime.getURL is considered "sanitizing" the pathName
      // so it avoids a validation warning for Firefox
      let module = await import(chrome.runtime.getURL(pathName));
      if (module) {
        module.register();
      }
    } catch (error) {
      //console.log("registerSiteData: error importing site data for " + siteName);
    }
  }

  isSiteDataRegistered = true;
}

export { registerSiteData };
