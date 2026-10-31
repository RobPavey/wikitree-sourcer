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
import { RT } from "../../../base/core/record_type.mjs";
//import { MsaEdReader } from "./msa_ed_reader.mjs";

function buildMsaUrl(ed, builder) {
  return ed.url;
}

function parseHtmlHeader (headTitle, ed) {
  if (!headTitle) {
    return;     
  }
  // Archives.., Volume  0002, Page 1234 - Title
  let volumePageRe = /(Archives of Maryland),\s+(Volume\s+\d{1,7}),\s+(Page\s+\d{1,9})\s+.*/;
  // Dr. Carr's Carreer files...
  let carreerFilesRe = /(^Dr. Lois Green Carr,.{1,30}) (MSA SC \d{2,5})\s+Image(?: No)?:\s+(sc[0-9\-]{3,14}).*/;
  let match = headTitle.match(volumePageRe);
  if ( match ) {
    ed.msaParts = 4;
    ed.msaTitle = match[1].trim();
    ed.msaTitle += ", " + match[2].trim();
    ed.msaTitle += ", " + match[3].trim();
    console.log("parseHtmlHeader 2: " + headTitle);
    let dashParts = headTitle.split("-");
    if (dashParts.length > 0) {
      ed.msaTitle += " - " + dashParts[1].trim();
    }
  } else {
    match = headTitle.match(carreerFilesRe);
    if (match) {
      ed.msaTitle = match[1];
      ed.msaCitation = "MSA " + match[3].toUpperCase();
    } else {
      let commaParts = headTitle.split(",");
      if (commaParts.length == 2) {
        ed.msaParts = 2;
        ed.msaRecordType = RT.Biography;
        ed.msaTitle = "Maryland State Archives, " + commaParts[0];
      }
    }
  }
}

function checkStoredDomNodes(msaDomNodes, ed) {
  let index = 0;
  if (!msaDomNodes) {
    return;
  }
  msaDomNodes.forEach(node => {
    if ((node == "Additional Info") &&
        (node[index+1] == "PREROGATIVE COURT") &&
        (node[index+2] == "(Wills)")) {
          ed.msaRecordType = RT.Will;

    } else if ((node == "Additional Info")  && ((index+4) < msaDomNodes.length)) {
      for (let j=index; j<=index+4; ++j) {
        if (node[j].includes("Inventories")) {
          ed.msaRecordType = RT.Probate;
	}
      }
    }
  });
}

function buildSourceTitle(ed, gd, builder) {

  let title = "";
  if (ed.msaTitle) {
    title += ": " + ed.msaTitle;
  } else {
    title = "Archives of Maryland";
  }

  builder.sourceTitle = title;
  builder.putSourceTitleInQuotes = false;
}

function buildSourceReference(ed, gd, builder) {
  builder.sourceReference = "";
  if (ed.msaParts == 4 && ed.msaVolume && ed.msaPage) {
    builder.sourceReference += ed.msaSR;
  }
  if (ed.msaCitation) {
    builder.sourceReference += " " + ed.msaCitation;
  }
  if (ed.msaPageViewerPage) {
    builder.sourceReference += " Page: " + ed.msaPageViewerPage;
  }
}

function buildRecordLink(ed, gd, builder) {
  var msaUrl = buildMsaUrl(ed, builder);

  let recordLink = "[" + msaUrl + " Maryland State Archives]";
  builder.recordLinkOrTemplate = recordLink;
}

function buildCoreCitation(ed, gd, builder) {
  parseHtmlHeader(ed.msaRawHeadTitle, ed);
  checkStoredDomNodes(ed.msaDomNodes, ed);
  if (ed.msaRecordType) {
    gd.recordType = ed.msaRecordType;
  }
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  builder.addStandardDataString(gd);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
