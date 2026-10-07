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

import { CitationBuilder } from "../../../base/core/citation_builder.mjs";
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";

function buildYorkshireburialsUrl(ed, builder) {
  if (ed.recordUrl) {
    return ed.recordUrl;
  }
  return ed.url;
}

function getFullName(ed, gd) {
  const fullName = gd.inferFullName();
  if (fullName) {
    return fullName;
  }
  return ed.name;
}

function getPlaceString(gd) {
  if (gd.eventPlace && gd.eventPlace.placeString) {
    return gd.eventPlace.placeString;
  }
  return "";
}

function getFullResidence(ed, gd) {
  if (gd.residencePlace && gd.residencePlace.placeString) {
    return gd.residencePlace.placeString;
  }
  return ed.residence ? ed.residence.replace(/[\s.,]+$/, "") : "";
}

function getAgeString(gd) {
  return gd.ageAtDeath ? gd.ageAtDeath : "";
}

function formatDate(gd, dateObj, format, highlight) {
  if (!dateObj) {
    return "";
  }
  return gd.getNarrativeDateFormat(dateObj, format, highlight, false);
}

function getPossessivePronoun(ed, gd) {
  let sex = ed.sex ? ed.sex.toLowerCase() : "";
  if (sex != "male" && sex != "female") {
    // Older registers have no sex column so predict it from the forenames
    let forenames = gd.inferForenames();
    if (forenames && StringUtils.isAllUppercase(forenames)) {
      forenames = NameUtils.convertNameFromAllCapsToMixedCase(forenames);
    }
    sex = NameUtils.predictGenderFromGivenNames(forenames);
    if (!sex && forenames) {
      // Registers often abbreviate names, e.g. "Wm" or "Thos."
      let expanded = forenames.split(" ").map((name) => {
        let base = name.replace(/\.$/, "");
        return NameUtils.convertEnglishGivenNameFromAbbrevationToFull(base) || base;
      });
      sex = NameUtils.predictGenderFromGivenNames(expanded.join(" "));
    }
  }
  if (sex == "male") {
    return "His";
  }
  if (sex == "female") {
    return "Her";
  }
  return "Their";
}

////////////////////////////////////////////////////////////////////////////////
// Citation parts
////////////////////////////////////////////////////////////////////////////////

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle = "Yorkshire Burials";
}

function buildSourceReference(ed, gd, builder) {
  const options = builder.getOptions();

  let locationParts = [];
  for (let part of [ed.cemetery, ed.parish, ed.county]) {
    if (part) {
      locationParts.push(part);
    }
  }
  builder.addSourceReferenceText(locationParts.join(", "));

  if (options.citation_yorkshireburials_includeGraveReference) {
    builder.addSourceReferenceField("Grave", ed.graveReference);
  }
  if (options.citation_yorkshireburials_includeRegisterReference) {
    builder.addSourceReferenceField("Register", ed.registerReference);
  }
}

function buildRecordLink(ed, gd, builder) {
  const yorkshireburialsUrl = buildYorkshireburialsUrl(ed, builder);

  let linkText = "Yorkshire Burials Record";
  if (!ed.recordUrl) {
    linkText = "Yorkshire Burials Search";
  }
  builder.recordLinkOrTemplate = "[" + yorkshireburialsUrl + " " + linkText + "]";
}

// e.g. "Alan Smith burial (died age 41) on 20 Apr 1875 in Beckett Street Cemetery, Leeds, Yorkshire, England."
function buildDataSentence(ed, gd, builder) {
  const options = builder.getOptions();
  const dateFormat = options.citation_general_dataStringDateFormat;

  let dataString = getFullName(ed, gd) + " burial";

  const age = getAgeString(gd);
  const burialDate = formatDate(gd, gd.eventDate, dateFormat, false);
  const deathDate = formatDate(gd, gd.deathDate, dateFormat, false);

  if (burialDate) {
    if (age) {
      dataString += " (died age " + age + ")";
    }
    dataString += " on " + burialDate;
  } else if (deathDate) {
    dataString += " (died on " + deathDate;
    if (age) {
      dataString += " at age " + age;
    }
    dataString += ")";
  } else if (age) {
    dataString += " (died age " + age + ")";
  }

  const place = getPlaceString(gd);
  if (place) {
    dataString += " in " + place;
  }

  builder.dataString = dataString + ".";
}

