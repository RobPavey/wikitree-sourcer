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

import "../../../site/all/core/register_site_data.mjs";
import { siteNames } from "../../../site/all/core/site_names.mjs";
import { getSiteDataForSite, storeSiteRegistry } from "../common/site_registry_storage.mjs";

async function registerContentScripts() {
  // including register_site_data.mhs above will have registered the site data in
  // a siteRegistry var in site_registry.mjs. But this is only in the background context.
  // To make it available to other contexts we put the site registry in local storage.
  await storeSiteRegistry();

  let commonPath = "base/browser/content/content_common.js";

  let scripts = [];

  for (const siteName of siteNames) {
    let siteData = await getSiteDataForSite(siteName);

    if (siteData) {
      let matches = siteData.matches;
      if (matches) {
        let id = siteName;
        let contentScriptPath = "site/" + id + "/browser/" + id + "_content.js";
        let js = [commonPath, contentScriptPath];
        let runAt = "document_idle";
        if (siteData.runAt) {
          runAt = siteData.runAt;
        }

        let script = { id: id, matches: matches, js: js, runAt };
        scripts.push(script);
      }
    }
  }

  console.log("registerContentScripts: about to call chrome.scripting.registerContentScripts, scripts is:");
  console.log(scripts);

  try {
    await chrome.scripting.registerContentScripts(scripts);
  } catch (error) {
    console.log("registerContentScripts: chrome.scripting.registerContentScripts, caught exception. error is:");
    console.log(error);
  }
}

export { registerContentScripts };
