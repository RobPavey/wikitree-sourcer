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
//import { RT } from "../../../base/core/record_type.mjs";
import { simpleBuildCitationWrapper } from "../../../base/core/citation_builder.mjs";
import { PanbEdReader } from "./panb_ed_reader.mjs";

function buildPanbUrl(ed, builder) {
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  let options = builder.getOptions();
  if (ed.hasImage) {
    builder.databaseHasImages = true;
  }
  builder.sourceTitle = ed.tableTitle
}

function buildSourceReference(ed, gd, builder) {
  let recordSourceReference = "";
  let srCode = ed.recordData["Code"];
  let hasMicrofilm = true;
  let needsFinishing = true;
  if (ed.eventType == "Birth") {
    if (ed.databaseID == "RS141A5") {
      let regBirthNumberString = ed.recordData["Number"];
      recordSourceReference = "Registration Number: " + regBirthNumberString + ", Code: " + srCode;
    }
    else {
      recordSourceReference = "Registration Code: " + srCode;
    }
  }
  else if (ed.eventType == "Marriage") {
    let regNumberString = ed.recordData["Number"];
    if (regNumberString && regNumberString != "" && regNumberString.slice(0, 1) != "-") {
      recordSourceReference = "Registration Number: " + regNumberString + ", Code: " + srCode;
    }
    else {
      recordSourceReference = "Code: " + srCode;
    }
  }
  if (ed.eventType == "Death") {
    // Each type of RS141 death record has a different format for "Builder.sourceReference"
    if (ed.databaseID == "RS141C1") {
      let referenceString = ed.recordData["Reference"];
      recordSourceReference = "Registration Code " + srCode;
    }
    else if (ed.databaseID == "RS141C4") {
      let referenceString = ed.recordData["Reference"];
      recordSourceReference = "Registration Code " + srCode + ", Reference: " + referenceString;
      let volumeString = ed.recordData["Volume"];
      if (volumeString != "") {
        recordSourceReference += ",  Volume: " + volumeString;
      }
    }
    else if (ed.databaseID == "RS141C5") {
      let srRegCode = ed.recordData["Registration"];
      let volumeString = ed.recordData["Volume"];
      recordSourceReference = "Registration Code " + srRegCode + ", Volume: " + volumeString;
    }
    else if (ed.databaseID == "RS141C6") {
      let deathDateString = ed.recordData["Date of Death"];
      //let dateString = eventDateString;
      let killedString = ed.recordData["Killed"];
      builder.sourceReference = ", " + deathDateString + ", combat death in " + killedString;
      hasMicrofilm = false;
      needsFinishing = false;
    }
  }
  let gdMicrofilmString = "";
  if (hasMicrofilm) {
    gdMicrofilmString = ed.recordData["Microfilm"];
    if (gdMicrofilmString && gdMicrofilmString != "") {
      recordSourceReference += ", Microfilm " + gdMicrofilmString;
    }
  }

  if (needsFinishing) {
    let edReader = new PanbEdReader(ed);
    let eventDateString = ed.recordData["Date"];
    let dateString = eventDateString;
    let placeString = edReader.getEventPlaceObj().placeString;
    builder.sourceReference = recordSourceReference + ", " + dateString + ", " + placeString;
  }
}

function buildRecordLink(ed, gd, builder) {
  var panbUrl = buildPanbUrl(ed, builder);
  let recordLink = "[" + panbUrl + " New Brunswick Provincial Archives:]" + " Vital Statistics from Government Records (RS141)";
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
