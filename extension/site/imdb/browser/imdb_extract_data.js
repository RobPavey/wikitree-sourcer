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

// IMDb has two kinds of pages that Sourcer can cite:
//  /name/nm0000093/ : a person (actor, director etc.)
//  /title/tt0114369/ : a film, TV series, episode, game etc.
// The data is taken from the JSON-LD block if present, then from the page's __NEXT_DATA__ block
// and then from the visible page. IMDb changes its page layout fairly often so each source is optional.

function getJsonLd(document) {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (let script of scripts) {
    try {
      let json = JSON.parse(script.textContent);
      if (Array.isArray(json)) {
        json = json[0];
      }
      // On the biography page the block is an Article and the person is its mainEntity
      if (json && json.mainEntity && json.mainEntity["@type"]) {
        json = json.mainEntity;
      }
      if (json && json["@type"]) {
        return json;
      }
    } catch (e) {
      // ignore a block that cannot be parsed
    }
  }
  return undefined;
}

function getNextData(document) {
  const script = document.querySelector("script#__NEXT_DATA__");
  if (script) {
    try {
      return JSON.parse(script.textContent);
    } catch (e) {
      // ignore
    }
  }
  return undefined;
}

// IMDb adds a Roman numeral in parentheses to the heading for a name that is not unique, e.g. "David Tennant(I)"
function removeDisambiguator(name) {
  return cleanText(name).replace(/\s*\([IVXL]+\)$/, "");
}

function cleanText(text) {
  if (!text) {
    return "";
  }
  return text.replace(/\s+/g, " ").trim();
}

// The JSON-LD properties can be a string, an object with a name or an array of either.
function namesFromJsonLdList(value) {
  let names = [];
  if (!value) {
    return names;
  }
  let list = Array.isArray(value) ? value : [value];
  for (let item of list) {
    let name = typeof item == "string" ? item : item && item.name;
    name = cleanText(name);
    if (name && !names.includes(name)) {
      names.push(name);
    }
  }
  return names;
}

