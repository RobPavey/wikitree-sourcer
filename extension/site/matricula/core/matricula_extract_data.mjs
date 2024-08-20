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

  result.path_components = components.slice(1, components.length);
  let book = components[0];

  if (book.includes("_")) {
    book = book.replace("_", ", Section ");
  }

  result.book = book;
  const book_title = components[0].split("-")[0].trim().toLowerCase();

  let type_set = "";

  if (book_title.includes("geburt")) {
    type_set += ", Birth";
  }
  if (book_title.includes("tauf")) {
    type_set += ", Baptism";
  }
  if (book_title.includes("trauu") || book_title.includes("heirat") || book_title.includes("eheschließung")) {
    type_set += ", Marriage";
  }
  if (book_title.includes("verlobung")) {
    type_set += ", Engagement";
  }
  if (
    book_title.includes("sterbe") ||
    book_title.includes("tod") ||
    book_title.includes("tot") ||
    book_title.includes("begräbnis") ||
    book_title.includes("begraben") ||
    book_title.includes("beeerdigung")
  ) {
    type_set += ", Death";
  }
  if (book_title.includes("erstkommunion")) {
    type_set += ", First Communion";
  }
  if (book_title.includes("firmung")) {
    type_set += ", Confirmation (Firmung)";
  }
  if (book_title.includes("notizen") || book_title.includes("anmerkung")) {
    type_set += ", Notes";
  }
  if (book_title.includes("register") || book_title.includes("index")) {
    type_set += ", Name Register";
  }
  if (book_title.includes("umschlag")) {
    type_set += ", Envelope";
  }
  if (book_title.includes("familie")) {
    type_set += ", Family Book";
  }
  if (book_title.includes("grundbuch")) {
    type_set += ", Land Register";
  }
  if (book_title.includes("lose blätter")) {
    if (type_set) {
      type_set += ", Loose Sheets";
    } else {
      type_set += ", Loose Sheets (Church Records)";
    }
  }

  if (type_set) {
    result.type_set = type_set.substring(2);
  }

  const url_split = url.split("/");
  const last_component = url_split[url_split.length - 1];
  if (last_component.substring(0, 4) == "?pg=") {
    result.page = last_component.substring(4).split("&")[0];
  }

  result.success = true;

  return result;
}

export { extractData };
