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

  let pathComponents = [];

  const title = document.querySelector("div[class='dvbreadcrumb']");
  const fragments = title.querySelectorAll("span");

  for (let fragment of fragments) {
    const link = fragment.querySelector("a");
    if (link) {
      const text = link.text;
      if (text && text != "Alle Archive in ARCHION") {
        pathComponents.push(text.trim().replace(/\s+/g, " "));
      }
    }
  }

  result.pathComponents = pathComponents.slice(0, -1);
  result.book = pathComponents[pathComponents.length - 1];

  const pageSelect = document.querySelector("select");
  if (pageSelect) {
    const pageIndex = pageSelect.querySelector("option[selected]");
    result.pageData = {
      page: parseInt(pageIndex.text) + 1,
    };
  }

  // https://www.archion.de/de/viewer/churchRegister/290910?cHash=7425117a1f08bec109082a024138bc12
  if (url[url.length - 1] == "/") {
    url = url.substring(0, url.length - 1);
  }
  const parts = url.split("/");
  const uid = parts[parts.length - 1].split("?")[0];

  result.uid = uid;

  const permaLinkButton = document.querySelector("span[class='addlink']");
  if (permaLinkButton && url && url.includes("churchRegister")) {
    result.permalink = "<<NOT YET GENERATED>>";
  }

  result.success = true;

  return result;
}

export { extractData };
