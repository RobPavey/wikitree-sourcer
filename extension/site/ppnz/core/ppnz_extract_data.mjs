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

  const citationElement = document.querySelector("#researcher-tools-tab > p.citation");
  if (citationElement) {
    const text = citationElement.textContent;
    if (text) {
      result.citationText = text.trim();
    }
  } else {
    return result;
  }

  const crumbElements = document.querySelectorAll("#breadcrumbs > li.breadcrumbs__crumb > a");
  // usually the 3rd crumb is the date. e.g.:
  // Newspapers > Press > 11 September 1953 > Page 10 > This article
  // Let's assume that is universal for now
  if (crumbElements.length >= 3) {
    const type = crumbElements[0].textContent;
    if (type != "Newspapers") {
      return result;
    }

    const paperTitleElement = crumbElements[1];
    if (paperTitleElement.textContent) {
      result.paperTitle = paperTitleElement.textContent.trim();
    }

    const dateElement = crumbElements[2];
    if (dateElement.textContent) {
      result.issueDate = dateElement.textContent.trim();
    }
  } else {
    return result;
  }

  const articleTextElements = document.querySelectorAll("#text-tab > div[itemprop='articleBody'] > p");
  if (articleTextElements.length > 0) {
    let articleText = "";
    for (let para of articleTextElements) {
      if (para.textContent) {
        if (articleText) {
          articleText += "\n";
        }
        articleText += para.textContent.trim();
      }
    }
    result.articleText = articleText;
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
