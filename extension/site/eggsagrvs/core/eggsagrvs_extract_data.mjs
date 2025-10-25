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

function extractData(document, url, siteSpecificInput) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  const peopleH2 = document.querySelector("#object-title h2");
  if (!peopleH2) {
    return result;
  }
  result.peopleStr = peopleH2.textContent;
  result.topHeading = document.querySelector("#header h1")?.textContent || "";
  const breadcrumb = document.querySelector("#breadcrumb")?.textContent || "";
  // clean up the breadcrumb:
  // - skip newlines and tabs and extract text before any image position in parentheses
  const match = breadcrumb.match(/^[\n\t]*([^\n\t]+)[\n\t]*(\([^)]+\))?/);
  if (match) {
    // remove any trailing spaces and slash and extract image position if present
    result.breadcrumb = match[1].replace(/\s*\/\s*$/, "");
    result.imagePos = match[2] ? match[2] : null;
  } else {
    result.breadcrumb = null;
    result.imagePos = null;
  }
  // Some pages have names and dates in the subsequent #object-desc div
  const objDesc = document.querySelector("#object-desc");
  if (objDesc) {
    const text = objDesc.textContent;
    if (/[\d?]{0,4}[- ][\d?]{0,4}/.test(text)) {
      result.morePeopleStr = text;
    }
  }

  result.success = true;

  // console.log("extractData", result);

  return result;
}

export { extractData };
