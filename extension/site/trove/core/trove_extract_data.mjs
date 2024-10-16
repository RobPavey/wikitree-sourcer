/*
MIT License

Copyright (c) 2022 Robert M Pavey

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

  function getMetaContent(property, fieldName) {
    const element = document.querySelector(`meta[property="${property}"]`);
    if (element) {
      result[fieldName] = element.getAttribute("content");
    }
  }

  function getBreadcrumb(refName, fieldName) {
    const element = document.querySelector(`#breadcrumb-c a.quicknavlink[ref="${refName}"]`);
    if (element && element.textContent) {
      result[fieldName] = element.textContent.trim();
    }
  }

  getMetaContent("og:url", "ogUrl");
  getMetaContent("og:title", "ogTitle");
  getMetaContent("og:type", "ogType");
  getMetaContent("og:description", "ogDescription");
  getMetaContent("og:image", "ogImage");
  getMetaContent("og:site_name", "ogSiteName");

  getBreadcrumb("ndp:issueSelector", "issue");
  getBreadcrumb("ndp:titleSelector", "title");
  getBreadcrumb("ndp:pageSelector", "page");
  getBreadcrumb("ndp:articleSelector", "article");

  if (!result.title || !result.article) {
    return result; // not a valid aticle page
  }

  const titleLinkElement = document.querySelector("#breadcrumb-c div.quicknav-title > a");
  if (titleLinkElement) {
    result.titleLink = titleLinkElement.href;
  }

  const fullTextLineElements = document.querySelectorAll("#fulltextContents div.line > div.read");
  if (fullTextLineElements) {
    let fullTextLines = [];
    for (let lineElement of fullTextLineElements) {
      let line = lineElement.textContent;
      if (line) {
        line = line.trim();
        fullTextLines.push(line);
      }
    }
    if (fullTextLines.length > 0) {
      result.fullTextLines = fullTextLines;
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
