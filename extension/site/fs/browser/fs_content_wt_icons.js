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

// Wrapper to put all icon injection in a scope and to prevent redefinition
// if content script loaded twice
if (!window.sourcerFsContentWtIcons) {
  window.sourcerFsContentWtIcons = true;

  async function fetchFsSourcesJson(sourceIdList, sessionId) {
    //console.log("fetchFsSourcesJson, sessionId is: " + sessionId);

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

    console.log("fetchUrl is", fetchUrl);

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

      console.log("response is");
      console.log(response);

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

      //console.log("data is:");
      //console.log(data);

      if (data.startsWith("{")) {
        const jsonData = data;
        const dataObj = JSON.parse(jsonData);

        console.log("dataObj is:");
        console.log(dataObj);

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
    if (result.success) {
      logDebug("fetchFsIdsForSources, dataObj", result.dataObj);
      let sources = result.dataObj.sources;

      for (let location of locationBatch.locations) {
        let locationTypeName = location.locationType.locationTypeName;
        if (locationTypeName == "sourceRow") {
          // get the source ID from the element
          let sourceId = extractSourceIdFromElement(location.matchedElement);
          if (sourceId) {
            for (let source of sources) {
              if (source.id == sourceId) {
                if (source.uri && source.uri.uri) {
                  // non-FS sources can be mising a uri

                  let fsId = getFsIdFromUrl(source.uri.uri);
                  if (fsId) {
                    location.fsId = fsId;

                    if (!locationBatch.pendingFsIds.has(fsId)) {
                      locationBatch.pendingFsIds.set(fsId, []);
                    }
                    locationBatch.pendingFsIds.get(fsId).push(location);
                  }
                }
                break;
              }
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
      match: () => document.URL.includes("/tree/person/details/"),
      locationTypes: [
        {
          locationTypeName: "pageH1",
          selector: "h1 [data-testid='fullName']",
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
      match: () => document.URL.includes("/tree/person/sources/"),
      locationTypes: [
        {
          locationTypeName: "pageH1",
          selector: "[data-testid='fullName']",
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
      match: () => document.URL.includes("/tree/person/about/"),
      locationTypes: [
        {
          locationTypeName: "pageH1",
          selector: "h1 [data-testid='fullName']",
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
      match: () => document.URL.includes("/ark:/61903/1:1:"),
      locationTypes: [
        {
          locationTypeName: "pageH1",
          selector: "main h1 > div",
          optionKey: "recordShowWtIconH1",
        },
        {
          locationTypeName: "otherPeople",
          selector: "tr > th > span > a",
          optionKey: "recordShowWtIconOtherPeople",
        },
        {
          locationTypeName: "thisRecordAttachedTo",
          selector: "li [data-testid='person'] [data-testid='fullName']",
          optionKey: "recordShowWtIconAttached",
        },
      ],
    },
    {
      pageType: "image",
      match: () => document.URL.includes("/ark:/61903/3:1:"), // may not match all images
      locationTypes: [
        {
          locationTypeName: "pageH1",
          selector: "[data-testid='fullName'], nav ol",
          optionKey: "imageShowWtIconH1",
        },
      ],
    },
    {
      pageType: "search",
      match: () => document.URL.includes("/search/record/"),
      locationTypes: [
        {
          locationTypeName: "searchResult",
          selector: "td > h2 > strong > a",
          optionKey: "searchResultsShowWtIconResultRow",
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
  <path d="M15 12H8M8 12L11 9M8 12L11 15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

  const svgMultiple = `data:image/svg+xml;utf8,
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="11" fill="%23ffaf02" stroke="white" stroke-width="1.5"/>
  <path d="M10 8L7 12L10 16M17 8L14 12L17 16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

  const svgMultipleOverlap = `data:image/svg+xml;utf8,
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <circle cx="14" cy="10" r="9" fill="%23ffaf02" stroke="white" stroke-width="1.5" opacity="0.6"/>
  <circle cx="10" cy="14" r="9" fill="%23ffaf02" stroke="white" stroke-width="1.5"/>
  <path d="M12 14H8M8 14L10 12M8 14L10 16" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

  function addWikiTreeIcon(location, wikiIds) {
    console.log("addWikiTreeIcon", location, wikiIds);

    if (wikiIds.length < 1) {
      console.log("addWikiTreeIcon, profiles length less than 1");
      return;
    }

    let spanElement = location.spanElement;

    let svgIcon = null;
    let titleText = "FamilySearch " + location.fsIdType + " " + location.fsId + " is ";

    if (wikiIds.length > 1) {
      svgIcon = svgMultipleOverlap;
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
        wtPlusUrl += "FamilySearch=" + fsId;
        wtPlusUrl += "&render=1";
        anchorElement.setAttribute("href", wtPlusUrl);
      }
    } else {
      anchorElement.setAttribute("href", "https://www.wikitree.com/wiki/" + wikiIds[0]);
    }

    anchorElement.target = "_blank";
    anchorElement.style.textDecoration = "none";

    // 6. Inject it next to the name
    anchorElement.appendChild(img);

    // if this span element is an ellipsis style then we need to avoid the icon disappearing
    // when the ellipsis is shown
    const isEllipsisSpan = Array.from(spanElement.classList).some((cls) => cls.startsWith("ellipsisCss"));

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
      anchorElement.appendChild(img);
      container.appendChild(anchorElement);
    } else if (location.locationType.locationTypeName === "sourceRow") {
      // 1. Ensure the container shows icons side-by-side
      spanElement.style.display = "inline-flex";
      spanElement.style.alignItems = "center";
      spanElement.style.gap = "8px"; // Standard spacing between icons

      // 2. Adjust icon size and vertical offset
      img.style.width = "20px"; // 20px usually fits better in source rows
      img.style.height = "20px";
      img.style.marginLeft = "0"; // Gap handles this now
      img.style.top = "0px"; // Reset the nudge since flex-align handles it

      spanElement.appendChild(anchorElement);
    } else {
      img.style.marginLeft = "12px";
      spanElement.appendChild(anchorElement);
    }
  }

  let pendingLocationsBatch = {};
  let debounceTimer = null;

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
      if (!pendingLocationsBatch.pendingFsIds.has(fsId)) {
        pendingLocationsBatch.pendingFsIds.set(fsId, []);
      }
      pendingLocationsBatch.pendingFsIds.get(fsId).push(location);
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

    let pendingFsIds = pendingLocationsBatch.pendingFsIds;
    console.log(`processPendingLocations, pendingFsIds size is ${pendingFsIds.size}`);

    const idsToQuery = Array.from(pendingFsIds.keys()).join(",");
    //console.log("processPendingLocations, idsToQuery is: ", idsToQuery);
    if (!idsToQuery) return;

    // Clear the pendingLocationsBatch immediately so new mutations start a fresh batch
    const currentBatch = pendingLocationsBatch;
    pendingLocationsBatch = {};

    try {
      const response = await wtPlusApiGetProfilesUsingFsId(idsToQuery);
      console.log("processPendingLocations, response is: ", response);
      if (response.response?.profiles) {
        // create a map of element to wtIds
        let locationToWikiId = new Map();

        function addWikiIdToLocation(location, wikiId, type) {
          location.fsIdType = type;
          let existingLocationWikiIdList = locationToWikiId.get(location);
          if (!existingLocationWikiIdList) {
            locationToWikiId.set(location, []);
            existingLocationWikiIdList = locationToWikiId.get(location);
          }
          if (!existingLocationWikiIdList.includes(wikiId)) {
            existingLocationWikiIdList.push(wikiId);
          }
        }

        function addWikiIdToLocations(fsIdList, wikiId, type) {
          for (let fsId of fsIdList) {
            let locations = currentBatch.pendingFsIds.get(fsId);
            if (locations) {
              for (let location of locations) {
                addWikiIdToLocation(location, wikiId, type);
              }
            }
          }
        }

        // record the profiles that reference the elements fsId for the currentBatch
        response.response.profiles.forEach((profile) => {
          addWikiIdToLocations(profile.persons, profile.wikitreeID, "person");
          addWikiIdToLocations(profile.records, profile.wikitreeID, "record");
          addWikiIdToLocations(profile.recordImages, profile.wikitreeID, "image");
        });

        //console.log("locationToWikiId is", locationToWikiId);

        // now add icons
        for (const [location, wikiIds] of locationToWikiId) {
          addWikiTreeIcon(location, wikiIds);
        }
      }
    } catch (error) {
      console.error("WT+ API Batch fetch failed", error);
      logDebug("idsToQuery is", idsToQuery);
    }
  }

  // A person url should look like one of these:
  // https://www.familysearch.org/en/tree/person/details/L62P-39Y
  // https://www.familysearch.org/en/tree/person/sources/L62P-39Y
  // But an href can be:
  // /en/tree/person/L62P-39Y
  const personRegex = /^.*\/tree\/person\/(?:[^\/]+\/)?([A-Z0-9\-]+).*$/;
  // A record URL  should look like one of these:
  // https://www.familysearch.org/ark:/61903/1:1:XLX7-TL7?lang=en
  //const recordRegex = /^.*\/ark\:\/61903\/\d\:\d\:([A-Z0-9]+\-[A-Z0-9]+).*$/;
  const recordRegex = /\/ark\:\/61903\/.*\:([A-Z0-9]{4,5}\-[A-Z0-9]{3,4})/;
  // An image URL  should look like one of these:
  // https://familysearch.org/ark:/61903/3:1:939N-8GSP-KW?lang=en&view=index&groupId=M9C5-PB5
  const imageRegex = /^.*\/ark\:\/\d+\/\d\:\d\:([A-Z0-9\-]+).*$/;
  // A search results URL URL  should look like one of these:
  // https://www.familysearch.org/en/search/record/results?count=20&treeref=G443-GML&q.givenName=Etienne&q.surname=Smit&q.birthLikeDate.from=1926&q.birthLikeDate.to=1930&q.deathLikeDate.from=2005&q.deathLikeDate.to=2009&q.marriageLikePlace=Paarl%2C%20Cape%20Province%2C%20South%20Africa&q.marriageLikeDate.from=1949&q.marriageLikeDate.to=1957&q.spouseGivenName=Anna%20Jacoba&q.spouseSurname=de%20Villiers&q.marriageLikePlace.1=Wynberg%2C%20Cape%20Province%2C%20South%20Africa&q.marriageLikeDate.from.1=1959&q.marriageLikeDate.to.1=1967&q.spouseGivenName.1=Helena&q.spouseSurname.1=Theron&q.recordCountry=South%20Africa
  const searchRegex = /^https\:\/\/(?:www\.)?familysearch.org\/[^\/]+\/search\/.*$/;

  function determinePageType(url) {
    if (personRegex.test(url)) {
      return "person";
    } else if (recordRegex.test(url)) {
      return "record";
    } else if (imageRegex.test(url)) {
      return "image";
    } else if (searchRegex.test(url)) {
      return "search";
    }
  }

  function getFsIdFromUrl(url) {
    //console.log("getFsIdFromUrl ", url);

    // Remove the start and the domain, leaving the rest of the string untouched
    const domainRegex = /^https?:\/\/(?:www\.)?familysearch\.org/;
    url = url.replace(domainRegex, "");

    //console.log("getFsIdFromUrl modified URL is ", url);

    if (personRegex.test(url)) {
      let personId = url.replace(personRegex, "$1");
      //console.log("personId is:", personId);

      if (personId.length > 5) {
        return personId;
      }
    } else if (recordRegex.test(url)) {
      let recordId = url.replace(recordRegex, "$1");
      //console.log("recordId is:", recordId);

      if (recordId.length > 5) {
        return recordId;
      }
    } else if (imageRegex.test(url)) {
      let imageId = url.replace(imageRegex, "$1");
      //console.log("imageId is:", imageId);

      if (imageId.length > 5) {
        return imageId;
      }
    } else {
      console.log("getFsIdFromUrl no match for ", url);
    }
  }

  function extractFsIdFromLocation(location) {
    let element = location.matchedElement;
    // We found an element that could be a place where an icon could be added
    let enclosingLinkElement = element.closest("a");
    if (enclosingLinkElement) {
      let href = enclosingLinkElement.getAttribute("href");
      if (href) {
        let fsId = getFsIdFromUrl(href);
        if (fsId) {
          return fsId;
        }
      }
    } else {
      // could be the top level heading
      let enclosingH1Element = element.closest("h1");
      if (enclosingH1Element) {
        let fsId = getFsIdFromUrl(document.URL);
        if (fsId) {
          return fsId;
        }
      } else if (element.tagName == "OL") {
        // this is the OL after a heading typically
        let fsId = getFsIdFromUrl(document.URL);
        if (fsId) {
          return fsId;
        }
      } else {
        console.log("no fsId found for element ", element);
      }
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
      logDebug("location matched element has no span element");
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
      location.fsId = extractFsIdFromLocation(location); // Helper to get ID from href or text
      if (!location.fsId) {
        logDebug("location matched element has no fsId and does not require fetch");
        return false;
      }
    }

    el.dataset.wtIconProcessed = "true";

    return true;
  }

  function onMutation(pageProfile, options, mutations) {
    let foundNew = false;

    let candidateLocations = [];

    for (let locationType of pageProfile.locationTypes) {
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

    let pageType = determinePageType(document.URL);
    console.log("pageType is: " + pageType);

    let pageProfile = pageProfiles.find((profile) => profile.match());
    console.log("pageProfile is: ", pageProfile);

    // if none of the options for this profile are enabled return
    let optionEnabled = false;
    for (let locationType of pageProfile.locationTypes) {
      if (isLocationTypeEnabled(locationType, options)) {
        optionEnabled = true;
        break;
      }
    }
    if (!optionEnabled) {
      return;
    }

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
      onMutation(pageProfile, options, mutations);
    });

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
