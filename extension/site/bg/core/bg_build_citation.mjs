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

import { CitationBuilder } from "../../../base/core/citation_builder.mjs";
function buildCoreCitation(data, runDate, builder) {
  // Example citation:
  // Burial: Billion Graves.
  // Citing Oak Grove Cemetery, Hillsdale, Hillsdale County, Michigan, USA
  // [<url> BillionGraves memorial] (accessed 4 April 2022)
  // William Henry Pavey (1 Dec 1875–14 Apr 1961)

  let options = builder.getOptions();

  let sourceTitle = "Billion Graves";

  builder.databaseHasImages = data.hasImage ;

  builder.sourceTitle = sourceTitle;

  let recordLink = "[" + data.url + " BillionGraves memorial]";
  builder.recordLinkOrTemplate = recordLink;

  // The name string can contain brackets
  let nameString = data.fullName;
  if (/\([\s\S]+\)/.test(data.fullName)) {
    if (options.citation_bg_bracketsRoundName === "omit") {
      nameString = data.fullName.replace(/(.+)(\([\s\S]+\))/, "$1");
    } else if (options.citation_bg_bracketsRoundName === "insert") {
      let marriedName = data.fullName.replace(/(.+)(\()([\s\S]+)(\))/, "$1").trim();
      let bracketName = data.fullName.replace(/(.+)(\([\s\S]+\))/, "$2").trim();
      nameString = marriedName.replace(/(.+)(\s.+)$/, "$1 " + bracketName + "$2");
    }
  }

  if (data.cemeteryName && data.cemeteryFullAddress) {
    builder.sourceReference +=  data.cemeteryName + ", " + data.cemeteryFullAddress;
  }

  let dataString = "Memorial page for " + nameString;
  if (data.deathDate && data.birthDate) {
    dataString += " (" + data.birthDate + "-" + data.deathDate + ")";
  } else if (data.birthDate) {
    dataString += " (b " + data.birthDate + ")";
  } else if (data.deathDate) {
    dataString += " (d " + data.deathDate + ")";
  }
  dataString += "; ";
  
  let transcriberPhotographerAdded = false;
  if (options.citation_bg_includeTranscriber && data.transcriber) {    
      dataString +=  "Transcribed by " + data.transcriber;
      transcriberPhotographerAdded = true;
  }
  if (options.citation_bg_includePhotographer && data.photographer) {
    if (dataString.length > 0) {
        dataString += "; "
    }  
    dataString += "Photographed by " + data.photographer;
    transcriberPhotographerAdded = true;
  }
  
  if (transcriberPhotographerAdded) {
    dataString += ".";
  }
  
  if (options.citation_bg_includeRelatives && data.relations) {
    let relativeString = "<br/>Also on memorial :";
    data.relations.forEach(relative => {
      relativeString += " " + relative.name;
      if (relative.birthDate) {
        relativeString += " b " + relative.birthDate;
      }
      if(relative.deathDate) {
        relativeString += " d " + relative.deathDate
      }
      (relativeString += ";")
    });
    relativeString = relativeString.replace(/;$/,". ");
    dataString += relativeString;
  }

  if (data.epitaph && options.citation_bg_includeEpitaph) {
    if (options.citation_general_addBreaksWithinBody) {
      dataString += "<br/>";
    } else {
      dataString += " ";
    }
    if (builder.type != "source" && options.citation_general_addNewlinesWithinBody) {
      dataString += "\n";
    }
    let epitaph = data.epitaph.trim();
    dataString += "''";
    if (epitaph[0] != '"' && epitaph[0] != "'") {
      dataString += '"';
    }
    dataString += epitaph;
    let epitaphEnd = epitaph[epitaph.length - 1];
    if (epitaphEnd != '"' && epitaphEnd != "'") {
      dataString += '"';
    }
    dataString += "''";
  }

  builder.dataString = dataString;
}

function buildCitation(input) {
  const data = input.extractedData;
  const gd = input.generalizedData;
  const runDate = input.runDate;
  const options = input.options;
  const type = input.type; // "inline", "narrative" or "source"

  let builder = new CitationBuilder(type, runDate, options);

  var citation = buildCoreCitation(data, runDate, builder);

  // Assume for now that all memorial pages are for a burial
  builder.meaningfulTitle = "Memorial";

  if (type == "narrative") {
    builder.addNarrative(gd, input.dataCache, options);
  }

  // now the builder is setup use it to build the citation text
  let fullCitation = builder.getCitationString();

  //console.log(fullCitation);

  var citationObject = {
    citation: fullCitation,
    type: type,
  };

  return citationObject;
}

export { buildCitation };
