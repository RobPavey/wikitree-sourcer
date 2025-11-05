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

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  if (!url.match("/viewer/")) {
    return result;
  }

  const title = document.querySelector('h2[class="MuiTypography-root mirador32 MuiTypography-h2 MuiTypography-colorInherit MuiTypography-noWrap"]');
  result.title = title ? title.textContent.trim() : "";

  const pageDiv = document.querySelector('div[class*="mirador"]:not([class*="mirador-companion"]):not([class*="mirador-osd"]):not([class*="mirador-canvas"]):not([class*="mirador-window"])');
  const pageDivs = document.querySelectorAll('div');
  let page_number = null;
  for (let div of pageDivs) {
    if (div.textContent && div.textContent.match(/^Seite:\s*\d+$/)) {
      const match = div.textContent.match(/Seite:\s*(\d+)/);
      if (match) {
        page_number = match[1];
        break;
      }
    }
  }

  if (page_number != null) {
    result.page_number = page_number;
  }

  const image_input = document.querySelector('input[type="number"][id*="canvas-idx"]');
  if (image_input != null) {
    result.image_number = image_input.value.trim();
  }

  /*
  const entries = document.querySelectorAll("table > tbody > tr[class^=entrybmd_]");
  //console.log("entriesQuery size is: " + entriesQuery.length);
  if (entries.length < 1) {
    return result;
  }
  */

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
