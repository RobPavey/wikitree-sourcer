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

// This handles access to the siteRegistry.
// Because the siteRegistry is created i the background context, but also accesed in the popup
// context we store it in extension local storage.

import { getSiteRegistry, setSiteRegistry } from "../../core/site_registry.mjs";

async function storeSiteRegistry() {
  let siteRegistry = getSiteRegistry();

  console.log("storeSiteRegistry: siteRegistry is:");
  console.log(siteRegistry);
  try {
    await chrome.storage.local.set({ siteRegistry: siteRegistry });
    console.log("storeSiteRegistry: stored siteData");
  } catch (error) {
    console.log("getSiteDataForSite: error storing siteRegistry");
    console.log(error);
  }
}

async function getSites() {
  let siteRegistry = getSiteRegistry();

  if (!siteRegistry) {
    //console.log("getSiteDataForSite: no siteRegistry found, trying local storage");
    let data = await chrome.storage.local.get("siteRegistry");
    siteRegistry = data.siteRegistry;

    //console.log("getSiteDataForSite: loaded siteRegistry is:");
    //console.log(siteRegistry);

    if (!siteRegistry) {
      return undefined;
    }

    setSiteRegistry(siteRegistry);
  }

  return siteRegistry;
}

async function getSiteDataForSite(siteName) {
  let sites = await getSites();

  if (!sites[siteName]) {
    console.log("getSiteDataForSite: no siteData found for site " + siteName);
    console.log("getSiteDataForSite: siteRegistry is:");
    console.log(sites);
  }

  return sites[siteName];
}

export { storeSiteRegistry, getSites, getSiteDataForSite };
