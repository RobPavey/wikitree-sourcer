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

import { simpleBuildCitationWrapper } from "../../../base/core/citation_builder.mjs";

function buildGbooksUrl(ed, builder) {
  // If the share link dialog is up then this overrides everything
  if (ed.isShareLinkVisible && ed.shareLink) {
    return ed.shareLink;
  }

  // if we have a urlPageNumber then this is our best guess of what page is actually being viewed
  // It comes from the url of the page in the iframe.
  if (ed.urlPageNumber && ed.shareLink) {
    // However the pageLink is of the form:
    // https://books.google.com/books/content?id=sDbPAAAAMAAJ&pg=PP20&img=1&zoom=3&hl=en&bul=1&sig=ACfU3U0ukQ8GUn2z9hh1cJpuMDwI7nRpUg&w=1025
    // while we actually want to use the form of the shareLink which is like:
    // https://www.google.com/books/edition/The_First_Part_of_the_True_and_Honorable/sDbPAAAAMAAJ?hl=en&gbpv=1&dq=Cobham%20Lord&pg=PP21&printsec=frontcover

    // It seems that there will always be a shareLink when the iFrame is oprn - it is just out of date
    // it is the page when the iframe opened or when the share dialog was last brought up
    let link = ed.shareLink;
    let regexp = new RegExp("\\&pg\\=[A-Z0-9]+");
    link = link.replace(regexp, "&pg=" + ed.urlPageNumber);
    return link;
  }

  if (ed.shareLink) {
    return ed.shareLink;
  }

  return ed.url;
}

function getCitationOfType(ed, type) {
  let citations = ed.citations;
  if (citations && citations.length > 0) {
    for (let citationEntry of citations) {
      if (citationEntry.type == type) {
        return citationEntry.text;
      }
    }
  }
}

function getPartsOfCitationString(ed, type, builder) {
  let citation = getCitationOfType(ed, type);
  if (citation) {
    let title = ed.title;
    if (title) {
      let titleMatchString = title;
      if (ed.subtitle) {
        titleMatchString = title + ": " + ed.subtitle;
      }
      let result = {};
      let titleIndex = citation.indexOf(titleMatchString);
      if (titleIndex == -1) {
        titleMatchString = title;
        titleIndex = citation.indexOf(titleMatchString);
      }
      if (titleIndex != -1) {
        if (titleIndex > 0) {
          result.authors = citation.substring(0, titleIndex).trim();
        }
        let titleEndIndex = titleIndex + titleMatchString.length;
        if (titleEndIndex < citation.length) {
          let publisher = citation.substring(titleEndIndex).trim();
          if (publisher.endsWith(".")) {
            publisher = publisher.substring(0, publisher.length - 1).trim();
          }
          if (publisher.startsWith(".")) {
            publisher = publisher.substring(1).trim();
          }
          result.publisher = publisher;
        }
      }
      //console.log("getPartsOfChicagoCitation, result is:");
      //console.log(result);
      return result;
    }
  }

  return {};
}

function getPartsOfChicagoCitation(ed, builder) {
  return getPartsOfCitationString(ed, "Chicago", builder);
}

