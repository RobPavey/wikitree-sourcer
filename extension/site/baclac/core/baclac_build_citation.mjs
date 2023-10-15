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

import { simpleBuildCitationWrapper } from "../../../base/core/citation_builder.mjs";
import { DataString } from "../../../base/core/data_string.mjs";
import { BaclacEdReader } from "./baclac_ed_reader.mjs";

function buildBaclacUrl(ed, edReader, builder) {
  return edReader.getRecordLink();
}

function buildSourceTitle(ed, gd, edReader, builder) {
  builder.sourceTitle = edReader.getSourceTitle();
}

function buildSourceReference(ed, gd, edReader, builder) {
  builder.sourceReference = edReader.getSourceReference(builder.options);
}

function buildRecordLink(ed, gd, edReader, builder) {
  var baclacUrl = buildBaclacUrl(ed, edReader, builder);

  let recordLink = "[" + baclacUrl + " Library and Archives Canada]";
  builder.recordLinkOrTemplate = recordLink;
}

const referenceKeys = [
  ["reference"],
  ["page number"],
  ["line number"],
  ["family number"],
  ["microfilm reel number", "microfilm"],
  ["bundle"],
  ["image number"],
  ["item id number"],
];

function isReferenceKey(key) {
  let lcKey = key.toLowerCase();
  for (let keyList of referenceKeys) {
    if (keyList.includes(lcKey)) {
      return true;
    }
  }
  return false;
}

function removeUnwantedKeysForDataString(keys, recordData) {
  let newKeys = [];

  for (let key of keys) {
    if (key.includes("Found in")) continue;
    if (key.includes("Hierarchical level")) continue;
    if (key.includes("Type of material")) continue;
    if (key.includes("Help page")) continue;
    if (key.includes("Additional information")) continue;
    if (key.includes("General Note")) continue;

    if (isReferenceKey(key)) continue;

    newKeys.push(key);
  }

  return newKeys;
}

function buildDataList(ed, gd, edReader, builder) {
  let dataString = "";
  let options = builder.options;

  // build a list string
  let recordData = ed.recordData;

  dataString = "";

  let itemSep = ";";
  let valueSep = ":";
  if (options.citation_general_dataListSeparator == "commaColon") {
    itemSep = ",";
    valueSep = ":";
  } else if (options.citation_general_dataListSeparator == "commaSpace") {
    itemSep = ",";
    valueSep = "";
  }

  if (ed.url.includes("fonandcol") && ed.name) {
    let text = ed.name;
    let sepIndex = text.indexOf(" = ");
    if (sepIndex != -1) {
      text = text.substring(0, sepIndex).trim();
    }
    dataString += text;
  } else if (ed.url.includes("cabcon") && ed.name) {
    dataString += ed.name;
  } else {
    let name = gd.inferFullName();
    if (name) {
      dataString += "Name" + valueSep + " " + name;
    }
  }

  if (recordData) {
    let keys = Object.keys(recordData);
    keys = removeUnwantedKeysForDataString(keys, recordData);
    for (let key of keys) {
      let value = recordData[key];
      if (value) {
        if (dataString != "") {
          dataString += itemSep + " ";
        }
        dataString += key + valueSep + " " + value;
      }
    }
  }

  return dataString;
}

function buildDataSection(ed, gd, edReader, builder) {
  let input = {
    generalizedData: gd,
    options: builder.options,
  };

  let dataString = DataString.buildDataString(input);

  if (!dataString) {
    dataString = buildDataList(ed, gd, edReader, builder);
  }

  if (dataString) {
    if (!dataString.endsWith(".")) {
      dataString += ".";
    }
    builder.dataString = dataString;
  }
}

function buildCoreCitation(ed, gd, builder) {
  let edReader = new BaclacEdReader(ed);

  buildSourceTitle(ed, gd, edReader, builder);
  buildSourceReference(ed, gd, edReader, builder);
  buildRecordLink(ed, gd, edReader, builder);

  buildDataSection(ed, gd, edReader, builder);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
