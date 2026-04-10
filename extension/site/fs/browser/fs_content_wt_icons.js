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
//    Marriage
//
// Image:
//
// https://www.familysearch.org/ark:/61903/3:1:3Q9M-CSV8-W944-B?i=356&lang=en&cc=1478678
//    Image page with 23 WT profiles linking to it
//    Note the unusual 4 part fsId
//
// https://familysearch.org/ark:/61903/3:1:3Q9M-CS2Q-M6MV?cc=2821281&lang=en&view=index&groupId=&personArk=%2Fark%3A%2F61903%2F1%3A1%3A6ZCM-FKTL&action=view
//    Referenced from 2 WT profiles
//    Has no film mumber in the nav bar
//
// https://www.familysearch.org/ark:/61903/3:1:939N-8GSP-KW?lang=en&i=160&cc=1804002
//  Marriage
//
// https://www.familysearch.org/ark:/61903/3:1:939N-8GSP-KW?lang=en&i=160&cc=1804002
//
// https://www.familysearch.org/ark:/61903/3:1:33SQ-GR6Z-4DW?view=index&personArk=%2Fark%3A%2F61903%2F1%3A1%3AMH4N-35W&action=view&cc=1488411&lang=en&groupId=
//
// Search results:
//
// https://www.familysearch.org/en/search/record/results?count=20&&q.givenName=Casimiro%20Molina&q.surname=Lopez&q.birthLikePlace=Santa%20Fe%2C%20New%20Mexico%2C%20United%20States&q.birthLikeDate.from=1876&q.birthLikeDate.to=1880&q.deathLikePlace=Santa%20Barbara%2C%20Santa%20Barbara%2C%20California%2C%20United%20States&q.deathLikeDate.from=1938&q.deathLikeDate.to=1942&q.marriageLikePlace=Santa%20Barbara%2C%20California%2C%20United%20States&q.marriageLikeDate.from=1908&q.marriageLikeDate.to=1916&q.spouseGivenName=Victoria&q.spouseSurname=Cordero&q.recordCountry=United%20States
//    1st and 5th are referenced from WT profiles

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
    let pageFsId = pageInfo.fsId;
    if (!pageFsId) {
      return;
    }

    logDebug("fetchSimilarRecords, pageFsId", pageFsId);
    logDebug("fetchSimilarRecords, locationBatch", locationBatch);

    let result = await fetchFsSimilarRecordsJson(pageFsId);
    if (result.success) {
      logDebug("fetchSimilarRecords, dataObj", result.dataObj);
    } else {
      logDebug("fetchSimilarRecords, bad response from fetchFsSourcesJson", result);
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
              let fsIdData = getFsIdDataFromUrl(fsUrl);
              if (fsIdData) {
                let fsId = fsIdData.fsId;
                location.fsId = fsId;
                location.fsIdType = fsIdData.fsIdType;
                addLocationToPendingFsIds(locationBatch, fsId, location);
              }
            }
          }
        }
      }
    }
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

    let result = await fetchFsSourcesJson(sourceIdList);
    if (result.success && result.dataObj && result.dataObj.sources && result.dataObj.sources.length) {
      logDebug("fetchFsIdsForSources, dataObj", result.dataObj);
      let sources = result.dataObj.sources;

      for (let location of locationBatch.locations) {
        let locationTypeName = location.locationType.locationTypeName;
        let sourceId = null;
        if (locationTypeName == "sourceRow") {
          // get the source ID from the element
          sourceId = extractSourceIdFromElement(location.matchedElement);
        }

        if (sourceId) {
          for (let source of sources) {
            if (source.id == sourceId) {
              if (source.uri && source.uri.uri) {
                // non-FS sources can be mising a uri

                let fsIdData = getFsIdDataFromUrl(source.uri.uri);
                if (fsIdData) {
                  let fsId = fsIdData.fsId;
                  location.fsId = fsId;
                  location.fsIdType = fsIdData.fsIdType;

                  addLocationToPendingFsIds(locationBatch, fsId, location);
                }
              }
              break;
            }
          }
        }
      }
    } else {
      logDebug("fetchFsIdsForSources, bad response from fetchFsSourcesJson", result);
    }
  }

  const pageProfiles = [
    {
      pageType: "personDetails",
      matchRegex: personDetailsRegex,
      locationTypes: [
        {
          locationTypeName: "pageH1",
          selector: "h1 [data-testid='fullName']",
          useFsIdFromPageUrl: true,
          optionKey: "personShowWtIconH1",
        },
        {
          locationTypeName: "familyMember",
          selector: "[data-testid='nameLink'] [data-testid='fullName']",
          optionKey: "personDetailsShowWtIconFamily",
        },
      ],
    },
    {
      pageType: "personSources",
      matchRegex: personSourcesRegex,
      locationTypes: [
        {
          locationTypeName: "pageH1",
          selector: "[data-testid='fullName']",
          useFsIdFromPageUrl: true,
          optionKey: "personShowWtIconH1",
        },
        {
          locationTypeName: "sourceRow",
          selector: "[data-testid='section-card-sources'] [data-testid='source-heading-section']",
          optionKey: "personSourcesShowWtIconOnSourceRow",
          needToFetchIds: true,
          fetchFunction: fetchFsIdsForSources,
        },
      ],
    },
    {
      pageType: "personAbout",
      matchRegex: personAboutRegex,
      locationTypes: [
        {
          locationTypeName: "pageH1",
          selector: "h1 [data-testid='fullName']",
          useFsIdFromPageUrl: true,
          optionKey: "personShowWtIconH1",
        },
        {
          locationTypeName: "familyMember",
          selector: "[data-testid='nameLink'] [data-testid='fullName']",
          optionKey: "personAboutShowWtIconFamily",
        },
      ],
    },
    {
      pageType: "record",
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
          optionKey: "recordShowWtIconOtherPeople",
        },
        {
          locationTypeName: "thisRecordAttachedTo",
          selector: "div[class^='attachCss'] [data-testid='person'] [data-testid='fullName']",
          optionKey: "recordShowWtIconAttached",
        },
        {
          locationTypeName: "similarRecord",
          selector: "li div[role='button'] span > span",
          needToFetchIds: true,
          fetchFunction: fetchSimilarRecords,
          optionKey: "recordShowWtIconSimilarRecords",
        },
        {
          locationTypeName: "similarRecordAttachedTo",
          selector: "li [data-testid='person'] [data-testid='fullName']",
          optionKey: "recordShowWtIconSimilarRecordsAttached",
        },
      ],
    },
    {
      pageType: "image",
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
        },
        {
          locationTypeName: "imageIndexRecord",
          selector: "aside tbody > tr > td > a[href^='/ark:/61903/'] > span",
          optionKey: "imageShowWtIconSidebar",
        },
        {
          locationTypeName: "pageH1",
          selector: "main h1 > span, nav ol",
          useFsIdFromPageUrl: true,
          optionKey: "imageShowWtIconH1",
        },
        {
          locationTypeName: "imageNavBar",
          selector: "nav > div > div[class^='rowCss']",
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
          optionKey: "searchResultsShowWtIconResultRow",
        },
        {
          locationTypeName: "sidebarHeader",
          selector: "[data-testid='PersonSheetHeader'] [data-testid='nameLink'] [data-testid='fullName']",
          optionKey: "searchResultsShowWtIconSidebar",
        },
        {
          locationTypeName: "sidebarHeaderPreview",
          selector: "[data-testid='recordPreview-InfoSheet'] h1 > div",
          optionKey: "searchResultsShowWtIconSidebar",
        },
        {
          locationTypeName: "searchPersonInFsTree",
          selector:
            "aside [data-testid='nameSpan'] [data-testid='fullName'], aside [data-testid='person'] [data-testid='fullName']",
          optionKey: "searchResultsShowWtIconPersonInTree",
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
        },
        {
          locationTypeName: "sidebarHeader",
          selector: "[data-testid='PersonSheetHeader'] [data-testid='nameLink'] [data-testid='fullName']",
          optionKey: "pedigreeLandscapeShowWtIconSidebar",
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
        },
        {
          locationTypeName: "sidebarHeader",
          selector: "aside [data-testid='PersonSheetHeader'] [data-testid='nameLink'] [data-testid='fullName']",
          optionKey: "pedigreePortraitShowWtIconSidebar",
        },
      ],
    },
  ];

  function isLocationTypeEnabled(locationType, options) {
    let optionKey = "ui_fs_" + locationType.optionKey;
    return options[optionKey];
  }

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

  function getSpanElementToAddIconTo(location) {
    let element = location.matchedElement;

    let locationType = location.locationType;

    if (locationType.locationTypeName == "sourceRow") {
      let titleElement = element.querySelector("div[class^='cssSourceTitle']");
      return titleElement;
    }

    if (locationType.locationTypeName == "imageIndexRecord") {
      let tdElement = element.closest("td");
      if (tdElement) {
        let attachElement = tdElement.querySelector("a[href*='search/linker']");
        if (attachElement) {
          return attachElement;
        }
      }
    }

    if (locationType.locationTypeName == "imageNavBar") {
      return element;
    }

    if (locationType.locationTypeName == "similarRecord") {
      // we want to add as a child of the parent span
      return element.parentElement;
    }

    if (element.tagName == "SPAN") {
      return element;
    }

    let enclosingDiv = element.closest("div");
    if (enclosingDiv) {
      let spanElement = enclosingDiv.querySelector("h1 span");
      if (spanElement) {
        return spanElement;
      }
    }

    // for record pages the title is not actually a span, it is a div
    if (element.tagName == "DIV") {
      let enclosingH1 = element.closest("h1");
      if (enclosingH1) {
        return element;
      }
    }

    // for other people on a record page
    if (element.tagName == "A") {
      let enclosingSpan = element.closest("span");
      if (enclosingSpan) {
        return enclosingSpan;
      }
      let enclosingStrong = element.closest("strong"); // for search results
      if (enclosingStrong) {
        return enclosingStrong;
      }
    }
  }

  // Define  SVG icons
  const svgSingle = `data:image/svg+xml;utf8,
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="11" fill="%23ffaf02" stroke="white" stroke-width="1.5"/>
  
  <path d="M16 12H1M1 12L5 8M1 12L5 16" 
        stroke="rgba(0,0,0,0.4)" 
        stroke-width="5" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        fill="none"/>
        
  <path d="M16 12H1M1 12L5 8M1 12L5 16" 
        stroke="white" 
        stroke-width="2.5" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        fill="none"/>
</svg>`;

  const svgMultiple = `data:image/svg+xml;utf8,
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <circle cx="15" cy="9" r="8" fill="%23ffaf02" stroke="white" stroke-width="1.5" opacity="0.6"/>
  
  <circle cx="10" cy="14" r="9" fill="%23ffaf02" stroke="white" stroke-width="1.5"/>
  
  <path d="M13 14H2M2 14L5 11M2 14L5 17" 
        stroke="rgba(0,0,0,0.4)" 
        stroke-width="5" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        fill="none"/>
        
  <path d="M13 14H2M2 14L5 11M2 14L5 17" 
        stroke="white" 
        stroke-width="2.5" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        fill="none"/>
</svg>`;

  function addWikiTreeIcon(location, wikiIds) {
    logDebug("addWikiTreeIcon", location, wikiIds);

    if (wikiIds.length < 1) {
      logDebug("addWikiTreeIcon, profiles length less than 1");
      return;
    }

    let spanElement = location.spanElement;

    let svgIcon = null;
    let titleText = "FamilySearch " + location.fsIdType + " " + location.fsId + " is ";

    if (wikiIds.length > 1) {
      svgIcon = svgMultiple;
      titleText += `referenced from ${wikiIds.length} WikiTree profiles`;
    } else {
      svgIcon = svgSingle;
      titleText += `referenced from WikiTree profile: ${wikiIds[0]}`;
    }

    const img = document.createElement("img");

    // 3. Set the source to your SVG string
    img.src = svgIcon;

    // 4. Add styling for alignment and spacing
    img.style.width = "24px";
    img.style.height = "24px";
    img.style.verticalAlign = "middle"; // Crucial for sitting level with the text
    img.style.position = "relative";
    img.style.top = "-1px"; // Tiny nudge up to visually center with the caps
    img.style.filter = "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.15))";

    img.style.cursor = "pointer";
    img.className = "wt-sourcer-icon"; // Good for your MutationObserver check

    // 5. Add a tooltip for clarity
    img.title = titleText;

    // Set initial filter
    const normalFilter = "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.15))";
    img.style.filter = normalFilter;

    img.addEventListener("mouseenter", () => {
      img.style.filter = `${normalFilter} brightness(1.1)`;
    });

    img.addEventListener("mouseleave", () => {
      img.style.filter = normalFilter;
    });

    // create an anchor element
    const anchorElement = document.createElement("a");
    if (wikiIds.length > 1) {
      let fsId = location.fsId;
      if (fsId) {
        let wtPlusUrl = "https://plus.wikitree.com/default.htm?report=srch1&Query=";
        if (location.fsIdType == "image") {
          wtPlusUrl += "FamilySearchImage=";
        } else {
          wtPlusUrl += "FamilySearch=";
        }
        wtPlusUrl += fsId;
        wtPlusUrl += "&render=1";
        anchorElement.setAttribute("href", wtPlusUrl);
      }
    } else {
      anchorElement.setAttribute("href", "https://www.wikitree.com/wiki/" + wikiIds[0]);
    }

    anchorElement.target = "_blank";
    anchorElement.style.textDecoration = "none";

    anchorElement.appendChild(img);

    // if this span element is an ellipsis style then we need to avoid the icon disappearing
    // when the ellipsis is shown
    const isEllipsisSpan = Array.from(spanElement.classList).some((cls) => cls.startsWith("ellipsisCss"));
    const locationTypeName = location.locationType.locationTypeName;

    if (isEllipsisSpan) {
      const container = spanElement.parentElement;

      // Set container to flex so icon stays visible next to the span
      container.style.display = "flex";
      container.style.alignItems = "center";
      container.style.flexDirection = "row";
      container.style.width = "100%"; // Ensure it uses the full header width

      // Allow the name to shrink, but keep the icon fixed
      spanElement.style.flexShrink = "1";
      spanElement.style.minWidth = "0"; // Firefox requirement for flex-shrink on text

      anchorElement.style.flexShrink = "0";
      anchorElement.style.display = "flex";
      anchorElement.style.marginLeft = "8px";

      // Append to PARENT so it's not clipped by the span
      container.appendChild(anchorElement);
    } else if (locationTypeName === "sourceRow" || locationTypeName == "imageIndexRecord") {
      // Set container to flex so icon stays visible next to the span
      spanElement.style.display = "flex";
      spanElement.style.alignItems = "flex-start";
      spanElement.style.flexDirection = "row";

      anchorElement.style.flexShrink = "0";
      anchorElement.style.display = "flex";
      anchorElement.style.marginLeft = "8px";

      spanElement.appendChild(anchorElement);
    } else if (locationTypeName === "imageNavBar") {
      // the spanElement is a container that we want to append to
      anchorElement.style.flexShrink = "0";
      anchorElement.style.display = "flex";
      anchorElement.style.marginLeft = "8px";

      spanElement.appendChild(anchorElement);
    } else if (locationTypeName === "similarRecord") {
      // the spanElement is a container that we want to append to
      anchorElement.style.marginLeft = "0px";
      spanElement.appendChild(anchorElement);
    } else {
      img.style.marginLeft = "12px";
      spanElement.appendChild(anchorElement);
    }
  }

  let cachedFsIdToWtIdsMap = new Map();

  let pendingLocationsBatch = {};
  let debounceTimer = null;

  function addLocationToPendingFsIds(locationBatch, fsId, location) {
    if (!locationBatch.pendingFsIds.has(fsId)) {
      locationBatch.pendingFsIds.set(fsId, []);
    }
    locationBatch.pendingFsIds.get(fsId).push(location);
  }

  function addLocationToPendingBatch(location) {
    if (!pendingLocationsBatch.locations) {
      pendingLocationsBatch.locations = [];
    }
    pendingLocationsBatch.locations.push(location);

    if (!pendingLocationsBatch.pendingFsIds) {
      pendingLocationsBatch.pendingFsIds = new Map();
    }

    const fsId = location.fsId;
    if (fsId) {
      addLocationToPendingFsIds(pendingLocationsBatch, fsId, location);
    } else {
      let locationType = location.locationType;
      if (locationType.needToFetchIds) {
        pendingLocationsBatch.awaitingFsIdFetch = true;
        let fetchFunction = location.locationType.fetchFunction;
        if (!pendingLocationsBatch.fetchFunctions) {
          pendingLocationsBatch.fetchFunctions = [];
        }
        if (!pendingLocationsBatch.fetchFunctions.includes(fetchFunction)) {
          pendingLocationsBatch.fetchFunctions.push(fetchFunction);
          pendingLocationsBatch.awaitingFsIdFetch = true;
        }
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

    for (let fsId of fsIdsToCheck) {
      if (!cachedFsIdToWtIdsMap.has(fsId)) {
        fsIdsToQuery.push(fsId);
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
          for (let fsId of fsIdList) {
            if (!cachedFsIdToWtIdsMap.has(fsId)) {
              cachedFsIdToWtIdsMap.set(fsId, []);
            }
            let wikiIdsForFsId = cachedFsIdToWtIdsMap.get(fsId);
            if (!wikiIdsForFsId.includes(wikiId)) {
              wikiIdsForFsId.push(wikiId);
            }
          }
        }

        // record the profiles that reference the elements fsId for the currentBatch
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

    if (pendingLocationsBatch.awaitingFsIdFetch) {
      for (let fetchFunction of pendingLocationsBatch.fetchFunctions) {
        await fetchFunction(pendingLocationsBatch);
      }
    }

    // Clear the pendingLocationsBatch immediately so new mutations start a fresh batch
    const currentBatch = pendingLocationsBatch;
    pendingLocationsBatch = {};

    // Use WT+ API to get the WikiTree IDs that use these fsIds
    await getWikiIdsForBatch(currentBatch);

    logDebug("cachedFsIdToWtIdsMap is:", cachedFsIdToWtIdsMap);

    // Go through the locations and set the WikiIds
    if (currentBatch.locations) {
      let locations = currentBatch.locations;
      for (let location of locations) {
        if (location.fsId) {
          let wikiIds = cachedFsIdToWtIdsMap.get(location.fsId);
          if (wikiIds) {
            addWikiTreeIcon(location, wikiIds);
          }
        }
      }
    }
  }

  function determinePageProfile(url) {
    // Remove the start and the domain, leaving the rest of the string untouched
    const domainRegex = /^https?:\/\/(?:www\.)?familysearch\.org/;
    url = url.replace(domainRegex, "");

    for (let profile of pageProfiles) {
      if (profile.matchRegex.test(url)) {
        return profile;
      }
    }
  }

  function getFsIdDataFromUrl(url) {
    //logDebug("getFsIdDataFromUrl ", url);

    // Remove the start and the domain, leaving the rest of the string untouched
    const domainRegex = /^https?:\/\/(?:www\.)?familysearch\.org/;
    url = url.replace(domainRegex, "");

    logDebug("getFsIdDataFromUrl modified URL is ", url);

    if (personRegex.test(url)) {
      let personId = url.replace(personRegex, "$1");
      //logDebug("personId is:", personId);

      if (personId.length > 5) {
        return { fsIdType: "person", fsId: personId };
      }
    } else if (recordRegex.test(url)) {
      let recordId = url.replace(recordRegex, "$1");
      logDebug("url is : ", url, "recordId is:", recordId);

      if (recordId.length > 5) {
        return { fsIdType: "record", fsId: recordId };
      }
    } else if (imageRegex.test(url)) {
      let imageId = url.replace(imageRegex, "$1");
      logDebug("url is : ", url, "imageId is:", imageId);

      if (imageId.length > 5) {
        return { fsIdType: "image", fsId: imageId };
      }
    } else if (pedigreeLandscapeRegex.test(url)) {
      let personId = url.replace(pedigreeLandscapeRegex, "$1");
      logDebug("url is : ", url, "personId is:", personId);

      if (personId.length > 5) {
        return { fsIdType: "person", fsId: personId };
      }
    } else if (pedigreePortraitRegex.test(url)) {
      let personId = url.replace(pedigreePortraitRegex, "$1");
      logDebug("url is : ", url, "personId is:", personId);

      if (personId.length > 5) {
        return { fsIdType: "person", fsId: personId };
      }
    } else {
      console.log("getFsIdDataFromUrl no match for ", url);
    }
  }

  function extractFsIdFromLocation(location) {
    logDebug("extractFsIdFromLocation, location is:", location);

    if (location.locationType.useFsIdFromPageUrl) {
      logDebug("extractFsIdFromLocation, using fsId from location");
      let fsIdData = getFsIdDataFromUrl(document.URL);
      if (fsIdData) {
        return fsIdData;
      }
      return "";
    }

    let element = location.matchedElement;
    // We found an element that could be a place where an icon could be added
    let enclosingLinkElement = element.closest("a");
    if (enclosingLinkElement) {
      let href = enclosingLinkElement.getAttribute("href");
      if (href) {
        logDebug("extractFsIdFromLocation, using fsId from href", href);

        let fsIdData = getFsIdDataFromUrl(href);
        if (fsIdData) {
          return fsIdData;
        }
      }
    } else {
      console.log("no fsId found for location ", location);
    }
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

    location.spanElement = getSpanElementToAddIconTo(location);
    if (!location.spanElement) {
      logDebug("location matched element has no span element", location);
      return false;
    }

    location.isEllipsisSpan = false;

    let hasIconAlready = location.spanElement.querySelector(".wt-sourcer-icon");
    if (!hasIconAlready) {
      // in the case of the ellipsis the icon is a sibling of the span
      const isEllipsisSpan = Array.from(location.spanElement.classList).some((cls) => cls.startsWith("ellipsisCss"));
      if (isEllipsisSpan) {
        location.isEllipsisSpan = true;
        const container = location.spanElement.parentElement;
        hasIconAlready = container.querySelector(".wt-sourcer-icon");
      }
    }
    if (hasIconAlready) {
      location.hasIcon = true;
      logDebug("location matched element has icon already");
      return false;
    }

    if (!location.locationType.needToFetchIds) {
      let fsIdData = extractFsIdFromLocation(location); // Helper to get ID from href or text
      if (fsIdData) {
        location.fsId = fsIdData.fsId;
        location.fsIdType = fsIdData.fsIdType;
      } else {
        logDebug("location matched element has no fsId and does not require fetch");
        return false;
      }
    } else {
      logDebug("location has locationType.needToFetchIds", location);
    }

    el.dataset.wtIconProcessed = "true";

    return true;
  }

  let pageInfo = {};
  let areOptionsForThisPageEnabled = false;

  function onMutation(options, mutations) {
    // Because FamilySearch is a Single Page Application (SPA), the URL can change
    // without a page reload. In that case the MutationObserver is still running
    if (window.sourcerWtIconsLastProcessedUrl !== document.URL) {
      window.sourcerWtIconsLastProcessedUrl = document.URL;

      pageInfo.pageProfile = determinePageProfile(document.URL);
      let fsIdData = getFsIdDataFromUrl(document.URL);
      if (fsIdData) {
        pageInfo.fsId = fsIdData.fsId;
        pageInfo.fsIdType = fsIdData.fsIdType;
      }

      logDebug("pageProfile is: ", pageInfo.pageProfile);

      if (!pageInfo.pageProfile) {
        console.log("initWtIconInjection could not identify pageProfile for URL:", document.URL);
        return;
      }

      // if none of the options for this profile are enabled return
      areOptionsForThisPageEnabled = false;
      for (let locationType of pageInfo.pageProfile.locationTypes) {
        if (isLocationTypeEnabled(locationType, options)) {
          areOptionsForThisPageEnabled = true;
          break;
        }
      }
    }

    if (!pageInfo.pageProfile || !areOptionsForThisPageEnabled) {
      return;
    }

    let foundNew = false;

    let candidateLocations = [];

    for (let locationType of pageInfo.pageProfile.locationTypes) {
      if (isLocationTypeEnabled(locationType, options)) {
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

  function initWtIconInjection(options) {
    // Check if we've already initialized to prevent double-observers
    if (window.hasSourcerWtIconInjectionStarted) return;

    window.hasSourcerWtIconInjectionStarted = true;

    logDebug("initWtIconInjection: document.URL is: " + document.URL);

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
