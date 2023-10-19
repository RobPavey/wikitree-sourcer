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

function extractDataForOldStylePage(document, main, url, result) {
  const contentAreaElement = main.querySelector("#ContentArea");
  if (!contentAreaElement) {
    return;
  }

  let paragraphs = contentAreaElement.querySelectorAll("div.col-md-6 > p");

  if (paragraphs.length) {
    // Old census records come through here
    let name = result.name;
    name = name.replace("Item:", "");
    name = name.replace(/\s+/g, " ").trim();
    result.name = name;

    result.recordData = {};

    for (let paragraph of paragraphs) {
      let innerHtml = paragraph.innerHTML;
      // example: "<strong>Surname: </strong>Cameron"
      if (innerHtml.includes("<strong>")) {
        const keyStartString = "<strong>";
        const keyEndString = "</strong>";
        let startIndex = innerHtml.indexOf(keyStartString);
        let endIndex = innerHtml.indexOf(keyEndString);
        if (startIndex != -1 && endIndex != -1 && startIndex < endIndex) {
          let key = innerHtml.substring(startIndex + keyStartString.length, endIndex).trim();
          let value = innerHtml.substring(endIndex + keyEndString.length).trim();
          if (key.endsWith(":")) {
            key = key.substring(0, key.length - 1);
          }
          //console.log("key: " + key + ", value: " + value);
          if (!value.includes("<br>")) {
            result.recordData[key] = value;
          }
        }
      }
    }
  } else {
    result.recordData = {};
    let rows = contentAreaElement.querySelectorAll("div.genapp_item_display_container");
    for (let row of rows) {
      let labelElement = row.querySelector(".genapp_item_display_label");
      let value = "";
      let valueElements = row.querySelectorAll("div.genapp_item_display_data > ul > li");
      if (valueElements.length) {
        for (let valueElement of valueElements) {
          let text = valueElement.textContent;
          if (text) {
            if (value) {
              value += ", ";
            }
            value += text.trim();
          }
        }
      } else {
        let valueElement = row.querySelector(".genapp_item_display_data");
        if (valueElement) {
          value = valueElement.textContent;
        }
      }
      if (value) {
        value = value.trim();
        let label = labelElement.textContent;
        if (label) {
          label = label.trim();
          if (label.endsWith(":")) {
            label = label.substring(0, label.length - 1);
          }
          if (!value.includes("<br>")) {
            result.recordData[label] = value;
          }
        }
      }
    }
  }

  if (Object.keys(result.recordData).length > 0) {
    result.isOldPageStyle = true;
    result.success = true;
  }
}

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

  result.name = nameElement.textContent.trim();

  const recordElement = main.querySelector("#record-display");
  if (!recordElement) {
    // It might be an old style page
    extractDataForOldStylePage(document, main, url, result);

    return result;
  }

  result.recordData = {};

  const rowElements = recordElement.querySelectorAll("div.CFCS-table-row-flex");
  for (let row of rowElements) {
    const labelElement = row.querySelector("div.CFCS-row-label");
    let valueElement = row.querySelector("div.CFCS-row-value");
    if (labelElement && valueElement) {
      let label = labelElement.textContent;
      let value = valueElement.textContent;

      if (label && value) {
        if (label.endsWith(":")) {
          label = label.substring(0, label.length - 1);
        }
        value = value.trim();

        if (valueElement.childElementCount > 0) {
          let tableCells = valueElement.querySelectorAll("div.CFCS-display-table-cell");
          let scriptNode = valueElement.querySelector("script");
          if (tableCells.length > 0) {
            // This happens on fonandcol record in the "Context of this Record" row
            value = "";
            for (let cell of tableCells) {
              if (cell.childElementCount == 2) {
                let title = cell.children[0].textContent;
                if (title) {
                  if (value) {
                    value += " / ";
                  }
                  value += title.trim();
                }
              }
            }
          } else if (scriptNode && label != "Container note(s)") {
            // This happens on fonandcol record in the "Finding aid no." row
            // There is nothing useful
            value = "";
            let containerElements = valueElement.querySelectorAll("div.CFCS-field-container");
            for (let element of containerElements) {
              let text = element.textContent.trim();
              text = text.replace(/\s+/g, " ");
              if (text) {
                if (value) {
                  value += ", ";
                }
                value += text;
              }
            }
          } else {
            // In case of "Container note(s)" row there is another level
            let containerElement = valueElement.querySelector("div.CFCS-field-container");
            if (containerElement) {
              valueElement = containerElement;
              let spanElement = valueElement.querySelector("span");
              if (spanElement) {
                valueElement = spanElement;
              }
            }

            // there is a element (as well as text) in this row value
            // It could be a link like in the "Help page:	" row. But it could also
            // be several text nodes separated by <br> elements.
            // First check if all the child elements are <br>s

            let brsFound = false;
            let nonBrsFound = false;
            for (let childElement of valueElement.children) {
              if (childElement.tagName == "BR") {
                brsFound = true;
              } else {
                nonBrsFound = true;
              }
            }

            if (brsFound && !nonBrsFound) {
              let innerHtml = valueElement.innerHTML;
              innerHtml = innerHtml.replace(/\s*<br>\s*/g, " & ");
              value = innerHtml.trim();
            }
          }
        }

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
