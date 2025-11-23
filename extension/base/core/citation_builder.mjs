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

import { buildNarrative } from "./narrative_builder.mjs";
import { DataString } from "./data_string.mjs";
import { DateObj } from "./generalize_data_utils.mjs";

// The different parts of a citation are:
//
//     - Meaningful title. e.g. 1851 Census
//     - Source/repository name (possibly with link to original data) e.g. 1851 England Census
//     - Source reference e.g. Class: HO107; Piece: 1946; Folio: 647; Page: 25; GSU roll: 221106
//     - optional sharing link/template
//     - record link/template plus accessed date
//     - optional link to external site (e.g. FMP image from FS)
//     - data table or dataString

class CitationBuilder {
  constructor(type, runDate, options) {
    this.type = type; // "inline", "narrative" or "source"
    this.options = options;
    this.runDate = runDate;
    this.meaningfulTitle = "";
    this.sourceTitle = "";
    this.sourceReference = "";
    this.sharingLinkOrTemplate = "";
    this.recordLinkOrTemplate = "";
    this.externalSiteLink = "";
    this.dataString = "";
    this.includeSubscriptionRequired = "none";
    this.putSourceTitleInQuotes = true;
    this.databaseHasImages = false;
    this.putRecordLinkInTitle = false;
  }

  getOptions() {
    return this.options;
  }

  getDateString(generalizedData, date) {
    const monthStrings = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    let dateString = "" + date.getDate() + " " + monthStrings[date.getMonth()] + " " + date.getFullYear();

    let format = this.options.citation_general_accessedDateFormat;
    if (format != "long") {
      let dateObj = new DateObj();
      dateObj.dateString = dateString;
      if (generalizedData) {
        dateString = generalizedData.getNarrativeDateFormat(dateObj, format, "none", false);
      } else {
        dateString = dateObj.getFormattedStringForCitationOrNarrative(format, "none", false);
      }
    }

    return dateString;
  }

  getSubReqString(subReqOption) {
    let subReqString = "";
    if (subReqOption == "subscriptionRequired") {
      subReqString = "subscription required";
    } else if (subReqOption == "requiresSubscription") {
      subReqString = "requires subscription";
    } else if (subReqOption == "dollar") {
      subReqString = "$";
    } else if (subReqOption == "paywall") {
      subReqString = "paywall";
    }
    return subReqString;
  }

  addBreakNewlineOrAlternatives(oldCitation, separatorChar = ",") {
    let target = this.options.citation_general_target;

    let citation = oldCitation;

    citation = citation.trim();

    if (citation.endsWith(";") || citation.endsWith(",") || citation.endsWith(".") || citation.endsWith("\n")) {
      citation = citation.substring(0, citation.length - 1).trim();
    }

    const breakString = "<br/>";
    if (target == "wikitree") {
      if (citation.endsWith(breakString)) {
        citation = citation.substring(0, citation.length - breakString.length).trim();
      }
    }

    if (target == "wikitree" && this.options.citation_general_addBreaksWithinBody) {
      citation += breakString;
    } else {
      if (this.options.citation_general_commaInsideQuotes && citation.endsWith('"')) {
        citation = citation.substring(0, citation.length - 1);
        citation += separatorChar + '"';
      } else {
        citation += separatorChar;
      }

      citation += " ";
    }
    if (this.type != "source" && this.options.citation_general_addNewlinesWithinBody) {
      citation += "\n";
    }

    return citation;
  }

  getSourceReferenceItemSeparator() {
    let itemSep = ";";
    if (this.options.citation_general_sourceReferenceSeparator == "commaColon") {
      itemSep = ",";
    } else if (this.options.citation_general_sourceReferenceSeparator == "commaSpace") {
      itemSep = ",";
    }
    return itemSep;
  }

  getSourceReferenceValueSeparator() {
    let valueSep = ":";
    if (this.options.citation_general_sourceReferenceSeparator == "commaColon") {
      valueSep = ":";
    } else if (this.options.citation_general_sourceReferenceSeparator == "commaSpace") {
      valueSep = "";
    }
    return valueSep;
  }

