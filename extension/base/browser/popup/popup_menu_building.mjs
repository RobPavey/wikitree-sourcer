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

import { options } from "/base/browser/options/options_loader.mjs";
import { RC } from "/base/core/record_collections.mjs";
import { getLatestPersonData } from "/base/browser/popup/popup_person_data.mjs";
import { getLatestCitation } from "/base/browser/popup/popup_citation.mjs";
import { loadDataCache, cachedDataCache } from "/base/browser/common/data_cache.mjs";

import { clearAsyncResultCache } from "/base/core/async_result_cache.mjs";
import { isSafari } from "/base/browser/common/browser_check.mjs";
import { openOrShowOptionsPage } from "/base/browser/common/browser_compat.mjs";

import { clearCitation } from "/base/browser/popup/popup_citation.mjs";

import { addShowCitationAssistantMenuItem } from "/base/browser/popup/popup_menu_blocks.mjs";

/**
 * Temporary workaround for secondary monitors on MacOS where redraws don't happen
 * @See https://bugs.chromium.org/p/chromium/issues/detail?id=971701
 * https://stackoverflow.com/questions/56500742/why-is-my-google-chrome-extensions-popup-ui-laggy-on-external-monitors-but-not/64113061
 */
function macSecondMonitorWorkaround() {
  if (
    // From testing the following conditions seem to indicate that the popup was opened on a secondary monitor
    window.screenLeft < 0 ||
    window.screenTop < 0 ||
    window.screenLeft > window.screen.width ||
    window.screenTop > window.screen.height
  ) {
    chrome.runtime.getPlatformInfo(function (info) {
      if (info.os === "mac") {
        const fontFaceSheet = new CSSStyleSheet();
        fontFaceSheet.insertRule(`
          @keyframes redraw {
            0% {
              opacity: 1;
            }
            100% {
              opacity: .99;
            }
          }
        `);
        fontFaceSheet.insertRule(`
          html {
            animation: redraw 1s linear infinite;
          }
        `);
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, fontFaceSheet];
      }
    });
  }
}

// used for delayed busy message
var waitingBusyMessage1 = "";
var waitingBusyMessage2 = "";

var keyboardShortcuts = [];

function shortcutListenerFunction(e) {
  for (let shortcut of keyboardShortcuts) {
    if (e.key == shortcut.key) {
      shortcut.func();
    }
  }
}

function clearShortcuts() {
  keyboardShortcuts = [];
}

function addShortcut(key, func) {
  keyboardShortcuts.push({ key: key, func: func });
}

function emptyMenu() {
  waitingBusyMessage1 = "";
  waitingBusyMessage2 = "";

  let menuElement = document.getElementById("menu");

  while (menuElement.firstChild) {
    menuElement.removeChild(menuElement.firstChild);
  }

  // setup keyboard shortcut listener
  clearShortcuts();
  // remove any existing listener first (so a submenu doesn't have two listeners)
  document.removeEventListener("keyup", shortcutListenerFunction);
  document.addEventListener("keyup", shortcutListenerFunction);
}

var keepPopupOpen = false;
function closePopup() {
  // close the window, this is in this function so that we can have a debug option
  // to leave the popup window open so that we can use inspect to show the console.
  if (!keepPopupOpen) {
    window.close();
  }
}

async function displayUnexpectedErrorMessage(message, error, requestReport) {
  if (!message) {
    message = "Unknown error condition";
  }

  if (shouldPopupWindowResize) {
    document.body.style.width = "600px";
  }

  emptyMenu();

  let fragment = document.createDocumentFragment();

  let rowDiv = document.createElement("div");
  rowDiv.className = "messageRowDiv";
  fragment.appendChild(rowDiv);

  let imageDiv = document.createElement("div");
  imageDiv.className = "messageColumnDiv messageIconDiv";
  rowDiv.appendChild(imageDiv);

  let imagePath = "/images/warning_icon.svg";
  let image = document.createElement("img");
  image.className = "messageIconInDiv";
  image.setAttribute("src", imagePath);
  image.setAttribute("width", "30");
  image.setAttribute("height", "30");
  imageDiv.appendChild(image);

  let labelDiv = document.createElement("div");
  labelDiv.className = "messageColumnDiv messageLabelDiv";
  rowDiv.appendChild(labelDiv);

  let label1 = document.createElement("label");
  label1.className = "messageLabelInDiv";
  label1.innerText = "Unexpected error!";
  labelDiv.appendChild(label1);

  addBreak(labelDiv);

  let label2 = document.createElement("label");
  label2.className = "messageLabelInDiv";
  label2.innerText = message;
  labelDiv.appendChild(label2);

  if (error && error.stack) {
    addBreak(labelDiv);

    let label3 = document.createElement("label");
    label3.className = "messageLabelInDiv";
    label3.innerText = error.stack;
    labelDiv.appendChild(label3);
  }

  if (requestReport) {
    addBreak(labelDiv);

    let label3 = document.createElement("label");
    label3.className = "messageLabelInDiv";
    label3.innerText = "Please report this issue in a comment on the ";
    labelDiv.appendChild(label3);

    let fspLinkButton = document.createElement("button");
    fspLinkButton.className = "linkButton";
    fspLinkButton.innerText = "WikiTree Sourcer free space page";
    fspLinkButton.onclick = async function (element) {
      chrome.tabs.create({
        url: "https://www.wikitree.com/wiki/Space:WikiTree_Sourcer",
      });
      closePopup();
    };
    labelDiv.appendChild(fspLinkButton);

    let label4 = document.createElement("label");
    label4.className = "messageLabelInDiv";
    label4.innerText = " or send a private message to ";
    labelDiv.appendChild(label4);

    let robLinkButton = document.createElement("button");
    robLinkButton.className = "linkButton";
    robLinkButton.innerText = "Rob Pavey.";
    robLinkButton.onclick = async function (element) {
      chrome.tabs.create({ url: "https://www.wikitree.com/wiki/Pavey-429" });
      closePopup();
    };
    labelDiv.appendChild(robLinkButton);

    let label5 = document.createElement("label");
    label5.className = "messageLabelInDiv";
    label5.innerText =
      "Please include details of the message above, which browser/device and extension version it occurred on " +
      "and a link to the web page that it occurred on.";
    labelDiv.appendChild(label5);
  }

  try {
    let manifest = chrome.runtime.getManifest();
    if (manifest) {
      let version = manifest.version;
      if (version) {
        let versionMessage = "The extension version is " + version;

        addBreak(labelDiv);
        let label5 = document.createElement("label");
        label5.className = "messageLabelInDiv";
        label5.innerText = versionMessage;
        labelDiv.appendChild(label5);
      }
    }
  } catch (e) {}

  try {
    if (browser && browser.runtime.getBrowserInfo) {
      let browserInfo = await browser.runtime.getBrowserInfo();
      if (browserInfo) {
        let browserInfoText = JSON.stringify(browserInfo, null, 2);
        let message = "The browser info is:\n" + browserInfoText;

        addBreak(labelDiv);
        let label = document.createElement("label");
        label.className = "messageLabelInDiv";
        label.innerText = message;
        labelDiv.appendChild(label);
      }
    }
  } catch (e) {}

  try {
    let userAgentString = window.navigator.userAgent;
    if (userAgentString) {
      let message = "User Agent Info\n" + userAgentString;

      addBreak(labelDiv);
      let label = document.createElement("label");
      label.className = "messageLabelInDiv";
      label.innerText = message;
      labelDiv.appendChild(label);
    }
  } catch (e) {}

  document.getElementById("menu").appendChild(fragment);
}

