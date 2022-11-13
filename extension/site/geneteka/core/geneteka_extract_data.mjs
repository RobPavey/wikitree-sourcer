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

/** Field order for birth and death records. */
const PERSON_FIELDS = [
  "year",
  "record",
  "firstName",
  "lastName",
  "fatherFirstName",
  "motherFirstName",
  "motherMaidenName",
  "parish",
  "place",
];

/** Field order for marriage records. */
const MARRIAGE_FIELDS = [
  "year",
  "record",
  "husbandFirstName",
  "husbandLastName",
  "husbandParents",
  "wifeFirstName",
  "wifeLastName",
  "wifeParents",
  "parish",
];

const FIELDS = {
  B: PERSON_FIELDS,
  S: MARRIAGE_FIELDS,
  D: PERSON_FIELDS,
};

/** Total number of columns. */
const COLUMN_COUNT = 10;

/** The number of the remarks column. */
const REMARKS_COLUMN_NUMBER = 9;

function extractData(document, url, siteSpecificInput) {
  const typeMatch = url.match(/bdm=([BDS])/);
  const voivodeshipMatch = url.match(/w=(\w\w\w\w)/);
  if (!typeMatch || !voivodeshipMatch) {
    return { success: false };
  }

  const inputSelectedRow = siteSpecificInput && siteSpecificInput.selectedRowElement;
  const selectedRow = inputSelectedRow || document.querySelector(".tablesearch tbody tr");
  const rowCells = selectedRow.querySelectorAll("td");
  if (rowCells.length !== COLUMN_COUNT) {
    return { success: false };
  }

  const recordType = typeMatch[1];
  const recordData = {
    recordType,
    voivodeship: voivodeshipMatch[1],
  };

  // Extract most fields.
  const fields = FIELDS[recordType];
  for (let i = 0; i < fields.length; ++i) {
    const fieldName = fields[i];
    const rowCell = rowCells[i];
    const value = rowCell.textContent.trim();
    if (fieldName && value) {
      recordData[fieldName] = value;
    }
  }

  // Extract information from the remarks text.
  const remarksCell = rowCells[REMARKS_COLUMN_NUMBER];
  const imgs = remarksCell.querySelectorAll("img");
  for (const img of imgs) {
    const src = img.attributes["src"]?.value;
    const title = img.attributes["title"]?.value;
    if (src?.includes("i.png") && title) {
      const dateMatch = title.match(/Data \S+: (\d\d.\d\d.\d\d\d\d)/);
      if (dateMatch) {
        recordData.date = dateMatch[1];
      }
      const placeMatch = title.match(/Miejscowość: (.+)/);
      if (placeMatch) {
        recordData.place = placeMatch[1].trim();
      }
    }
  }

  // Extract link to scan.
  const scanUrl = remarksCell.querySelector("a[class=gt]")?.attributes?.["href"]?.value;
  if (scanUrl) {
    recordData.scanUrl = scanUrl;
  }

  return { success: true, recordData };
}

export { extractData };
