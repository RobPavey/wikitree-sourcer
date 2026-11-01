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

// Cemetery Map (https://github.com/robinson27225/cemetery-map) is a single page app. When a person is opened it shows
// them in the details panel (section#detail) and puts the cemetery and the person in the address, e.g.
//   ?category=Claquato_Cemetery,_Chehalis,_Washington&wt=Jones-67676
//   ?cemetery=fairview-raton-nm&fag=12345678    (a person who has no WikiTree profile is identified by Find a Grave ID)
// The panel is built in detail.js of that app: an h2 title, optional photos, then one div.person for each person on the stone
// (an h3 name, div.dates lines, div.chips links) and finally div.coords.

function textOf(element) {
  return element && element.textContent ? element.textContent.replace(/\s+/g, " ").trim() : "";
}

function idFromHref(href, regex) {
  let match = regex.exec(href || "");
  return match ? decodeURIComponent(match[1]) : "";
}

function extractPerson(personElement, result) {
  let nameElement = personElement.querySelector("h3");
  result.name = textOf(nameElement);

  // The WikiTree ID, Find a Grave memorial and FamilySearch person are the chips below the dates
  let links = personElement.querySelectorAll("div.chips a[href]");
  for (let link of links) {
    let href = link.getAttribute("href");
    result.wtId = result.wtId || idFromHref(href, /wikitree\.com\/wiki\/([^/?#]+)$/);
    result.findAGraveId = result.findAGraveId || idFromHref(href, /findagrave\.com\/memorial\/(\d+)/);
    result.familySearchId =
      result.familySearchId || idFromHref(href, /person\/(?:details\/)?([A-Z0-9]{4}-[A-Z0-9]{3,4})/);
  }

  // div.dates lines in order: "Jones-67676 · 1886 – 1981" (or "No WikiTree profile yet · 1886 – 1981"),
  // "Died: <place>", the plot ("Section 2, Plot 14") and any notes.
  let dateLines = personElement.querySelectorAll("div.dates");
  let otherLines = [];
  for (let line of dateLines) {
    let text = textOf(line);
    if (!text) {
      continue;
    }
    let died = /^Died:\s*(.+)$/.exec(text);
    if (died) {
      result.deathPlace = died[1];
      continue;
    }
    let lifeSpan = /(\d{4}|\?)\s*[–-]\s*(\d{4}|\?)\s*$/.exec(text);
    if (lifeSpan && !/^(Section|Plot|Row|Monument|Reference) /.test(text)) {
      result.birthYear = lifeSpan[1] == "?" ? "" : lifeSpan[1];
      result.deathYear = lifeSpan[2] == "?" ? "" : lifeSpan[2];
      continue;
    }
    if (/^(No WikiTree profile yet|[A-Z][A-Za-z'-]*-\d+)$/.test(text)) {
      continue;
    }
    otherLines.push(text);
  }
  if (otherLines.length) {
    result.plot = otherLines[0];
  }
  if (otherLines.length > 1) {
    result.notes = otherLines.slice(1).join("; ");
  }
}

function extractData(document, url) {
  let result = { url: url, success: false };

  let detail = document.querySelector("section#detail");
  if (!detail || detail.hasAttribute("hidden")) {
    return result;
  }
  let personElements = detail.querySelectorAll("div.person");
  if (!personElements.length) {
    return result;
  }

  let params = {};
  try {
    params = Object.fromEntries(new URL(url).searchParams);
  } catch (e) {
    return result;
  }

  // Several people can share a stone. The address says which one is open, so that is the one to cite.
  let personElement = undefined;
  for (let candidate of personElements) {
    let links = Array.from(candidate.querySelectorAll("div.chips a[href]")).map((a) => a.getAttribute("href"));
    if (params.wt && links.some((href) => href.endsWith("/wiki/" + params.wt))) {
      personElement = candidate;
    } else if (params.fag && links.some((href) => href.endsWith("/memorial/" + params.fag))) {
      personElement = candidate;
    }
    if (personElement) {
      break;
    }
  }
  if (!personElement) {
    if (personElements.length > 1) {
      return result;
    }
    personElement = personElements[0];
  }

  extractPerson(personElement, result);
  if (!result.name || result.name == "Name not recorded" || /^Unknown headstone/.test(result.name)) {
    result.success = false;
    return result;
  }

  // The cemetery
  let cemeteryElement = document.querySelector("#cem-name");
  result.cemeteryName = textOf(cemeteryElement);
  let spaceUrl = cemeteryElement ? cemeteryElement.getAttribute("title") : "";
  if (spaceUrl && /wikitree\.com\/wiki\/Space:/.test(spaceUrl)) {
    result.cemeterySpaceUrl = spaceUrl;
  }
  if (params.category) {
    // Category names use underscores for spaces: Claquato_Cemetery,_Chehalis,_Washington
    result.cemeteryCategory = params.category.replace(/^Category:/, "").replace(/_/g, " ");
  }
  if (params.cemetery) {
    result.cemeteryId = params.cemetery;
  }
  if (!result.cemeteryName && !result.cemeteryCategory) {
    return result;
  }

  // The location, shown as "46.648022, -123.023667" in div.coords
  let coords = /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/.exec(textOf(detail.querySelector("div.coords span")));
  if (coords) {
    result.latitude = coords[1];
    result.longitude = coords[2];
  }

  let photoLinks = detail.querySelectorAll("div.photos a[href]");
  if (photoLinks.length) {
    result.hasHeadstonePhoto = true;
  }

  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
