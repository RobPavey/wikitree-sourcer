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

// No imports or requires allowed. See docs/dev_notes/extract_data_design

function decodeHtmlEntities(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

// Finds the first <tag ... itemprop="itemprop" ...> element in the HTML text and returns its attribute
function getItempropAttribute(html, tag, itemprop, attribute) {
  const tagRegex = new RegExp("<" + tag + '\\s[^>]*itemprop="' + itemprop + '"[^>]*>');
  const tagMatch = html.match(tagRegex);
  if (!tagMatch) {
    return "";
  }
  const attributeMatch = tagMatch[0].match(new RegExp("\\s" + attribute + '="([^"]*)"'));
  return attributeMatch ? decodeHtmlEntities(attributeMatch[1]) : "";
}

// Gets the channel, upload date and duration from the HTML text of a watch page. This is either the HTML of
// the current page or of a fetched copy of it. This can't use the DOM since YouTube does not allow DOMParser.
// Returns an empty object if the HTML is not that of the watch page for this video. Because YouTube is a single
// page app the HTML of the current page may be left over from the previously viewed video.
function extractVideoDetailsFromHtml(html, videoId) {
  let details = {};

  const canonicalMatch = html.match(/<link rel="canonical" href="([^"]*)"/);
  if (!canonicalMatch || canonicalMatch[1].indexOf(videoId) == -1) {
    return details;
  }

  const authorIndex = html.indexOf('itemprop="author"');
  if (authorIndex != -1) {
    const authorHtml = html.substring(authorIndex, authorIndex + 600);
    const channelName = getItempropAttribute(authorHtml, "link", "name", "content");
    if (channelName) {
      details.channelName = channelName;
    }
    const channelUrl = getItempropAttribute(authorHtml, "link", "url", "href");
    if (channelUrl) {
      details.channelUrl = channelUrl.replace(/^http:/, "https:");
    }
  }

  // e.g. "2026-10-01T23:21:55-07:00". The date part is the date where the video was uploaded.
  let dateText = getItempropAttribute(html, "meta", "uploadDate", "content");
  if (!dateText) {
    dateText = getItempropAttribute(html, "meta", "datePublished", "content");
  }
  const dateMatch = dateText.match(/^(\d\d\d\d-\d\d-\d\d)/);
  if (dateMatch) {
    details.uploadDate = dateMatch[1];
  }

  // e.g. "PT3H18M59S"
  const durationText = getItempropAttribute(html, "meta", "duration", "content");
  const durationMatch = durationText.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (durationMatch && durationText != "PT") {
    details.durationSeconds =
      (parseInt(durationMatch[1] || "0", 10) * 60 + parseInt(durationMatch[2] || "0", 10)) * 60 +
      parseInt(durationMatch[3] || "0", 10);
  }

  // The first paragraph of the description is often a summary of the video, e.g. who is in it
  const descriptionMatch = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
  if (descriptionMatch) {
    try {
      const fullDescription = JSON.parse('"' + descriptionMatch[1] + '"');
      const firstParagraph = fullDescription
        .trim()
        .split(/\n\s*\n/)[0]
        .replace(/\s+/g, " ")
        .trim();
      if (firstParagraph) {
        details.description = firstParagraph.substring(0, 1000);
      }
    } catch (e) {
      // The description is optional so just leave it out
    }
  }

  return details;
}

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  if (!url) {
    return result;
  }

  // Video pages are:
  //   https://www.youtube.com/watch?v=<id>&list=<playlistId>&t=97s
  //   https://www.youtube.com/shorts/<id>  (also /live/<id> and /embed/<id>)
  //   https://youtu.be/<id>
  let urlObj = undefined;
  try {
    urlObj = new URL(url);
  } catch (e) {
    return result;
  }

  let videoId = urlObj.searchParams.get("v");
  if (!videoId) {
    const pathMatch = urlObj.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]+)/);
    if (pathMatch) {
      videoId = pathMatch[1];
    } else if (urlObj.hostname == "youtu.be") {
      const shortMatch = urlObj.pathname.match(/^\/([\w-]+)/);
      if (shortMatch) {
        videoId = shortMatch[1];
      }
    }
  }
  if (!videoId) {
    return result;
  }
  result.videoId = videoId;

  const playlistId = urlObj.searchParams.get("list");
  if (playlistId) {
    result.playlistId = playlistId;
  }

  // The start time can be "97", "97s" or "1m37s". It is interpreted later.
  const startTime = urlObj.searchParams.get("t") || urlObj.searchParams.get("start");
  if (startTime) {
    result.startTime = startTime;
  }

  // YouTube is a single page app so the og:title meta tag can be left over from the previously viewed video.
  // The heading and the document title are updated on navigation.
  let title = "";
  const heading = document.querySelector("h1.ytd-watch-metadata");
  if (heading && heading.textContent) {
    title = heading.textContent.trim();
  }
  if (!title && document.title) {
    title = document.title.replace(/\s*-\s*YouTube\s*$/, "").trim();
  }
  if (!title) {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && ogTitle.content) {
      title = ogTitle.content.trim();
    }
  }
  if (title) {
    result.title = title;
  }

  // This works if the page was loaded directly. If not it is empty and the content script fetches the page.
  const details = extractVideoDetailsFromHtml(
    document.documentElement ? document.documentElement.outerHTML : "",
    videoId
  );
  Object.assign(result, details);

  result.success = true;

  //console.log(result);

  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
