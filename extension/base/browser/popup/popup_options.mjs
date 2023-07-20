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
  beginMainMenu,
  addMenuDivider,
  displayMessageWithIconThenClosePopup,
} from "./popup_menu_building.mjs";

import { addStandardMenuEnd } from "./popup_menu_blocks.mjs";

function resetOptionsAction(tabId) {
  chrome.tabs.sendMessage(tabId, { type: "resetOptions" }, function (response) {
    //console.log("resetOptionsAction, received response");
    if (!chrome.runtime.lastError && response && response.success) {
      const message = "Options were reset to defaults";
      displayMessageWithIconThenClosePopup("check", message, "");
    } else {
      const message = "There was an error while reseting options";
      displayMessageWithIconThenClosePopup("warning", message, "");
    }
  });
}

function addResetOptionsToDefaultMenuItem(menu, tabId) {
  addMenuItem(menu, "Reset Options to Defaults", function (element) {
    resetOptionsAction(tabId);
  });
}
function setupOptionsPageMenu(tabId) {
  let backFunction = function () {
    setupOptionsPageMenu();
  };

  let menu = beginMainMenu();

  addResetOptionsToDefaultMenuItem(menu, tabId);

  addMenuDivider(menu);
  addStandardMenuEnd(menu, undefined, backFunction);
}

export { setupOptionsPageMenu };
