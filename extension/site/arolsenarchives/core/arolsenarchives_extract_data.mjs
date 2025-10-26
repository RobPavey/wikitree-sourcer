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

function getSelectedRow(document) {
  if (document.querySelector("yv-its-person-simple-grid") == null) {
    return null;
  }

  const highlightStyle = "font-weight: bold; font-style: italic";
  const resultsTable = document.querySelector("yv-its-person-simple-grid").querySelector('tbody[role="rowgroup"]');
  if (resultsTable) {
    const selectedRow = resultsTable.querySelector("mat-row[style='" + highlightStyle + "']");

    if (selectedRow == null) {
      return null;
    }

    let children = selectedRow.parentNode.children;
    for (let i = 0; i < children.length; i++) {
      if (children[i.toString()] == selectedRow) {
        return i;
      }
    }
  }
}

function monthName2Number(month_name) {
  const month_names = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return month_names.indexOf(month_name) + 1;
}

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  // only allow extract from documents for now
  if (!url.match("/document/") && !url.match("/archive/")) {
    return;
  }

  result.doc_id = url.substring(url.lastIndexOf("/") + 1);

  const breadcrum_item = document.querySelector('div[class="fd-tree-path"]');
  let breadcrum_string = "";
  for (let breadcrum of breadcrum_item.querySelectorAll('a[class="ng-star-inserted"]')) {
    breadcrum_string += ", " + breadcrum.textContent.trim();
  }
  let title = document.querySelector('yv-its-full-details-metadata')?.querySelector("h1");
  if (title != null) {
    breadcrum_string += ", " + title.textContent.trim();
  }
  result.breadcrum = breadcrum_string.substring(2);

  if (url.match("/document/")) {
    const selected_index = getSelectedRow(document);
    if (selected_index != null) {
      result.person_index = selected_index;
    }
  }
  else if (url.match("/archive/") && title) {
    let title_text = title.textContent.trim();
    let last_name = null;
    let first_name = null;
    let date_of_birth = null;
    let place_of_birth = null;
    // Personal file of ABRAMOWICZ, JONAS
    // Personal file of ABRAMOWICZ, JOSEK, born on 21-Apr-1918
    // Personal file of AABEN, OSKAR, born on 16-Jan-1903, born in KURESARRE and of further persons
    if (title_text.match(/^Personal file of /)) {
      title_text = title_text.substring(title_text.indexOf("Personal file of ") + "Personal file of ".length);
      last_name = title_text.substring(0, title_text.indexOf(",")).trim();
      title_text = title_text.substring(title_text.indexOf(",") + 1).trim();
      first_name = title_text.substring(0, title_text.indexOf(",") != -1 ? title_text.indexOf(",") : title_text.length).trim();
      title_text = title_text.substring(title_text.indexOf(first_name) + first_name.length + 1).trim();
      if (title_text.startsWith("born on ")) {
        title_text = title_text.substring("born on ".length).trim();
        date_of_birth = title_text.substring(0, title_text.indexOf(",") + 1).trim();
        title_text = title_text.substring(title_text.indexOf(date_of_birth) + date_of_birth.length + 1).trim();
        const month = date_of_birth.split("-")[1];
        date_of_birth = date_of_birth.replace(month, ("0" + monthName2Number(month).toString()).slice(-2));
      }
      if (title_text.startsWith("born in ")) {
        place_of_birth = title_text.substring("born in ".length).trim().split("and")[0].trim();
      }
      result.date_sep = "-";
    }
    // Akte von ABRAMOWICZ, JONAS
    // Akte von ABRAMOWICZ, JOSEK, geboren am 21.04.1918
    else if (title_text.match(/^Akte von /)) {
      title_text = title_text.substring(title_text.indexOf("Akte von ") + "Akte von ".length);
      last_name = title_text.substring(0, title_text.indexOf(",")).trim();
      title_text = title_text.substring(title_text.indexOf(",") + 1).trim();
      first_name = title_text.substring(0, title_text.indexOf(",") != -1 ? title_text.indexOf(",") : title_text.length).trim();
      title_text = title_text.substring(title_text.indexOf(first_name) + first_name.length + 1).trim();
      if (title_text.startsWith("geboren am ")) {
        title_text = title_text.substring("geboren am ".length).trim();
        date_of_birth = title_text.substring(0, title_text.indexOf(",") + 1).trim();
        title_text = title_text.substring(title_text.indexOf(date_of_birth) + date_of_birth.length + 1).trim();
        const month = date_of_birth.split("-")[1];
        date_of_birth = date_of_birth.replace(month, ("0" + monthName2Number(month).toString()).slice(-2));
      }
      if (title_text.startsWith("geboren in ")) {
        place_of_birth = title_text.substring("geboren in ".length).trim().split("und")[0].trim();
      }
      result.date_sep = ".";
    }
    // Unterlagen von AABEN, OSKAR, geboren am 16.01.1903, geboren in KURESARRE und von weiteren Personen
    else if (title_text.match(/^Unterlagen von /)) {
      title_text = title_text.substring(title_text.indexOf("Unterlagen von ") + "Unterlagen von ".length);
      last_name = title_text.substring(0, title_text.indexOf(",")).trim();
      title_text = title_text.substring(title_text.indexOf(",") + 1).trim();
      first_name = title_text.substring(0, title_text.indexOf(",") != -1 ? title_text.indexOf(",") : title_text.length).trim();
      title_text = title_text.substring(title_text.indexOf(first_name) + first_name.length + 1).trim();
      if (title_text.startsWith("geboren am ")) {
        title_text = title_text.substring("geboren am ".length).trim();
        date_of_birth = title_text.substring(0, title_text.indexOf(",") + 1).trim();
        title_text = title_text.substring(title_text.indexOf(date_of_birth) + date_of_birth.length + 1).trim();
        const month = date_of_birth.split("-")[1];
        date_of_birth = date_of_birth.replace(month, ("0" + monthName2Number(month).toString()).slice(-2));
      }
      if (title_text.startsWith("geboren in ")) {
        place_of_birth = title_text.substring("geboren in ".length).trim().split("und")[0].trim();
      }
      result.date_sep = ".";
    }

    if (first_name || last_name || date_of_birth || place_of_birth) {
      result.person_data = {
        FirstName: first_name,
        LastName: last_name,
        Dob: date_of_birth,
        PlaceBirth: place_of_birth,
      };
    }
  }

  result.success = true;

  return result;
}

export { extractData };
