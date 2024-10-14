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

function makeList(listElement) {
  let list = [];

  // the list is a series of dt and dd elements, there appear to always be the same number of each

  const dtElements = listElement.querySelectorAll("dt");
  const ddElements = listElement.querySelectorAll("dd");

  const length = dtElements.length;
  if (ddElements.length != length) {
    return list;
  }

  for (let index = 0; index < length; index++) {
    const dt = dtElements[index];
    const dd = ddElements[index];

    let label = dt.textContent;
    let value = dd.textContent;
    let dataKey = dt.getAttribute("data-dictionary");

    let field = {};
    if (label) {
      field.label = label.trim();
    }
    if (value) {
      field.value = value.trim();
    }
    if (dataKey) {
      field.dataKey = dataKey.trim();
    }

    list.push(field);
  }

  return list;
}

function extractDataForRow(row, result) {
  // a row represents one record
  // all rows appear to have a list of people in the left column followed by an event
  // then in the right column the source details

  result.people = [];

  const leftColumn = row.querySelector("div.left-column");
  if (leftColumn) {
    const people = leftColumn.querySelectorAll("div.person");
    result.people = [];
    for (let person of people) {
      const personListElement = person.querySelector("dl");
      let personList = makeList(personListElement);
      if (personList) {
        result.people.push(personList);
      }
    }
    const event = leftColumn.querySelector("div.gebeurtenis");
    if (event) {
      const eventList = event.querySelector("dl");
      result.eventList = makeList(eventList);
    }
  }

  const rightColumn = row.querySelector("div.right-column");
  if (rightColumn) {
    const sourceList = rightColumn.querySelector("dl");
    result.sourceList = makeList(sourceList);
  }
}

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  let container = document.querySelector("body > div.sourcedetail-themepage");

  if (!container) {
    const visibleDocs = document.querySelectorAll(
      "div.ng-scope[ng-if='vm.VisibleSourceDocumentList[loPerson.PersonId] == true'] > iframe"
    );

    //console.log("visibleDocs.length is : " + visibleDocs.length);
    //console.log(visibleDocs);

    if (visibleDocs.length == 0) {
      return result;
    }

    let iframe = visibleDocs[0];
    container = iframe.contentWindow.document.body.querySelector("div.sourcedetail-themepage");

    if (!container) {
      return result;
    }

    let urlNode = container.querySelector("div.showurl input");
    if (!urlNode) {
      return result;
    }

    let url = urlNode.value;
    if (!url) {
      return result;
    }
    result.url = url;
  }

  const row = container.querySelector("div.row");
  if (!row) {
    return result;
  }

  extractDataForRow(row, result);

  let originalSourceLink = container.querySelector("div.buttons > a.sourcedigital");
  if (!originalSourceLink) {
    // o the dutch page it is different
    originalSourceLink = container.querySelector("div.buttons > div.scan.logo > a");
  }

  if (originalSourceLink) {
    let href = originalSourceLink.href;
    if (href) {
      result.originalSourceLink = href;
    }
  }

  const title = container.querySelector("div > h2");
  if (title) {
    result.title = title.textContent;
  }

  // extract language because it is not always in the URL
  const languageElement = document.querySelector("header > div.navbar li.language > a.active");
  if (languageElement) {
    result.language = languageElement.textContent;
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
