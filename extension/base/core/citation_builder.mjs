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
  }

  getOptions() {
    return this.options;
  }

  getDateString(date) {
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

    const dateString =
      "" +
      date.getDate() +
      " " +
      monthStrings[date.getMonth()] +
      " " +
      date.getFullYear();

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
    let citation = oldCitation;

    if (this.options.citation_general_addBreaksWithinBody) {
      citation += "<br/>";
    } else {
      if (
        citation.endsWith(";") ||
        citation.endsWith(",") ||
        citation.endsWith(".")
      ) {
        citation = citation.substring(0, citation.length - 1);
      }

      if (
        this.options.citation_general_commaInsideQuotes &&
        citation.endsWith('"')
      ) {
        citation = citation.substring(0, citation.length - 1);
        citation += separatorChar + '"';
      } else {
        citation += separatorChar;
      }

      citation += " ";
    }
    if (
      this.type != "source" &&
      this.options.citation_general_addNewlinesWithinBody
    ) {
      citation += "\n";
    }

    return citation;
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

  buildDataList(recordData, keyFilterFunction) {
    let itemSep = ";";
    let valueSep = ":";
    if (this.options.citation_general_dataListSeparator == "commaColon") {
      itemSep = ",";
      valueSep = ":";
    } else if (
      this.options.citation_general_dataListSeparator == "commaSpace"
    ) {
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

  getCitationString() {
    let autoTableOpt = this.options.table_general_autoGenerate;

    let citation = "";
    let subReqString = this.getSubReqString(this.includeSubscriptionRequired);

    if (this.type == "narrative" && this.narrative) {
      citation += this.narrative;
    }

    if (this.type == "source") {
      citation += "* ";
    } else {
      citation += "<ref>";
    }

    if (
      this.type != "source" &&
      this.options.citation_general_addNewlinesWithinRefs
    ) {
      citation += "\n";
    }

    if (
      this.options.citation_general_meaningfulNames != "none" &&
      this.meaningfulTitle
    ) {
      if (this.options.citation_general_meaningfulNames == "bold") {
        citation += "'''" + this.meaningfulTitle + "''':";
      } else if (this.options.citation_general_meaningfulNames == "italic") {
        citation += "''" + this.meaningfulTitle + "'':";
      } else {
        citation += this.meaningfulTitle + ":";
      }

      if (
        this.type != "source" &&
        this.options.citation_general_addNewlinesWithinBody
      ) {
        citation += "\n";
      } else {
        citation += " ";
      }
    }

    if (this.sourceTitle) {
      let sourceTitle = this.sourceTitle.trim();
      if (this.putSourceTitleInQuotes) {
        sourceTitle = '"' + sourceTitle + '"';
      }
      citation += sourceTitle;

      if (this.options.citation_general_addEeItemType) {
        if (
          this.options.citation_general_commaInsideQuotes &&
          citation.endsWith('"')
        ) {
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

      if (
        this.sourceReference &&
        this.options.citation_general_referencePosition == "afterSourceTitle"
      ) {
        citation += ", ";
      } else {
        citation = this.addBreakNewlineOrAlternatives(citation);
      }
    }

    if (
      this.sourceReference &&
      this.options.citation_general_referencePosition == "afterSourceTitle"
    ) {
      citation += this.sourceReference;
      citation = this.addBreakNewlineOrAlternatives(citation);
    }

    if (this.sharingLinkOrTemplate) {
      citation += this.sharingLinkOrTemplate;
      if (this.recordLinkOrTemplate) {
        if (subReqString) {
          citation += " (free access)<br/>";
          if (
            this.type != "source" &&
            this.options.citation_general_addNewlinesWithinBody
          ) {
            citation += "\n";
          }
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

    if (this.recordLinkOrTemplate) {
      let accessedDate = this.getDateString(this.runDate);
      if (this.options.citation_general_addAccessedDate == "parenAfterLink") {
        citation += this.recordLinkOrTemplate;

        if (subReqString) {
          citation += " (" + subReqString + ", accessed " + accessedDate + ")";
        } else {
          citation += " (accessed " + accessedDate + ")";
        }
      } else if (
        this.options.citation_general_addAccessedDate == "parenBeforeLink"
      ) {
        citation += "(";
        citation += this.recordLinkOrTemplate;

        if (subReqString) {
          citation += " : " + subReqString + ", accessed " + accessedDate + ")";
        } else {
          citation += " : accessed " + accessedDate + ")";
        }
      } else {
        citation += this.recordLinkOrTemplate;

        if (subReqString) {
          citation += " (" + subReqString + ")";
        }
      }
    }

    if (this.externalSiteLink) {
      if (!citation.endsWith("\n")) {
        if (this.options.citation_general_addBreaksWithinBody) {
          citation += "<br/>";
        } else {
          citation += " ";
        }
        if (
          this.type != "source" &&
          this.options.citation_general_addNewlinesWithinBody
        ) {
          citation += "\n";
        }
      }
      citation += this.externalSiteLink;
    }

    if (this.dataString) {
      if (!this.dataString.startsWith("{|")) {
        citation = this.addBreakNewlineOrAlternatives(citation);
      } else {
        citation += "\n"; // always need a newline before table
      }
      citation += this.dataString;
    }

    if (
      this.sourceReference &&
      this.options.citation_general_referencePosition == "atEnd"
    ) {
      citation = this.addBreakNewlineOrAlternatives(citation, ";");
      if (!this.sourceReference.toLowerCase().startsWith("citing ")) {
        citation += "citing ";
      }
      citation += this.sourceReference;
    }

    citation = citation.trim();
    while (citation.endsWith(",")) {
      citation = citation.substring(0, citation.length - 1).trim();
    }

    if (!(citation.endsWith(".") || citation.endsWith("}"))) {
      // doesn't end with a period already and doesn't end in template or table
      // However, it could end with accessed date if there is no data section, or just
      // a bare link and we don't want a period then. There are various ways we could test
      // for this
      if (
        !(
          citation.endsWith("]") ||
          citation.endsWith(">") ||
          citation.endsWith("\n") ||
          citation.endsWith("* ")
        )
      ) {
        // if ends with accessed date then (for now) we don't add a period
        // (accessed 6 May 2021)
        if (!/accessed \d+ \w+ \d+\)$/.test(citation)) {
          citation += ".";
        }
      }
    }

    if (
      this.type != "source" &&
      this.options.citation_general_addNewlinesWithinRefs
    ) {
      citation += "\n";
    }

    if (this.householdTableString) {
      if (autoTableOpt == "withinRefOrSource") {
        let tableFormat = this.options.table_general_format;
        // we used to disallow having a table or list format household if this is a "source" type
        // However, people do want to use the :: style list format in a source
        // Maybe we should just allow whetever they want?
        //if (!(this.type == "source" && (tableFormat == "table" || tableFormat == "list"))) {
        if (!citation.endsWith("\n")) {
          if (this.type == "source") {
            if (tableFormat == "table" || tableFormat == "list") {
              citation += "\n";
            } else if (this.options.citation_general_addBreaksWithinBody) {
              citation += "<br/>";
            } else {
              citation += " ";
            }
          } else {
            if (tableFormat == "table" || tableFormat == "list") {
              citation += "\n";
            } else if (this.options.citation_general_addNewlinesWithinRefs) {
              citation += "\n";
            } else {
              citation += " ";
            }
          }
        }
        citation += this.householdTableString;
        if (
          tableFormat != "sentence" ||
          this.options.citation_general_addNewlinesWithinRefs
        ) {
          citation += "\n";
        }
        //}
      }
    }

    if (this.type != "source") {
      citation += "</ref>";
    }

    if (this.householdTableString && this.type != "source") {
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
}

export { CitationBuilder };
