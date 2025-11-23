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
import { checkPermissionForSite } from "/base/browser/popup/popup_permissions.mjs";

import {
  addMenuItemWithSubtitle,
  beginMainMenu,
  displayBusyMessage,
  closePopup,
  doAsyncActionWithCatch,
} from "/base/browser/popup/popup_menu_building.mjs";

import { addStandardMenuEnd } from "/base/browser/popup/popup_menu_blocks.mjs";

import { GeneralizedData } from "/base/core/generalize_data_utils.mjs";
import { getLatestPersonData } from "/base/browser/popup/popup_person_data.mjs";
import { writeToClipboard } from "/base/browser/popup/popup_clipboard.mjs";

import { convertTimestampDiffToText, getPersonDataSubtitleText } from "/base/browser/popup/popup_utils.mjs";

import { generalizeData } from "../core/arolsenarchives_generalize_data.mjs";
import { buildCitation } from "../core/arolsenarchives_build_citation.mjs";

async function getPersonData(extractData) {
  const checkPermissionsOptions = {
    reason: "To extract all personal data, a content script needs to be loaded on the archion.de page.",
  };
  let allowed = await checkPermissionForSite("*://collections-server.arolsen-archives.org/*", checkPermissionsOptions);
  if (!allowed) {
    closePopup();
    return;
  }

  let request = await fetch("https://collections-server.arolsen-archives.org/ITS-WS.asmx/GetPersonListByDocId", {
    credentials: "include",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "de,en-US;q=0.7,en;q=0.3",
      "Content-Type": "application/json",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      "Sec-GPC": "1",
    },
    referrer: "https://collections.arolsen-archives.org/",
    body: JSON.stringify({ lang: "en", docId: extractData.doc_id }),
    method: "POST",
    mode: "cors",
  });
  extractData.person_data_list = (await request.json())["d"];

  if (extractData.person_data_list.length == 1) {
    extractData.person_data = extractData.person_data_list[0];
  } else if (extractData.primaryPersonIndex != null) {
    extractData.person_data = extractData.person_data_list[extractData.primaryPersonIndex];
  }
}

async function buildLinkBuilderComment(data, personData, tabId) {
  displayBusyMessage("Adding comment ...");

  let personEd = personData.extractedData;
  if (!personEd) {
    displayMessageWithIcon("error", "No extracted data found.");
    return;
  }
  let personGd = personData.generalizedData;
  if (!personGd) {
    displayMessageWithIcon("error", "No generalized data found.");
    return;
  }
  let wikiId = personEd.wikiId;
  if (!wikiId) {
    displayMessageWithIcon("error", "No wikiId found.");
    return;
  }

  let fullName = "";
  if (personGd.name) {
    let nameObj = personGd.name;
    let forenames = nameObj.inferForenames();
    let lnab = personGd.inferLastNameAtBirth();
    let cln = personGd.inferLastNameAtDeath();
    if (forenames) {
      fullName = forenames + " ";
    }
    if (lnab) {
      if (cln && cln != lnab) {
        fullName += "(" + cln + ") ";
      }
      fullName += lnab;
    }
    fullName = fullName.trim();
  }
  if (!fullName) {
    displayMessageWithIcon("error", "No full name could be built.");
    return;
  }

  // We want to add a comment like:
  // Find a biography, more records, and genealogy of <full name>
  // https://www.wikitree.com/wiki/<wikiId>
  // Part of the Holocaust Project on WikiTree where volunteer genealogists are collaborating
  // on adding sourced profiles of all victims, connecting them to the free global family tree.
  let commentText = "Find a biography, more records, and genealogy of ";
  commentText += fullName + "\n";
  commentText += "https://www.wikitree.com/wiki/" + wikiId + "\n";
  commentText += "Part of the Holocaust Project on WikiTree ";
  commentText += "where volunteer genealogists are collaborating ";
  commentText += "on adding sourced profiles of all victims, ";
  commentText += "connecting them to the free global family tree.";

  doAsyncActionWithCatch("Building Link Builders comment", commentText, async function () {
    writeToClipboard(commentText, "Link Builders comment");
  });
}

async function addWikiTreeBacklinkMenuItem(menu, data, tabId) {
  let ed = data.extractedData;
  if (ed.has_disqus) {
    let personData = await getLatestPersonData();
    if (!personData) {
      return; // no saved data, do not add menu item
    }

    let personDataTimeText = convertTimestampDiffToText(personData.timeStamp);
    if (!personDataTimeText) {
      return;
    }

    if (personData.generalizedData && personData.generalizedData.sourceOfData == "wikitree") {
      let gd = GeneralizedData.createFromPlainObject(personData.generalizedData);
      personData.generalizedData = gd;
      let menuText = "Build link builder comment referencing:";
      let subtitleText = getPersonDataSubtitleText(gd, personDataTimeText);

      addMenuItemWithSubtitle(
        menu,
        menuText,
        function (element) {
          buildLinkBuilderComment(data, personData, tabId);
        },
        subtitleText
      );
    }
  }
}

async function setupSearchPersonPopupMenu(extractedData, tabId) {
  let backFunction = function () {
    setupSearchPersonPopupMenu(extractedData, tabId);
  };

  let menu = beginMainMenu();

  let data = { extractedData: extractedData, generalizedData: null };

  await addWikiTreeBacklinkMenuItem(menu, data, tabId);

  addStandardMenuEnd(menu, data, backFunction);
}

async function setupArolsenarchivesPopupMenu(extractedData, tabId) {
  if (extractedData.page_type == "searchPerson") {
    setupSearchPersonPopupMenu(extractedData, tabId);
    return;
  }

  if (extractedData.person_data == null && extractedData.url.match("/document/")) {
    await getPersonData(extractedData);
  }

  let input = {
    extractedData: extractedData,
    extractFailedMessage: "It looks like a Arolsen Archives page but not a record page.",
    generalizeFailedMessage: "It looks like a Arolsen Archives page but does not contain the required data.",
    generalizeDataFunction: generalizeData,
    buildCitationFunction: buildCitation,
    siteNameToExcludeFromSearch: "arolsenarchives",
  };

  if (extractedData.has_disqus) {
    input.tabId = tabId;
    input.customMenuFunction = addWikiTreeBacklinkMenuItem;
    input.isCustomMenuFunctionAsync = true;
  }

  setupSimplePopupMenu(input);
}

initPopup("arolsenarchives", setupArolsenarchivesPopupMenu);
