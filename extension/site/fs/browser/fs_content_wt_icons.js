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

// Example FamilySearch pages to test this on:/
//
// Person details:
//
// https://www.familysearch.org/en/tree/person/details/G443-GML
//  Ettiene Smit
//
// https://www.familysearch.org/en/tree/person/details/L62P-39Y
//  Casimio Lopez
//
// Record:
//
// https://www.familysearch.org/ark:/61903/1:1:MWXN-JL5?lang=en
//  US 1880 census with person, parents and siblings all having references
//  No Similar Records
//
// https://www.familysearch.org/ark:/61903/1:1:MH4N-35W?lang=en
//    Not referenced from any WT profiles but is attached to a profile that is
//  Has lots of Similar Records
//
// 	https://www.familysearch.org/ark:/61903/1:1:XLX7-TL7?lang=en
//    Marriage for Casimiro Lopez, is referenced from WT
//
// Image:
//
// https://www.familysearch.org/ark:/61903/3:1:3Q9M-CSV8-W944-B?i=356&lang=en&cc=1478678
//    Image page with 23 WT profiles linking to it
//    Note the unusual 4 part id
//
// https://familysearch.org/ark:/61903/3:1:3Q9M-CS2Q-M6MV?cc=2821281&lang=en&view=index&groupId=&personArk=%2Fark%3A%2F61903%2F1%3A1%3A6ZCM-FKTL&action=view
//    Referenced from 2 WT profiles
//    Has no film mumber in the nav bar
//
// https://www.familysearch.org/ark:/61903/3:1:939N-8GSP-KW?lang=en&i=160&cc=1804002
//  Marriage
//  Has image index at bottom with a linked record
//
// https://www.familysearch.org/ark:/61903/3:1:33SQ-GR6Z-4DW?view=index&personArk=%2Fark%3A%2F61903%2F1%3A1%3AMH4N-35W&action=view&cc=1488411&lang=en&groupId=
//   1920 census - not linked to a WT profile but is attached to an FS person that is
//
// Search results:
//
// https://www.familysearch.org/en/search/record/results?count=20&&q.givenName=Casimiro%20Molina&q.surname=Lopez&q.birthLikePlace=Santa%20Fe%2C%20New%20Mexico%2C%20United%20States&q.birthLikeDate.from=1876&q.birthLikeDate.to=1880&q.deathLikePlace=Santa%20Barbara%2C%20Santa%20Barbara%2C%20California%2C%20United%20States&q.deathLikeDate.from=1938&q.deathLikeDate.to=1942&q.marriageLikePlace=Santa%20Barbara%2C%20California%2C%20United%20States&q.marriageLikeDate.from=1908&q.marriageLikeDate.to=1916&q.spouseGivenName=Victoria&q.spouseSurname=Cordero&q.recordCountry=United%20States
//    1st and 5th are referenced from WT profiles
//
// Landscape pedigree:
//  https://www.familysearch.org/en/tree/pedigree/landscape/LH61-K46

logDebug("fs_content_wt_icons.js loaded");

// Get the ID of the current extension instance
const currentExtensionId = chrome.runtime?.id;

// Check what ID (if any) was stored by a previous injection
const runningExtensionId = window.sourcerFsContentWtIconsId;

