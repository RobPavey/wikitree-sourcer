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

  let titleElement = document.querySelector("[itemprop='name']");
  let locationElement = document.querySelector("[itemprop='locationCreated']");
  let dateElement = document.querySelector("[itemprop='dateCreated']");
  let pageNumberElement = document.querySelector("[itemprop='position']");

  if (titleElement && locationElement && dateElement && pageNumberElement) {

    result.newspaperTitle = titleElement.innerHTML;
    result.location = locationElement.innerHTML;
    result.publicationDate = dateElement.innerHTML.split(",")[0];
    result.pageNumber = pageNumberElement.innerHTML.split(" ")[1];

    result.success = true;
  }

  //console.log(result);

  return result;
}

export { extractData };
