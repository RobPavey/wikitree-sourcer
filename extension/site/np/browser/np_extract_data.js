/*
MIT License

Copyright (c) 2020 Robert M Pavey

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

function cleanText(inputText) {
  let text = inputText;
  if (text) {
    text = text.trim();
    text = text.replace(/\s+/g, " ");
    text = text.replace(/\s([,;.])/g, "$1");
  }
  return text;
}

function extractMissingDataFromNavNodes(document, result) {
  let mainContentNode = document.querySelector("#mainContent");
  if (mainContentNode) {
    let navNode = mainContentNode.querySelector("nav[aria-label='Breadcrumb']");
    if (navNode) {
      let listItems = navNode.querySelectorAll("ol > li");
      if (listItems.length > 0) {
        // the breadcrumbs can be:
        // country, state, place, newspaper name, year, month, day, page, "arcticle clipped..."
        // But that is probably not always true.
        if (listItems.length == 9) {
          let year = listItems[4].textContent.trim();
          let day = listItems[6].textContent.trim();
          const yearRegex = /^\d\d\d\d$/;
          const dayRegex = /^\d\d?$/;
          if (yearRegex.test(year) && dayRegex.test(day)) {
            let month = listItems[5].textContent.trim();
            let date = day + " " + month + " " + year;
            result.publicationDate = date;

            let newTitle = listItems[3].textContent.trim();
            if (!result.newspaperTitle && newTitle && !newTitle.endsWith("…")) {
              result.newspaperTitle = newTitle;
            }

            let country = listItems[0].textContent.trim();
            let state = listItems[1].textContent.trim();
            let town = listItems[2].textContent.trim();
            if (country && state && town) {
              let newLocation = town + ", " + state + ", " + country;
              if (!result.location) {
                result.location = newLocation;
              } else if (newLocation.length > result.location.length) {
                // it could be a better location but could be worse.
                // e.g. result.location can be "Tamworth, Staffordshire, England" and
                // newLocation can be "Tamworth, England, United Kingdom"
                // But sometimes it is better
                // e.g. result.location can be "Vergennes, Vermont" and
                // newLocation can be "Vergennes, Vermont, United States"
                if (newLocation.startsWith(result.location)) {
                  result.location = newLocation;
                }
              }
            }

            if (!result.pageNumber) {
              let pageString = listItems[7].textContent.trim();
              if (pageString) {
                pageString = pageString.replace(/^page\s*/i, ""); // remove "Page " from start
                result.pageNumber = pageString;
              }
            }

            if (!result.articleTitle) {
              let articleTitleFromBreadCrumbs = listItems[8].textContent.trim();
              if (!articleTitleFromBreadCrumbs.startsWith("Article clipped from")) {
                result.articleTitle = articleTitleFromBreadCrumbs;
              }
            }
          }
        }
      }
    }
  }
}

function extractData(document, url) {
  var result = {};
  result.url = url;

  result.success = false;

  let metaDescription = document.querySelector("meta[name='description']");
  let metaTitle = document.querySelector("meta[property='og:title']");
  let pageNumberElement = document.querySelector("span[class^='PublicationInfo_Page']");
  let publisherElement = document.querySelector("h2[class^='PublicationInfo_Publisher']");
  let locationElement = document.querySelector("p[class^='PublicationInfo_Location']");
  let dateTimeElement = document.querySelector("div.sticky-sm-top time");

  if (metaTitle) {
    title = metaTitle.getAttribute("content");
    // sometimes it has " - Newspapers.com" on the end
    const endingToRemove = " - Newspapers.com";
    if (title.endsWith(endingToRemove)) {
      title = title.substring(0, title.length - endingToRemove.length);
    }
    result.articleTitle = title;
  }

  if (metaDescription) {
    result.articleDescription = metaDescription.getAttribute("content");
  }

  if (!publisherElement || !dateTimeElement || !locationElement) {
    // If you are not logged into newspapers.com it will not have found these
    // We can extract stuff from the description.
    // e.g:
    // Clipping found in The Bangor Daily News published in Bangor, Maine on 7/2/1991. Obituary for Gladys T. McCloskey
    if (result.articleDescription) {
      let desc = result.articleDescription;
      const regexNew = /^Clipping found in (.*) published in (.*) on ([^.]+)\.\s*(.*)$/;
      const regexOld = /^Clipping found in (.*) in (.*) on ([^.]+)\.\s*(.*)$/;
      let regex = "";
      if (regexNew.test(desc)) {
        regex = regexNew;
      } else if (regexOld.test(desc)) {
        regex = regexOld;
      }

      if (regex) {
        let matches = desc.match(regex);
        if (matches.length == 5) {
          result.publicationDate = matches[3];
          result.newspaperTitle = matches[1];
          result.location = matches[2];
          result.success = true;
        }
      }
    }

    extractMissingDataFromNavNodes(document, result);

    // extra checks that should only be used on old saved files but kept defensively
    // for page changes

    if (!result.pageNumber) {
      let pageNumberElement = document.querySelector("[itemprop='position']");
      if (pageNumberElement) {
        result.pageNumber = pageNumberElement.innerHTML.split(" ")[1];
      }
    }
  } else {
    if (dateTimeElement) {
      result.publicationDate = dateTimeElement.textContent;
    }

    if (publisherElement) {
      result.newspaperTitle = cleanText(publisherElement.textContent);
    }

    // locationElement is tricky as it has child names we want to ignore.
    if (locationElement) {
      if (locationElement.childNodes && locationElement.childNodes.length > 0) {
        result.location = cleanText(locationElement.childNodes[0].textContent);
      }
    }

    if (pageNumberElement) {
      let text = pageNumberElement.textContent;
      // Can have multiple spaces. e.g.:
      // Page  26
      let parts = text.split(/\s+/);
      if (parts.length == 2) {
        result.pageNumber = parts[1];
      }
    }
  }

  // some things can be extracted better from the na

  result.success = true;

  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
