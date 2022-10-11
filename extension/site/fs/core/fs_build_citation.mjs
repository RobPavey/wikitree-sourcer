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
import { RT } from "../../../base/core/record_type.mjs";
import { DataString } from "../../../base/core/data_string.mjs";

function buildFsCitationDataString(data) {
  if (data.citation) {
    // citation string looks like this (for example):
    /*
    "England and Wales Census, 1841," database with images,
    <i>FamilySearch</i> (https://familysearch.org/ark:/61903/1:1:MQTV-YB9 : 23 May 2019),
    Isabella Pavey in household of William Pavey, East Stonehouse, Devon, England, United Kingdom;
    from "1841 England, Scotland and Wales census," database and images,
    <i>findmypast</i> (http://www.findmypast.com : n.d.);
    citing PRO HO 107, The National Archives, Kew, Surrey.
    */
    // find the middle part like:
    // "Isabella Pavey in household of William Pavey, East Stonehouse, Devon, England, United Kingdom"

    let dataString = data.citation.replace(
      /^.*\<i\>FamilySearch\<\/i\>\s+\([^\)]+\)\,\s*([^\;]+).*$/,
      "$1"
    );
    if (dataString && dataString != data.citation) {
      // Sometimes there are commas with no space after them, fix that.
      dataString = dataString.replace(/\,(\w)/g, ", $1");
      return dataString;
    }
  }

  return "";
}

function removeUnwantedKeysForTable(keys, recordData) {
  // for the moment they are the same
  return removeUnwantedKeysForDataString(keys, recordData);
}

