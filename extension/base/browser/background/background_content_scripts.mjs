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

// Note this could be defined in <site>_site_data
var siteDetails = [
  {
    id: "wikitree",
    matches: ["*://*.wikitree.com/*"],
  },
];

async function registerContentScripts() {
  let commonPath = "base/browser/content/content_common.js";

  let scripts = [];

  for (let site of siteDetails) {
    let id = site.id;
    let contentScriptPath = "site/" + id + "/browser/" + id + "_content.js";
    let js = [commonPath, contentScriptPath];
    let runAt = "document_idle";
    if (site.runAt) {
      runAt = site.runAt;
    }

    let script = { id: id, matches: site.matches, js: js, runAt };
    scripts.push(script);
  }
  //console.log("registerContentScripts: about to call chrome.scripting.registerContentScripts, scripts is:");
  //console.log(scripts);

  try {
    let result = await chrome.scripting.registerContentScripts(scripts);
    //console.log("registerContentScripts: result is:");
    //console.log(result);
  } catch (error) {
    console.log("registerContentScripts: chrome.scripting.registerContentScripts, caught exception. error is:");
    console.log(error);
  }
}

export { registerContentScripts };
