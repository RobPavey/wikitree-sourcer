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

function buildPsukUrl(ed, builder) {
  // could provide option to use a search style URL but don't see any reason to so far
  return "https://probatesearch.service.gov.uk/";
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle = "Probate record";
}

function buildSourceReference(ed, gd, builder) {
  builder.sourceReference = "England & Wales Probate Calendar";
  let probateYear = gd.inferEventYear();
  if (probateYear) {
    builder.sourceReference += " " + probateYear;
  }
  if (gd.probateData && gd.probateData.page) {
    builder.sourceReference += ", page " + gd.probateData.page;
  }
}

function buildRecordLink(ed, gd, builder) {
  var psukUrl = buildPsukUrl(ed, builder);

  let recordLink = "[" + psukUrl + " Probate Search/Find A Will (UK)]";
  builder.recordLinkOrTemplate = recordLink;
}

function addFullSentenceDataString(gd, builder) {
  let dataString = "";

  function addPart(string) {
    if (string) {
      if (dataString) {
        dataString += " ";
      }
      dataString += string;
    }
  }

  function addPeriod() {
    if (dataString && !dataString.endsWith(".")) {
      dataString += ".";
    }
  }

  function getSiteData(fieldName, defaultValue = "") {
    let value = defaultValue;
    if (gd.siteData) {
      if (gd.siteData[fieldName]) {
        value = gd.siteData[fieldName];
      }
    }
    return value;
  }

  addPart(gd.inferLastName().toUpperCase());
  addPart(gd.inferForenames());

  let residence = gd.inferResidencePlace();
  if (residence) {
    addPart("of");
    addPart(residence);
  }

  let status = getSiteData("status");
  if (status) {
    addPart(status);
  }

  let deathDate = gd.inferDeathDate();
  if (deathDate) {
    addPart("died");
    addPart(deathDate);
    let deathPlace = gd.inferDeathPlace();
    if (deathPlace) {
      addPart("at");
      addPart(deathPlace);
    }
  }
  addPeriod();

  addPart(getSiteData("entryType", "Probate"));
  addPart(gd.inferEventPlace());
  addPart(gd.inferEventDate());

  let grantedTo = getSiteData("grantedTo");
  if (grantedTo) {
    addPart("to");
    addPart(grantedTo);
  }

  let effects = getSiteData("effects");
  if (effects) {
    addPeriod();
    addPart("Effects");
    // add pound sign at start if not there
    effects = effects.replace(/^(\d)/, "£$1");
    addPart(effects);
  }

  addPeriod();
  builder.dataString = dataString;
}

function addAdditionalData(ed, gd, builder) {
  const options = builder.getOptions();
  let dataStyle = options.citation_psuk_dataStyle;

  switch (dataStyle) {
    case "string":
      builder.addStandardDataString(gd);
      break;
    case "fullSentence":
      addFullSentenceDataString(gd, builder);
      break;
    case "list":
      addFullSentenceDataString(gd, builder);
      break;
    case "table":
      addFullSentenceDataString(gd, builder);
      break;
  }
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  addAdditionalData(ed, gd, builder);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
