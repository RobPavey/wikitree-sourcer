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

function refreshAfterChange(options) {
  //console.log("refreshAfterChange called");
  let citationTypeElement = document.getElementById("citationType");
  let sourceTypeElement = document.getElementById("sourceType");
  let narrativeRow = document.getElementById("narrativeRow");
  let authorRow = document.getElementById("authorRow");
  let labelRow = document.getElementById("labelRow");

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
    builder.narrative = document.getElementById("narrative").value;
  }

  const sourceType = document.getElementById("sourceType").value;
  const author = document.getElementById("author").value;
  const sourceTitle = document.getElementById("sourceTitle").value;
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

  try {
    navigator.clipboard.writeText(fullCitation);
    //console.log("Clipboard set");
  } catch (error) {
    console.log("Clipboard write failed. Using dialog instead.");
    //console.log(error);
  }
}

function saveCitationClicked() {
  callFunctionWithStoredOptions(buildCitation);
}

function onChange() {
  callFunctionWithStoredOptions(refreshAfterChange);
}

function initDialog() {
  //console.log("initDialog called");

  document.getElementById("formTable").addEventListener("change", onChange);

  document.getElementById("saveButton").addEventListener("click", saveCitationClicked);

  callFunctionWithStoredOptions(refreshAfterChange);
}

//console.log("user_citation.mjs loaded");

document.addEventListener("DOMContentLoaded", initDialog);