async function displayMessageWithIcon(iconType, message1, message2) {
  emptyMenu();

  let fragment = document.createDocumentFragment();

  let rowDiv = document.createElement("div");
  rowDiv.className = "messageRowDiv";
  fragment.appendChild(rowDiv);

  let imageDiv = document.createElement("div");
  imageDiv.className = "messageColumnDiv messageIconDiv";
  rowDiv.appendChild(imageDiv);

  let imagePath = "/images/check_icon.svg";
  switch (iconType) {
    case "check":
      imagePath = "/images/check_icon.svg";
      break;
    case "warning":
      imagePath = "/images/warning_icon.svg";
      break;
  }

  let image = document.createElement("img");
  image.className = "messageIconInDiv";
  image.setAttribute("src", imagePath);
  image.setAttribute("width", "30");
  image.setAttribute("height", "30");
  imageDiv.appendChild(image);

  let labelDiv = document.createElement("div");
  labelDiv.className = "messageColumnDiv messageLabelDiv";
  rowDiv.appendChild(labelDiv);

  let label = document.createElement("label");
  label.className = "messageLabelInDiv";
  label.innerText = message1;
  labelDiv.appendChild(label);

  if (message2) {
    let label2 = document.createElement("label");
    label2.className = "messageLabelInDiv";
    label2.innerText = message2;
    labelDiv.appendChild(label2);
  }

  document.getElementById("menu").appendChild(fragment);
}

async function displayMessageWithIconAndWaitForContinue(iconType, message1, message2) {
  emptyMenu();

  let fragment = document.createDocumentFragment();

  let rowDiv = document.createElement("div");
  rowDiv.className = "messageRowDiv";
  fragment.appendChild(rowDiv);

  let imageDiv = document.createElement("div");
  imageDiv.className = "messageColumnDiv messageIconDiv";
  rowDiv.appendChild(imageDiv);

  let imagePath = "/images/check_icon.svg";
  switch (iconType) {
    case "check":
      imagePath = "/images/check_icon.svg";
      break;
    case "warning":
      imagePath = "/images/warning_icon.svg";
      break;
  }

  let image = document.createElement("img");
  image.className = "messageIconInDiv";
  image.setAttribute("src", imagePath);
  image.setAttribute("width", "30");
  image.setAttribute("height", "30");
  imageDiv.appendChild(image);

  let labelDiv = document.createElement("div");
  labelDiv.className = "messageColumnDiv messageLabelDiv";
  rowDiv.appendChild(labelDiv);

  let label = document.createElement("label");
  label.className = "messageLabelInDiv";
  label.innerText = message1;
  labelDiv.appendChild(label);

  // continue button
  let continueButton = document.createElement("button");
  continueButton.className = "dialogButton";
  continueButton.innerText = "Continue";
  let buttonDiv = document.createElement("div");
  buttonDiv.className = "flex-parent jc-center";
  buttonDiv.appendChild(continueButton);
  labelDiv.appendChild(buttonDiv);

  if (message2) {
    let label2 = document.createElement("label");
    label2.className = "messageLabelInDiv";
    label2.innerText = message2;
    labelDiv.appendChild(label2);
  }

  document.getElementById("menu").appendChild(fragment);

  // sometime if there is a really long messgae (like for paralell requests)
  // the popup can be scolled down when this message is displayed.
  imageDiv.scrollIntoView(true);

  return new Promise(function (resolve, reject) {
    continueButton.onclick = async function (element) {
      resolve(true);
    };
  });
}

async function displayMessage(message1, message2) {
  emptyMenu();

  let fragment = document.createDocumentFragment();

  let label = document.createElement("label");
  label.className = "messageLabel";
  label.innerText = message1;
  fragment.appendChild(label);

  if (message2) {
    let label2 = document.createElement("label");
    label2.className = "messageLabel";
    label2.innerText = message2;
    fragment.appendChild(label2);
  }

  document.getElementById("menu").appendChild(fragment);
}

async function displayBusyMessage(message1, message2) {
  let existingBusyContainer = document.getElementById("busyContainer");
  let existingSkipButton = document.getElementById("skipButton");

  if (existingBusyContainer && !existingSkipButton) {
    let messageLabel1 = document.getElementById("messageLabel1");
    let messageLabel2 = document.getElementById("messageLabel2");

    if (messageLabel1) {
      if (message1) {
        messageLabel1.innerText = message1;
      } else {
        messageLabel1.innerText = "";
      }
    }

    if (messageLabel2) {
      if (message2) {
        messageLabel2.innerText = message2;
      } else {
        messageLabel2.innerText = "";
      }
    }
    return;
  }

  emptyMenu();

  let fragment = document.createDocumentFragment();

  let busy = document.createElement("div");
  busy.id = "busyContainer";
  busy.className = "busyContainer";
  fragment.appendChild(busy);

  let loader = document.createElement("div");
  loader.className = "spinner";
  busy.appendChild(loader);

  let label = document.createElement("label");
  label.className = "messageLabel";
  label.id = "messageLabel1";
  label.innerText = message1;
  fragment.appendChild(label);

  if (message2) {
    let label2 = document.createElement("label");
    label2.className = "messageLabel";
    label2.id = "messageLabel2";
    label2.innerText = message2;
    fragment.appendChild(label2);
  }

  document.getElementById("menu").appendChild(fragment);
}

async function displayBusyMessageAfterDelay(message1, message2) {
  let existingBusyContainer = document.getElementById("busyContainer");
  if (existingBusyContainer) {
    displayBusyMessage(message1, message2);
    return;
  }

  waitingBusyMessage1 = message1;
  waitingBusyMessage2 = message2;

  function displayBusyMessageIfNotCancelled() {
    if (waitingBusyMessage1) {
      displayBusyMessage(waitingBusyMessage1, waitingBusyMessage2);
      waitingBusyMessage1 = "";
      waitingBusyMessage2 = "";
    }
  }

  setTimeout(displayBusyMessageIfNotCancelled, 100);
}

async function displayBusyMessageWithSkipButton(message1, message2, skipCallback) {
  let existingBusyContainer = document.getElementById("busyContainer");
  let existingSkipButton = document.getElementById("skipButton");
  if (existingBusyContainer && existingSkipButton) {
    let messageLabel1 = document.getElementById("messageLabel1");
    let messageLabel2 = document.getElementById("messageLabel2");

    if (messageLabel1) {
      messageLabel1.innerText = message1;
    }

    if (messageLabel2) {
      messageLabel2.innerText = message2;
    }

    existingSkipButton.onclick = async function (element) {
      skipCallback();
    };

    return;
  }

  emptyMenu();

  let fragment = document.createDocumentFragment();

  let busy = document.createElement("div");
  busy.id = "busyContainer";
  busy.className = "busyContainer";
  fragment.appendChild(busy);

  let loader = document.createElement("div");
  loader.className = "spinner";
  busy.appendChild(loader);

  let label = document.createElement("label");
  label.className = "messageLabel";
  label.id = "messageLabel1";
  label.innerText = message1;
  fragment.appendChild(label);

  // skip button
  let skipButton = document.createElement("button");
  skipButton.id = "skipButton";
  skipButton.className = "dialogButton";
  skipButton.innerText = "Skip";
  let buttonDiv = document.createElement("div");
  buttonDiv.className = "flex-parent jc-center";
  buttonDiv.appendChild(skipButton);
  fragment.appendChild(buttonDiv);
  skipButton.onclick = async function (element) {
    skipCallback();
  };

  if (message2) {
    let label2 = document.createElement("label");
    label2.className = "messageLabel";
    label2.id = "messageLabel2";
    label2.innerText = message2;
    fragment.appendChild(label2);
  }

  document.getElementById("menu").appendChild(fragment);
}

