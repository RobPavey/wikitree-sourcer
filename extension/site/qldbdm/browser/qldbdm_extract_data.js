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

function cleanKey(key) {
  if (key) {
    key = key.trim();
    if (key.endsWith(":")) {
      key = key.substring(0, key.length - 1).trim();
    }
  }
  return key;
}

function cleanValue(value) {
  if (value) {
    value = value.trim();
  }
  return value;
}

function extractData(document, url) {
  let result = { url: url, success: false };

  const items = document.querySelectorAll("#qg-primary-content div.form > ol > li");
  if (items.length < 1) {
    return result;
  }

  result.recordData = {};
  let isFirstItem = true;
  for (let item of items) {
    if (item.classList.contains("section")) {
      continue;
    }
    const columns = item.querySelectorAll("ul.questions > li");
    if (columns.length == 2) {
      const key = cleanKey(columns[0].textContent);
      const value = cleanValue(columns[1].textContent);
      if (isFirstItem) {
        result.recordData["Type"] = key;
        result.recordData["Name"] = value;
        isFirstItem = false;
      } else if (key) {
        result.recordData[key] = value;
      }
    } else if (columns.length == 4) {
      const key1 = cleanKey(columns[0].textContent);
      const value1 = cleanValue(columns[1].textContent);
      if (key1) {
        result.recordData[key1] = value1;
      }
      const key2 = cleanKey(columns[2].textContent);
      const value2 = cleanValue(columns[3].textContent);
      if (key2) {
        result.recordData[key2] = value2;
      }
    }
  }

  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
