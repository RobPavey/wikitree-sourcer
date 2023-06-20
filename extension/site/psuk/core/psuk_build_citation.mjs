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

function isSoldierRecord(ed) {
  if (ed.digitalRecordData) {
    // all soldier record are transcribed
    let wasSoldier = ed.searchData["Was the person a soldier"];
    if (wasSoldier && wasSoldier == "Yes") {
      return true;
    }
  }
  return false;
}

function buildPsukUrl(ed, builder) {
  // could provide option to use a search style URL but don't see any reason to so far
  return "https://probatesearch.service.gov.uk/";
}

function buildSourceTitle(ed, gd, builder) {
  if (isSoldierRecord(ed)) {
    builder.sourceTitle = "Index to soldiers' wills (1850-1986)";
  } else if (ed.isImage) {
    builder.sourceTitle = "England and Wales, Index to wills and administrations (1858-1995)";
  } else {
    builder.sourceTitle = "England and Wales, Index to wills and administrations (1996 to present)";
  }
}

function buildSourceReference(ed, gd, builder) {
  if (isSoldierRecord(ed)) {
    builder.sourceReference = "Wills of soldiers who died while serving in the British Armed Forces";
  } else if (ed.isImage) {
    builder.sourceReference = "England & Wales National Probate Calendar";
    let probateYear = gd.inferEventYear();
    if (probateYear) {
      builder.sourceReference += " " + probateYear;
    }
    if (gd.siteData && gd.siteData.page) {
      builder.sourceReference += ", page " + gd.siteData.page;
    }
  } else {
    let probateYear = gd.inferEventYear();
    if (probateYear) {
      builder.sourceReference = "Probate year: " + probateYear;
    }
    if (ed.digitalRecordData) {
      let probateNumber = ed.digitalRecordData["Probate number"];
      if (probateNumber) {
        if (builder.sourceReference) {
          builder.sourceReference += "; ";
        }
        builder.sourceReference += "Probate number: " + probateNumber;
      }
    }
  }
}

function buildRecordLink(ed, gd, builder) {
  var psukUrl = buildPsukUrl(ed, builder);

  let recordLink = "[" + psukUrl + " Probate Search/Find A Will (UK)]";
  builder.recordLinkOrTemplate = recordLink;
}

function addFullSentenceDataString(ed, gd, builder) {
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

  function addDigitalRecordField(fieldName) {
    if (ed.digitalRecordData) {
      let value = ed.digitalRecordData[fieldName];
      if (value) {
        dataString = builder.addKeyValuePairToDataListString(dataString, fieldName, value);
      }
    }
  }

  addPart(gd.inferLastName().toUpperCase());
  addPart(gd.inferForenames());
  addPart(getSiteData("aka"));

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
    if (isSoldierRecord(ed)) {
      addPart("while serving in the British armed forces");
    }
    addPart(deathDate);
    let deathPlace = gd.inferDeathPlace();
    if (deathPlace) {
      addPart("at"); // preposition doesn't always sound right but "at" always used in image
      addPart(deathPlace);
    }
  }
  addPeriod();

  if (ed.isImage) {
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

      if (effects != "£") {
        // add pound sign at start if not there
        if (!effects.startsWith("£")) {
          let lcEffects = effects.toLowerCase();
          if (lcEffects.startsWith("not exceeding")) {
            if (!effects.includes("£")) {
              effects = effects.replace(/^(Not exceeding)\s+(\d)/i, "$1 £$2");
            }
          } else {
            effects = "£" + effects;
          }
        }
        addPart(effects);
      }
    }

    addPart(getSiteData("extraInfo"));
    addPart(getSiteData("reference"));
  } else {
    if (isSoldierRecord(ed)) {
      addDigitalRecordField("Regiment number");
    } else {
      addDigitalRecordField("Date of probate");
      addDigitalRecordField("Probate number");
      addDigitalRecordField("Document type");
      addDigitalRecordField("Registry office");
    }
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
      addFullSentenceDataString(ed, gd, builder);
      break;
    case "list":
      break;
    case "table":
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
