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

// No imports or requires allowed. See docs/dev_notes/extract_data_design

function extractData(document, url) {
  let result = { url: url, success: false };

  const rows = document.querySelectorAll(".detailed-result-row");
  if (rows.length < 1) {
    return result;
  }

  function getText(element) {
    let clone = element.cloneNode(true);
    for (let child of clone.querySelectorAll("a, svg, script, style")) {
      child.remove();
    }
    return clone.textContent.replace(/\s+/g, " ").trim();
  }

  // The details are a list of label/value rows, the label depends on the type of record
  let fields = {};
  let prdhIndividualIds = {};
  for (let row of rows) {
    let labelElement = row.querySelector(".detailed-result-row-left");
    let valueElement = row.querySelector(".detailed-result-row-right");
    if (!labelElement || !valueElement) {
      continue;
    }
    let label = getText(labelElement);
    let value = getText(valueElement);
    if (label && value) {
      fields[label] = value;
    }

    let prdhLink = valueElement.querySelector("a[href*='prdh-igd.com']");
    if (label && prdhLink) {
      let match = prdhLink.getAttribute("href").match(/\/Individu\/(\d+)/i);
      if (match) {
        prdhIndividualIds[label] = match[1];
      }
    }
  }
  result.fields = fields;
  if (Object.keys(prdhIndividualIds).length > 0) {
    result.prdhIndividualIds = prdhIndividualIds;
  }

  let canonicalElement = document.querySelector("link[rel='canonical']");
  if (canonicalElement && canonicalElement.getAttribute("href")) {
    result.url = canonicalElement.getAttribute("href");
  }

  let headingElement = document.querySelector(".details-page-header h1");
  if (headingElement) {
    result.heading = getText(headingElement);
  }

  // e.g. "Death, LaFrance"
  let indexElement = document.querySelector("[id$='indexHeader']");
  if (indexElement) {
    result.indexHeader = getText(indexElement);
  }

  let sourceElement = document.querySelector(".source-texte-bottom, [id$='sourceTexteBottom']");
  if (sourceElement) {
    let lines = sourceElement.innerHTML.split(/<br\s*\/?>/i).map((line) => line.replace(/<[^>]*>/g, "").trim());
    let index = lines.findIndex((line) => line == "Original source");
    if (index != -1 && lines[index + 1]) {
      result.originalSource = lines[index + 1];
    }
  }

  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
