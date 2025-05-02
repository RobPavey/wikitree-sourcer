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

function buildCoreCitation(data, gd, builder) {
  // Example citation:
  // Burial: Find a Grave.
  // Citing Oak Grove Cemetery, Hillsdale, Hillsdale County, Michigan, USA
  // {{FindAGrave|115176143}} (accessed 4 April 2022)
  // William Henry Pavey (1 Dec 1875–14 Apr 1961)

  let options = builder.getOptions();
  let target = options.citation_general_target;

  let sourceTitle = "Find a Grave";

  builder.databaseHasImages = true;

  if (options.citation_general_addEeItemType) {
    if (!data.hasImage) {
      builder.databaseHasImages = false;
    }
  } else if (options.citation_fg_includeImageStatus) {
    if (data.hasImage === true) {
      sourceTitle += " (has image)";
    } else if (data.hasImage === false) {
      sourceTitle += " (no image)";
    }
    builder.putSourceTitleInQuotes = false;
  }
  builder.sourceTitle = sourceTitle;

  if (target == "wikitree") {
    if (data.memorialId) {
      let recordLink = "{{FindAGrave|" + data.memorialId + "}}";
      builder.recordLinkOrTemplate = recordLink;
    } else if (data.url) {
      let recordLink = "[" + data.url + " FindAGrave Memorial]";
      builder.recordLinkOrTemplate = recordLink;
    }
  } else if (data.url) {
    builder.recordLinkOrTemplate = "FindAGrave Memorial: " + data.url;
  }

  // The name string can contain italics
  let nameString = data.name;
  if (data.nameHtml && nameString != data.nameHtml && data.nameHtml.includes("<i>")) {
    // we may have a part in italics
    if (options.citation_fg_italicsInName != "plain") {
      let html = data.nameHtml;
      let italicStartIndex = html.indexOf("<i>");
      let italicEndIndex = html.indexOf("</i>", italicStartIndex);
      if (italicStartIndex != -1 && italicEndIndex != -1) {
        let partBefore = html.substring(0, italicStartIndex).trim();
        let partItalic = html.substring(italicStartIndex + 3, italicEndIndex).trim();
        let partAfter = html.substring(italicEndIndex + 4).trim();

        if (options.citation_fg_italicsInName == "omit") {
          nameString = partBefore + " " + partAfter;
        } else {
          nameString = partBefore + " ''" + partItalic + "'' " + partAfter;
        }
      }
    }
  }

  let dataString = "Memorial page for " + nameString;
  if (data.deathDate && data.birthDate) {
    dataString += " (" + data.birthDate + "-" + data.deathDate + ")";
  } else if (data.deathDate) {
    dataString += " (d. " + data.deathDate + ")";
  }

  if (data.cemeteryName && data.cemeteryFullAddress) {
    dataString += ", citing " + data.cemeteryName + ", " + data.cemeteryFullAddress;

    if (data.plot && options.citation_fg_includeImageStatus) {
      dataString += " (plot: " + data.plot + ")";
    }
  }

  if (options.citation_fg_includeMaintainer && data.citation) {
    let indexOfMaintained = data.citation.indexOf("Maintained by");
    if (indexOfMaintained != -1) {
      let maintainedString = data.citation.substring(indexOfMaintained);
      if (maintainedString.endsWith(".")) {
        maintainedString = maintainedString.substring(0, maintainedString.length - 1).trim();
      }
      dataString += "; " + maintainedString;
    }
  }

  dataString += ".";

  if (data.inscription && options.citation_fg_includeInscription) {
    if (options.citation_general_addBreaksWithinBody) {
      dataString += "<br/>";
    } else {
      dataString += " ";
    }
    if (builder.type != "source" && options.citation_general_addNewlinesWithinBody) {
      dataString += "\n";
    }
    let inscription = data.inscription.trim();
    dataString += "''";
    if (inscription[0] != '"' && inscription[0] != "'") {
      dataString += '"';
    }
    dataString += inscription;
    let inscriptionEnd = inscription[inscription.length - 1];
    if (inscriptionEnd != '"' && inscriptionEnd != "'") {
      dataString += '"';
    }
    dataString += "''";
  }

  builder.dataString = dataString;
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
