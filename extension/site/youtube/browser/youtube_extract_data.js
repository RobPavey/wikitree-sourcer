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

  result.success = true;

  //console.log(result);

  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
