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

import { setupSimplePopupMenu } from "/base/browser/popup/popup_simple_base.mjs";
import { initPopup } from "/base/browser/popup/popup_init.mjs";
import { generalizeData } from "../core/noda_generalize_data.mjs";
import { buildCitation } from "../core/noda_build_citation.mjs";
import { buildHouseholdTable } from "/base/core/table_builder.mjs";
import { checkPermissionForSite } from "/base/browser/popup/popup_permissions.mjs";
import { displayMessageWithIcon, displayBusyMessage } from "/base/browser/popup/popup_menu_building.mjs";
import { viewerSelectionFromUrl, loadViewerMetadata, assertViewerSelection } from "../core/noda_viewer_metadata.mjs";

function fetchViewerJson(url) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Digitalarkivet metadata took too long to load.")), 15000);
    chrome.runtime.sendMessage(
      { type: "doFetchJson", fetchUrl: url, fetchOptions: { credentials: "omit" } },
      (response) => {
        clearTimeout(timer);
        if (chrome.runtime.lastError || !response?.success)
          reject(new Error("Digitalarkivet metadata could not be loaded."));
        else resolve(response.json);
      }
    );
  });
}

async function setupNodaPopupMenu(extractedData, tabId) {
  let currentSelection;
  if (extractedData.newViewer) {
    try {
      if (
        !(await checkPermissionForSite("https://nye.digitalarkivet.no/*", {
          reason: "Read this image's public source and page metadata.",
          allowSkip: true,
        }))
      )
        return;
      currentSelection = async () => viewerSelectionFromUrl((await chrome.tabs.get(tabId)).url);
      displayBusyMessage("Loading Digitalarkivet source details...");
      extractedData = await loadViewerMetadata(
        viewerSelectionFromUrl(extractedData.url),
        fetchViewerJson,
        currentSelection
      );
    } catch (error) {
      await displayMessageWithIcon("warning", "Could not prepare the Digitalarkivet citation", error.message);
      return;
    }
  }
  let doNotIncludeSearch = false;
  if (extractedData.pageType != "record") {
    doNotIncludeSearch = true;
  }

  let input = {
    extractedData: extractedData,
    extractFailedMessage: "It looks like a Digitalarkivet page but not a record or image page.",
    generalizeFailedMessage: "It looks like a Digitalarkivet page but does not contain the required data.",
    generalizeDataFunction: generalizeData,
    buildCitationFunction: buildCitation,
    buildHouseholdTableFunction: buildHouseholdTable,
    siteNameToExcludeFromSearch: "noda",
    doNotIncludeSearch: doNotIncludeSearch,
  };
  if (currentSelection) {
    const selection = viewerSelectionFromUrl(extractedData.url);
    // Use the standard build form's async hook to recheck identity at the moment
    // of citation generation, including after same-tab viewer navigation.
    input.userInputFunction = () => ({
      fields: extractedData.metadataUnavailable
        ? [{ type: "label", label: "Source metadata is unavailable. This citation will contain the image link only." }]
        : [],
      resultData: {},
    });
    input.regeneralizeFunction = async () => assertViewerSelection(selection, currentSelection);
  }
  setupSimplePopupMenu(input);
}

initPopup("noda", setupNodaPopupMenu);
