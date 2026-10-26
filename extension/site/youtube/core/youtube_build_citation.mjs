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
import { buildYoutubeTemplate } from "./youtube_build_template.mjs";

const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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

// e.g. 11939 -> "3:18:59", 125 -> "2:05"
function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const secondsString = (seconds < 10 ? "0" : "") + seconds;
  if (hours > 0) {
    return hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + secondsString;
  }
  return minutes + ":" + secondsString;
}

// e.g. "1997-04-13" -> "Sunday, April 13, 1997"
function formatPostedDate(isoDate) {
  const match = isoDate.match(/^(\d\d\d\d)-(\d\d)-(\d\d)$/);
  if (!match) {
    return "";
  }
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  // Use UTC so that the user's time zone doesn't change the day of the week
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return weekdayNames[weekday] + ", " + monthNames[month - 1] + " " + day + ", " + year;
}

// e.g. USC Shoah Foundation. 1997. "Jehovah Witness Survivor Franz Wohlfahrt | USC Shoah Foundation."
function buildSourceTitle(ed, gd, builder) {
  let sourceTitle = "";
  if (ed.channelName) {
    sourceTitle += ed.channelName + ". ";
  }
  if (ed.uploadDate) {
    sourceTitle += ed.uploadDate.substring(0, 4) + ". ";
  }
  sourceTitle += '"' + (ed.title ? ed.title : "YouTube video") + '."';

  builder.sourceTitle = sourceTitle;
  builder.putSourceTitleInQuotes = false;
}

// The link is to the channel. The link to the video is in the template at the end of the data string.
function buildRecordLink(ed, gd, builder) {
  builder.recordLinkOrTemplate = ed.channelUrl ? ed.channelUrl : "https://www.youtube.com/watch?v=" + ed.videoId;
}

// The first sentences of the description, up to about 300 characters
function buildDescriptionExcerpt(description) {
  const maxLength = 300;
  if (description.length <= maxLength) {
    return description;
  }
  const truncated = description.substring(0, maxLength);
  const lastSentenceEnd = truncated.lastIndexOf(". ");
  if (lastSentenceEnd > maxLength / 2) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  return truncated.substring(0, truncated.lastIndexOf(" ")) + "...";
}

// e.g. YouTube video, 3:18:59. Posted Sunday, April 13, 1997. {{YouTube|9WEDlSvW1KY}}
function buildDataString(ed, gd, builder) {
  let dataString = "YouTube video";
  if (ed.durationSeconds) {
    dataString += ", " + formatDuration(ed.durationSeconds);
  }
  dataString += ".";

  if (ed.uploadDate) {
    const postedDate = formatPostedDate(ed.uploadDate);
    if (postedDate) {
      dataString += " Posted " + postedDate + ".";
    }
  }

  if (ed.includeDescription && ed.description) {
    dataString += ' Description: "' + buildDescriptionExcerpt(ed.description) + '"';
  }

  // The start time is not part of a citation of the video
  const templateEd = { ...ed, startTime: undefined };
  dataString += " " + buildYoutubeTemplate(templateEd, undefined, false);

  builder.dataString = dataString;
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
  buildDataString(ed, gd, builder);
}

function buildCitation(input) {
  // A narrative needs a person, which the user enters. Without one it is the same as an inline citation.
  const requestedType = input.type;
  const gd = input.generalizedData;
  if (requestedType == "narrative" && !(gd.userOverrideForNarrative && gd.userOverrideForNarrative.trim())) {
    input = { ...input, type: "inline" };
  }

  let citationObject = simpleBuildCitationWrapper(input, buildCoreCitation, () => "");
  citationObject.type = requestedType;

  // The citation builder adds a period to anything that doesn't end in one, but the template should be last
  citationObject.citation = citationObject.citation.replace(/\}\}\.(\s*(<\/ref>)?\s*)$/, "}}$1");

  return citationObject;
}

export { buildCitation };
