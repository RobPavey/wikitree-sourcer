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

var areSiteOptionsRegistered = false;
async function registerSiteOptions() {
  if (areSiteOptionsRegistered) {
    return;
  }
  for (let siteName of siteNames) {
    let pathName = "../../" + siteName + "/core/" + siteName + "_options.mjs";
    try {
      let module = await import(pathName);
    } catch (error) {
      console.log("importOptions: error importing options for " + siteName);
      console.log(error);
    }
  }

  areSiteOptionsRegistered = true;
}

export { registerSiteOptions };
