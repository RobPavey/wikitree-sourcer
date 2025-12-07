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
  result.sections = {};

  let mainFormRow = document.querySelector("app-edit > form > div.form-row");
  if (mainFormRow) {
    let section = {};
    result.sections.main = section;
    section.fields = {};

    let dataFields = mainFormRow.querySelectorAll("div");
    let fields = section.fields;
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

  for (let tabPanel of tabPanels) {
    let id = tabPanel.id;
    if (!id) {
      continue;
    }

    let section = {};
    result.sections[id] = section;
    let fields = {};
    section.fields = fields;
    section.listItems = [];

    let dataFields = tabPanel.querySelectorAll("form > div");
    if (dataFields.length) {
      for (let dataField of dataFields) {
        let subInputs = dataField.querySelectorAll("div > input");
        if (subInputs.length > 0) {
          let subLabels = dataField.querySelectorAll("div > label");
          if (subInputs.length == subLabels.length) {
            for (let index = 0; index < subInputs.length; index++) {
              let field = {};
              let label = subLabels[index];
              let input = subInputs[index];
              field.label = label.textContent.trim();
              field.value = input.value;
              field.id = input.id;
              field.name = input.getAttribute("name");
              if (field.id) {
                fields[field.id] = field;
              }
            }
          }
        } else {
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
    } else {
      // may be a list
      let listItems = tabPanel.querySelectorAll("ul > li");
      for (let listItem of listItems) {
        let text = listItem.textContent.trim();
        if (text) {
          section.listItems.push(text);
        }
      }
    }

    // The misc tab can also have a table
    if (tabPanel.id == "miscellaneous") {
      let headings = tabPanel.querySelectorAll("table > thead > tr > th");
      let rows = tabPanel.querySelectorAll("table > tbody > tr");
      //console.log("headings.length = " + headings.length);
      //console.log("rows.length = " + rows.length);
      for (let row of rows) {
        let cells = row.querySelectorAll("td");
        //console.log("cells.length = " + cells.length);
        if (headings.length == cells.length) {
          if (headings.length == 2) {
            let heading1 = headings[0].textContent.trim();
            let heading2 = headings[1].textContent.trim();
            //console.log("heading1 = " + heading1);
            //console.log("heading2 = " + heading2);
            if (heading1 == "Variable Name" && heading2 == "Attribute") {
              let field = {};
              field.label = cells[0].textContent.trim();
              // Note that saved page doesn't have value
              field.value = cells[1].textContent.trim();
              field.id = field.label;
              if (field.id) {
                fields[field.id] = field;
              }
            }
          }
        }
      }
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
