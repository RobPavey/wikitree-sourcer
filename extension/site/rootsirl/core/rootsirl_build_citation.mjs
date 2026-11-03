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
import { RootsirlEdReader } from "./rootsirl_ed_reader.mjs";

// e.g. "Church baptism" or "Civil death registration"
const recordDescriptions = {
  bch: "church baptism",
  bcv: "civil birth registration",
  mch: "church marriage",
  mcv: "civil marriage registration",
  dch: "church burial",
  dcv: "civil death registration",
};

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function buildRootsirlUrl(ed) {
  // The short form of the record URL (recordid, type and recordCentre) opens the record directly
  return ed.shortUrl ? ed.shortUrl : ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  builder.sourceTitle = "Roots Ireland";
  builder.putSourceTitleInQuotes = false;
}

function buildSourceReference(ed, gd, builder) {
  let description = recordDescriptions[ed.recordTypeCode];
  if (description && builder.type == "source") {
    builder.addSourceReferenceText(capitalize(description));
  }

  // where the register comes from: a church parish, or a civil registration district
  let reader = new RootsirlEdReader(ed);
  if (!reader.recordTypeData) {
    return; // not a record page we understand, e.g. the reCAPTCHA page
  }
  let place = "";
  let county = ed.recordData && ed.recordData["County"] ? ed.recordData["County"].replace(/^co\.?\s+/i, "") : "";
  if (reader.isChurchRecord()) {
    let parish = reader.getParishName();
    if (parish) {
      place = parish + (county ? ", County " + county : "");
    } else if (county) {
      place = "County " + county;
    }
    let denomination = ed.recordData ? ed.recordData["Denomination"] : "";
    if (denomination) {
      builder.addSourceReferenceField("Denomination", denomination);
    }
    builder.addSourceReferenceField("Parish", place);
  } else {
    let district = reader.getDistrictName();
    if (district) {
      place = district + (county ? ", County " + county : "");
    } else if (county) {
      place = "County " + county;
    }
    builder.addSourceReferenceField("Registration district", place);
  }

  // the county genealogy centre that transcribed the record (taken from the record's copyright line)
  if (ed.copyrightOwner) {
    builder.addSourceReferenceField("Transcribed by", ed.copyrightOwner);
  }

  if (ed.recordId) {
    builder.addSourceReferenceField("Record ID", ed.recordId);
  }
}

function buildRecordLink(ed, gd, builder) {
  let options = builder.getOptions();
  let url = buildRootsirlUrl(ed);

  let recordLink = "[" + url + " Roots Ireland record]";

  let subReq = builder.getSubReqString(options.citation_rootsirl_subscriptionRequired);
  if (subReq) {
    recordLink += " (" + subReq + ")";
  }
  builder.recordLinkOrTemplate = recordLink;

  if (ed.microfilmLink && options.citation_rootsirl_includeMicrofilmLink) {
    builder.externalSiteLink = "[" + ed.microfilmLink + " National Library of Ireland parish register]";
  }
}

function appendSentence(builder, text) {
  if (!text) {
    return;
  }
  if (builder.dataString && !/[.!?]$/.test(builder.dataString.trim())) {
    builder.dataString = builder.dataString.trim() + ".";
  }
  builder.dataString = (builder.dataString ? builder.dataString.trim() + " " : "") + text;
}

function buildDataString(ed, gd, builder) {
  builder.addStandardDataString(gd);

  // sponsors, witnesses or informant, e.g. "Sponsors: James Smith, Mary Smith"
  let reader = new RootsirlEdReader(ed);
  let otherPeople = reader.recordTypeData ? reader.getOtherPeople() : [];
  if (otherPeople.length) {
    const plurals = { Sponsor: "Sponsors", Witness: "Witnesses", Informant: "Informants" };
    let role = otherPeople.length > 1 ? plurals[otherPeople[0].role] : otherPeople[0].role;
    appendSentence(builder, role + ": " + otherPeople.map((person) => person.name).join(", ") + ".");
  }

  // The notes often hold details that are not in any other field, such as where a marriage actually took place,
  // the priest, or (for some centres) the informant and cause of death. They are added as written.
  if (ed.notes) {
    let lines = ed.notes
      .split("\n")
      .map((line) =>
        line
          .replace(/\s+/g, " ")
          .replace(/[\s.]+$/, "")
          .trim()
      )
      .filter(Boolean);
    if (lines.length) {
      appendSentence(builder, "Notes: " + lines.join("; ") + ".");
    }
  }
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  buildDataString(ed, gd, builder);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