  addSourceReferenceField(label, value, excludeValues) {
    if (!value) {
      return;
    }

    if (excludeValues && excludeValues.includes(value)) {
      return;
    }

    if (this.sourceReference) {
      const itemSep = this.getSourceReferenceItemSeparator();
      this.sourceReference += itemSep + " ";
    }

    if (label) {
      const valueSep = this.getSourceReferenceValueSeparator();
      this.sourceReference += label + valueSep + " " + value;
    } else {
      this.sourceReference += value;
    }
  }

  addSourceReferenceText(value) {
    if (!value) {
      return;
    }

    if (this.sourceReference) {
      const itemSep = this.getSourceReferenceItemSeparator();
      this.sourceReference += itemSep + " ";
    }
    this.sourceReference += value;
  }

  getStandardDataString(gd) {
    let input = {
      generalizedData: gd,
      options: this.options,
    };
    let dataString = DataString.buildDataString(input);

    if (!dataString) {
      // Some sites would default to a list or table in this case but for site using
      // addStandardDataString we try to generate a default string with name, date, place
      dataString = DataString.buildDefaultDataString(input);
    }

    if (dataString) {
      if (!dataString.endsWith(".")) {
        dataString += ".";
      }
      return dataString;
    }
  }

  addStandardDataString(gd) {
    let dataString = this.getStandardDataString(gd);
    if (dataString) {
      this.dataString = dataString;
    }
  }

  addListDataString(fields) {
    let dataString = this.dataString;

    for (let field of fields) {
      if (field.key) {
        dataString = this.addKeyValuePairToDataListString(dataString, field.key, field.value);
      } else {
        dataString = this.addSingleValueToDataListString(dataString, field.value);
      }
    }

    if (dataString) {
      if (!dataString.endsWith(".")) {
        dataString += ".";
      }
      this.dataString = dataString;
    }
  }

  addListDataStringFromRecordData(recordData, fieldsToExclude) {
    let dataString = this.dataString;

    for (let key in recordData) {
      if (!fieldsToExclude.includes(key)) {
        let value = recordData[key];
        if (value) {
          dataString = this.addKeyValuePairToDataListString(dataString, key, value);
        }
      }
    }

    if (dataString) {
      if (!dataString.endsWith(".")) {
        dataString += ".";
      }
      this.dataString = dataString;
    }
  }

  addNarrative(gd, dataCache, options) {
    // eventually these should come from the dataCache
    // The problem is how to be sure we get a valid match from the data cache?
    // It could be worth just getting it for the gender for pronouns
    let wtExtractedData = undefined;
    let wtGeneralizedData = undefined;

    const narrativeInput = {
      eventGeneralizedData: gd,
      wtExtractedData: wtExtractedData,
      wtGeneralizedData: wtGeneralizedData,
      options: options,
    };
    let narrative = buildNarrative(narrativeInput);

    //console.log("addNarrative, narrative is");
    //console.log(narrative);

    if (narrative) {
      this.narrative = narrative;
    }
  }

  addSingleValueToDataListString(dataListString, value) {
    let itemSep = ";";
    if (this.options.citation_general_dataListSeparator == "commaColon") {
      itemSep = ",";
    } else if (this.options.citation_general_dataListSeparator == "commaSpace") {
      itemSep = ",";
    }

    if (value && value != "-") {
      value = value.trim();
      if (dataListString != "") {
        dataListString += itemSep + " ";
      }
      dataListString += value;
    }

    return dataListString;
  }