async function displayMessageThenClosePopup(message1, message2) {
  displayMessage(message1, message2);

  setTimeout(function () {
    closePopup();
  }, 1500);
}

async function displayMessageWithIconThenClosePopup(iconType, message1, message2) {
  displayMessageWithIcon(iconType, message1, message2);

  let messageLength = message1.length;
  if (message2) {
    messageLength += message2.length;
  }

  let timeoutMs = 10 * 1000;
  if (messageLength > 200) {
    timeoutMs = 30 * 1000;
  }
  if (messageLength > 500) {
    timeoutMs = 120 * 1000;
  }

  setTimeout(function () {
    closePopup();
  }, timeoutMs);
}

function addMenuTitle(menu) {
  // create a list item and add it to the list
  let listItem = document.createElement("li");
  listItem.className = "menuItem";

  let label = document.createElement("div");
  label.className = "menuTitle";
  label.innerText = "WikiTree Sourcer";
  listItem.appendChild(label);

  let sup = document.createElement("sup");
  sup.innerText = "\u00A0[1]";
  label.appendChild(sup);

  menu.list.appendChild(listItem);
}

function beginMainMenu() {
  emptyMenu();

  let fragment = document.createDocumentFragment();
  let list = document.createElement("ul");
  list.className = "list";
  fragment.appendChild(list);

  let menu = {
    fragment: fragment,
    list: list,
    dividerOnNext: false,
    numNavItems: 0,
  };

  addMenuTitle(menu);

  return menu;
}

function endMainMenu(menu) {
  let menuElement = document.getElementById("menu");
  if (!menuElement || !menu.fragment || !menu.list) {
    return;
  }

  // by default the Search menu items will be first and the total menu length could be over limit.
  let ulElement = menu.list;

  // minus one because there is a title.
  let numListElements = ulElement.childElementCount - 1;

  if (numListElements == 0) {
    return;
  }

  // check if this is the top-level menu. We only want to restrict size in that case.
  // We don't currently have a flag for this. So check for the presence of the edit citation
  // menu item.
  let editCitationElement = undefined;
  for (let listItem of ulElement.children) {
    let firstButton = listItem.querySelector("button.menuButton");
    if (!firstButton) {
      continue;
    }
    let title = firstButton.textContent;
    if (title.startsWith("Edit Citation...")) {
      editCitationElement = listItem;
    }
  }
  let isTopLevelMenu = editCitationElement ? true : false;

  // We only want to prune or reorder the search menu items on the main menu
  // strangely, when on an unrecognized site, options is undefined
  if (isTopLevelMenu && options) {
    let maxItems = Number(options.search_general_popup_maxTotalItemsInTopMenu);

    let searchLocation = options.search_general_popup_searchMenuItemsLocation;

    if (numListElements > maxItems || searchLocation == "after") {
      // count the search menu items
      let numSearchMenuItems = 0;
      let hasShowAll = false;
      let hasOnlySearchSubmenu = false;
      for (let listItem of ulElement.children) {
        let firstButton = listItem.querySelector("button.menuButton");
        if (!firstButton) {
          continue;
        }
        let title = firstButton.textContent;
        if (title.startsWith("Search ")) {
          numSearchMenuItems++;
        }
        if (title.startsWith("Show All Search Sites")) {
          hasShowAll = true;
        }
        if (title.startsWith("Search...")) {
          hasOnlySearchSubmenu = true;
        }
      }

      //console.log("numSearchMenuItems = " + numSearchMenuItems);
      //console.log("hasShowAll = " + hasShowAll);
      //console.log("hasOnlySearchSubmenu = " + hasOnlySearchSubmenu);

      if (hasOnlySearchSubmenu && numSearchMenuItems > 0) {
        return; // should never happen
      }

      if (searchLocation == "after") {
        // remove all the search elements from the array
        let removedElements = [];
        let copyOfChildren = [...ulElement.children];
        for (let listItem of copyOfChildren) {
          let firstButton = listItem.querySelector("button.menuButton");
          if (!firstButton) {
            continue;
          }

          let title = firstButton.textContent;
          if (
            title.startsWith("Search ") ||
            title.startsWith("Show All Search Sites") ||
            title.startsWith("Search...")
          ) {
            removedElements.push(listItem);
            ulElement.removeChild(listItem);
          }
        }

        let numSearchSiteItemsToAdd = numSearchMenuItems;
        if (numListElements > maxItems) {
          // we want to remove some search elements
          let searchItemsToRemove = numListElements - maxItems;
          if (searchItemsToRemove >= numSearchSiteItemsToAdd) {
            numSearchSiteItemsToAdd = 0;
          } else {
            numSearchSiteItemsToAdd -= searchItemsToRemove;
          }
        }

        //console.log("numSearchSiteItemsToAdd = " + numSearchSiteItemsToAdd);

        let isFirstSearchElement = true;
        for (let searchItem of removedElements) {
          if (isFirstSearchElement) {
            if (!searchItem.classList.contains("dividerAbove")) {
              searchItem.classList.add("dividerAbove");
            }
            isFirstSearchElement = false;
          }
          let firstButton = searchItem.querySelector("button.menuButton");
          if (!firstButton) {
            continue;
          }

          let title = firstButton.textContent;

          let addItem = true;
          if (title.startsWith("Search ")) {
            if (numSearchSiteItemsToAdd > 0) {
              numSearchSiteItemsToAdd--;
            } else {
              addItem = false;
            }
          }

          if (addItem) {
            ulElement.insertBefore(searchItem, editCitationElement);
          }
        }
      } else {
        // search menu items are vefore the other site specific menu action items
        // so we don't need to move anything. Just remove extra search menu items.
        let numSearchSiteItemsToAdd = numSearchMenuItems;
        if (numListElements > maxItems) {
          // we want to remove some search elements
          let searchItemsToRemove = numListElements - maxItems;
          if (searchItemsToRemove >= numSearchSiteItemsToAdd) {
            numSearchSiteItemsToAdd = 0;
          } else {
            numSearchSiteItemsToAdd -= searchItemsToRemove;
          }
        }

        let copyOfChildren = [...ulElement.children];
        for (let listItem of copyOfChildren) {
          let firstButton = listItem.querySelector("button.menuButton");
          if (!firstButton) {
            continue;
          }

          let title = firstButton.textContent;
          if (title.startsWith("Search ")) {
            if (numSearchSiteItemsToAdd > 0) {
              numSearchSiteItemsToAdd--;
            } else {
              ulElement.removeChild(listItem);
            }
          }
        }
      }
    }
  }

  menuElement.appendChild(menu.fragment);
}

function addMenuDivider(menu) {
  menu.dividerOnNext = true;
}