// Wrapper to put all icon injection in a scope and to prevent redefinition
// if content script loaded twice
if (runningExtensionId === currentExtensionId) {
  // This is a redundant injection of the SAME version.
  // We can safely exit.
  logDebug("fs_content_wt_icons.js: Same version already running.");
} else {
  // 1. This is either the first run OR a new version being injected.
  // 2. Kill the old observer if it exists to prevent "ghost" icons.
  if (window.sourcerWtMutationObserver) {
    window.sourcerWtMutationObserver.disconnect();
    logDebug("WikiTree Sourcer: Cleaned up old observer.");
  }

  // 3. Mark this window with the NEW ID so future redundant injections stop here.
  window.sourcerFsContentWtIconsId = currentExtensionId;

  logDebug("fs_content_wt_icons.js was not already loaded");

  // A person url should look like one of these:
  // https://www.familysearch.org/en/tree/person/details/L62P-39Y
  // https://www.familysearch.org/en/tree/person/sources/L62P-39Y
  // But an href can be:
  // /en/tree/person/L62P-39Y
  const personRegex = /^.*\/tree\/person\/(?:[^\/]+\/)?([A-Z0-9\-]+).*$/;
  const personDetailsRegex = /^.*\/tree\/person\/(?:details\/)?([A-Z0-9\-]+).*$/;
  const personSourcesRegex = /^.*\/tree\/person\/sources\/([A-Z0-9\-]+).*$/;
  const personAboutRegex = /^.*\/tree\/person\/about\/([A-Z0-9\-]+).*$/;
  // A record URL  should look like one of these:
  // https://www.familysearch.org/ark:/61903/1:1:XLX7-TL7?lang=en
  const recordRegex = /^\/ark\:\/61903\/1\:\d\:([A-Z0-9]{4,5}\-[A-Z0-9]{3,4}).*$/;
  // An image URL  should look like one of these:
  // https://familysearch.org/ark:/61903/3:1:939N-8GSP-KW?lang=en&view=index&groupId=M9C5-PB5
  // https://www.familysearch.org/ark:/61903/3:1:3Q9M-CS7M-83GB-Y?lang=en&i=540
  const imageRegex = /^\/ark\:\/\d+\/\d\:\d\:([A-Z0-9]{4,5}\-[A-Z0-9]{3,4}\-[A-Z0-9]{2,4}(?:\-[A-Z0-9]{1,4})?).*$/;
  // A search results URL URL  should look like one of these:
  // https://www.familysearch.org/en/search/record/results?count=20&treeref=G443-GML&q.givenName=Etienne&q.surname=Smit&q.birthLikeDate.from=1926&q.birthLikeDate.to=1930&q.deathLikeDate.from=2005&q.deathLikeDate.to=2009&q.marriageLikePlace=Paarl%2C%20Cape%20Province%2C%20South%20Africa&q.marriageLikeDate.from=1949&q.marriageLikeDate.to=1957&q.spouseGivenName=Anna%20Jacoba&q.spouseSurname=de%20Villiers&q.marriageLikePlace.1=Wynberg%2C%20Cape%20Province%2C%20South%20Africa&q.marriageLikeDate.from.1=1959&q.marriageLikeDate.to.1=1967&q.spouseGivenName.1=Helena&q.spouseSurname.1=Theron&q.recordCountry=South%20Africa
  const searchRegex = /^\/(?:[^\/]+\/)?search\/.*$/;
  // A landscape tree should look like this:
  // https://www.familysearch.org/en/tree/pedigree/landscape/L62P-39Y
  const pedigreeLandscapeRegex = /^\/(?:[^\/]+\/)?tree\/pedigree\/landscape\/.*$/;
  // A portrait tree should look like this:
  // https://www.familysearch.org/en/tree/pedigree/portrait/G443-GML
  const pedigreePortraitRegex = /^\/(?:[^\/]+\/)?tree\/pedigree\/portrait\/.*$/;

  async function fetchFsSimilarRecordsJson(recordId, sessionId) {
    logDebug("fetchFsSimilarRecordsJson, sessionId is: " + sessionId);

    if (!recordId) {
      return { success: false };
    }

    if (!sessionId) {
      sessionId = "";
      if (document) {
        let cookies = document.cookie;
        if (cookies) {
          let fssessionid = document.cookie
            .split("; ")
            .find((row) => row.startsWith("fssessionid="))
            ?.split("=")[1];
          if (fssessionid) {
            sessionId = fssessionid;
            logDebug("fetchFsSimilarRecordsJson, sessionId from cookies is: " + sessionId);
          }
        }
      }
    }

    // example sent by FS
    // https://www.familysearch.org/platform/records/personas/MH4N-35W/matches?collection=records&includeSummary=true&count=10
    let fetchUrl = "https://www.familysearch.org/platform/records/personas/";
    fetchUrl += recordId;
    fetchUrl += "/matches?collection=records&includeSummary=true&count=10";

    logDebug("fetchUrl is", fetchUrl);

    let fetchOptionsHeaders = {
      accept: "application/x-gedcomx-v1+json, application/json",
      "accept-language": "en",
      from: "fsSearch.record.getGedcomX@familysearch.org",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      authorization: "Bearer " + sessionId,
    };

    let fetchOptions = {
      headers: fetchOptionsHeaders,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    };

    try {
      let response = await fetch(fetchUrl, fetchOptions).catch((err) => {
        console.log("Fetch threw an exception, message is: " + err.message);
        console.log(err);
        return { success: false };
      });

      logDebug("response is");
      logDebug(response);

      // On Firefox it may return zero any time you use "no-cors"
      if (response.status !== 200) {
        console.log("fetchFsSimilarRecordsJson: Looks like there was a problem. Status Code: " + response.status);
        return {
          success: false,
          errorCondition: "FetchError",
          status: response.status,
          allowRetry: true,
        };
      }

      // Examine the text in the response
      let data = await response.text();

      //logDebug("data is:");
      //logDebug(data);

      if (data.startsWith("{")) {
        const jsonData = data;
        const dataObj = JSON.parse(jsonData);

        logDebug("dataObj is:");
        logDebug(dataObj);

        if (dataObj) {
          return { success: true, dataObj: dataObj };
        }
      } else {
        console.log("response does not look like JSON");
      }
    } catch (error) {
      console.log("fetch failed, error is:");
      console.log(error);
      return { success: false };
    }

    return { success: false };
  }

  async function fetchSimilarRecords(locationBatch) {
    let pageFsId = pageMods.id;
    if (!pageFsId) {
      return;
    }

    logDebug("fetchSimilarRecords, pageFsId", pageFsId);
    logDebug("fetchSimilarRecords, locationBatch", locationBatch);

    let result = await fetchFsSimilarRecordsJson(pageFsId);
    if (result.success) {
      logDebug("fetchSimilarRecords, dataObj", result.dataObj);
    } else {
      logDebug("fetchSimilarRecords, bad response from fetchFsSimilarRecordsJson", result);
      return;
    }

    let similarRecordLocations = [];

    // go through the locations and set the fsIds based on the results
    for (let location of locationBatch.locations) {
      if (location.locationType.locationTypeName == "similarRecord") {
        similarRecordLocations.push(location);
      }
    }
    logDebug("fetchSimilarRecords, similarRecordLocations: ", similarRecordLocations);

    let entries = result.dataObj.entries;
    logDebug("fetchSimilarRecords, entries: ", entries);

    if (entries.length == similarRecordLocations.length) {
      logDebug("fetchSimilarRecords, lengths match");
      for (let i = 0; i < entries.length; i++) {
        let entry = entries[i];
        let location = similarRecordLocations[i];
        let closestDiv = location.matchedElement.closest("div");
        if (closestDiv) {
          let titleDiv = closestDiv.querySelector("div");
          if (titleDiv) {
            let locationTitle = titleDiv.textContent;
            logDebug("similar record entry title is :", entry.title);
            logDebug("similar record location title is :", locationTitle);
            if (entry.title == locationTitle) {
              let fsUrl = entry.id;
              let idData = pageMods.getIdDataFromUrl(fsUrl, location);
              if (idData) {
                let id = idData.id;
                location.id = id;
                location.idType = idData.idType;
                addLocationToPendingFsIds(locationBatch, id, location);
              }
            }
          }
        }
      }
    }
  }

  async function fetchFsSourceIdsForPersonJson(personId, sessionId) {
    //logDebug("fetchFsSourceIdForPrsonJson, sessionId is: " + sessionId);

    if (!sessionId) {
      sessionId = "";
    }

    if (!personId) {
      return { success: false };
    }

    // https://www.familysearch.org/service/tree/tf/person/L62P-39Y/entityref?version=2

    let fetchUrl = "https://www.familysearch.org/service/tree/tf/person/" + personId + "/entityref?version=2";

    logDebug("fetchUrl is", fetchUrl);

    let fetchOptionsHeaders = {
      accept: "application/x-gedcomx-v1+json, application/json",
      "accept-language": "en",
      from: "fsSearch.record.getGedcomX@familysearch.org",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      authorization: "Bearer " + sessionId,
    };

    let fetchOptions = {
      headers: fetchOptionsHeaders,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    };

    try {
      let response = await fetch(fetchUrl, fetchOptions).catch((err) => {
        console.log("Fetch threw an exception, message is: " + err.message);
        console.log(err);
        return { success: false };
      });

      logDebug("response is");
      logDebug(response);

      // On Firefox it may return zero any time you use "no-cors"
      if (response.status !== 200) {
        console.log("fetchFsSourcesJson: Looks like there was a problem. Status Code: " + response.status);
        return {
          success: false,
          errorCondition: "FetchError",
          status: response.status,
          allowRetry: true,
        };
      }

      // Examine the text in the response
      let data = await response.text();

      //logDebug("data is:");
      //logDebug(data);

      if (data.startsWith("{")) {
        const jsonData = data;
        const dataObj = JSON.parse(jsonData);

        logDebug("dataObj is:");
        logDebug(dataObj);

        if (dataObj) {
          return { success: true, dataObj: dataObj };
        }
      } else {
        console.log("response does not look like JSON");
      }
    } catch (error) {
      console.log("fetch failed, error is:");
      console.log(error);
      return { success: false };
    }

    return { success: false };
  }

  let personSourceIdsCache = {};

  async function getSourceIdsForPerson(personId) {
    logDebug("getSourceIdsForPerson, personSourceIdsCache", personSourceIdsCache);

    let cachedIds = personSourceIdsCache[personId];
    if (cachedIds) {
      return cachedIds;
    }

    let fetchResult = await fetchFsSourceIdsForPersonJson(personId);
    if (
      fetchResult.success &&
      fetchResult.dataObj &&
      fetchResult.dataObj.entityRefs &&
      fetchResult.dataObj.entityRefs.length
    ) {
      logDebug("getSourceIdsForPerson, dataObj", fetchResult.dataObj);
      let entityRefs = fetchResult.dataObj.entityRefs;

      let sourceIds = [];
      for (let entityRef of entityRefs) {
        let value = entityRef.value;

        if (value && value.type == "SOURCE") {
          let sourceId = value.uri;
          sourceIds.push(sourceId);
        }
      }

      personSourceIdsCache[personId] = sourceIds;
      return sourceIds;
    }

    return [];
  }

  async function fetchFsSourcesJson(sourceIdList, sessionId) {
    //logDebug("fetchFsSourcesJson, sessionId is: " + sessionId);

    if (!sessionId) {
      sessionId = "";
    }

    if (!sourceIdList || sourceIdList.length == 0) {
      return { success: false };
    }

    let fetchUrl = "https://www.familysearch.org/service/tree/links/sources/";

    let isFirstSource = true;
    for (let sourceId of sourceIdList) {
      if (isFirstSource) {
        isFirstSource = false;
      } else {
        fetchUrl += ",";
      }
      fetchUrl += sourceId;
    }

    fetchUrl += "?readExternalData=true";

    logDebug("fetchUrl is", fetchUrl);

    let fetchOptionsHeaders = {
      accept: "application/x-gedcomx-v1+json, application/json",
      "accept-language": "en",
      from: "fsSearch.record.getGedcomX@familysearch.org",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      authorization: "Bearer " + sessionId,
    };

    let fetchOptions = {
      headers: fetchOptionsHeaders,
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    };

    try {
      let response = await fetch(fetchUrl, fetchOptions).catch((err) => {
        console.log("Fetch threw an exception, message is: " + err.message);
        console.log(err);
        return { success: false };
      });

      logDebug("response is");
      logDebug(response);

      // On Firefox it may return zero any time you use "no-cors"
      if (response.status !== 200) {
        console.log("fetchFsSourcesJson: Looks like there was a problem. Status Code: " + response.status);
        return {
          success: false,
          errorCondition: "FetchError",
          status: response.status,
          allowRetry: true,
        };
      }

      // Examine the text in the response
      let data = await response.text();

      //logDebug("data is:");
      //logDebug(data);

      if (data.startsWith("{")) {
        const jsonData = data;
        const dataObj = JSON.parse(jsonData);

        logDebug("dataObj is:");
        logDebug(dataObj);

        if (dataObj) {
          return { success: true, dataObj: dataObj };
        }
      } else {
        console.log("response does not look like JSON");
      }
    } catch (error) {
      console.log("fetch failed, error is:");
      console.log(error);
      return { success: false };
    }

    return { success: false };
  }

  let sourceInfoCache = {};

  async function getSourceInfoForSourceIds(sourceIdList) {
    logDebug("getSourceInfoForSourceIds, sourceInfoCache", sourceInfoCache);

    let trimmedSourceIdList = [];
    let result = {};

    for (let sourceId of sourceIdList) {
      let cachedSource = sourceInfoCache[sourceId];
      if (cachedSource) {
        result[sourceId] = cachedSource;
      } else {
        trimmedSourceIdList.push(sourceId);
      }
    }

    if (trimmedSourceIdList.length == 0) {
      return result;
    }

    const REQUEST_LIMIT = 30;
    const limitRequestSize = pageMods.pageProfile.pageType == "personSources" ? false : true;

    while (trimmedSourceIdList.length > 0) {
      let requestSourceIdList = trimmedSourceIdList;
      if (trimmedSourceIdList.length > REQUEST_LIMIT && limitRequestSize) {
        requestSourceIdList = trimmedSourceIdList.splice(0, REQUEST_LIMIT);
      } else {
        trimmedSourceIdList = [];
      }

      let fetchResult = await fetchFsSourcesJson(requestSourceIdList);
      if (
        fetchResult.success &&
        fetchResult.dataObj &&
        fetchResult.dataObj.sources &&
        fetchResult.dataObj.sources.length
      ) {
        logDebug("getSourceInfoForSourceIds, dataObj", fetchResult.dataObj);
        let sources = fetchResult.dataObj.sources;

        for (let source of sources) {
          let sourceId = source.id;

          let sourceInfo = {};
          if (source.uri && source.uri.uri) {
            sourceInfo.uri = source.uri.uri;
          }
          if (source.title) {
            sourceInfo.title = source.title;
          }
          if (source.sourceType) {
            sourceInfo.sourceType = source.sourceType;
          }

          result[sourceId] = sourceInfo;
          sourceInfoCache[sourceId] = sourceInfo;
        }
      } else {
        logDebug("getSourceInfoForSourceIds, bad response from fetchFsSourcesJson", result);
      }
    }

    return result;
  }

  function extractSourceIdFromElement(element) {
    // 1. Traverse up to the main source card wrapper
    // The wrapper has the ID directly. We can look for the div that contains the heading section.
    const sourceWrapper = element.closest("div[id]");

    if (sourceWrapper && sourceWrapper.id) {
      // Regex check to ensure it's a real FS ID and not a random UI ID
      const fsIdRegex = /^[A-Z0-9]{4}-[A-Z0-9]{3,4}$/;
      if (fsIdRegex.test(sourceWrapper.id)) {
        return sourceWrapper.id;
      }
    }
    return null;
  }

  async function fetchBackLinksFromSources(locationBatch) {
    // make a list of the sourceIds that we need
    let sourceIdList = [];

    // it is possible that we have the option for icons on source rows turned off
    // but we want to check for backlinks to WT.
    // Or the pageH1 can be in an earlier processing batch than the sourceRow locations
    logDebug("fetchBackLinksFromSources: pageProfile is ", pageMods.pageProfile);

    // go through all the locations and find persons who wan the sourceIds fetched
    for (let location of locationBatch.locations) {
      let locationType = location.locationType;
      if (locationType.fetchForBackLink) {
        let optionKey = locationType.fetchForBackLink.optionKey;
        if (!optionKey || pageMods.getOption(optionKey)) {
          if (location.id) {
            let idType = location.idType;
            if (idType == "person") {
              let personSourceIdList = await getSourceIdsForPerson(location.id);
              sourceIdList.push(...personSourceIdList);
              location.personSourceIdList = personSourceIdList;
            }
          }
        }
      }
    }

    logDebug("fetchBackLinksFromSources, sourceIdList", sourceIdList);

    let sourceInfos = await getSourceInfoForSourceIds(sourceIdList);

    logDebug("fetchBackLinksFromSources, sourceInfos", sourceInfos);

    function addBackLinkWikiIdToLocation(location, wikiId) {
      if (wikiId) {
        if (!location.backLinkWikiIds) {
          location.backLinkWikiIds = [];
        }
        if (!location.backLinkWikiIds.includes(wikiId)) {
          location.backLinkWikiIds.push(wikiId);
        }
      }
    }

    if (sourceInfos) {
      for (let location of locationBatch.locations) {
        if (location.personSourceIdList) {
          for (let sourceId of location.personSourceIdList) {
            let sourceInfo = sourceInfos[sourceId];
            if (sourceInfo && sourceInfo.sourceType == "DEFAULT") {
              if (sourceInfo.uri) {
                let regex = /^.*wikitree.com\/wiki\/([^\s]+\-\d+).*$/;
                if (regex.test(sourceInfo.uri)) {
                  let wikiId = sourceInfo.uri.replace(regex, "$1");
                  logDebug(`fetchBackLinksFromSources: found WT uri, sourceId is ${sourceId}, wikiId is ${wikiId}`);
                  addBackLinkWikiIdToLocation(location, wikiId);
                }
              } else if (sourceInfo.title) {
                let regex = /[^\s]+\-\d+/;
                let wikiId = sourceInfo.title.match(regex);
                logDebug(`fetchBackLinksFromSources: found WT title, sourceId is ${sourceId}, wikiId is ${wikiId}`);
                addBackLinkWikiIdToLocation(location, wikiId);
              }
            }
          }
        }
      }
    }
  }

  async function fetchFsIdsForSources(locationBatch) {
    // make a list of the sourceIds that we need
    let sourceIdList = [];
    for (let location of locationBatch.locations) {
      let locationTypeName = location.locationType.locationTypeName;
      if (locationTypeName == "sourceRow") {
        // get the source ID from the element
        let sourceId = extractSourceIdFromElement(location.matchedElement);
        if (sourceId) {
          sourceIdList.push(sourceId);
        }
      }
    }

    logDebug("fetchFsIdsForSources, sourceIdList", sourceIdList);

    let sourceInfos = await getSourceInfoForSourceIds(sourceIdList);

    logDebug("fetchFsIdsForSources, sourceInfos", sourceInfos);

    if (sourceInfos) {
      for (let location of locationBatch.locations) {
        let locationTypeName = location.locationType.locationTypeName;
        let sourceId = null;
        if (locationTypeName == "sourceRow") {
          // get the source ID from the element
          sourceId = extractSourceIdFromElement(location.matchedElement);

          if (sourceId) {
            let sourceInfo = sourceInfos[sourceId];
            if (sourceInfo) {
              if (sourceInfo.uri) {
                // non-FS sources can be mising a uri

                let idData = pageMods.getIdDataFromUrl(sourceInfo.uri, location);
                if (idData) {
                  let id = idData.id;
                  location.id = id;
                  location.idType = idData.idType;

                  addLocationToPendingFsIds(locationBatch, id, location);
                }
              }
            }
          }
        }
      }
    }
  }

  const pageProfiles = [
    {
      pageType: "personDetails",
      pageIdType: "person",
      matchRegex: personDetailsRegex,
      locationTypes: [
        {
          locationTypeName: "pageH1",
          selector: "h1 [data-testid='fullName']",
          iconAddRule: { type: "ellipsis" },
          useFsIdFromPageUrl: true,
          optionKey: "personShowWtIconH1",
          fetchForBackLink: {
            fetchFunction: fetchBackLinksFromSources,
            optionKey: "personShowWtIconH1BackLink",
          },
        },
        {
          locationTypeName: "familyMember",
          locationIdType: "person",
          selector: "[data-testid='nameLink'] [data-testid='fullName']",
          iconAddRule: { type: "ellipsis" },
          optionKey: "personDetailsShowWtIconFamily",
          fetchForBackLink: {
            fetchFunction: fetchBackLinksFromSources,
            optionKey: "personShowWtIconFamilyBackLink",
          },
        },
      ],
    },
    {
      pageType: "personSources",
      pageIdType: "person",
      matchRegex: personSourcesRegex,
      locationTypes: [
        {
          locationTypeName: "pageH1",
          selector: "[data-testid='fullName']",
          iconAddRule: { type: "ellipsis" },
          useFsIdFromPageUrl: true,
          optionKey: "personShowWtIconH1",
          fetchForBackLink: {
            fetchFunction: fetchBackLinksFromSources,
            optionKey: "personShowWtIconH1BackLink",
          },
        },
        {
          locationTypeName: "sourceRow",
          selector: "[data-testid='section-card-sources'] [data-testid='source-heading-section']",
          iconAddRule: { type: "makeFlexAddChild" },
          optionKey: "personSourcesShowWtIconOnSourceRow",
          needToFetchIds: true,
          iconPlaceElementRule: { type: "child", selector: "div[class^='cssSourceTitle']" },
          fetchForId: {
            fetchFunction: fetchFsIdsForSources,
          },
        },
      ],
    },
    {
      pageType: "personAbout",
      pageIdType: "person",
      matchRegex: personAboutRegex,
      locationTypes: [
        {
          locationTypeName: "pageH1",
          selector: "h1 [data-testid='fullName']",
          iconAddRule: { type: "ellipsis" },
          useFsIdFromPageUrl: true,
          optionKey: "personShowWtIconH1",
          fetchForBackLink: {
            fetchFunction: fetchBackLinksFromSources,
            optionKey: "personShowWtIconH1BackLink",
          },
        },
        {
          locationTypeName: "familyMember",
          selector: "[data-testid='nameLink'] [data-testid='fullName']",
          iconAddRule: { type: "ellipsis" },
          optionKey: "personAboutShowWtIconFamily",
          fetchForBackLink: {
            fetchFunction: fetchBackLinksFromSources,
            optionKey: "personShowWtIconFamilyBackLink",
          },
        },
      ],
    },
    {
      pageType: "record",
      pageIdType: "record",
      matchRegex: recordRegex,
      locationTypes: [
        {
          locationTypeName: "pageH1",
          selector: "main h1 > div",
          optionKey: "recordShowWtIconH1",
          useFsIdFromPageUrl: true,
        },
        {
          locationTypeName: "otherPeople",
          selector: "tr > th > span > a",
          iconPlaceElementRule: { type: "closest", selector: "span" },
          optionKey: "recordShowWtIconOtherPeople",
        },
        {
          locationTypeName: "thisRecordAttachedTo",
          selector: "div[class^='attachCss'] [data-testid='person'] [data-testid='fullName']",
          optionKey: "recordShowWtIconAttached",
          iconAddRule: { type: "ellipsis" },
          fetchForBackLink: {
            fetchFunction: fetchBackLinksFromSources,
            optionKey: "recordShowWtIconForPersonBackLink",
          },
        },
        {
          locationTypeName: "similarRecord",
          selector: "li div[role='button'] span > span",
          iconAddRule: { type: "addChild" },
          needToFetchIds: true,
          fetchForId: {
            fetchFunction: fetchSimilarRecords,
          },
          iconPlaceElementRule: { type: "parent" },
          optionKey: "recordShowWtIconSimilarRecords",
        },
        {
          locationTypeName: "similarRecordAttachedTo",
          selector: "li [data-testid='person'] [data-testid='fullName']",
          optionKey: "recordShowWtIconSimilarRecordsAttached",
          iconAddRule: { type: "ellipsis" },
          fetchForBackLink: {
            fetchFunction: fetchBackLinksFromSources,
            optionKey: "recordShowWtIconForPersonBackLink",
          },
        },
      ],
    },
    {
      pageType: "image",
      pageIdType: "image",
      matchRegex: imageRegex,
      locationTypes: [
        {
          locationTypeName: "imageSideBarRecord",
          selector: "aside h2 a > span",
          optionKey: "imageShowWtIconSidebar",
        },
        {
          locationTypeName: "imageSideBarAttached",
          selector: "aside [data-testid='person'] [data-testid='nameLink'] [data-testid='fullName']",
          optionKey: "imageShowWtIconSidebar",
          iconAddRule: { type: "ellipsis" },
          fetchForBackLink: {
            fetchFunction: fetchBackLinksFromSources,
            optionKey: "imageShowWtIconPeopleBackLink",
          },
        },
        {
          locationTypeName: "imageIndexRecord",
          selector: "aside tbody > tr > td > a[href^='/ark:/61903/'] > span",
          iconPlaceElementRule: {
            type: "closestThenChild",
            closestSelector: "td",
            childSelector: "a[href*='search/linker']",
          },
          iconAddRule: { type: "ellipsis" },
          optionKey: "imageShowWtIconSidebar",
        },
        {
          locationTypeName: "pageH1",
          selector: "main h1 > span, nav ol",
          iconPlaceElementRule: {
            type: "closestThenChild",
            closestSelector: "div",
            childSelector: "h1 span",
          },
          useFsIdFromPageUrl: true,
          optionKey: "imageShowWtIconH1",
        },
        {
          locationTypeName: "imageNavBar",
          selector: "nav > div > div[class^='rowCss']",
          iconAddRule: { type: "addFlexChild" },
          useFsIdFromPageUrl: true,
          optionKey: "imageShowWtIconH1",
        },
      ],
    },
    {
      pageType: "search",
      matchRegex: searchRegex,
      locationTypes: [
        {
          locationTypeName: "searchResult",
          selector: "td > h2 > strong > a",
          iconPlaceElementRule: { type: "closest", selector: "strong" },
          optionKey: "searchResultsShowWtIconResultRow",
        },
        {
          locationTypeName: "sidebarHeader",
          selector: "[data-testid='PersonSheetHeader'] [data-testid='nameLink'] [data-testid='fullName']",
          optionKey: "searchResultsShowWtIconSidebar",
        },
        {
          locationTypeName: "sidebarHeaderPreview",
          selector: "aside[data-testid='recordPreview-InfoSheet'] h1 > div",
          hrefRule: { type: "grandparentThenChild", childSelector: "div > a" },
          optionKey: "searchResultsShowWtIconSidebar",
        },
        {
          locationTypeName: "searchPersonInFsTree",
          selector:
            "aside [data-testid='nameSpan'] [data-testid='fullName'], aside [data-testid='person'] [data-testid='fullName']",
          optionKey: "searchResultsShowWtIconPersonInTree",
          iconAddRule: { type: "ellipsis" },
          fetchForBackLink: {
            fetchFunction: fetchBackLinksFromSources,
            optionKey: "searchResultsShowWtIconPersonInTreeBackLink",
          },
        },
      ],
    },
    {
      pageType: "pedigreeLandscape",
      matchRegex: pedigreeLandscapeRegex,
      locationTypes: [
        {
          locationTypeName: "pedigreePerson",
          selector: "li [data-testid='nameLink'] div > span",
          optionKey: "pedigreeLandscapeShowWtIcon",
          iconAddRule: { type: "ellipsis" },
          fetchForBackLink: {
            fetchFunction: fetchBackLinksFromSources,
            optionKey: "pedigreeLandscapeShowWtIconPeopleBackLink",
          },
        },
        {
          locationTypeName: "sidebarHeader",
          selector: "[data-testid='PersonSheetHeader'] [data-testid='nameLink'] [data-testid='fullName']",
          optionKey: "pedigreeLandscapeShowWtIconSidebar",
          iconAddRule: { type: "ellipsis" },
          fetchForBackLink: {
            fetchFunction: fetchBackLinksFromSources,
            optionKey: "pedigreeLandscapeShowWtIconPeopleBackLink",
          },
        },
      ],
    },
    {
      pageType: "pedigreePortrait",
      matchRegex: pedigreePortraitRegex,
      locationTypes: [
        {
          locationTypeName: "pedigreePerson",
          selector:
            "[data-testid='pedigree'] [data-testid='person'] [data-testid='nameLink'] [data-testid='namePart2']",
          optionKey: "pedigreePortraitShowWtIcon",
          iconAddRule: { type: "ellipsis" },
          fetchForBackLink: {
            fetchFunction: fetchBackLinksFromSources,
            optionKey: "pedigreePortraitShowWtIconPeopleBackLink",
          },
        },
        {
          locationTypeName: "sidebarHeader",
          selector: "aside [data-testid='PersonSheetHeader'] [data-testid='nameLink'] [data-testid='fullName']",
          optionKey: "pedigreePortraitShowWtIconSidebar",
          iconAddRule: { type: "ellipsis" },
          fetchForBackLink: {
            fetchFunction: fetchBackLinksFromSources,
            optionKey: "pedigreePortraitShowWtIconPeopleBackLink",
          },
        },
      ],
    },
  ];

  function wtPlusApiCall(url) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "doWtPlusApiCall",
          url: url,
        },
        (response) => {
          if (response && response.success) {
            resolve(JSON.parse(response.rawData));
          } else {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else if (response.error) {
              reject(response.error);
            } else {
              reject("No response");
            }
          }
        }
      );
    });
  }

  function wtPlusApiGetProfilesUsingFsId(idString) {
    let url = `https://plus.wikitree.com/function/wtFamilySearch/Sourcer.json?query=${idString}`;
    return wtPlusApiCall(url);
  }

  function getElementToAddIconTo(location) {
    let element = location.matchedElement;

    let locationType = location.locationType;

    if (locationType.iconPlaceElementRule) {
      let rule = locationType.iconPlaceElementRule;
      if (rule.type == "same") {
        return element;
      } else if (rule.type == "parent") {
        return element.parentElement;
      } else if (rule.type == "closest") {
        let closestElement = element.closest(rule.selector);
        if (closestElement) {
          return closestElement;
        }
      } else if (rule.type == "child") {
        let childElement = element.querySelector(rule.selector);
        if (childElement) {
          return childElement;
        }
      } else if (rule.type == "closestThenChild") {
        let closestElement = element.closest(rule.closestSelector);
        if (closestElement) {
          let childElement = closestElement.querySelector(rule.childSelector);
          if (childElement) {
            return childElement;
          }
        }
      }

      console.warn("locationType has iconPlaceElementRule but it failed", location);
    } else {
      return element;
    }
  }

  function addWikiTreeIcon(location, wikiIds) {
    pageMods.removeProcessingIcon(location);

    logDebug("addWikiTreeIcon", location, wikiIds);

    let backLinkWikiIds = location.backLinkWikiIds;

    if (!wikiIds) {
      wikiIds = [];
    }
    if (!backLinkWikiIds) {
      backLinkWikiIds = [];
    }

    if (wikiIds.length == 0 && backLinkWikiIds.length == 0) {
      return;
    }

    let svgIcon = null;
    let titleText = "FamilySearch " + location.idType + " " + location.id + " is ";
    let clipboardText = "";
    let linkUrl = "";

    if (wikiIds.length > 1) {
      svgIcon = pageMods.getIcon("svgMultipleRefsFromWt");
      titleText += `referenced from ${wikiIds.length} WikiTree profiles`;

      for (let wikiId of wikiIds) {
        if (clipboardText) {
          clipboardText += ",";
        }
        clipboardText += wikiId;
      }

      let id = location.id;
      if (id) {
        linkUrl = "https://plus.wikitree.com/default.htm?report=srch1&Query=";
        if (location.idType == "image") {
          linkUrl += "FamilySearchImage=";
        } else {
          linkUrl += "FamilySearch=";
        }
        linkUrl += id;
        linkUrl += "&render=1";
      }
    } else {
      svgIcon = pageMods.getIcon("svgSingleRefFromWt");
      titleText += `referenced from WikiTree profile: ${wikiIds[0]}`;
      clipboardText = wikiIds[0];
      linkUrl = "https://www.wikitree.com/wiki/" + wikiIds[0];
    }

    if (backLinkWikiIds.length == 1) {
      if (wikiIds.length == 1) {
        titleText += ` and this ${location.idType} also uses a source to reference WikiTree profile: ${backLinkWikiIds[0]}`;
        if (wikiIds[0] == backLinkWikiIds[0]) {
          svgIcon = pageMods.getIcon("svgRefMutual");
        } else {
          svgIcon = pageMods.getIcon("svgRefWtConflict");
        }
      } else if (wikiIds.length == 0) {
        svgIcon = pageMods.getIcon("svgRefToWt");
        titleText = `FamilySearch ${location.idType} ${location.id} uses a source to reference WikiTree profile: ${backLinkWikiIds[0]}`;
        linkUrl = "https://www.wikitree.com/wiki/" + backLinkWikiIds[0];
      } else {
        // there are multiple WT profiles referencing this memorial which in itself is an error
        // and we also reference a WT profile
        svgIcon = pageMods.getIcon("svgRefWtConflict");
        titleText += ` and this ${location.idType} also uses a source to reference WikiTree profile: ${backLinkWikiIds[0]}`;
      }
    } else if (backLinkWikiIds.length > 1) {
      // this profile references multiple WT profiles.
      if (wikiIds.length > 0) {
        svgIcon = pageMods.getIcon("svgRefWtConflict");
        titleText += ` and this memorial also uses sources to reference multiple WikiTree profiles`;
      } else {
        svgIcon = pageMods.getIcon("svgRefWtConflict");
        titleText = `FamilySearch ${location.idType} ${location.id} uses sources to reference multiple WikiTree profiles`;
      }
    }

    const anchorElement = pageMods.createAnchorWithIconElement(svgIcon, titleText, clipboardText, linkUrl);

    pageMods.addIconAtLocation(location, anchorElement);
  }

  let cachedFsIdToWtIdsMap = new Map();

  let pendingLocationsBatch = {};
  let debounceTimer = null;

  function addLocationToPendingFsIds(locationBatch, id, location) {
    if (!locationBatch.pendingFsIds.has(id)) {
      locationBatch.pendingFsIds.set(id, []);
    }
    locationBatch.pendingFsIds.get(id).push(location);
  }

  function addLocationToPendingBatch(location) {
    if (!pendingLocationsBatch.locations) {
      pendingLocationsBatch.locations = [];
    }
    pendingLocationsBatch.locations.push(location);

    if (!pendingLocationsBatch.pendingFsIds) {
      pendingLocationsBatch.pendingFsIds = new Map();
    }

    let locationType = location.locationType;

    const id = location.id;
    if (id) {
      addLocationToPendingFsIds(pendingLocationsBatch, id, location);
    } else {
      if (locationType.needToFetchIds) {
        let fetchForId = locationType.fetchForId;
        let fetchFunction = fetchForId.fetchFunction;
        if (!pendingLocationsBatch.fetchFunctionsForFsIds) {
          pendingLocationsBatch.fetchFunctionsForFsIds = [];
        }
        if (!pendingLocationsBatch.fetchFunctionsForFsIds.includes(fetchFunction)) {
          pendingLocationsBatch.fetchFunctionsForFsIds.push(fetchFunction);
        }
      }
    }

    // if there are any fetches required to check for back links add them to a list
    if (locationType.fetchForBackLink) {
      let fetchForBackLink = locationType.fetchForBackLink;
      let fetchFunction = fetchForBackLink.fetchFunction;
      if (!pendingLocationsBatch.fetchFunctionsForBackLinks) {
        pendingLocationsBatch.fetchFunctionsForBackLinks = [];
      }
      if (!pendingLocationsBatch.fetchFunctionsForBackLinks.includes(fetchFunction)) {
        pendingLocationsBatch.fetchFunctionsForBackLinks.push(fetchFunction);
      }
    }
  }

  async function getWikiIdsForBatch(currentBatch) {
    logDebug("getWikiIdsForPendingBatch, currentBatch is", currentBatch);

    // we cache all the fsIds that we have queried about

    let pendingFsIds = currentBatch.pendingFsIds;
    if (pendingFsIds) {
      logDebug(`getWikiIdsForBatch, pendingFsIds size is ${pendingFsIds.size}`);
    } else {
      console.log(`getWikiIdsForBatch, pendingFsIds undefined`);
      return;
    }

    const fsIdsToCheck = Array.from(pendingFsIds.keys());
    let fsIdsToQuery = [];

    logDebug("getWikiIdsForPendingBatch, fsIdsToCheck is", fsIdsToCheck);

    for (let id of fsIdsToCheck) {
      if (!cachedFsIdToWtIdsMap.has(id)) {
        fsIdsToQuery.push(id);
      }
    }
    logDebug("getWikiIdsForPendingBatch, fsIdsToQuery is", fsIdsToQuery);

    const fsIdsString = fsIdsToQuery.join(",");

    logDebug("getWikiIdsForPendingBatch, fsIdsString is", fsIdsString);

    try {
      const response = await wtPlusApiGetProfilesUsingFsId(fsIdsString);
      logDebug("getWikiIdsForPendingBatch, response is: ", response);
      if (response.response?.profiles) {
        function addWikiIdToMap(fsIdList, wikiId) {
          for (let id of fsIdList) {
            if (!cachedFsIdToWtIdsMap.has(id)) {
              cachedFsIdToWtIdsMap.set(id, []);
            }
            let wikiIdsForFsId = cachedFsIdToWtIdsMap.get(id);
            if (!wikiIdsForFsId.includes(wikiId)) {
              wikiIdsForFsId.push(wikiId);
            }
          }
        }

        // record the profiles that reference the elements id for the currentBatch
        response.response.profiles.forEach((profile) => {
          addWikiIdToMap(profile.persons, profile.wikitreeID);
          addWikiIdToMap(profile.records, profile.wikitreeID);
          addWikiIdToMap(profile.recordImages, profile.wikitreeID);
        });
      }
    } catch (error) {
      console.error("WT+ API Batch fetch failed", error);
      logDebug("fsIdsString is", fsIdsString);
    }
  }

  async function processPendingLocations() {
    // Check if the extension is still "alive"
    if (!chrome.runtime?.id) {
      console.log("WikiTree Sourcer: Context invalidated, stopping batch.");
      return;
    }

    // Clear the pendingLocationsBatch immediately so new mutations start a fresh batch
    const currentBatch = pendingLocationsBatch;
    pendingLocationsBatch = {};

    // Filter out locations where the element has been detached from the DOM
    // This happens if FamilySearch/React re-rendered the area while we were waiting.
    currentBatch.locations = currentBatch.locations.filter((location) => {
      const isConnected = location.matchedElement && location.matchedElement.isConnected;

      if (!isConnected) {
        logDebug("Pruning disconnected location from batch:", location);
      }
      return isConnected;
    });

    if (currentBatch.fetchFunctionsForFsIds) {
      for (let fetchFunction of currentBatch.fetchFunctionsForFsIds) {
        await fetchFunction(currentBatch);
      }
    }

    if (currentBatch.fetchFunctionsForBackLinks) {
      for (let fetchFunction of currentBatch.fetchFunctionsForBackLinks) {
        await fetchFunction(currentBatch);
      }
    }

    // Use WT+ API to get the WikiTree IDs that use these fsIds
    await getWikiIdsForBatch(currentBatch);

    logDebug("cachedFsIdToWtIdsMap is:", cachedFsIdToWtIdsMap);

    // Go through the locations and set the WikiIds
    if (currentBatch.locations) {
      let locations = currentBatch.locations;
      for (let location of locations) {
        if (location.id) {
          let wikiIds = cachedFsIdToWtIdsMap.get(location.id);
          addWikiTreeIcon(location, wikiIds);
        } else {
          pageMods.removeProcessingIcon(location);
        }
      }
    }
  }

  function extractFsIdFromLocation(location) {
    logDebug("extractFsIdFromLocation, location is:", location);

    if (location.locationType.useFsIdFromPageUrl) {
      logDebug("extractFsIdFromLocation, using id from location");
      let idData = pageMods.getIdDataFromUrl(document.URL);
      if (idData) {
        return idData;
      }
      return "";
    }

    let element = location.matchedElement;
    let hrefRule = location.locationType.hrefRule;

    let hrefElement = undefined;

    if (hrefRule) {
      if (hrefRule.type == "grandparentThenChild") {
        let parent = element.parentElement;
        let grandparent = parent.parentElement;
        hrefElement = grandparent.querySelector(hrefRule.childSelector);
      }
    } else {
      // Default is to find the enclosing anchor element
      hrefElement = element.closest("a");
    }

    if (hrefElement) {
      let href = hrefElement.getAttribute("href");
      if (href) {
        logDebug("extractFsIdFromLocation, using id from href", href);

        let idData = pageMods.getIdDataFromUrl(href, location);
        if (idData) {
          return idData;
        }
      }
    }

    console.log("no id found for location ", location);
  }

  function analyzeLocation(location) {
    location.hasIcon = false;

    let el = location.matchedElement;

    if (!el.dataset || el.dataset?.wtIconProcessed) {
      //logDebug("location matched element has processed flag");
      return false;
    }

    if (location.matchedElement.querySelector(".wt-sourcer-icon")) {
      location.hasIcon = true;
      logDebug("location matched element has icon already");
      return false;
    }

    location.iconPlaceElement = getElementToAddIconTo(location);
    if (!location.iconPlaceElement) {
      logDebug("location matched element has no span element", location);
      return false;
    }

    let iconParent = pageMods.findExistingIconParent(location);
    let hasIconAlready = iconParent.querySelector(".wt-sourcer-icon");
    if (hasIconAlready) {
      location.hasIcon = true;
      logDebug("location matched element has icon already");
      return false;
    }

    if (!location.locationType.needToFetchIds) {
      let idData = extractFsIdFromLocation(location); // Helper to get ID from href or text
      if (idData) {
        location.id = idData.id;
        location.idType = idData.idType;
      } else {
        logDebug("location matched element has no id and does not require fetch");
        return false;
      }
    } else {
      logDebug("location has locationType.needToFetchIds", location);
    }

    pageMods.addProcessingIcon(location);
    el.dataset.wtIconProcessed = "true";

    return true;
  }

  let areOptionsForThisPageEnabled = false;

  function onMutation(options, mutations) {
    // Because FamilySearch is a Single Page Application (SPA), the URL can change
    // without a page reload. In that case the MutationObserver is still running
    if (window.sourcerWtIconsLastProcessedUrl !== document.URL) {
      window.sourcerWtIconsLastProcessedUrl = document.URL;

      // we have changed page so kill any pending locations
      pendingLocationsBatch = {};

      pageMods.determinePageProfile(document.URL);
      let idData = pageMods.getIdDataFromUrl(document.URL);
      if (idData) {
        pageMods.id = idData.id;
        pageMods.idType = idData.idType;
      }

      logDebug("pageProfile is: ", pageMods.pageProfile);

      if (!pageMods.pageProfile) {
        console.log("initWtIconInjection could not identify pageProfile for URL:", document.URL);
        return;
      }

      // if none of the options for this profile are enabled return
      areOptionsForThisPageEnabled = false;
      for (let locationType of pageMods.pageProfile.locationTypes) {
        if (pageMods.isLocationTypeEnabled(locationType)) {
          areOptionsForThisPageEnabled = true;
          break;
        }
      }
    }

    if (!pageMods.pageProfile || !areOptionsForThisPageEnabled) {
      return;
    }

    let foundNew = false;

    let candidateLocations = [];

    for (let locationType of pageMods.pageProfile.locationTypes) {
      if (pageMods.isLocationTypeEnabled(locationType)) {
        let candidateElements = document.querySelectorAll(locationType.selector);
        //logDebug("locationType ", locationType);
        //logDebug("candidateElements ", candidateElements);
        for (let candidateElement of candidateElements) {
          let candidateLocation = { locationType: locationType, matchedElement: candidateElement };
          if (analyzeLocation(candidateLocation)) {
            //logDebug("pushing candidateLocation ", candidateLocation);

            candidateLocations.push(candidateLocation);
          } else {
            //logDebug("candidate location rejected:", candidateLocation);
          }
        }
      }
    }

    if (candidateLocations.length) {
      logDebug(`There are ${candidateLocations.length} candidateLocations`);
      logDebug(candidateLocations);
      foundNew = true;
    }

    candidateLocations.forEach((candidateLocation) => {
      addLocationToPendingBatch(candidateLocation);
    });

    if (foundNew) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(processPendingLocations, 300); // Wait 300ms of "silence"
    }
  }

  let pageMods = undefined;

  function initWtIconInjection(options) {
    // Check if we've already initialized to prevent double-observers
    if (window.hasSourcerWtIconInjectionStarted) return;

    window.hasSourcerWtIconInjectionStarted = true;

    logDebug("initWtIconInjection: document.URL is: " + document.URL);

    const domainRegex = /^https?:\/\/(?:[a-z0-9-]+\.)*familysearch\.(?:org|net|jp|org\.uk|de|fr|es|it)/i;

    let siteConfig = {
      siteName: "fs",
      pageProfiles: pageProfiles,
      domainRegex: domainRegex,
    };
    pageMods = new WikiTreeSourcerPageModsHelper(siteConfig);
    pageMods.setOptions(options);

    const observer = new MutationObserver((mutations) => {
      // Check if the extension is still "alive"
      if (!chrome || !chrome.runtime?.id) {
        console.log("WikiTree Sourcer: Context invalidated, stopping observer.");
        // Stop observing mutations
        if (observer) {
          observer.disconnect();
        }
        return;
      }

      //logDebug("MutationObserver called", mutations);
      onMutation(options, mutations);
    });

    window.sourcerWtMutationObserver = observer;

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    logDebug("WikiTree Sourcer: Observer started.");
  }

  async function checkOptionsAndInitWtIconInjection() {
    chrome.runtime.sendMessage(
      {
        type: "getOptions",
      },
      function (response) {
        // We get a response with the loaded options
        if (response && response.success) {
          const options = response.options;
          if (options) {
            if (options.ui_pageMods_allowPageMods) {
              initWtIconInjection(options);
            }
          }
        }
      }
    );
  }

  // Only start once the window is fully loaded
  if (document.readyState === "complete") {
    checkOptionsAndInitWtIconInjection();
  } else {
    window.addEventListener("load", checkOptionsAndInitWtIconInjection);
  }
}
