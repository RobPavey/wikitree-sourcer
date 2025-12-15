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

import { registerSite } from "../../../base/core/site_registry.mjs";

const siteData = {
  repositoryName: "ECPP",
  usPhoneNumber: "",
  email: "",
  address:
    "University of California, Riverside and The Huntington Library, Art Museum, and Botanical Gardens, San Marino, California",
  baseUrl: "https://ecpp.ucr.edu/",
  note: "General Editor, Steven W. Hackel, Lead Compiler, Anne M. Reid. (The University of California, Riverside, and the Henry E. Huntington Library, San Marino, California, 2022.)",
};

function register() {
  registerSite("ecpp", siteData);
}

export { register };
