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
import { RT } from "../../../base/core/record_type.mjs";
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

function isCremation(gd) {
  return gd.recordType == RT.Cremation;
}

// e.g. "Felix John BATTERSBY" becomes "Felix John Battersby"
function getMixedCaseName(name) {
  if (!name) {
    return "";
  }
  return name
    .split(" ")
    .map((word) => {
      if (/^[A-Z][A-Z'’-]*[A-Z]$/.test(word)) {
        return NameUtils.convertNameFromAllCapsToMixedCase(word);
      }
      return word;
    })
    .join(" ");
}

function getSex(ed, gd) {
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
  return sex == "male" || sex == "female" ? sex : "";
}

function getPossessivePronoun(ed, gd) {
  const sex = getSex(ed, gd);
  if (sex == "male") {
    return "His";
  }
  if (sex == "female") {
    return "Her";
  }
  return "Their";
}

// e.g. "Felix John Battersby (executor) of Watendlath, Tinshill Lane, Horsforth"
function getApplicantString(ed) {
  if (!ed.applicantName) {
    return "";
  }
  let applicant = getMixedCaseName(ed.applicantName);
  const details = [ed.applicantRelation, ed.applicantOccupation].filter(Boolean);
  if (details.length) {
    applicant += " (" + details.join(", ") + ")";
  }
  if (ed.applicantAddress) {
    applicant += " of " + ed.applicantAddress.replace(/[\s.,]+$/, "");
  }
  return applicant;
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

// e.g. "Annie Bagshaw died on 31 Oct 1918 at age 29, and was buried on 4 Nov 1918 in Leeds General Cemetery
// (Woodhouse), Leeds, Yorkshire, England." or, with no death date,
// "John Smith was buried on 20 Apr 1875 at age 41 in Beckett Street Cemetery, Leeds, Yorkshire, England."
function getEventSentence(ed, gd, options) {
  const dateFormat = options.citation_general_dataStringDateFormat;
  const cremation = isCremation(gd);

  const age = getAgeString(gd);
  const ageString = age ? " at age " + age : "";
  const eventDate = formatDate(gd, gd.eventDate, dateFormat, false);
  const deathDate = formatDate(gd, gd.deathDate, dateFormat, false);

  let sentence = getFullName(ed, gd);
  let eventClause = cremation ? "was cremated" : "was buried";
  if (eventDate) {
    eventClause += " on " + eventDate;
  }

  if (deathDate) {
    sentence += " died on " + deathDate + ageString + ", and " + eventClause;
  } else {
    sentence += " " + eventClause + ageString;
  }

  const place = getPlaceString(gd);
  if (place) {
    sentence += (cremation ? " at " : " in ") + place;
  }
  return sentence + ".";
}

function buildDataSentence(ed, gd, builder) {
  const options = builder.getOptions();
  let dataString = getEventSentence(ed, gd, options);

  if (options.citation_yorkshireburials_includeAdditionalDetails) {
    const details = getAdditionalDetails(ed, gd);
    if (details.length) {
      const useBreaks = options.citation_general_target == "wikitree" && options.citation_general_addBreaksWithinBody;
      let separator = useBreaks ? "<br/>" : "; ";
      if (useBreaks && builder.type != "source" && options.citation_general_addNewlinesWithinBody) {
        separator += "\n";
      }
      dataString += (useBreaks ? separator : " ") + details.join(separator);
    }
  }

  builder.dataString = dataString;
}

function getParentsString(ed) {
  if (!ed.parentsNames) {
    return "";
  }
  let parents = getMixedCaseName(ed.parentsNames);
  if (ed.parentsOccupation) {
    parents += " (" + ed.parentsOccupation + ")";
  }
  return parents;
}

// e.g. ["Parents' names: James & Jane Ellen Holmes (Iron Founder)", "Where born: Leeds"]
function getAdditionalDetails(ed, gd) {
  const fields = [
    { label: "Parents' names", value: getParentsString(ed) },
    { label: "Where born", value: ed.whereBorn },
    { label: "Residence", value: getFullResidence(ed, gd) },
    { label: "Disease", value: ed.disease },
    { label: "Rank/Profession", value: ed.trade },
    { label: "Marital status", value: ed.maritalStatus },
    { label: "Death registered in", value: ed.deathRegistrationDistrict },
    { label: "Ashes", value: ed.ashesDisposal },
    { label: "Applicant", value: getApplicantString(ed) },
    { label: "Informant", value: getMixedCaseName(ed.informant) },
    { label: "Minister", value: ed.minister },
  ];
  return fields.filter((field) => field.value).map((field) => field.label + ": " + field.value);
}

function buildDataList(ed, gd, builder) {
  const fields = [
    { key: "Name", value: ed.name },
    { key: "Sex", value: ed.sex },
    { key: "Age", value: ed.age },
    { key: "Date of Death", value: ed.deathDate },
    { key: "Date of Burial", value: ed.burialDate },
    { key: "Date of Cremation", value: ed.cremationDate },
    { key: "District where Death Registered", value: ed.deathRegistrationDistrict },
    { key: "Disease", value: ed.disease },
    { key: "Occupation", value: ed.trade },
    { key: "Marital Status", value: ed.maritalStatus },
    { key: "Residence", value: getFullResidence(ed, gd) },
    { key: "Where Born", value: ed.whereBorn },
    { key: "Parents", value: ed.parentsNames },
    { key: "Addition of Father or Mother", value: ed.parentsOccupation },
    { key: "Informant", value: ed.informant },
    { key: "Officiating Minister", value: ed.minister },
    { key: "Applicant for Cremation", value: getApplicantString(ed) },
    { key: "How Ashes were Disposed of", value: ed.ashesDisposal },
    { key: "Receipt No.", value: ed.receiptNumber },
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

// The other details are only included in the citation, e.g.
// "Alan Smith burial (died on 16 Apr 1875 at age 41) on 20 Apr 1875 in Beckett Street Cemetery, Leeds,
// Yorkshire, England. Cause of death: Phthisis. His last residence was Cavalier Street, Leeds, Yorkshire, England."
function buildNarrativeText(ed, gd, options) {
  if (!gd.eventDate && !gd.deathDate) {
    return "";
  }

  let narrative = getEventSentence(ed, gd, options);

  if (ed.disease) {
    narrative += " Cause of death: " + ed.disease.replace(/[\s.]+$/, "") + ".";
  }

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
