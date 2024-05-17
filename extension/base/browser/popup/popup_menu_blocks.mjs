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

import {
  addMenuItem,
  addItalicMessageMenuItem,
  addHelpMenuItem,
  addBuyMeACoffeeMenuItem,
  addOptionsMenuItem,
  addMenuDivider,
  beginMainMenu,
  endMainMenu,
} from "/base/browser/popup/popup_menu_building.mjs";

import { addEditCitationMenuItem } from "/base/browser/popup/popup_citation.mjs";

function addStandardMenuEnd(menu, data, backFunction) {
  addMenuDivider(menu);
  addEditCitationMenuItem(menu, backFunction);
  addBuyMeACoffeeMenuItem(menu);
  addOptionsMenuItem(menu);
  addHelpMenuItem(menu, data, backFunction);

  endMainMenu(menu);
}

async function openUserCitationTab() {
  const url = chrome.runtime.getURL("/base/browser/user_citation/user_citation.html");

  let views = chrome.extension.getViews({
    type: "tab",
  });

  let existingTab = undefined;
  for (let view of views) {
    if (view.document.documentURI == url) {
      let tab = await view.chrome.tabs.getCurrent();
      existingTab = tab;
    }
  }

  if (existingTab) {
    chrome.tabs.update(existingTab.id, { active: true });
    chrome.windows.update(existingTab.windowId, { focused: true });
  } else {
    chrome.tabs.create({ url: url });
  }

  // popup will close automatically if new tab created or tab exists in same window
  // but it tab esists in a different window on another screen for example we still
  // want to close the popup.
  closePopup();
}

function addShowCitationAssistantMenuItem(menu) {
  addMenuItem(menu, "Show Citation Assistant", function (element) {
    openUserCitationTab();
  });
}

function buildMinimalMenuWithMessage(message, data, backFunction) {
  let menu = beginMainMenu();

  addItalicMessageMenuItem(menu, message);

  addMenuDivider(menu);
  addShowCitationAssistantMenuItem(menu);

  addStandardMenuEnd(menu, data, backFunction);
}

export { addStandardMenuEnd, addShowCitationAssistantMenuItem, buildMinimalMenuWithMessage };
