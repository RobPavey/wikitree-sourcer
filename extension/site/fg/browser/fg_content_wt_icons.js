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

// Example FindAGrave pages to test this on:/
//
// Memorial page:
//
// https://www.findagrave.com/memorial/96562587/john_luther-bond
//
// https://www.findagrave.com/memorial/7195433/olifus-manuel
//    Has two WT profiles referencing it (currently but may be fixed)

logDebug("fg_content_wt_icons.js loaded");

// Get the ID of the current extension instance
const currentExtensionId = chrome.runtime?.id;

// Check what ID (if any) was stored by a previous injection
const runningExtensionId = window.sourcerFgContentWtIconsId;

// Wrapper to put all icon injection in a scope and to prevent redefinition
// if content script loaded twice
if (runningExtensionId === currentExtensionId) {
  // This is a redundant injection of the SAME version.
  // We can safely exit.
  logDebug("fg_content_wt_icons.js: Same version already running.");
} else {
  // 1. This is either the first run OR a new version being injected.
  // 2. Kill the old observer if it exists to prevent "ghost" icons.
  if (window.sourcerWtMutationObserver) {
    window.sourcerWtMutationObserver.disconnect();
    logDebug("WikiTree Sourcer: Cleaned up old observer.");
  }

  // 3. Mark this window with the NEW ID so future redundant injections stop here.
  window.sourcerFgContentWtIconsId = currentExtensionId;

  logDebug("fg_content_wt_icons.js was not already loaded");

  // A memorial page should look like:
  // https://www.findagrave.com/memorial/96562587/john_luther-bond
  // but on the photos tab looks like:
  // https://www.findagrave.com/memorial/96562587/john_luther-bond/photo
  // and the flowers tabe looks like:
  // https://www.findagrave.com/memorial/96562587/john_luther-bond/flower
  // https://www.findagrave.com/memorial/96562587/john-luther-bond#source
  const memorialRegex = /^\/memorial\/(\d+)\/.*$/;

  // A cemetery page should look like one of these:
  // https://www.findagrave.com/cemetery/8074/inglewood-park-cemetery
  const cemeteryRegex = /^\/cemetery\/(\d+)\/.*$/;

  // A cemetery search page looks like:
  // https://www.findagrave.com/cemetery/8074/memorial-search?fulltext=&firstname=&middlename=&lastname=Bond&cemeteryName=Inglewood+Park+Cemetery&birthyear=&birthyearfilter=&deathyear=&deathyearfilter=&bio=&linkedToName=&plot=&memorialid=&mcid=&datefilter=&orderby=r
  const cemeterySearchRegex = /^\/cemetery\/(\d+)\/memorial-search.*/;

  // A general search liike like:
  // https://www.findagrave.com/memorial/search?firstname=John&middlename=Luther&lastname=Bond&includeMaidenName=true&birthyear=1853&birthyearfilter=exact&deathyear=1931&deathyearfilter=exact
  const memorialSearchRegex = /^\/memorial\/search.*/;

  const pageProfiles = [
    {
      pageType: "cemeterySearch",
      pageIdType: "cemetery",
      matchRegex: cemeterySearchRegex,
      locationTypes: [
        {
          locationTypeName: "pageH1",
          selector: "h1.page-title",
          useIdFromPageUrl: true,
          iconPlaceElementRule: { type: "same" },
          optionKey: "cemeteryShowWtIconH1",
        },
        {
          locationTypeName: "memorial",
          locationIdType: "memorial",
          selector: "h2.name-grave",
          iconPlaceElementRule: { type: "same" },
          optionKey: "cemeterySearchShowWtIcon",
        },
      ],
    },
    {
      pageType: "cemetery",
      pageIdType: "cemetery",
      matchRegex: cemeteryRegex,
      locationTypes: [
        {
          locationTypeName: "pageH1",
          selector: "h1.bio-name",
          useIdFromPageUrl: true,
          iconPlaceElementRule: { type: "same" },
          optionKey: "cemeteryShowWtIconH1",
          optionKey2: "cemeteryShowWtCategoryIconH1",
        },
      ],
    },
    {
      pageType: "memorialSearch",
      matchRegex: memorialSearchRegex,
      locationTypes: [
        {
          locationTypeName: "memorial",
          locationIdType: "memorial",
          selector: "h2.name-grave",
          iconPlaceElementRule: { type: "same" },
          optionKey: "memorialSearchShowWtIcon",
        },
      ],
    },
    {
      pageType: "memorial",
      pageIdType: "memorial",
      matchRegex: memorialRegex,
      locationTypes: [
        {
          locationTypeName: "pageH1",
          selector: "#bio-name",
          optionKey: "memorialShowWtIconH1",
          optionKeyForOutRef: "memorialShowWtIconForOutRefH1",
          useIdFromPageUrl: true,
          iconPlaceElementRule: { type: "same" },
        },
        {
          locationTypeName: "familyMember",
          locationIdType: "memorial",
          selector: "div.data-family h3[itemprop='name']",
          optionKey: "memorialShowWtIconFamilyMember",
          // iconPlaceElementRule: { type: "closest", selector: "div.member-item" },
          iconPlaceElementRule: { type: "same" },
        },
      ],
    },
  ];

  function wtPlusApiGetProfilesUsingFgId(idString) {
    let url = `https://plus.wikitree.com/function/wtFindAGrave4Bee/Sourcer.json?query=${idString}`;
    return pageMods.wtPlusApiCall(url);
  }

  function wtPlusApiGetCategoryForCemetery(id) {
    let url = `https://plus.wikitree.com/function/wtCatCIBSearch/BEE_FindAGraveButton.json?Query=${id}&cib=FGCemetery`;
    return pageMods.wtPlusApiCall(url);
  }

  function getElementToAddIconTo(location) {
    let element = location.matchedElement;

    let locationType = location.locationType;

    if (locationType.iconPlaceElementRule) {
      let rule = locationType.iconPlaceElementRule;
      if (rule.type == "same") {
        return element;
      } else if (rule.type == "closest") {
        let closestElement = element.closest(rule.selector);
        if (closestElement) {
          return closestElement;
        }
      }
    } else {
      return element;
    }
  }

  function addWikiTreeIcon(location, wikiIds = [], flowerWikiIds = []) {
    pageMods.removeProcessingIcon(location);

    if (!wikiIds) {
      wikiIds = [];
    }
    if (!flowerWikiIds) {
      flowerWikiIds = [];
    }

    if (wikiIds.length == 0 && flowerWikiIds.length == 0) {
      return;
    }

    logDebug("addWikiTreeIcon", location, wikiIds, flowerWikiIds);

    let iconPlaceElement = location.iconPlaceElement;

    let iconConfig = {
      isMultiple: false,
      isConflict: false,
      includeCategory: false,
      mainArrowStyle: "none",
    };

    let titleText = "FindAGrave " + location.idType + " " + location.id + " is ";
    let clipboardText = "";

    let linkUrl = "";

    if (wikiIds.length > 1) {
      iconConfig.isMultiple = true;
      iconConfig.mainArrowStyle = "in";
      titleText += `referenced from ${wikiIds.length} WikiTree profiles`;

      let id = location.id;
      if (id) {
        let wtPlusUrl = "https://plus.wikitree.com/default.htm?report=srch1&Query=";
        if (location.idType == "memorial") {
          wtPlusUrl += "FindAGrave=fgmem";
        } else {
          wtPlusUrl += "FindAGrave=fgcem";
        }
        wtPlusUrl += id;
        wtPlusUrl += "&render=1";
        linkUrl = wtPlusUrl;
      }

      for (let wikiId of wikiIds) {
        if (clipboardText) {
          clipboardText += ",";
        }
        clipboardText += wikiId;
      }
    } else if (wikiIds.length == 1) {
      iconConfig.mainArrowStyle = "in";
      titleText += `referenced from WikiTree profile: ${wikiIds[0]}`;
      linkUrl = "https://www.wikitree.com/wiki/" + wikiIds[0];
      clipboardText = wikiIds[0];
    }

    if (flowerWikiIds.length == 1) {
      if (wikiIds.length == 1) {
        titleText += ` and this memorial also uses a flower to reference WikiTree profile: ${flowerWikiIds[0]}`;
        if (wikiIds[0] == flowerWikiIds[0]) {
          iconConfig.mainArrowStyle = "both";
        } else {
          iconConfig.mainArrowStyle = "split";
          iconConfig.isConflict = true;
        }
      } else if (wikiIds.length == 0) {
        iconConfig.mainArrowStyle = "out";
        titleText = `FindAGrave ${location.idType} ${location.id} uses a flower to reference WikiTree profile: ${flowerWikiIds[0]}`;
        linkUrl = "https://www.wikitree.com/wiki/" + flowerWikiIds[0];
      } else {
        // there are multiple WT profiles referencing this memorial which in itself is an error
        // and we also reference a WT profile
        iconConfig.mainArrowStyle = "split";
        iconConfig.isConflict = true;
        titleText += ` and this memorial also uses a flower to reference WikiTree profile: ${flowerWikiIds[0]}`;
      }
    } else if (flowerWikiIds.length > 1) {
      // this profile references multiple WT profiles.
      if (wikiIds.length > 0) {
        iconConfig.mainArrowStyle = "split";
        iconConfig.isConflict = true;
        titleText += ` and this memorial also uses flowers to reference multiple WikiTree profiles`;
      } else {
        iconConfig.mainArrowStyle = "split";
        iconConfig.isConflict = true;
        titleText = `FindAGrave ${location.idType} ${location.id} uses flowers to reference multiple WikiTree profiles`;
      }
    }

    const svgIcon = pageMods.buildIcon(iconConfig);

    const anchorElement = pageMods.createAnchorWithIconElement(svgIcon, titleText, clipboardText, linkUrl);

    pageMods.addIconAtLocation(location, anchorElement);
  }

  function addWikiTreeCategoryIcon(location, categoryNames) {
    pageMods.removeProcessingIcon(location);

    if (!categoryNames) {
      categoryNames = [];
    }

    if (!categoryNames.length) {
      return;
    }

    logDebug("addWikiTreeCategoryIcon", location, categoryNames);

    let iconPlaceElement = location.iconPlaceElement;

    let iconConfig = {
      isMultiple: false,
      isConflict: false,
      includeCategory: true,
      mainArrowStyle: "none",
    };
    let titleText = "FindAGrave " + location.idType + " " + location.id + " is ";
    let clipboardText = "";
    let linkUrl = "";

    if (categoryNames.length > 1) {
      iconConfig.isConflict = true;
      titleText += `referenced from ${categoryNames.length} WikiTree categories`;

      let wtPlusUrl = "https://plus.wikitree.com/default.htm?report=srch1&Query=";

      let categoryNamesString = "";
      for (let categoryName of categoryNames) {
        if (categoryNamesString) {
          categoryNamesString += " OR ";
        }

        let modifiedName = categoryName.replace(/[\s,]/g, "_");
        categoryNamesString += `CategoryFull="${modifiedName}"`;
      }

      wtPlusUrl += categoryNamesString;
      wtPlusUrl += "&render=1";
      linkUrl = wtPlusUrl;
    } else if (categoryNames.length == 1) {
      titleText += `referenced from WikiTree category: ${categoryNames[0]}`;
      linkUrl = "https://www.wikitree.com/wiki/Category:" + categoryNames[0];
    }

    const svgIcon = pageMods.buildIcon(iconConfig);

    const anchorElement = pageMods.createAnchorWithIconElement(svgIcon, titleText, clipboardText, linkUrl);

    pageMods.addIconAtLocation(location, anchorElement);
  }

  let cachedFgMemorialIdToWtIdsMap = new Map();

  let pendingLocationsBatch = {};
  let debounceTimer = null;

  function addLocationToPendingBatch(location) {
    if (!pendingLocationsBatch.locations) {
      pendingLocationsBatch.locations = [];
    }
    pendingLocationsBatch.locations.push(location);
  }

  async function getWikiIdsForBatch(currentBatch) {
    logDebug("getWikiIdsForPendingBatch, currentBatch is", currentBatch);

    // we cache all the fsIds that we have queried about

    // if there is a cemetery id in the locations we get the memorials for that first

    let pendingFgMemorialIds = new Map();
    let cemeteryIds = new Map();
    for (let location of currentBatch.locations) {
      let id = location.id;
      let idType = location.idType;
      if (!id || !idType) {
        continue;
      }

      if (idType == "memorial") {
        if (!pendingFgMemorialIds.has(id)) {
          pendingFgMemorialIds.set(id, []);
        }
        pendingFgMemorialIds.get(id).push(location);
      } else if (idType == "cemetery") {
        if (!cemeteryIds.has(id)) {
          cemeteryIds.set(id, []);
        }
        cemeteryIds.get(id).push(location);
      }
    }
    logDebug(`getWikiIdsForBatch, pendingFgMemorialIds is:`, pendingFgMemorialIds);
    logDebug(`getWikiIdsForBatch, cemeteryIds is:`, cemeteryIds);

    if (cemeteryIds.size > 0) {
      if (cemeteryIds.size > 1) {
        console.warn("More than one cemetery id in pending locactions, using first");
      }

      const [cemeteryId, locations] = cemeteryIds.entries().next().value;

      // we only use the first cemetery
      const fgIdToQuery = "fgcem" + cemeteryId;

      if (pageMods.getOptions().ui_fg_cemeteryShowWtIconH1) {
        try {
          const response = await wtPlusApiGetProfilesUsingFgId(fgIdToQuery);
          logDebug("getWikiIdsForPendingBatch, cemetery response is: ", response);
          if (response.response?.memorials) {
            // record the profiles that reference the elements id for the currentBatch
            const memorials = response.response.memorials;
            let wikiIdsForCemetery = [];
            memorials.forEach((memorial) => {
              let wikiId = memorial.WikiTreeID;
              let fgMemorialId = memorial.memorial.toString();

              wikiIdsForCemetery.push(wikiId);

              if (!cachedFgMemorialIdToWtIdsMap.has(fgMemorialId)) {
                cachedFgMemorialIdToWtIdsMap.set(fgMemorialId, []);
              }

              let wikiIdsForFgMemorialId = cachedFgMemorialIdToWtIdsMap.get(fgMemorialId);
              if (!wikiIdsForFgMemorialId.includes(wikiId)) {
                wikiIdsForFgMemorialId.push(wikiId);
              }
            });

            if (memorials.length > 0) {
              // this cemetery has WT profiles add an icon
              logDebug("getWikiIdsForBatch, wikiIdsForCemetery is:", wikiIdsForCemetery);
              if (wikiIdsForCemetery) {
                for (let location of locations) {
                  addWikiTreeIcon(location, wikiIdsForCemetery);
                }
              }
            }

            logDebug(
              "getWikiIdsForPendingBatch, after cemetery response cachedFgMemorialIdToWtIdsMap is: ",
              cachedFgMemorialIdToWtIdsMap
            );
          }
        } catch (error) {
          console.error("!!!!!!! WT+ API Batch fetch failed", error);
          logDebug("fgIdToQuery cemetery id string is: ", fgIdToQuery);
        }
      }

      if (pageMods.getOptions().ui_fg_cemeteryShowWtCategoryIconH1) {
        // also try to get the category for the cemetery
        try {
          const response = await wtPlusApiGetCategoryForCemetery(cemeteryId);
          logDebug("getWikiIdsForPendingBatch, cemetery category response is: ", response);
          if (response?.response?.categories && response.response.categories.length) {
            // record the profiles that reference the elements id for the currentBatch
            const categories = response.response.categories;
            let categoryNamesForCemetery = [];
            categories.forEach((category) => {
              let categoryName = category.category;
              let id = category.id;

              categoryNamesForCemetery.push(categoryName);
            });

            if (categories.length > 0) {
              // this cemetery has a WT category
              logDebug("getWikiIdsForBatch, categoryNamesForCemetery is:", categoryNamesForCemetery);
              if (categoryNamesForCemetery) {
                for (let location of locations) {
                  addWikiTreeCategoryIcon(location, categoryNamesForCemetery);
                }
              }
            }
          }
        } catch (error) {
          console.error("!!!!!!! WT+ API Batch fetch failed", error);
          logDebug("cemetery id string is: ", cemeteryId);
        }
      }
    }

    const fgMemorialIdsToCheck = Array.from(pendingFgMemorialIds.keys());
    let fgIdsToQuery = [];

    logDebug("getWikiIdsForPendingBatch, fgMemorialIdsToCheck is", fgMemorialIdsToCheck);

    for (let id of fgMemorialIdsToCheck) {
      if (!cachedFgMemorialIdToWtIdsMap.has(id)) {
        fgIdsToQuery.push("fgmem" + id);
      }
    }
    logDebug("getWikiIdsForPendingBatch, fgIdsToQuery is", fgIdsToQuery);

    const fgIdsString = fgIdsToQuery.join(",");

    logDebug("getWikiIdsForPendingBatch, fgIdsString is", fgIdsString);

    try {
      const response = await wtPlusApiGetProfilesUsingFgId(fgIdsString);
      logDebug("getWikiIdsForPendingBatch, response is: ", response);
      if (response.response?.memorials) {
        // record the profiles that reference the elements id for the currentBatch
        response.response.memorials.forEach((memorial) => {
          let wikiId = memorial.WikiTreeID;
          let fgMemorialId = memorial.memorial.toString();

          if (!cachedFgMemorialIdToWtIdsMap.has(fgMemorialId)) {
            cachedFgMemorialIdToWtIdsMap.set(fgMemorialId, []);
          }

          let wikiIdsForFgMemorialId = cachedFgMemorialIdToWtIdsMap.get(fgMemorialId);
          if (!wikiIdsForFgMemorialId.includes(wikiId)) {
            wikiIdsForFgMemorialId.push(wikiId);
          }
        });
      }
    } catch (error) {
      console.error("!!!!!!! WT+ API Batch fetch failed", error);
      logDebug("fgIdsString is", fgIdsString);
    }
  }

  function getFlowerWikiIdsForLocation(location) {
    let locationType = location.locationType;
    let optionKeyForOutRef = locationType.optionKeyForOutRef;

    let options = pageMods.getOptions();

    let optionKey = "ui_fg_" + optionKeyForOutRef;
    if (!options[optionKey]) {
      return;
    }

    let flowerWikiIds = [];
    if (locationType.useIdFromPageUrl) {
      // check to see if there is a flower
      let flowers = document.querySelectorAll("div.flower-list p.flower-text");
      for (let flower of flowers) {
        let flowerText = flower.textContent;
        if (flowerText) {
          const regex = /^(.+\-\d+) on WikiTree$/;
          if (regex.test(flowerText)) {
            let flowerWikiId = flowerText.replace(regex, "$1");
            if (flowerWikiId) {
              if (!flowerWikiIds.includes(flowerWikiId)) {
                flowerWikiIds.push(flowerWikiId);
              }
            }
          }
        }
      }
    }
    return flowerWikiIds;
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

    // Use WT+ API to get the WikiTree IDs that use these fsIds
    await getWikiIdsForBatch(currentBatch);

    logDebug("cachedFgMemorialIdToWtIdsMap is:", cachedFgMemorialIdToWtIdsMap);

    // Go through the locations and set the WikiIds
    if (currentBatch.locations) {
      let locations = currentBatch.locations;
      for (let location of locations) {
        logDebug("processPendingLocations, location is:", location);

        if (location.id) {
          logDebug("processPendingLocations, location.id is:", location.id);
          let wikiIds = cachedFgMemorialIdToWtIdsMap.get(location.id);
          logDebug("processPendingLocations, wikiIds is:", wikiIds);

          let flowerWikiIds = getFlowerWikiIdsForLocation(location);
          addWikiTreeIcon(location, wikiIds, flowerWikiIds);
        }
      }
    }
  }

  function extractFgIdFromLocation(location) {
    logDebug("extractFgIdFromLocation, location is:", location);

    if (location.locationType.useIdFromPageUrl) {
      logDebug("extractFgIdFromLocation, using id from page url");
      let fgIdData = pageMods.getIdDataFromUrl(document.URL);
      if (fgIdData) {
        return fgIdData;
      }
      return "";
    }

    let element = location.matchedElement;
    // We found an element that could be a place where an icon could be added
    let enclosingLinkElement = element.closest("a");
    if (enclosingLinkElement) {
      let href = enclosingLinkElement.getAttribute("href");
      if (href) {
        logDebug("extractFgIdFromLocation, using id from href", href);

        let fgIdData = pageMods.getIdDataFromUrl(href, location);
        if (fgIdData) {
          return fgIdData;
        }
      }
    } else {
      console.log("no id found for location ", location);
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

    location.iconPlaceElement = getElementToAddIconTo(location);
    if (!location.iconPlaceElement) {
      logDebug("location matched element has no iconPlaceElement", location);
      return false;
    }

    let hasIconAlready = location.iconPlaceElement.querySelector(".wt-sourcer-icon");
    if (hasIconAlready) {
      location.hasIcon = true;
      logDebug("location matched element has icon already");
      return false;
    }

    let fgIdData = extractFgIdFromLocation(location); // Helper to get ID from href or text
    logDebug("called extractFgIdFromLocation, fgIdData returned is:", fgIdData);
    if (fgIdData) {
      location.id = fgIdData.id;
      location.idType = fgIdData.idType;
    } else {
      logDebug("location matched element has no id and does not require fetch");
      return false;
    }

    pageMods.addProcessingIcon(location);
    el.dataset.wtIconProcessed = "true";

    return true;
  }

  let areOptionsForThisPageEnabled = false;

  function onMutation(options, mutations) {
    // Because FindAGrave is a Single Page Application (SPA), the URL can change
    // without a page reload. In that case the MutationObserver is still running
    if (window.sourcerWtIconsLastProcessedUrl !== document.URL) {
      window.sourcerWtIconsLastProcessedUrl = document.URL;

      pageMods.determinePageProfile(document.URL);

      let fgIdData = pageMods.getIdDataFromUrl(document.URL);
      if (fgIdData) {
        pageMods.pageId = fgIdData.id;
        pageMods.pageIdType = fgIdData.idType;
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

    //logDebug("areOptionsForThisPageEnabled is: ", areOptionsForThisPageEnabled);

    if (!pageMods.pageProfile || !areOptionsForThisPageEnabled) {
      return;
    }

    let foundNew = false;

    let candidateLocations = [];

    for (let locationType of pageMods.pageProfile.locationTypes) {
      if (pageMods.isLocationTypeEnabled(locationType)) {
        let candidateElements = document.querySelectorAll(locationType.selector);
        //logDebug("onMutation: locationType ", locationType);
        //logDebug("onMutation: candidateElements ", candidateElements);
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

    let siteConfig = {
      siteName: "fg",
      pageProfiles: pageProfiles,
      domainRegex: /^https?:\/\/(?:www\.)?findagrave\.com/,
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

  // we could wait for the document.readyState to be "complete" or listen for
  // the "load" event, but for FindAGrave that makes the icons appear very late.
  checkOptionsAndInitWtIconInjection();
}
