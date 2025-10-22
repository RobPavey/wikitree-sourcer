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
import { RecordSubtype, RT } from "../../../base/core/record_type.mjs";
import { simpleBuildCitationWrapper } from "../../../base/core/citation_builder.mjs";
import { NzashEdReader } from "./nzash_ed_reader.mjs";

function splitTwoLineValue(value) {
  if (value) {
    let results = value.split(/\s*\n\s*/);
    for (let index = 0; index < results.length; index++) {
      results[index] = results[index].trim();
    }
    return results;
  }
  return [];
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle = ed.headerText;
}

function buildSourceReference(ed, gd, builder) {
  if (ed.reference) {
    builder.sourceReference = ed.reference;
  }
}

function buildRecordLink(ed, gd, builder) {
  let options = builder.getOptions();

  let recordLink = "";

  let linkText = "New Zealand Ancestor Search Helper";

  if (gd.recordType == RT.Marriage) {
    if (gd.recordSubtype == RecordSubtype.IntentionToMarry) {
      linkText = "NZ Intention to Marry Project";
    }
  }

  recordLink = "[" + ed.url + " " + linkText + "]";

  if (recordLink) {
    builder.recordLinkOrTemplate = recordLink;
  }
}

function buildCuratedListDataString(ed, gd, builder) {
  if (ed.recordData) {
    let fields = [];
    for (let key of Object.keys(ed.recordData)) {
      let value = ed.recordData[key];
      if (value) {
        let parts = splitTwoLineValue(value);
        if (value.length > 1) {
          let valueString = "";
          for (let index = 0; index < parts.length; index++) {
            let cleanPart = parts[index].trim();
            if (index != 0) {
              valueString += " / ";
            }
            valueString += cleanPart;
          }
          fields.push({ key: key, value: valueString });
        } else {
          fields.push({ key: key, value: value });
        }
      }
    }

    builder.addListDataString(fields);
  }
}

function buildDataString(ed, gd, builder) {
  let options = builder.getOptions();

  buildCuratedListDataString(ed, gd, builder);
}

function buildRefTitle(ed, gd) {
  if (gd.recordType == RT.Marriage) {
    if (gd.recordSubtype == RecordSubtype.IntentionToMarry) {
      return "Intention to Marry";
    }
  }
  return gd.getRefTitle();
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  buildDataString(ed, gd, builder);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation, buildRefTitle);
}

export { buildCitation };
