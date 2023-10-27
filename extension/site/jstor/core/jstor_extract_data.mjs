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

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  let metadataElement = document.querySelector("div.tombstone-metadata");
  if (metadataElement) {
    let contentTypeElement = metadataElement.querySelector("mfe-content-details-pharos-icon.content-type-icon");
    if (contentTypeElement) {
      let type = contentTypeElement.getAttribute("name");
      if (type) {
        // e.g. "book", "academic-content"
        result.contentType = type;
      }
      let contentTypeSpanElement = contentTypeElement.querySelector("span");
      if (contentTypeSpanElement) {
        result.contentTypeText = contentTypeSpanElement.textContent;
      }
    }
    let titleElement = metadataElement.querySelector("mfe-content-details-pharos-heading.item-title-heading");
    if (titleElement) {
      result.title = titleElement.textContent;
    }
    let authorElement = metadataElement.querySelector("mfe-content-details-pharos-link[data-qa='item-authors']");
    if (authorElement) {
      result.authors = authorElement.textContent;
    }
    let stableUrlElement = metadataElement.querySelector("span.copy-stable-url");
    if (stableUrlElement) {
      result.stableUrl = stableUrlElement.textContent;
    }
    let sourceInfoElement = metadataElement.querySelector("div.header-metadata__source-info");
    if (sourceInfoElement) {
      // used when this doc is a book chapter
      let bookElement = sourceInfoElement.querySelector("div[data-qa='book']");
      if (bookElement) {
        let bookTitleElement = bookElement.querySelector("mfe-content-details-pharos-link[data-qa='book-title']");
        if (bookTitleElement) {
          result.bookTitle = bookTitleElement.textContent;
        }
        let spanElements = bookElement.querySelectorAll("span");
        if (spanElements.length > 0) {
          let dateString = spanElements[0].textContent;
          dateString = dateString.replace(/^\s*\,*\s*(.*)\s*$/, "$1").trim();
          if (dateString) {
            result.publishedDate = dateString;
          }
        }
        if (spanElements.length > 1) {
          let detailsString = spanElements[1].textContent;
          detailsString = detailsString.replace(/^\s*\,*\s*(.*)\s*$/, "$1").trim();
          if (detailsString) {
            result.bookPageDetails = detailsString;
          }
        }
      } else {
        let pubDateElement = sourceInfoElement.querySelector("div[data-qa='published-date']");
        if (pubDateElement) {
          result.publishedDate = pubDateElement.textContent;
        }
        let pageCountElement = sourceInfoElement.querySelector("div[data-qa='page-count']");
        if (pageCountElement) {
          result.pageCount = pageCountElement.textContent;
        }
        let journalTitleElement = sourceInfoElement.querySelector("div[data-qa='journal'] cite");
        if (journalTitleElement) {
          result.journalName = journalTitleElement.textContent;
        }
        let journalDetailsElement = sourceInfoElement.querySelector(
          "div[data-qa='journal'] span[data-qa='item-src-info']"
        );
        if (journalDetailsElement) {
          let detailsString = journalDetailsElement.textContent;
          detailsString = detailsString.replace(/^\s*\,*\s*(.*)\s*$/, "$1").trim();
          if (detailsString) {
            result.journalDetails = detailsString;
          }
        }
      }
    }

    let additionalFieldElements = document.querySelectorAll("div.additional-field > div.metadata-element");
    for (let additionalFieldElement of additionalFieldElements) {
      let labelElement = additionalFieldElement.querySelector("div.metadata-label");
      let valueElement = additionalFieldElement.querySelector("span.metadata-value");
      if (labelElement && valueElement) {
        let label = labelElement.textContent;
        let value = valueElement.textContent;
        if (!result.additionalFields) {
          result.additionalFields = {};
        }
        result.additionalFields[label] = value;
      }
    }

    let aboutThisBookElement = document.querySelector("div.about-this-book-wrapper");
    if (aboutThisBookElement) {
      let pubInfoElement = aboutThisBookElement.querySelector("div.publication-info");
      if (pubInfoElement) {
        let labelElement = pubInfoElement.querySelector("div.metadata-label");
        let valueElement = pubInfoElement.querySelector("span");
        if (labelElement.textContent == "Published by") {
          result.publisher = valueElement.textContent;
        }
      }
    }
  } else {
    // it could be a preview
    let turnawayPreviewElement = document.querySelector("div.turnaway-preview");
    if (turnawayPreviewElement) {
      result.isPreview = true;
      let headingElement = turnawayPreviewElement.querySelector("div.content-meta-data-heading");
      if (headingElement) {
        let contentTypeElement = headingElement.querySelector("div.content-meta-data-label");
        if (contentTypeElement) {
          result.contentType = contentTypeElement.textContent;
        }
        let titleElement = headingElement.querySelector("span");
        if (titleElement) {
          result.title = titleElement.textContent;
        }
      }
      let authorsElement = turnawayPreviewElement.querySelector("p.content-meta-data__authors");
      if (authorsElement) {
        result.authors = authorsElement.textContent;
      }
      let summaryJournalElement = turnawayPreviewElement.querySelector("div.summary-journal");
      if (summaryJournalElement) {
        let subDivs = summaryJournalElement.querySelectorAll("div");
        if (subDivs.length > 0) {
          let journalNameElement = subDivs[0];
          result.journalName = journalNameElement.textContent;
        }
        if (subDivs.length > 1) {
          let journalDetailsElement = subDivs[1];
          let detailsString = journalDetailsElement.textContent;
          detailsString = detailsString.replace(/^\s*\,*\s*(.*)\s*$/, "$1").trim();
          if (detailsString) {
            result.journalDetails = detailsString;
          }
        }
        if (subDivs.length > 2) {
          let journalPublisherElement = subDivs[2];
          let publisherString = journalPublisherElement.textContent;
          publisherString = publisherString.replace(/^\s*\,*\s*(.*)\s*$/, "$1").trim();
          if (publisherString) {
            result.journalPublisher = publisherString;
          }
        }
      }
      let stableUrlElement = turnawayPreviewElement.querySelector("div.content-meta-data-stables");
      if (stableUrlElement) {
        let children = stableUrlElement.children;
        if (children.length == 1) {
          result.stableUrl = stableUrlElement.textContent;
        } else if (children.length > 1) {
          for (let child of children) {
            let text = child.textContent;
            if (text.startsWith("https://www.jstor.org/")) {
              result.stableUrl = text;
            } else {
              if (text.startsWith("https://")) {
                if (!result.otherStableUrls) {
                  result.otherStableUrls = [];
                }
                result.otherStableUrls.push(text);
              }
            }
          }
        }
      }
    }
  }

  let viewerElement = document.querySelector("#item_view_content");
  if (viewerElement) {
    let pageNumberElement = viewerElement.querySelector("div.page-selector > input.page-input");
    if (pageNumberElement) {
      result.pageNumber = pageNumberElement.value;
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
