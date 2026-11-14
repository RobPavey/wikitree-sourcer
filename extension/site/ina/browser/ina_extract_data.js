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

  function clean(text) {
    if (!text) {
      return "";
    }
    return text.replace(/ /g, " ").replace(/\s+/g, " ").trim();
  }

  function getUrlParam(name) {
    if (!url || url.indexOf("?") == -1) {
      return "";
    }
    var query = url.split("?")[1].split("#")[0];
    var pairs = query.split("&");
    for (var i = 0; i < pairs.length; i++) {
      var eq = pairs[i].indexOf("=");
      if (eq > 0 && pairs[i].substring(0, eq) == name) {
        return decodeURIComponent(pairs[i].substring(eq + 1).replace(/\+/g, " "));
      }
    }
    return "";
  }

  // Page IDs look like MEX19251002.1.6: the newspaper code (MEX = Munster Express), the issue date
  // (yyyymmdd) and, after ".1.", the page number. Article IDs (".2.N") are not used for citations.
  function setFromPageId(pageId) {
    var match = pageId.match(/^([A-Z0-9]+?)(\d{8})\.1\.(\d+)$/);
    if (!match) {
      return false;
    }
    result.pageId = pageId;
    result.titleCode = match[1];
    result.issueDateYmd = match[2];
    result.page = match[3];
    result.pageUrl = "https://irishnewsarchive.com/?a=d&d=" + pageId;
    return true;
  }

  // ---- clipping page: ?a=clipa&command=ShowClippingEntry&clippingid=N ----
  var clippingInfo = document.querySelector(".clippinginfo");
  if (clippingInfo) {
    result.pageType = "clipping";

    var clippingId = getUrlParam("clippingid");
    if (!clippingId) {
      var shareLink = document.querySelector("#share-url, link[rel='canonical']");
      if (shareLink) {
        var idMatch = (shareLink.getAttribute("href") || "").match(/clippingid=(\d+)/);
        if (idMatch) {
          clippingId = idMatch[1];
        }
      }
    }
    if (clippingId) {
      result.clippingId = clippingId;
      result.clippingUrl = "https://irishnewsarchive.com/?a=clipa&command=ShowClippingEntry&clippingid=" + clippingId;
    }

    // Only public ("Community") clippings have a Share button; private ones can only be opened by their owner
    result.clippingIsPublic = clippingInfo.querySelector("#share-url, button.share-clipping") ? true : false;

    var note = document.querySelector(".clipping-display-note-section > div");
    if (note) {
      var noteText = clean(note.textContent);
      if (noteText) {
        result.clippingNote = noteText;
      }
    }

    var clippingTitle = clippingInfo.querySelector("h1");
    if (clippingTitle) {
      result.clippingTitle = clean(clippingTitle.textContent);
    }

    var newspaperName = clippingInfo.querySelector(".clipping-metadata > div > b");
    if (newspaperName) {
      result.newspaperTitle = clean(newspaperName.textContent);
    }

    // The spans are the place, the date and a number. The number is not always the page the clipping is
    // from (it can be the number of pages in the issue), so the page comes from the image's page ID instead.
    var spans = clippingInfo.querySelectorAll(".clipping-document-data span");
    for (var s = 0; s < spans.length; s++) {
      var spanText = clean(spans[s].textContent);
      if (/^\w+day, \d{1,2} \w+ \d{4}$/.test(spanText) || /^\d{1,2} \w+ \d{4}$/.test(spanText)) {
        result.issueDate = spanText;
      }
    }

    var image = document.querySelector("img.clippingimage");
    if (image) {
      var src = image.getAttribute("src") || "";
      var pageIdMatch = decodeURIComponent(decodeURIComponent(src)).match(/-([A-Z0-9]+\d{8}\.1\.\d+)-/);
      if (pageIdMatch) {
        setFromPageId(pageIdMatch[1]);
      }
    }

    if (result.newspaperTitle && (result.issueDate || result.issueDateYmd)) {
      result.success = true;
    }
    return result;
  }

  // ---- newspaper page: ?a=d&d=MEX19251002.1.6 ----
  // The viewer can move to another page without reloading, so the persistent link (kept up to date by
  // the site) is checked before the URL.
  var viewer = document.querySelector("#veridiandocumentdisplayjs");
  if (!viewer) {
    return result;
  }
  result.pageType = "page";

  var persistentLink = document.querySelector(
    "#documentdisplayleftpanesectionlevelpersistentlinkcontainer .persistentlinkurl"
  );
  var foundPage = false;
  if (persistentLink) {
    var linkMatch = clean(persistentLink.textContent).match(/[?&]d=([A-Z0-9]+\d{8}\.1\.\d+)/);
    if (linkMatch) {
      foundPage = setFromPageId(linkMatch[1]);
    }
  }
  if (!foundPage) {
    foundPage = setFromPageId(getUrlParam("d"));
  }
  if (!foundPage) {
    // the issue's first page, or a page the viewer has moved to: use the page counter, e.g. "6 of 8 pages"
    var documentId = viewer.getAttribute("data-document-oid") || "";
    var pageNumber = document.querySelector("#oseadpagenumber");
    var pageMatch = pageNumber ? clean(pageNumber.textContent).match(/^(\d+) of \d+/) : null;
    if (/^[A-Z0-9]+\d{8}$/.test(documentId) && pageMatch) {
      setFromPageId(documentId + ".1." + pageMatch[1]);
    }
  }

  // The title is like "Munster Express -  Friday, 2 October 1925 — Irish Newspaper Archives"
  var titleText = clean(document.title).replace(/\s*—\s*Irish Newspaper Archives$/, "");
  var titleMatch = titleText.match(/^(.+?) - (\w+day, \d{1,2} \w+ \d{4})$/);
  if (!titleMatch) {
    // the heading is like "Munster Express, Friday, 2 October 1925"
    var heading = document.querySelector("h1");
    if (heading) {
      titleMatch = clean(heading.textContent).match(/^(.+?), (\w+day, \d{1,2} \w+ \d{4})$/);
    }
  }
  if (titleMatch) {
    result.newspaperTitle = titleMatch[1];
    result.issueDate = titleMatch[2];
  }

  if (result.newspaperTitle && result.page) {
    result.success = true;
  }
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
