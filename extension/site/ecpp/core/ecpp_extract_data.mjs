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

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  let heading = document.querySelector("app-edit > form > h3");
  if (heading) {
    result.heading = heading.textContent.trim();
  }

  result.fields = {};

  let mainFormRow = document.querySelector("app-edit > form > div.form-row");
  if (mainFormRow) {
    let dataFields = mainFormRow.querySelectorAll("div");
    let fields = result.fields;
    for (let dataField of dataFields) {
      let label = dataField.querySelector("label");
      let input = dataField.querySelector("input");
      if (label && input) {
        let field = {};
        field.label = label.textContent.trim();
        // Note that saved page doesn't have value
        field.value = input.value;
        field.id = input.id;
        field.name = input.getAttribute("name");
        if (field.id) {
          fields[field.id] = field;
        }
      }
    }
  }

  let tabContent = document.querySelector("#myTabContent");
  if (!tabContent) {
    return result;
  }

  let tabPanels = tabContent.querySelectorAll("div[role='tabpanel']");
  if (tabPanels.length == 0) {
    return result;
  }

  result.sections = {};
  for (let tabPanel of tabPanels) {
    let id = tabPanel.id;
    if (!id) {
      continue;
    }

    let section = {};
    result.sections[id] = section;

    let dataFields = tabPanel.querySelectorAll("form > div");
    if (dataFields.length) {
      //let fields = {};
      //section.fields = fields;
      let fields = result.fields;
      for (let dataField of dataFields) {
        let label = dataField.querySelector("label");
        let input = dataField.querySelector("input");
        if (label && input) {
          let field = {};
          field.label = label.textContent.trim();
          // Note that saved page doesn't have value
          field.value = input.value;
          field.id = input.id;
          field.name = input.getAttribute("name");
          if (field.id) {
            fields[field.id] = field;
          }
        }
      }
    } else {
      // may be a list
      let listItems = tabPanel.querySelectorAll("ul > li");
      section.listItems = [];
      for (let listItem of listItems) {
        let text = listItem.textContent.trim();
        if (text) {
          section.listItems.push(text);
        }
      }
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
