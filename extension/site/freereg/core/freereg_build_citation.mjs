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

import { CitationBuilder } from "../../../base/core/citation_builder.mjs";
import { DataString } from "../../../base/core/data_string.mjs";

function getRefTitle(ed, gd) {
  let refTitle = gd.getRefTitle();

  if (refTitle && refTitle != "Unclassified") {
    return refTitle;
  }

  return "";
}

function getRecordDataValueForKeys(data, keys) {
  for (let key of keys) {
    let value = data.recordData[key];
    if (value) {
      return value;
    }
  }
}

function removeUnwantedKeysForDataString(keys, recordData) {
  const exactMatchesToExclude = ["File line number"];
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

function removeUnwantedKeysForTable(keys, recordData) {
  return removeUnwantedKeysForDataString(keys, recordData);
}

function buildCustomDataString(gd, options) {
  let input = {
    generalizedData: gd,
    options: options,
  };
  return DataString.buildDataString(input);
}

function buildDataString(data, gd, options) {
  let dataString = "";

  if (options.citation_freereg_dataStyle == "string") {
    dataString = buildCustomDataString(gd, options);
    if (dataString) {
      return dataString;
    }
  }

  // build a list string
  let recordData = data.recordData;

  dataString = "";

  if (recordData) {
    let keys = Object.keys(recordData);
    keys = removeUnwantedKeysForDataString(keys, recordData);
    for (let key of keys) {
      let value = recordData[key];
      if (value) {
        if (dataString != "") {
          dataString += "; ";
        }
        dataString += key + ": " + value;
      }
    }
  }

  if (dataString) {
    dataString += ".";
  }

  return dataString;
}

function getAdditionalInfo(data, gd, citationType, options) {
  if (options.citation_freereg_dataStyle == "none") {
    return "";
  }

  if (
    citationType == "source" ||
    options.citation_freereg_dataStyle == "string" ||
    options.citation_freereg_dataStyle == "list"
  ) {
    return buildDataString(data, gd, options);
  }

  // style must be table
  var result = "";
  let recordData = data.recordData;
  if (recordData) {
    let keys = Object.keys(recordData);

    keys = removeUnwantedKeysForTable(keys, recordData);
    if (keys.length > 0) {
      // start table
      result = '{| border="1"\n';
      let firstRow = true;

      for (let key of keys) {
        if (firstRow) {
          firstRow = false;
        } else {
          result += "|-\n";
        }
        result += "| " + key + " || " + recordData[key] + "\n";
      }

      result += "|}";
    }
  }

  return result;
}

function buildSourceReference(data, builder) {
  // Example:
  // Gloucestershire : Dursley : St James : Register of unspecified type. File line number: 1875

  if (!data.recordData) {
    return;
  }

  function addRefPart(value) {
    builder.addSourceReferenceText(value);
  }

  function addRefPartForKeys(keys) {
    let value = getRecordDataValueForKeys(data, keys);
    addRefPart(value);
  }

  addRefPartForKeys(["County"]);
  addRefPartForKeys(["Place"]);
  addRefPartForKeys(["Church name"]);

  let registerType = getRecordDataValueForKeys(data, ["Register type"]);
  if (registerType == "Unspecified") {
    addRefPart("Register of unspecified type");
  } else if (registerType) {
    addRefPart(registerType);
  }

  let fileLineNumber = getRecordDataValueForKeys(data, ["File line number"]);
  if (fileLineNumber) {
    builder.addSourceReferenceField("File line number", fileLineNumber);
  }
}

function getRecordLink(data) {
  // URL might be something like:
  // https://www.freereg.org.uk/search_records/581832b7e93790ec8be6619e/elizabeth-pavey-baptism-gloucestershire-dursley-1713-09-28?citation_type=wikitree&locale=en
  // or:
  // https://www.freereg.org.uk/search_records/5817d04fe93790ec8b31442f/philip-john-marett-jordan-baptism-jersey-st-helier-1874-06-14?locale=en
  // We want:
  // https://www.freereg.org.uk/search_records/5a1466eaf4040b9d6e5d459c
  let url = data.url;

  let newUrl = url;
  const searchRecordsText = "/search_records/";
  const searchRecordsIndex = url.indexOf(searchRecordsText);
  if (searchRecordsIndex != -1) {
    let nextSlashIndex = url.indexOf("/", searchRecordsIndex + searchRecordsText.length);
    if (nextSlashIndex != -1) {
      newUrl = url.substring(0, nextSlashIndex);
    }
  }

  let recordLink = "[" + newUrl + " FreeReg Transcription]";

  return recordLink;
}

function buildCoreCitation(data, gd, builder) {
  // Example citation:
  // '''Baptism''':
  // "FreeReg UK Parish Register database"
  // Gloucestershire : Dursley : St James : Register of unspecified type. File line number: 1875
  // [https://www.freereg.org.uk/search_records/581832b7e93790ec8be6619e FreeReg Transcription] (accessed 16 April 2022)
  // Baptism of Elizabeth Pavey on 28 Sep 1713. Parents John & Sarah.

  let options = builder.getOptions();

  let sourceTitle = "FreeReg UK Parish Register database";
  builder.sourceTitle = sourceTitle;
  builder.putSourceTitleInQuotes = true;

  buildSourceReference(data, builder);

  builder.recordLinkOrTemplate = getRecordLink(data);

  builder.dataString = getAdditionalInfo(data, gd, builder.type, options);
}

function buildCitation(input) {
  const data = input.extractedData;
  const gd = input.generalizedData;
  const runDate = input.runDate;
  const options = input.options;
  const type = input.type; // "inline", "narrative" or "source"

  let builder = new CitationBuilder(type, runDate, options);

  buildCoreCitation(data, gd, builder);

  builder.meaningfulTitle = getRefTitle(data, gd);

  if (type == "narrative") {
    builder.addNarrative(gd, input.dataCache, options);
  }

  // now the builder is setup use it to build the citation text
  let fullCitation = builder.getCitationString();

  //console.log(fullCitation);

  var citationObject = {
    citation: fullCitation,
    type: type,
  };

  return citationObject;
}

export { buildCitation };
