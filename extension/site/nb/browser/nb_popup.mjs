/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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
import { checkPermissionForSite } from "/base/browser/popup/popup_permissions.mjs";
import { displayMessageWithIcon, displayBusyMessage } from "/base/browser/popup/popup_menu_building.mjs";
import { loadNbMetadata, sameSelection, selectionFromUrl } from "../core/nb_metadata.mjs";
import { buildCollectionContext, loadActiveCollection, saveResearchSubject } from "../core/nb_collection_context.mjs";
import { generalizeData, regeneralizeData } from "../core/nb_generalize_data.mjs";
import { getRequestedUserInput } from "../core/nb_user_input.mjs";
import { buildCitation } from "../core/nb_build_citation.mjs";

function fetchMetadata(url) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("NB metadata took too long to load. Please reopen Sourcer to retry.")),
      15000
    );
    chrome.runtime.sendMessage(
      { type: "doFetchJson", fetchUrl: url, fetchOptions: { credentials: "omit" } },
      (response) => {
        clearTimeout(timer);
        if (chrome.runtime.lastError || !response?.success)
          reject(
            new Error(
              "NB metadata could not be loaded" +
                (response?.status ? " (HTTP " + response.status + ")" : "") +
                ". Please try again."
            )
          );
        else resolve(response.json);
      }
    );
  });
}
async function setupNbPopupMenu(selection, tabId) {
  try {
    if (!selection.success) {
      await displayMessageWithIcon(
        "warning",
        selection.overrideFailureMessage || "Open an NB newspaper or book viewer."
      );
      return;
    }
    const allowed = await checkPermissionForSite("https://api.nb.no/*", {
      reason: "NB citation assistance needs access to api.nb.no to read the publication's catalogue and page metadata.",
      allowSkip: true,
    });
    if (!allowed) return;
    displayBusyMessage("Loading NB publication details...");
    const currentSelection = async () => selectionFromUrl((await chrome.tabs.get(tabId)).url);
    const ed = await loadNbMetadata(selection, fetchMetadata, currentSelection);
    const collection = await loadActiveCollection(chrome.storage.local, () => crypto.randomUUID());
    let context = buildCollectionContext(collection);
    await setupSimplePopupMenu({
      extractedData: ed,
      generalizeDataFunction: generalizeData,
      userInputFunction: (input) => getRequestedUserInput(input, context),
      regeneralizeFunction: async (input) => {
        const current = await currentSelection();
        if (!sameSelection(current, ed))
          throw new Error("The NB page changed. Reopen Sourcer before generating this citation.");
        await saveResearchSubject(chrome.storage.local, context, input.newData);
        regeneralizeData(input);
      },
      // Starting/restoring a collection from Sourcer's own menu returns here without reopening the popup.
      isCustomMenuFunctionAsync: true,
      customMenuFunction: async () => {
        context = buildCollectionContext(await loadActiveCollection(chrome.storage.local, () => crypto.randomUUID()));
      },
      buildCitationFunction: buildCitation,
      doNotIncludeSearch: true,
      extractFailedMessage: "Open an individual newspaper or book in NB's viewer.",
      generalizeFailedMessage: "NB did not return the publication details needed for a citation.",
    });
  } catch (error) {
    await displayMessageWithIcon("warning", "Could not prepare the NB citation", error.message);
  }
}
initPopup("nb", setupNbPopupMenu);
