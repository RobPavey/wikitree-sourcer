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

  const resultListDiv = document.querySelector("#resultlist");
  if (!resultListDiv) {
    return result;
  }

  const hitRow = document.querySelector("article.hitRow");
  if (!hitRow) {
    return result;
  }

  let titleElement = hitRow.querySelector("div.post_header > h1.post_title");
  if (titleElement) {
    result.recordTitle = titleElement.textContent.trim();
  }
  let typeElement = hitRow.querySelector("div.post_header > div.post_type");
  if (typeElement) {
    result.recordType = typeElement.textContent.trim();
  }

  let rows = hitRow.querySelectorAll("div.post_middle div.row-fluid.hidden-print");

  if (rows.length) {
    result.recordData = {};
    let lastLabel = "";
    let lastValueObj = null;

    for (let row of rows) {
      let labelElement = row.querySelector("div.post_ledtext");
      let valueElement = row.querySelector("div.post_faltdata");

      if (labelElement && valueElement) {
        let label = labelElement.textContent.trim();
        let value = valueElement.textContent.trim();

        if (value) {
          let valueObj = {};
          valueObj.text = value;

          // italic part on end?
          let italicElement = valueElement.querySelector("i");
          if (italicElement) {
            let italicText = italicElement.textContent.trim();
            if (value.endsWith(italicText)) {
              value = value.substring(0, value.length - italicText.length).trim();
              if (value.endsWith(",")) {
                value = value.substring(0, value.length - 1).trim();
              }
              valueObj.text = value;
              valueObj.italicEndText = italicText;
            }
          }

          let linkElement = valueElement.querySelector("a");
          if (linkElement) {
            valueObj.link = linkElement.getAttribute("href");
          }

          if (!label) {
            if (lastValueObj && lastLabel) {
              if (!lastValueObj.multipleValues) {
                let newValueObj = {};
                newValueObj.multipleValues = [lastValueObj];
                lastValueObj = newValueObj;
              }
              lastValueObj.multipleValues.push(valueObj);
              result.recordData[lastLabel] = lastValueObj;
            }
          } else {
            // the value can start with the label again (the "visible-phone" part)
            if (value.startsWith(label)) {
              value = value.substring(label.length);
              valueObj.text = value.trim();
            }
            if (result.recordData[label]) {
              // duplicate label. This sometime happens. See Namn in
              // https://sok.riksarkivet.se/?Sokord=Anders+andersen&page=10&postid=Sjoman_liggare_200626&tab=post#tab
              // In that case it is the name of the ship, but we don't want to work out the semantics here.
              valueObj.originalLabel = label;
              let suffix = 1;
              let newLabel = label + suffix;
              while (result.recordData[newLabel]) {
                suffix++;
                newLabel = label + suffix;
              }
              label = newLabel;
            }
            result.recordData[label] = valueObj;

            lastValueObj = valueObj;
            lastLabel = label;
          }
        }
      }
    }
  }

  // image
  let imageLinkElement = hitRow.querySelector("div.post_faltButton > a.link-image");
  if (imageLinkElement) {
    result.imageLink = imageLinkElement.getAttribute("href");
  }

  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
