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

  let metadata = document.querySelector("dl[class='tx-dlf-metadata-titledata']");
  if (metadata) {
    let sections = metadata.querySelectorAll("dt");

    for (let section of sections) {
      let key = section.textContent.trim();
      if (key == "Titel") {
        result.title = section.nextElementSibling.textContent.trim();
      }
      if (key == "Kontext") {
        result.context = section.nextElementSibling.textContent.trim();
      }
      if (key == "Signatur") {
        result.signature = section.nextElementSibling.textContent.trim();
      }
    }
  }

  let page = document.querySelector("select[name='tx_dlf[page]']");
  if (page) {
    page = page.querySelector("option[selected]");
    if (page) {
      page = page.textContent.trim();
      if (page.startsWith("[")) {
        page = page.substring(1);
      }
      if (page.endsWith("]")) {
        page = page.substring(0, page.length - 1);
      }
      result.page = page;
    }
  }

  if (url) {
    let queryString = url.split('?')[1];
    let decodedUrl = new URLSearchParams(queryString);
    if (decodedUrl) {
      for (const [key, value] of decodedUrl.entries()) {
        console.log(key + "\n" + value);
      }
      result.metadataUrl = decodedUrl.get("tx_dlf[id]");
      if (!result.metadataUrl) {
        if (decodedUrl.get("set[mets]")) {
          result.metadataUrl = url.split("set[mets]=")[1];
        }
      }
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
