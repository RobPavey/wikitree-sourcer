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
import { generalizeData } from "../core/youtube_generalize_data.mjs";
import { buildCitation } from "../core/youtube_build_citation.mjs";
import { buildYoutubeTemplate, parseStartTime } from "../core/youtube_build_template.mjs";
import { writeToClipboard } from "/base/browser/popup/popup_clipboard.mjs";
import {
  addBackMenuItem,
  addBreak,
  addMenuItem,
  beginMainMenu,
  endMainMenu,
} from "/base/browser/popup/popup_menu_building.mjs";

function copyTemplate(data, startSeconds) {
  writeToClipboard(buildYoutubeTemplate(data.extractedData, startSeconds), "YouTube template");
}

// Asks the user for an optional start time and then builds the template
function showStartTimeForm(data, backFunction) {
  let menu = beginMainMenu();
  addBackMenuItem(menu, backFunction);

  let textInput = document.createElement("input");
  textInput.type = "text";
  textInput.id = "startTime";
  textInput.className = "dialogTextInput";
  if (data.extractedData.startTime) {
    textInput.value = data.extractedData.startTime;
  }

  let label = document.createElement("label");
  label.className = "dialogInput";
  label.appendChild(document.createTextNode("Start time"));
  let commentLabel = document.createElement("label");
  commentLabel.className = "dialogInputComment";
  commentLabel.appendChild(document.createTextNode("Seconds, m:ss or h:mm:ss. Leave empty to start at the beginning."));
  label.appendChild(commentLabel);
  addBreak(label);
  label.appendChild(textInput);
  let div = document.createElement("div");
  div.className = "dialogLine";
  div.appendChild(label);
  menu.list.appendChild(div);

  let errorLabel = document.createElement("label");
  errorLabel.className = "dialogInputComment";
  menu.list.appendChild(errorLabel);

  let button = document.createElement("button");
  button.className = "dialogButton";
  button.innerText = "Build YouTube template";
  button.onclick = function (element) {
    const text = textInput.value.trim();
    const startSeconds = parseStartTime(text);
    if (text && startSeconds === undefined) {
      errorLabel.innerText = "Could not understand that start time. Use seconds, m:ss or h:mm:ss.";
      return;
    }
    copyTemplate(data, startSeconds);
  };
  menu.list.appendChild(button);

  endMainMenu(menu);

  textInput.focus();
  textInput.addEventListener("keydown", function (event) {
    if (event.key == "Enter") {
      button.click();
    }
  });
}

async function setupYoutubePopupMenu(extractedData) {
  let input = {
    extractedData: extractedData,
    extractFailedMessage: "It looks like a YouTube page but not a video page.",
    generalizeFailedMessage: "It looks like a YouTube page but does not contain the required data.",
    generalizeDataFunction: generalizeData,
    buildCitationFunction: buildCitation,
    siteNameToExcludeFromSearch: "youtube",
    doNotIncludeSearch: true,
  };

  input.customMenuFunction = function (menu, data) {
    let backFunction = function () {
      setupYoutubePopupMenu(extractedData);
    };

    addMenuItem(menu, "Build YouTube template", function (element) {
      copyTemplate(data);
    });
    addMenuItem(menu, "Build YouTube template with start time...", function (element) {
      showStartTimeForm(data, backFunction);
    });
  };

  setupSimplePopupMenu(input);
}

initPopup("youtube", setupYoutubePopupMenu);
