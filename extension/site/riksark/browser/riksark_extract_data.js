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

function extractRecord(document, url, result) {
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

  result.pageType = "record";
  result.success = true;
  return result;
}

function extractImage(document, url, result) {
  const imageTitleElement = document.querySelector("div.mainPanel > div.centerPanel > h1.title");
  if (!imageTitleElement) {
    return result;
  }

  const imageContentElement = document.querySelector("#content > div.viewer");
  if (!imageContentElement) {
    return result;
  }

  result.pageType = "image";

  let title = imageTitleElement.textContent.trim();
  if (title) {
    result.imageTitle = title;
    // the title is fairly freeform. e.g:
    // Folkräkning 1880 - Hällestads församling, Älvsborgs län
    // Gotlands norra häradsrätts arkiv (-1899), Bouppteckningar, "lösa serien", SE/ViLA/20056/F 2 A/9 (1735-1737)
    // Helsingborgs stadsförsamlings (Maria) kyrkoarkiv, Födelse- och dopböcker, SE/LLA/13171/C I/15 (1887-1889)

    // first check for am archive reference code.
    const archiveCodeIndex = title.search(/SE\/[A-Z]{3}\/\d/);
    if (archiveCodeIndex != -1) {
      result.imageType = "archive";
      let part1 = title.substring(0, archiveCodeIndex).trim();
      let part2 = title.substring(archiveCodeIndex).trim();
      if (part1) {
        const commaIndex = part1.indexOf(",");
        if (commaIndex !== -1) {
          result.imageArchiveName = part1
            .substring(0, commaIndex)
            .replace(/\s*,\s*$/, "")
            .trim();
          result.imageCollectionName = part1
            .substring(commaIndex + 1)
            .replace(/\s*,\s*$/, "")
            .trim();
        } else {
          // Fallback if there's no comma at all
          result.imageCollectionName = part1.trim();
        }
      }
      if (part2) {
        // Capture Group 1: The archive code (e.g., SE/LLA/13171/C I/15)
        // Capture Group 2: The date range including parentheses (e.g., (1887-1889))
        const match = part2.match(/^(SE\/[A-Z]{3}\/[\dA-Za-z \/]+?)\s*(\([\d\-]+\))?$/);

        if (match) {
          let archiveCode = match[1] ? match[1].trim() : "";
          let dateRange = match[2] ? match[2].trim() : "";

          result.imageArchiveCode = archiveCode;
          result.imageDateRange = dateRange; // if you want to store the dates too
        }
      }
    } else {
      result.imageType = "dataset";
      const hyphenIndex = title.indexOf("-");
      if (hyphenIndex !== -1) {
        result.imageDatasetName = title.substring(0, hyphenIndex).trim();
        result.imageLocation = title.substring(hyphenIndex + 1).trim();
      } else {
        // Fallback if there's no hyphen at all
        result.imageLocation = title.trim();
      }
    }
  }

  const imageSelect = document.querySelector("select.image-selectionbox");
  if (imageSelect) {
    const selectedText = imageSelect.selectedOptions[0].text;
    result.imageNumber = selectedText;
  }

  function getItemData(result, key, classNames) {
    let itemElement = null;
    for (let className of classNames) {
      itemElement = document.querySelector(`div.item.${className}`);
    }
    if (itemElement) {
      const valueElement = itemElement.querySelector("div.value");
      if (valueElement) {
        result[key] = valueElement.textContent.trim();
      }
    }
  }

  getItemData(result, "imageId", ["_image-_i_d", "_bildid"]);

  result.success = true;
  return result;
}

function extractData(document, url) {
  let result = { url: url, success: false };

  const resultListDiv = document.querySelector("#resultlist");
  if (resultListDiv) {
    return extractRecord(document, url, result);
  }

  const imageTitleElement = document.querySelector("div.mainPanel > div.centerPanel > h1.title");
  const imageContentElement = document.querySelector("#content > div.viewer");
  if (imageTitleElement && imageContentElement) {
    return extractImage(document, url, result);
  }

  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