function setMenuItemClassName(menu, element, mainClassName) {
  if (menu.dividerOnNext) {
    menu.dividerOnNext = false;
    if (mainClassName) {
      element.className = mainClassName + " dividerAbove";
    } else {
      element.className = "dividerAbove";
    }
  } else {
    element.className = mainClassName;
  }
}

async function openExceptionPage(message, input, error, requestReport) {
  displayBusyMessage("An error occurred. Gathering more debug information ...");

  let errorName = "";
  let errorMessage = "";
  let errorStack = "";
  if (error) {
    errorName = error.name;
    errorMessage = error.message;
    errorStack = error.stack;
  }

  if (!isSafari()) {
    chrome.runtime.sendMessage(
      {
        type: "exception",
        message: message,
        input: input,
        errorName: errorName,
        errorMessage: errorMessage,
        errorStack: errorStack,
        requestReport: requestReport,
      },
      function (response) {
        // We get a detailed response for debugging this
        //console.log("openExceptionPage got response: ");
        //console.log(response);

        if (!response || !response.success) {
          // Note: In Safari it seems unable to send a message to the exception tab after
          // opening it. So report in popup instead.
          displayUnexpectedErrorMessage(message, error, requestReport);
        }
      }
    );
  } else {
    // if Safari starts working with the exception page this can be removed
    displayUnexpectedErrorMessage(message, error, requestReport);
  }
}

async function doAsyncActionWithCatch(actionText, input, actionFunc) {
  if (actionText) {
    displayBusyMessage(actionText + " ...");
  }
  try {
    await actionFunc();
  } catch (error) {
    console.log("Error:", error.stack);
    displayMessageWithIcon("warning", "An error occurred during " + actionText, error.stack);

    let message = "Error while " + actionText;
    openExceptionPage(message, input, error, true);
  }
}

function addBreak(element) {
  element.appendChild(document.createElement("br"));
}

function addMenuItem(menu, innerText, onclick, shortcut) {
  // create a list item and add it to the list
  let listItem = document.createElement("li");
  setMenuItemClassName(menu, listItem, "menuItem");
  //listItem.innerText = innerText;
  //listItem.onclick = onclick;

  if (shortcut) {
    innerText = innerText + " [" + shortcut + "]";
  }

  let button = document.createElement("button");
  button.className = "menuButton";
  button.onclick = onclick;
  button.innerText = innerText;
  button.setAttribute("aria-keyshortcuts", shortcut);
  listItem.appendChild(button);

  menu.list.appendChild(listItem);

  if (shortcut) {
    addShortcut(shortcut, onclick);
  }
}

function addMenuItemWithSubtitle(menu, innerText, onclick, subTitleText) {
  // create a list item and add it to the list
  let listItem = document.createElement("li");
  setMenuItemClassName(menu, listItem, "menuItem");
  //listItem.innerText = innerText;
  //listItem.onclick = onclick;

  let button = document.createElement("button");
  button.className = "menuButton";
  button.onclick = onclick;
  button.innerText = innerText;

  addBreak(button);

  let italicElement = document.createElement("i");
  italicElement.innerText = subTitleText;
  italicElement.className = "menuButtonSubtitle";
  button.appendChild(italicElement);

  listItem.appendChild(button);

  menu.list.appendChild(listItem);
}

function addMenuItemWithSubMenu(menu, innerText, onclick, onSubMenuClick) {
  // create a list item and add it to the list
  let listItem = document.createElement("li");
  setMenuItemClassName(menu, listItem, "menuItemWithSubMenu");
  menu.list.appendChild(listItem);

  let rowDiv = document.createElement("div");
  rowDiv.className = "menuRowDiv";
  listItem.appendChild(rowDiv);

  let imageDiv = document.createElement("div");
  imageDiv.className = "menuColumnDiv menuLeftDiv";

  let leftButton = document.createElement("button");
  leftButton.className = "menuButton";
  leftButton.onclick = onclick;
  leftButton.innerText = innerText;
  imageDiv.appendChild(leftButton);

  rowDiv.appendChild(imageDiv);

  let labelDiv = document.createElement("div");
  labelDiv.className = "menuColumnDiv menuRightDiv";

  let rightButton = document.createElement("button");
  rightButton.className = "menuButton";
  rightButton.onclick = onSubMenuClick;
  rightButton.innerText = ">";
  labelDiv.appendChild(rightButton);

  rowDiv.appendChild(labelDiv);
}

function addItalicMessageMenuItem(menu, message, additionalClassNames) {
  // create a list item and add it to the list
  let listItem = document.createElement("li");
  setMenuItemClassName(menu, listItem);
  let italicElement = document.createElement("i");
  italicElement.className = "messageLabel";
  if (additionalClassNames) {
    italicElement.className += " " + additionalClassNames;
  }
  italicElement.innerText = message;
  listItem.appendChild(italicElement);
  menu.list.appendChild(listItem);
}

function addMessageMenuItem(menu, message) {
  // create a list item and add it to the list
  let listItem = document.createElement("li");
  setMenuItemClassName(menu, listItem);
  listItem.innerText = message;
  menu.list.appendChild(listItem);
}

function addOptionsMenuItem(menu) {
  addMenuItem(menu, "Options... (opens in new tab)", function (element) {
    openOrShowOptionsPage();
    closePopup();
  });
}

function addHelpMenuItem(menu, data, backFunction) {
  addMenuItem(menu, "Help...", function (element) {
    setupHelpSubmenuMenu(data, backFunction);
  });
}

function addBuyMeACoffeeMenuItem(menu) {
  if (isSafari()) {
    return; // no donations on Safari version
  }

  addMenuItem(menu, "Buy me a coffee...", function (element) {
    chrome.tabs.create({ url: "https://www.buymeacoffee.com/RobPavey" });
    closePopup();
  });
}

function addBackMenuItem(menu, backFunction) {
  // create a list item and add it to the list
  let listItem = document.createElement("li");
  listItem.className = "menuItem dividerBelow";

  let button = document.createElement("button");
  button.className = "menuButton";
  button.onclick = function (element) {
    backFunction();
  };
  button.innerText = "< Back";
  listItem.appendChild(button);

  menu.list.appendChild(listItem);
}

function hasBirthOrDeathYear(data) {
  let birthYear = data.generalizedData.inferBirthYear();
  let deathYear = data.generalizedData.inferDeathYear();
  return birthYear != "" || deathYear == "";
}

function isManualClassificationNeeded(data) {
  let result = {
    isRefTitleNeeded: false,
    isRecordTypeNeeded: false,
    isRecordTypeNeededForNarrative: false,
  };

  // Note that we can't use RT.Unclassified because the RecordType module is not loaded.
  if (data.generalizedData.recordType == `Unclassified`) {
    result.isRecordTypeNeededForNarrative = true;

    if (options.citation_general_meaningfulNames != "none") {
      result.isRefTitleNeeded = true;
    }

    if (data.generalizedData.sourceOfData == "ancestry") {
      if (options.citation_ancestry_dataStyle == "string") {
        result.isRecordTypeNeeded = true;
      }
    } else if (data.generalizedData.sourceOfData == "fmp") {
      if (options.citation_fmp_dataStyle == "string") {
        result.isRecordTypeNeeded = true;
      }
    } else if (data.generalizedData.sourceOfData == "fs") {
      if (options.citation_fs_dataStyle == "string") {
        result.isRecordTypeNeeded = true;
      }
    } else if (
      data.generalizedData.sourceOfData == "openarch" ||
      data.generalizedData.sourceOfData == "wiewaswie" ||
      data.generalizedData.sourceOfData == "noda"
    ) {
      result.isRecordTypeNeeded = true;
    }
  }

  return result;
}

