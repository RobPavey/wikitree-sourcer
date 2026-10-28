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

  if (!url.match("www.ephemerasearch.com/ephemera/")) {
    return result;
  }

  let recipient = document.querySelector("input[id=\"recipient\"]");
  if (recipient != null) {
    result.recipient_names = recipient.value.trim();
  }

  let sender = document.querySelector("input[id=\"sender\"]");
  if (sender != null) {
    result.sender_names = sender.value.trim();
  }

  let year = document.querySelector("input[id=\"year\"]");
  if (year != null) {
    result.year = year.value.trim();
  }

  let edit_row = document.querySelector("div[class=\"transcription narrow container\"]");
  if (edit_row == null) {
    edit_row = document.querySelector("div[class=\"transcription wide container\"]");
  }
  if (edit_row != null) {
    let description = null, elements = null;
    if (edit_row.children.length > 2) {
      description = edit_row.children[1];
      elements = edit_row.children[2];
    }
    else {
      description = edit_row.children[0];
      elements = edit_row.children[1];
    }

    result.description = description.textContent.trim();
    result.description = result.description.replace("Description from eBay: ", "").trim();

    for (let element of elements.children) {
      const key = element.querySelector("label").textContent.trim().toLowerCase().replaceAll(" ", "_");
      const value = element.querySelector("div[class=\"form-control tx-trigger h-100 emotion-cache-no-speedy-5bs01k\"]");
      if (value == null) {
        continue;
      }
      value = value.textContent.trim();
      if (value != null && value != "") {
        result[key] = value;
      }
    }
  }

  let places = document.querySelector("div[class=\"ephPlaces flex-wrap list-group list-group-horizontal\"]");
  if (places != null) {
    result.places = [];
    for (let place of places.children) {
      result.places.push(place.querySelector("button").childNodes[1].textContent.trim());
    }
  }

  let tags = document.querySelector("div[class=\"tags mb-0 form-group col\"]");
  if (tags != null) {
    result.tags = [];
    for (let button of tags.querySelectorAll("button")) {
      let tag_text = null;
      if (button.childNodes.length < 2) {
        tag_text = button.textContent.trim();
      } else {
        tag_text = button.childNodes[1].textContent.trim();
      }
      result.tags.push(tag_text);
    }
  }

  let collections = document.querySelector("#editor-row > div.transcription.narrow.container > form > div:nth-child(7) > div > div.tags.mb-0.form-group.col");
  if (collections != null) {
    result.collections = [];
    for (let button of collections.querySelectorAll("button")) {
      let collection_text = null;
      if (button.childNodes.length < 2) {
        collection_text = button.textContent.trim();
      } else {
        collection_text = button.childNodes[1].textContent.trim();
      }
      result.collections.push(collection_text);
    }

    for (let collection of result.collections) {
      if (collection.match(/\[eBay\]/)) {
        result.seller = collection.replace(/\[eBay\]/, "").trim();
        break;
      }
    }
  }

  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
