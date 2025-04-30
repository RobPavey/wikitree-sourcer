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
import { RT } from "../../../base/core/record_type.mjs";

function getCleanRecordDataValue(recordData, fieldName) {
  let value = recordData[fieldName];
  if (value == undefined) {
    return value;
  }

  // sometimes there are values in square brackets after the first value
  // these make it hard to parse dates, places, names etc so remove them
  let bracketIndex = value.indexOf("[");
  if (bracketIndex != -1) {
    value = value.substring(0, bracketIndex).trim();
  }

  return value;
}

function getRefTitle(ed, gd) {
  const recordTypeToRefTitle = [
    {
      type: RT.Census,
      defaultTitle: "Census",
      addYear: true,
      titleMatches: [{ title: "Register", matches: ["1939 England and Wales Register"] }],
    },
  ];

  let refTitle = gd.getRefTitle(ed.titleCollection, recordTypeToRefTitle);

  if (refTitle && refTitle != "Unclassified" && refTitle != "Record" && !refTitle.startsWith("Record of ")) {
    return refTitle;
  }

  let rd = ed.recordData;
  if (rd) {
    // A user reported getting "rd.hasOwnProperty is not a function" once
    if (Object.prototype.hasOwnProperty.call(rd, "Event Type")) {
      return rd["Event Type"];
    }

    if (Object.prototype.hasOwnProperty.call(rd, "Record Type")) {
      return rd["Record Type"];
    }
  }

  if (refTitle && refTitle != "Unclassified") {
    return refTitle;
  }

  return "";
}

function getImageRefTitle(titleCollection, imageBrowsePath) {
  const titleCollectionTightMatches = [
    { title: "Death", matches: ["Death Records"] },
    { title: "Probate", matches: ["Probate Records"] },
  ];

  const imageBrowsePathTightMatches = [
    { title: "Death", matches: ["Death Certificates"] },
    { title: "Probate", matches: ["Probate Records"] },
  ];

  const titleCollectionLooseMatches = [
    { title: "Birth", matches: ["Birth"] },
    { title: "Baptism", matches: ["Baptism"] },
    { title: "Marriage", matches: ["Marriage"] },
    { title: "Death", matches: ["Death"] },
    { title: "Burial", matches: ["Burial"] },
    { title: "Probate", matches: ["Probate"] },
  ];

  const imageBrowsePathLooseMatches = [
    { title: "Birth", matches: ["Birth"] },
    { title: "Baptism", matches: ["Baptism"] },
    { title: "Marriage", matches: ["Marriage"] },
    { title: "Death", matches: ["Death"] },
    { title: "Burial", matches: ["Burial"] },
    { title: "Probate", matches: ["Probate"] },
  ];

  function lookup(title, table) {
    for (let obj of table) {
      if (obj.matches) {
        for (let match of obj.matches) {
          if (title && title.includes(match)) {
            return obj.title;
          }
        }
      }
    }
  }

  if (titleCollection) {
    let refTitle = lookup(titleCollection, titleCollectionTightMatches);
    if (refTitle) {
      return refTitle;
    }
  }

  if (imageBrowsePath) {
    let refTitle = lookup(imageBrowsePath, imageBrowsePathTightMatches);
    if (refTitle) {
      return refTitle;
    }
  }

  if (titleCollection) {
    let refTitle = lookup(titleCollection, titleCollectionLooseMatches);
    if (refTitle) {
      return refTitle;
    }
  }

  if (imageBrowsePath) {
    let refTitle = lookup(imageBrowsePath, imageBrowsePathLooseMatches);
    if (refTitle) {
      return refTitle;
    }
  }

  // no matches
  if (titleCollection && imageBrowsePath) {
    // choose the shorter one
    return imageBrowsePath.length < titleCollection.length ? imageBrowsePath : titleCollection;
  }
  if (titleCollection) {
    return titleCollection;
  }
  if (imageBrowsePath) {
    return imageBrowsePath;
  }

  return "Unclassified";
}

