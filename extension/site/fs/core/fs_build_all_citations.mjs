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

import { RC } from "../../../base/core/record_collections.mjs";
import { RT } from "../../../base/core/record_type.mjs";
import { Role } from "../../../base/core/record_type.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";

import { buildNarrative } from "../../../base/core/narrative_builder.mjs";

import { groupSourcesIntoFacts } from "../../../base/core/group_sources_into_facts.mjs";

import { extractDataFromFetch } from "./fs_extract_data.mjs";
import { generalizeData } from "./fs_generalize_data.mjs";
import { buildCitation } from "./fs_build_citation.mjs";
import { buildHouseholdTable } from "../../../base/core/table_builder.mjs";

function inferEventDate(source) {
  // there is no date, this can cause sort issues. Sometime we can infer one

  if (source.notes && source.notes == "Source created by RecordSeek.com") {
    if (source.citation) {
      let title = source.citation.replace(/^"([^"]+)".*$/, "$1");
      if (title && title != source.citation) {
        // get any years in title
        let years = title.match(/\d\d\d\d/);
        if (years && years.length == 1) {
          return years[0];
        }
      }
    }
  }

  if (source.title) {
    // get any years in title
    let years = source.title.match(/\d\d\d\d/g);
    if (years && years.length == 1) {
      return years[0];
    }
  }

  return "";
}

function getDateString(date) {
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

  const dateString = "" + date.getUTCDate() + " " + monthStrings[date.getUTCMonth()] + " " + date.getUTCFullYear();

  return dateString;
}

function filterAndEnhanceFsSourcesIntoSources(result, options) {
  let sources = result.fsSources;

  result.sources = [];

  for (let source of sources) {
    //console.log("FS source is:");
    //console.log(source);

    let sourceObj = {};

    function addField(fieldName) {
      if (source[fieldName]) {
        sourceObj[fieldName] = source[fieldName];
      }
    }
    addField("citation");
    addField("title");
    addField("id");
    addField("notes");

    if (source.uri && source.uri.uri) {
      sourceObj.uri = source.uri.uri;

      if (source.uriUpdatedOn) {
        let date = new Date(source.uriUpdatedOn);
        const options = { day: "numeric", month: "long", year: "numeric" };
        //sourceObj.uriUpdatedDate = date.toLocaleDateString("en-GB", options);
        sourceObj.uriUpdatedDate = getDateString(date);
      }
    }

    if (options.buildAll_fs_excludeNonFsSources) {
      if (!sourceObj.uri) {
        continue;
      }
      let validLinkIndex = sourceObj.uri.search(/familysearch\.org\/ark\:\/\d+\/1\:1\:/);
      if (validLinkIndex == -1) {
        continue;
      }
    }

    // ignore some useless sources
    if (source.citation == "Ancestry Family Tree" && source.title == "Ancestry Family Trees" && !source.notes) {
      continue;
    }

    if (source.event) {
      if (source.event.sortKey) {
        sourceObj.sortKey = source.event.sortKey;
      }
      if (source.event.sortYear) {
        sourceObj.sortYear = source.event.sortYear;
      }
      if (source.event.displayDate) {
        sourceObj.eventDate = source.event.displayDate;
      }
    }

    if (!sourceObj.eventDate && !sourceObj.sortYear) {
      const inferredEventDate = inferEventDate(source);
      if (inferredEventDate) {
        sourceObj.eventDate = inferredEventDate;
      }
    }

    result.sources.push(sourceObj);
  }
}

function buildFsPlainCitations(result, type, options) {
  if (result.sources.length == 0) {
    result.citationsString = "";
    result.citationsStringType = type;
    result.success = true;
    return;
  }

  sortSourcesUsingFsSortKeysAndFetchedRecords(result);

  let citationsString = "";

  for (let source of result.sources) {
    if (type == "inline") {
      if (citationsString) {
        citationsString += "\n";
      }
      citationsString += buildRefForPlainCitation(source, false, options);
      citationsString += "\n";
    } else {
      citationsString += "* ";
      citationsString += getTextForPlainCitation(source, "source", false, options);
      citationsString += "\n";
    }
  }

  result.citationsString = citationsString;
  result.citationsStringType = type;
  result.citationCount = result.sources.length;

  result.success = true;
}

