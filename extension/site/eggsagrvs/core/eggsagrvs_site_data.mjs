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

import { registerSite } from "../../../base/core/site_registry.mjs";

const siteData = {
  siteName: "eggsagrvs",
  // Only the graves sub-domains ("*.x" also matches "x" and "www.x"). Do NOT use *://*.eggsa.org/* as that also matches www.eggsa.org,
  // which is the eggsabdm site, and both content scripts would then be injected.
  matches: [
    "*://*.graves.eggsa.org/*",
    "*://*.graveseastcape.eggsa.org/*",
    "*://*.gravesfreestate.eggsa.org/*",
    "*://*.gravesgauteng.eggsa.org/*",
    "*://*.natalgraves.eggsa.org/*",
    "*://*.graveslimpopo.eggsa.org/*",
    "*://*.gravesmpumalanga.eggsa.org/*",
    "*://*.gravesnortherncape.eggsa.org/*",
    "*://*.gravesnorthwest.eggsa.org/*",
    "*://*.graveswcape.eggsa.org/*",
    "*://*.gravesworld.eggsa.org/*",
  ],
  runAt: "document_end",
  repositoryName: "eGGSA Graves",
  usPhoneNumber: "",
  email: "",
  address: "",
  baseUrl: "",
};

function register() {
  registerSite(siteData);
}

register();