function getSharingPageRefTitle(titleCollection) {
  const titleCollectionMatches = [
    { title: "Death", matches: ["Death Records"] },
    { title: "Probate", matches: ["Probate Records"] },
    { title: "Census", matches: ["Census"] },
    { title: "School Records", matches: ["School"] },
    { title: "Workhouse Records", matches: ["Workhouse"] },
    { title: "Birth or Baptism", matches: ["Births and Baptisms"] },
    { title: "Birth", matches: ["Births"] },
    { title: "Baptism", matches: ["Baptisms"] },
    { title: "Birth", matches: ["Birth"] },
    { title: "Baptism", matches: ["Baptism"] },
  ];

  function lookup(title, table) {
    for (let obj of table) {
      if (obj.matches) {
        for (let match of obj.matches) {
          if (title && title.includes(match)) {
            return obj.title;
          }
        }
      }
    }
  }

  if (titleCollection) {
    let refTitle = lookup(titleCollection, titleCollectionMatches);
    if (refTitle) {
      if (titleCollection.search(/\d\d\d\d /) == 0) {
        refTitle = titleCollection.substring(0, 4) + " " + refTitle;
      }
      return refTitle;
    }
  }

  // no matches
  if (titleCollection) {
    return titleCollection;
  }

  return "Unclassified";
}

function modifyValueForUrl(builder, value) {
  let target = builder.getOptions().citation_general_target;

  if (value.startsWith("https://www.findagrave.com/memorial")) {
    if (target == "wikitree") {
      let memorialId = value.replace(/^https\:\/\/www\.findagrave\.com\/memorial\/(\d+)\/.*$/, "$1");
      if (memorialId && memorialId != value) {
        return "{{FindAGrave|" + memorialId + "}}";
      }
    }
  }

  return value;
}

