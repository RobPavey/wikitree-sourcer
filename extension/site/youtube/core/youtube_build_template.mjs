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

import { findWikiTreePlaylistKey } from "./youtube_playlists.mjs";

// Parses a start time into a whole number of seconds. Accepts plain seconds ("97"), clock style
// ("1:37", "1:02:03") and YouTube URL style ("97s", "1m37s", "1h2m3s"). Returns undefined if the
// text is empty or not a valid time.
function parseStartTime(text) {
  if (text === undefined || text === null) {
    return undefined;
  }
  text = String(text).trim().toLowerCase();
  if (!text) {
    return undefined;
  }

  if (/^\d+s?$/.test(text)) {
    return parseInt(text, 10);
  }

  if (/^\d+(:\d{1,2}){1,2}$/.test(text)) {
    let seconds = 0;
    for (const part of text.split(":")) {
      seconds = seconds * 60 + parseInt(part, 10);
    }
    return seconds;
  }

  const match = text.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (match) {
    return (parseInt(match[1] || "0", 10) * 60 + parseInt(match[2] || "0", 10)) * 60 + parseInt(match[3] || "0", 10);
  }

  return undefined;
}

// Characters that would be interpreted as template syntax inside a parameter value
function escapeTemplateParameter(text) {
  return text.replace(/\|/g, "&#124;").replace(/=/g, "&#61;").replace(/\{/g, "&#123;").replace(/\}/g, "&#125;");
}

// Builds the WikiTree {{YouTube}} template call for the extracted data.
// See https://www.wikitree.com/wiki/Template:YouTube
// startSeconds is optional and overrides any start time found in the URL.
// If useTitleAsText is false the link text is left out so the template uses its default text.
function buildYoutubeTemplate(ed, startSeconds, useTitleAsText = true) {
  let template = "{{YouTube|" + ed.videoId;

  if (startSeconds === undefined) {
    startSeconds = parseStartTime(ed.startTime);
  }

  let title = useTitleAsText && ed.title ? escapeTemplateParameter(ed.title.trim()) : "";
  if (!title && startSeconds !== undefined) {
    // the start time is the third parameter so the text is needed to hold its place. An empty text would
    // give a link with nothing to click on so use the template's default text.
    title = "video";
  }
  if (title) {
    template += "|" + title;
  }

  if (startSeconds !== undefined) {
    template += "|" + startSeconds;
  }

  const playlistKey = findWikiTreePlaylistKey(ed.playlistId);
  if (playlistKey) {
    template += "|playlist=" + playlistKey;
  }

  template += "}}";
  return template;
}

export { buildYoutubeTemplate, parseStartTime };
