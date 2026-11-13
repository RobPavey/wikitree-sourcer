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

function makeList(listElement) {
  let list = {};

  // the list is a series of th and td elements, there appear to always be the same number of each

  const thElements = listElement.querySelectorAll("tr:not([hidden]) > th");
  const tdElements = listElement.querySelectorAll("tr:not([hidden]) > td");

  const length = thElements.length;
  if (tdElements.length != length) {
    return list;
  }

  for (let index = 0; index < length; index++) {
    const th = thElements[index];
    const td = tdElements[index];

    let label = th.textContent;
    if (td.childNodes.length > 1) {
      for (child of td.childNodes) {
        if (child.tagName && child.tagName.toLowerCase() == "a") {
          list[label.trim().toLowerCase()] = child.getAttribute("href");
          break;
        }
      }
    } else {
      let value = td.textContent;
      if (label && value) {
        list[label.trim().toLowerCase()] = value.trim();
      }
    }
  }

  return list;
}

function extractData(document, url) {
  let result = { url: url, success: false };
  if (!url) {
    return result;
  }

  const url_parts = url.replace("//", "__").split("/"); // Fix possible '//' 'in http(s)://'
  const ident = url_parts[3];
  if (ident == "images") {
    result.isRecord = false;
    result.metadata = {};
    const iframe = document.querySelector("iframe.resp-iframe");
    const content = iframe.contentDocument.body;
    const selec = content.querySelector("ul.MuiTreeView-root > div");
    if (selec) {
      result.metadata.selection = selec.textContent.trim(); // Example: Death certificates Dworp (Beersel): Sint-Gaugericus (1798 - 1804)
    }
    const source = content.querySelector("h2.mirador36");
    if (source) {
      result.metadata.source = source.textContent.trim(); // Example: Dworp / Tourneppe (Beersel): Sint-Gaugericus | 1761 - 1804
    }
    const obj = content.querySelector("div.mirador-osd-info > span");
    if (obj) {
      const counts = obj.textContent; // Example: 87 of 139
      const parts = counts.split(" ");
      if (parts.length == 3) {
        result.metadata.currentPage = parts[0].trim();
        result.metadata.maxPage = parts[2].trim();
      }
    }
  } else {
    result.isRecord = true;
    let doc = document;
    if (ident == "analyses") {
      if (url_parts.length < 5 || url_parts[4] != "results") {
        // Search page, not the results page. Nothing to extract here.
        return result;
      }
      // Inside of the search screen, extract the open modal, if possible
      const mod = document.querySelector("#modal_ACT.show");
      if (!mod) {
        result.reason = "no_open_modal";
        return result;
      }
      const url_button = mod.querySelector("#openActBtn");
      let new_url;
      if (url_button) {
        const href = url_button.getAttribute("href");
        if (href) {
          new_url = href;
        }
      }
      const bod = mod.querySelector("div.modal-body");
      if (bod && new_url) {
        result.url = new_url;
        doc = bod;
      } else {
        return result;
      }
    }
    let tables = doc.querySelectorAll("table");
    const length = tables.length;
    //console.log(length)
    if (length < 2) {
      return result;
    }

    result.people = {};
    result.metadata = makeList(tables[0]);
    for (let index = 1; index < length; index++) {
      const table = tables[index];
      const role_span = table.querySelector("span");
      const role = role_span.textContent.toLowerCase();
      const body = table.querySelector("tbody");
      let fields = makeList(body);
      //let person = { role: role, fields: fields };
      let lst = result.people[role];
      if (!lst) {
        result.people[role] = [fields];
      } else {
        lst.push(fields);
      }
    }
  }
  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
