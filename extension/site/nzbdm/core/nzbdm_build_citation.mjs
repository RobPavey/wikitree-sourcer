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
import { RT } from "../../../base/core/record_type.mjs";
import { simpleBuildCitationWrapper } from "../../../base/core/citation_builder.mjs";

function buildSourceTitle(ed, gd, builder) {
  let format = builder.options.citation_nzbdm_sourceTitleFormat;

  switch (format) {
    case "nzbdmo":
      builder.sourceTitle = "New Zealand Births, Deaths & Marriages Online";
      break;
    case "nzbdmdo":
      builder.sourceTitle = "New Zealand Births, Deaths and Marriages - Online";
      break;
    case "bdmonzdia":
      builder.sourceTitle = "Births, Deaths & Marriages Online. New Zealand Department of Internal Affairs";
      break;
  }
}

function buildSourceReference(ed, gd, builder) {
  if (ed.recordData) {
    let registrationNumber = ed.recordData["Registration Number"];
    if (registrationNumber) {
      let type = "";
      if (gd.recordType == RT.BirthRegistration) {
        type = "Birth ";
      } else if (gd.recordType == RT.DeathRegistration) {
        type = "Death ";
      } else if (gd.recordType == RT.MarriageRegistration) {
        type = "Marriage ";
      }
      builder.sourceReference = type + "Registration Number: " + registrationNumber;
    }
  }
}

function buildRecordLink(ed, gd, builder) {
  let options = builder.getOptions();
  let linkFormatOption = options.citation_nzbdm_linkFormat;

  var nzbdmUrl = "";
  if (linkFormatOption == "top") {
    nzbdmUrl = "https://www.bdmhistoricalrecords.dia.govt.nz/";
  } else if (linkFormatOption == "search") {
    nzbdmUrl = "https://www.bdmhistoricalrecords.dia.govt.nz/search";
  } else if (linkFormatOption == "searchOfType") {
    nzbdmUrl = "https://www.bdmhistoricalrecords.dia.govt.nz/search/search";
    let type = "";
    if (gd.recordType == RT.BirthRegistration) {
      nzbdmUrl += "?path=%2FqueryEntry.m%3Ftype%3Dbirths";
    } else if (gd.recordType == RT.DeathRegistration) {
      nzbdmUrl += "?path=%2FqueryEntry.m%3Ftype%3Ddeaths";
    } else if (gd.recordType == RT.MarriageRegistration) {
      nzbdmUrl += "?path=%2FqueryEntry.m%3Ftype%3Dmarriages";
    }
  }
  if (!nzbdmUrl) {
    return;
  }

  let linkOption = options.citation_nzbdm_includeLink;

  if (linkOption == "none") {
    return;
  }

  let recordLink = "";

  if (linkOption == "inSourceTitle") {
    builder.putRecordLinkInTitle = true;
    recordLink = nzbdmUrl;
  } else if (linkOption == "asNzBdmOnline") {
    recordLink = "[" + nzbdmUrl + " New Zealand BDM Online]";
  } else if (linkOption == "asLinkToSearchPage") {
    recordLink = "[" + nzbdmUrl + " Link to search page]";
  }

  if (recordLink) {
    builder.recordLinkOrTemplate = recordLink;
  }
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