  addKeyValuePairToDataListString(dataListString, key, value) {
    let itemSep = ";";
    let valueSep = ":";
    if (this.options.citation_general_dataListSeparator == "commaColon") {
      itemSep = ",";
      valueSep = ":";
    } else if (this.options.citation_general_dataListSeparator == "commaSpace") {
      itemSep = ",";
      valueSep = "";
    }

    if (key && value && value != "-") {
      value = value.trim();
      if (dataListString != "") {
        if (!dataListString.endsWith(itemSep) && !dataListString.endsWith(".")) {
          dataListString += itemSep + " ";
        } else if (!dataListString.endsWith(" ")) {
          dataListString += " ";
        }
      }
      if (value.startsWith("http")) {
        dataListString += "[" + value + " " + key + "]";
      } else {
        dataListString += key + valueSep + " " + value;
      }
    }

    return dataListString;
  }

  buildDataList(recordData, keyFilterFunction) {
    let itemSep = ";";
    let valueSep = ":";
    if (this.options.citation_general_dataListSeparator == "commaColon") {
      itemSep = ",";
      valueSep = ":";
    } else if (this.options.citation_general_dataListSeparator == "commaSpace") {
      itemSep = ",";
      valueSep = "";
    }

    let keys = Object.keys(recordData);
    if (keyFilterFunction) {
      keys = keyFilterFunction(keys, recordData);
    }

    let dataListString = "";

    for (let key of keys) {
      let value = recordData[key];
      if (value && value != "-") {
        value = value.trim();
        if (dataListString != "") {
          dataListString += itemSep + " ";
        }
        if (value.startsWith("http")) {
          dataListString += "[" + value + " " + key + "]";
        } else {
          dataListString += key + valueSep + " " + value;
        }
      }
    }

    return dataListString;
  }

