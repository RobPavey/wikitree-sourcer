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
import { RiksarkEdReader } from "./riksark_ed_reader.mjs";

function buildRiksarkUrl(ed, builder) {
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle = "Riksarkivet";
}

function buildSourceReference(ed, gd, builder) {
  function addSourceReferenceKeyValuePair(edReader, keys) {
    let entry = edReader.getRecordDataKeyAndValueForKeys(keys);
    if (entry) {
      builder.addSourceReferenceField(entry.key, entry.value);
    }
  }

  if (gd.sourceType == "image") {
    if (ed.imagePageSourceReference) {
      builder.sourceReference = ed.imagePageSourceReference;
    }
  } else {
    builder.sourceReference = ed.recordType;
    if (ed.recordData) {
      let edReader = new RiksarkEdReader(ed);
      if (edReader.hasValidData()) {
        addSourceReferenceKeyValuePair(edReader, ["Archive", "Arkiv", "Archives"]);
        addSourceReferenceKeyValuePair(edReader, ["Volume", "Volym"]);
        addSourceReferenceKeyValuePair(edReader, ["Volume's reference code", "Volymens referenskod"]);
        addSourceReferenceKeyValuePair(edReader, ["Register"]);
        addSourceReferenceKeyValuePair(edReader, ["Created by", "Upprättad av"]);
      }
    }
  }
}

function buildRecordLink(ed, gd, builder) {
  let linkOption = builder.options.citation_riksark_includeLink;

  if (linkOption == "none") {
    return;
  }

  let riksarkUrl = buildRiksarkUrl(ed, builder);

  let recordLink = "";

  if (linkOption == "inSourceTitleOnly" || linkOption == "inSourceTitlePlus") {
    builder.putRecordLinkInTitle = true;
    recordLink = riksarkUrl;
  } else if (linkOption == "separate" || linkOption == "separateOneLink") {
    if (gd.sourceType == "image") {
      recordLink = "[" + riksarkUrl + " Riksarkivet Image]";
    } else {
      recordLink = "[" + riksarkUrl + " Riksarkivet Record]";
    }
  }

  if (recordLink) {
    builder.recordLinkOrTemplate = recordLink;
  }
}

function buildImageLink(ed, gd, builder) {
  let linkOption = builder.options.citation_riksark_includeLink;
  if (linkOption == "none") {
    return;
  }

  if (linkOption == "separateOneLink" || linkOption == "inSourceTitleOnly") {
    return;
  }

  if (ed.imageLink) {
    let url = ed.imageLink;

    if (!url.startsWith("http")) {
      url = "https://sok.riksarkivet.se" + url;
    }

    let imageLink = "[" + url + " Riksarkivet Image]";
    builder.imageLink = imageLink;
  }
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  buildImageLink(ed, gd, builder);

  if (gd.sourceType != "image" || gd.name) {
    builder.addStandardDataString(gd);
  }
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
