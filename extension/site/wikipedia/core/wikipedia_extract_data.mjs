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

  /*
  const entries = document.querySelectorAll("table > tbody > tr[class^=entrybmd_]");
  //console.log("entriesQuery size is: " + entriesQuery.length);
  if (entries.length < 1) {
    return result;
  }
  */

  const firstHeading = document.querySelector("#firstHeading");
  if (!firstHeading) {
    return result;
  }

  const firstHeadingSpan = firstHeading.querySelector("#firstHeading > span");
  if (firstHeadingSpan) {
    let heading = firstHeadingSpan.textContent;
    if (heading) {
      result.title = heading.trim();
    }
  } else {
    const firstHeading = document.querySelector("#firstHeading");
    if (!firstHeading) {
      return result;
    }

    let heading = firstHeading.textContent;
    if (heading) {
      result.title = heading.trim();
    }
  }

  const permalinkElement = document.querySelector("#t-permalink > a");
  if (permalinkElement) {
    // Use href property rather than getAttribute("href") to ensure an absolute URL
    let href = permalinkElement.href;
    if (href) {
      result.permalink = href.trim();
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
