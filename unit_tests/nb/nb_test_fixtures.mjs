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

import fs from "node:fs";
import vm from "node:vm";
import { JSDOM } from "jsdom";
import { normalizeMetadata } from "../../extension/site/nb/core/nb_metadata.mjs";

const directory = "unit_tests/nb/";
const fixture = (name) => JSON.parse(fs.readFileSync(directory + "saved_fetch_objects/" + name + ".json", "utf8"));
const scriptContext = vm.createContext({ URL });
vm.runInContext(fs.readFileSync("extension/site/nb/browser/nb_extract_data.js", "utf8"), scriptContext);
function extract(html, url) {
  const dom = new JSDOM(html);
  try {
    return JSON.parse(JSON.stringify(scriptContext.extractData(dom.window.document, url)));
  } finally {
    dom.window.close();
  }
}
function record(kind = "newspaper") {
  const item = fixture(kind + "_item");
  const pageIndex = { book: 1, urn_newspaper: 1, urn_book: 585 }[kind] || 0;
  const url = "https://www.nb.no/items/" + item.id + "?page=" + pageIndex;
  const selection = extract(fs.readFileSync(directory + "saved_pages/" + kind + ".html", "utf8"), url);
  return normalizeMetadata(selection, item, fixture(kind + "_manifest"));
}
export { fixture, record, extract };
