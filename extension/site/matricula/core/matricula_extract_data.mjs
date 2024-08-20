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

  // Pages without a document (e.g. parish descriptions) are currently not supported
  const image_view = document.querySelector("div[id='document']");
  if (image_view == null) {
    return result;
  }

  const title = document.querySelector("title").text;
  const components = title.split("|");

  for (let i = 0; i < components.length; i++) {
    components[i] = components[i].trim().replace("  ", " ");
  }

  result.pathComponents = components.slice(1, components.length);
  let book = components[0];

  if (book.includes("_")) {
    book = book.replace("_", ", Section ");
  }

  result.book = book;
  const bookTitle = components[0].split("-")[0].trim().toLowerCase();

  let typeSet = "";

  if (bookTitle.includes("geburt")) {
    typeSet += ", Birth";
  }
  if (bookTitle.includes("tauf")) {
    typeSet += ", Baptism";
  }
  if (bookTitle.includes("trauu") || bookTitle.includes("heirat") || bookTitle.includes("eheschließung")) {
    typeSet += ", Marriage";
  }
  if (bookTitle.includes("verlobung")) {
    typeSet += ", Engagement";
  }
  if (
    bookTitle.includes("sterbe") ||
    bookTitle.includes("tod") ||
    bookTitle.includes("tot") ||
    bookTitle.includes("begräbnis") ||
    bookTitle.includes("begraben") ||
    bookTitle.includes("beeerdigung")
  ) {
    typeSet += ", Death";
  }
  if (bookTitle.includes("kommunion")) {
    typeSet += ", First Communion";
  }
  if (bookTitle.includes("firmung")) {
    typeSet += ", Confirmation (Firmung)";
  }
  if (bookTitle.includes("notizen") || bookTitle.includes("anmerkung")) {
    typeSet += ", Notes";
  }
  if (bookTitle.includes("register") || bookTitle.includes("index")) {
    typeSet += ", Name Register";
  }
  if (bookTitle.includes("umschlag")) {
    typeSet += ", Envelope";
  }
  if (bookTitle.includes("familie")) {
    typeSet += ", Family Book";
  }
  if (bookTitle.includes("grundbuch")) {
    typeSet += ", Land Register";
  }
  if (bookTitle.includes("lose blätter")) {
    if (typeSet) {
      typeSet += ", Loose Sheets";
    } else {
      typeSet += ", Loose Sheets (Church Records)";
    }
  }

  if (typeSet) {
    // Remove the first ', '
    result.typeSet = typeSet.substring(2);
  }

  const urlSplit = url.split("/");
  const lastComponent = urlSplit[urlSplit.length - 1];
  if (lastComponent.substring(0, 4) == "?pg=") {
    result.page = lastComponent.substring(4).split("&")[0];
  }

  result.success = true;

  return result;
}

export { extractData };
