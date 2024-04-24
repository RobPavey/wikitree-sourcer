/*
MIT License

Copyright (c) 2024 Robert M Pavey

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

  let mainContent = document.querySelector("div.main-content");
  if (!mainContent) {
    return result;
  }

  let titleSpan = mainContent.querySelector("h2.result-details-title > span");
  if (titleSpan) {
    let title = titleSpan.textContent.trim();
    if (title) {
      result.title = title;
    }
  }

  let recordDetails = mainContent.querySelector("record-details");
  if (!recordDetails) {
    return result;
  }

  const rows = recordDetails.querySelectorAll("div.row div.row");
  //console.log("rows size is: " + rows.length);
  if (rows.length < 1) {
    return result;
  }

  result.recordData = {};

  for (let row of rows) {
    let fields = row.querySelectorAll("div.col-sm-6");
    if (fields.length == 2) {
      let keySpan = fields[0].querySelector("span");
      let valueNode = fields[1].querySelector("b");
      if (keySpan && valueNode) {
        let key = keySpan.textContent.trim();
        let value = valueNode.textContent.trim();

        if (key.endsWith(":")) {
          key = key.substring(0, key.length - 1).trim();
        }

        result.recordData[key] = value;
      }
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
