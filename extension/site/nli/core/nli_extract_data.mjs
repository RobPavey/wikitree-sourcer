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

function extractTitles(document, result) {
  const registerShowTitleNode = document.querySelector("#register_show_title");
  if (!registerShowTitleNode) {
    return false;
  }

  const parishTitleNode = registerShowTitleNode.querySelector("span.parish_title > a");
  if (!parishTitleNode) {
    return false;
  }
  result.parishTitle = parishTitleNode.textContent;

  const registerTitleNode = registerShowTitleNode.querySelector("span.register_title");
  if (!registerTitleNode) {
    return false;
  }
  let registerTitle = registerTitleNode.textContent;
  registerTitle = registerTitle.replace(/^\s*\|\s*/, "");
  result.registerTitle = registerTitle;
  return true;
}

function extractMetadata(document, result) {
  const registerMetadataNode = document.querySelector("#register_metadata");
  if (!registerMetadataNode) {
    return false;
  }

  const dioceseParishNode = registerMetadataNode.querySelector("div.register_info.diocese-parish");
  if (!dioceseParishNode) {
    return false;
  }
  let dioceseParishCounty = dioceseParishNode.textContent;
  if (dioceseParishCounty) {
    let pipeIndex = dioceseParishCounty.indexOf("|");
    if (pipeIndex != -1) {
      let dioceseParish = dioceseParishCounty.substring(0, pipeIndex).trim();
      let county = dioceseParishCounty.substring(pipeIndex + 1).trim();
      if (dioceseParish) {
        result.dioceseParish = dioceseParish;
      }
      if (county) {
        result.county = county;
      }
    } else {
      if (dioceseParishCounty) {
        result.dioceseParish = dioceseParishCounty;
      }
    }
  }

  const registerPages = registerMetadataNode.querySelector("div.register_info.register_pages");
  if (registerPages) {
    let pages = registerPages.textContent;
    if (pages) {
      result.registerPages = pages.trim();
    }
  }

  const registerEventRows = registerMetadataNode.querySelectorAll("div.register_events > div.row");
  if (registerEventRows && registerEventRows.length > 0) {
    result.registerEvents = [];
    for (let eventRow of registerEventRows) {
      let titleNode = eventRow.querySelector("div.register_event_title");
      let rangeNode = eventRow.querySelector("div.register_event_range");
      if (titleNode && rangeNode) {
        let title = titleNode.textContent.trim();
        let range = rangeNode.textContent.trim();
        if (title && range) {
          result.registerEvents.push({ title: title, range: range });
        }
      }
    }
  }

  return true;
}

function extractViewerInfo(document, result) {
  const infoNode = document.querySelector("#page_metadata_info");
  if (infoNode) {
    let info = infoNode.textContent;
    if (info) {
      result.pageInfo = info;
    }
  }

  return true;
}

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  if (!extractTitles(document, result)) {
    return result;
  }

  if (!extractMetadata(document, result)) {
    return result;
  }

  if (!extractViewerInfo(document, result)) {
    return result;
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
