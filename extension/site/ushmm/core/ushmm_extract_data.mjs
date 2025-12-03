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

  if (url.match("www.ushmm.org/online/hsv/person_view.php")) {
    const main = document.querySelector(".main");
    result.name = main.querySelector('h1')?.textContent.trim();

    let fields = {};

    for (const comp of main.children) {
      if (comp.tagName != "DIV") continue;

      const elements = comp.querySelectorAll("div");
      if (elements.length != 2) continue;

      let key = elements[0].textContent.trim();
      if (key[key.length-1] == ":") {
        key = key.substring(0, key.length-1).trim();
      }
      fields[key] = elements[1].textContent.trim();
    }

    result.fields = fields;

    result.success = true;
  }

  /*
  const entries = document.querySelectorAll("table > tbody > tr[class^=entrybmd_]");
  //console.log("entriesQuery size is: " + entriesQuery.length);
  if (entries.length < 1) {
    return result;
  }
  */

  //console.log(result);

  return result;
}

export { extractData };