function inferBestEventDateForCompare(gd) {
  let eventDate = "";
  if (gd) {
    eventDate = gd.inferEventDate();

    if (gd.recordType == RT.Census) {
      let collection = undefined;
      if (gd.collectionData && gd.collectionData.id) {
        collection = RC.findCollection(gd.sourceOfData, gd.collectionData.id);
      }

      if (collection && collection.dates && collection.dates.exactDate) {
        eventDate = collection.dates.exactDate;
      }
    }

    if (gd.eventDate && gd.eventDate.quarter) {
      // for comparison we should use the last day of the quarter because
      // a birth date for a birth reg (for example) is guaranteed to be before the last
      // day of the quarter but could be before OR after the first day of the quarter
      let quarter = gd.eventDate.quarter;
      if (quarter >= 1 && quarter <= 4) {
        const endDays = ["31 Mar", "30 Jun", "30 Sep", "31 Dec"];
        let dayMonth = endDays[quarter - 1];
        let year = gd.eventDate.getYearString();
        if (dayMonth && year) {
          eventDate = dayMonth + " " + year;
        }
      }
    }

    if (!eventDate) {
      if (gd.recordType == RT.Burial) {
        // The burial date will be after the death date, we are not currently considering
        // date qualifiers in sorting though
        if (!gd.role || gd.role == Role.Primary) {
          let deathDate = gd.inferDeathDate();
          if (deathDate) {
            eventDate = deathDate;
          }
        } else {
          if (gd.inferPrimaryPersonDeathDate()) {
            let deathDate = gd.inferPrimaryPersonDeathDate();
            if (deathDate) {
              eventDate = deathDate;
            }
          }
        }
      } else if (gd.recordType == RT.Birth) {
        if (!gd.role || gd.role == Role.Primary) {
          let birthDate = gd.inferBirthDate();
          if (birthDate) {
            eventDate = birthDate;
          }
        }
      } else if (gd.recordType == RT.Marriage) {
        if (!gd.role || gd.role == Role.Primary) {
          if (gd.marriageDate) {
            eventDate = gd.marriageDate;
          }
        }
      }
    }
  }

  return eventDate;
}

// this can be used both for sorting sources and facts
function compareGdsAndSources(gdA, gdB, sourceA, sourceB) {
  let recordTypeSortPriority = {};
  recordTypeSortPriority[RT.Birth] = 1;
  recordTypeSortPriority[RT.Baptism] = 3;

  recordTypeSortPriority[RT.Census] = 50;

  recordTypeSortPriority[RT.Death] = 90;
  recordTypeSortPriority[RT.Burial] = 93;
  recordTypeSortPriority[RT.Will] = 94;
  recordTypeSortPriority[RT.Probate] = 95;

  function getEventPriority(source) {
    let priority = 50;
    if (source.generalizedData) {
      let rtPriority = recordTypeSortPriority[source.generalizedData.recordType];
      if (rtPriority) {
        priority = rtPriority;
      }
    }
    return priority;
  }

  let eventDateA = "";
  if (gdA) {
    eventDateA = inferBestEventDateForCompare(gdA);
  }
  let eventDateB = "";
  if (gdB) {
    eventDateB = inferBestEventDateForCompare(gdB);
  }

  if (!eventDateA) {
    eventDateA = sourceA.eventDate;
  }
  if (!eventDateB) {
    eventDateB = sourceB.eventDate;
  }

  if (!eventDateA) {
    eventDateA = sourceA.sortYear;
  }
  if (!eventDateB) {
    eventDateB = sourceB.sortYear;
  }

  if (eventDateA && eventDateB) {
    let result = DateUtils.compareDateStrings(eventDateA, eventDateB);
    if (result == 0) {
      // dates are equal, sort by record type
      let priorityA = getEventPriority(sourceA);
      let priorityB = getEventPriority(sourceB);
      result = priorityA - priorityB;
    }
    if (result != 0) {
      return result;
    }
  }

  // if one has a date and the other doesn't then the one with the date comes first
  if (eventDateA) {
    return -1;
  } else if (eventDateB) {
    return 1;
  }

  if (sourceA.sortKey && sourceB.sortKey) {
    if (sourceA.sortKey < sourceB.sortKey) {
      return -1;
    } else if (sourceA.sortKey > sourceB.sortKey) {
      return 1;
    }
  }

  if (sourceA.sortKey) {
    return -1;
  } else if (sourceB.sortKey) {
    return 1;
  }

  // to get consistent sorting sort by citation, then, title then uri
  // It is unlikely to get here if all sources have a sort key
  let result = 0;

  if (sourceA.citation) {
    if (sourceB.citation) {
      result = sourceA.citation.localeCompare(sourceB.citation);
    } else {
      return -1;
    }
  } else if (sourceB.citation) {
    return 1;
  }

  if (sourceA.title) {
    if (sourceB.title) {
      result = sourceA.title.localeCompare(sourceB.title);
    } else {
      return -1;
    }
  } else if (sourceB.title) {
    return 1;
  }

  if (sourceA.uri) {
    if (sourceB.uri) {
      result = sourceA.uri.localeCompare(sourceB.uri);
    } else {
      return -1;
    }
  } else if (sourceB.uri) {
    return 1;
  }

  return result;
}

