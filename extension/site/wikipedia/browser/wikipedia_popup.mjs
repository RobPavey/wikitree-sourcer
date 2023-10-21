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
import { generalizeData } from "../core/wikipedia_generalize_data.mjs";
import { buildCitation } from "../core/wikipedia_build_citation.mjs";
import { writeToClipboard } from "/base/browser/popup/popup_clipboard.mjs";
import { addMenuItem } from "/base/browser/popup/popup_menu_building.mjs";
import { options } from "/base/browser/options/options_loader.mjs";

async function buildWikiTreeLinkText(linkString) {
  let text = linkString;
  let textOption = options.citation_wikipedia_linkSurroundingText;

  if (textOption == "seeOnW") {
    text = "See: " + linkString + " on Wikipedia";
  } else if (textOption == "seeOnWForMoreInfo") {
    text = "See: " + linkString + " on Wikipedia for more information";
  }

  writeToClipboard(text, "Wikipedia Link");
}

async function buildWikiTreePermalink(data) {
  let ed = data.extractedData;
  let link = ed.permalink;
  if (link && ed.title) {
    const linkString = "[" + link + " " + ed.title + "]";

    buildWikiTreeLinkText(linkString);
  } else {
    buildWikiTreeExternalLink(data);
  }
}

async function buildWikiTreeExternalLink(data) {
  let ed = data.extractedData;
  let url = ed.url;
  if (url) {
    if (ed.title) {
      const linkString = "[" + url + " " + ed.title + "]";
      buildWikiTreeLinkText(linkString);
    } else {
      const linkString = "[" + url + " Wikipedia]";
      buildWikiTreeLinkText(linkString);
    }
  }
}

async function buildWikiTreeSpecialLink(data) {
  let ed = data.extractedData;
  if (ed.title) {
    const linkString = "[[Wikipedia:" + ed.title + "|" + ed.title + "]]";

    buildWikiTreeLinkText(linkString);
  } else {
    buildWikiTreeExternalLink(data);
  }
}

async function buildWikiTreeLink(data) {
  let ed = data.extractedData;
  let linkOption = options.citation_wikipedia_citationLinkType;

  if (linkOption == "special") {
    buildWikiTreeSpecialLink(data);
  } else if (linkOption == "external") {
    buildWikiTreeExternalLink(data);
  } else if (linkOption == "permalink") {
    buildWikiTreePermalink(data);
  }
}

async function setupWikipediaPopupMenu(extractedData) {
  let input = {
    extractedData: extractedData,
    extractFailedMessage: "It looks like a Wikipedia page but not an entry page.",
    generalizeFailedMessage: "It looks like a Wikipedia page but does not contain the required data.",
    generalizeDataFunction: generalizeData,
    buildCitationFunction: buildCitation,
    siteNameToExcludeFromSearch: "wikipedia",
    doNotIncludeSearch: true,
  };

  input.customMenuFunction = function (menu, data) {
    addMenuItem(menu, "Build WikiTree link", function (element) {
      buildWikiTreeLink(data);
    });
  };

  setupSimplePopupMenu(input);
}

initPopup("wikipedia", setupWikipediaPopupMenu);
