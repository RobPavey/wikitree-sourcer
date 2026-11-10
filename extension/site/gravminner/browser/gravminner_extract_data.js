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

// Content scripts cannot import modules. Read only displayed values, never editing controls.
function extractData(document, url) {
  const result = { url: url, success: false };
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return result;
  }
  const match = /^\/gravminner\/grav\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/?$/i.exec(
    parsedUrl.pathname
  );
  if (!/^https?:$/.test(parsedUrl.protocol) || !/^(www\.)?slektogdata\.no$/i.test(parsedUrl.hostname) || !match) {
    result.overrideFailureMessage = "Open an individual Gravminner memorial page to build a citation.";
    return result;
  }

  const tables = document.querySelectorAll(".table-info");
  if (tables.length !== 1) {
    result.dataMayBeIncomplete = tables.length === 0;
    result.overrideFailureMessage =
      "The Gravminner person details have not loaded. Wait for the page to finish loading and reopen Sourcer.";
    return result;
  }
  const table = tables[0];
  const clean = (node) => (node ? node.textContent.replace(/\s+/g, " ").trim() : "");
  const value = (cell) => (cell ? clean(cell.querySelector(":scope > p, :scope > a")) : "");
  const field = (key) => value(table.querySelector('.table-row-data[data-key="' + key + '"]'));
  const idRow = Array.from(table.querySelectorAll(":scope > .table-row")).find(
    (row) => clean(row.querySelector(":scope > .table-row-cell")) === "Unik ID"
  );
  const recordId = value(idRow && idRow.querySelector(".table-row-data"));
  // This also prevents citing stale Angular content while navigating to another record.
  if (recordId.toLowerCase() !== match[1].toLowerCase()) {
    result.dataMayBeIncomplete = true;
    result.overrideFailureMessage =
      "The Gravminner person ID does not match this page. Wait for loading to finish and reopen Sourcer.";
    return result;
  }
  const forenames = field("firstName");
  const lastName = field("surname");
  if (!forenames && !lastName) {
    return result;
  }

  result.url = "https://slektogdata.no/gravminner/grav/" + recordId.toLowerCase();
  result.recordId = recordId.toLowerCase();
  result.forenames = forenames;
  result.lastName = lastName;
  result.fullName = [forenames, lastName].filter(Boolean).join(" ");
  const keys = {
    maidenName: "maidenName",
    birthDate: "dateOfBirth",
    deathDate: "dateOfDeath",
    burialDate: "buriedDate",
    ceremonyDate: "ceremonyDate",
    birthPlace: "birthPlace",
    deathPlace: "placeOfDeath",
    gender: "gender",
    cemeteryName: "graveyard",
    municipality: "municipality",
    county: "county",
    country: "country",
    plotArea: "buriedTeig",
    plotField: "buriedField",
    plotRow: "buriedRow",
    plotNumber: "buriedNumber",
  };
  for (const [key, sourceKey] of Object.entries(keys)) {
    const text = field(sourceKey);
    if (text) result[key] = text;
  }
  // Read plot labels too, without depending on a particular data key for Rad/Gravnummer.
  const plotLabels = { Rad: "plotRow", Gravnummer: "plotNumber" };
  for (const row of table.querySelectorAll(":scope > .table-row")) {
    const key = plotLabels[clean(row.querySelector(":scope > .table-row-cell"))];
    const text = value(row.querySelector(".table-row-data"));
    if (key && text) result[key] = text;
  }
  const page = table.closest("ng-component") || document;
  const sourceReference = clean(page.querySelector(".references-section > p"));
  if (sourceReference) result.sourceReference = sourceReference;
  const photographer = clean(page.querySelector(".ngx-gallery-image-text"));
  if (photographer.startsWith("Foto:")) result.photographer = photographer.substring(5).trim();
  result.success = true;
  return result;
}