function getAuthorPartOfSourceTitle(ed, builder) {
  let authorOption = builder.getOptions().citation_gbooks_authorNames;

  let authorText = "";

  function addAuthor(author) {
    if (author) {
      if (authorText) {
        authorText += ", ";
      }
      authorText += author;
    }
  }

  function getAuthorPartPageAll() {
    if (ed.author) {
      authorText = ed.author;
    } else if (ed.authors && ed.authors.length > 0) {
      for (let author of ed.authors) {
        addAuthor(author);
      }
    }
  }

  function getAuthorPartPage3() {
    if (ed.author) {
      authorText = ed.author;
    } else if (ed.authors && ed.authors.length > 0) {
      let numAuthorsToInclude = ed.authors.length;
      if (numAuthorsToInclude > 3) {
        numAuthorsToInclude = 3;
      }
      for (let authorIndex = 0; authorIndex < numAuthorsToInclude; authorIndex++) {
        addAuthor(ed.authors[authorIndex]);
      }
      if (ed.authors.length > 3) {
        authorText += " et al";
      }
    }
  }

  function getAuthorPartPage3Editors() {
    if (ed.author) {
      authorText = ed.author;
    } else if (ed.authors && ed.authors.length > 0) {
      let numAuthorsToInclude = ed.authors.length;
      let useEditors = false;
      let multipleEditors = false;
      let editorString = "";
      if (numAuthorsToInclude > 3) {
        numAuthorsToInclude = 3;
        if (ed.aboutThisEdition) {
          if (ed.aboutThisEdition["Editor"]) {
            editorString = ed.aboutThisEdition["Editor"];
          } else if (ed.aboutThisEdition["Editors"]) {
            editorString = ed.aboutThisEdition["Editors"];
            multipleEditors = true;
          }
        }
        if (editorString) {
          useEditors = true;
        }
      }
      if (useEditors) {
        addAuthor(editorString);
        if (editorString) {
          if (multipleEditors) {
            authorText += ", eds.";
          } else {
            authorText += ", ed.";
          }
        }
      } else {
        for (let authorIndex = 0; authorIndex < numAuthorsToInclude; authorIndex++) {
          addAuthor(ed.authors[authorIndex]);
        }
        if (ed.authors.length > 3) {
          authorText += " et al.";
        }
      }
    }
  }

  function getAuthorPartFromCitationString() {
    let citationType = "Chicago";
    if (authorOption == "apa") {
      citationType = "APA";
    }
    let citationParts = getPartsOfCitationString(ed, citationType, builder);
    if (citationParts.authors) {
      addAuthor(citationParts.authors);
    } else {
      // hopefully should never happen
      getAuthorPartPage3Editors();
    }
  }

  if (authorOption == "pageAll") {
    getAuthorPartPageAll();
  } else if (authorOption == "page3") {
    getAuthorPartPage3();
  } else if (authorOption == "page3Editors") {
    getAuthorPartPage3Editors();
  } else if (authorOption == "chicago" || authorOption == "apa") {
    getAuthorPartFromCitationString();
  }

  return authorText;
}

function buildSourceTitle(ed, gd, builder) {
  let titleOption = builder.getOptions().citation_gbooks_titleContent;

  let title = "";
  if (ed.title) {
    title += ed.title;
    if (titleOption == "titlePlusSubtitle" && ed.subtitle) {
      title += ": " + ed.subtitle;
    }
  } else if (ed.headTitle) {
    title += ed.headTitle;
  }
  let author = getAuthorPartOfSourceTitle(ed, builder);

  let sourceTitle = "";
  if (author && title) {
    sourceTitle = author + ", ''" + title + "''";
  } else if (title) {
    sourceTitle = "''" + title + "''";
  }
  if (sourceTitle) {
    builder.sourceTitle = sourceTitle;
    builder.putSourceTitleInQuotes = false;
  }
}

function buildSourceReference(ed, gd, builder) {
  let string = "";
  function addPart(part) {
    if (part) {
      if (string) {
        string += ", ";
      }
      string += part;
    }
  }

  let publisher = ed.publisher;
  let publisherOption = builder.getOptions().citation_gbooks_publisherDetails;
  if (publisherOption == "chicago" || !publisher) {
    let chicagoParts = getPartsOfChicagoCitation(ed, builder);
    if (chicagoParts && chicagoParts.publisher) {
      publisher = chicagoParts.publisher;
      addPart(publisher);
    }
  } else {
    addPart(ed.publisher);
    addPart(ed.date);
  }

  // if the URL includes a page then we can refer to that:
  if (ed.pageNumber && ed.pageNumber != "Contents unavailable") {
    addPart("page " + ed.pageNumber);
  } else {
    let url = buildGbooksUrl(ed, builder);
    let pageNumber = url.replace(/^.*[\?\&]pg\=([^\&]+).*$/, "$1");
    if (pageNumber && pageNumber != url) {
      if (pageNumber.startsWith("PA")) {
        pageNumber = pageNumber.substring(2);
      }
      addPart("page " + pageNumber);
    }
  }

  builder.sourceReference = string;
}

function buildRecordLink(ed, gd, builder) {
  var gbooksUrl = buildGbooksUrl(ed, builder);

  let recordLink = "[" + gbooksUrl + " Google Books]";
  builder.recordLinkOrTemplate = recordLink;
}

function buildCoreCitation(ed, gd, builder) {
  buildSourceTitle(ed, gd, builder);
  buildSourceReference(ed, gd, builder);
  buildRecordLink(ed, gd, builder);
}

function buildCitation(input) {
  return simpleBuildCitationWrapper(input, buildCoreCitation);
}

export { buildCitation };
