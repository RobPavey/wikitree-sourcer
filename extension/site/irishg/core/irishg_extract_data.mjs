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
  //console.log("extractData for irishg");

  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  let dataArea = document.querySelector("#right");
  if (!dataArea) {
    return result;
  }

  let dataTables = dataArea.querySelectorAll("table > tbody");
  if (!dataTables || dataTables.length < 1) {
    return result;
  }

  result.recordData = {};

  for (let table of dataTables) {
    let dataRows = table.querySelectorAll("tr");
    if (!dataRows || dataRows.length < 1) {
      return result;
    }

    // there can be two different types of table:
    // 1. Rows where each row is label and value
    // 2. A table with two rows where headings are labels and td's on 2nd row are values

    let isSimpleTable = true;
    let numRows = dataRows.length;
    if (numRows == 2) {
      let thsOnRow0 = dataRows[0].querySelectorAll("th");
      let tdsOnRow0 = dataRows[0].querySelectorAll("td");
      if (thsOnRow0.length > 1 && tdsOnRow0.length == 0) {
        isSimpleTable = false;
      }
    }

    if (isSimpleTable) {
      let partyPrefix = "";
      for (let row of dataRows) {
        let labelNode = row.querySelector("th");
        let valueNodes = row.querySelectorAll("td");
        if (labelNode && valueNodes.length > 0) {
          if (labelNode.textContent) {
            // has a label
            let label = labelNode.textContent.trim();
            let value = valueNodes[0].textContent.trim();
            if (label && value) {
              label = label.replace(/\s+/g, " ");
              value = value.replace(/\s+/g, " ");
              if (partyPrefix && valueNodes.length == 1) {
                label = partyPrefix + " " + label;
              }
              result.recordData[label] = value;

              if (valueNodes.length == 2) {
                // this can happen in a church marriage where there is a column for each person
                if (!result.spouseRecordData) {
                  result.spouseRecordData = {};
                }
                let spouseValue = valueNodes[1].textContent.trim();
                if (spouseValue) {
                  spouseValue = spouseValue.replace(/\s+/g, " ");
                  result.spouseRecordData[label] = spouseValue;
                }
              }
            }
          } else {
            // could be an image link
            let linkNode = valueNodes[0].querySelector("a");
            if (linkNode && linkNode.textContent == "Image") {
              let link = linkNode.getAttribute("href");
              if (link) {
                result.imageHref = link;
              }
            }
          }
        } else if (labelNode) {
          let label = labelNode.textContent;
          if (label && label.startsWith("Party") && row.classList.contains("even")) {
            // this means that the following rows apply to party 1 or 2
            partyPrefix = label;
          } else {
            partyPrefix = "";
          }
        }
      }
    } else {
      let thsOnRow0 = dataRows[0].querySelectorAll("th");
      let tdsOnRow1 = dataRows[1].querySelectorAll("td");
      if (thsOnRow0.length > 1 && thsOnRow0.length == tdsOnRow1.length) {
        // we know there are two rows and the ths on 1st have same count as the tds on 2nd

        result.refData = {};
        for (let index = 0; index < thsOnRow0.length; index++) {
          let labelNode = thsOnRow0[index];
          let valueNode = tdsOnRow1[index];
          if (labelNode && valueNode) {
            if (labelNode.textContent) {
              // has a label
              let label = labelNode.textContent.trim();
              let value = valueNode.textContent.trim();
              if (label && value) {
                label = label.replace(/\s+/g, " ");
                value = value.replace(/\s+/g, " ");
                result.refData[label] = value;
              }
            }
          }
        }
      }
    }
  }

  // if we did not find an image href in a table try looking for a paragraph with text starting with
  // "View the "
  if (!result.imageHref) {
    let links = dataArea.querySelectorAll("div.content > p > a");
    for (let link of links) {
      let text = link.textContent;
      if (text && text.startsWith("View the ")) {
        let href = link.getAttribute("href");
        if (href) {
          result.imageHref = href;
        }
      }
    }
  }

  // Also extract from the banner, we may need this to determine the event type
  let bannerArea = document.querySelector("#banner");
  if (!bannerArea) {
    return result;
  }

  let paragraphs = bannerArea.querySelectorAll("p");
  for (let paragraph of paragraphs) {
    // check if it is a link
    let linkNode = paragraph.querySelector("a");
    if (!linkNode) {
      let text = paragraph.textContent;
      if (text) {
        text = text.replace(/\s+/g, " ").trim();
        if (text) {
          result.eventText = text;
        }
      }
    }
  }

  let heading = bannerArea.querySelector("h1");
  if (heading) {
    let text = heading.textContent;
    if (text) {
      text = text.replace(/\s+/g, " ").trim();
      if (text) {
        result.headingText = text;
      }
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
