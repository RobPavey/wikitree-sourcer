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

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  function clean(text) {
    if (!text) {
      return "";
    }
    return text
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // the site shows "Not Recorded" for fields that are blank in the register
  function cleanValue(text) {
    var value = clean(text);
    return /^\[?\s*not (recorded|listed)\s*\]?$/i.test(value) ? "" : value;
  }

  // labels vary slightly between layouts, e.g. "Parish/District" and "Parish / District"
  function cleanLabel(text) {
    return clean(text)
      .replace(/\s*:\s*$/, "")
      .replace(/\s*\/\s*/g, " / ");
  }

  // ---- is this a record page? ----
  // Record URLs look like .../view_detail.php?recordid=471306&type=bch&recordCentre=kerry&page=1&n=1&...
  // Only recordid, type and recordCentre identify the record; the rest is navigation back to the results.
  if (!url || !/\/view_detail\.php\?/.test(url)) {
    return result;
  }
  var query = url.split("?")[1].split("#")[0];
  var params = {};
  var pairs = query.split("&");
  for (var i = 0; i < pairs.length; i++) {
    var eq = pairs[i].indexOf("=");
    if (eq > 0) {
      params[pairs[i].substring(0, eq)] = decodeURIComponent(pairs[i].substring(eq + 1).replace(/\+/g, " "));
    }
  }
  if (!params.recordid || !params.type) {
    return result;
  }

  // Sometimes the site shows a reCAPTCHA before the record. The record table is then in the page but hidden and
  // empty, so report it rather than extracting nothing. The user must complete the reCAPTCHA themselves.
  if (document.querySelector(".g-recaptcha, textarea[name='g-recaptcha-response']")) {
    result.captchaShown = true;
    return result;
  }

  var table = document.querySelector("#record-table-id");
  if (!table) {
    return result;
  }

  result.recordId = params.recordid;
  result.recordTypeCode = params.type; // e.g. bch = church baptism, bcv = civil birth
  if (params.recordCentre) {
    result.recordCentre = params.recordCentre;
  }
  // a short URL without the navigation parameters, which still opens the record
  var base = url.split("?")[0];
  var shortUrl = base + "?recordid=" + encodeURIComponent(params.recordid) + "&type=" + encodeURIComponent(params.type);
  if (params.recordCentre) {
    shortUrl += "&recordCentre=" + encodeURIComponent(params.recordCentre);
  }
  result.shortUrl = shortUrl;

  // e.g. "Church Baptism Record"
  var heading = document.querySelector(".table-record-header h1");
  if (heading) {
    result.recordTitle = clean(heading.textContent);
  }

  // ---- the label/value pairs ----
  // Birth/baptism pages: each row is label, value(.record-detail1), label, value.
  // Marriage pages: the rows before the first <th> are like that too, then <th> rows name two people
  // ("Husband" and "Wife", "Husband's Father" and "Wife's Father", ...) and each row under them has a label
  // followed by the left person's value(s) then the right person's. Names are in two cells (forenames, surname).
  var fields = {};
  var sections = {};
  var sectionOrder = [];
  var sectionHeadings = undefined;

  var rows = table.querySelectorAll("tr");
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    var headingCells = row.querySelectorAll("th");
    if (headingCells.length > 0) {
      sectionHeadings = [];
      for (var h = 0; h < headingCells.length; h++) {
        var heading = clean(headingCells[h].textContent);
        sectionHeadings.push(heading);
        if (heading && !sections[heading]) {
          sections[heading] = {};
          sectionOrder.push(heading);
        }
      }
      continue;
    }

    var cells = row.children;
    if (sectionHeadings) {
      // Values come in groups of .record-detail1 cells, one group per heading. A group's label is the most recent
      // non-empty label cell: marriage rows have one label for both people ("Name:", John, Smith, -, Mary, Clarke),
      // death rows have one per section ("Graveyard:", value, "Relationship:", value).
      var groups = [];
      var currentLabel = "";
      var currentGroup = undefined;
      for (var v = 0; v < cells.length; v++) {
        var cell = cells[v];
        if (cell.classList.contains("record-detail1")) {
          if (!currentGroup) {
            currentGroup = { label: currentLabel, cells: [] };
            groups.push(currentGroup);
          }
          currentGroup.cells.push(cell);
        } else {
          currentGroup = undefined;
          var cellLabel = cleanLabel(cell.textContent);
          if (cellLabel) {
            currentLabel = cellLabel;
          }
        }
      }
      for (var g = 0; g < groups.length && g < sectionHeadings.length; g++) {
        var person = sections[sectionHeadings[g]];
        var groupLabel = groups[g].label;
        if (!person || !groupLabel) {
          continue;
        }
        if (groupLabel == "Name" && groups[g].cells.length >= 2) {
          var forenames = cleanValue(groups[g].cells[0].textContent);
          var surname = cleanValue(groups[g].cells[1].textContent);
          if (forenames) {
            person.forenames = forenames;
          }
          if (surname) {
            person.surname = surname;
          }
        } else {
          var personValue = cleanValue(groups[g].cells[0].textContent);
          if (personValue) {
            person[groupLabel] = personValue;
          }
        }
      }
      continue;
    }

    // Plain rows: label, value, label, value. The value is normally a .record-detail1 cell, but some
    // (e.g. Denomination on death pages) are plain cells, so a plain cell straight after a label also counts.
    // On death pages the Name is split into forenames and surname cells.
    for (var c = 0; c < cells.length - 1; c++) {
      var labelCell = cells[c];
      if (labelCell.classList.contains("record-detail1")) {
        continue;
      }
      var fieldLabel = cleanLabel(labelCell.textContent);
      var labelHasColon = /:\s*$/.test(clean(labelCell.textContent));
      if (!fieldLabel || (!labelHasColon && !cells[c + 1].classList.contains("record-detail1"))) {
        continue;
      }
      var valueCell = cells[c + 1];
      if (!valueCell.classList.contains("record-detail1") && /:\s*$/.test(clean(valueCell.textContent))) {
        continue; // the next cell is another label, so this label has no value
      }
      if (fieldLabel == "Name" && c + 2 < cells.length && cells[c + 2].classList.contains("record-detail1")) {
        var nameForenames = cleanValue(valueCell.textContent);
        var nameSurname = cleanValue(cells[c + 2].textContent);
        if (nameForenames) {
          fields["Forenames"] = nameForenames;
        }
        if (nameSurname) {
          fields["Surname"] = nameSurname;
        }
        c += 2;
        continue;
      }
      var value = cleanValue(valueCell.textContent);
      if (value) {
        fields[fieldLabel] = value;
      }
      c++; // skip the value cell
    }
  }
  result.recordData = fields;

  // drop sections with nothing recorded (e.g. unnamed witnesses)
  var recordedSections = {};
  var hasSections = false;
  for (var p = 0; p < sectionOrder.length; p++) {
    var sectionData = sections[sectionOrder[p]];
    for (var key in sectionData) {
      recordedSections[sectionOrder[p]] = sectionData;
      hasSections = true;
      break;
    }
  }
  if (hasSections) {
    result.sections = recordedSections;
  }

  // The notes are in a <pre> in a row after a "Notes:" label row
  var pre = table.querySelector("pre");
  if (pre) {
    var notes = pre.textContent.replace(/\r/g, "").trim();
    if (notes) {
      result.notes = notes;

      // Some centres (e.g. Waterford) write the notes as "Label: value" lines, such as
      // "Cause of death: ..." or "Informant: ...". When every line is like that, also keep them as fields.
      var noteLines = notes.split("\n");
      var noteFields = {};
      var allLabelled = true;
      for (var n = 0; n < noteLines.length; n++) {
        var line = clean(noteLines[n]);
        if (!line) {
          continue;
        }
        var lineMatch = line.match(/^([A-Za-z][A-Za-z ]{0,30}):\s*(.*)$/);
        if (!lineMatch) {
          allLabelled = false;
          break;
        }
        noteFields[lineMatch[1].trim()] = lineMatch[2].replace(/\s*\.+$/, "").trim();
      }
      if (allLabelled && Object.keys(noteFields).length > 0) {
        result.noteFields = noteFields;
      }
    }
  }

  // e.g. "© 2026 Copyright Kerry Genealogy"
  var copyright = table.querySelector(".copyright1");
  if (copyright) {
    var owner = clean(copyright.textContent).replace(/^©\s*\d{4}\s*copyright\s*/i, "");
    if (owner) {
      result.copyrightOwner = owner;
    }
  }

  // link to the National Library of Ireland microfilm, when the page shows one
  var microfilm = document.querySelector('a[target="micro-link"]');
  if (microfilm) {
    var href = microfilm.getAttribute("href");
    var hidden = /visibility:\s*hidden/i.test(microfilm.getAttribute("style") || "");
    if (href && !hidden) {
      result.microfilmLink = href;
    }
  }

  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
