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

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  if (url.match("victims.auschwitz.org/victims/")) {
    result.values = {};
    const table = document.querySelector("div[id=\"tabela\"]");
    if (!table) return result;

    const nameElement = document.querySelector("div[class=\"hidden lg:block lg:text-xl lg:font-bold\"]");
    if (nameElement) {
      result.values["full name"] = nameElement.textContent.trim();
    }

    for (let element of table.querySelectorAll("p")) {
      let text = element.textContent.trim();
      if (!text) continue;

      if (text.match("Prisoner Number")) {
        result.values["prisoner number"] = text.replace("Prisoner Number", "").trim().split(";");
        continue;
      }

      let index = text.indexOf(":");
      if (index < 1) continue;
      let key = text.slice(0, index).trim().toLowerCase();
      let value = text.slice(index + 1).trim();
      if (!value) continue;

      result.values[key] = value;
    }

    result.success = true;
  }

  return result;
}

export { extractData };