function sortSourcesUsingFsSortKeysAndFetchedRecords(result) {
  function compareFunction(a, b) {
    return compareGdsAndSources(a.generalizedData, b.generalizedData, a, b);
  }

  // sort the sources
  result.sources.sort(compareFunction);
  //console.log("sortSourcesUsingFsSortKeysAndFetchedRecords: sorted sources:");
  //console.log(result.sources);
}

function sortFacts(result) {
  // It is very unlikely that sortFacts will change the order but it does seem
  // possible in rare merge cases
  //console.log("sortFacts");
  //console.log(result);

  function compareFunction(a, b) {
    return compareGdsAndSources(a.generalizedData, b.generalizedData, a.sources[0], b.sources[0]);
  }

  // sort the sources
  result.facts.sort(compareFunction);
}

function buildNarrativeForPlainCitation(source, options) {
  let narrative = "";

  if (source.prefName) {
    narrative += source.prefName;
  } else {
    narrative += "This person";
  }
  narrative += " was in a record";
  if (source.eventDate) {
    // could get correct preposition here (see formatDateObj in narrative_builder)
    narrative += " in " + source.eventDate;
  } else if (source.sortYear) {
    narrative += " in " + source.sortYear;
  }
  narrative += ".";
  return narrative;
}

function getTextForPlainCitation(source, type, isSourcerStyle, options) {
  function cleanText(text) {
    if (text) {
      text = text.replace(/\<\/?i\>/gi, "''");

      if (type == "source") {
        text = text.replace(/ *\n */g, "<br/>");
        text = text.replace(/\s+/g, " ");
      } else {
        text = text.replace(/ *\n */g, "<br/>\n");
      }

      text = text.trim();

      text = text.replace(/,$/g, "");

      text = text.trim();
    } else {
      text = "";
    }
    return text;
  }

  function cleanTitle(text) {
    if (text) {
      // sometimes title has a newline after the person's name for no apparent reason
      let titleText = text.replace(/\n/g, " ");
      titleText = titleText.replace(/\s+/g, " ");
      text = cleanText(titleText);
    }
    return text;
  }

  function cleanCitation(text) {
    if (text) {
      let titleText = text.replace(/\n/g, " ");
      titleText = titleText.replace(/\s+/g, " ");
      text = cleanText(titleText);
    }
    return text;
  }

  function cleanNotes(text) {
    if (text) {
      text = cleanText(text);

      // crap that sometimes gets pasted in
      text = text.replace(/[,\s\n]+save\s+cancel/gi, "");
      text = text.replace(/\s+View\sblank\sform,?/gi, "");
      text = text.replace(/\s+Add\salternate\sinformation,?/gi, "");
      text = text.replace(/\s+Report\s+issue,?/gi, "");
      text = text.replace(/SAVE\s+PRINT\s+SHARE[,.\s]/gi, "");
      text = text.replace(/[\s\n]+VIEW[ ,]/gi, "");

      text = text.replace(/ +/g, " ");
      text = text.trim();
    } else {
      text = "";
    }

    return text;
  }

  function addSeparationWithinBody(nonNewlineSeparator) {
    if (citationText) {
      let addedSeparation = false;
      if (isSourcerStyle) {
        if (options.citation_general_addBreaksWithinBody) {
          citationText += "<br/>";
          addedSeparation = true;
        }

        if (type != "source" && options.citation_general_addNewlinesWithinBody) {
          citationText += "\n";
          addedSeparation = true;
        }
      }

      if (!addedSeparation) {
        citationText += nonNewlineSeparator;
      }
    }
  }

  let cleanTitleText = cleanTitle(source.title);
  let cleanCitationText = cleanCitation(source.citation);

  let includedTitle = false;
  let includedCitation = false;
  let includedNotes = false;

  // If it is an FS Source then we only want the full FS citation and not the title.
  const isFsSource = /^https?\:\/\/familysearch\.org\/ark\:\/\d+\/1\:1\:[A-Z0-1\-]+.*$/.test(source.uri);

  let citationText = "";

  if (cleanCitationText) {
    if (isFsSource || cleanTitleText.includes(" in the ")) {
      citationText += cleanCitationText;
      includedCitation = true;
    } else {
      citationText += cleanTitleText;
      includedTitle = true;

      if (!citationText.includes(cleanCitationText)) {
        addSeparationWithinBody(" ");
        citationText += cleanCitationText;
        includedCitation = true;
      }
    }
  } else {
    if (cleanTitleText) {
      citationText += cleanTitleText;
      includedTitle = true;
    }
  }

  // somtimes the citation is just the uri, in this case it is better to put the title first
  if (!citationText || citationText == source.uri) {
    if (!includedTitle) {
      citationText = cleanTitleText;
      includedTitle = true;
    }
  }

  // if there is no other text other than notes then put it before link
  if (!citationText && !cleanTitleText && !cleanCitationText) {
    citationText += cleanText(source.notes);
    includedNotes = true;
  }

  if (source.uri && !citationText.includes(source.uri)) {
    let tempUri = source.uri.replace(/^https?\:\/\/[^\/]+\//, "");
    if (!citationText.includes(tempUri)) {
      addSeparationWithinBody(" ");
      if (source.uriUpdatedDate) {
        citationText += "(" + source.uri + " : " + source.uriUpdatedDate + ")";
      } else {
        citationText += source.uri;
      }
    }
  }

  if (!isFsSource && !includedTitle && cleanTitleText && !citationText.includes(cleanTitleText)) {
    addSeparationWithinBody(", ");
    citationText += cleanTitleText;
  }

  if (!includedCitation && cleanCitationText && !citationText.includes(cleanCitationText)) {
    addSeparationWithinBody(", ");
    citationText += cleanCitationText;
  }

  if (source.notes && !includedNotes && options.buildAll_fs_includeNotes) {
    // some notes are an automatic comment like "Source created by RecordSeek.com"
    // Not useful to include that.
    if (!source.notes.startsWith("Source created by ")) {
      addSeparationWithinBody(", ");
      citationText += " " + cleanNotes(source.notes);
    }
  }

  return citationText;
}

function buildRefForPlainCitation(source, isSourcerStyle, options) {
  let refString = "<ref>";
  if (options.citation_general_addNewlinesWithinRefs) {
    refString += "\n";
  }
  refString += getTextForPlainCitation(source, "inline", isSourcerStyle, options);
  if (options.citation_general_addNewlinesWithinRefs) {
    refString += "\n";
  }
  refString += "</ref>";
  return refString;
}

function generateSourcerCitationsStringForFacts(result, type, options) {
  // this is only ever used for narrative or inline
  let citationsString = "";
  let citationCount = 0;

  for (let fact of result.facts) {
    if (fact.generalizedData) {
      if (citationsString) {
        citationsString += "\n";
      }
      if (fact.sources.length > 1) {
        if (type == "narrative") {
          // need a combined narrative
          const narrativeInput = {
            eventGeneralizedData: fact.generalizedData,
            options: options,
          };
          let narrative = buildNarrative(narrativeInput);
          citationsString += narrative;
        }
        let longestTable = "";
        for (let source of fact.sources) {
          let citation = source.citationObject.citation;
          // strip off any existing narrative
          let refIndex = citation.indexOf("<ref>");
          if (refIndex != -1) {
            citation = citation.substring(refIndex);
          }
          // strip off any table after the narrative
          const endRef = "</ref>";
          let endRefIndex = citation.indexOf(endRef);
          if (endRefIndex != -1) {
            let startTableIndex = endRefIndex + endRef.length;
            if (startTableIndex < citation.length) {
              let table = citation.substring(startTableIndex);
              if (table.length > longestTable.length) {
                longestTable = table;
              }
              citation = citation.substring(0, startTableIndex);
            }
          }
          citationsString += citation;
        }
        if (longestTable) {
          citationsString += longestTable;
        }
      } else {
        for (let source of fact.sources) {
          citationsString += source.citationObject.citation;
        }
      }
      citationCount += fact.sources.length;
      citationsString += "\n";
    } else if (fact.sources.length == 1) {
      let source = fact.sources[0];

      if (citationsString) {
        citationsString += "\n";
      }

      if (type == "narrative") {
        citationsString += buildNarrativeForPlainCitation(source, options);
      }
      citationsString += buildRefForPlainCitation(source, true, options);

      citationsString += "\n";
      citationCount++;
    }
  }

  result.citationsString = citationsString;
  result.citationCount = citationCount;
}

function generateSourcerCitationsStringForTypeSource(result, options) {
  let citationsString = "";

  for (let source of result.sources) {
    if (source.citationObject) {
      citationsString += source.citationObject.citation;
      citationsString += "\n";
    } else {
      citationsString += "* " + getTextForPlainCitation(source, "source", true, options);
      citationsString += "\n";
    }
  }

  result.citationsString = citationsString;
  result.citationCount = result.sources.length;
}

function generateSourcerCitationsStringForTypeInline(result, options) {
  let citationsString = "";

  for (let source of result.sources) {
    if (source.citationObject) {
      if (citationsString) {
        citationsString += "\n";
      }
      citationsString += source.citationObject.citation;
      citationsString += "\n";
    } else {
      if (citationsString) {
        citationsString += "\n";
      }

      citationsString += buildRefForPlainCitation(source, true, options);
      citationsString += "\n";
    }
  }

  result.citationsString = citationsString;
  result.citationCount = result.sources.length;
}

function generateSourcerCitationsStringForTypeNarrative(result, options) {
  let citationsString = "";

  for (let source of result.sources) {
    if (source.citationObject) {
      if (citationsString) {
        citationsString += "\n";
      }
      citationsString += source.citationObject.citation;
      citationsString += "\n";
    } else {
      if (citationsString) {
        citationsString += "\n";
      }

      citationsString += buildNarrativeForPlainCitation(source, options);
      citationsString += buildRefForPlainCitation(source, true, options);
      citationsString += "\n";
    }
  }

  result.citationsString = citationsString;
  result.citationCount = result.sources.length;
}

function doesCitationWantHouseholdTable(citationType, generalizedData, options) {
  if (!generalizedData.hasHouseholdTable()) {
    return false;
  }

  let optionsWantCitation = false;

  let autoTableOpt = options.table_general_autoGenerate;

  if (autoTableOpt != "none" && autoTableOpt != "citationInTableCaption") {
    optionsWantCitation = true;
    if (citationType == "source") {
      if (autoTableOpt != "withinRefOrSource") {
        optionsWantCitation = false;
      }
    }
  } else if (citationType == "narrative") {
    let includeHouseholdOpt = options.narrative_census_includeHousehold;
    if (includeHouseholdOpt != "no") {
      let householdFormatOpt = options.narrative_census_householdPartFormat;
      if (householdFormatOpt == "withFamily") {
        optionsWantCitation = true;
      }
    }
  }

  if (optionsWantCitation) {
    return true;
  }

  return false;
}

function buildSourcerCitation(runDate, sourceDataObjects, source, type, options) {
  if (sourceDataObjects) {
    source.dataObjects = sourceDataObjects;
    let sessionId = "";

    let extractedData = extractDataFromFetch(undefined, "", source.dataObjects, "record", sessionId, options);
    if (extractedData && extractedData.pageType) {
      source.extractedData = extractedData;

      let generalizedData = generalizeData({ extractedData: extractedData });
      if (generalizedData && generalizedData.hasValidData) {
        source.generalizedData = generalizedData;

        let householdTableString = "";
        if (doesCitationWantHouseholdTable(type, generalizedData, options)) {
          const tableInput = {
            extractedData: extractedData,
            generalizedData: generalizedData,
            dataCache: undefined,
            options: options,
          };

          const tableObject = buildHouseholdTable(tableInput);
          householdTableString = tableObject.tableString;
        }

        const input = {
          extractedData: extractedData,
          generalizedData: generalizedData,
          runDate: runDate,
          type: type,
          dataCache: undefined,
          options: options,
          householdTableString: householdTableString,
        };
        const citationObject = buildCitation(input);
        citationObject.generalizedData = generalizedData;
        source.citationObject = citationObject;
      }
    }
  }

  if (!source.citationObject) {
    // we don't have an FS fetch object, or it wasn't a record object we could process,
    // see what we can do by parsing FS citation string

    //console.log("getSourcerCitation: could not fetch, source is:");
    //console.log(source);

    if (/^"[^"]+"\s+\d\d\d\d http/.test(source.citation)) {
      let year = source.citation.replace(/^"[^"]+"\s+(\d\d\d\d) http.*$/, "$1");
      if (year && year != source.citation) {
        source.sortYear = year;
      }
      let firstSentence = source.citation.replace(/^"([^"]+)"\s+\d\d\d\d http.*$/, "$1");
      if (firstSentence && firstSentence != source.citation) {
        source.firstSentence = firstSentence;
      }
      let link = source.citation.replace(/^"[^"]+"\s+\d\d\d\d (http.*)\. Accessed.*$/, "$1");
      if (link && link != source.citation) {
        source.link = link;
      }

      let title = source.title;
      if (!title) {
        title = source.firstSentence;
      }
      if (title) {
        let joinIndex = title.search(/[\s\n]+in\s+the\s+/);
        if (joinIndex != -1) {
          source.prefName = title.substring(0, joinIndex);
        }
      }
    }
  }
}

