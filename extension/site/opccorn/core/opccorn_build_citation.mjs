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

import { simpleBuildCitationWrapper } from "../../../base/core/citation_builder.mjs";

import { OpccornEdReader } from "./opccorn_ed_reader.mjs";

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle += "Cornwall Online Parish Clerks Database";
}

function buildSourceReference(ed, gd, builder) {
  builder.sourceReference = "";
  const inThe = " in the ";
  const inTheIndex = ed.title.indexOf(inThe);
  if (inTheIndex != -1) {
    builder.sourceReference = ed.title.substring(inTheIndex + inThe.length);
  }

  let prd = ed.recordData["Parish Or Reg District"];
  if (prd) {
    builder.sourceReference += ", " + prd;
  } else {
    let pcc = ed.recordData["Parish Circuit Or Chapel"];
    if (pcc) {
      builder.sourceReference += ", " + pcc;
    }
  }
}

function buildRecordLink(ed, gd, builder) {
  let options = builder.getOptions();

  let recordLink = "";

  switch (options.citation_opccorn_linkStyle) {
    case "record": {
      recordLink = "[" + ed.url + " Cornwall OPC Record]";
      break;
    }
    case "database": {
      let edReader = new OpccornEdReader(ed);
      recordLink = "[" + edReader.getSearchDatabaseUrl() + " Cornwall OPC]";
      break;
    }
    case "content": {
      recordLink = "[https://www.cornwall-opc-database.org/ Cornwall OPC]";
      break;
    }
    case "url_content": {
      recordLink = "https://www.cornwall-opc-database.org/";
      break;
    }
  }

  builder.recordLinkOrTemplate = recordLink;
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  builder.addStandardDataString(gd);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
