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

const ATTRIBUTE_TRANSLATIONS = {
  "sygnatura": "reference code",
  "signatur": "reference code",
  "daty": "dates",
  "daten": "dates",
  "archiwum": "archives",
  "archiv": "archives",
  "zespół": "fonds",
  "bestand": "fonds",
};

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  if (!url || !url.match("/jednostka/")) {
    return result;
  }

  let field = document.querySelector("#portlet_Jednostka > div > div > div > div.row > div");
  result.title = field.querySelector("div.row > div > h2").textContent.trim();

  result.attributes = {};
  let attributes = field.querySelector("div[class=\"metadaneJednostki row\"]");
  for (let attribute of attributes.querySelectorAll("div[class=\"border-left col-md-2 col-sm-12\"]")) {
    let title = attribute.querySelector("div.title").textContent.trim().toLowerCase();
    title = ATTRIBUTE_TRANSLATIONS[title] || title;
    let value = attribute.querySelector("div.value").textContent.trim();
    result.attributes[title] = value.replace("Expand", "").replace("Collapse", "").trim();
  }
  for (let attribute of attributes.querySelectorAll("div[class=\"border-left col-md-3 col-sm-12\"]")) {
    let title = attribute.querySelector("div.title").textContent.trim().toLowerCase();
    title = ATTRIBUTE_TRANSLATIONS[title] || title;
    let value = attribute.querySelector("div.value").textContent.trim();
    result.attributes[title] = value.replace("Expand", "").replace("Collapse", "").trim();
  }

  let viewer_frame = document.querySelector("iframe.ps-iframe");
  if (viewer_frame) {

    let page_selector = viewer_frame.contentDocument.querySelector("span.name").textContent.trim();
    let current = parseInt(page_selector.split(" ")[1]);
    let total = parseInt(page_selector.split(" ")[3]);
    result.selected_page = current;
    result.total_pages = total;

    let get_link_button = viewer_frame.contentDocument.querySelector("a[class=\"tab link\"]");
    if (get_link_button) {
      get_link_button.click();
      let permalink = viewer_frame.contentDocument.querySelector("input[readonly=\"readonly\"]").value;
      result.permalink = permalink;
      let close_button = viewer_frame.contentDocument.querySelector("div[class=\"hide\"] > a");
      close_button.click();
    }
  }

  /*
  const entries = document.querySelectorAll("table > tbody > tr[class^=entrybmd_]");
  //console.log("entriesQuery size is: " + entriesQuery.length);
  if (entries.length < 1) {
    return result;
  }
  */

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