async function buildSourcerCitations(result, type, options) {
  try {
    if (options.buildAll_fs_excludeOtherRoleSources) {
      let newSources = [];
      for (let source of result.sources) {
        if (source.citationObject) {
          const gd = source.generalizedData;
          if (gd && gd.role && gd.role != Role.Primary) {
            // exclude this one
          } else {
            newSources.push(source);
          }
        } else {
          newSources.push(source);
        }
      }
      result.sources = newSources;
    }

    if (options.buildAll_fs_excludeRetiredSources != "never") {
      let newSources = [];
      for (let source of result.sources) {
        let removeSource = false;
        let ed = source.extractedData;
        // e.g. "Forward To Ark": "https://familysearch.org/ark:/61903/1:2:9HXH-3B3",
        if (ed && ed.recordData && ed.recordData["Forward To Ark"]) {
          if (options.buildAll_fs_excludeRetiredSources == "always") {
            removeSource = true;
          } else {
            // the forward to Ark URL cannot be compared as it is a weird redirect using "/1:2:"
            // but the current URL is store in either forwardPersonToArk or extData in this case.
            let currentSourceUrl = ed.forwardPersonToArk;
            if (!currentSourceUrl) {
              if (ed.extData && ed.extData.startsWith("http")) {
                currentSourceUrl = ed.extData;
              }
            }

            if (currentSourceUrl) {
              currentSourceUrl = currentSourceUrl.replace("www.familysearch.org", "familysearch.org");

              //console.log("currentSourceUrl = " + currentSourceUrl);

              for (let otherSource of result.sources) {
                //console.log("otherSource.uri = " + otherSource.uri);
                if (otherSource.uri == currentSourceUrl) {
                  removeSource = true;
                  //console.log("removing duplicate source");
                  break;
                }
              }
            }
          }
        }

        if (!removeSource) {
          newSources.push(source);
        }
      }
      result.sources = newSources;
    }

    sortSourcesUsingFsSortKeysAndFetchedRecords(result);

    if (type == "source") {
      generateSourcerCitationsStringForTypeSource(result, options);
    } else {
      let groupCitations = options.buildAll_fs_groupCitations;

      if (groupCitations) {
        groupSourcesIntoFacts(result, type, options); // only needed for inlne and narrative
        sortFacts(result);
        generateSourcerCitationsStringForFacts(result, type, options);
      } else {
        if (type == "inline") {
          generateSourcerCitationsStringForTypeInline(result, options);
        } else {
          // must be narrative
          generateSourcerCitationsStringForTypeNarrative(result, options);
        }
      }
    }

    result.citationsStringType = type;
    result.success = true;
  } catch (error) {
    result.success = false;
    result.errorMessage = error.message;
  }
}

export { filterAndEnhanceFsSourcesIntoSources, buildSourcerCitation, buildSourcerCitations, buildFsPlainCitations };
