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

// No imports or requires allowed. See docs/dev_notes/extract_data_design

function title2type(title) {
  title = title.toLowerCase();
  let result = [];

  if (title.includes("geburt")) {
    result.push("Birth");
  }
  if (title.includes("tauf")) {
    result.push("Baptism");
  }
  if (title.includes("trau") || title.includes("heirat") || title.includes("eheprotokoll")) {
    result.push("Marriage");
  }
  if (title.includes("proklamation")) {
    result.push("Proclamation");
  }
  if (
    title.includes("tod") ||
    title.includes("tot")
  ) {
    result.push("Death");
  }
  if (
    title.includes("bestattung") ||
    title.includes("begraben") ||
    title.includes("begräbnis") ||
    title.includes("beerdigung")
  ) {
    result.push("Burial");
  }
  if (title.includes("kommunikant") || title.includes("abendmahl")) {
    result.push("Communion");
  }
  if (title.includes("konfirmand") || title.includes("konfirmant") || title.includes("konfirmation")) {
    result.push("Confirmand");
  }

  if (title.includes("verschmähung")) {
    result.push("Disdain");
  }
  if (title.includes("versagung")) {
    result.push("Refusal");
  }

  if (title.includes("eintritt")) {
    result.push("Church Enty");
  }
  if (title.includes("austritt")) {
    result.push("Church Withdrawal");
  }

  let drop_register_item = false;
  if (title.includes("kirchstuhl")) {
    result.push("Church Chair Register");
    drop_register_item = true;
  }
  if (title.includes("familie") || title.includes("seele")) {
    result.push("Family Register");
    drop_register_item = true;
  }
  if (!drop_register_item && (title.includes("register") || title.includes("index"))) {
    let extraResults = [];
    for (let item of result) {
      extraResults.push("Name Register (" + item + ")");
    }

    result.push("Name Register");
    result = result.concat(extraResults);
  }

  if (result.length == 0) {
    return undefined;
  }
  return ["Church Record"].concat(result);
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

  // Format: <some text>_<page num>
  if (
    url.match("/oesterreich/wien/") ||
    url.match("/oesterreich/alt-ev/") ||
    url.match("/oesterreich/burgenland-ab-hb/") ||
    url.match("/oesterreich/burgenland/") ||
    url.match("/oesterreich/metropolis/") ||
    url.match("/oesterreich/st-poelten/") ||
    url.match("/oesterreich/salzburg/") ||
    url.match("/oesterreich/steiermark-ev-kirche-AB/") ||
    url.match("/oesterreich/daw/") ||
    url.match("/oesterreich/wien-evang-dioezese-AB/") ||
    url.match("/oesterreich/wien-evang-dioezese-HB/") ||
    url.match("/oesterreich/wien/") ||
    url.match("/deutschland/osnabrueck/")
  ) {
    const selectedComponent = document.querySelector(".docview-pagelink.list-group-item.active");
    if (selectedComponent != null) {
      const text = selectedComponent.text;
      const page = text.split("_")[1];
      result.page = Number(page).toString();
      result.sectionNumber = Number(text.split("-")[0]).toString();
      result.recordTypeCandidates = title2type(text) || title2type(bookTitle);
    }
  }

  if (url.match("/oesterreich/graz-seckau/")) {
    const selectedComponent = document.querySelector(".docview-pagelink.list-group-item.active");
    if (selectedComponent != null) {
      const text = selectedComponent.text;
      const page = text.substring("Seite ".length);
      result.page = page;
      result.recordTypeCandidates = title2type(bookTitle);
    }
  }

  if (url.match("/oesterreich/vorarlberg/")) {
    const selectedComponent = document.querySelector(".docview-pagelink.list-group-item.active");
    if (selectedComponent != null) {
      const text = selectedComponent.text;
      let page = text.substring(text.indexOf("-") + 1).trim();
      if (page.match("^Seite")) {
        page = page.substring("Seite".length).trim();
      }
      if (page.match("^fol.")) {
        page = page.substring("fol.".length).trim();
      }
      result.page = page;
      result.recordTypeCandidates = title2type(text.split("-")[0]) || title2type(bookTitle);
    }
  }

  if (url.match("/deutschland/fulda/")) {
    const selectedComponent = document.querySelector(".docview-pagelink.list-group-item.active");
    if (selectedComponent != null) {
      const text = selectedComponent.text;
      const page = text.substring(text.lastIndexOf("-") + 1).trim();
      result.page = Number(page).toString();
      result.sectionNumber = Number(text.split("-")[0]).toString();
      result.recordTypeCandidates = title2type(text) || title2type(bookTitle);
    }
  }

  if (url.match("/deutschland/hildesheim/")) {
    const selectedComponent = document.querySelector(".docview-pagelink.list-group-item.active");
    if (selectedComponent != null) {
      const text = selectedComponent.text;
      const page = text.split("_")[0].trim();
      result.page = page;
      result.recordTypeCandidates = title2type(bookTitle);
    }
  }

  if (result.page == null) {
    const urlSplit = url.split("/");
    const lastComponent = urlSplit[urlSplit.length - 1];
    if (lastComponent.substring(0, 4) == "?pg=") {
      result.page = lastComponent.substring(4).split("&")[0];
    }
    result.recordTypeCandidates = title2type(bookTitle);
  }

  result.success = true;

  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