function getBuildCitationMenuTextForType(type) {
  let target = options.citation_general_target;

  let menuText = "";
  if (target == "wikitree") {
    if (type == "inline") {
      menuText = "Build Inline Citation";
    } else if (type == "narrative") {
      menuText = "Build Narrative with Citation";
    } else if (type == "source") {
      menuText = "Build Source Citation";
    }
  } else {
    if (type == "inline") {
      menuText = "Build Plain Text Citation";
    } else if (type == "narrative") {
      menuText = "Build Narrative";
    }
  }

  return menuText;
}

function getBuildCitationShortcutForType(type) {
  let target = options.citation_general_target;

  let shortcut = "";
  if (target == "wikitree") {
    if (type == "inline") {
      shortcut = "i";
    } else if (type == "narrative") {
      shortcut = "n";
    } else if (type == "source") {
      shortcut = "s";
    }
  } else if (target == "plain") {
    if (type == "inline") {
      shortcut = "c";
    } else if (type == "narrative") {
      shortcut = "n";
    }
  }

  return shortcut;
}

function setupBuildCitationSubMenuForRequestedUserInput(
  data,
  buildFunction,
  backFunction,
  regeneralizeFunction,
  userInputFunction,
  partialResultData,
  focusElementId
) {
  async function rebuild(existingFocusElementId) {
    // we rebuild the menu but try to keep the focus element the same.
    // We use a timeout because when you type in a text field and then press tab or
    // click in another text field, the change event is called before the document
    // active element changes
    setTimeout(function () {
      let focusElementId = existingFocusElementId;

      let activeElement = document.activeElement;

      if (activeElement) {
        focusElementId = activeElement.id;
      }

      setupBuildCitationSubMenuForRequestedUserInput(
        data,
        buildFunction,
        backFunction,
        regeneralizeFunction,
        userInputFunction,
        resultData,
        focusElementId
      );
    }, 1);
  }

  let menu = beginMainMenu();
  addBackMenuItem(menu, backFunction);

  let gd = data.generalizedData;

  let input = {
    type: data.type,
    extractedData: data.extractedData,
    generalizedData: gd,
    newData: partialResultData,
    options: options,
  };
  let requestedUserInput = userInputFunction(input);

  let resultData = requestedUserInput.resultData;

  function addLabelField(field) {
    let label = document.createElement("label");
    label.className = "dialogInput";
    label.appendChild(document.createTextNode(field.label));
    let div = document.createElement("div");
    div.className = "dialogLine";
    div.appendChild(label);

    menu.list.appendChild(div);

    return label;
  }

  function addSelectField(field) {
    let selector = document.createElement("select");
    selector.id = field.id;
    selector.className = "dialogSelector";

    for (const option of field.options) {
      let optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.text = option.text;
      selector.appendChild(optionElement);
    }

    if (resultData[field.property]) {
      selector.value = resultData[field.property];
    } else if (field.defaultValue) {
      selector.value = field.defaultValue;
    }

    selector.addEventListener("change", function (event) {
      let changed = resultData[field.property] != event.target.value;
      resultData[field.property] = event.target.value;
      if (changed && field.requiresRebuild) {
        rebuild(selector.id);
      }
    });

    let label = document.createElement("label");
    label.className = "dialogInput";
    label.appendChild(document.createTextNode(field.label));
    addBreak(label);
    label.appendChild(selector);
    let div = document.createElement("div");
    div.className = "dialogLine";
    div.appendChild(label);

    menu.list.appendChild(div);

    return selector;
  }

  function addTextInputField(field) {
    let textInput = document.createElement("input");
    textInput.type = "text";
    textInput.id = field.id;
    textInput.className = "dialogTextInput";

    if (resultData[field.property]) {
      textInput.value = resultData[field.property];
    } else if (field.defaultValue) {
      textInput.value = field.defaultValue;
    }

    textInput.addEventListener("change", function (event) {
      let changed = resultData[field.property] != event.target.value;
      resultData[field.property] = event.target.value;
      if (changed && field.requiresRebuild) {
        rebuild(textInput.id);
      }
    });
    let label = document.createElement("label");
    label.className = "dialogInput";
    label.appendChild(document.createTextNode(field.label));
    if (field.comment) {
      //addBreak(label);
      let commmentlabel = document.createElement("label");
      commmentlabel.className = "dialogInputComment";
      commmentlabel.appendChild(document.createTextNode(field.comment));
      label.appendChild(commmentlabel);
    }
    addBreak(label);
    label.appendChild(textInput);
    let div = document.createElement("div");
    div.className = "dialogLine";
    div.appendChild(label);

    menu.list.appendChild(div);

    return textInput;
  }

  function addField(field) {
    if (field.type == "label") {
      addLabelField(field);
    } else if (field.type == "select") {
      addSelectField(field);
    } else if (field.type == "textInput") {
      addTextInputField(field);
    }
  }

  for (let field of requestedUserInput.fields) {
    if (!field.hidden) {
      addField(field);
    }
  }

  // final button
  let buttonText = getBuildCitationMenuTextForType(data.type);
  let button = document.createElement("button");
  button.className = "dialogButton";
  button.innerText = buttonText;
  button.onclick = function (element) {
    if (regeneralizeFunction) {
      let input = { extractedData: data.extractedData, generalizedData: gd, newData: resultData };
      regeneralizeFunction(input);
    }

    buildFunction(data);
  };
  menu.list.appendChild(button);

  endMainMenu(menu);

  if (focusElementId) {
    let focusElement = document.getElementById(focusElementId);
    if (focusElement) {
      focusElement.focus();
    }
  }
}

