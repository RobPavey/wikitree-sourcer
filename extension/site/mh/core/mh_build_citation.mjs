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

const refLabels = [
  "Accession #",
  "Certificate",
  "Digital Folder Number",
  "File #",
  "Gale Id",
  "GS Film number",
  "Image Number",
  "Indexing Project (Batch) Number",
  "Line",
  "Line #",
  "NRS Reference",
  "Page",
  "Page #",
  "Record #",
  "Reference",
  "Reference ID",
  "Registration #",
  "Source",
  "Source publication code",
  "System Origin",
  "Town #",
  "Volume",
  "Volume #",
];

function removeUnwantedKeysForDataString(keys, recordData) {
  const exactMatchesToExclude = refLabels;

  function isLabelWanted(label) {
    for (let match of exactMatchesToExclude) {
      if (match == label) {
        return false;
      }
    }

    return true;
  }

  let newKeys = [];

  for (let key of keys) {
    let field = recordData[key];
    if (field) {
      let label = field.label;
      if (isLabelWanted(label)) {
        newKeys.push(key);
      }
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
        let field = ed.recordData[key];
        if (field && field.label && refLabels.includes(field.label)) {
          if (field.value) {
            const viewSource = "View this record on the website of ";
            let value = field.value;
            if (value.startsWith(viewSource)) {
              value = value.substring(viewSource.length);
            }
            builder.addSourceReferenceField(field.label, value);
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
  function addValue(label, value) {
    if (value) {
      value = value.trim();
      if (dataListString != "") {
        dataListString += itemSep + " ";
      }
      if (label) {
        if (value.startsWith("http")) {
          dataListString += "[" + value + " " + label + "]";
        } else {
          dataListString += label + valueSep + " " + value;
        }
      } else {
        dataListString += value;
      }
    }
  }

  for (let key of keys) {
    let valueObj = recordData[key];
    if (valueObj && valueObj.label) {
      if (valueObj.value) {
        addValue(valueObj.label, valueObj.value);
      } else if (valueObj.dateString || valueObj.placeString || valueObj.descriptionString) {
        if (valueObj.descriptionString) {
          if (valueObj.descriptionString.startsWith(valueObj.label)) {
            addValue("", valueObj.descriptionString);
          } else {
            addValue(valueObj.label, valueObj.descriptionString);
          }
        }
        if (valueObj.dateString) {
          addValue(valueObj.label + " date", valueObj.dateString);
        }
        if (valueObj.placeString) {
          addValue(valueObj.label + " place", valueObj.placeString);
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
