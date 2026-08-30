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

const KEY_TRANSFORMS = {
  "Bestand": "collection",
  "Datierung": "date-range",
  "Titel": "title",
  "Signatur": "signature",
};

function extractData(document, url) {
  let result = { url: url, success: false };

  if (!url.match("findbuch.net/php/view.php")) {
    return result;
  }

  let details = document.querySelector("div#viewer_left div#details div#details_fields");
  result.attributes = {};

  let key = null;
  for (let element of details.children) {
    if (key == null && element.nodeName == "DIV") {
      key = element.textContent.trim();
      if (key[key.length - 1] == ":") {
        key = key.substring(0, key.length - 1).trim();
      }

      key = KEY_TRANSFORMS[key];
    }
    else if (element.nodeName == "DIV") {
      result.attributes[key] = element.textContent.trim();
      key = null;
    }
  }

  let pageListing = document.querySelector("div#viewer_right div#liste table.full_width.viewer_right_table");
  let currSelection = pageListing.querySelector("a[style=\"word-break: break-all; padding: 2px; border: 1px solid black; background: white; color: red;\"]");
  if (currSelection) {
    result["selection"] = currSelection.textContent;
  }

  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
