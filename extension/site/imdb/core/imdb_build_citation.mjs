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
import { buildImdbTemplate } from "./imdb_build_template.mjs";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// e.g. "1963-12-18" -> "18 December 1963", "1963-12" -> "December 1963", "1963" -> "1963"
function formatIsoDate(isoDate) {
  if (!isoDate) {
    return "";
  }
  // e.g. "April 18, 1971" as displayed on the page
  const textMatch = isoDate.match(/^([A-Za-z]+) (\d{1,2}), (\d{4})$/);
  if (textMatch) {
    return textMatch[2] + " " + textMatch[1] + " " + textMatch[3];
  }
  const match = isoDate.match(/^(\d\d\d\d)(?:-(\d\d))?(?:-(\d\d))?$/);
  if (!match) {
    return isoDate;
  }
  let result = match[1];
  if (match[2]) {
    result = monthNames[parseInt(match[2], 10) - 1] + " " + result;
    if (match[3]) {
      result = parseInt(match[3], 10) + " " + result;
    }
  }
  return result;
}

function buildImdbUrl(ed) {
  return ed.canonicalUrl ? ed.canonicalUrl : ed.url;
}

// e.g. IMDb: "Brad Pitt"
function buildSourceTitle(ed, gd, builder) {
  let title = "IMDb";
  if (ed.name) {
    title += ': "' + ed.name + '"';
  }
  builder.sourceTitle = title;
  builder.putSourceTitleInQuotes = false;
}

// For a person the WikiTree {{IMDb}} template is the link to the profile, and the link that follows it is just the
// address of the site, giving e.g.
//   {{IMDb|nm0855039}}<br/>(https://www.imdb.com/ : accessed 19 October 2026)
// A title has no template so it has a link to the page.
function buildRecordLink(ed, gd, builder) {
  const template = buildImdbTemplate(ed);
  if (template) {
    builder.templateBeforeRecordLink = template;
    builder.recordLinkOrTemplate = "https://www.imdb.com/";
  } else {
    builder.recordLinkOrTemplate = "[" + buildImdbUrl(ed) + " IMDb Title]";
  }
}

// e.g. Actor, Producer. Born 18 December 1963 in Shawnee, Oklahoma, USA.
function buildPersonDataString(ed, options) {
  let dataString = "";
  if (options.citation_imdb_includeJobTitles && ed.jobTitles && ed.jobTitles.length > 0) {
    dataString += ed.jobTitles.join(", ") + ".";
  }

  let birth = formatIsoDate(ed.birthDate ? ed.birthDate : ed.birthDateText);
  if (birth || ed.birthPlace) {
    dataString += (dataString ? " " : "") + "Born";
    if (birth) {
      dataString += " " + birth;
    }
    if (ed.birthPlace) {
      dataString += " in " + ed.birthPlace;
    }
    dataString += ".";
  }

  let death = formatIsoDate(ed.deathDate ? ed.deathDate : ed.deathDateText);
  if (death || ed.deathPlace) {
    dataString += (dataString ? " " : "") + "Died";
    if (death) {
      dataString += " " + death;
    }
    if (ed.deathPlace) {
      dataString += " in " + ed.deathPlace;
    }
    dataString += ".";
  }

  dataString += buildFamilyString(ed, dataString);

  return dataString;
}

// The bio page has the birth name and family. e.g.
// Birth name David John McDonald. Parents: Sandy McDonald, Essdale Helen (McLeod). Spouse: Georgia Tennant (December 30, 2011 - present).
function buildFamilyString(ed, existingString) {
  let parts = [];
  if (ed.birthName) {
    parts.push("Birth name " + ed.birthName + ".");
  }
  if (ed.parents && ed.parents.length > 0) {
    parts.push("Parents: " + ed.parents.join(", ") + ".");
  }
  if (ed.spouses && ed.spouses.length > 0) {
    let spouses = ed.spouses.map((s) => {
      let text = s.name;
      if (s.fromDate) {
        text += " (" + s.fromDate + (s.toDate ? " - " + s.toDate : " - present") + ")";
      }
      return text;
    });
    parts.push((spouses.length > 1 ? "Spouses: " : "Spouse: ") + spouses.join(", ") + ".");
  }
  if (ed.children && ed.children.length > 0) {
    parts.push("Children: " + ed.children.join(", ") + ".");
  }
  if (ed.relatives && ed.relatives.length > 0) {
    let relatives = ed.relatives.map((r) => r.name + (r.relationship ? " (" + r.relationship + ")" : ""));
    parts.push("Relatives: " + relatives.join(", ") + ".");
  }
  if (parts.length == 0) {
    return "";
  }
  return (existingString ? " " : "") + parts.join(" ");
}

// e.g. Movie, 1995. Directed by David Fincher.
// or   TV series, 1963–1989. Created by Sydney Newman, C.E. Webber, Donald Wilson.
function buildTitleDataString(ed) {
  const typeNames = {
    Movie: "Movie",
    TVSeries: "TV series",
    TVEpisode: "TV episode",
    VideoGame: "Video game",
  };
  let dataString = typeNames[ed.titleType] ? typeNames[ed.titleType] : ed.titleTypeText ? ed.titleTypeText : "Title";

  let year = ed.releaseYear ? ed.releaseYear : ed.datePublished ? ed.datePublished.substring(0, 4) : "";
  if (year) {
    dataString += ", " + year;
    if (ed.endYear) {
      dataString += "\u2013" + ed.endYear;
    }
  }
  dataString += ".";

  if (ed.directors && ed.directors.length > 0) {
    dataString += " Directed by " + ed.directors.join(", ") + ".";
  }
  if (ed.creators && ed.creators.length > 0) {
    dataString += " Created by " + ed.creators.join(", ") + ".";
  }
  return dataString;
}

function buildDataString(ed, gd, builder) {
  const options = builder.getOptions();
  let dataString = ed.pageType == "name" ? buildPersonDataString(ed, options) : buildTitleDataString(ed);
  builder.dataString = dataString;
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  buildDataString(ed, gd, builder);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
