/*
MIT License

Copyright (c) 2022 Robert M Pavey

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

import { getLocalStorageItem } from "/base/browser/common/browser_compat.mjs";

var uiState = {
  activeTab: "search",
  activeSubsectionForTab: {
    search: "general",
    citation: "general",
    narrative: "general",
    table: "general",
    addMerge: "general",
    context: "general",
  },
};

async function saveOptionsUiState() {
  let items = { options_uiState: uiState };
  chrome.storage.local.set(items);
}

async function restoreOptionsUiState() {
  let savedUiState = await getLocalStorageItem("options_uiState");
  if (savedUiState) {
    uiState = savedUiState;

    // conversion for change of tab name from addPerson to addMerge
    if (uiState.activeTab == "addPerson") {
      uiState.activeTab = "addMerge";
    }
    if (uiState.activeSubsectionForTab["addPerson"]) {
      uiState.activeSubsectionForTab["addMerge"] = uiState.activeSubsectionForTab["addPerson"];
      delete uiState.activeSubsectionForTab["addPerson"];
    }
  }
}

async function updateAndSaveOptionsUiState(tabName, subsectionName) {
  if (tabName) {
    uiState.activeTab = tabName;

    if (subsectionName) {
      uiState.activeSubsectionForTab[tabName] = subsectionName;
    }
  }
  saveOptionsUiState();
}

async function restoreOptionsUiStateAndSetState(setActiveTab, setActiveSubsection) {
  await restoreOptionsUiState();

  setActiveTab(uiState.activeTab);
  for (let tab in uiState.activeSubsectionForTab) {
    setActiveSubsection(tab, uiState.activeSubsectionForTab[tab]);
  }
}

export { restoreOptionsUiStateAndSetState, updateAndSaveOptionsUiState };
