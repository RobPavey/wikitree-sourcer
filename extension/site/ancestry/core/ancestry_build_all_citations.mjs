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

import { extractRecord } from "./ancestry_extract_data.mjs";
import { generalizeData } from "./ancestry_generalize_data.mjs";
import { buildCitation } from "./ancestry_build_citation.mjs";
import { buildHouseholdTable } from "../../../base/core/table_builder.mjs";

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

function sortSourcesUsingFetchedRecords(result) {
  function compareFunction(a, b) {
    return compareGdsAndSources(a.generalizedData, b.generalizedData, a, b);
  }

  // sort the sources
  result.sources.sort(compareFunction);
  //console.log("sortSourcesUsingFetchedRecords: sorted sources:");
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
          if (source.citationObject) {
            citationsString += source.citationObject.citation;
          } else {
            console.log("generateSourcerCitationsStringForFacts, no citationObject for source:");
            console.log(source);
          }
        }
      }
      citationCount += fact.sources.length;
      citationsString += "\n";
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
function setUrlStart(extractedData, result) {
  // request permission if needed
  // personUrl will be something like:
  // https://www.ancestry.com/family-tree/person/tree/86808578/person/260180350040/facts
  let personUrl = extractedData.url;
  // we want a record URL like this:
  // https://www.ancestry.com/discoveryui-content/view/7080503:8978
  let urlStart = personUrl.replace(/^(https?\:\/\/[^\.\.]+\.ancestry[^\.]*\.[^\/]+)\/.*$/, "$1");
  if (!urlStart || urlStart == personUrl) {
    result.errorMessage = "Could not parse url: " + personUrl;
    return result;
  }
  result.urlStart = urlStart;
}

function filterSourceIdsToSources(result, sourceIds, options) {
  //console.log("filterSourceIdsToSources, result is:");
  //console.log(result);
  //console.log("filterSourceIdsToSources, sourceIds is:");
  //console.log(sourceIds);

  let uniqueSourceIds = [];
  for (let sourceId of sourceIds) {
    // check if this is already in uniqueSourceIds
    let foundMatch = false;
    for (let uniqueSourceId of uniqueSourceIds) {
      if (sourceId.recordId == uniqueSourceId.recordId && sourceId.dbId == uniqueSourceId.dbId) {
        foundMatch = true;
        break;
      }
    }
    if (!foundMatch) {
      uniqueSourceIds.push(sourceId);
    }
  }

  result.sources = [];

  for (let sourceId of uniqueSourceIds) {
    let recordUrl = result.urlStart + "/discoveryui-content/view/" + sourceId.recordId + ":" + sourceId.dbId;
    let source = {
      recordUrl: recordUrl,
      title: sourceId.title,
    };
    result.sources.push(source);
  }

  //console.log("filterSourceIdsToSources end, result is:");
  //console.log(result);
}

function buildSourcerCitation(runDate, source, type, options) {
  //console.log("buildSourcerCitation: source is:");
  //console.log(source);

  let ed = source.extractedData;
  let gd = source.generalizedData;

  if (gd && gd.hasValidData) {
    let householdTableString = "";
    if (doesCitationWantHouseholdTable(type, gd, options)) {
      const tableInput = {
        extractedData: ed,
        generalizedData: gd,
        dataCache: undefined,
        options: options,
      };

      const tableObject = buildHouseholdTable(tableInput);
      householdTableString = tableObject.tableString;
    }

    const input = {
      extractedData: ed,
      generalizedData: gd,
      runDate: runDate,
      type: type,
      dataCache: undefined,
      sharingDataObj: source.sharingDataObj,
      options: options,
      householdTableString: householdTableString,
    };
    const citationObject = buildCitation(input);

    //console.log("buildSourcerCitation: buildCitation returned:");
    //console.log(citationObject);

    citationObject.generalizedData = gd;
    source.citationObject = citationObject;
  }
}

async function buildSourcerCitations(result, type, options) {
  try {
    if (options.buildAll_ancestry_excludeOtherRoleSources) {
      let newSources = [];
      for (let source of result.sources) {
        if (source.citationObject) {
          const gd = source.generalizedData;
          if (gd && gd.role && gd.role != Role.Primary) {
            // exclude this one
            result.numExcludedOtherRoleSources++;
          } else {
            newSources.push(source);
          }
        } else {
          newSources.push(source);
        }
      }
      result.sources = newSources;
    }

    sortSourcesUsingFetchedRecords(result);

    if (type == "source") {
      generateSourcerCitationsStringForTypeSource(result, options);
    } else {
      let groupCitations = options.buildAll_ancestry_groupCitations;

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
    console.log("caught exception, error is:");
    console.log(error);

    result.success = false;
    result.errorMessage = error.message;
  }
}

export { buildSourcerCitation, buildSourcerCitations, filterSourceIdsToSources, setUrlStart };
