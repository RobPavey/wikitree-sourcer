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

function cleanText(inputText) {
  let text = inputText;
  if (text) {
    text = text.trim();
    text = text.replace(/\s+/g, " ");
    text = text.replace(/\s([,;.])/g, "$1");
  }
  return text;
}

function extractData(document, url) {
  var result = {};
  result.url = url;

  result.success = false;

  let sourceList = [];
  document
    .querySelector("#browse-information")
    .firstChild.querySelectorAll("a")
    .forEach((link) => sourceList.push(link.innerHTML));
  //there are three links in this div, but the last one just says "page" so i'm replacing it here with the actual page number
  sourceList[2] = document.querySelector("#pageNum").placeholder;
  sourceList[3] = document
    .querySelector("#paper-title")
    .innerHTML.split("·")[3]
    .trim()
    .replace("(", "")
    .replace(")", "");

  result.newspaperTitle = sourceList[0];
  result.publicationDate = sourceList[1];
  result.pageNumber = sourceList[2];
  result.location = sourceList[3];

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