function setupBuildCitationSubMenu(
  data,
  manualClassification,
  buildFunction,
  backFunction,
  regeneralizeFunction,
  userInputFunction
) {
  clearCitation();

  if (userInputFunction) {
    setupBuildCitationSubMenuForRequestedUserInput(
      data,
      buildFunction,
      backFunction,
      regeneralizeFunction,
      userInputFunction
    );
    return;
  }

  let needsRecordType =
    manualClassification.isRecordTypeNeeded ||
    (manualClassification.isRecordTypeNeededForNarrative && data.type == "narrative");
  let needsRefTitle = manualClassification.isRefTitleNeeded;

  // This is used for submenu list - it is not as advanced as GeneraizedData.getRefTitle.
  // This isn't alphabetical order
  const rtToRefTitle = {
    Unclassified: `Unknown`,
    Apprenticeship: `Apprenticeship`,
    Baptism: `Baptism`,
    Birth: `Birth`,
    BirthRegistration: `Birth Registration`,
    Book: `Book`,
    Burial: `Burial`,
    Certificate: `Certificate`,
    Census: `Census`,
    ConvictTransportation: `Convict Transportation`,
    CrewList: `Crew List`,
    CriminalRegister: `Criminal Register`,
    Death: `Death`,
    DeathRegistration: `Death Registration`,
    Deed: `Deed`,
    Diary: `Diary`,
    Directory: `Directory`,
    Divorce: `Divorce`,
    ElectoralRegister: `Electoral Register`,
    Encyclopedia: `Encyclopedia`,
    Employment: `Employment`,
    FamHistOrPedigree: `Family History Or Pedigree`,
    FamilyTree: `FamilyTree`,
    FreemasonMembership: `Freemason Membership`,
    GovernmentDocument: `Government Document`,
    Heraldry: `Heraldic Record`,
    Immigration: `Immigration`,
    Imprisonment: `Imprisonment`,
    Inquest: `Inquest`,
    InstitutionInmate: `InstitutionInmate`,
    LandAssessment: `Land Assessment`,
    LandTax: `Land Tax`,
    LandPetition: `Land Petition`,
    LandGrant: `Land Grant`,
    LegalRecord: `Legal Record`,
    Marriage: `Marriage`,
    MarriageRegistration: `Marriage Registration`,
    MedicalPatient: `Medical Patient`,
    MetisScrip: `MetisScrip`,
    Military: `Military`,
    Naturalization: `Naturalization`,
    Newspaper: `Newspaper`,
    NonpopulationCensus: `Nonpopulation Census`,
    Obituary: `Obituary`,
    OtherChurchEvent: `Other Church Event`,
    ChurchRecords: `Church Records`,
    PassengerList: `Passenger List`,
    PassportApplication: `Passport Application`,
    Pension: `Pension`,
    PopulationRegister: `Population Register`,
    Probate: `Probate`,
    QuarterSession: `Quarter Session`,
    RateBook: `Rate Book`,
    Residence: `Residence`,
    SchoolRecords: `School Records`,
    SlaveSchedule: `Slave Schedule`,
    SocialSecurity: `Social Security`,
    Tax: `Tax`,
    Will: `Will`,
    WorkhouseRecord: `Workhouse Record`,
  };

  let menu = beginMainMenu();
  addBackMenuItem(menu, backFunction);

  let gd = data.generalizedData;

  let recordType = data.recordType;
  let refTitle = "";

  let textInputField = undefined;

  function fillRecordTypeSelector(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }

    const keys = Object.keys(rtToRefTitle);
    for (const key of keys) {
      let option = document.createElement("option");
      option.value = key;
      option.text = rtToRefTitle[key];
      selector.appendChild(option);
    }
  }

  function addSelector(id, labelText, fillFunction, changeFunction) {
    let selector = document.createElement("select");
    selector.id = id;
    selector.className = "dialogSelector";
    fillFunction(selector);
    selector.addEventListener("change", changeFunction);
    let label = document.createElement("label");
    label.className = "dialogInput";
    label.appendChild(document.createTextNode(labelText));
    addBreak(label);
    label.appendChild(selector);
    menu.list.appendChild(label);

    return selector;
  }

  function addTextInput(id, labelText, changeFunction) {
    let textInput = document.createElement("input");
    textInput.type = "text";
    textInput.id = id;
    textInput.className = "dialogTextInput";
    textInput.addEventListener("change", changeFunction);
    let label = document.createElement("label");
    label.className = "dialogInput";
    label.appendChild(document.createTextNode(labelText));
    addBreak(label);
    label.appendChild(textInput);
    menu.list.appendChild(label);

    return textInput;
  }

  // Explanation
  let reasonLabel = document.createElement("label");
  reasonLabel.className = "dialogInput";
  reasonLabel.appendChild(document.createTextNode("Could not identify the record type."));
  menu.list.appendChild(reasonLabel);

  if (needsRecordType) {
    addBreak(menu.list);
    addBreak(menu.list);

    // Record Type
    let recordTypeSelector = addSelector(
      "recordTypeSelector",
      "Choose record type: ",
      fillRecordTypeSelector,
      function (event) {
        recordType = event.target.value;
        //console.log("set record type to: " + recordType);
        // set ref title
        if (recordType == "Unclassified") {
          refTitle = "";
        } else {
          refTitle = rtToRefTitle[recordType];
        }
        if (textInputField) {
          textInputField.value = refTitle;
        }
      }
    );
  }

  if (needsRefTitle) {
    addBreak(menu.list);
    addBreak(menu.list);

    // text input
    textInputField = addTextInput("refTitleInput", "Choose label: ", function (event) {
      refTitle = event.target.value;
      //console.log("set ref title to: " + refTitle);
    });
  }

  // final button
  let buttonText = getBuildCitationMenuTextForType(data.type);

  addBreak(menu.list);
  addBreak(menu.list);

  let button = document.createElement("button");
  button.className = "dialogButton";
  button.innerText = buttonText;
  button.onclick = function (element) {
    //console.log("record type is: " + recordType);
    gd.recordType = recordType;
    if (refTitle) {
      gd.overrideRefTitle = refTitle;
    }

    if (recordType && regeneralizeFunction) {
      regeneralizeFunction(data.extractedData, gd);
    }

    buildFunction(data);
  };
  menu.list.appendChild(button);

  endMainMenu(menu);
}

function setupOtherBuildCitationItemsSubMenu(
  data,
  manualClassification,
  buildFunction,
  type,
  backFunction,
  regeneralizeFunction,
  userInputFunction
) {
  let menu = beginMainMenu();
  addBackMenuItem(menu, backFunction);

  if (type != "inline") {
    addBuildCitationMenuItem(
      menu,
      data,
      manualClassification,
      buildFunction,
      "inline",
      backFunction,
      regeneralizeFunction,
      userInputFunction
    );
  }
  if (type != "narrative") {
    addBuildCitationMenuItem(
      menu,
      data,
      manualClassification,
      buildFunction,
      "narrative",
      backFunction,
      regeneralizeFunction,
      userInputFunction
    );
  }
  if (type != "source") {
    addBuildCitationMenuItem(
      menu,
      data,
      manualClassification,
      buildFunction,
      "source",
      backFunction,
      regeneralizeFunction,
      userInputFunction
    );
  }

  endMainMenu(menu);
}

function addBuildCitationMenuItem(
  menu,
  data,
  manualClassification,
  buildFunction,
  type,
  backFunction,
  regeneralizeFunction,
  userInputFunction,
  othersOnSubmenu = false
) {
  let suffix = "";
  if (regeneralizeFunction) {
    if (userInputFunction) {
      suffix = "...";
    } else {
      if (type == "narrative") {
        if (manualClassification.isRecordTypeNeededForNarrative || manualClassification.isRefTitleNeeded) {
          suffix = "...";
        }
      } else {
        if (manualClassification.isRecordTypeNeeded || manualClassification.isRefTitleNeeded) {
          suffix = "...";
        }
      }
    }
  }

  let menuText = getBuildCitationMenuTextForType(type);
  let shortcut = getBuildCitationShortcutForType(type);

  if (!menuText) {
    return;
  }

  let shortCutOption = options.citation_general_addShortcuts;
  if (!shortCutOption) {
    shortcut = "";
  }

  menuText = menuText + suffix;

  // This is a bit hacky. We don't want to change the input data object but we need a different type in
  // the one for each menu item
  let input = Object.assign({}, data);
  input.type = type;

  let rightArrowClickFunction = function (element) {
    setupOtherBuildCitationItemsSubMenu(
      data,
      manualClassification,
      buildFunction,
      type,
      backFunction,
      regeneralizeFunction,
      userInputFunction
    );
  };

  let suffixClickFunction = function (element) {
    setupBuildCitationSubMenu(
      input,
      manualClassification,
      buildFunction,
      backFunction,
      regeneralizeFunction,
      userInputFunction
    );
  };

  let simpleBuildClickFunction = function (element) {
    displayBusyMessage("Building citation...");
    buildFunction(input);
  };

  let mainClickFunction = suffix ? suffixClickFunction : simpleBuildClickFunction;

  if (othersOnSubmenu) {
    addMenuItemWithSubMenu(menu, menuText, mainClickFunction, rightArrowClickFunction);
  } else {
    addMenuItem(menu, menuText, mainClickFunction, shortcut);
  }
}