function buildDataList(ed, gd, builder) {
  const fields = [
    { key: "Name", value: ed.name },
    { key: "Sex", value: ed.sex },
    { key: "Age", value: ed.age },
    { key: "Date of Death", value: ed.deathDate },
    { key: "Date of Burial", value: ed.burialDate },
    { key: "Disease", value: ed.disease },
    { key: "Rank, Trade, or Profession", value: ed.trade },
    { key: "Residence", value: getFullResidence(ed, gd) },
    { key: "Where Born", value: ed.whereBorn },
    { key: "Parents", value: ed.parentsNames },
    { key: "Addition of Father or Mother", value: ed.parentsOccupation },
    { key: "Informant", value: ed.informant },
    { key: "Officiating Minister", value: ed.minister },
  ];
  builder.addListDataString(fields.filter((field) => field.value));
}

function buildDataString(ed, gd, builder) {
  const dataStyle = builder.getOptions().citation_yorkshireburials_dataStyle;

  if (dataStyle == "string") {
    buildDataSentence(ed, gd, builder);
  } else if (dataStyle == "list") {
    buildDataList(ed, gd, builder);
  }
}

////////////////////////////////////////////////////////////////////////////////
// Narrative
////////////////////////////////////////////////////////////////////////////////

// e.g. "Alan Smith (age 41) died on 16 April 1875 and was buried on 20 April 1875 in
// Beckett Street Cemetery, Leeds, Yorkshire, England. His last residence was Cavalier Street."
function buildNarrativeText(ed, gd, options) {
  const dateFormat = options.narrative_general_dateFormat;
  const highlight = options.narrative_general_dateHighlight;

  const burialDate = formatDate(gd, gd.eventDate, dateFormat, highlight);
  const deathDate = formatDate(gd, gd.deathDate, dateFormat, highlight);
  if (!burialDate && !deathDate) {
    return "";
  }

  let narrative = getFullName(ed, gd);

  const age = getAgeString(gd);
  if (age) {
    narrative += " (age " + age + ")";
  }

  if (deathDate && burialDate) {
    narrative += " died on " + deathDate + " and was buried on " + burialDate;
  } else if (burialDate) {
    narrative += " was buried on " + burialDate;
  } else {
    narrative += " died on " + deathDate;
  }

  const place = getPlaceString(gd);
  if (place) {
    narrative += " in " + place;
  }
  narrative += ".";

  const residence = getFullResidence(ed, gd);
  if (residence) {
    narrative += " " + getPossessivePronoun(ed, gd) + " last residence was " + residence + ".";
  }

  return narrative;
}

function addNarrative(ed, gd, builder, dataCache) {
  const options = builder.getOptions();

  // A narrative the user has edited in the popup takes priority
  if (!(gd.userOverrideForNarrative && gd.userOverrideForNarrative.trim())) {
    const narrative = buildNarrativeText(ed, gd, options);
    if (narrative) {
      builder.narrative = narrative;
      return;
    }
  }

  builder.addNarrative(gd, dataCache, options);
}

////////////////////////////////////////////////////////////////////////////////
// Main entry point
////////////////////////////////////////////////////////////////////////////////

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  buildDataString(ed, gd, builder);
}

function buildCitation(input) {
  const ed = input.extractedData;
  const gd = input.generalizedData;
  const type = input.type; // "inline", "narrative" or "source"

  let builder = new CitationBuilder(type, input.runDate, input.options);
  if (input.householdTableString) {
    builder.householdTableString = input.householdTableString;
  }

  buildCoreCitation(ed, gd, builder);
  builder.meaningfulTitle = gd.getRefTitle();

  if (type == "narrative") {
    addNarrative(ed, gd, builder, input.dataCache);
  }

  return builder.getCitationObject(gd, ed.url);
}

export { buildCitation };
