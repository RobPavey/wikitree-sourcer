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
import { getRecordType } from "./scotp_utils.mjs";
import { ScotpUriBuilder } from "./scotp_uri_builder.mjs";
import { ScotpRecordType, SpField, SpFeature } from "./scotp_record_type.mjs";
import { WTS_String } from "../../../base/core/wts_string.mjs";
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

function createCitationUrl(data, gd, options) {
  let scotpRecordType = getRecordType(data);
  if (!scotpRecordType) {
    return data.url;
  }

  var builder = new ScotpUriBuilder(scotpRecordType);

  if (!data.recordData) {
    return data.url;
  }

  let isShort = options.citation_scotp_urlStyle == "short";

  // Names
  // Note on names. In the search results the persons Surname Forename and Full name columns
  // never seem to have punctuation. For example:
  // WILHELMINA GRAC
  // has no period on the end. (Unlike parent names)
  if (scotpRecordType == "coa") {
    builder.addFullName(data.recordData["Full Name"], "exact");
  } else {
    let surname = data.recordData["Surname"];
    if (surname) {
      // sometimes the name has " or " in lowercase and that fails search
      // But can't always upper case the whole name as that fails the search in military_tribunals
      surname = surname.replace(/\s+or\s+/g, " OR ");
    }
    builder.addSurname(surname, "exact");
    builder.addForename(data.recordData["Forename"], "exact");
  }

  // Year or year range
  let year = gd.inferEventYear();
  if (year) {
    if (scotpRecordType == "census" || scotpRecordType == "vr") {
      builder.addYear(year);
    } else if (scotpRecordType == "census_lds" || scotpRecordType == "military_tribunals" || scotpRecordType == "hie") {
      // no date for these record types (it is part of standard text for census_lds)
    } else {
      builder.addStartYear(year);
      builder.addEndYear(year);
    }
  }

  // Gender
  if (ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.gender)) {
    let genderKey = ScotpRecordType.getRecordKey(scotpRecordType, SpField.gender);
    if (genderKey) {
      let gender = data.recordData[genderKey];
      if (gender) {
        builder.addGender(gender);
      }
    }
  }

  // Parents
  if (ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.parents)) {
    let parentsKey = ScotpRecordType.getRecordKey(scotpRecordType, SpField.parents);
    if (parentsKey) {
      let parents = data.recordData[parentsKey];
      if (parents) {
        let parentName1 = "";
        let parentName2 = "";
        let slashIndex = parents.indexOf("/");
        if (slashIndex == -1) {
          parentName1 = parents;
        } else {
          parentName1 = parents.substring(0, slashIndex);
          parents = parents.substring(slashIndex + 1);

          slashIndex = parents.indexOf("/");
          if (slashIndex != -1) {
            parents = parents.substring(0, slashIndex);
          }

          // Note parents can have things on the end like "FR405" or "FR405 (FR405)"
          let parenIndex = parents.indexOf("(");
          if (parenIndex != -1) {
            parents = parents.substring(0, parenIndex);
          }
          let codeIndex = parents.search(/\s+FR\w*\d+/);
          if (codeIndex != -1) {
            parents = parents.substring(0, codeIndex);
          }
          parentName2 = parents;
        }

        // Note on parent names. In the search results the parent names can be abbreviated
        // wth a period. e.g.: "ALEXR. FRASER/HELEN BRUCE FR328 (FR328)"
        // In this we have to remove the period in the search URL or it will not get a hit.
        // Also the parent names search fails if there are more than two names. So a name like:
        // MARY ELLEN MCGULDRICK
        // will not get any hits. So we change it to the first and last names. e.g.:
        // MARY MCGULDRICK
        function cleanParentName(name) {
          if (!name) {
            return "";
          }

          name = name.replace(/[.]/g, "");
          let count = WTS_String.countWords(name);
          if (count > 2) {
            let name1 = WTS_String.getFirstWord(name);
            let name2 = WTS_String.getLastWord(name);
            name = name1 + " " + name2;
          }
          return name;
        }

        if (parentName1) {
          parentName1 = cleanParentName(parentName1);
          builder.addParentName(parentName1, "exact");
        }
        if (parentName2) {
          parentName2 = cleanParentName(parentName2);
          builder.addParentName(parentName2, "exact");
        }
      }
    }
  }

  // Spouse
  if (ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.spouse)) {
    // Spouse names never seem to be abbreviated so we do not need to remove periods.
    // They can have extra data on the end and "/" characters within the name but that is fine and
    // works correctly with the exact search. e.g.: In a OPR marriage the "Spouse Name" fields can contain:
    // JACOBINA CAMPBELL/URQUHART FR5344 (FR5344)

    let surnameKey = ScotpRecordType.getRecordKey(scotpRecordType, SpField.spouseSurname);
    if (surnameKey) {
      let surname = data.recordData[surnameKey];
      builder.addSpouseSurname(surname, "exact");
    }

    let forenameKey = ScotpRecordType.getRecordKey(scotpRecordType, SpField.spouseForename);
    if (forenameKey) {
      let forename = data.recordData[forenameKey];
      builder.addSpouseForename(forename, "exact");
    }

    let fullNameKey = ScotpRecordType.getRecordKey(scotpRecordType, SpField.spouseFullName);
    if (fullNameKey) {
      let fullName = data.recordData[fullNameKey];
      builder.addSpouseFullName(fullName, "exact");
    }
  }

  // Age
  if (ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.ageRange)) {
    let ageKey = ScotpRecordType.getRecordKey(scotpRecordType, SpField.age);
    if (ageKey) {
      let age = data.recordData[ageKey];
      if (age) {
        builder.addAgeRange(age, age);
      }
    }
  } else if (ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.age)) {
    let ageKey = ScotpRecordType.getRecordKey(scotpRecordType, SpField.age);
    if (ageKey) {
      let age = data.recordData[ageKey];
      if (age) {
        builder.addAge(age);
      }
    } else if (data.urlQuery["age"]) {
      // Military tribunals have an age search but the results do not show an age
      // but the user may have used age to narrow the search results
      builder.addAge(data.urlQuery["age"]);
    }
  }

  // County
  if (ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.county)) {
    let countySearchParam = ScotpRecordType.getSearchParam(scotpRecordType, SpField.county);
    if (countySearchParam) {
      let userCounty = data.searchCriteria ?? data.searchCriteria[countySearchParam];
      if (userCounty) {
        // County is unusual, a lot of record types support county insearch but do not show it in the results
        // So, if the user specified a county and it found this result use it
        builder.addSearchParameter(countySearchParam, userCounty);
      } else {
        // some record types do have the County or County/City in the search results
        let countyKey = ScotpRecordType.getRecordKey(scotpRecordType, SpField.county);
        if (countyKey) {
          let county = data.recordData[countyKey];
          if (county) {
            builder.addSearchParameter(countySearchParam, county);
          }
        }
      }
    }
  }

  // Registration district
  if (!isShort && ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.rd)) {
    let rdNameKey = ScotpRecordType.getRecordKey(scotpRecordType, SpField.rdName);
    if (rdNameKey) {
      let rdNameValue = data.recordData[rdNameKey];
      if (rdNameValue) {
        builder.addRdName(rdNameValue, true);
      }
    }
  }

  // OPR parish
  if (!isShort && ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.oprParish)) {
    let parishNameKey = ScotpRecordType.getRecordKey(scotpRecordType, SpField.parishName);
    if (parishNameKey) {
      let parishNameValue = data.recordData[parishNameKey];
      if (parishNameValue) {
        builder.addOprParishName(parishNameValue, true);
      }
    }
  }

  // Catholic parish
  if (!isShort && ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.rcParish)) {
    let parishNameKey = ScotpRecordType.getRecordKey(scotpRecordType, SpField.parishName);
    if (parishNameKey) {
      let parishNameValue = data.recordData[parishNameKey];
      if (parishNameValue) {
        builder.addCatholicParishName(parishNameValue, true);
      }
    }
  }

  // Other church parish
  if (!isShort && ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.otherParish)) {
    let parishNameKey = ScotpRecordType.getRecordKey(scotpRecordType, SpField.parishName);
    if (parishNameKey) {
      let parishNameValue = data.recordData[parishNameKey];
      if (parishNameValue) {
        builder.addOtherParishName(parishNameValue);
      }
    }
  }

  // Court/Tribunal
  if (!isShort && ScotpRecordType.hasSearchFeature(scotpRecordType, SpFeature.court)) {
    if (scotpRecordType == "wills_testaments") {
      let courtNameKey = ScotpRecordType.getRecordKey(scotpRecordType, SpField.courtName);
      if (courtNameKey) {
        let courtNameValue = data.recordData[courtNameKey];
        if (courtNameValue) {
          let extraSpacesNeeded = 50 - courtNameValue.length;
          for (let i = 0; i < extraSpacesNeeded; i++) {
            courtNameValue += " ";
          }

          let courtNameParam = ScotpRecordType.getSearchParam(scotpRecordType, SpField.courtName);
          builder.addSearchArrayParameter(courtNameParam, courtNameValue);
        }
      }
    } else {
      builder.addRecordDataValue(data, scotpRecordType, SpField.courtName);
    }
  }

  if (!isShort) {
    // Occupation
    builder.addRecordDataValue(data, scotpRecordType, SpField.occupation);

    // Description
    builder.addRecordDataValue(data, scotpRecordType, SpField.description);
  }

  // serviceNumber (for Soldiers' and Airmens' Wills this is a unique ID)
  builder.addRecordDataValue(data, scotpRecordType, SpField.serviceNumber);

  // Optionally include a &ref= on the end. It doesn't affect search but Source will highlight the row
  if (options.citation_scotp_urlIncludeRef) {
    builder.addRecordDataValue(data, scotpRecordType, SpField.ref);
  }

  return builder.getUri();
}

