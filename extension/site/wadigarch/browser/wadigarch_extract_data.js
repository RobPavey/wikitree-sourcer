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

function cleanText(text) {
  if (!text) {
    return "";
  }
  return text.replace(/\s+/g, " ").trim();
}

function fixCase(text) {
  // some indexes have names in all caps
  if (text && text == text.toUpperCase()) {
    return text.toLowerCase().replace(/(^|[\s'-])([a-z])/g, function (match, sep, letter) {
      return sep + letter.toUpperCase();
    });
  }
  return text;
}

function extractData(document, url) {
  let result = { url: url, success: false };

  const rows = document.querySelectorAll("table.recordMetaData tr");
  if (rows.length < 1) {
    return result;
  }

  // The first metadata table has the Record Series, Collection and County.
  // The second has the fields of the record, which vary with the type of record.
  let recordData = {};
  for (let row of rows) {
    let th = row.querySelector("th");
    let td = row.querySelector("td");
    if (!th || !td) {
      continue;
    }

    let label = cleanText(th.textContent).replace(/:$/, "");
    let value = cleanText(td.textContent);
    if (!label || !value) {
      continue;
    }

    if (label == "Record Series") {
      result.recordSeries = value;
    } else if (label == "Collection") {
      result.collection = value;
    } else if (label == "County") {
      result.county = value;
    } else {
      recordData[label] = value;
    }
  }

  if (!result.recordSeries) {
    return result;
  }
  result.recordData = recordData;

  let recordIdMatch = url ? url.match(/\/Record\/View\/([0-9A-Za-z]+)/) : undefined;
  if (recordIdMatch) {
    result.recordId = recordIdMatch[1];
  }

  if (document.title) {
    let title = cleanText(document.title);
    title = title.replace(/^View Record - /, "").replace(/ - Washington State Archives, Digital Archives$/, "");
    if (title) {
      result.title = title;
    }
  }

  let preferredCitationElement = document.querySelector("#preferredCitation");
  if (preferredCitationElement) {
    result.preferredCitation = cleanText(preferredCitationElement.textContent);
  }

  // Not all records have images. The images are PDFs that are requested using a reCAPTCHA token
  // so there is no stable URL for them that we can extract.
  if (document.querySelector("#digitalObjectList .document-download")) {
    result.hasImage = true;
  }

  // For marriages the record has no primary person so the user has to choose
  let groomName = recordData["Groom's Name"];
  let brideName = recordData["Bride's Name"];
  if (result.recordSeries == "Marriage Records" && groomName && brideName) {
    result.ambiguousPerson = true;
    result.ambiguousPersonArray = [
      { name: groomName + " (groom)", id: "groom" },
      { name: brideName + " (bride)", id: "bride" },
    ];
  }

  // Divorce records (in the Department of Health index) have Spouse A and Spouse B
  if (result.recordSeries == "Divorce Records") {
    let nameA = [recordData["Spouseafirstname"], recordData["Spousealegallastname"]].join(" ").trim();
    let nameB = [recordData["Spousebfirstname"], recordData["Spouseblegallastname"]].join(" ").trim();
    if (nameA && nameB) {
      result.ambiguousPerson = true;
      result.ambiguousPersonArray = [
        { name: fixCase(nameA) + " (spouse A)", id: "spouseA" },
        { name: fixCase(nameB) + " (spouse B)", id: "spouseB" },
      ];
    }
  }

  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
