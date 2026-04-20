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
    this.initTooltip();
    this.addGlobalShield();
    this.iconDataMap = new WeakMap(); // used to store keys in element attributes
  }

  initTooltip() {
    this.tooltip = document.createElement("div");
    this.tooltip.className = "wt-sourcer-custom-tooltip";
    // Basic styling - move specific colors/padding to your injectWTSourcerStyles
    Object.assign(this.tooltip.style, {
      position: "fixed",
      display: "none",
      zIndex: "999999",
      pointerEvents: "none", // Ensures tooltip doesn't flicker under mouse
      backgroundColor: "white",
      color: "black",
      padding: "8px",
      borderRadius: "4px",
      fontSize: "12px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
    });
    document.body.appendChild(this.tooltip);
  }

  async copyTextToClipboard(element, clipboardText) {
    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(clipboardText);
      console.log(`Copied ${clipboardText} to clipboard`);

      // Optional: Provide visual feedback (like a temporary tooltip)
      this.triggerCopyFeedback(element, "Copied");
    } catch (err) {
      if (err.name === "NotAllowedError") {
        console.log("Clipboard access denied. Ensure the page has focus.");
        this.triggerCopyFeedback(element, "Copy failed. Click in this page first.", 4000);
        // Optional: Show a different tooltip like "Click page first!"
        // showErrorFeedback(element, "Click page first!");
      } else {
        console.error("Failed to copy:", err);
      }
    }
  }

  showTooltip(clientX, clientY, iconData, isTouch) {
    const tooltipData = iconData?.tooltipData;
    //logDebug(`tooltipData is`, tooltipData);
    if (tooltipData) {
      let mainDiv = this.tooltip;

      mainDiv.replaceChildren();
      let label = document.createElement("label");
      label.textContent = tooltipData.title;
      mainDiv.appendChild(label);

      if (tooltipData.listItems.length > 0) {
        let listElement = document.createElement("ul");
        for (let listItem of tooltipData.listItems) {
          let listItemElement = document.createElement("li");
          listItemElement.textContent = listItem;
          listElement.appendChild(listItemElement);
        }
        mainDiv.appendChild(listElement);
      }

      mainDiv.style.display = "block";
      mainDiv.style.maxWidth = "500px"; // Ensure it can't grow forever

      // Force a reflow/repaint while the touch is active
      void mainDiv.offsetHeight;

      const xOffset = isTouch ? 40 : 15;
      const yOffset = isTouch ? -80 : 15;

      // Calculate potential right edge
      const screenWidth = window.innerWidth;
      const tooltipWidth = this.tooltip.offsetWidth;
      const screenHeight = window.innerHeight;
      const tooltipHeight = this.tooltip.offsetHeight;
      let left = clientX + xOffset;
      let top = clientY + yOffset;

      //logDebug(`showTooltip: screenWidth=${screenWidth}, tooltipWidth=${tooltipWidth}, left=${left}`);

      // If it overflows the right edge, flip it to the left side of the cursor
      if (left + tooltipWidth > screenWidth) {
        left = clientX - tooltipWidth - xOffset;
      }

      // If it overflows the bottom edge, flip it to the top side of the cursor
      if (top + tooltipHeight > screenHeight) {
        top = clientY - tooltipHeight - yOffset;
      }

      // Immediate positioning so it doesn't "pop" in from the corner
      mainDiv.style.left = left + "px";
      mainDiv.style.top = top + "px";
    }
  }
  hideTooltip(event, iconData) {
    //logDebug(`hiding tooltip`);
    this.tooltip.style.display = "none";
  }

  handleClickOnIcon(iconData) {
    logDebug("handleClickOnIcon: iconData is", iconData);
    if (iconData.linkUrl) {
      chrome.runtime.sendMessage({ type: "openInNewTab", url: iconData.linkUrl, tabOption: "" });
    }
  }

  handleEventOnIcon(type, e) {
    function neutralizeParentTitle(element) {
      const parentWithTitle = element.closest("[aria-haspopup='true']");
      // Don't neutralize if it's our own icon's container
      if (parentWithTitle && !parentWithTitle.classList.contains("wt-sourcer-icon-container")) {
        parentWithTitle.dataset.wtOldTitle = parentWithTitle.getAttribute("title");
        parentWithTitle.removeAttribute("title");
      }
    }

    function restoreParentTitle(element) {
      const parentWithTitle = element.closest("[aria-haspopup='true']");
      // Don't neutralize if it's our own icon's container
      if (parentWithTitle && !parentWithTitle.classList.contains("wt-sourcer-icon-container")) {
        if (parentWithTitle.dataset.wtOldTitle) {
          parentWithTitle.setAttribute("title", parentWithTitle.dataset.wtOldTitle);
          delete parentWithTitle.dataset.wtOldTitle;
        }
      }
    }

    logDebug(`Shielding ${type} from FamilySearch`);
    logDebug(`e.target is`, e.target);

    // we want to return as fast as possible if not on an interactable WT icon
    // but we already check this exists in the caller
    let iconContainer = e.target.closest(".wt-sourcer-icon-container");
    if (!iconContainer) {
      return;
    }

    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    const normalFilter = "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.15))";
    const hoverFilter = `${normalFilter} brightness(1.1)`;

    logDebug(`iconContainer is`, iconContainer);
    let iconData = this.iconDataMap.get(iconContainer);
    logDebug(`iconData is`, iconData);
    if (!iconData) {
      return;
    }

    switch (type) {
      case "mouseover": {
        // Check if this is a touch event pretending to be a mouse
        // 'ontouchstart' in window is a quick check, or check e.sourceCapabilities
        if (window.matchMedia("(pointer: coarse)").matches) {
          return; // Don't show tooltips on touch devices via hover events
        }

        // For mouseover: we also need to neutralize the parent title
        neutralizeParentTitle(iconContainer);

        this.showTooltip(e.clientX, e.clientY, iconData, false);

        let iconElement = iconContainer.querySelector(".wt-sourcer-icon");
        if (iconElement) {
          iconElement.style.filter = hoverFilter;
        }
        break;
      }
      case "mouseout": {
        restoreParentTitle(iconContainer);

        this.hideTooltip(e, iconData);

        let iconElement = iconContainer.querySelector(".wt-sourcer-icon");
        if (iconElement) {
          iconElement.style.filter = normalFilter;
        }
        break;
      }
      case "contextmenu": {
        let clipboardText = iconData?.rightClickCopyText;
        logDebug(`contextmenu event: clipboardText is ${clipboardText}`);
        if (clipboardText) {
          this.copyTextToClipboard(iconContainer, clipboardText);
        }
        break;
      }
      case "click": {
        logDebug("handleEventOnIcon: detected a click");

        if (this.wasLongPress) {
          this.wasLongPress = false;
        } else {
          this.handleClickOnIcon(iconData);
        }

        break;
      }
      case "touchstart": {
        // Extract coordinates immediately from the first touch point
        const touch = e.touches[0];
        const touchX = touch.clientX;
        const touchY = touch.clientY;

        // Start the 'Long Press' timer (typically 500ms)
        this.longPressTimer = setTimeout(() => {
          // long press in mobile shows the context menu
          this.showTooltip(touchX, touchY, iconData, true);
          this.wasLongPress = true;
        }, 500);
        break;
      }
      case "touchmove":
      case "touchcancel":
      case "touchend": {
        // If they move their finger or lift it before 500ms, cancel the long press
        if (this.longPressTimer) {
          clearTimeout(this.longPressTimer);
          this.longPressTimer = null;
        }

        if (type != "touchmove") {
          if (this.wasLongPress) {
            // Reset the flag after a short delay so the 'click' filter works
            setTimeout(() => {
              this.wasLongPress = false;
            }, 100);
          } else {
            // treat this as a click, for touch we will not
            // also get the click event because we did preventDefault on the touchStart.
            this.handleClickOnIcon(iconData);
          }
        }
        break;
      }
    }
  }

  handleTouchOutsideIconsAndTooltips() {
    // Add this to your constructor or a setup method
    document.addEventListener(
      "touchstart",
      (e) => {
        if (this.tooltip && this.tooltip.style.display === "block") {
          // Check if the tap hit the icon or the tooltip itself
          const hitUI =
            e.target.closest(".wt-sourcer-icon-container") || e.target.closest(".wt-sourcer-custom-tooltip");

          if (!hitUI) {
            this.hideTooltip();
            // Optional: clear wasLongPress so the next tap is treated fresh
            this.wasLongPress = false;
          }
        }
      },
      { capture: true, passive: true }
    );
  }

  addGlobalShield() {
    // Add these once to the window
    ["click", "mousedown", "contextmenu", "mouseover", "mouseout", "touchstart", "touchend", "touchmove"].forEach(
      (type) => {
        window.addEventListener(
          type,
          (e) => {
            // Use .closest to see if the event started inside or on your icon
            if (e.target.closest && e.target.closest(".wt-sourcer-icon-container")) {
              this.handleEventOnIcon(type, e);
            }
          },
          {
            capture: true, // // TRUE is critical - this is the Capture Phase
            passive: false, // CRITICAL: Allows e.preventDefault() to work on touch
          }
        );
      }
    );

    this.handleTouchOutsideIconsAndTooltips();
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

  buildMultipleIcon(iconConfig) {
    function styleRoundPath(color, width) {
      return `
        stroke="${color}"
        stroke-width="${width}" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        fill="none"`;
    }

    let sourceBox = "";
    let sourceArrow = "";

    if (iconConfig.includeSourceBox) {
      const shadowStyle = styleRoundPath("rgba(0,0,0,0.4)", 4);
      const mainStyle = styleRoundPath("white", 2);
      const link1Path = `d="M2 3.5 H4"`;
      const link2Path = `d="M6 3.5 H8"`;

      const linkIcon = `
        <path ${link1Path} ${shadowStyle}/>
        <path ${link1Path} ${mainStyle}/>
        <path ${link2Path} ${shadowStyle}/>
        <path ${link2Path} ${mainStyle}/>
      `;

      // Green Source Box (represents a source)
      sourceBox = `
        <rect x="8" y="1" width="8" height="7" rx="1" fill="#94d07a" stroke="black" stroke-width="0.5"/>
        <line x1="9" y1="3" x2="15" y2="3" stroke="white" stroke-width="0.5" />
        <line x1="9" y1="5" x2="13" y2="5" stroke="white" stroke-width="0.5" />
        ${linkIcon}
    `;

      // The Arrow pointing to the Source Box - only shown if there is no main arrow
      if (iconConfig.mainArrowStyle == "none") {
        const sourceArrowPath = `d="M12 18 V7 M12 7 L8 11 M12 7 L16 11"`;

        sourceArrow = `
          <path ${sourceArrowPath} ${shadowStyle}/>
          <path ${sourceArrowPath} ${mainStyle}/>
        `;
      }
    }

    // The main arrow
    let mainArrow = "";
    if (iconConfig.mainArrowStyle != "none") {
      const shadowStyle = styleRoundPath("rgba(0,0,0,0.4)", 4);
      const mainStyle = styleRoundPath("white", 2);

      const l = 2.5;
      const r = 14;
      const y = 14;
      const h = 4;

      switch (iconConfig.mainArrowStyle) {
        case "in":
          {
            const ht = y - h;
            const hb = y + h;
            const lhr = l + h;
            const stem = `M${r} ${y} H${l}`;
            const lhead = `M${l} ${y} L${lhr} ${ht} M${l} ${y} L${lhr} ${hb}`;
            const mainArrowPath = `d="${stem} ${lhead}"`;
            mainArrow = `
              <path ${mainArrowPath} ${shadowStyle}/>
              <path ${mainArrowPath} ${mainStyle}/>
            `;
          }
          break;
        case "out":
          {
            const ht = y - h;
            const hb = y + h;
            const rhr = r - h;
            const stem = `M${r} ${y} H${l}`;
            const rhead = `M${r} ${y} L${rhr} ${ht} M${r} ${y} L${rhr} ${hb}`;
            const mainArrowPath = `d="${stem} ${rhead}"`;
            mainArrow = `
              <path ${mainArrowPath} ${shadowStyle}/>
              <path ${mainArrowPath} ${mainStyle}/>
            `;
          }
          break;
        case "both":
          {
            const ht = y - h;
            const hb = y + h;
            const lhr = l + h;
            const rhr = r - h;
            const stem = `M${r} ${y} H${l}`;
            const lhead = `M${l} ${y} L${lhr} ${ht} M${l} ${y} L${lhr} ${hb}`;
            const rhead = `M${r} ${y} L${rhr} ${ht} M${r} ${y} L${rhr} ${hb}`;
            const mainArrowPath = `d="${stem} ${lhead} ${rhead}"`;
            mainArrow = `
              <path ${mainArrowPath} ${shadowStyle}/>
              <path ${mainArrowPath} ${mainStyle}/>
            `;
          }
          break;
        case "split":
          {
            const t = 12;
            const b = 16;
            const ht = t - h;
            const hb = b + h;
            const lhr = l + h;
            const rhr = r - h;
            const tstem = `M${r} ${t} H${l}`;
            const bstem = `M${r} ${b} H${l}`;
            const lhead = `M${l} ${t} L${lhr} ${ht}`;
            const rhead = `M${r} ${b} M${r} ${b} L${rhr} ${hb}`;

            const topArrowPath = `d="${tstem} ${lhead}"`;
            const bottomArrowPath = `d="${bstem} ${rhead}"`;
            mainArrow = `
              <path ${topArrowPath} ${shadowStyle}/>
              <path ${bottomArrowPath} ${shadowStyle}/>
              <path ${topArrowPath} ${mainStyle}/>
              <path ${bottomArrowPath} ${mainStyle}/>
            `;
          }
          break;
      }
    }

    let fill = `"rgb(255, 175, 2)"`;
    let stroke = `"white"`;
    if (iconConfig.isConflict) {
      stroke = `"rgb(255, 0, 0)"`;
    }
    const circleBack = `
        <circle cx="15" cy="9" r="8" fill=${fill} stroke=${stroke} stroke-width="1.5" opacity="0.6"/>
      `;
    const circleFront = `
        <circle cx="10" cy="14" r="9" fill=${fill} stroke=${stroke} stroke-width="1.5"/>
      `;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        ${circleBack}
        ${circleFront}
        ${sourceBox}
        ${sourceArrow}
        ${mainArrow}
      </svg>`;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  buildIcon(iconConfig) {
    if (iconConfig.isMultiple) {
      return this.buildMultipleIcon(iconConfig);
    }
    function styleRoundPath(color, width) {
      return `
        stroke="${color}"
        stroke-width="${width}" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        fill="none"`;
    }

    let sourceBox = "";
    let sourceArrow = "";

    if (iconConfig.includeSourceBox) {
      const shadowStyle = styleRoundPath("rgba(0,0,0,0.4)", 4);
      const mainStyle = styleRoundPath("white", 2);
      const link1Path = `d="M2 3.5 H4"`;
      const link2Path = `d="M6 3.5 H8"`;

      const linkIcon = `
        <path ${link1Path} ${shadowStyle}/>
        <path ${link1Path} ${mainStyle}/>
        <path ${link2Path} ${shadowStyle}/>
        <path ${link2Path} ${mainStyle}/>
      `;

      // Green Source Box (represents a source)
      sourceBox = `
        <rect x="8" y="1" width="8" height="7" rx="1" fill="#94d07a" stroke="black" stroke-width="0.5"/>
        <line x1="9" y1="3" x2="15" y2="3" stroke="white" stroke-width="0.5" />
        <line x1="9" y1="5" x2="13" y2="5" stroke="white" stroke-width="0.5" />
        ${linkIcon}
    `;

      // The Arrow pointing to the Source Box - only shown if there is no main arrow
      if (iconConfig.mainArrowStyle == "none") {
        const sourceArrowPath = `d="M12 18 V7 M12 7 L8 11 M12 7 L16 11"`;

        sourceArrow = `
          <path ${sourceArrowPath} ${shadowStyle}/>
          <path ${sourceArrowPath} ${mainStyle}/>
        `;
      }
    }

    let categoryGroup = "";
    if (iconConfig.includeCategory) {
      /* Stacked Index Cards  */
      categoryGroup = `
        <g stroke="black" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path fill="none" d="M 5 14.5 H 19 V 18 H 5 Z"/>
          <path fill="rgb(255, 248, 230)" d="M 7 10.25 H 21 V 13.75 H 7 Z"/>
          <path fill="none" d="M 5 6 H 19 V 9.5 H 5 Z"/>
        </g>
      `;
    }

    // The main arrow
    let mainArrow = "";
    if (iconConfig.mainArrowStyle != "none") {
      const shadowStyle = styleRoundPath("rgba(0,0,0,0.4)", 5);
      const mainStyle = styleRoundPath("white", 2.5);

      const l = 2.5;
      const r = 16;
      const y = 12;
      const h = 4;

      switch (iconConfig.mainArrowStyle) {
        case "in":
          {
            const ht = y - h;
            const hb = y + h;
            const lhr = l + h;
            const stem = `M${r} ${y} H${l}`;
            const lhead = `M${l} ${y} L${lhr} ${ht} M${l} ${y} L${lhr} ${hb}`;
            const mainArrowPath = `d="${stem} ${lhead}"`;
            mainArrow = `
              <path ${mainArrowPath} ${shadowStyle}/>
              <path ${mainArrowPath} ${mainStyle}/>
            `;
          }
          break;
        case "out":
          {
            const ht = y - h;
            const hb = y + h;
            const rhr = r - h;
            const stem = `M${r} ${y} H${l}`;
            const rhead = `M${r} ${y} L${rhr} ${ht} M${r} ${y} L${rhr} ${hb}`;
            const mainArrowPath = `d="${stem} ${rhead}"`;
            mainArrow = `
              <path ${mainArrowPath} ${shadowStyle}/>
              <path ${mainArrowPath} ${mainStyle}/>
            `;
          }
          break;
        case "both":
          {
            const ht = y - h;
            const hb = y + h;
            const lhr = l + h;
            const rhr = r - h;
            const stem = `M${r} ${y} H${l}`;
            const lhead = `M${l} ${y} L${lhr} ${ht} M${l} ${y} L${lhr} ${hb}`;
            const rhead = `M${r} ${y} L${rhr} ${ht} M${r} ${y} L${rhr} ${hb}`;
            const mainArrowPath = `d="${stem} ${lhead} ${rhead}"`;
            mainArrow = `
              <path ${mainArrowPath} ${shadowStyle}/>
              <path ${mainArrowPath} ${mainStyle}/>
            `;
          }
          break;
        case "split":
          {
            const t = 9.5;
            const b = 14.5;
            const ht = t - h;
            const hb = b + h;
            const lhr = l + h;
            const rhr = r - h;
            const tstem = `M${r} ${t} H${l}`;
            const bstem = `M${r} ${b} H${l}`;
            const lhead = `M${l} ${t} L${lhr} ${ht}`;
            const rhead = `M${r} ${b} M${r} ${b} L${rhr} ${hb}`;

            const topArrowPath = `d="${tstem} ${lhead}"`;
            const bottomArrowPath = `d="${bstem} ${rhead}"`;
            mainArrow = `
              <path ${topArrowPath} ${shadowStyle}/>
              <path ${bottomArrowPath} ${shadowStyle}/>
              <path ${topArrowPath} ${mainStyle}/>
              <path ${bottomArrowPath} ${mainStyle}/>
            `;
          }
          break;
      }
    }

    let circle = "";
    if (iconConfig.isConflict) {
      circle = `
        <circle cx="12" cy="12" r="11" fill="rgb(255, 175, 2)" stroke="rgb(255, 0, 0)" stroke-width="2"/>
      `;
    } else {
      circle = `
        <circle cx="12" cy="12" r="11" fill="#ffaf02" stroke="white" stroke-width="1.5"/>
      `;
    }

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        ${circle}
        ${sourceBox}
        ${categoryGroup}
        ${sourceArrow}
        ${mainArrow}
      </svg>`;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

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

  findExistingIconParent(location) {
    let iconPlaceElement = location.iconPlaceElement;
    if (iconPlaceElement) {
      const iconAddRule = location.locationType.iconAddRule;
      if (iconAddRule) {
        let addType = iconAddRule.type;
        if (addType == "ellipsis") {
          return iconPlaceElement.parentElement;
        } else if (addType == "makeFlexAddChild") {
          return iconPlaceElement;
        } else if (addType == "addFlexChild") {
          return iconPlaceElement;
        } else if (addType == "addChild") {
          return iconPlaceElement;
        } else {
          console.warn("Unknown iconAddRule", iconAddRule);
        }
      } else {
        return iconPlaceElement;
      }
    }
  }

  removeProcessingIcon(location) {
    if (!this.getOption("showProcessingIcon")) {
      return;
    }

    //logDebug("removeProcessingIcon, location is", location);

    let iconPlaceElement = location.iconPlaceElement;
    if (iconPlaceElement) {
      if (iconPlaceElement.isConnected) {
        let iconParent = this.findExistingIconParent(location);
        if (iconParent) {
          let iconElement = iconParent.querySelector(".wt-sourcer-processing-icon");
          if (iconElement && iconElement.isConnected) {
            iconParent.removeChild(iconElement);
          } else {
            // This case can happen when switching back and forth between FS pages
            // It is not really an error and can be safely ignored
            //console.warn("removeProcessingIcon: no iconElement found for location", location);
          }
        } else {
          console.warn("removeProcessingIcon: no iconParent for location", location);
        }
      } else {
        //console.warn("removeProcessingIcon: iconPlaceElement is no longer part of the document", location);
      }
    } else {
      console.warn("removeProcessingIcon: no iconPlaceElement for location", location);
    }
  }

  createIconElement(svgIcon) {
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

    // Set initial filter
    const normalFilter = "drop-shadow(0px 1px 1.5px rgba(0,0,0,0.15))";
    img.style.filter = normalFilter;
    return img;
  }

  createAnchorWithIconElement(svgIcon, tooltipData, clipboardText, linkUrl) {
    const img = this.createIconElement(svgIcon);

    // create an anchor-like span element
    const iconContainer = document.createElement("span");
    iconContainer.className = "wt-sourcer-icon-container";
    iconContainer.style.cursor = "pointer";
    iconContainer.style.display = "inline-block";
    iconContainer.style.lineHeight = "0"; // Prevents icon from shifting text height

    let rightClickCopyText = "";
    if (clipboardText && this.getOption("rightClickCopy")) {
      rightClickCopyText = clipboardText;
    }

    this.iconDataMap.set(iconContainer, {
      linkUrl: linkUrl,
      rightClickCopyText: rightClickCopyText,
      tooltipData: tooltipData,
    });

    iconContainer.appendChild(img);

    return iconContainer;
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

        .wt-sourcer-icon-container, 
        .wt-sourcer-icon-container * {
            /* Prevents the iOS context menu/preview on long press */
            -webkit-touch-callout: none !important;
            /* Prevents text selection which can also trigger on long press */
            -webkit-user-select: none !important;
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

        .wt-sourcer-custom-tooltip {
          position: fixed;
          display: none;
          z-index: 2147483647; /* Maximum possible z-index */
          pointer-events: none;
          background-color: #333333;
          color: #ffffff;
          padding: 10px;
          border-radius: 6px;
          font-size: 13px;
          line-height: 1.4;
          max-width: 300px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          border: 1px solid #555;
          font-family: sans-serif;
        }
        .wt-sourcer-custom-tooltip ul {
          margin: 5px 0 0 18px;
          padding: 0;
        }
        .wt-sourcer-custom-tooltip li {
          margin-bottom: 2px;
        }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  triggerCopyFeedback(element, feedbackText, timeOutMs = 800) {
    // 1. Add the glow effect
    element.classList.add("wt-copy-success");

    // 2. Create and position the tooltip
    const rect = element.getBoundingClientRect();
    const tooltip = document.createElement("div");
    tooltip.className = "wt-copy-tooltip";
    tooltip.innerText = feedbackText;

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
    //logDebug("getIdDataFromUrl ", url);

    // Remove the start and the domain, leaving the rest of the string untouched
    url = url.replace(this.domainRegex, "");

    for (let profile of this.pageProfiles) {
      let regex = profile.matchRegex;
      if (regex.test(url)) {
        let id = url.replace(regex, "$1");
        //logDebug(`getIdDataFromUrl: profile is ${profile.pageType} id is: ${id}`);

        let idType = profile.pageIdType;

        if (location && location.locationType && location.locationType.locationIdType) {
          idType = location.locationType.locationIdType;
        }
        return { idType: idType, id: id };
      }
    }
  }

  isLocationTypeEnabled(locationType) {
    if (locationType.optionKey) {
      let enabled = this.getOption(locationType.optionKey);

      if (locationType.optionKey2) {
        let enabled2 = this.getOption(locationType.optionKey2);
        if (enabled2) {
          return true;
        }
      }

      return enabled;
    } else {
      // no option key
      console.warn("locationType has no optionKey");
      return false;
    }
  }
}
