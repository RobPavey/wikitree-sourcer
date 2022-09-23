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
      titleMatches: [
        {title: "Register", matches: ["1939 England and Wales Register"]},
      ],
    },
  ];

  let refTitle = gd.getRefTitle(ed.titleCollection, recordTypeToRefTitle);

  if (refTitle && refTitle != "Unclassified") {
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

  return "";
}

function getImageRefTitle(titleCollection, imageBrowsePath) {

  const titleCollectionTightMatches = [
    {title: "Death", matches: ["Death Records"]},
    {title: "Probate", matches: ["Probate Records"]},
  ];

  const imageBrowsePathTightMatches = [
    {title: "Death", matches: ["Death Certificates"]},
    {title: "Probate", matches: ["Probate Records"]},
  ];

  const titleCollectionLooseMatches = [
    {title: "Birth", matches: ["Birth"]},
    {title: "Baptism", matches: ["Baptism"]},
    {title: "Marriage", matches: ["Marriage"]},
    {title: "Death", matches: ["Death"]},
    {title: "Burial", matches: ["Burial"]},
    {title: "Probate", matches: ["Probate"]},
  ];

  const imageBrowsePathLooseMatches = [
    {title: "Birth", matches: ["Birth"]},
    {title: "Baptism", matches: ["Baptism"]},
    {title: "Marriage", matches: ["Marriage"]},
    {title: "Death", matches: ["Death"]},
    {title: "Burial", matches: ["Burial"]},
    {title: "Probate", matches: ["Probate"]},
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
    return (imageBrowsePath.length < titleCollection.length) ? imageBrowsePath : titleCollection;
  }
  if (titleCollection) {
    return titleCollection;
  }
  if (imageBrowsePath) {
    return imageBrowsePath;
  }

  return "Unclassified";
}

function modifyValueForUrl(value) {
  if (value.startsWith("https://www.findagrave.com/memorial")) {
    let memorialId = value.replace(/^https\:\/\/www\.findagrave\.com\/memorial\/(\d+)\/.*$/, "$1");
    if (memorialId && memorialId != value) {
      return "{{FindAGrave|" + memorialId + "}}";
    }
  }

  return value;
}

const referenceKeys = [
  ["reference number",],
  ["registration number",],
  ["declaration number",],
  ["marriage certificate number",],
  ["book",],
  ["piece",],
  ["folio",],
  ["volume", "volume number",],
  ["page", "page number", "os page",],
  ["line", "line number",],
  ["roll",],
  ["reel number",],
  ["fhl film number",],
  ["schedule", "schedule number", "household schedule number",],
  ["household number",],
  ["sub schedule number", "sub-schedule number",],
  ["registration district number",],
  ["ed, institution, or vessel",],  // this always seems to be a number
  ["enumeration district or census tract",],  // this always seems to be a number
  ["newspaper information",],
  ["url",],
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

  return newKeys
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

  return newKeys
}

function addReferenceDataToSourceReference(data, builder, options) {

  if (data.recordData) {
    let keys = Object.keys(data.recordData);

    if (!builder.sourceReference) {
      builder.sourceReference = "";
    }

    let itemSep = ";";
    let valueSep = ":";
    if (options.citation_general_sourceReferenceSeparator == "commaColon") {
      itemSep = ",";
      valueSep = ":";
    }
    else if (options.citation_general_sourceReferenceSeparator == "commaSpace") {
      itemSep = ",";
      valueSep = "";
    }

    let lcSourceReference = builder.sourceReference.toLowerCase();

    for (let key of keys) {
      let refKeyList = getReferenceKeyListForKey(key);
      if (refKeyList) {
        let value = data.recordData[key];

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
                index = 0;  // must be at start
                valIndex = index + startString.length;
              }
              else {
                valIndex = index + matchString.length;
              }
              let endIndex = lcSourceReference.indexOf(itemSep, valIndex);
              if (endIndex == -1) {
                endIndex = lcSourceReference.length;
              }
              let matchValue = lcSourceReference.substring(valIndex, endIndex).trim();
              if (matchValue == value) {
                alreadyInSourceReference = true;
                break;
              }
            }
          }
          if (!alreadyInSourceReference) {
            if (key == "URL") {
              value = modifyValueForUrl(value);
            }

            if (builder.sourceReference) {
              builder.sourceReference += itemSep + " ";
            }
            builder.sourceReference += key + valueSep + " " + value;
          }
        }
      }
    }
  }
}