  getCitationString(generalizedData = null) {
    let options = this.options;
    let target = options.citation_general_target;
    let autoTableOpt = options.table_general_autoGenerate;

    let accessedDate = this.getDateString(generalizedData, this.runDate);
    let subReqString = this.getSubReqString(this.includeSubscriptionRequired);

    let citation = "";

    function addAccessedDateToRecordLink(recordLinkOrTemplate) {
      let result = "";
      if (options.citation_general_addAccessedDate == "parenAfterLink") {
        result += recordLinkOrTemplate;

        if (subReqString) {
          result += " (" + subReqString + ", accessed " + accessedDate + ")";
        } else {
          result += " (accessed " + accessedDate + ")";
        }
      } else if (options.citation_general_addAccessedDate == "parenBeforeLink") {
        result += "(";
        result += recordLinkOrTemplate;

        if (subReqString) {
          result += " : " + subReqString + ", accessed " + accessedDate + ")";
        } else {
          result += " : accessed " + accessedDate + ")";
        }
      } else {
        result += recordLinkOrTemplate;

        if (subReqString) {
          result += " (" + subReqString + ")";
        }
      }
      return result;
    }

    if (this.type == "narrative" && this.narrative) {
      citation += this.narrative;
    }

    // For a plain text target the "narrative" type mean JUST the narrative
    if (target == "plain" && this.type == "narrative") {
      return citation;
    }

    if (target == "wikitree") {
      if (this.type == "source") {
        citation += "* ";
      } else {
        citation += "<ref>";
      }

      if (this.type != "source" && options.citation_general_addNewlinesWithinRefs) {
        citation += "\n";
      }
    }

    if (options.citation_general_meaningfulNames != "none" && this.meaningfulTitle) {
      if (target == "wikitree" && options.citation_general_meaningfulNames == "bold") {
        citation += "'''" + this.meaningfulTitle + "''':";
      } else if (target == "wikitree" && options.citation_general_meaningfulNames == "italic") {
        citation += "''" + this.meaningfulTitle + "'':";
      } else {
        citation += this.meaningfulTitle + ":";
      }

      if (target == "wikitree") {
        if (this.type != "source" && options.citation_general_addNewlinesWithinBody) {
          citation += "\n";
        } else {
          citation += " ";
        }
      } else {
        citation += " ";
      }
    }

    if (this.sourceTitle) {
      let sourceTitle = this.sourceTitle.trim();
      if (this.putRecordLinkInTitle && this.recordLinkOrTemplate) {
        sourceTitle = "[" + this.recordLinkOrTemplate + " " + sourceTitle + "]";
        sourceTitle = addAccessedDateToRecordLink(sourceTitle);
      } else if (this.putSourceTitleInQuotes) {
        if (options.citation_general_sourceTitleInItalics && target == "wikitree") {
          sourceTitle = "''" + sourceTitle + "''";
        } else {
          sourceTitle = '"' + sourceTitle + '"';
        }
      }
      citation += sourceTitle;

      if (options.citation_general_addEeItemType) {
        if (options.citation_general_commaInsideQuotes && citation.endsWith('"')) {
          citation = citation.substring(0, citation.length - 1);
          citation += ',"';
        } else {
          citation += ",";
        }
        if (this.databaseHasImages) {
          citation += " database with images";
        } else {
          citation += " database";
        }
      }

      citation = this.addBreakNewlineOrAlternatives(citation);
    }

    if (this.websiteCreatorOwner) {
      citation += this.websiteCreatorOwner;

      if (this.sourceReference && options.citation_general_referencePosition == "afterSourceTitle") {
        citation += ", ";
      } else {
        citation = this.addBreakNewlineOrAlternatives(citation);
      }
    }

    if (this.sourceReference && options.citation_general_referencePosition == "afterSourceTitle") {
      citation += this.sourceReference;
      citation = this.addBreakNewlineOrAlternatives(citation);
    }

    if (this.sharingLinkOrTemplate) {
      citation += this.sharingLinkOrTemplate;
      if (this.recordLinkOrTemplate) {
        if (subReqString) {
          citation += " (free access)";
          citation = this.addBreakNewlineOrAlternatives(citation);
        } else {
          citation += " - "; // separate the two links with a hyphen for space
        }
      }
    } else if (this.imageLink) {
      citation += this.imageLink;
      if (this.recordLinkOrTemplate) {
        citation += " - "; // separate the two links with a hyphen for space
      }
    }

    if (this.recordLinkOrTemplate && !this.putRecordLinkInTitle) {
      citation += addAccessedDateToRecordLink(this.recordLinkOrTemplate);
    }

    if (this.externalSiteLink) {
      if (!citation.endsWith("\n")) {
        if (options.citation_general_addBreaksWithinBody) {
          citation += "<br/>";
        } else {
          citation += " ";
        }
        if (this.type != "source" && options.citation_general_addNewlinesWithinBody) {
          citation += "\n";
        }
      }
      citation += this.externalSiteLink;
    }

    if (this.dataString) {
      if (!this.dataString.startsWith("{|")) {
        citation = this.addBreakNewlineOrAlternatives(citation);
        if (this.type != "source" && options.citation_general_dataStringIndented) {
          if (!options.citation_general_addNewlinesWithinBody) {
            citation += "\n";
          }
          citation += ":";
        }
        if (options.citation_general_dataStringInItalics) {
          citation += "''" + this.dataString + "''";
        } else {
          citation += this.dataString;
        }
      } else {
        citation += "\n"; // always need a newline before table
        citation += this.dataString;
      }
    }

    if (this.sourceReference && options.citation_general_referencePosition == "atEnd") {
      citation = this.addBreakNewlineOrAlternatives(citation, ";");
      if (!this.sourceReference.toLowerCase().startsWith("citing ")) {
        citation += "citing ";
      }
      citation += this.sourceReference;
    }

    citation = citation.trim();
    while (citation.endsWith("\n") || citation.endsWith("<br/>")) {
      if (citation.endsWith("\n")) {
        citation = citation.substring(0, citation.length - 1).trim();
      } else if (citation.endsWith("<br/>")) {
        citation = citation.substring(0, citation.length - 5).trim();
      }
    }

    citation = citation.trim();
    while (citation.endsWith(",") || citation.endsWith(";")) {
      citation = citation.substring(0, citation.length - 1).trim();
    }

    // If the citation doesn't end with a period already we may want to add one
    // It there is a period at the end but before a close quote then it counts.
    const endsInPossQuotedPeriodRegEx = /.*\.['"]*$/;
    let endsInPeriod = endsInPossQuotedPeriodRegEx.test(citation);
    if (!endsInPeriod) {
      const endsInUrlRegEx = /.*https?\:[^ ]+$/i;
      const endsInBareUrl = endsInUrlRegEx.test(citation);
      const endsInTable = citation.endsWith("|}");

      // If it doesn't end with a period already and doesn't end in a bare URL then add one
      // Some could also end in a table if the data style is set to table, don't add period
      // in that case either.
      if (!endsInBareUrl && !endsInTable) {
        citation += ".";
      }
    }

    if (this.type != "source" && options.citation_general_addNewlinesWithinRefs) {
      citation += "\n";
    }

    if (this.householdTableString) {
      if (autoTableOpt == "withinRefOrSource") {
        let tableFormat = options.table_general_format;
        // we used to disallow having a table or list format household if this is a "source" type
        // However, people do want to use the :: style list format in a source
        // Maybe we should just allow whetever they want?
        //if (!(this.type == "source" && (tableFormat == "table" || tableFormat == "list"))) {
        if (!citation.endsWith("\n")) {
          if (this.type == "source") {
            if (tableFormat == "table" || tableFormat == "list") {
              citation += "\n";
            } else if (options.citation_general_addBreaksWithinBody) {
              citation += "<br/>";
            } else {
              citation += " ";
            }
          } else {
            if (tableFormat == "table" || tableFormat == "list") {
              citation += "\n";
            } else if (options.citation_general_addNewlinesWithinRefs) {
              citation += "\n";
            } else {
              citation += " ";
            }
          }
        }
        citation += this.householdTableString;
        if (tableFormat != "sentence" || options.citation_general_addNewlinesWithinRefs) {
          citation += "\n";
        }
        //}
      }
    }

    if (target == "wikitree" && this.type != "source") {
      citation += "</ref>";
    }

    if (target == "wikitree" && this.householdTableString && this.type != "source") {
      if (autoTableOpt == "afterRef" || autoTableOpt == "afterRefBlankLine") {
        if (autoTableOpt == "afterRef") {
          citation += "\n";
        } else if (autoTableOpt == "afterRefBlankLine") {
          citation += "\n\n";
        }
        citation += this.householdTableString;
      }
    }

    return citation;
  }

  getCitationObject(generalizedData, url) {
    let citationString = this.getCitationString(generalizedData);

    //console.log(fullCitation);

    let standardDataString = this.getStandardDataString(generalizedData);

    var citationObject = {
      citation: citationString,
      type: this.type,
      generalizedData: generalizedData,
      sourceReference: this.sourceReference,
      sourceTitle: this.sourceTitle,
      sourceNameWithinRepository: this.sourceNameWithinRepository,
      referenceWithinRepository: this.referenceWithinRepository,
      standardDataString: standardDataString,
      url: url,
      plainSharingLink: this.plainSharingLink,
    };

    return citationObject;
  }
}

function simpleBuildCitationWrapper(input, buildCoreCitation, refTitleOverrideFunction) {
  const ed = input.extractedData;
  const gd = input.generalizedData;
  const runDate = input.runDate;
  const options = input.options;
  const type = input.type; // "inline", "narrative" or "source"

  let builder = new CitationBuilder(type, runDate, options);

  if (input.householdTableString) {
    builder.householdTableString = input.householdTableString;
  }

  buildCoreCitation(ed, gd, builder);

  // Get meaningful title
  if (refTitleOverrideFunction) {
    builder.meaningfulTitle = refTitleOverrideFunction(ed, gd);
  } else {
    builder.meaningfulTitle = gd.getRefTitle();
  }

  if (type == "narrative") {
    builder.addNarrative(gd, input.dataCache, options);
  }

  // now the builder is setup, use it to build the citation text
  let citationObject = builder.getCitationObject(gd, ed.url);

  return citationObject;
}

export { CitationBuilder, simpleBuildCitationWrapper };
