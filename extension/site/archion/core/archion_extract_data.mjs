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

function title2type(title) {
  title = title.toLowerCase();
  let result = "";

  if (title.includes("tauf")) {
    result += ", Christening";
  }
  if (title.includes("trau") || title.includes("heirat")) {
    result += ", Marriage";
  }
  if (title.includes("proklamation")) {
    result += ", Proclamation";
  }
  if (
    title.includes("tod") ||
    title.includes("tot") ||
    title.includes("bestattung") ||
    title.includes("begraben") ||
    title.includes("begräbnis")
  ) {
    result += ", Death";
  }
  if (title.includes("kommunikant") || title.includes("abendmahl")) {
    result += ", Communion";
  }
  if (title.includes("konfirmand") || title.includes("konfirmant") || title.includes("konfirmation")) {
    result += ", Confirmand";
  }

  if (title.includes("verschmähung")) {
    result += ", Disdain";
  }
  if (title.includes("versagung")) {
    result += ", Refusal";
  }

  if (title.includes("eintritt")) {
    result += ", Church entry";
  }
  if (title.includes("austritt")) {
    result += ", Church withdrawal";
  }

  if (title.includes("familie")) {
    result += ", Family Register";
  } else if (title.includes("register") || title.includes("index")) {
    result += ", Name Register";
  }

  if (result) {
    return result.substring(2);
  }
  return "Churchbook";
}

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
  result.bookType = title2type(result.book);

  const pageSelect = document.querySelector("select");
  if (pageSelect) {
    const pageIndex = pageSelect.querySelector("option[selected]");
    result.pageData = {
      page: parseInt(pageIndex.text) + 1,
    };
  }

  // https://www.archion.de/de/viewer/churchRegister/290910?cHash=7425117a1f08bec109082a024138bc12 [get 290910]
  if (url[url.length - 1] == "/") {
    url = url.substring(0, url.length - 1);
  }
  const parts = url.split("/");
  const uid = parts[parts.length - 1].split("?")[0];
  result.uid = uid;

  // Only if the page has a permalink button, we can generate a permalink
  const permaLinkButton = document.querySelector("span[class='addlink']");
  if (permaLinkButton && url && url.includes("churchRegister")) {
    result.permalink = "<<NOT YET GENERATED>>";
  }

  result.success = true;

  return result;
}

export { extractData };
