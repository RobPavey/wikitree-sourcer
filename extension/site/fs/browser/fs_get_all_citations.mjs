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

import { extractDataFromFetch } from "../core/fs_extract_data.mjs";
import { generalizeData } from "../core/fs_generalize_data.mjs";
import { buildCitation } from "../core/fs_build_citation.mjs";
import { buildHouseholdTable } from "/base/core/table_builder.mjs";
import { WTS_Date } from "../../../base/core/wts_date.mjs";
import { buildHouseholdTableString } from "/base/browser/popup/popup_citation.mjs";

import { doRequestsInParallel } from "/base/browser/popup/popup_parallel_requests.mjs";

import { fetchFsSourcesJson, fetchRecord } from "./fs_fetch.mjs";

function sortSourcesUsingFsSortKeys(result) {
  function compareSortKeys(a, b) {
    if (a.sortKey) {
      if (b.sortKey) {
        if (a.sortKey < b.sortKey) {
          return -1;
        } else if (a.sortKey > b.sortKey) {
          return 1;
        }
        return 0;
      } else {
        return -1;
      }
    } else if (b.sortKey) {
      return 1;
    }

    return 0;
  }

  // sort the sources
  result.sources.sort(compareSortKeys);
  //console.log("getFsPlainInlineCitations: sorted sources:");
  //console.log(result.sources);
}

function getFsPlainCitations(result, ed, type, options) {
  sortSourcesUsingFsSortKeys(result);

  let citationsString = "";

  for (let source of result.sources) {
    if (type == "inline") {
      if (source.citation) {
        if (citationsString) {
          citationsString += "\n";
        }
        citationsString += "<ref>";
        if (options.citation_general_addNewlinesWithinRefs) {
          citationsString += "\n";
        }
        citationsString += source.citation.trim();
        if (options.citation_general_addNewlinesWithinRefs) {
          citationsString += "\n";
        }
        citationsString += "</ref>";
        citationsString += "\n";
      }
    } else {
      if (source.citation) {
        citationsString += "* ";
        citationsString += source.citation.trim();
        citationsString += "\n";
      }
    }
  }

  result.citationsString = citationsString;
  result.citationsStringType = type;
}

function sortSourcesUsingFsSortKeysAndFetchedRecords(result) {
  function compareFunction(a, b) {
    if (a.generalizeData) {
      if (b.generalizeData) {
        let eventDataA = a.generalizeData.inferEventDate();
        let eventDataB = b.generalizeData.inferEventDate();
        if (eventDataA && eventDataB) {
          return WTS_Date.compareDateStrings(eventDataA, eventDataB);
        }
      }
    }

    if (a.sortKey && b.sortKey) {
      if (a.sortKey < b.sortKey) {
        return -1;
      } else if (a.sortKey > b.sortKey) {
        return 1;
      }
      return 0;
    }

    if (a.sortYear && b.sortYear) {
      if (a.sortYear < b.sortYear) {
        return -1;
      } else if (a.sortYear > b.sortYear) {
        return 1;
      }
      return 0;
    }

    if (a.sortYear) {
      return -1;
    } else if (b.sortYear) {
      return 1;
    }

    return 0;
  }

  // sort the sources
  result.sources.sort(compareFunction);
  //console.log("getFsPlainInlineCitations: sorted sources:");
  //console.log(result.sources);
}

async function getSourcerCitation(source, type, options, updateStatusFunction) {
  let uri = source.uri.uri;

  let fetchResult = await fetchRecord(uri);
  let retryCount = 0;
  while (!fetchResult.success && fetchResult.allowRetry && retryCount < 3) {
    retryCount++;
    updateStatusFunction("retry " + retryCount);
    fetchResult = await fetchRecord(uri);
  }

  if (fetchResult.success) {
    source.dataObjects = fetchResult.dataObjects;

    let extractedData = extractDataFromFetch(undefined, source.dataObjects, "record", options);
    if (extractedData) {
      source.extractedData = extractedData;

      let generalizedData = generalizeData({ extractedData: extractedData });
      if (generalizedData) {
        source.generalizedData = generalizedData;

        let householdTableString = buildHouseholdTableString(extractedData, generalizedData, type, buildHouseholdTable);

        const input = {
          extractedData: extractedData,
          generalizedData: generalizedData,
          runDate: new Date(),
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
  } else {
    // we don't have an FS fetch object, see what we can do my parsing FS citation string
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
        let joinIndex = title.search(/\s+in\s+the\s+/);
        if (joinIndex != -1) {
          source.prefName = title.substring(0, joinIndex);
        }
      }
    }
  }
}

async function getSourcerCitations(result, ed, gd, type, options) {
  let requests = [];
  for (let source of result.sources) {
    let request = {
      name: source.id,
      input: source,
    };
    requests.push(request);
  }

  async function requestFunction(input, updateStatusFunction) {
    updateStatusFunction("fetching...");
    let newResponse = { success: true };
    await getSourcerCitation(input, type, options, updateStatusFunction);
    return newResponse;
  }

  let requestsResult = await doRequestsInParallel(requests, requestFunction);

  result.failureCount = requestsResult.failureCount;

  sortSourcesUsingFsSortKeysAndFetchedRecords(result);

  let citationsString = "";

  for (let source of result.sources) {
    if (source.citationObject) {
      if (citationsString && type != "source") {
        citationsString += "\n";
      }
      citationsString += source.citationObject.citation;
      citationsString += "\n";
    } else if (source.citation) {
      if (citationsString && type != "source") {
        citationsString += "\n";
      }
      if (type == "narrative") {
        if (source.prefName) {
          citationsString += source.prefName;
        } else {
          citationsString += "This person";
        }
        citationsString += " was in a record";
        if (source.sortYear) {
          citationsString += " in " + source.sortYear;
        }
        citationsString += ".";
      }

      if (type != "source") {
        citationsString += "<ref>";
        if (options.citation_general_addNewlinesWithinRefs) {
          citationsString += "\n";
        }
        citationsString += source.citation.trim();
        if (options.citation_general_addNewlinesWithinRefs) {
          citationsString += "\n";
        }
        citationsString += "</ref>";
      } else {
        citationsString += "* " + source.citation.trim();
      }
      citationsString += "\n";
    }
  }

  result.citationsString = citationsString;
  result.citationsStringType = type;
}

async function fsGetAllCitations(input, callbackFunction) {
  let ed = input.extractedData;
  let gd = input.generalizedData;
  let options = input.options;

  let sourcesObj = await fetchFsSourcesJson(ed.sourceIds);

  let result = { success: false };

  if (sourcesObj.success) {
    let sources = sourcesObj.dataObj.sources;

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
      addField("uri");
      addField("id");

      if (source.event) {
        if (source.event.sortKey) {
          sourceObj.sortKey = source.event.sortKey;
        }
        if (source.event.sortYear) {
          sourceObj.sortYear = source.event.sortYear;
        }
      }

      result.sources.push(sourceObj);
    }

    let citationType = options.addMerge_fsAllCitations_citationType;

    switch (citationType) {
      case "fsPlainInline":
        getFsPlainCitations(result, ed, "inline", options);
        break;
      case "fsPlainSource":
        getFsPlainCitations(result, ed, "source", options);
        break;
      case "narrative":
      case "inline":
      case "source":
        await getSourcerCitations(result, ed, gd, citationType, options);
        break;
    }

    result.success = true;
  }

  return result;
}

export { fsGetAllCitations };
