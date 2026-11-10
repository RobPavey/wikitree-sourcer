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

// Lightweight content script: public DOM and URL only, never private application state.
function extractData(document, url) {
  const result = { url: url, success: false };
  let address;
  try {
    address = new URL(url);
  } catch {
    return result;
  }
  const match = /^\/items\/([a-f0-9]{32})\/?$/i.exec(address.pathname);
  if (!/^https?:$/.test(address.protocol) || !/^(www\.)?nb\.no$/i.test(address.hostname) || !match) {
    result.overrideFailureMessage = "Open an individual newspaper or book in NB's viewer to build a citation.";
    return result;
  }
  const page = address.searchParams.get("page");
  if (page !== null && !/^\d+$/.test(page)) {
    result.overrideFailureMessage = "The NB viewer page number is not valid.";
    return result;
  }
  result.itemId = match[1].toLowerCase();
  result.pageIndex = page === null ? 0 : Number(page);
  if (!Number.isSafeInteger(result.pageIndex)) return result;
  result.url = "https://www.nb.no/items/" + result.itemId + "?page=" + result.pageIndex;
  result.viewerRange = "";
  if (document) {
    for (const button of document.querySelectorAll("button")) {
      const text = button.textContent.replace(/\s/g, "");
      const range = /^(\d+)(?:[-–](\d+))?\/(\d+)$/.exec(text);
      if (range && Number(range[1]) === result.pageIndex + 1) {
        result.viewerRange = range[1] + (range[2] ? "-" + range[2] : "");
        break;
      }
    }
  }
  result.success = true;
  return result;
}
