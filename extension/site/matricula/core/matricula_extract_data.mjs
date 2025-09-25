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

function extractTypeSet(text) {
  text = text.trim().toLowerCase();

  let typeSet = "";

  if (text.includes("geburt")) {
    typeSet += ", Birth";
  }
  if (text.includes("tauf")) {
    typeSet += ", Baptism";
  }
  if (text.includes("trauu") || text.includes("heirat") || text.includes("eheschließung")) {
    typeSet += ", Marriage";
  }
  if (text.includes("verlobung")) {
    typeSet += ", Engagement";
  }
  if (
    text.includes("sterbe") ||
    text.includes("tod") ||
    text.includes("tot") ||
    text.includes("begräbnis") ||
    text.includes("begraben") ||
    text.includes("beeerdigung")
  ) {
    typeSet += ", Death";
  }
  if (text.includes("kommunion")) {
    typeSet += ", First Communion";
  }
  if (text.includes("firmung")) {
    typeSet += ", Confirmation (Firmung)";
  }
  if (text.includes("notizen") || text.includes("anmerkung")) {
    typeSet += ", Notes";
  }
  if (text.includes("register") || text.includes("index")) {
    typeSet += ", Name Register";
  }
  if (text.includes("umschlag")) {
    typeSet += ", Envelope";
  }
  if (text.includes("familie")) {
    typeSet += ", Family Book";
  }
  if (text.includes("grundbuch")) {
    typeSet += ", Land Register";
  }
  if (text.includes("lose blätter")) {
    if (typeSet) {
      typeSet += ", Loose Sheets";
    } else {
      typeSet += ", Loose Sheets (Church Records)";
    }
  }
  if (text.includes("einband")) {
    typeSet += ", Envelope";
  }
  if (text.includes("sonstiges")) {
    typeSet += ", Miscellaneous";
  }
  return typeSet.substring(2);
}

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  // Pages without a document (e.g. parish descriptions) are currently not supported
  const image_view = document.querySelector("div[id='document']");
  if (!image_view) {
    return result;
  }

  const title = document.querySelector("title").text;
  const components = title.split("|");

  for (let i = 0; i < components.length; i++) {
    components[i] = components[i].trim().replace(/\s+/g, " ");
  }

  result.pathComponents = components.slice(1, components.length);
  let book = components[0];

  if (book.includes("_")) {
    book = book.replace("_", ", Section ");
  }

  result.book = book;
  const bookTitle = components[0].split("-")[0];
  let typeSet = "";

  if (url.match("/oesterreich/wien/")) {
    const selectedComponent = document.querySelector(".docview-pagelink.list-group-item.active")
    const text = selectedComponent.text;
    const page = text.split("_")[1];
    result.page = Number(page).toString();
    result.sectionNumber = Number(text.split("-")[0]).toString();
    typeSet = extractTypeSet(text);
  }
  
  if (result.page == null) {
    const urlSplit = url.split("/");
    const lastComponent = urlSplit[urlSplit.length - 1];
    if (lastComponent.substring(0, 4) == "?pg=") {
      result.page = lastComponent.substring(4).split("&")[0];
    }
    typeSet = extractTypeSet(bookTitle);
  }

  if (typeSet) {
    // Remove the first ', '
    result.typeSet = typeSet;
  }

  result.success = true;

  return result;
}

export { extractData };
