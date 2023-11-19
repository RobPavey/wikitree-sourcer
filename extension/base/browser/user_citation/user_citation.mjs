/*
MIT License

Copyright (c) 2023 Robert M Pavey

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

import { CitationBuilder } from "/base/core/citation_builder.mjs";
import { callFunctionWithStoredOptions } from "/base/browser/options/options_loader.mjs";
import { getLocalStorageItem } from "/base/browser/common/browser_compat.mjs";

function refreshAfterChange(options) {
  //console.log("refreshAfterChange called");
  let citationTypeElement = document.getElementById("citationType");
  let sourceTypeElement = document.getElementById("sourceType");
  let narrativeRow = document.getElementById("narrativeRow");
  let authorRow = document.getElementById("authorRow");
  let labelRow = document.getElementById("labelRow");
  let previewRow = document.getElementById("previewRow");

  if (citationTypeElement.value == "narrative") {
    narrativeRow.style.display = "";
  } else {
    narrativeRow.style.display = "none";
  }

  if (sourceTypeElement.value == "book") {
    authorRow.style.display = "";
  } else {
    authorRow.style.display = "none";
  }

  if (options.citation_general_meaningfulNames != "none") {
    labelRow.style.display = "";
  } else {
    labelRow.style.display = "none";
  }

  if (options.citation_userCitation_showPreview) {
    previewRow.style.display = "";
  } else {
    previewRow.style.display = "none";
  }

  // hide or show hints
  let hintStyle = "none";
  let showHints = options.citation_userCitation_showHints;
  if (showHints) {
    hintStyle = "";
  }
  let hintElements = document.querySelectorAll("td > .comment");
  for (let hint of hintElements) {
    hint.style.display = hintStyle;
  }

  document.getElementById("previewText").value = buildCitation(options);
}

function buildCitation(options) {
  //console.log("buildCitation options is :");
  //console.log(options);

  const runDate = new Date();

  let citationTypeElement = document.getElementById("citationType");
  const type = citationTypeElement.value; // "inline", "narrative" or "source"

  let builder = new CitationBuilder(type, runDate, options);

  var labelText = document.getElementById("label").value;
  builder.meaningfulTitle = labelText;

  if (type == "narrative") {
    let narrative = document.getElementById("narrative").value;
    if (narrative) {
      narrative = narrative.trim();
      if (!narrative.endsWith(".")) {
        narrative += ".";
      }
      builder.narrative = narrative;
    }
  }

  const sourceType = document.getElementById("sourceType").value;
  const author = document.getElementById("author").value;
  const sourceTitle = document.getElementById("sourceTitle").value;
  if (sourceTitle) {
    if (sourceType == "book") {
      builder.putSourceTitleInQuotes = false;
      if (author) {
        builder.sourceTitle = author + ", ''" + sourceTitle + "''";
      } else {
        builder.sourceTitle = "''" + sourceTitle + "''";
      }
    } else {
      builder.sourceTitle = sourceTitle;
    }
  }

  builder.sourceReference = document.getElementById("sourceReference").value;
  builder.dataString = document.getElementById("dataString").value;

  let url = document.getElementById("url").value;
  let linkText = document.getElementById("linkText").value;
  if (url) {
    if (linkText) {
      builder.recordLinkOrTemplate = "[" + url + " " + linkText + "]";
    } else {
      builder.recordLinkOrTemplate = url;
    }
  }

  let fullCitation = builder.getCitationString();

  return fullCitation;
}

function buildCitationAndSave(options) {
  //console.log("buildCitationAndSave options is :");
  //console.log(options);

  let fullCitation = buildCitation(options);

  try {
    navigator.clipboard.writeText(fullCitation);
    //console.log("Clipboard set");

    // Update status to let user know options were saved.
    var status = document.getElementById("saveStatus");
    status.textContent = "Citation saved to clipboard.";
    setTimeout(function () {
      status.textContent = "";
    }, 750);
  } catch (error) {
    console.log("Clipboard write failed. Using dialog instead.");
    //console.log(error);
  }
}

function saveCitationClicked() {
  callFunctionWithStoredOptions(buildCitationAndSave);
}

function onChangeOfAnyInput() {
  callFunctionWithStoredOptions(refreshAfterChange);
}

function saveUiState() {
  const citationType = document.getElementById("citationType").value;
  const sourceType = document.getElementById("sourceType").value;

  let uiState = {
    citationType: citationType,
    sourceType: sourceType,
  };

  let items = { user_citation_uiState: uiState };
  chrome.storage.local.set(items);
}

async function restoreUiState() {
  let savedUiState = await getLocalStorageItem("user_citation_uiState");
  if (savedUiState) {
    document.getElementById("citationType").value = savedUiState.citationType;
    document.getElementById("sourceType").value = savedUiState.sourceType;
  } else {
    // defaults
    document.getElementById("citationType").value = "inline";
    document.getElementById("sourceType").value = "record";
  }
}

function onChangeOfSelect() {
  saveUiState();
}

function onStorageChanged(changes) {
  console.log("onStorageChanged, changes is:");
  console.log(changes);

  if (changes.options_citation) {
    console.log("citation options changed");
    callFunctionWithStoredOptions(refreshAfterChange);
  }
}

async function initDialog() {
  //console.log("initDialog called");

  await restoreUiState();

  document.getElementById("formTable").addEventListener("change", onChangeOfAnyInput);
  document.getElementById("citationType").addEventListener("change", onChangeOfSelect);
  document.getElementById("sourceType").addEventListener("change", onChangeOfSelect);
  document.getElementById("saveButton").addEventListener("click", saveCitationClicked);

  callFunctionWithStoredOptions(refreshAfterChange);

  chrome.storage.onChanged.addListener(onStorageChanged);
}

//console.log("user_citation.mjs loaded");

document.addEventListener("DOMContentLoaded", initDialog);
