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
import { GeneralizedData } from "../../extension/base/core/generalize_data_utils.mjs";
import { readNbDate } from "../../extension/site/nb/core/nb_dates.mjs";

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
  const pageIndex = kind === "book" ? 1 : 0;
  const url = "https://www.nb.no/items/" + item.id + "?page=" + pageIndex;
  const selection = extract(fs.readFileSync(directory + "saved_pages/" + kind + ".html", "utf8"), url);
  return normalizeMetadata(selection, item, fixture(kind + "_manifest"));
}
function personCitation(name = "Anna Hansen", date = "3 May 1920", type = "Death", source = "Source A") {
  const gd = new GeneralizedData();
  gd.hasValidData = true;
  gd.sourceOfData = "test";
  gd.sourceType = "record";
  gd.recordType = type;
  gd.setFullName(name);
  if (type === "Burial") gd.eventDate = readNbDate(date);
  else if (date) gd.deathDate = readNbDate(date);
  return {
    url: "https://example.org/" + encodeURIComponent(source),
    sourceTitle: source,
    sourceReference: name,
    generalizedData: JSON.parse(JSON.stringify(gd)),
  };
}
export { fixture, record, extract, personCitation };
