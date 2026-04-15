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

class WikiTreeSourcerPageModsHelper {
  constructor(siteConfig) {
    this.siteName = siteConfig.siteName;
    this.pageProfiles = siteConfig.pageProfiles;
    this.domainRegex = siteConfig.domainRegex;
    this.injectWTSourcerStyles();
  }

  setOptions(options) {
    this.options = options;
  }

  getOptions() {
    return this.options;
  }

  getOption(leafOptionName) {
    if (this.options) {
      return this.options["ui_" + this.siteName + "_" + leafOptionName];
    }
  }

  // Define  SVG icons

  static svgRefWtProcessing = `data:image/svg+xml;utf8,
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="11" fill="rgb(180, 180, 180)" stroke="rgb(130, 130, 130)" stroke-width="1.5"/>
 
  <text x="12" y="17" 
        font-family="sans-serif" 
        font-size="16px" 
        font-weight="bold" 
        fill="rgb(255, 255, 255)" 
        text-anchor="middle">
    ?
  </text>
</svg>`;

  static svgRefWtProcessingAnimated = `data:image/svg+xml;utf8,
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

  static svgSingleRefFromWt = `data:image/svg+xml;utf8,
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

  static svgMultipleRefsFromWt = `data:image/svg+xml;utf8,
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

  static svgRefToWt = `data:image/svg+xml;utf8,
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

  static svgRefMutual = `data:image/svg+xml;utf8,
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

  static svgRefWtConflict = `data:image/svg+xml;utf8,
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

  static svgRefWtCategory = `data:image/svg+xml;utf8,
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  /* 1. WikiTree Orange Circle (Thick White Outline) */
  <circle cx="12" cy="12" r="11" fill="rgb(255, 175, 2)" stroke="white" stroke-width="2"/>
  
  /* 2. Stacked Index Cards (Refined Palette) */
  <g stroke="black" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
    /* Bottom card (fill: none) */
    <path fill="none" d="M5 14.5h14v3.5H5z"/>
    
    /* Middle card (fill: Warm Cream) */
    /* This color matches the circle perimeter, effectively hiding 
       the other black lines and creating the visual 'stack'. */
    <path fill="rgb(255, 248, 230)" d="M7 10.25h14v3.5H7z"/>
    
    /* Top card (fill: none) */
    <path fill="none" d="M5 6h14v3.5H5z"/>
  </g>
</svg>`;

  static svgRefWtCategoryConflict = `data:image/svg+xml;utf8,
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  /* 1. WikiTree Orange Circle (Red and White Outlines) */
  <circle cx="12" cy="12" r="11" fill="rgb(255, 175, 2)" stroke="white" stroke-width="1.5"/>
  <circle cx="12" cy="12" r="11" fill="none" stroke="rgb(255, 0, 0)" stroke-width="2"/>
  
  /* 2. Aligned Stacked Cards (Thin Black Outline) */
  <g stroke="black" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
    /* Bottom card (Aligned with middle, Warm Cream fill) */
    <path fill="rgb(255, 248, 230)" d="M7 14.5h14v3.5H7z"/>
    
    /* Middle card (Warm Cream fill) */
    <path fill="rgb(255, 248, 230)" d="M7 10.25h14v3.5H7z"/>
    
    /* Top card (Shifted left, transparent fill) */
    <path fill="none" d="M5 6h14v3.5H5z"/>
  </g>
</svg>`;

  getIcon(iconName) {
    return WikiTreeSourcerPageModsHelper[iconName];
  }

  getProcessingIcon(useAnimation) {
    return useAnimation
      ? WikiTreeSourcerPageModsHelper.svgRefWtProcessingAnimated
      : WikiTreeSourcerPageModsHelper.svgRefWtProcessing;
  }

  addIconAtLocation(location, iconElementToAdd) {
    let iconPlaceElement = location.iconPlaceElement;

    const iconAddRule = location.locationType.iconAddRule;
    if (iconAddRule) {
      let addType = iconAddRule.type;
      if (addType == "ellipsis") {
        const container = iconPlaceElement.parentElement;

        // Set container to flex so icon stays visible next to the span
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.flexDirection = "row";
        container.style.width = "100%"; // Ensure it uses the full header width

        // Allow the name to shrink, but keep the icon fixed
        iconPlaceElement.style.flexShrink = "1";
        iconPlaceElement.style.minWidth = "0"; // Firefox requirement for flex-shrink on text

        iconElementToAdd.style.flexShrink = "0";
        iconElementToAdd.style.display = "flex";
        iconElementToAdd.style.marginLeft = "8px";

        // Append to PARENT so it's not clipped by the span
        container.appendChild(iconElementToAdd);
      } else if (addType == "makeFlexAddChild") {
        // Set container to flex so icon stays visible next to the span
        iconPlaceElement.style.display = "flex";
        iconPlaceElement.style.alignItems = "flex-start";
        iconPlaceElement.style.flexDirection = "row";

        iconElementToAdd.style.flexShrink = "0";
        iconElementToAdd.style.display = "flex";
        iconElementToAdd.style.marginLeft = "8px";

        iconPlaceElement.appendChild(iconElementToAdd);
      } else if (addType == "addFlexChild") {
        // the iconPlaceElement is a container that we want to append to
        iconElementToAdd.style.flexShrink = "0";
        iconElementToAdd.style.display = "flex";
        iconElementToAdd.style.marginLeft = "8px";

        iconPlaceElement.appendChild(iconElementToAdd);
      } else if (addType == "addChild") {
        // the iconPlaceElement is a container that we want to append to
        iconElementToAdd.style.marginLeft = "0px";
        iconPlaceElement.appendChild(iconElementToAdd);
      } else {
        console.warn("Unknown iconAddRule", iconAddRule);
      }
    } else {
      iconElementToAdd.style.marginLeft = "12px";
      iconPlaceElement.appendChild(iconElementToAdd);
    }
  }