function cleanSourceCitation(sourceCitation, options) {

  let string = sourceCitation;

  if (string) {
    string = string.replace(/\;?\s*Social Security\:\s*\d+/, "");
  }

  if (string && (options.citation_general_sourceReferenceSeparator == "commaColon" ||
                  options.citation_general_sourceReferenceSeparator == "commaSpace")) {
    // Ancestry uses semi-colon separator by default, if user wants comma replace ; with ,
    string = string.replace(/\; /g, ", ");

    if (options.citation_general_sourceReferenceSeparator == "commaSpace") {
      string = string.replace(/\: /g, " ");
    }
  }

  return string;
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

function buildDataString(data, gd, dataStyle, options, builder) {

  let dataString = "";
  
  if (dataStyle == "string") {
    dataString = buildCustomDataString(gd, options);
    if (dataString) {
      return dataString;
    }
  }

  // build a list string
  let recordData = data.recordData;

  dataString = "";

  let itemSep = ";";
  let valueSep = ":";
  if (options.citation_general_dataListSeparator == "commaColon") {
    itemSep = ",";
    valueSep = ":";
  }
  else if (options.citation_general_dataListSeparator == "commaSpace") {
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
            }
            else {
              let newValue = value.replace(/\<br\/\>/g, ", ");
              dataString += newKey + valueSep + " " + newValue;
            }
          }
        }
        else if (value.indexOf("<br/>") != -1 && !options.citation_general_addBreaksWithinBody) {
          let newValue = value.replace(/\<br\/\>/g, ", ");
          dataString += key + valueSep + " " + newValue;
        }
        else {
          dataString += key + valueSep + " " + value;
        }
      }
    }
  }
  else {
    let titleName = data.titleName;
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

function getAdditionalInfo(data, gd, citationType, options, builder) {

  let dataStyle = options.citation_ancestry_dataStyle;
  if (dataStyle == "none") {
    return "";
  }
  else if (dataStyle == "table") {
    if (options.citation_general_referencePosition == "atEnd") {
      dataStyle = "string";
    }
    else if (citationType == "source") {
      dataStyle = "list";
    }
  }

  if (dataStyle == "string" || dataStyle == "list") {
    return buildDataString(data, gd, dataStyle, options, builder);
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
        }
        else {
          result += "|-\n";
        }
        result += "| " + key + " || " + recordData[key] + "\n";
      }

      result += "|}"
    }
  }

  return result;
}

function buildAncestryRecordTemplate(data, options) {

  const domainParams = {
    "com": "",
    "co.uk": "uk",
    "ca": "ca",
    "com.au": "au",
    "de": "de",
    "it": "it",
    "fr": "fr",
    "se": "se",
    "mx": "mx",
  };

  let domainParam = undefined;

  if (options.citation_ancestry_recordTemplateDomain == "fromRecord") {
    domainParam = domainParams[data.domain];
  }
  else {
    let fullDomain = options.citation_ancestry_recordTemplateDomain;
    let domain = fullDomain.replace(/ancestry.(.+)$/, "$1");
    if (domain && domain != fullDomain) {
      domainParam = domainParams[domain];
    }
  }

  if (domainParam) {
    return "{{Ancestry Record|" + data.dbId + "|" + data.recordId + "|" + domainParam + "}}";
  }

  return "{{Ancestry Record|" + data.dbId + "|" + data.recordId + "}}";
}

function buildAncestryImageTemplate(data, options) {

  // Note that the Ancestry Image template has no 3rd (domain parameter)
  return "{{Ancestry Image|" + data.dbId + "|" + data.recordId + "}}";
}

function buildAncestrySharingTemplateFromSharingDataObj(dataObj) {

  let url = dataObj.url;
  
  // https://www.ancestry.com/sharing/24274440?h=95cf5c
  let num1 = url.replace(/.*\/sharing\/(\w+)\?h\=\w+/, "$1");
  let num2 = url.replace(/.*\/sharing\/\w+\?h\=(\w+)/, "$1");

  let template = "{{Ancestry Sharing|" + num1 + "|" + num2 + "}}";

  return template;
}

