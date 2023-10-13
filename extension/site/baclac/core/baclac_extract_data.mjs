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

  const main = document.querySelector("main");
  if (!main) {
    return result;
  }

  const nameElement = main.querySelector("h1[property='name']");
  if (!nameElement) {
    return result;
  }

  result.name = nameElement.textContent;

  const recordElement = main.querySelector("#record-display");
  if (!recordElement) {
    return result;
  }

  result.recordData = {};

  const rowElements = recordElement.querySelectorAll("div.CFCS-table-row-flex");
  for (let row of rowElements) {
    const labelElement = row.querySelector("div.CFCS-row-label");
    const valueElement = row.querySelector("div.CFCS-row-value");
    if (labelElement && valueElement) {
      let label = labelElement.textContent;
      let value = valueElement.textContent;

      if (label && value) {
        if (label.endsWith(":")) {
          label = label.substring(0, label.length - 1);
        }
        value = value.trim();
        result.recordData[label] = value;
      }
    }
  }

  result.success = true;

  // attempt to get permalink
  let permalinkElement = main.querySelector("a[href='#link-to-this-rec']");
  if (permalinkElement) {
    let onclick = permalinkElement.getAttribute("onclick");
    if (onclick) {
      // Example:
      //  $('#jq-rec-url').val('http://central.bac-lac.gc.ca/.redirect?app=census&id=42663312&lang=eng'); AdjustPopupCss();
      let link = onclick.replace(/^.*\.val\(\'([^\']+)\'\).*$/, "$1");
      if (link && link != onclick) {
        result.permalink = link;
      }
    }
  }

  //console.log(result);

  return result;
}

export { extractData };
