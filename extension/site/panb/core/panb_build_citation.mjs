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
import { DataString } from "../../../base/core/data_string.mjs";
import { PanbEdReader } from "./panb_ed_reader.mjs";

function buildPanbUrl(ed, builder) {
  return ed.url;
}

function buildSourceTitle(ed, gd, builder) {
  if (ed.hasImage) {
    builder.databaseHasImages = true;
  }
  builder.sourceTitle = ed.tableTitle;
}

function buildSourceReference(ed, gd, builder) {
  let edReader = new PanbEdReader(ed);
  let recordSourceReference = ed.sourceTitle;
  let srCode = ed.recordData["Code"];
  let hasCode = !(!srCode || srCode == "");
  let srBook = ed.recordData["Book"];
  let hasBook = !(!srBook || srBook == "");
  let srPage = ed.recordData["Page"];
  let hasPage = !(!srPage || srPage == "");
  let srRegistration = ed.recordData["Registration"];
  let hasRegistration = !(!srRegistration || srRegistration == "");

  let regBirthNumberString = ed.recordData["Number"];
  let hasRegBirthNumber = !(!regBirthNumberString || regBirthNumberString == "");
  let hasMicrofilm = (ed.recordData["Microfilm"] !== "");
  let needsFinishing = true;

  if (ed.eventType == "Birth") {
    if (ed.databaseID == "RS141A5" && hasRegBirthNumber) {
      recordSourceReference += "; Registration Number: " + regBirthNumberString;
      if (hasCode) {
        recordSourceReference += "; Code: " + srCode;
      }
    }
    else if (ed.databaseID == "RS141A2/2"  && hasPage) {
      // RS141A2/2 on new web site has a small table with "Page", "Number", "Code" and "Book" values

      if (hasCode) {
        recordSourceReference += "; Book identifcation: " + srCode;
      }
      if (ed.databaseID == "RS141A2/2" && hasBook ) {
        recordSourceReference += "-" + srBook;
      }      
      if (hasPage) {
        recordSourceReference += "; Page: " + srPage;
      }
      if (hasRegBirthNumber) {
        recordSourceReference += "; Birth Number: " + regBirthNumberString;
      }
    }
    else if (hasCode) {
      if(ed.databaseID == "RS141A1b") {
        recordSourceReference += "; Registration Code: " + srCode;
      }
      else {
        recordSourceReference += "; Code: " + srCode;
      }
    }
  }
  else if (ed.eventType == "Marriage") {
    let regNumberString = ed.recordData["Number"];
    if (regNumberString && regNumberString != "" && regNumberString.slice(0, 1) != "-") {
      recordSourceReference += "; Registration Number: " + regNumberString;
      if (hasCode) {
        recordSourceReference += "; Code: " + srCode;
      }
    }
    else if(hasCode) {
      recordSourceReference = "; Code: " + srCode;
    }
  }
  else if (ed.eventType == "Death") {
    // Each type of RS141 death record has a different format for "Builder.sourceReference"
    if (ed.databaseID == "RS141C1") {
      let referenceString = ed.recordData["Reference"];
      if (referenceString && referenceString != "" && referenceString.slice(0, 1) != "-") {
        recordSourceReference += "; Registration Code: " + srCode;
      }
      if(hasPage) {
        recordSourceReference += "; Page: " + srPage;
      }
      let lineString = ed.recordData["Line"];
      if (lineString && lineString != "") {
        recordSourceReference += "; Line: " + lineString;
      }
      if (referenceString && referenceString != "") {
        recordSourceReference += "; Reference: " + referenceString;
      }
    }
    else if (ed.databaseID == "RS141C4") {
      if(hasCode) {
        recordSourceReference = "; RegistrationCode: " + srCode;
      }
      let referenceString = ed.recordData["Reference"];
      if (referenceString == !"") { 
        recordSourceReference += " ; Reference: " + referenceString;
      }
      else if (hasRegistration) {
        recordSourceReference += "; Registration Number: " + srRegistration;
      }
      let volumeString = ed.recordData["Volume"];
      if (volumeString != "") {
        recordSourceReference += "; Volume: " + volumeString;
      }
    }
    else if (ed.databaseID == "RS141C5") {
      let srRegCode = ed.recordData["Registration"];
      let volumeString = ed.recordData["Volume"];
      recordSourceReference += "; Registration Code: " + srRegCode + "; Volume: " + volumeString;
    }
    else if (ed.databaseID == "RS141C6") {
      // RS141C6 is a special case, it is a death registration of soldiers, 1941-1947 and is now only supported through the PANB web site.  It has a different parameters than the older RS141 web site.  The RS141C6 record has a different structure for its Url, and the "Residence". "Date" and "Killed" fields are used to build the source reference.

      let eventDateString = ed.recordData["Date"];
      let diedString = ed.recordData["Place"];
      if (edReader.webpageFormat == 202601) {
        eventDateString = edReader.recordData["Date of Death"];
        diedString = edReader.recordData["Killed"];
      }
      let residenceString = ed.recordData["Residence"];
      recordSourceReference += "; Residence: " + residenceString;
      recordSourceReference += "; Date: " + eventDateString;
      recordSourceReference += "; Place: " + diedString;
      hasMicrofilm = true;
      needsFinishing = false;
    }
  }

  let gdMicrofilmString = "";
  if (hasMicrofilm) {
    gdMicrofilmString = ed.recordData["Microfilm"];
    if (gdMicrofilmString && gdMicrofilmString != "") {
      //if (recordSourceReference != "") {
        recordSourceReference += "; ";
      //}
      recordSourceReference += "Microfilm: " + gdMicrofilmString;
    }
  }

  if (needsFinishing) {
    //let edReader = new PanbEdReader(ed);
    let eventDateString = edReader.recordData["Date"]; 
    let dateString = eventDateString;
    // Try let dateString = edReader.getEventDateObj().getDataStringFormat("short", false);
    let placeString = edReader.getEventPlaceObj().placeString;
    recordSourceReference += "; Date:" + dateString + "; Place: " + placeString;
  }

  builder.addSourceReferenceText(recordSourceReference);
}