function addBuildCitationMenuItems(menu, data, buildFunction, backFunction, regeneralizeFunction, userInputFunction) {
  let gd = data.generalizedData;
  if (gd.sourceType && !(gd.sourceType == "record" || gd.sourceType == "image")) {
    addShowCitationAssistantMenuItem(menu);
    return;
  }

  let manualClassification = isManualClassificationNeeded(data);

  let othersOnSubmenu = false;
  let menuItemsOption = options.citation_general_popupCitationMenuItems;
  if (menuItemsOption != "all") {
    othersOnSubmenu = true;
  }

  let typeStrings = ["inline", "narrative", "source"];
  if (gd.sourceType == "image") {
    typeStrings = ["inline", "source"];
  }
  for (let typeString of typeStrings) {
    if (menuItemsOption == "all" || menuItemsOption == typeString) {
      addBuildCitationMenuItem(
        menu,
        data,
        manualClassification,
        buildFunction,
        typeString,
        backFunction,
        regeneralizeFunction,
        userInputFunction,
        othersOnSubmenu
      );
    }
  }

  if (gd.sourceType == "image") {
    // Images typically do not have a lot of info for a citation
    // so show citation assistant as well.
    addShowCitationAssistantMenuItem(menu);
  }
}

// Global to remember the popup menu width before EditCitation
var widthBeforeDebugDisplay = "";

// Special backFunction for leaving EditCitation
async function resizeBackFunction(backFunction) {
  // Make the whole window the width it was before (not on iOS)
  if (shouldPopupWindowResize && widthBeforeDebugDisplay) {
    document.body.style.width = widthBeforeDebugDisplay;
  }

  backFunction();
}

async function displayTextMenu(titleText, displayString, backFunction) {
  let menu = beginMainMenu();

  let fragment = document.createDocumentFragment();

  addBackMenuItem(menu, function () {
    resizeBackFunction(backFunction);
  });

  addBreak(fragment);
  let label = document.createElement("label");
  label.innerText = titleText;
  label.className = "largeEditBoxLabel";
  fragment.appendChild(label);
  addBreak(fragment);

  let textarea = document.createElement("textarea");
  textarea.className = "largeEditBox";
  textarea.value = displayString;
  fragment.appendChild(textarea);

  menu.list.appendChild(fragment);
  endMainMenu(menu);
}

async function debugDisplayMenu(object, titleText, backFunction) {
  // this switches the popup to display a different frame and populates the edit box

  let displayString = JSON.stringify(object, null, 2); // 2 spaces of indentation

  // Make the whole window wider (if not on iOS)
  if (shouldPopupWindowResize) {
    widthBeforeDebugDisplay = document.body.style.width;
    document.body.style.width = "600px";
  }

  displayTextMenu(titleText, displayString, backFunction);
}

function displayExtractedData(data, backFunction) {
  if (data) {
    console.log(data.extractedData);
    debugDisplayMenu(data.extractedData, "Extracted Data", backFunction);
  }
}

function displayGeneralizedData(data, backFunction) {
  if (data) {
    console.log(data.generalizedData);
    debugDisplayMenu(data.generalizedData, "Generalized Data", backFunction);
  }
}

async function displaySavedPersonData(data, backFunction) {
  let personData = await getLatestPersonData();
  if (!personData) {
    return; // no saved data, do not do anything
  }

  if (personData) {
    console.log(personData);
    debugDisplayMenu(personData, "Saved Person Data", backFunction);
  }
}

async function displaySavedCitationObject(data, backFunction) {
  let storedObject = await getLatestCitation();
  if (!storedObject) {
    return; // no saved data, do not do anything
  }

  let citationObject = storedObject.latestCitation;
  if (!citationObject) {
    return;
  }

  if (citationObject) {
    console.log(citationObject);
    debugDisplayMenu(citationObject, "Saved Citation Object", backFunction);
  }
}

async function displayDataCache(data, backFunction) {
  loadDataCache(function () {
    let dataCache = cachedDataCache;
    if (dataCache) {
      console.log(dataCache);
      debugDisplayMenu(dataCache, "Data Cache", backFunction);
    }
  });
}

async function clearCachedFetchData() {
  clearAsyncResultCache("AncestryFetchRecord");
  clearAsyncResultCache("AncestryFetchSharingObj");
}

async function clearLocalStorage() {
  chrome.storage.local.clear();
}

function keepPopupOpenForDebug() {
  keepPopupOpen = true;
}

var saveUnitTestData = false;
function enableSaveUnitTestData() {
  saveUnitTestData = true;
}

function setupDebugSubmenuMenu(data, backFunction) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  let toHereBackFunction = function () {
    setupDebugSubmenuMenu(data, backFunction);
  };

  if (data) {
    addMenuItem(menu, "Show extracted data", function (element) {
      displayExtractedData(data, toHereBackFunction);
    });

    addMenuItem(menu, "Show generalized data", function (element) {
      displayGeneralizedData(data, toHereBackFunction);
    });

    addMenuItem(menu, "Show saved person data", function (element) {
      displaySavedPersonData(data, toHereBackFunction);
    });

    addMenuItem(menu, "Show saved citation object", function (element) {
      displaySavedCitationObject(data, toHereBackFunction);
    });

    addMenuItem(menu, "Show dataCache", function (element) {
      displayDataCache(data, toHereBackFunction);
    });
  }

  addMenuItem(menu, "Clear cached fetch data", function (element) {
    clearCachedFetchData();
  });
  addMenuItem(menu, "Clear ALL local storage for extension", function (element) {
    clearLocalStorage();
  });

  if (!keepPopupOpen) {
    addMenuItem(menu, "Keep popup open for inspect", function (element) {
      keepPopupOpenForDebug();
    });
  }

  if (!saveUnitTestData) {
    addMenuItem(menu, "Enable save of unit test data", function (element) {
      enableSaveUnitTestData();
    });
  }

  endMainMenu(menu);
}

function setupHelpSubmenuMenu(data, backFunction) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  let manifest = chrome.runtime.getManifest();
  if (manifest && manifest.version) {
    let message = "WikiTree Sourcer version is: " + manifest.version;
    addItalicMessageMenuItem(menu, message);
  }

  function addLinkMenuItem(message, link) {
    addMenuItem(menu, message, function () {
      chrome.tabs.create({ url: link });
      closePopup();
    });
  }

  addLinkMenuItem(
    "Open main WikiTree Sourcer Free Space Page...",
    "https://www.wikitree.com/wiki/Space:WikiTree_Sourcer"
  );
  addLinkMenuItem("Open User Guide...", "https://www.wikitree.com/wiki/Space:WikiTree_Sourcer_User_Guide");
  addLinkMenuItem("Open Release Notes...", "https://www.wikitree.com/wiki/Space:WikiTree_Sourcer_Release_Notes");
  addLinkMenuItem("Open YouTube Intro Video...", "https://www.youtube.com/watch?v=oUfbvN8k8UI");
  addLinkMenuItem("Open G2G forum...", "https://www.wikitree.com/g2g/questions");

  let toHereBackFunction = function () {
    setupHelpSubmenuMenu(data, backFunction);
  };

  addMenuDivider(menu);
  addMenuItem(menu, "Debug...", function (element) {
    setupDebugSubmenuMenu(data, toHereBackFunction);
  });

  endMainMenu(menu);
}

