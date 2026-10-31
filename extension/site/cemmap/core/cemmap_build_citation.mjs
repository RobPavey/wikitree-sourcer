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

import { simpleBuildCitationWrapper } from "../../../base/core/citation_builder.mjs";

// Cemetery Map shows the people buried in a cemetery on a map. Its pages are cited by the link that opens the
// cemetery and the person, which is what the page address holds (see personLink in app.js of the app).
//
// Example citation:
// "Cemetery Map" [https://apps.wikitree.com/.../index.html?category=...&wt=Jones-67676 Lucy Amanda Jones],
// Map entry for Lucy Amanda Jones (Jones-67676) (1886-1981), buried at [[Space:Claquato_Cemetery|Claquato Cemetery]],
// Chehalis, Washington; Plot County; GPS: 46.648022, -123.023667.

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle = "Cemetery Map";
}

function cemeteryText(ed, builder) {
  let target = builder.getOptions().citation_general_target;
  let name = ed.cemeteryName || "";
  let full = ed.cemeteryCategory || name;
  if (!full) {
    return "";
  }

  // The category is "<cemetery name>, <town>, <state>". Put the cemetery name first even when the map has abbreviated it.
  let rest = full;
  if (name && full.startsWith(name)) {
    rest = full.substring(name.length).replace(/^,\s*/, "");
  } else if (name) {
    rest = "";
  }

  let nameText = name || full;
  if (target == "wikitree" && ed.cemeterySpaceUrl) {
    let spaceMatch = /wikitree\.com\/wiki\/(Space:[^?#]+)$/.exec(ed.cemeterySpaceUrl);
    if (spaceMatch) {
      nameText = "[[" + decodeURIComponent(spaceMatch[1]) + "|" + nameText + "]]";
    }
  }
  return rest ? nameText + ", " + rest : nameText;
}

function buildDataString(ed, gd, builder) {
  let dataString = "Map entry for " + ed.name;
  if (ed.wtId) {
    dataString += " (" + ed.wtId + ")";
  }

  if (ed.birthYear && ed.deathYear) {
    dataString += " (" + ed.birthYear + "-" + ed.deathYear + ")";
  } else if (ed.deathYear) {
    dataString += " (d. " + ed.deathYear + ")";
  } else if (ed.birthYear) {
    dataString += " (b. " + ed.birthYear + ")";
  }

  let cemetery = cemeteryText(ed, builder);
  if (cemetery) {
    dataString += ", buried at " + cemetery;
  }
  if (ed.plot) {
    dataString += "; " + ed.plot;
  }
  if (ed.latitude && ed.longitude) {
    dataString += "; GPS: " + ed.latitude + ", " + ed.longitude;
  }
  dataString += ".";
  builder.dataString = dataString;
}

function buildRecordLink(ed, gd, builder) {
  if (!ed.url) {
    return;
  }
  // The address of the page is the link that was copied from the map, without any #fragment
  let url = ed.url.replace(/#.*$/, "");
  if (builder.getOptions().citation_general_target == "wikitree") {
    builder.recordLinkOrTemplate = "[" + url + " " + ed.name + "]";
  } else {
    builder.recordLinkOrTemplate = url;
  }
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  buildDataString(ed, gd, builder);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