function buildCitationUrl(data, gd, options) {
  // could provide option to use a search style URL but don't see any reason to so far

  return "https://www.scotlandspeople.gov.uk/";

  /*  No longer use query URLs as they are not supported on scotp site
  let urlOpt = options.citation_scotp_urlStyle;

  if (urlOpt == "base" || urlOpt == "visible") {
    return "https://www.scotlandspeople.gov.uk/";
  }
  else if (urlOpt == "original") {
    // if there is more than one result on the page then add the ref (if that option is selected)
    let url = data.url;
    if (data.numResultsOnPage > 1 && options.citation_scotp_urlIncludeRef) {
      let scotpRecordType = getRecordType(data);
      let searchParam = ScotpRecordType.getSearchParam(scotpRecordType, SpField.ref);
      if (searchParam) {
        let recordKey = ScotpRecordType.getRecordKey(scotpRecordType, SpField.ref);
        if (recordKey) {
          let recordValue = data.recordData[recordKey];
          if (recordValue) {
            const encodedValue = encodeURIComponent(recordValue);
            url += "&" + searchParam + "=" + encodedValue;
          }
        }
      }
    }
    return url;
  } else if (urlOpt == "best") {
    let isOnFirstPage = true;
    if (data.urlQuery) {
      let page = data.urlQuery.page;
      if (page && page != "1") {
        isOnFirstPage = false;
      }
    }
    if (isOnFirstPage && data.numResultsOnPage == 1) {
      return data.url;
    }
  }

  // if we get here we want to generate a full search URL (either "created" or "short")
  return createCitationUrl(data, gd, options);
  */
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

function buildValuationRollDataString(data, gd, dataStyle, builder) {
  let dataString = gd.inferFullName();
  let date = gd.inferEventDate();
  if (date) {
    dataString += " in " + date;
  }
  let parish = gd.inferFullEventPlace();
  let place = "";
  if (data.recordData) {
    let placeString = data.recordData["Place"];
    if (placeString) {
      place = WTS_String.toInitialCapsEachWord(placeString);
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

function buildDataString(data, gd, dataStyle, builder) {
  let options = builder.options;

  let dataString = "";

  if (dataStyle == "string") {
    if (gd.recordType == RT.ValuationRoll) {
      let dataString = buildValuationRollDataString(data, gd, dataStyle, builder);
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

  let recordData = data.recordData;

  dataString = "";

  // I don't think this will ever happen
  if (!recordData) {
    dataString = data.heading + " in " + data.place;
    return dataString;
  }

  dataString = builder.buildDataList(recordData, removeUnwantedKeysForDataString);

  return dataString;
}

function getAdditionalInfo(data, gd, builder) {
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

function buildSourceReference(data, gd, options) {
  if (!data.recordData) {
    return "";
  }

  let referenceString = "";

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

  let itemSep = ";";
  let valueSep = ":";
  if (options.citation_general_sourceReferenceSeparator == "commaColon") {
    itemSep = ",";
    valueSep = ":";
  } else if (options.citation_general_sourceReferenceSeparator == "commaSpace") {
    itemSep = ",";
    valueSep = "";
  }

  function addTerm(title, value) {
    if (value) {
      if (referenceString) {
        referenceString += itemSep + " ";
      }
      referenceString += title + valueSep + " " + value;
    }
  }

  for (let key in data.recordData) {
    if (isKeyWantedInReference(key)) {
      addTerm(key, data.recordData[key]);
    }
  }

  if (!referenceString) {
    for (let key in data.recordData) {
      if (isBackupKeyWantedInReference(key)) {
        addTerm(key, data.recordData[key]);
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

  //console.log("sourceReference is: " + finalReferenceString);
  return referenceString;
}

function buildSourceTitle(data, options) {
  let recordType = getRecordType(data);

  // fallback is the pageHeader but it is a bit ugly. e.g.:
  // Church registers - Other Church Registers Baptisms
  // So we use a title from the record type if available.
  let sourceTitle = data.pageHeader;
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
      sourceTitle = "Scotland Census, " + data.recordData["Year"];
      break;

    case "census_lds":
      sourceTitle = "Scotland Census, " + data.recordData["Year"] + " (LDS)";
      break;
  }

  return sourceTitle;
}

function buildCoreCitation(data, gd, builder) {
  let options = builder.getOptions();

  // this may need changing for census - modify and add year
  builder.sourceTitle = buildSourceTitle(data, options);

  // Note we put the "National Records of Scotland" in the websiteCreatorOwner, so it doesn't move
  // with source reference depending on options
  builder.websiteCreatorOwner = "National Records of Scotland";

  builder.sourceReference = buildSourceReference(data, gd, options);

  var url = buildCitationUrl(data, gd, options);

  if (options.citation_scotp_urlStyle == "visible") {
    builder.recordLinkOrTemplate = url;
  } else {
    const linkTitle = "ScotlandsPeople";
    let recordLink = "[" + url + " " + linkTitle + "]";
    builder.recordLinkOrTemplate = recordLink;
  }

  let additionalInfo = getAdditionalInfo(data, gd, builder);
  if (additionalInfo) {
    builder.dataString = additionalInfo;
  }
}

function buildCitation(input) {
  const data = input.extractedData;
  const gd = input.generalizedData;
  const runDate = input.runDate;
  const options = input.options;
  const type = input.type; // "inline", "narrative" or "source"

  let builder = new CitationBuilder(type, runDate, options);

  buildCoreCitation(data, gd, builder);

  // Get meaningful title
  var refTitle = getRefTitle(data, gd);
  builder.meaningfulTitle = refTitle;

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