function removeUnwantedKeysForDataString(keys, recordData) {
  const exactMatchesToExclude = [
    "Page",
    "Page number",
    "Folio",
    "Piece number",
    "Schedule",
    "Rolls",

    "Unique Identifier",
    "Source Volume",
    "Source Page",
    "Event Place Level1Type",
    "Event Place Level2Type",
    "Event Place Level3Type",
    "Evquarter",
    "Ppq Id",
    "Record Group",
    "Sort Key",
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

function buildDataString(data, gd, dataStyle, builder) {
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
  } else if (dataStyle == "fsCitation") {
    let dataString = buildFsCitationDataString(data);
    if (dataString) {
      return dataString;
    }

    // if no citation on the FS page fallback to string formst
    let input = {
      generalizedData: gd,
      options: options,
    };
    dataString = DataString.buildDataString(input);
    if (dataString) {
      return dataString;
    }

    if (data.sourceTitleForPerson) {
      let dataString = data.sourceTitleForPerson.replace(
        /^([^\,]*)\,.*$/,
        "$1"
      );
      return dataString;
    }

    if (data.fullName && data.eventDate) {
      let dataString = data.fullName + " " + data.eventDate;
      return dataString;
    }
  }

  let recordData = data.recordData;

  dataString = "";

  // I don't think this will ever happen
  if (!recordData) {
    let date = gd.inferEventDate();
    let place = gd.inferEventPlace();
    dataString = date;
    if (place) {
      if (date) {
        dataString += ", ";
      }
      dataString += place;
    }
    return dataString;
  }

  dataString = builder.buildDataList(
    recordData,
    removeUnwantedKeysForDataString
  );

  return dataString;
}

function getAdditionalInfo(data, gd, builder) {
  let citationType = builder.type;
  let options = builder.options;

  let dataStyle = options.citation_fs_dataStyle;
  if (dataStyle == "none") {
    return "";
  } else if (dataStyle == "table") {
    if (options.citation_general_referencePosition == "atEnd") {
      dataStyle = "string";
    } else if (citationType == "source") {
      dataStyle = "list";
    }
  }

  if (
    dataStyle == "string" ||
    dataStyle == "list" ||
    dataStyle == "fsCitation"
  ) {
    return buildDataString(data, gd, dataStyle, builder);
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

function buildSourceReferenceFromRecord(data, gd, options) {
  let dataString = "";

  function addValue(title, value) {
    if (value) {
      if (dataString != "") {
        dataString += " ";
      }
      dataString += title + ": " + value + ";";
    }
  }

  function addRecordDataValue(title, keyArray) {
    let value = undefined;
    if (data.recordData) {
      for (let key of keyArray) {
        value = data.recordData[key];
        if (value) {
          break;
        }
      }
    }
    if (value) {
      if (dataString != "") {
        dataString += " ";
      }
      dataString += title + ": " + value + ";";
    }
  }

  let refData = data.referenceData;

  if (gd.isRecordInCountry("United Kingdom")) {
    if (
      gd.recordType == RT.Census &&
      data.collectionTitle.startsWith("England and Wales Census")
    ) {
      // The Ancestry reference would look like:
      // Class: HO107; Piece: 276; Book: 6; Civil Parish: East Stonehouse; County: Devon; Enumeration District: 6; Folio: 21; Page: 37; Line: 20; GSU roll: 241335<br/>

      dataString += "The National Archives of the UK";
      if (refData) {
        addValue("Class", refData.sourceRegNbr);
        addValue("Piece/Folio", refData.sourcePieceFolio);
        addValue("Page", refData.sourcePageNbr);
        addValue("Line", refData.sourceLineNbr);
      }
    } else if (
      gd.recordType == RT.BirthRegistration ||
      gd.recordType == RT.DeathRegistration ||
      gd.recordType == RT.MarriageRegistration
    ) {
      // FS citation would say:
      // Citing 1937, quarter 2, vol. 9D, p. 519, Hull, Yorkshire, England, General Register Office, Southport, England.

      dataString += "UK General Register Office.";
      addValue("District", data.registrationDistrict);
      if (refData) {
        addValue("Volume", refData.sourceVolume);
        addValue("Page", refData.sourcePageNbr);
        // there can be a line number but we don't want that as it is line num on FMP printout
        addValue("Entry", refData.sourceEntryNbr);
      }
    }

    if (dataString) {
      dataString = "citing " + dataString;
    }
    return dataString;
  }

  // not a special case, just add everything that could be part of reference
  addValue("District", data.registrationDistrict);
  if (refData) {
    addValue("Volume", refData.sourceVolume);
    addValue("Piece/Folio", refData.sourcePieceFolio);
    addValue("Page", refData.sourcePageNbr);

    addValue("Affiliate Publication Title", refData.externalPublicationTitle);
    addValue("Affiliate Publication Number", refData.externalPublicationNumber);
    addValue("Affiliate Film Number", refData.externalFilmNumber);

    if (refData.sourceLineNbr) {
      addValue("Line", refData.sourceLineNbr);
    } else {
      addValue("Affiliate Line Number", refData.externalLineNumber);
    }
    addValue("Entry", refData.sourceEntryNbr);

    addValue("Reference", refData.referenceId);
    addValue("FHL microfilm", refData.filmNumber);
    addValue("Record number", refData.recordNumber);
  }

  if (dataString) {
    dataString = "citing " + dataString;
  }
  return dataString;
}

function buildSourceReferenceFromFsCitation(data, options) {
  if (data.citation) {
    // citation string looks like this (for example):
    /*
    "England and Wales Census, 1841," database with images,
    <i>FamilySearch</i> (https://familysearch.org/ark:/61903/1:1:MQTV-YB9 : 23 May 2019),
    Isabella Pavey in household of William Pavey, East Stonehouse, Devon, England, United Kingdom;
    from "1841 England, Scotland and Wales census," database and images,
    <i>findmypast</i> (http://www.findmypast.com : n.d.);
    citing PRO HO 107, The National Archives, Kew, Surrey.
    */
    const citingString = "citing ";
    let citingIndex = data.citation.indexOf(citingString);
    if (citingIndex != -1) {
      citingIndex += citingString.length;

      let refString = data.citation.substring(citingIndex);
      const fromString = "from ";

      if (options.citation_fs_sourceRef == "fsCitationShort") {
        // there can be more than one "citing". Sometimes that is OK, other times there is too much in
        // the first citing string (a from)
        citingIndex = refString.indexOf(citingString);
        let fromIndex = refString.indexOf(fromString);
        if (citingIndex != -1 && fromIndex != -1 && fromIndex < citingIndex) {
          // cut out the part between the from and the second citing
          let part1 = refString.substring(0, fromIndex).trim();
          let part2 = refString.substring(citingIndex).trim();

          part1 = part1.replace(/^(.*)[\;\,\.]+$/, "$1"); // remove trailing punctuation
          refString = part1 + "; " + part2;
        }
      }

      if (refString) {
        refString = "citing " + refString;
      }

      return refString;
    }
  }

  return "";
}

function buildSourceReference(data, gd, options) {
  if (
    options.citation_fs_sourceRef == "fsCitationShort" ||
    options.citation_fs_sourceRef == "fsCitationLong"
  ) {
    let refString = buildSourceReferenceFromFsCitation(data, options);
    if (refString) {
      return refString;
    }
  }

  // build from record
  return buildSourceReferenceFromRecord(data, gd, options);
}

function extractIdFromFsUrl(url, prefixList, terminatorList) {
  // the recordUrl should look like:
  // https://www.familysearch.org/ark:/61903/1:1:XZDY-NHM

  for (let prefix of prefixList) {
    let prefixIndex = url.indexOf(prefix);
    if (prefixIndex != -1) {
      let id = url.substring(prefixIndex + prefix.length);
      for (let terminator of terminatorList) {
        let terminatorIndex = id.indexOf(terminator);
        if (terminatorIndex != -1) {
          id = id.substring(0, terminatorIndex);
        }
      }
      return id;
    }
  }

  return ""; // no prefix found
}

function buildFsRecordLink(recordUrl) {
  // start with the old format link and then try to replace with template
  let recordLinkOrTemplate = "[" + recordUrl + " FamilySearch" + "]";

  // the recordUrl should look like:
  // https://www.familysearch.org/ark:/61903/1:1:XZDY-NHM
  let recordId = extractIdFromFsUrl(recordUrl, ["ark:/61903/1:1:"], ["/", "?"]);

  if (recordId.length > 5) {
    recordLinkOrTemplate = "{{FamilySearch Record|" + recordId + "}}";
  }

  return recordLinkOrTemplate;
}

function buildFsImageLink(imageUrl) {
  // start with the old format link and then try to replace with template
  let imageLinkOrTemplate = "[" + imageUrl + " FamilySearch Image]";

  // the recordUrl should look like one of these:
  // https://www.familysearch.org/ark:/61903/3:1:33S7-9BSH-9W9B?i=7&cc=1473181
  // https://www.familysearch.org/ark:/61903/3:1:33S7-9P2P-9D2F?i=1179&cc=1307272&personaUrl=%2Fark%3A%2F61903%2F1%3A1%3AXZDY-NHM
  let imageId = extractIdFromFsUrl(imageUrl, ["ark:/61903/3:1:"], ["/", "?"]);

  if (imageId.length > 5) {
    imageLinkOrTemplate = "{{FamilySearch Image|" + imageId + "}}";
  }

  return imageLinkOrTemplate;
}

function buildCoreCitation(data, gd, builder) {
  builder.sourceTitle = data.collectionTitle;

  var recordUrl = data.personRecordUrl;

  if (
    (data.fsImageUrl || data.externalImageUrl) &&
    data.externalImageUrl != "bad"
  ) {
    let text = "";
    if (data.externalImageUrl) {
      if (builder.options.citation_fs_includeExternalImageLink) {
        if (data.externalImageUrl.includes("findmypast")) {
          text += "[" + data.externalImageUrl + " FindMyPast Image]";
          let subReqString = builder.getSubReqString(
            builder.options.citation_fs_subscriptionRequired
          );
          if (subReqString) {
            text += " (" + subReqString + ")";
          }
        } else {
          text += "[" + data.externalImageUrl + " External Image]";
        }
      }
    } else {
      builder.databaseHasImages = true;

      text += buildFsImageLink(data.fsImageUrl);
      if (data.fsImageNumber) {
        text += " Image number " + data.fsImageNumber;
      }
    }
    builder.externalSiteLink = text;
  } else if (data.digitalArtifact) {
    // Find A Grave example:   "digitalArtifact": "http://www.findagrave.com/cgi-bin/fg.cgi?page=gr&GRid=30569834",
    let url = data.digitalArtifact;
    const idParam = "&GRid=";
    if (url.includes("//www.findagrave.com/cgi-bin") && url.includes(idParam)) {
      let paramIndex = url.indexOf(idParam);
      if (paramIndex != -1) {
        let nextParamIndex = url.indexOf("&", paramIndex + idParam.length);
        if (nextParamIndex == -1) {
          nextParamIndex = url.length;
        }

        let memorialId = url.substring(
          paramIndex + idParam.length,
          nextParamIndex
        );
        builder.externalSiteLink = "{{FindAGrave|" + memorialId + "}}";
      }
    } else {
      builder.externalSiteLink = url;
    }
  }

  builder.recordLinkOrTemplate = buildFsRecordLink(recordUrl);

  let additionalInfo = getAdditionalInfo(data, gd, builder);
  if (additionalInfo) {
    builder.dataString = additionalInfo;
  }

  builder.sourceReference = buildSourceReference(data, gd, builder.options);
}

function getImageRefTitle(catalogRecordName, filmTitle) {
  const catalogRecordNameTightMatches = [
    { title: "Marriage", matches: ["Marriage records"] },
    { title: "Marriage Bond", matches: ["Marriage licence bonds"] },
    { title: "Tax record", matches: ["Tax books"] },
    {
      title: "Personal Property Tax",
      matches: ["Personal property tax lists,"],
    },
    { title: "Deed", matches: ["Deeds,", "Deed records,"] },
  ];

  const filmTitleTightMatches = [
    { title: "Marriage", matches: ["County Marriages,"] },
    { title: "Marriage Bond", matches: ["Marriage Bond,"] },
    { title: "Deed record", matches: ["Deeds"] },
    { title: "Land record", matches: ["Land Records,"] },
  ];

  const catalogRecordNameLooseMatches = [
    { title: "Marriage", matches: ["Marriage"] },
    { title: "Property Tax", matches: ["property tax"] },
    { title: "Tax record", matches: ["Tax", "tax"] },
  ];

  const filmTitleLooseMatches = [
    { title: "Marriage", matches: ["Marriage"] },
    { title: "Tax record", matches: ["Tax"] },
    { title: "Deed record", matches: ["Deed"] },
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

  if (catalogRecordName) {
    let refTitle = lookup(catalogRecordName, catalogRecordNameTightMatches);
    if (refTitle) {
      return refTitle;
    }
  }

  if (filmTitle) {
    let refTitle = lookup(filmTitle, filmTitleTightMatches);
    if (refTitle) {
      return refTitle;
    }
  }

  if (catalogRecordName) {
    let refTitle = lookup(catalogRecordName, catalogRecordNameLooseMatches);
    if (refTitle) {
      return refTitle;
    }
  }

  if (filmTitle) {
    let refTitle = lookup(filmTitle, filmTitleLooseMatches);
    if (refTitle) {
      return refTitle;
    }
  }

  // no matches
  if (catalogRecordName && filmTitle) {
    // choose the shorter one
    return filmTitle.length < catalogRecordName.length
      ? filmTitle
      : catalogRecordName;
  }
  if (catalogRecordName) {
    return catalogRecordName;
  }
  if (filmTitle) {
    return filmTitle;
  }

  return "Unclassified";
}

function buildImageCitation(data, gd, builder) {
  builder.databaseHasImages = true;

  if (data.filmTitle) {
    builder.sourceTitle = data.filmTitle;
  } else {
    builder.sourceTitle = data.catalogRecordName;
  }

  let imageLink = buildFsImageLink(data.url);
  builder.recordLinkOrTemplate = imageLink;

  builder.dataString = buildDataString(
    data,
    gd,
    builder.options.citation_fs_dataStyle,
    builder
  );

  builder.sourceReference = buildSourceReference(data, gd, builder.options);
  if (!builder.sourceReference) {
    builder.sourceReference = "";
  }

  let newSourceReference = "";
  if (data.catalogRecordLink && data.catalogRecordName) {
    let linkText = data.catalogRecordName;
    newSourceReference += "Catalog: ";
    newSourceReference += "[" + data.catalogRecordLink + " " + linkText + "]";

    if (data.filmNote) {
      let note = data.filmNote;
      if (note.startsWith(linkText)) {
        note = note.substring(linkText).trim();
      }
      newSourceReference += " " + note;
    }
  }

  if (data.filmNumber || data.imageBrowsePath || data.totalImages) {
    if (newSourceReference) {
      if (builder.options.citation_general_addBreaksWithinBody) {
        newSourceReference += "<br/>";
      } else {
        newSourceReference += "; ";
      }
      if (
        builder.type != "source" &&
        builder.options.citation_general_addNewlinesWithinBody
      ) {
        newSourceReference += "\n";
      }
    }
    if (data.imageBrowsePath) {
      newSourceReference += "Image path: " + data.imageBrowsePath;
    } else if (data.filmNumber) {
      newSourceReference += "Film number: " + data.filmNumber;
    }

    // this is a workaround for Unit Tests. In Unit Tests the imageNumber is empty because of the
    // way the text input works
    if (data.totalImages) {
      let imageNumber = data.imageNumber;
      if (!imageNumber) {
        imageNumber = "?";
      }
      newSourceReference +=
        " > image " + imageNumber + " of " + data.totalImages;
    }
  }

  if (builder.sourceReference) {
    newSourceReference += "; " + builder.sourceReference;
  }

  builder.sourceReference = newSourceReference;

  builder.meaningfulTitle = getImageRefTitle(
    data.catalogRecordName,
    data.filmTitle
  );
}

function getRefTitle(ed, gd) {
  const recordTypeToRefTitle = [
    {
      type: RT.Marriage,
      defaultTitle: "Marriage",
      titleMatches: [{ title: "Marriage Bond", matches: ["Marriage Bond"] }],
    },
    {
      type: RT.MilitaryService,
      defaultTitle: "Military Service",
      titleMatches: [{ title: "Navy Allotment", matches: ["Navy Allotment"] }],
    },
    {
      type: RT.ElectoralRegister,
      defaultTitle: "Voter Registration",
      addYear: true,
      titleMatches: [
        { title: "Electoral Register", matches: ["Electoral Register"] },
      ],
    },
  ];

  let refTitle = gd.getRefTitle(ed.collectionTitle, recordTypeToRefTitle);

  if (refTitle && refTitle != "Unclassified") {
    return refTitle;
  }

  return "";
}

function buildCitation(input) {
  const data = input.extractedData;
  const gd = input.generalizedData;
  const runDate = input.runDate;
  const options = input.options;
  const type = input.type; // "inline", "narrative" or "source"

  let builder = new CitationBuilder(type, runDate, options);
  builder.householdTableString = input.householdTableString;

  if (data.pageType == "record") {
    var citation = buildCoreCitation(data, gd, builder);

    // Get meaningful title
    let refTitle = getRefTitle(data, input.generalizedData);
    builder.meaningfulTitle = refTitle;

    if (type == "narrative") {
      builder.addNarrative(gd, input.dataCache, options);
    }
  } else if (data.pageType == "image") {
    buildImageCitation(data, gd, builder);
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
