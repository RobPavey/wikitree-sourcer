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
import { RT } from "../../../base/core/record_type.mjs";
import { DataString } from "../../../base/core/data_string.mjs";

function getRefTitle(ed, gd) {
  const recordTypeToRefTitle = [
    {
      type: RT.Census,
      defaultTitle: "Census",
      addYear: true,
      titleMatches: [{ title: "Register", matches: ["1939 Register"] }],
    },
  ];

  let refTitle = gd.getRefTitle(ed.collection, recordTypeToRefTitle);

  if (refTitle && refTitle != "Unclassified") {
    return refTitle;
  }

  if (ed.recordData && ed.recordData.hasOwnProperty("Event Type")) {
    return ed.recordData["Event Type"];
  }

  if (ed.recordData && ed.recordData.hasOwnProperty("Record Type")) {
    return ed.recordData["Record Type"];
  }

  return "";
}

function removeUnwantedKeysForTable(keys, recordData) {
  // for the moment they are the same
  return removeUnwantedKeysForDataString(keys, recordData);
}

function removeUnwantedKeysForDataString(keys, recordData) {
  const exactMatchesToExclude = [
    "Collections from",
    "Event type",
    "Archive",
    "Archive series",
    "Series",
    "Archive ref",
    "Archive reference",
    "Reference",
    "District reference",
    "Record set",
    "Category",
    "Subcategory",
    "Page",
    "Page number",
    "Folio",
    "Piece number",
    "Schedule",
    "Schedule number",
    "Schedule type code",
    "Schedule type",
    "Rolls",
  ];
  function isKeyWanted(key) {
    for (let match of exactMatchesToExclude) {
      if (match == key) {
        return false;
      }
    }

    // if there is a year plus a date for the same thing exclude the year
    const yearEnding = " year";
    if (key.endsWith(yearEnding)) {
      let dateKey = key.substring(0, key.length - yearEnding.length) + " date";
      if (keys.includes(dateKey)) {
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

function buildDataString(ed, gd, dataStyle, builder) {
  let options = builder.options;

  let dataString = "";

  if (dataStyle == "string") {
    let input = {
      generalizedData: gd,
      options: options,
    };
    dataString = DataString.buildDataString(input);
    if (dataString) {
      return dataString;
    }
  }

  let recordData = ed.recordData;

  dataString = "";

  // I don't think this will ever happen
  if (!recordData) {
    if (ed.heading) {
      dataString = ed.heading;
      if (ed.place) {
        dataString += " in " + ed.place;
      }
    }
    return dataString;
  }

  dataString = builder.buildDataList(recordData, removeUnwantedKeysForDataString);

  return dataString;
}

function getAdditionalInfo(ed, gd, builder) {
  let citationType = builder.type;
  let options = builder.options;

  let dataStyle = options.citation_fmp_dataStyle;
  if (dataStyle == "none") {
    return "";
  } else if (dataStyle == "table") {
    if (options.citation_general_referencePosition == "atEnd") {
      dataStyle = "string";
    } else if (citationType == "source") {
      dataStyle = "list";
    }
  }

  if (dataStyle == "string" || dataStyle == "list") {
    return buildDataString(ed, gd, dataStyle, builder);
  }

  // style must be table
  var result = "";
  let recordData = ed.recordData;
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

function buildSourceReference(ed, builder) {
  if (!ed.recordData) {
    return "";
  }

  function getRecordData(keyList) {
    for (let key of keyList) {
      let value = ed.recordData[key];
      if (value) {
        return value;
      }
    }
  }

  // Archive reference: RG13, Piece number: 1440; Folio 55; Page: 2

  let archive = getRecordData(["Archive"]);
  let archiveReference = getRecordData(["Archive reference", "Archive ref", "Reference"]);
  let rolls = getRecordData(["Rolls"]);
  let pieceNumber = getRecordData(["Piece number"]);
  let bookNumber = getRecordData(["Book number"]);
  let folio = getRecordData(["Folio", "Folio number"]);

  let volume = getRecordData(["Volume"]);
  let page = getRecordData(["Page", "Page number"]);
  let schedule = getRecordData(["Schedule"]);
  let series = getRecordData(["Series", "Archive series"]);

  let registrationNumber = getRecordData(["Registration number"]);

  let districtNumber = getRecordData(["Registration district number"]);
  let enumerationDistrict = getRecordData(["Enumeration district"]);
  let districtReference = getRecordData(["District reference"]);

  function addTerm(title, value) {
    builder.addSourceReferenceField(title, value);
  }

  addTerm("Archive", archive);
  addTerm("Series", series);
  addTerm("Reference", archiveReference);
  addTerm("Rolls", rolls);
  addTerm("Piece number", pieceNumber);
  addTerm("Book number", bookNumber);
  addTerm("Folio", folio);
  addTerm("Volume", volume);
  addTerm("Page", page);
  addTerm("Schedule", schedule);
  addTerm("Registration Number", registrationNumber);
  addTerm("District reference", districtReference);
}

function buildShareImageCitation(ed, gd, builder) {
  const options = builder.getOptions();

  if (ed.heading) {
    builder.sourceTitle = ed.heading;
  } else {
    builder.sourceTitle = "Findmypast";
  }

  builder.sourceReference = ed.detailText;

  if (ed.url) {
    builder.recordLinkOrTemplate = "[" + ed.url + " FindMyPast Share Image]";
  }

  if (ed.description) {
    builder.dataString = ed.description;
  }
}

function buildCoreCitation(ed, gd, builder) {
  if (ed.urlImageShareId) {
    buildShareImageCitation(ed, gd, builder);
    return;
  }

  const options = builder.getOptions();

  builder.includeSubscriptionRequired = options.citation_fmp_subscriptionRequired;

  builder.sourceTitle = ed.collection;
  buildSourceReference(ed, builder);

  let imageUrl = ed.imageUrl;
  let transcriptUrl = ed.url;

  if (ed.urlPath == "record") {
    // this came from an image page
    // If url looks like:
    // https://search.findmypast.co.uk/record?id=GBC%2F1921%2FRG15%2F12939%2F0163&parentid=GBC%2F1921%2FRG15%2F12939%2F0163%2F01
    // then transcript URL is:
    // https://www.findmypast.co.uk/transcript?id=GBC/1921/RG15/12939/0163/01
    imageUrl = ed.url;
    const parentPrefix = "&parentid=";
    let prefixIndex = imageUrl.indexOf(parentPrefix);
    if (prefixIndex != -1) {
      let parentPart = imageUrl.substring(prefixIndex + parentPrefix.length);
      transcriptUrl = "https://www." + ed.domain + "/transcript?id=" + parentPart;
    }
  }

  if (imageUrl) {
    builder.databaseHasImages = true;
    if (options.citation_fmp_includeImageLink) {
      builder.imageLink = "[" + imageUrl + " FindMyPast Image]";
    }
  }

  if (transcriptUrl) {
    builder.recordLinkOrTemplate = "[" + transcriptUrl + " FindMyPast Transcription]";
  }

  let additionalInfo = getAdditionalInfo(ed, gd, builder);
  if (additionalInfo) {
    builder.dataString = additionalInfo;
  }
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation, getRefTitle);
}

export { buildCitation };
