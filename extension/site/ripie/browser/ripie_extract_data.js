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

  // ---- helpers (function declarations only, no top-level const/let/class) ----

  function clean(text) {
    if (!text) {
      return "";
    }
    return text
      .replace(/[\u200b\u200c\u200d\ufeff]/g, "") // zero-width characters seen in notice text
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isoDatePart(text) {
    // JSON dates look like "2026-09-06T00:00:00.000+01:00". Take the date part as written so that
    // no timezone conversion can shift the day.
    if (!text || typeof text != "string") {
      return "";
    }
    var match = text.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : "";
  }

  function isoDateFromLongDate(text) {
    // DOM dates look like "Thursday 15th October 2009"
    if (!text) {
      return "";
    }
    var match = clean(text).match(/(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})/);
    if (!match) {
      return "";
    }
    var months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    var monthIndex = months.indexOf(match[2].toLowerCase());
    if (monthIndex == -1) {
      return "";
    }
    var month = monthIndex + 1;
    var day = parseInt(match[1], 10);
    return match[3] + "-" + (month < 10 ? "0" : "") + month + "-" + (day < 10 ? "0" : "") + day;
  }

  function getText(selector) {
    var element = document.querySelector(selector);
    return element ? clean(element.textContent) : "";
  }

  function getLocationFromTitle() {
    // The title is like "Death Notice of Ann FLYNN (née Ferguson) (Leixlip, Kildare) | rip.ie"
    var titleElement = document.querySelector("title");
    var title = titleElement ? clean(titleElement.textContent) : "";
    title = title.replace(/\s*\|\s*rip\.ie\s*$/i, "");
    var match = title.match(/\(([^()]*)\)\s*$/);
    if (!match) {
      return undefined;
    }
    var parts = match[1].split(",").map(clean).filter(Boolean);
    if (parts.length == 0 || /^n[ée]e\b/i.test(parts[0])) {
      return undefined; // the last bracket is a maiden name so there is no location in the title
    }
    var location = { county: parts[parts.length - 1] };
    if (parts.length > 1) {
      location.town = parts.slice(0, parts.length - 1).join(", ");
    }
    return location;
  }

  // ---- is this a notice page? ----

  // Notice URLs look like /death-notice/<name>-<county>-<town>-<id> (older ones: .../<id>/print).
  // Search results (/death-notice/s/all?...) and /death-notice/recent must not match.
  function getRecordIdFromUrl(urlString) {
    if (!urlString) {
      return "";
    }
    var path = urlString.split("?")[0].split("#")[0];
    var match =
      path.match(/\/death-notice\/[^\/]*-(\d+)\/?$/) ||
      path.match(/\/death-notice\/(\d+)\/?$/) ||
      path.match(/\/death-notice\/[^\/]+\/(\d+)\/print\/?$/);
    return match ? match[1] : "";
  }

  var recordId = getRecordIdFromUrl(url);
  if (!recordId && !url) {
    // when no URL is supplied at all (e.g. saved test pages) use the page's own og:url
    var ogUrlElement = document.querySelector('meta[property="og:url"]');
    var ogUrl = ogUrlElement ? ogUrlElement.getAttribute("content") : "";
    recordId = getRecordIdFromUrl(ogUrl);
    if (recordId && !result.url) {
      result.url = ogUrl;
    }
  }

  // The CSS module class names have a hashed suffix (e.g. DeathNotice_person-name__lkvex) that can
  // change when the site is redeployed, so match on the stable prefix only.
  var nameElement = document.querySelector('h1[class*="DeathNotice_person-name"]');
  if (!recordId || !nameElement) {
    return result;
  }
  result.recordId = recordId;

  // ---- structured data embedded by Next.js, but only if it is for THIS notice ----
  // __NEXT_DATA__ is written once at full page load and is NOT updated by client-side navigation,
  // so after clicking through from a search result it describes the previous page.

  var notice = undefined;
  var nextDataElement = document.querySelector("script#__NEXT_DATA__");
  if (nextDataElement) {
    try {
      var nextData = JSON.parse(nextDataElement.textContent);
      var pageProps = nextData && nextData.props && nextData.props.pageProps;
      var candidate = pageProps && pageProps.previewDeathNotice;
      if (candidate && String(candidate.id) == recordId) {
        notice = candidate;
      }
    } catch (e) {
      // fall back to the DOM
    }
  }

  if (notice) {
    result.dataSource = "json";
    result.firstname = clean(notice.firstname);
    result.surname = clean(notice.surname);
    result.nee = clean(notice.nee);
    result.address = clean(notice.address).replace(/,\s*$/, "");
    if (notice.town && notice.town.name) {
      result.town = clean(notice.town.name);
    }
    if (notice.county && notice.county.name) {
      result.county = clean(notice.county.name);
    }
    result.datePublished = isoDatePart(notice.createdAt);
    result.dateOfDeath = isoDatePart(notice.dateOfDeath);
  } else {
    result.dataSource = "dom";

    // The h1 is "Forenames Surname" optionally followed by <br> and "(née Maiden)".
    var firstPart = "";
    var secondPart = "";
    var seenBreak = false;
    for (var i = 0; i < nameElement.childNodes.length; i++) {
      var node = nameElement.childNodes[i];
      if (node.nodeName == "BR") {
        seenBreak = true;
      } else if (seenBreak) {
        secondPart += " " + (node.textContent || "");
      } else {
        firstPart += " " + (node.textContent || "");
      }
    }
    result.fullNameText = clean(firstPart);
    var neeMatch = clean(secondPart).match(/^\(?\s*n[ée]e\s+(.+?)\s*\)?$/i);
    if (neeMatch) {
      result.nee = neeMatch[1];
    }

    // The location. The tag line is "address, town, county" but the address and town are ambiguous when there
    // are only two parts ("Rathgar, Dublin" is an address and a county, but "Leixlip, Kildare" is a town and a
    // county). The page title settles it: it ends with "(Town, County)" when there is a town and "(County)" when
    // there is not. Notices can have several locations separated by " / ", the first is the main one.
    var location = getLocationFromTitle();
    var tagText = getText('[class*="DeathNotice_tags-item"]');
    var firstTag = tagText ? clean(tagText.split(" / ")[0]) : "";

    if (location) {
      result.county = location.county;
      if (location.town) {
        result.town = location.town;
      }
      var suffix = location.town ? location.town + ", " + location.county : location.county;
      if (firstTag.toLowerCase().endsWith(suffix.toLowerCase())) {
        result.address = firstTag.substring(0, firstTag.length - suffix.length).replace(/[\s,]+$/, "");
      }
    } else if (firstTag) {
      // no usable title, guess that the last two parts are the town and county
      var parts = firstTag.split(",").map(clean).filter(Boolean);
      if (parts.length > 0) {
        result.county = parts[parts.length - 1];
      }
      if (parts.length > 1) {
        result.town = parts[parts.length - 2];
      }
      if (parts.length > 2) {
        result.address = parts.slice(0, parts.length - 2).join(", ");
      }
    }

    result.datePublished = isoDateFromLongDate(getText('[class*="DeathNotice_dates-published-date"]'));
    result.dateOfDeath = isoDateFromLongDate(getText('[class*="DeathNotice_dates-death-date"]'));
  }

  // ---- the notice text and funeral director always come from the DOM (always current) ----

  var descElement = document.querySelector('[class*="DeathNotice_description"]');
  if (descElement) {
    var paragraphs = descElement.querySelectorAll("p");
    var text = "";
    if (paragraphs.length > 0) {
      for (var p = 0; p < paragraphs.length; p++) {
        var paragraphText = clean(paragraphs[p].textContent);
        if (paragraphText) {
          text += (text ? "\n" : "") + paragraphText;
        }
      }
    } else {
      text = clean(descElement.textContent);
    }
    result.noticeText = text;
  }

  var funeralHome = getText('[class*="DeathNotice_funeral-director-card"] h2');
  if (funeralHome) {
    result.funeralHome = funeralHome;
  }

  result.success = true;

  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