function buildRecordLink(ed, gd, builder) {
  var panbUrl = buildPanbUrl(ed, builder);
  let recordLink = "[" + panbUrl + " New Brunswick Provincial Archives]";
  builder.recordLinkOrTemplate = recordLink;
}

function buildDataString(ed, gd, builder) {
  let edReader = new PanbEdReader(ed);
  if ((gd.webpageFormat == 202606) && (ed.databaseID == "RS141C1")) {
    let tempString = edReader.recordData["Date"];
    let deathDateObj = edReader.makeDateObjFromDateString(tempString);
    let deathDateString = deathDateObj.getDataStringFormat("short", false);
    let residenceString = "";
    let tmpString = edReader.recordData["Residence"];
    if (tmpString != "") {
      residenceString = " of " + tmpString[0] + tmpString.slice(1).toLowerCase();
    }
    tmpString = edReader.recordData["County of Residence"];
    if (tmpString != "") {
      residenceString += ", " + tmpString[0] + tmpString.slice(1).toLowerCase();
    }
    let diedString = edReader.recordData["Place"];
    if (diedString != "") {
    diedString = diedString[0] + diedString.slice(1).toLowerCase();
    }
    tmpString = edReader.recordData["County of Death"];
    if (tmpString != "") {
      diedString += ", " + tmpString[0] + tmpString.slice(1).toLowerCase();
    }
    let bornString = edReader.recordData["Place of Birth"];
    if (bornString != "") {
    bornString = bornString[0] + bornString.slice(1).toLowerCase();
    }
    tmpString = edReader.recordData["County of Birth"];
    if (tmpString != "") {
      bornString += ", " + tmpString[0] + tmpString.slice(1).toLowerCase();
    }
    let listString = gd.name.name + residenceString + " born in "+ bornString + " death (age " + gd.ageAtDeath + ") " + deathDateString + " in " + diedString + ".";
    //let dataString = buildDataList(ed, gd, edReader, builder); 
    builder.dataString = listString;
  }
  else if (ed.databaseID == "RS141C6") {
    //let eventDateString = edReader.recordData["Date of Death"];
    let tempLabel = "Date";
    if (gd.webpageFormat == 202601) {
      tempLabel = "Date of Death";
    }
    let tempString = edReader.recordData[tempLabel];
    let deathDateObj = edReader.makeDateObjFromDateString(tempString);
    let deathDateString = deathDateObj.getDataStringFormat("short", false);
    let diedString = edReader.recordData["Place"];
    if (!diedString) {
      diedString = edReader.recordData["Killed"];
    }
    diedString = diedString[0] + diedString.slice(1).toLowerCase();
    if (diedString != "OVERSEAS") {
      diedString = "in " + diedString;
    }
    let residenceString = "";
    let tmpString = edReader.recordData["Residence"];
    if (tmpString != "") {
      residenceString = " of " + tmpString[0] + tmpString.slice(1).toLowerCase();
    }
    //let  residenceString = " of " + tmpString[0] + tmpString.slice(1).toLowerCase();}
    let listString = gd.name.name + residenceString + " death " +  "(age " + gd.ageAtDeath + ") " + deathDateString + " in service " + diedString + ".";
    //let dataString = buildDataList(ed, gd, edReader, builder); 
    builder.dataString = listString;
  }
  else {
    builder.addStandardDataString(gd);
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