const referenceKeys = [
  ["reference number"],
  ["registration number"],
  ["declaration number"],
  ["marriage certificate number", "certificate number"],
  ["book"],
  ["piece"],
  ["folio"],
  ["volume", "volume number"],
  ["page", "page number", "os page"],
  ["line", "line number"],
  ["roll"],
  ["reel number"],
  ["fhl film number"],
  ["schedule", "schedule number", "household schedule number"],
  ["parish number"],
  ["household number"],
  ["sub schedule number", "sub-schedule number"],
  ["registration district number"],
  ["ed, institution, or vessel"], // this always seems to be a number
  ["enumeration district or census tract"], // this always seems to be a number
  ["newspaper information"],
  ["url"],
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

function getReferenceKeyListForKey(key) {
  let lcKey = key.toLowerCase();
  for (let keyList of referenceKeys) {
    if (keyList.includes(lcKey)) {
      return keyList;
    }
  }
  return undefined;
}

function removeUnwantedKeysForTable(keys, recordData) {
  let newKeys = [];

  for (let key of keys) {
    if (key.includes("Parish Map") || recordData[key].startsWith("View")) continue;

    if (key.includes("Search") || key.includes("Learn More")) continue;

    // remove SSN for privacy. This could be an option
    if (key.includes("Social Security #")) continue;
    if (key == "SSN") continue;

    if (isReferenceKey(key)) continue;

    newKeys.push(key);
  }

  return newKeys;
}

function removeUnwantedKeysForDataString(keys, recordData) {
  let newKeys = [];

  for (let key of keys) {
    if (key.includes("Parish Map") || recordData[key].startsWith("View")) continue;

    if (key.includes("Search") || key.includes("Learn More")) continue;
    if (key.includes("as it Appears") || key.includes("Register Type")) continue;
    if (key.includes("Other Records") || key.includes("Family Members")) continue;

    // remove SSN for privacy. This could be an option
    if (key.includes("Social Security #")) continue;
    if (key == "SSN") continue;

    if (isReferenceKey(key)) continue;

    newKeys.push(key);
  }

  return newKeys;
}

function addReferenceDataToSourceReference(ed, builder, options) {
  if (ed.recordData) {
    let keys = Object.keys(ed.recordData);

    if (!builder.sourceReference) {
      builder.sourceReference = "";
    }

    const itemSep = builder.getSourceReferenceItemSeparator();
    const valueSep = builder.getSourceReferenceValueSeparator();

    let lcSourceReference = builder.sourceReference.toLowerCase();

    for (let key of keys) {
      let refKeyList = getReferenceKeyListForKey(key);
      if (refKeyList) {
        let value = ed.recordData[key];

        if (value) {
          // can't just test value since it could be something like "1"
          let alreadyInSourceReference = false;
          for (let refKey of refKeyList) {
            let matchString = itemSep + " " + refKey + valueSep;
            let startString = refKey + valueSep;
            if (lcSourceReference.includes(matchString) || lcSourceReference.startsWith(startString)) {
              // now check value is the same
              let index = lcSourceReference.indexOf(matchString);
              let valIndex = 0;
              if (index == -1) {
                index = 0; // must be at start
                valIndex = index + startString.length;
              } else {
                valIndex = index + matchString.length;
              }
              let endIndex = lcSourceReference.indexOf(itemSep, valIndex);
              if (endIndex == -1) {
                endIndex = lcSourceReference.length;
              }
              let matchValue = lcSourceReference.substring(valIndex, endIndex).trim();
              if (matchValue == value.toLowerCase()) {
                alreadyInSourceReference = true;
                break;
              }
            }
          }
          if (!alreadyInSourceReference) {
            if (key == "URL") {
              value = modifyValueForUrl(builder, value);
            }

            if (value.startsWith("{{")) {
              builder.addSourceReferenceText(value);
            } else {
              builder.addSourceReferenceField(key, value);
            }
          }
        }
      }
    }
  }
}

function cleanSourceReference(builder) {
  const options = builder.getOptions();

  let string = builder.sourceReference;

  if (string) {
    string = string.replace(/\;?\s*Social Security\:\s*\d+/, "");
  }

  if (
    string &&
    (options.citation_general_sourceReferenceSeparator == "commaColon" ||
      options.citation_general_sourceReferenceSeparator == "commaSpace")
  ) {
    // Ancestry uses semi-colon separator by default, if user wants comma replace ; with ,
    string = string.replace(/\; /g, ", ");

    if (options.citation_general_sourceReferenceSeparator == "commaSpace") {
      string = string.replace(/\: /g, " ");
    }
  }

  builder.sourceReference = string;
}

function getOneOfPossibleFieldNames(recordData, names) {
  for (let name of names) {
    let value = getCleanRecordDataValue(recordData, name);
    if (value) {
      return value;
    }
  }
}

function buildCustomDataString(gd, options) {
  let input = {
    generalizedData: gd,
    options: options,
  };
  return DataString.buildDataString(input);
}

function buildDataString(ed, gd, dataStyle, options, builder) {
  let dataString = "";

  if (dataStyle == "string") {
    dataString = buildCustomDataString(gd, options);
    if (dataString) {
      return dataString;
    }
  }

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

  if (recordData) {
    let keys = Object.keys(recordData);
    keys = removeUnwantedKeysForDataString(keys, recordData);
    for (let key of keys) {
      let value = recordData[key];
      if (value) {
        if (dataString != "") {
          dataString += itemSep + " ";
        }
        if (key.startsWith("Household Members") || key.startsWith("Household Member(s)")) {
          if (!builder.householdTableString) {
            let newKey = key.replace(/\<br\/\>/g, " ");
            if (options.citation_general_addBreaksWithinBody) {
              dataString += "<br/>";
              dataString += newKey + valueSep + "<br/>" + value;
            } else {
              let newValue = value.replace(/\<br\/\>/g, ", ");
              dataString += newKey + valueSep + " " + newValue;
            }
          }
        } else if (value.indexOf("<br/>") != -1 && !options.citation_general_addBreaksWithinBody) {
          let newValue = value.replace(/\<br\/\>/g, ", ");
          dataString += key + valueSep + " " + newValue;
        } else {
          dataString += key + valueSep + " " + value;
        }
      }
    }
  } else {
    let titleName = ed.titleName;
    if (!titleName && recordData) {
      let name = getOneOfPossibleFieldNames(recordData, ["Name"]);
      if (name) {
        titleName = name;
      }
    }

    dataString += titleName;
  }

  return dataString;
}

function getAdditionalInfo(ed, gd, citationType, options, builder) {
  let dataStyle = options.citation_ancestry_dataStyle;
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
    return buildDataString(ed, gd, dataStyle, options, builder);
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

function buildAncestryRecordTemplate(ed, options) {
  let target = options.citation_general_target;

  if (target == "plain") {
    return "Ancestry Record Link: " + ed.url;
  }

  const domainParams = {
    com: "",
    "co.uk": "uk",
    ca: "ca",
    "com.au": "au",
    de: "de",
    it: "it",
    fr: "fr",
    se: "se",
    mx: "mx",
  };

  let domainParam = undefined;

  const topLevelDomainFromDomainRegex = /^ancestry[^\.]*\.(.+)$/;
  if (options.citation_ancestry_recordTemplateDomain == "fromRecord") {
    if (ed.domain && topLevelDomainFromDomainRegex.test(ed.domain)) {
      let topLevelDomain = ed.domain.replace(topLevelDomainFromDomainRegex, "$1");
      domainParam = domainParams[topLevelDomain];
    }
  } else {
    let fullDomain = options.citation_ancestry_recordTemplateDomain;
    if (fullDomain && topLevelDomainFromDomainRegex.test(fullDomain)) {
      let topLevelDomain = fullDomain.replace(topLevelDomainFromDomainRegex, "$1");
      if (topLevelDomain && topLevelDomain != fullDomain) {
        domainParam = domainParams[topLevelDomain];
      }
    }
  }

  if (ed.dbId && ed.recordId) {
    if (domainParam) {
      return "{{Ancestry Record|" + ed.dbId + "|" + ed.recordId + "|" + domainParam + "}}";
    }

    return "{{Ancestry Record|" + ed.dbId + "|" + ed.recordId + "}}";
  }

  return "[" + ed.url + " Ancestry Record]";
}

function buildAncestryImageTemplate(ed, options) {
  let target = options.citation_general_target;
  if (target == "plain") {
    return "Ancestry Image Link: " + ed.url;
  }

  // Note that the Ancestry Image template has no 3rd (domain parameter)
  return "{{Ancestry Image|" + ed.dbId + "|" + ed.recordId + "}}";
}

function buildAncestrySharingTemplateFromSharingDataObj(options, dataObj) {
  let target = options.citation_general_target;

  if (target == "plain") {
    if (dataObj.v2 && dataObj.v2.share_url) {
      return "Ancestry Sharing Link: " + dataObj.v2.share_url;
    }
    return;
  }

  // V1 versions
  // https://www.ancestry.com/sharing/24274440?h=95cf5c
  let num1 = dataObj.id;
  let num2 = dataObj.hmac_id;

  // V2 versions
  if (dataObj.v2 && dataObj.v2.share_id && dataObj.v2.share_token) {
    num1 = dataObj.v2.share_id;
    num2 = dataObj.v2.share_token;
  }

  if (num1 && num2) {
    let template = "{{Ancestry Sharing|" + num1 + "|" + num2 + "}}";
    return template;
  }
}

function cleanOriginalData(text) {
  text = text.replace(/^Crown copyright images reproduced [^.]*\./, "");
  text = text.trim();

  // remove bad Find a Grave links
  text = text.replace(/^Find a Grave\.\s+Find a Grave®?\./, "Find a Grave.");
  text = text.trim();
  text = text.replace(/^Find a Grave\.\s+https?\:\/\/www\.findagrave\.com\/cgi\-bin\/fg\.cgi\.?/, "");
  text = text.trim();

  // just in case it is a FindAGrave format I don't recognize.
  // This avoids Suggestion 571 "FindAGrave - Link without Grave ID"
  text = text.replace(/https?\:\/\/www\.findagrave\.com[^\s]+]/, "");

  // The Original data string can get quite long and often has verbose ownership verbiage on the end that if not part
  // of a normal citation. Note that this Original Data string is only used when there is no Source Citation string.
  const endings = [
    "©",
    "Crown copyright",
    "Copyright",
    "copyright",
    "Published by permission",
    "Used by permission",
    "You must not",
    "The Vitalsearch Company Worldwide",
  ];
  for (let ending of endings) {
    let index = text.indexOf(ending);
    if (index != -1) {
      text = text.substring(0, index);
      let lastPeriodIndex = text.lastIndexOf(".");
      if (lastPeriodIndex != -1) {
        text = text.substring(0, lastPeriodIndex);
      } else {
        text = "";
      }
    }
  }

  // Remove links to VitalSearch as they may break or become malicious at some point
  text = text.replace(" (www.vitalsearch-worldwide.com)", "");

  // Sometimes there is duplicated information or the collection title is repeated in the Orginal data.
  // A common example is:
  // "General Register Office. England and Wales Civil Registration Indexes. London, England: General Register Office"
  // Can we generically handle that?
  let firstPeriodIndex = text.indexOf(".");
  if (firstPeriodIndex != -1) {
    let startText = text.substring(0, firstPeriodIndex);
    if (text.length > firstPeriodIndex * 2) {
      if (text.endsWith(startText)) {
        // remove the duplicated sentence from the start
        text = text.substring(firstPeriodIndex + 1).trim();
      }
    }
  }

  // replace weird hyphens with regular ones
  text = text.replace("–", "-");

  // remove any trailing punctuation
  text = text.replace(/[.,;]$/g, "");

  text = text.trim();

  return text;
}

function buildSourceReference(ed, builder) {
  if (ed.sourceCitation) {
    builder.sourceReference = ed.sourceCitation;
  }

  if (!builder.sourceReference && ed.originalData) {
    let cleanedOriginalData = cleanOriginalData(ed.originalData);
    if (cleanedOriginalData) {
      builder.sourceReference = "Original data: " + cleanedOriginalData;
    }
  }

  cleanSourceReference(builder);
}

function buildCoreCitation(ed, gd, options, sharingDataObj, builder) {
  //console.log("buildCoreCitation, sharingDataObj is");
  //console.log(sharingDataObj);
  //console.log("buildCoreCitation, ed is");
  //console.log(ed);

  builder.sourceTitle = ed.titleCollection;
  buildSourceReference(ed, builder);
  addReferenceDataToSourceReference(ed, builder, options);

  if (sharingDataObj) {
    let template = buildAncestrySharingTemplateFromSharingDataObj(options, sharingDataObj);
    builder.sharingLinkOrTemplate = template;
    builder.databaseHasImages = true;
  }

  builder.recordLinkOrTemplate = buildAncestryRecordTemplate(ed, options);

  let additionalInfo = getAdditionalInfo(ed, gd, builder.type, options, builder);
  if (additionalInfo) {
    builder.dataString = additionalInfo;
  }
}

function buildImageCitation(ed, options, sharingDataObj, builder) {
  builder.sourceTitle = ed.titleCollection;
  builder.databaseHasImages = true;

  let sourceReference = ed.imageBrowsePath;
  if (ed.totalImages && ed.imageNumber) {
    if (sourceReference) {
      sourceReference += " > ";
    }
    sourceReference += "image " + ed.imageNumber + " of " + ed.totalImages;
  }
  if (sourceReference) {
    builder.sourceReference = sourceReference;
  }

  if (sharingDataObj) {
    let template = buildAncestrySharingTemplateFromSharingDataObj(options, sharingDataObj);
    builder.sharingLinkOrTemplate = template;
  }

  // builder.recordLinkOrTemplate = "Ancestry " + buildAncestryImageTemplate(ed, options) + " " + ed.dbId + " " + ed.recordId;
  builder.recordLinkOrTemplate = "Ancestry " + buildAncestryImageTemplate(ed, options);

  builder.dataString = ed.titleName;

  builder.meaningfulTitle = getImageRefTitle(ed.titleCollection, ed.imageBrowsePath);
}

function buildSharingPageCitation(ed, options, builder) {
  builder.sourceTitle = ed.titleCollection;
  builder.databaseHasImages = true;

  // no source reference

  if (ed.ancestryTemplate) {
    builder.sharingLinkOrTemplate = ed.ancestryTemplate;
  }

  if (ed.dbId && ed.recordId) {
    // determin if the ed.recordId is actually an image ID
    let isImageId = false;
    if (ed.sharingType == "v1") {
      isImageId = true;
    } else {
      let dashIndex = ed.recordId.indexOf("-");
      if (dashIndex != -1) {
        isImageId = true;
      }
    }

    if (isImageId) {
      builder.recordLinkOrTemplate = "Ancestry " + buildAncestryImageTemplate(ed, options);
    } else {
      builder.recordLinkOrTemplate = buildAncestryRecordTemplate(ed, options);
    }
  }

  builder.dataString = ed.personNarrative;

  builder.meaningfulTitle = getSharingPageRefTitle(ed.titleCollection, ed.personNarrative);
}

function buildCitation(input) {
  const ed = input.extractedData;
  const gd = input.generalizedData;
  const runDate = input.runDate;
  const sharingDataObj = input.sharingDataObj;
  const options = input.options;
  const type = input.type; // "inline", "narrative" or "source"

  let builder = new CitationBuilder(type, runDate, options);
  builder.householdTableString = input.householdTableString;
  builder.includeSubscriptionRequired = options.citation_ancestry_subscriptionRequired;

  if (ed.pageType == "record") {
    buildCoreCitation(ed, gd, options, sharingDataObj, builder);

    var refTitle = getRefTitle(ed, gd);
    builder.meaningfulTitle = refTitle;

    if (type == "narrative") {
      builder.addNarrative(gd, input.dataCache, options);
    }
  } else if (ed.pageType == "image") {
    buildImageCitation(ed, options, sharingDataObj, builder);
  } else if (ed.pageType == "sharingImageOrRecord") {
    buildSharingPageCitation(ed, options, builder);
  }

  // now the builder is setup use it to build the citation object
  let citationObject = builder.getCitationObject(gd, ed.url);

  return citationObject;
}

export { buildCitation };
