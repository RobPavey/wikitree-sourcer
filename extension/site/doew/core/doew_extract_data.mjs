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

const keyTranslation = {
  "vorname": "first name",
  "nachname": "last name",
  "geburtstag": "date of birth",
  "geburtsort": "place of birth",
  "todestag": "date of death",
  "todesort": "place of death",
}

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  if (url.match("www.doew.at/result")) {
    result.success = true;
    result.fields = {};
    for (let element of document.querySelectorAll("div .frow")) {
      let key = element.textContent.replace(":", "").trim().toLowerCase();
      const value = element.nextElementSibling.textContent.trim();

      if (keyTranslation[key]) {
        key = keyTranslation[key];
      }

      result.fields[key] = value;
    }

    if (url.match("id=")) {
      result.permalink = url;
    }
  }

  return result;
}

export { extractData };
