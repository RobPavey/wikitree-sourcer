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

  let lang = document.documentElement.lang;

  // URL for a record maybe something like:
  // https://www.openarch.nl/frl:ddbcbbb4-6c3a-4fca-a222-505a70ac75bf
  // or
  // https://www.openarch.nl/frl:ddbcbbb4-6c3a-4fca-a222-505a70ac75bf/nl
  // where the language part on end may be en, nl, de or fr

  if (!/^https\:\/\/www\.openarch\.nl\/frl\:[a-z0-9\-]+\/?(?:\w\w)?$/.test(url)) {
    return result;
  }

  // remove any language part from the URL
  url = url.replace(/^(https\:\/\/www\.openarch\.nl\/frl\:[a-z0-9\-]+)\/?(?:\w\w)?$/, "$1");
  result.url = url;

  result.lang = lang;

  const pageHeader = document.querySelector("h1.page-header");
  if (!pageHeader) {
    return result;
  }

  const pageHeaderText = pageHeader.textContent;
  if (pageHeaderText) {
    result.pageHeader = pageHeaderText;
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

function extractDataFromFetch(document, url, dataObjects, options) {
  let result = {};

  let dataObj = dataObjects.dataObj;

  if (url) {
    result.url = url;
  } else if (document) {
    result.url = document.URL;
  }

  if (document) {
    const citationParagraph = document.querySelector("div.container > div.row > div.col-md-8 > h3 ~ p");
    if (citationParagraph) {
      result.citationText = citationParagraph.textContent;
      result.citationParts = [];
      for (const child of citationParagraph.childNodes) {
        let part = {};
        part.type = child.nodeType;
        part.tag = child.tagName;
        if (part.tag && part.tag.toLowerCase() == "a") {
          part.href = child.getAttribute("href");
        }
        part.text = child.textContent;
        result.citationParts.push(part);
      }
    }
  }

  result.dataObj = dataObj;
  result.success = true;

  //console.log("extractDataFromFetch result is:");
  //console.log(result);

  return result;
}

export { extractDataFromFetch };
