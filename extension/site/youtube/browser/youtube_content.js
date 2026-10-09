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

// If the page was not loaded directly (YouTube is a single page app) the details of the video, like the
// channel and upload date, can't be read from the page so get them by fetching the video page.
async function addVideoDetailsFromFetch(extractedData) {
  try {
    const response = await fetch("https://www.youtube.com/watch?v=" + extractedData.videoId, {
      credentials: "same-origin",
    });
    if (response.status == 200) {
      const html = await response.text();
      Object.assign(extractedData, extractVideoDetailsFromHtml(html, extractedData.videoId));
    }
  } catch (error) {
    // The template can still be built without these details so this is not an error
    console.log("WikiTree Sourcer: could not fetch the video page for the video details");
  }
}

async function extractDataFetchAndRespond(sendResponse) {
  try {
    let extractedData = extractData(document, document.location.href);
    if (extractedData.success && !extractedData.uploadDate) {
      await addVideoDetailsFromFetch(extractedData);
    }
    sendResponse({
      success: true,
      contentType: "youtube",
      extractedData: extractedData,
    });
  } catch (error) {
    openExceptionPageForContentScript("Error while performing extractData", document.location.href, error, true);
    sendResponse({
      success: false,
      exceptionWasReported: true,
    });
  }
}

function extractHandler(request, sendResponse) {
  extractDataFetchAndRespond(sendResponse);
  return true; // will respond async
}

siteContentInit("youtube", extractHandler);