  addProcessingIcon(location) {
    if (!this.getOption("showProcessingIcon")) {
      return;
    }
    const useAnimation = this.getOption("animateProcessingIcon");

    logDebug("addProcessingIcon", location);

    let svgIcon = this.getProcessingIcon(useAnimation);

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

    this.addIconAtLocation(location, img);
  }

  removeProcessingIcon(location) {
    if (!this.getOption("showProcessingIcon")) {
      return;
    }

    let iconPlaceElement = location.iconPlaceElement;
    if (iconPlaceElement) {
      if (iconPlaceElement.isConnected) {
        let iconElement = iconPlaceElement.querySelector(".wt-sourcer-processing-icon");
        if (iconElement && iconElement.isConnected) {
          iconPlaceElement.removeChild(iconElement);
        } else {
          // This case can happen when switching back and forth between FS pages
          // It is not really an error and can be safely ignored
          //console.warn("removeProcessingIcon: no iconElement found for location", location);
        }
      } else {
        //console.warn("removeProcessingIcon: iconPlaceElement is no longer part of the document", location);
      }
    } else {
      console.warn("removeProcessingIcon: no iconPlaceElement for location", location);
    }
  }

  wtPlusApiCall(url) {
    return new Promise((resolve, reject) => {
      if (!chrome.runtime?.id) {
        reject("Extension context invalidated");
        return;
      }
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

  injectWTSourcerStyles() {
    const style = document.createElement("style");
    style.textContent = `
        /* 1. Kill outline on the parent when icon is clicked/focused */
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

        .wt-sourcer-icon {
            cursor: context-menu; /* Signals right-click utility */
            transition: filter 0.2s ease-in-out;
        }

        /* The 'success' glow using your WikiTree Orange */
        .wt-copy-success {
            filter: drop-shadow(0 0 8px rgba(255, 175, 2, 0.9)) !important;
        }

        /* The floating 'Copied!' label */
        .wt-copy-tooltip {
            position: absolute;
            background: #333333;
            color: #ffffff;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-family: sans-serif;
            pointer-events: none;
            z-index: 2147483647; /* Max possible z-index to stay on top */
            transform: translate(-50%, -120%);
            animation: wt-fade-out 1.0s ease-in-out forwards;
        }

        @keyframes wt-fade-out {
            0% { opacity: 0; }
            15% { opacity: 1; }  /* Quick fade in */
            80% { opacity: 1; }  /* Hold visibility */
            100% { opacity: 0; } /* Fade away */
        }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  triggerCopyFeedback(element) {
    // 1. Add the glow effect
    element.classList.add("wt-copy-success");

    // 2. Create and position the tooltip
    const rect = element.getBoundingClientRect();
    const tooltip = document.createElement("div");
    tooltip.className = "wt-copy-tooltip";
    tooltip.innerText = "Copied";

    // Position it relative to the icon's current screen position
    tooltip.style.left = `${rect.left + rect.width / 2 + window.scrollX}px`;
    tooltip.style.top = `${rect.top + window.scrollY}px`;

    document.body.appendChild(tooltip);

    // 3. Clean up after the animation finishes
    setTimeout(() => {
      element.classList.remove("wt-copy-success");
      tooltip.remove();
    }, 800);
  }

  addRightClickCopyToElement(element, clipboardText) {
    if (!clipboardText) {
      return;
    }

    if (!this.getOption("rightClickCopy")) {
      return;
    }

    element.addEventListener("contextmenu", async (event) => {
      // Stop the default browser context menu from appearing
      event.preventDefault();

      try {
        // Copy to clipboard
        await navigator.clipboard.writeText(clipboardText);
        console.log(`Copied ${clipboardText} to clipboard`);

        // Optional: Provide visual feedback (like a temporary tooltip)
        this.triggerCopyFeedback(element);
      } catch (err) {
        if (err.name === "NotAllowedError") {
          console.log("Clipboard access denied. Ensure the page has focus.");
          // Optional: Show a different tooltip like "Click page first!"
          // showErrorFeedback(element, "Click page first!");
        } else {
          console.error("Failed to copy:", err);
        }
      }
    });
  }

  determinePageProfile(url) {
    // Remove the start and the domain, leaving the rest of the string untouched
    url = url.replace(this.domainRegex, "");

    for (let profile of this.pageProfiles) {
      if (profile.matchRegex.test(url)) {
        this.pageProfile = profile;
        return profile;
      }
    }
  }

  getIdDataFromUrl(url, location) {
    logDebug("getIdDataFromUrl ", url);

    // Remove the start and the domain, leaving the rest of the string untouched
    url = url.replace(this.domainRegex, "");

    for (let profile of this.pageProfiles) {
      let regex = profile.matchRegex;
      if (regex.test(url)) {
        let id = url.replace(regex, "$1");
        logDebug(`getIdDataFromUrl: profile is ${profile.pageType} id is: ${id}`);

        let idType = profile.pageType;

        if (location && location.locationType && location.locationType.locationIdType) {
          idType = location.locationType.locationIdType;
        }
        return { idType: idType, id: id };
      }
    }
  }
}
