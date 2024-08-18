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
import { getRecordType } from "./scotp_utils.mjs";
import { ScotpRecordType, SpField, SpFeature } from "./scotp_record_type.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";

function getRefTitle(ed, gd) {
  let refTitle = gd.getRefTitle();

  if (gd.recordType == RT.Will) {
    // treat wills specially
    if (gd.recordSubtype == "Probate") {
      refTitle = "Probate";
    } else if (gd.recordSubtype == "LettersOfAdministration") {
      refTitle = "Letters of Administration";
    } else if (gd.recordSubtype == "Testament") {
      refTitle = "Will or Testament";
    } else if (gd.recordSubtype == "Inventory") {
      refTitle = "Inventory Confirmation";
    } else if (gd.recordSubtype == "AdditionalInventory") {
      refTitle = "Additional Inventory Confirmation";
    } else {
      refTitle = "Will or Testament";
    }
  }

  if (refTitle && refTitle != "Unclassified") {
    return refTitle;
  }

  return "";
}

function buildCitationUrl(ed, gd, options) {
  // could provide option to use a search style URL but don't see any reason to so far

  return "https://www.scotlandspeople.gov.uk/";
}

function removeUnwantedKeysForTable(keys, recordData) {
  // for the moment they are the same
  return removeUnwantedKeysForDataString(keys, recordData);
}

function removeUnwantedKeysForDataString(keys, recordData) {
  const exactMatchesToExclude = [
    "Ref",
    "Court Code",
    "Serial Number",
    "RD/EntryNumber",
    "Reference Number",
    "Parish Number",
    "Volume",
    "Record Number",
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

function buildValuationRollDataString(ed, gd, dataStyle, builder) {
  let dataString = gd.inferFullName();
  let date = gd.inferEventDate();
  if (date) {
    dataString += " in " + date;
  }
  let parish = gd.inferFullEventPlace();
  let place = "";
  if (ed.recordData) {
    let placeString = ed.recordData["Place"];
    if (placeString) {
      place = StringUtils.toInitialCapsEachWord(placeString);
    }
  }

  if (place) {
    dataString += " at " + place;
  }
  if (parish) {
    dataString += " in the parish of " + parish;
  }

  return dataString;
}

function buildDataString(ed, gd, dataStyle, builder) {
  let options = builder.options;

  let dataString = "";

  if (dataStyle == "string") {
    if (gd.recordType == RT.ValuationRoll) {
      let dataString = buildValuationRollDataString(ed, gd, dataStyle, builder);
      if (dataString) {
        return dataString;
      }
    } else {
      let input = {
        generalizedData: gd,
        options: options,
      };
      dataString = DataString.buildDataString(input);
      if (dataString) {
        return dataString;
      }
    }
  }

  let recordData = ed.recordData;

  dataString = "";

  // I don't think this will ever happen
  if (!recordData) {
    dataString = ed.heading + " in " + ed.place;
    return dataString;
  }

  dataString = builder.buildDataList(recordData, removeUnwantedKeysForDataString);

  return dataString;
}

function getAdditionalInfo(ed, gd, builder) {
  let citationType = builder.type;
  let options = builder.options;

  let dataStyle = options.citation_scotp_dataStyle;
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

function buildSourceReference(ed, gd, builder) {
  if (!ed.recordData) {
    return;
  }

  const exactMatchesToIncludeInReference = [
    "Ref",

    "Court Code",
    "Serial Number",

    "RD/EntryNumber",
    "Reference Number",
    "Parish Number",
    "Volume",
    "Record Number",
    "Service Number",
  ];

  const backupMatchesToIncludeInReference = ["Parish"];

  function isKeyWantedInReference(key) {
    for (let match of exactMatchesToIncludeInReference) {
      if (match == key) {
        return true;
      }
    }
    return false;
  }

  function isBackupKeyWantedInReference(key) {
    for (let match of backupMatchesToIncludeInReference) {
      if (match == key) {
        return true;
      }
    }
    return false;
  }

  function addTerm(title, value) {
    builder.addSourceReferenceField(title, value);
  }

  for (let key in ed.recordData) {
    if (isKeyWantedInReference(key)) {
      addTerm(key, ed.recordData[key]);
    }
  }

  if (!builder.sourceReference) {
    for (let key in ed.recordData) {
      if (isBackupKeyWantedInReference(key)) {
        addTerm(key, ed.recordData[key]);
      }
    }
  }

  if (gd.collectionData) {
    if (gd.collectionData.frameNumber) {
      let value = gd.collectionData.frameNumber;
      if (gd.collectionData.frameNumber2) {
        value += " (" + gd.collectionData.frameNumber2 + ")";
      }
      addTerm("Frame", value);
    }
    if (gd.collectionData.pageNumber) {
      addTerm("Page", gd.collectionData.pageNumber);
    }
  }

  // Note we put the "National Records of Scotland" in the websiteCreatorOwner, not here

  //console.log("sourceReference is: " + builder.sourceReference);
}

function buildSourceTitle(ed, options) {
  let recordType = getRecordType(ed);

  // fallback is the pageHeader but it is a bit ugly. e.g.:
  // Church registers - Other Church Registers Baptisms
  // So we use a title from the record type if available.
  let sourceTitle = ed.pageHeader;
  let nrsTitle = ScotpRecordType.getNrsTitle(recordType);
  if (nrsTitle && options.citation_scotp_databaseTitle == "nrs") {
    sourceTitle = nrsTitle;
  }

  switch (recordType) {
    case "opr_births":
    case "opr_deaths":
      // NRS doesn't put Church of Scotland on front but Scotland Project likes it
      sourceTitle = "Church of Scotland: " + sourceTitle;
      break;

    case "opr_marriages":
      // NRS includes "Proclamation of Banns" but Scotland Project uses this
      sourceTitle = "Church of Scotland: Old Parish Registers - Banns and Marriages";
      break;

    case "census":
      sourceTitle = "Scotland Census, " + ed.recordData["Year"];
      break;

    case "census_lds":
      sourceTitle = "Scotland Census, " + ed.recordData["Year"] + " (LDS)";
      break;
  }

  return sourceTitle;
}

function buildCoreCitation(ed, gd, builder) {
  let options = builder.getOptions();

  // this may need changing for census - modify and add year
  builder.sourceTitle = buildSourceTitle(ed, options);

  // Note we put the "National Records of Scotland" in the websiteCreatorOwner, so it doesn't move
  // with source reference depending on options
  builder.websiteCreatorOwner = "National Records of Scotland";

  buildSourceReference(ed, gd, builder);

  var url = buildCitationUrl(ed, gd, options);

  if (options.citation_scotp_urlStyle == "visible") {
    builder.recordLinkOrTemplate = url;
  } else {
    const linkTitle = "ScotlandsPeople";
    let recordLink = "[" + url + " " + linkTitle + "]";
    builder.recordLinkOrTemplate = recordLink;
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
