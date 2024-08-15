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

// The site registry stores data about each site.
// This avoids storing this info in the generalized data when it is the same
// for any citation or saved person data for this site.
// In the generalizedData objest there is a sourceOfData field which is the siteName
// This registry allows you to call getSiteDataForSite with the siteName and
// get more info about the site. This was initially added so that we can create
// a repository on Ancestry and fill out the fields in the form.

import { registerSiteData } from "../../site/all/core/register_site_data.mjs";

var siteRegistry = {};

var areSitesRegistered = false;

function registerSite(siteName, siteData) {
  //console.log("registerSite: siteData is:");
  //console.log(siteData);

  siteRegistry[siteName] = siteData;
}

async function getSiteDataForSite(siteName) {
  await registerSiteData();

  areSitesRegistered = true;

  //console.log("getSiteDataForSite: siteRegistry is:");
  //console.log(siteRegistry);

  return siteRegistry[siteName];
}

export { registerSite, getSiteDataForSite };
