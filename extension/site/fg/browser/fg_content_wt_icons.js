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
      matchRegex: cemeterySearchRegex,
      locationTypes: [
        {
          locationTypeName: "pageH1",
          selector: "h1.page-title",
          useIdFromPageUrl: true,
          iconPlaceElementRule: { type: "same" },
          optionKey: "memorialShowWtIconH1",
        },
        {
          locationTypeName: "memorial",
          selector: "h2.name-grave",
          iconPlaceElementRule: { type: "same" },
          optionKey: "memorialShowWtIconH1",
        },
      ],
    },
    {
      pageType: "cemetery",
      matchRegex: cemeteryRegex,
      locationTypes: [
        {
          locationTypeName: "pageH1",
          selector: "h1.bio-name",
          useIdFromPageUrl: true,
          iconPlaceElementRule: { type: "same" },
          optionKey: "memorialShowWtIconH1",
        },
      ],
    },
    {
      pageType: "memorialSearch",
      matchRegex: memorialSearchRegex,
      locationTypes: [
        {
          locationTypeName: "memorial",
          selector: "h2.name-grave",
          iconPlaceElementRule: { type: "same" },
          optionKey: "memorialShowWtIconH1",
        },
      ],
    },
    {
      pageType: "memorial",
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
          selector: "div.data-family h3[itemprop='name']",
          optionKey: "memorialShowWtIconFamilyMember",
          // iconPlaceElementRule: { type: "closest", closestMatch: "div.member-item" },
          iconPlaceElementRule: { type: "same" },
        },
      ],
    },
  ];

  function isLocationTypeEnabled(locationType, options) {
    let optionKey = "ui_fg_" + locationType.optionKey;
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

  function wtPlusApiGetProfilesUsingFgId(idString) {
    let url = `https://plus.wikitree.com/function/wtFindAGrave4Bee/Sourcer.json?query=${idString}`;
    return wtPlusApiCall(url);
  }

  function getElementToAddIconTo(location) {
    let element = location.matchedElement;

    let locationType = location.locationType;

    if (locationType.iconPlaceElementRule) {
      let rule = locationType.iconPlaceElementRule;
      if (rule.type == "same") {
        return element;
      } else if (rule.type == "closest") {
        let closestElement = element.closest(rule.closestMatch);
        if (closestElement) {
          return closestElement;
        }
      }
    } else {
      return element;
    }
  }

  // Define  SVG icons
  const svgRefWtProcessing = `data:image/svg+xml;utf8,
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <defs>
    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgb(255, 175, 2)" />
      <stop offset="50%" stop-color="rgb(255, 210, 120)" />
      <stop offset="85%" stop-color="rgb(255, 240, 200)" stop-opacity="0.3" />
      <stop offset="100%" stop-color="rgb(255, 248, 230)" stop-opacity="0" />
    </linearGradient>
  </defs>

  <circle cx="12" cy="12" r="10.5" 
          fill="rgb(255, 248, 230)" 
          stroke="url(%23ringGradient)" 
          stroke-width="2"
          stroke-dasharray="45, 15">
    <animateTransform 
      attributeName="transform" 
      type="rotate" 
      from="0 12 12" 
      to="360 12 12" 
      dur="1.5s" 
      repeatCount="indefinite" />
  </circle>
  
  <text x="12" y="18" 
        font-family="sans-serif" 
        font-size="16px" 
        font-weight="bold" 
        fill="rgb(80, 80, 80)" 
        text-anchor="middle">
    ?
    <animate 
      attributeName="opacity" 
      values="1;0.2;1" 
      dur="1.5s" 
      repeatCount="indefinite" />
  </text>
</svg>`;

  const svgSingleRefFromWt = `data:image/svg+xml;utf8,
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

  const svgMultipleRefsFromWt = `data:image/svg+xml;utf8,
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

  const svgRefToWt = `data:image/svg+xml;utf8,
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="11" fill="%23ffaf02" stroke="white" stroke-width="1.5"/>
  
  /* Shadow Arrow */
  <path d="M1 12H16M11 8L15 12L11 16" 
        stroke="rgba(0,0,0,0.4)" 
        stroke-width="5" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        fill="none"/>
        
  /* White Arrow */
  <path d="M1 12H16M11 8L15 12L11 16" 
        stroke="white" 
        stroke-width="2.5" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        fill="none"/>
</svg>`;

  const svgRefMutual = `data:image/svg+xml;utf8,
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="11" fill="%23ffaf02" stroke="white" stroke-width="1.5"/>
  
  /* Shadow Arrow */
  <path d="M1 12H16M5 8L1 12L5 16M12 8L16 12L12 16" 
        stroke="rgba(0,0,0,0.4)" 
        stroke-width="5" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        fill="none"/>
        
  /* White Arrow */
  <path d="M1 12H16M5 8L1 12L5 16M12 8L16 12L12 16" 
        stroke="white" 
        stroke-width="2.5" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        fill="none"/>
</svg>`;

  const svgRefWtConflict = `data:image/svg+xml;utf8,
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  /* 1. Circle with Red Outline */
  <circle cx="12" cy="12" r="11" fill="rgb(255, 175, 2)" stroke="rgb(255, 0, 0)" stroke-width="2"/>
  
  /* 2. Parallel, \"Missed Connection\" Arrows (White) */
  /* Top Arrow (points Left) */
  <path d="M1 9.5H16M5 5.5L1 9.5" 
        stroke="rgb(255, 255, 255)" 
        stroke-width="2.5" 
        stroke-linecap="round" 
        fill="none"/>

  /* Bottom Arrow (points Right, Fixed: Lower-Head) */
  <path d="M1 14.5H16M12 18.5L16 14.5" 
        stroke="rgb(255, 255, 255)" 
        stroke-width="2.5" 
        stroke-linecap="round" 
        fill="none"/>
</svg>`;

  function addProcessingIcon(location) {
    logDebug("addProcessingIcon", location);

    let iconPlaceElement = location.iconPlaceElement;

    let svgIcon = svgRefWtProcessing;

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
    img.className = "wt-sourcer-processing-icon"; // Good for your MutationObserver check

    // Set initial filter
    const normalFilter = "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.15))";
    img.style.filter = normalFilter;

    img.style.marginLeft = "12px";
    iconPlaceElement.appendChild(img);
  }

  function removeProcessingIcon(location) {
    let iconPlaceElement = location.iconPlaceElement;
    let iconElement = iconPlaceElement.querySelector(".wt-sourcer-processing-icon");
    if (iconElement) {
      iconPlaceElement.removeChild(iconElement);
    }
  }

  function addWikiTreeIcon(location, wikiIds = [], flowerWikiIds = []) {
    removeProcessingIcon(location);

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

    let svgIcon = null;
    let titleText = "FindAGrave " + location.fgIdType + " " + location.fgId + " is ";

    let linkUrl = "";

    if (wikiIds.length > 1) {
      svgIcon = svgMultipleRefsFromWt;
      titleText += `referenced from ${wikiIds.length} WikiTree profiles`;

      let fgId = location.fgId;
      if (fgId) {
        let wtPlusUrl = "https://plus.wikitree.com/default.htm?report=srch1&Query=";
        if (location.fgIdType == "memorial") {
          wtPlusUrl += "FindAGrave=fgmem";
        } else {
          wtPlusUrl += "FindAGrave=fgcem";
        }
        wtPlusUrl += fgId;
        wtPlusUrl += "&render=1";
        linkUrl = wtPlusUrl;
      }
    } else if (wikiIds.length == 1) {
      svgIcon = svgSingleRefFromWt;
      titleText += `referenced from WikiTree profile: ${wikiIds[0]}`;
      linkUrl = "https://www.wikitree.com/wiki/" + wikiIds[0];
    }

    if (flowerWikiIds.length == 1) {
      if (wikiIds.length == 1) {
        titleText += ` and this memorial also uses a flower to reference WikiTree profile: ${flowerWikiIds[0]}`;
        if (wikiIds[0] == flowerWikiIds[0]) {
          svgIcon = svgRefMutual;
        } else {
          svgIcon = svgRefWtConflict;
        }
      } else if (wikiIds.length == 0) {
        svgIcon = svgRefToWt;
        titleText = `FindAGrave ${location.fgIdType} ${location.fgId} uses a flower to reference WikiTree profile: ${flowerWikiIds[0]}`;
        linkUrl = "https://www.wikitree.com/wiki/" + flowerWikiIds[0];
      } else {
        // there are multiple WT profiles referencing this memorial which in itself is an error
        // and we also reference a WT profile
        svgIcon = svgRefWtConflict;
        titleText += ` and this memorial also uses a flower to reference WikiTree profile: ${flowerWikiIds[0]}`;
      }
    } else if (flowerWikiIds.length > 1) {
      // this profile references multiple WT profiles.
      if (wikiIds.length > 0) {
        svgIcon = svgRefWtConflict;
        titleText += ` and this memorial also uses a flowers to reference multiple WikiTree profiles`;
      } else {
        svgIcon = svgRefWtConflict;
        titleText = `FindAGrave ${location.fgIdType} ${location.fgId} uses a flowers to reference multiple WikiTree profiles`;
      }
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
    if (linkUrl) {
      anchorElement.setAttribute("href", linkUrl);
    }

    anchorElement.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    anchorElement.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      event.stopImmediatePropagation();
    });

    anchorElement.target = "_blank";
    anchorElement.style.textDecoration = "none";

    anchorElement.appendChild(img);

    img.style.marginLeft = "12px";
    iconPlaceElement.appendChild(anchorElement);
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
      let fgId = location.fgId;
      let fgIdType = location.fgIdType;
      if (!fgId || !fgIdType) {
        continue;
      }

      if (fgIdType == "memorial") {
        if (!pendingFgMemorialIds.has(fgId)) {
          pendingFgMemorialIds.set(fgId, []);
        }
        pendingFgMemorialIds.get(fgId).push(location);
      } else if (fgIdType == "cemetery") {
        if (!cemeteryIds.has(fgId)) {
          cemeteryIds.set(fgId, []);
        }
        cemeteryIds.get(fgId).push(location);
      }
    }
    logDebug(`getWikiIdsForBatch, pendingFgMemorialIds is:`, pendingFgMemorialIds);
    logDebug(`getWikiIdsForBatch, cemeteryIds is:`, cemeteryIds);

    if (cemeteryIds.size > 0) {
      if (cemeteryIds.size > 1) {
        console.warn("More than one cemetery id in pending locactions, using first");
      }

      const [cemeteryId, locations] = cemeteryIds.entries().next().value;

      const fgIdToQuery = "fgcem" + cemeteryId;

      try {
        const response = await wtPlusApiGetProfilesUsingFgId(fgIdToQuery);
        logDebug("getWikiIdsForPendingBatch, cemetery response is: ", response);
        if (response.response?.memorials) {
          // record the profiles that reference the elements fgId for the currentBatch
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
            logDebug("processPendingLocations, wikiIdsForCemetery is:", wikiIdsForCemetery);
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

    const fgMemorialIdsToCheck = Array.from(pendingFgMemorialIds.keys());
    let fgIdsToQuery = [];

    logDebug("getWikiIdsForPendingBatch, fgMemorialIdsToCheck is", fgMemorialIdsToCheck);

    for (let fgId of fgMemorialIdsToCheck) {
      if (!cachedFgMemorialIdToWtIdsMap.has(fgId)) {
        fgIdsToQuery.push("fgmem" + fgId);
      }
    }
    logDebug("getWikiIdsForPendingBatch, fgIdsToQuery is", fgIdsToQuery);

    const fgIdsString = fgIdsToQuery.join(",");

    logDebug("getWikiIdsForPendingBatch, fgIdsString is", fgIdsString);

    try {
      const response = await wtPlusApiGetProfilesUsingFgId(fgIdsString);
      logDebug("getWikiIdsForPendingBatch, response is: ", response);
      if (response.response?.memorials) {
        // record the profiles that reference the elements fgId for the currentBatch
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

    let options = pageInfo.options;

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

        if (location.fgId) {
          logDebug("processPendingLocations, location.fgId is:", location.fgId);
          let wikiIds = cachedFgMemorialIdToWtIdsMap.get(location.fgId);
          logDebug("processPendingLocations, wikiIds is:", wikiIds);

          let flowerWikiIds = getFlowerWikiIdsForLocation(location);
          addWikiTreeIcon(location, wikiIds, flowerWikiIds);
        }
      }
    }
  }

  function determinePageProfile(url) {
    // Remove the start and the domain, leaving the rest of the string untouched
    const domainRegex = /^https?:\/\/(?:www\.)?findagrave\.com/;
    url = url.replace(domainRegex, "");

    for (let profile of pageProfiles) {
      if (profile.matchRegex.test(url)) {
        return profile;
      }
    }
  }

  function getFgIdDataFromUrl(url) {
    logDebug("getFgIdDataFromUrl ", url);

    // Remove the start and the domain, leaving the rest of the string untouched
    const domainRegex = /^https?:\/\/(?:www\.)?findagrave\.com/;
    url = url.replace(domainRegex, "");

    if (memorialSearchRegex.test(url)) {
      let memorialId = url.replace(memorialSearchRegex, "$1");
      logDebug("memorialId is:", memorialId);

      if (memorialId.length > 0) {
        return { fgIdType: "memorial", fgId: memorialId };
      }
    } else if (memorialRegex.test(url)) {
      let memorialId = url.replace(memorialRegex, "$1");
      logDebug("memorialId is:", memorialId);

      if (memorialId.length > 0) {
        return { fgIdType: "memorial", fgId: memorialId };
      }
    } else if (cemeterySearchRegex.test(url)) {
      let cemeteryId = url.replace(cemeterySearchRegex, "$1");
      logDebug("url is : ", url, "cemeteryId is:", cemeteryId);

      if (cemeteryId.length > 0) {
        return { fgIdType: "cemetery", fgId: cemeteryId };
      }
    } else if (cemeteryRegex.test(url)) {
      let cemeteryId = url.replace(cemeteryRegex, "$1");
      logDebug("url is : ", url, "cemeteryId is:", cemeteryId);

      if (cemeteryId.length > 0) {
        return { fgIdType: "cemetery", fgId: cemeteryId };
      }
    } else {
      console.log("getFgIdDataFromUrl no match for ", url);
    }
  }

  function extractFgIdFromLocation(location) {
    logDebug("extractFgIdFromLocation, location is:", location);

    if (location.locationType.useIdFromPageUrl) {
      logDebug("extractFgIdFromLocation, using fgId from page url");
      let fgIdData = getFgIdDataFromUrl(document.URL);
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
        logDebug("extractFgIdFromLocation, using fgId from href", href);

        let fgIdData = getFgIdDataFromUrl(href);
        if (fgIdData) {
          return fgIdData;
        }
      }
    } else {
      console.log("no fgId found for location ", location);
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
      location.fgId = fgIdData.fgId;
      location.fgIdType = fgIdData.fgIdType;
    } else {
      logDebug("location matched element has no fgId and does not require fetch");
      return false;
    }

    addProcessingIcon(location);
    el.dataset.wtIconProcessed = "true";

    return true;
  }

  let pageInfo = {};
  let areOptionsForThisPageEnabled = false;

  function onMutation(options, mutations) {
    // Because FindAGrave is a Single Page Application (SPA), the URL can change
    // without a page reload. In that case the MutationObserver is still running
    if (window.sourcerWtIconsLastProcessedUrl !== document.URL) {
      window.sourcerWtIconsLastProcessedUrl = document.URL;

      pageInfo.pageProfile = determinePageProfile(document.URL);
      let fgIdData = getFgIdDataFromUrl(document.URL);
      if (fgIdData) {
        pageInfo.fgId = fgIdData.fgId;
        pageInfo.fgIdType = fgIdData.fgIdType;
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

      // store the options in a page global so other functions can access them
      pageInfo.options = options;
    }

    //logDebug("areOptionsForThisPageEnabled is: ", areOptionsForThisPageEnabled);

    if (!pageInfo.pageProfile || !areOptionsForThisPageEnabled) {
      return;
    }

    let foundNew = false;

    let candidateLocations = [];

    for (let locationType of pageInfo.pageProfile.locationTypes) {
      if (isLocationTypeEnabled(locationType, options)) {
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

  function injectWTSourcerStyles() {
    const style = document.createElement("style");
    style.textContent = `
        /* 1. Kill outline on the FG parent when icon is clicked/focused */
        a:has(.wt-sourcer-icon:active),
        a:has(.wt-sourcer-icon:focus),
        a:has(.wt-sourcer-icon:focus-within) {
            outline: none !important;
            box-shadow: none !important;
        }

        /* 2. Kill outline on YOUR anchor element specifically */
        a:has(> .wt-sourcer-icon), 
        a:has(> .wt-sourcer-icon):focus,
        a:has(> .wt-sourcer-icon):active {
            outline: none !important;
            box-shadow: none !important;
        }

        /* 3. The "Focus-Visible" bypass */
        /* This handles the 'after-click' ring modern browsers use */
        .wt-sourcer-icon:focus-visible,
        a:has(.wt-sourcer-icon):focus-visible {
            outline: none !important;
        }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function initWtIconInjection(options) {
    // Check if we've already initialized to prevent double-observers
    if (window.hasSourcerWtIconInjectionStarted) return;

    window.hasSourcerWtIconInjectionStarted = true;

    logDebug("initWtIconInjection: document.URL is: " + document.URL);

    injectWTSourcerStyles();

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
