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

/* 
  Note that this is a complex piece of code and is not currently tested by unit tests.

  Here are some test cases:

 		https://www.familysearch.org/tree/person/sources/L2Q9-YLC  (Has ancestry records)
		https://www.familysearch.org/tree/person/details/K2HC-86C  (Has records that can be merged)
		https://www.familysearch.org/tree/person/details/LJJH-F8B  (German record. Can’t merge marriage because last name different)
		https://www.familysearch.org/tree/person/sources/G7MJ-Y7W  (Has non FS source with notes)
		https://www.familysearch.org/tree/person/sources/L231-R8M  Has censuses that can be merged - also had date sorting issues
		https://www.familysearch.org/tree/person/sources/MQNQ-H1D  Had issue with birth place match on baptisms
		https://www.familysearch.org/tree/person/sources/KC6X-WRJ  Has 31 sources
		https://www.familysearch.org/tree/person/sources/L7LT-DG1  Caused empty ref - no FS sources
			  Because it has an FS link but it is to an image.
		https://www.familysearch.org/tree/person/sources/L2QN-6JJ  Merges marriages even though spouse surnames are different.
			  Perhaps it should not if the spouse name is being shown in narrative.
		https://www.familysearch.org/tree/person/sources/LHVG-L58  Has some Ancestry sources, one not formatted well
    https://www.familysearch.org/tree/person/sources/GDF5-G69  Has more Ancestry sources with formatting issues

*/

import { extractDataFromFetch } from "../core/fs_extract_data.mjs";
import { generalizeData } from "../core/fs_generalize_data.mjs";
import { buildCitation } from "../core/fs_build_citation.mjs";
import { buildHouseholdTable } from "../../../base/core/table_builder.mjs";
import { buildHouseholdTableString } from "/base/browser/popup/popup_citation.mjs";

import { displayMessage } from "/base/browser/popup/popup_menu_building.mjs";

import { doRequestsInParallel } from "/base/browser/popup/popup_parallel_requests.mjs";

import { fetchFsSourcesJson, fetchRecord } from "./fs_fetch.mjs";
import { buildSourcerCitations, buildFsPlainCitations } from "../core/fs_build_all_citations.mjs";

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

async function getSourcerCitation(source, type, options, updateStatusFunction) {
  let uri = source.uri;

  let fetchResult = { success: false };

  if (uri) {
    fetchResult = await fetchRecord(uri);
    let retryCount = 0;
    while (!fetchResult.success && fetchResult.allowRetry && retryCount < 3) {
      retryCount++;
      updateStatusFunction("retry " + retryCount);
      fetchResult = await fetchRecord(uri);
    }
  }

  //console.log("getSourcerCitation, fetchResult is:");
  //console.log(fetchResult);

  if (fetchResult.success) {
    source.dataObjects = fetchResult.dataObjects;

    let extractedData = extractDataFromFetch(undefined, source.dataObjects, "record", options);
    if (extractedData && extractedData.pageType) {
      source.extractedData = extractedData;

      let generalizedData = generalizeData({ extractedData: extractedData });
      if (generalizedData && generalizedData.hasValidData) {
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

async function getSourcerCitations(result, ed, gd, type, options) {
  if (result.sources.length == 0) {
    result.citationsString = "";
    result.citationsStringType = type;
    return;
  }

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

  // Unit test generation code
  /*
  if (true) {
    let testInput = {};
    testInput.sources = result.sources;
    for (let source of result.sources) {
      delete source.extractedData;
      delete source.generalizedData;
      delete source.citationObject;
    }
    result.citationsString = JSON.stringify(testInput, null, 2);
    result.citationCount = 1;
    return;
  }
  */

  buildSourcerCitations(result, type, options);
}

async function fsGetAllCitations(input) {
  let ed = input.extractedData;
  let gd = input.generalizedData;
  let options = input.options;

  let sourcesObj = await fetchFsSourcesJson(ed.sourceIds);
  let retryCount = 0;
  while (retryCount < 3 && !sourcesObj.success && sourcesObj.allowRetry) {
    retryCount++;
    displayMessage("Getting sources, retry " + retryCount + " ...");
    sourcesObj = await fetchFsSourcesJson(ed.sourceIds);
  }

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
      addField("id");
      addField("notes");

      if (source.uri && source.uri.uri) {
        sourceObj.uri = source.uri.uri;

        if (source.uriUpdatedOn) {
          let date = new Date(source.uriUpdatedOn);
          const options = { day: "numeric", month: "long", year: "numeric" };
          sourceObj.uriUpdatedDate = date.toLocaleDateString("en-GB", options);
        }
      }

      if (options.addMerge_fsAllCitations_excludeNonFsSources) {
        // could check whether uri is of right form instead
        if (source.sourceType != "FSREADONLY") {
          continue;
        }
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

    let citationType = options.addMerge_fsAllCitations_citationType;

    switch (citationType) {
      case "fsPlainInline":
        buildFsPlainCitations(result, ed, "inline", options);
        break;
      case "fsPlainSource":
        buildFsPlainCitations(result, ed, "source", options);
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