function cleanOriginalData(text) {

  text = text.replace(/^Crown copyright images reproduced [^.]*\./, "");
  text = text.trim();

  // remove bad Find a Grave links
  text = text.replace(/^Find a Grave\.\s+Find a Grave\./, "Find a Grave.");
  text = text.trim();
  text = text.replace(/^Find a Grave\.\s+http\:\/\/www\.findagrave\.com\/cgi\-bin\/fg\.cgi\.?/, "");
  text = text.trim();

  // The Original data string can get quite long and often has verbose ownership verbiage on the end that if not part
  // of a normal citation. Note that this Original Data string is only used when there is no Source Citation string.
  const endings = [
    "©", "Crown copyright", "Copyright", "copyright", "Published by permission", "Used by permission", "You must not",
    "The Vitalsearch Company Worldwide", 
  ];
  for (let ending of endings) {
    let index = text.indexOf(ending);
    if (index != -1) {
      text = text.substring(0, index);
      let lastPeriodIndex = text.lastIndexOf(".");
      if (lastPeriodIndex != -1) {
        text = text.substring(0, lastPeriodIndex);
      }
      else {
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
    if (text.length > firstPeriodIndex*2) {
      if (text.endsWith(startText)) {
        // remove the duplicated sentence from the start
        text = text.substring(firstPeriodIndex+1).trim();
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

function buildSourceReference(data, options) {

  let sourceReference = data.sourceCitation;

  if (!sourceReference && data.originalData) {
    sourceReference = cleanOriginalData(data.originalData);
  }

  return cleanSourceCitation(sourceReference, options);
}

function buildCoreCitation(data, gd, options, sharingDataObj, builder) {

  //console.log("buildCoreCitation, sharingDataObj is");
  //console.log(sharingDataObj);
  //console.log("buildCoreCitation, data is");
  //console.log(data);

  builder.sourceTitle = data.titleCollection;
  builder.sourceReference = buildSourceReference(data, options);
  addReferenceDataToSourceReference(data, builder, options);

  if (sharingDataObj) {
    let template = buildAncestrySharingTemplateFromSharingDataObj(sharingDataObj);
    builder.sharingLinkOrTemplate = template;
    builder.databaseHasImages = true;
  }

  builder.recordLinkOrTemplate = buildAncestryRecordTemplate(data, options);

  let additionalInfo = getAdditionalInfo(data, gd, builder.type, options, builder);
  if (additionalInfo) {
    builder.dataString = additionalInfo;
  }
}

function buildImageCitation(data, options, sharingDataObj, builder) {

  builder.sourceTitle = data.titleCollection;
  builder.databaseHasImages = true;

  let sourceReference = data.imageBrowsePath;
  if (data.totalImages && data.imageNumber) {
    if (sourceReference) {
      sourceReference += " > ";
    }
    sourceReference += "image " + data.imageNumber + " of " + data.totalImages;
  }
  if (sourceReference) {
    builder.sourceReference = sourceReference;
  }

  if (sharingDataObj) {
    let template = buildAncestrySharingTemplateFromSharingDataObj(sharingDataObj);
    builder.sharingLinkOrTemplate = template;
  }

  // builder.recordLinkOrTemplate = "Ancestry " + buildAncestryImageTemplate(data, options) + " " + data.dbId + " " + data.recordId;
  builder.recordLinkOrTemplate = "Ancestry " + buildAncestryImageTemplate(data, options);

  builder.dataString = data.titleName;

  builder.meaningfulTitle = getImageRefTitle(data.titleCollection, data.imageBrowsePath);
}

function buildCitation(input) {

  const data = input.extractedData;
  const gd = input.generalizedData;
  const runDate = input.runDate;
  const sharingDataObj = input.sharingDataObj;
  const options = input.options;
  const type = input.type;  // "inline", "narrative" or "source"

  let builder = new CitationBuilder(type, runDate, options);
  builder.householdTableString = input.householdTableString;
  builder.includeSubscriptionRequired = options.citation_ancestry_subscriptionRequired;

  if (data.pageType == "record") {
    buildCoreCitation(data, gd, options, sharingDataObj, builder);

    var refTitle = getRefTitle(data, gd);
    builder.meaningfulTitle = refTitle;

    if (type == "narrative") {
      builder.addNarrative(gd, input.dataCache, options);
    }
  }
  else if (data.pageType == "image") {
    buildImageCitation(data, options, sharingDataObj, builder);
  }

  // now the builder is setup use it to build the citation text
  let fullCitation = builder.getCitationString();

  var citationObject = {
    citation: fullCitation,
    type: type,
  }

  return citationObject;
}

export { buildCitation };
