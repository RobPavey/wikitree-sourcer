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
import { DataString } from "../../../base/core/data_string.mjs";

function buildCustomDataString(gd, options) {
  let input = {
    generalizedData: gd,
    options: options,
  };
  return DataString.buildDataString(input);
}

function buildDataString(ed, gd, options) {
  let dataString = "";

  if (options.citation_freecen_dataStyle == "string") {
    dataString = buildCustomDataString(gd, options);
    if (dataString) {
      return dataString;
    }
  }

  // build a list string
  let recordData = ed.censusDetails;

  let itemSep = ";";
  let valueSep = ":";
  if (options.citation_general_dataListSeparator == "commaColon") {
    itemSep = ",";
    valueSep = ":";
  } else if (options.citation_general_dataListSeparator == "commaSpace") {
    itemSep = ",";
    valueSep = "";
  }

  dataString = "";

  if (recordData) {
    let keys = Object.keys(recordData);
    //keys = removeUnwantedKeysForDataString(keys, recordData);
    for (let key of keys) {
      let value = recordData[key];
      if (value) {
        if (dataString != "") {
          dataString += itemSep + " ";
        }
        dataString += key + valueSep + " " + value;
      }
    }
  }

  return dataString;
}

function getAdditionalInfo(ed, gd, citationType, options) {
  if (options.citation_freecen_dataStyle == "none") {
    return "";
  }

  if (
    citationType == "source" ||
    options.citation_freecen_dataStyle == "string" ||
    options.citation_freecen_dataStyle == "list"
  ) {
    return buildDataString(ed, gd, options);
  }

  // style must be table
  var result = "";
  let recordData = ed.censusDetails;
  if (recordData) {
    let keys = Object.keys(recordData);

    //keys = removeUnwantedKeysForTable(keys, recordData);
    if (keys.length > 0) {
      // start table
      result = '{| border="1"\n';
      let firstRow = true;

      for (let key of keys) {
        if (firstRow) {
          firstRow = false;
        } else {
          result += "|-\n";
        }
        result += "| " + key + " || " + recordData[key] + "\n";
      }

      result += "|}";
    }
  }

  return result;
}

function buildSourceReference(ed, builder) {
  if (!ed.censusDetails) {
    return;
  }

  const options = builder.getOptions();

  const seriesForYear = {
    1841: { reference: "HO 107", detailsPage: "C8971" },
    1851: { reference: "HO 107", detailsPage: "C8971" },
    1861: { reference: "RG 9", detailsPage: "C13334" },
    1871: { reference: "RG 10", detailsPage: "C13335" },
    1881: { reference: "RG 11", detailsPage: "C13336" },
    1891: { reference: "RG 12", detailsPage: "C13337" },
    1901: { reference: "RG 13", detailsPage: "C13338" },
    1911: { reference: "RG 14", detailsPage: "C13339" },
    1921: { reference: "RG 15", detailsPage: "C13340" },
  };

  let year = ed.censusDetails["Census"];
  if (!year) {
    year = ed.censusDetails["Census Year"];
  }
  let piece = ed.censusDetails["Piece"];
  let folio = ed.censusDetails["Folio"];
  let page = ed.censusDetails["Page"];
  let schedule = ed.censusDetails["Schedule"];

  builder.addSourceReferenceText("The National Archives of the UK, Kew, Surrey, England");
  let series = seriesForYear[year];
  if (series) {
    if (options.citation_freecen_includeNationalArchivesLink) {
      let reference =
        "[https://discovery.nationalarchives.gov.uk/details/r/" + series.detailsPage + " " + series.reference + "]";

      builder.addSourceReferenceField("Reference", reference);
    } else {
      builder.addSourceReferenceField("Reference", series.reference);
    }
  } else {
    builder.addSourceReferenceText(year);
  }
  if (piece) {
    if (series && series.reference) {
      // sometimes the piece string is something like RG14_14114, if so remove the
      // series reference from the start.
      let ref = series.reference.replace(/\s/g, "");
      if (ref) {
        let prefix = ref + "_";
        if (piece.startsWith(prefix)) {
          piece = piece.substring(prefix.length);
        }
      }
    }
    builder.addSourceReferenceField("Piece", piece);
  }
  if (folio) {
    builder.addSourceReferenceField("Folio", folio);
  }
  if (page) {
    builder.addSourceReferenceField("Page", page);
  }
  if (schedule) {
    builder.addSourceReferenceField("Schedule", schedule);
  }
}

function getRecordLink(ed) {
  // URL might be something like:
  // https://www.freecen.org.uk/search_records/5a1466eaf4040b9d6e5d459c/friendly?citation_type=wikitree&locale=en
  // or:
  // https://www.freecen.org.uk/search_records/5a1466eaf4040b9d6e5d459c/mary-pavey-1861-devon-chardstock-1793-?locale=en
  // We want:
  // https://www.freecen.org.uk/search_records/5a1466eaf4040b9d6e5d459c
  let url = ed.url;

  let newUrl = url;
  const searchRecordsText = "/search_records/";
  const searchRecordsIndex = url.indexOf(searchRecordsText);
  if (searchRecordsIndex != -1) {
    let nextSlashIndex = url.indexOf("/", searchRecordsIndex + searchRecordsText.length);
    if (nextSlashIndex != -1) {
      newUrl = url.substring(0, nextSlashIndex);
    }
  }

  let recordLink = "[" + newUrl + " FreeCen Transcription]";

  return recordLink;
}

function buildCoreCitation(ed, gd, builder) {
  // Example citation:
  // '''1861 Census''':
  // "1861 Census of England, Scotland and Wales"
  // The National Archives of the UK (TNA); Kew, Surrey, England; Census Returns of England and Wales, 1861; Class: RG12; Piece: 137; Folio: 192; Page: 19
  // [https://www.freecen.org.uk/search_records/5bec9bddf4040b7a22835799 FreeCen Transcription] (accessed 16 April 2022)
  // Harold G Pavey (3) son in household of Harry A Pavey (38) in Pancras registration district. Born in St Pancras, London, England.

  let options = builder.getOptions();

  let sourceTitle = "Census of England, Scotland and Wales";
  let eventYear = gd.inferEventYear();
  if (eventYear) {
    sourceTitle = eventYear + " " + sourceTitle;
  }
  builder.sourceTitle = sourceTitle;
  builder.putSourceTitleInQuotes = true;

  buildSourceReference(ed, builder);

  builder.recordLinkOrTemplate = getRecordLink(ed);

  builder.dataString = getAdditionalInfo(ed, gd, builder.type, options);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
