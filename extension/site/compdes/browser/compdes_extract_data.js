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

// No imports or requires allowed. See docs/dev_notes/extract_data_design

let KEY_TRANSLATIONS = {
  "Page Number": "Seitenzahl",
  "Last name": "Nachname",
  "First name": "Vorname",
};

function extractData(document, url) {
  let result = { url: url, success: false };

  if (!url.match("/search/show/") && !url.match("/search/uuid/")) return result;

  const table = document.querySelector("table[class=\"table table-striped\"] > tbody");
  for (let element of table.children) {
    let key = element.children[0].textContent.trim();
    let value = element.children[1].textContent.trim();
    key = KEY_TRANSLATIONS[key] || key;

    if (key && value) {
      result[key] = value;
    }
  }

  const title = document.querySelector("#bodyContent > div:nth-child(1) > h1");
  result.title = title.textContent.trim();

  const uuid = document.querySelector("#entry-uuid");
  result.uuid = uuid.textContent.trim();

  if (result.uuid) {
    result.url = "https://des.genealogy.net/search/uuid/" + result.uuid;
  }

  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