async function setupSearchCollectionsSubMenu(data, siteName, searchCollectionFunction, backFunction) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  let gd = data.generalizedData;
  let countryArray = gd.inferCountries();
  let maxLifespan = Number(options.search_general_maxLifespan);
  let dates = {
    maxLifespan: maxLifespan,
    eventYear: gd.inferEventYear(),
    birthYear: gd.inferBirthYear(),
    deathYear: gd.inferDeathYear(),
  };
  let collectionArray = RC.findCollectionsForSiteWithinDateRangeAndCountries(siteName, dates, countryArray);

  //console.log("setupSearchCollectionsSubMenu, countryArray is:");
  //console.log(countryArray);
  //console.log("setupSearchCollectionsSubMenu, dates is:");
  //console.log(dates);

  if (collectionArray && collectionArray.length > 0) {
    for (let collection of collectionArray) {
      addMenuItem(menu, collection.title, function (element) {
        searchCollectionFunction(data.generalizedData, collection.wtsId);
      });
    }
  } else {
    addMessageMenuItem(menu, "No supported collections in date range and country:");

    if (dates) {
      let datesString = "";
      if (dates.birthYear) {
        datesString += "birth: " + dates.birthYear;
      }
      if (dates.deathYear) {
        if (datesString != "") {
          datesString += ", ";
        }
        datesString += "death: " + dates.deathYear;
      }
      if (dates.eventYear) {
        if (datesString != "") {
          datesString += ", ";
        }
        datesString += "event: " + dates.eventYear;
      }
      if (datesString) {
        addMessageMenuItem(menu, "Dates: " + datesString);
      }
    }

    if (countryArray.length > 0) {
      let countriesString = "";
      for (let country of countryArray) {
        if (countriesString != "") {
          countriesString += ", ";
        }
        countriesString += country;
      }
      addMessageMenuItem(menu, "Countries: " + countriesString);
    }
  }

  endMainMenu(menu);
}

function addSameRecordMenuItem(menu, data, siteName, searchFunction, equivSiteName = "", subtitle = "") {
  let gd = data.generalizedData;

  //console.log("addSameRecordMenuItem, gd is")
  //console.log(gd)

  if (gd.sourceType == "record") {
    if (gd.collectionData && gd.collectionData.id) {
      let collectionId = RC.mapCollectionId(
        gd.sourceOfData,
        gd.collectionData.id,
        siteName,
        gd.inferEventCountry(),
        gd.inferEventYear()
      );
      if (collectionId) {
        if (subtitle) {
          addMenuItemWithSubtitle(menu, "Search the same collection for the same record", searchFunction, subtitle);
        } else {
          addMenuItem(menu, "Search the same collection for the same record", searchFunction);
        }

        return true;
      }
    }
  }
  return false;
}

function addSameEventMenuItem(menu, data, searchFunction, subtitle = "") {
  let gd = data.generalizedData;

  if (gd.sourceType == "record") {
    let eventDateObj = gd.inferEventDateObj();
    if (eventDateObj) {
      if (subtitle) {
        addMenuItemWithSubtitle(menu, "Search for the same event", searchFunction, subtitle);
      } else {
        addMenuItem(menu, "Search for the same event", searchFunction);
      }
      return true;
    }
  }
  return false;
}

// This flag indicates whether the popup should resize after the initial setup -
// e.g. for EditCitation.
// The only case where it should NOT resize currently is on iOS.
// Even in cases on iOS where the menu is not fized size we don't want to resize because
// it resizing back to the smaller size after Edit Citation does not work on iOS.
var shouldPopupWindowResize = true;

function setPopupMenuWidthForIosOnResize() {
  //console.log("setPopupMenuWidthForIosOnResize, window.innerWidth is:" + window.innerWidth);
  //console.log("setPopupMenuWidthForIosOnResize, window.outerWidth is:" + window.outerWidth);

  // On iOS if the popup is coming up from the bottom of the screen with a fixed width
  // then on the first resize the outerWidth will be a largish number equal to the screen width or the
  // split view width. If the popup is coming from the top it may be zero or something based on the
  // menu context - typically 84 for this extension currently.
  if (window.outerWidth < 100) {
    //console.log("setPopupMenuWidthForIosOnResize, shouldPopupWindowResize is set to:" + shouldPopupWindowResize);
    document.body.style.width = "350px";
  }
  window.onresize = null;
}

function setPopupMenuWidthBasedOnPlatform(platformInfo) {
  //console.log("setPopupMenuWidthBasedOnPlatform, platformInfo is:");
  //console.log(platformInfo);

  let platformOS = platformInfo.os; // store in global so we can use it later

  if (platformOS == "ios") {
    // Should not resize on iOS at all. In the cases where it is on iPad AND the window is coming
    // down from the toolbar then we do set the size initially but we do not resize for Edit Citation
    // because it is not possible to set smaller once we enlarge it
    shouldPopupWindowResize = false;
    window.onresize = setPopupMenuWidthForIosOnResize;
  } else {
    // on all other platforms the window should resize
    shouldPopupWindowResize = true;
    document.body.style.width = "350px";
  }
}

function setPopupMenuWidth() {
  //console.log("setPopupMenuWidth, window.innerWidth is:" + window.innerWidth);
  //console.log("setPopupMenuWidth, window.outerWidth is:" + window.outerWidth);
  // this uses a callback
  chrome.runtime.getPlatformInfo(setPopupMenuWidthBasedOnPlatform);
}

export {
  addBuildCitationMenuItems,
  addSameRecordMenuItem,
  addSameEventMenuItem,
  setPopupMenuWidth,
  setupSearchCollectionsSubMenu,
  hasBirthOrDeathYear,
  addBackMenuItem,
  addHelpMenuItem,
  addBuyMeACoffeeMenuItem,
  addOptionsMenuItem,
  addItalicMessageMenuItem,
  addMenuItemWithSubMenu,
  addMenuItemWithSubtitle,
  addMenuItem,
  addBreak,
  addMenuDivider,
  beginMainMenu,
  endMainMenu,
  closePopup,
  displayMessage,
  displayBusyMessage,
  displayBusyMessageAfterDelay,
  displayBusyMessageWithSkipButton,
  displayMessageWithIcon,
  displayMessageWithIconThenClosePopup,
  displayMessageWithIconAndWaitForContinue,
  displayMessageThenClosePopup,
  displayUnexpectedErrorMessage,
  emptyMenu,
  openExceptionPage,
  doAsyncActionWithCatch,
  shouldPopupWindowResize,
  macSecondMonitorWorkaround,
  keepPopupOpen,
  keepPopupOpenForDebug,
  saveUnitTestData,
  enableSaveUnitTestData,
  clearCachedFetchData,
  displayTextMenu,
};
