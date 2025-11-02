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
import {
  addMenuItem,
  addMenuItemWithSubtitle,
  displayBusyMessage,
  closePopup,
} from "/base/browser/popup/popup_menu_building.mjs";
import { writeToClipboard } from "/base/browser/popup/popup_clipboard.mjs";
import { generalizeData } from "../core/fg_generalize_data.mjs";
import { buildCitation } from "../core/fg_build_citation.mjs";
import { GeneralizedData } from "/base/core/generalize_data_utils.mjs";
import { convertTimestampDiffToText, getPersonDataSubtitleText } from "/base/browser/popup/popup_utils.mjs";
import { getLatestPersonData } from "/base/browser/popup/popup_person_data.mjs";

async function buildFindAGraveTemplate(data) {
  let ed = data.extractedData;
  let memorialId = ed.memorialId;
  let templateText = "{{FindAGrave|" + memorialId + "}}";

  writeToClipboard(templateText, "FindAGrave Template");
}

async function fgAddLinkBuilderFlowerNote(data, personData, tabId) {
  displayBusyMessage("Adding note ...");

  let personEd = personData.extractedData;
  if (!personEd) {
    return;
  }
  let wikiId = personEd.wikiId;
  if (!wikiId) {
    return;
  }

  // We want to add a note like:
  // Pavey-444 on WikiTree

  let noteText = wikiId + " on WikiTree";

  let fieldData = {
    wikiId: wikiId,
    noteText: noteText,
  };

  // send a message to content script
  try {
    //console.log("fgAddLinkBuilderFlowerNote");
    //console.log(tabId);
    //console.log(personData);

    chrome.tabs.sendMessage(tabId, { type: "addFlowerNote", fieldData: fieldData }, function (response) {
      displayBusyMessage("Adding note ...");

      //console.log("fgAddLinkBuilderFlowerNote, chrome.runtime.lastError is:");
      //console.log(chrome.runtime.lastError);
      //console.log("fgAddLinkBuilderFlowerNote, response is:");
      //console.log(response);

      // NOTE: must check lastError first in the if below so it doesn't report an unchecked error
      if (chrome.runtime.lastError || !response) {
        // possibly there is no content script loaded, this could be an error that should be reported
        // By testing edge cases I have found the if you reload the page and immediately click the
        // extension button sometimes this will happen. Presumably because the content script
        // just got unloaded prior to the reload but we got here because the popup had not been reset.
        // In this case we are seeing the response being undefined.
        // What to do in this case? Don't want to leave the "Initializing menu..." up.
        let message = "fgAddLinkBuilderFlowerNote failed";
        if (chrome.runtime.lastError && chrome.runtime.lastError.message) {
          message += ": " + chrome.runtime.lastError.message;
        }
        displayMessageWithIcon("warning", message);
      } else if (response.success) {
        // Used to display a message on success but that meant an extra click to close popup
        //displayMessageWithIconThenClosePopup("check", "Fields updated");
        closePopup();
      } else {
        let message = response.errorMessage;
        console.log(message);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function addFgAddFlowerNoteMenuItem(menu, data, tabId) {
  let ed = data.extractedData;
  if (ed.isOnLeaveAFlowerNoteDialog) {
    let personData = await getLatestPersonData();
    if (!personData) {
      return; // no saved data, do not add menu item
    }

    let personDataTimeText = convertTimestampDiffToText(personData.timeStamp);
    if (!personDataTimeText) {
      return;
    }

    if (personData.generalizedData) {
      let gd = GeneralizedData.createFromPlainObject(personData.generalizedData);
      personData.generalizedData = gd;
      let menuText = "Add link builder flower note referencing:";
      let subtitleText = getPersonDataSubtitleText(gd, personDataTimeText);

      addMenuItemWithSubtitle(
        menu,
        menuText,
        function (element) {
          fgAddLinkBuilderFlowerNote(data, personData, tabId);
        },
        subtitleText
      );
    }
  }
}

async function setupFgPopupMenu(extractedData, tabId) {
  let input = {
    extractedData: extractedData,
    extractFailedMessage: "It looks like a FindAGrave page but not a memorial page.",
    generalizeFailedMessage: "It looks like a FindAGrave page but does not contain the required data.",
    generalizeDataFunction: generalizeData,
    buildCitationFunction: buildCitation,
    siteNameToExcludeFromSearch: "fg",
  };

  input.customMenuFunction = async function (menu, data) {
    if (data.extractedData.memorialId) {
      addMenuItem(menu, "Build FindAGrave template", function (element) {
        buildFindAGraveTemplate(data);
      });
    }
    if (data.extractedData.isOnLeaveAFlowerNoteDialog) {
      await addFgAddFlowerNoteMenuItem(menu, data, tabId);
    }
  };
  input.isCustomMenuFunctionAsync = true;

  setupSimplePopupMenu(input);
}

initPopup("fg", setupFgPopupMenu);
