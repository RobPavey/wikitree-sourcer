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

  const repository = document.querySelector("meta[name='description']");
  if (repository) {
    result.repository = repository.content;
  }

  let bureauPlace = "";
  const rattachement = document.querySelector("ul[class='rattachement']");
  if (rattachement) {
    const rattachementAnchors = rattachement.querySelectorAll("a");
    for (let rattachementAnchor of rattachementAnchors) {
      if (
        rattachementAnchor.href &&
        rattachementAnchor.href.includes("detail-document") &&
        rattachementAnchor.title &&
        rattachementAnchor.title.includes("Bureau")
      ) {
        bureauPlace = rattachementAnchor.textContent;
      }
    }
  }
  if (bureauPlace != "") {
    result.bureauPlace = bureauPlace;
  }

  const sourceReference = document.querySelector("h1[class='titre_rubrique no-print']");
  if (sourceReference) {
    const tempSourceReference = sourceReference.textContent.replace(/(\r\n|\n|\r)/gm, "").trim();
    result.sourceReference = tempSourceReference.replace(/\s+/g, " ");
    // result.sourceReference = sourceReference.textContent.replace(/(\r\n|\n|\r)/gm, "").trim();
  }

  const imageNo = document.querySelector("div[class='pagination-min']");
  if (imageNo) {
    result.imageNo = imageNo.textContent;
  }

  const imageMax = document.querySelector("div[class='pagination-max']");
  if (imageMax) {
    result.imageMax = imageMax.textContent;
  }

  result.success = true;

  // console.log(result);

  return result;
}

export { extractData };