function parseUrl(url) {
  let result = {};
  if (!url) {
    return result;
  }
  let match = url.match(/imdb\.com\/(?:[a-z]{2}\/)?(name|title)\/((?:nm|tt)\d+)/i);
  if (match) {
    result.pageType = match[1].toLowerCase();
    result.id = match[2].toLowerCase();
    result.isBioPage = /imdb\.com\/(?:[a-z]{2}\/)?name\/nm\d+\/bio(?:[/?#]|$)/i.test(url);
  }
  return result;
}

// Build the canonical URL which does not have the "ref_" query parameters that IMDb adds
function buildCanonicalUrl(pageType, id) {
  return "https://www.imdb.com/" + pageType + "/" + id + "/";
}

// e.g. "1963-12-18" or "1963" or "1963-12"
function cleanIsoDate(dateString) {
  if (dateString && /^\d\d\d\d(-\d\d(-\d\d)?)?$/.test(dateString.trim())) {
    return dateString.trim();
  }
  return "";
}

function dateFromComponents(dateObj) {
  if (!dateObj || !dateObj.dateComponents) {
    return "";
  }
  const dc = dateObj.dateComponents;
  if (!dc.year) {
    return "";
  }
  let date = String(dc.year);
  if (dc.month) {
    date += "-" + String(dc.month).padStart(2, "0");
    if (dc.day) {
      date += "-" + String(dc.day).padStart(2, "0");
    }
  }
  return date;
}

function extractPersonFromNextData(nextData, result) {
  const pageProps = nextData && nextData.props && nextData.props.pageProps;
  if (!pageProps) {
    return;
  }
  const above = pageProps.aboveTheFold;
  const main = pageProps.mainColumnData;

  if (above) {
    if (!result.name && above.nameText && above.nameText.text) {
      result.name = cleanText(above.nameText.text);
    }
    if (!result.jobTitles && above.professions) {
      result.jobTitles = above.professions.map((p) => p.category && p.category.text).filter((t) => t);
    }
    if (!result.birthDate) {
      result.birthDate = dateFromComponents(above.birthDate);
    }
    if (!result.deathDate) {
      result.deathDate = dateFromComponents(above.deathDate);
    }
    if (!result.birthPlace && above.birthLocation && above.birthLocation.text) {
      result.birthPlace = cleanText(above.birthLocation.text);
    }
    if (!result.deathPlace && above.deathLocation && above.deathLocation.text) {
      result.deathPlace = cleanText(above.deathLocation.text);
    }
  }

  if (main) {
    if (!result.birthDate) {
      result.birthDate = dateFromComponents(main.birthDate);
    }
    if (!result.deathDate) {
      result.deathDate = dateFromComponents(main.deathDate);
    }
    if (!result.birthPlace && main.birthLocation && main.birthLocation.text) {
      result.birthPlace = cleanText(main.birthLocation.text);
    }
    if (!result.deathPlace && main.deathLocation && main.deathLocation.text) {
      result.deathPlace = cleanText(main.deathLocation.text);
    }
    if (!result.birthName && main.nameText && main.nameText.text) {
      // not the birth name, ignore
    }
    if (main.akas && main.akas.edges && !result.alternateNames) {
      result.alternateNames = main.akas.edges
        .map((e) => e.node && e.node.displayableProperty && e.node.displayableProperty.value)
        .map((v) => v && v.plainText)
        .filter((t) => t);
    }
  }
}

function extractPersonFromDom(document, result) {
  if (!result.name) {
    const heading = document.querySelector('h1[data-testid="hero__pageTitle"], h1');
    if (heading) {
      result.name = removeDisambiguator(heading.textContent);
    }
  }

  if (!result.birthPlace) {
    const link = document.querySelector(
      '[data-testid="birth-and-death-birthdate"] a[href*="birth_place"], a[href*="birth_place="]'
    );
    if (link) {
      result.birthPlace = cleanText(link.textContent);
    }
  }
  if (!result.deathPlace) {
    const link = document.querySelector(
      '[data-testid="birth-and-death-deathdate"] a[href*="death_place"], a[href*="death_place="]'
    );
    if (link) {
      result.deathPlace = cleanText(link.textContent);
    }
  }

  // Fallback for the dates is the displayed text, e.g. "Born December 18, 1963" or "Died January 1, 1990"
  if (!result.birthDate) {
    const element = document.querySelector('[data-testid="birth-and-death-birthdate"]');
    if (element) {
      let text = cleanText(element.textContent).replace(/^Born\s*/i, "");
      // remove the place and age if they follow the date
      text = text.replace(/^(\w+ \d{1,2}, \d{4}|\d{4}).*$/, "$1");
      result.birthDateText = text;
    }
  }
  if (!result.deathDate) {
    const element = document.querySelector('[data-testid="birth-and-death-deathdate"]');
    if (element) {
      let text = cleanText(element.textContent).replace(/^Died\s*/i, "");
      text = text.replace(/^(\w+ \d{1,2}, \d{4}|\d{4}).*$/, "$1");
      result.deathDateText = text;
    }
  }
}

// e.g. "December 30, 2011 - present" or "June 1, 1990 - May 5, 1995"
function parseSpouseRange(text, spouse) {
  const range = cleanText(text).split(/\s+-\s+/);
  if (range[0]) {
    spouse.fromDate = cleanText(range[0]);
  }
  if (range.length > 1 && !/^present$/i.test(cleanText(range[1]))) {
    spouse.toDate = cleanText(range[1]);
  }
}

// The relations on the biography page (parents, children, others) are connections of edges
function getRelationEdges(connection) {
  let relations = [];
  if (connection && connection.edges) {
    for (let edge of connection.edges) {
      const node = edge && edge.node;
      const prop = node && node.relationName && node.relationName.displayableProperty;
      const name = prop && prop.value && cleanText(prop.value.plainText);
      if (name) {
        relations.push({
          name: name,
          relationship: node.relationshipType && node.relationshipType.text ? node.relationshipType.text : "",
        });
      }
    }
  }
  return relations;
}

// The biography page keeps all its data in __NEXT_DATA__ at props.pageProps.contentData.data.name
function extractBioFromNextData(nextData, result) {
  const pageProps = nextData && nextData.props && nextData.props.pageProps;
  const name = pageProps && pageProps.contentData && pageProps.contentData.data && pageProps.contentData.data.name;
  if (!name) {
    return false;
  }

  if (name.nameText && name.nameText.text) {
    result.name = cleanText(name.nameText.text);
  }
  if (!result.birthDate) {
    result.birthDate = dateFromComponents(name.birthDate);
  }
  if (!result.deathDate) {
    result.deathDate = dateFromComponents(name.deathDate);
  }
  if (!result.birthPlace && name.birthLocation && name.birthLocation.text) {
    result.birthPlace = cleanText(name.birthLocation.text);
  }
  if (!result.deathPlace && name.deathLocation && name.deathLocation.text) {
    result.deathPlace = cleanText(name.deathLocation.text);
  }
  if (!result.jobTitles || result.jobTitles.length == 0) {
    result.jobTitles = (name.professions || []).map((p) => p.profession && p.profession.text).filter((t) => t);
  }

  const birthName = name.birthName && name.birthName.displayableProperty && name.birthName.displayableProperty.value;
  if (birthName && birthName.plainText) {
    result.birthName = cleanText(birthName.plainText);
  }

  const parents = getRelationEdges(name.parents).map((r) => r.name);
  if (parents.length > 0) {
    result.parents = parents;
  }

  const children = getRelationEdges(name.children).map((r) => r.name);
  if (children.length > 0) {
    result.children = children;
  }

  const relatives = getRelationEdges(name.others);
  if (relatives.length > 0) {
    result.relatives = relatives;
  }

  if (name.spouses && name.spouses.length > 0) {
    let spouses = [];
    for (let item of name.spouses) {
      const spouseName = item.spouse && item.spouse.asMarkdown && cleanText(item.spouse.asMarkdown.plainText);
      if (!spouseName) {
        continue;
      }
      let spouse = { name: spouseName };
      const range = item.timeRange && item.timeRange.displayableProperty && item.timeRange.displayableProperty.value;
      if (range && range.plainText) {
        parseSpouseRange(range.plainText, spouse);
      }
      spouses.push(spouse);
    }
    if (spouses.length > 0) {
      result.spouses = spouses;
    }
  }

  return true;
}

// The same data as visible in the page, used if the __NEXT_DATA__ is not as expected.
// Each item is an li with an id like "born" or "parents" with a label span followed by the content.
function getBioListItems(document, id) {
  let items = [];
  const entries = document.querySelectorAll("li#" + id + " ul > div");
  for (let entry of entries) {
    // join the parts so that "Blair" and "(Sibling)" are not run together
    let parts = [];
    for (let child of entry.children) {
      const text = cleanText(child.textContent);
      if (text) {
        parts.push(text);
      }
    }
    if (parts.length == 0) {
      const text = cleanText(entry.textContent);
      if (text) {
        parts.push(text);
      }
    }
    if (parts.length > 0) {
      items.push(parts);
    }
  }
  return items;
}

function extractBioFromDom(document, result) {
  // e.g. "April 18, 1971 · Bathgate, West Lothian, Scotland, UK"
  const born = document.querySelector("li#born");
  if (born && !result.birthDate && !result.birthDateText) {
    const text = cleanText(born.textContent).replace(/^Born\s*/, "");
    const parts = text.split("·");
    if (cleanText(parts[0])) {
      result.birthDateText = cleanText(parts[0]);
    }
    if (parts.length > 1 && cleanText(parts[1]) && !result.birthPlace) {
      result.birthPlace = cleanText(parts[1]);
    }
  }

  if (!result.birthName) {
    const birthName = document.querySelector("li#name");
    if (birthName) {
      const text = cleanText(birthName.textContent).replace(/^Birth name\s*/, "");
      if (text) {
        result.birthName = text;
      }
    }
  }

  if (!result.parents) {
    const parents = getBioListItems(document, "parents").map((parts) => parts.join(" "));
    if (parents.length > 0) {
      result.parents = parents;
    }
  }

  if (!result.children) {
    const children = getBioListItems(document, "children").map((parts) => parts.join(" "));
    if (children.length > 0) {
      result.children = children;
    }
  }

  if (!result.spouses) {
    // e.g. ["Georgia Tennant", "(December 30, 2011 - present) (5 children)"]
    const spouses = getBioListItems(document, "spouses").map((parts) => {
      let spouse = { name: parts[0] };
      const match = parts.length > 1 ? parts[1].match(/^\(([^()]*\d{4}[^()]*)\)/) : undefined;
      if (match) {
        parseSpouseRange(match[1], spouse);
      }
      return spouse;
    });
    if (spouses.length > 0) {
      result.spouses = spouses;
    }
  }

  if (!result.relatives) {
    // e.g. ["Blair", "(Sibling)"]
    const relatives = getBioListItems(document, "relatives").map((parts) => {
      const relationship = parts.length > 1 ? parts[1].replace(/^\(|\)$/g, "") : "";
      return { name: parts[0], relationship: relationship };
    });
    if (relatives.length > 0) {
      result.relatives = relatives;
    }
  }
}

function extractBioPage(document, result) {
  if (!extractBioFromNextData(getNextData(document), result)) {
    // no data block, the name will have to come from the JSON-LD or the page title
  }
  extractBioFromDom(document, result);
}

function extractPerson(document, result, jsonLd) {
  if (jsonLd && jsonLd["@type"] == "Person") {
    result.name = cleanText(jsonLd.name);
    result.birthDate = cleanIsoDate(jsonLd.birthDate);
    result.deathDate = cleanIsoDate(jsonLd.deathDate);
    result.jobTitles = namesFromJsonLdList(jsonLd.jobTitle);
    if (jsonLd.description) {
      result.description = cleanText(jsonLd.description);
    }
  }

  if (result.isBioPage) {
    // On this page the h1 is just "Biography". The name is in the data or the page title.
    extractBioPage(document, result);
    if (!result.name) {
      // e.g. "David Tennant - Biography - IMDb"
      const title = cleanText(document.title).replace(/\s*-\s*Biography\s*-\s*IMDb$/i, "");
      if (title) {
        result.name = title;
      }
    }
    return;
  }

  extractPersonFromNextData(getNextData(document), result);
  extractPersonFromDom(document, result);
}

function extractTitle(document, result, jsonLd) {
  if (jsonLd) {
    result.name = cleanText(jsonLd.name);
    // The JSON-LD type is e.g. Movie, TVSeries, TVEpisode, VideoGame. IMDb uses TVSeries for mini-series.
    result.titleType = jsonLd["@type"];
    if (jsonLd.datePublished) {
      result.datePublished = cleanText(jsonLd.datePublished);
    }
    result.directors = namesFromJsonLdList(jsonLd.director);
    result.creators = namesFromJsonLdList(jsonLd.creator).filter((n) => n != "IMDb");
    result.actors = namesFromJsonLdList(jsonLd.actor);
    if (jsonLd.description) {
      result.description = cleanText(jsonLd.description);
    }
  }

  if (!result.name) {
    const heading = document.querySelector('h1[data-testid="hero__pageTitle"], h1');
    if (heading) {
      result.name = removeDisambiguator(heading.textContent);
    }
  }

  // The page data has the years a series ran, e.g. 1963 to 1989, which the JSON-LD does not
  const nextData = getNextData(document);
  const pageProps = nextData && nextData.props && nextData.props.pageProps;
  const above = pageProps && (pageProps.aboveTheFoldData || pageProps.aboveTheFold);
  if (above) {
    if (above.releaseYear && above.releaseYear.year) {
      result.releaseYear = String(above.releaseYear.year);
      if (above.releaseYear.endYear && above.releaseYear.endYear != above.releaseYear.year) {
        result.endYear = String(above.releaseYear.endYear);
      }
    }
    if (above.titleType && above.titleType.text) {
      result.titleTypeText = cleanText(above.titleType.text);
    }
  }
}

function extractData(document, url) {
  let result = { url: url, success: false };

  let urlData = parseUrl(url);
  if (!urlData.pageType) {
    return result;
  }
  result.pageType = urlData.pageType;
  result.id = urlData.id;
  if (urlData.isBioPage) {
    result.isBioPage = true;
  }
  result.canonicalUrl = buildCanonicalUrl(urlData.pageType, urlData.id);
  if (urlData.isBioPage) {
    // the data came from the biography page so that is the page to cite
    result.canonicalUrl += "bio";
  }

  const jsonLd = getJsonLd(document);

  if (urlData.pageType == "name") {
    extractPerson(document, result, jsonLd);
  } else {
    extractTitle(document, result, jsonLd);
  }

  if (!result.name) {
    return result;
  }

  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
