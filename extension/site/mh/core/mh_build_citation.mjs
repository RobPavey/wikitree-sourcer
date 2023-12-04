/*
MIT License

Copyright (c) 2023 Robert M Pavey

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

const refKeys = [
  "Accession #",
  "Gale Id",
  "Source publication code",
  "Source",
  "Indexing Project (Batch) Number",
  "System Origin",
  "GS Film number",
  "Volume",
  "Page",
];

function removeUnwantedKeysForDataString(keys, recordData) {
  const exactMatchesToExclude = refKeys;

  function isKeyWanted(key) {
    for (let match of exactMatchesToExclude) {
      if (match == key) {
        return false;
      }
    }

    return true;
  }

  let newKeys = [];

  for (let key of keys) {
    if (isKeyWanted(key)) {
      newKeys.push(key);
    }
  }

  return newKeys;
}

function buildMhUrl(ed, builder) {
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle += ed.collectionTitle;
}

function buildSourceReference(ed, gd, builder) {
  if (ed.recordSections) {
    const censusData = ed.recordSections["Census"];
    if (censusData) {
      for (let key of Object.keys(censusData)) {
        builder.addSourceReferenceField(key, censusData[key]);
      }
    }
  }

  if (!builder.sourceReference) {
    if (ed.recordData) {
      for (let key of Object.keys(ed.recordData)) {
        if (refKeys.includes(key)) {
          let value = ed.recordData[key];
          if (value && value.value) {
            builder.addSourceReferenceField(key, value.value);
          }
        }
      }
    }
  }
}

function buildRecordLink(ed, gd, builder) {
  var mhUrl = buildMhUrl(ed, builder);

  let recordLink = "[" + mhUrl + " MyHeritage Record]";
  builder.recordLinkOrTemplate = recordLink;
}

// we can't use the standard one in citationBuilder because values are more complex in
// recorData for MH
function buildDataList(ed, gd, builder) {
  let options = builder.options;
  let recordData = ed.recordData;
  if (!recordData) {
    return;
  }

  let itemSep = ";";
  let valueSep = ":";
  if (options.citation_general_dataListSeparator == "commaColon") {
    itemSep = ",";
    valueSep = ":";
  } else if (options.citation_general_dataListSeparator == "commaSpace") {
    itemSep = ",";
    valueSep = "";
  }

  let keys = Object.keys(recordData);
  keys = removeUnwantedKeysForDataString(keys, recordData);

  let dataListString = "";
  function addValue(key, value) {
    if (value) {
      value = value.trim();
      if (dataListString != "") {
        dataListString += itemSep + " ";
      }
      if (key) {
        if (value.startsWith("http")) {
          dataListString += "[" + value + " " + key + "]";
        } else {
          dataListString += key + valueSep + " " + value;
        }
      } else {
        dataListString += value;
      }
    }
  }

  for (let key of keys) {
    let valueObj = recordData[key];
    if (valueObj) {
      if (valueObj.value) {
        addValue(key, valueObj.value);
      } else if (valueObj.dateString || valueObj.placeString || valueObj.descriptionString) {
        if (valueObj.descriptionString) {
          if (valueObj.descriptionString.startsWith(key)) {
            addValue("", valueObj.descriptionString);
          } else {
            addValue(key, valueObj.descriptionString);
          }
        }
        if (valueObj.dateString) {
          addValue(key + " date", valueObj.dateString);
        }
        if (valueObj.placeString) {
          addValue(key + " place", valueObj.placeString);
        }
      }
    }
  }

  return dataListString;
}

function buildDataString(ed, gd, builder) {
  let input = {
    generalizedData: gd,
    options: builder.options,
  };
  let dataString = DataString.buildDataString(input);

  if (!dataString) {
    dataString = buildDataList(ed, gd, builder);
  }

  if (!dataString) {
    dataString = DataString.buildDefaultDataString(input);
  }

  if (dataString) {
    if (!dataString.endsWith(".")) {
      dataString += ".";
    }
    builder.dataString = dataString;
  }
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  buildDataString(ed, gd, builder);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
