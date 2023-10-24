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

  const headTitle = document.querySelector("head > title");
  result.headTitle = headTitle.textContent;

  const inputs = document.querySelectorAll("span div > input[type='text']");

  if (inputs.length > 0) {
    result.citations = [];
    for (let input of inputs) {
      let prevSib = input.previousSibling;
      if (prevSib) {
        let type = prevSib.textContent;
        let text = input.value;
        result.citations.push({ type: type, text: text });
      }
    }
  }

  // The title is the first (but not the only role="heading"

  const roleHeadingElements = document.querySelectorAll("body div[role='heading']");
  for (let headingElement of roleHeadingElements) {
    let headingText = headingElement.textContent;
    if (headingText == "Publisher" && !result.publisher) {
      let parentElement = headingElement.parentElement;
      if (parentElement) {
        let nextSib = parentElement.nextSibling;
        if (nextSib) {
          let publisherNameElement = nextSib.querySelector(":scope > div > div > div > div > div > div");
          if (publisherNameElement) {
            let publisher = publisherNameElement.textContent;
            if (publisher) {
              result.publisher = publisher;
            }
          }
        }
      }
    } else if (headingText == "About this edition") {
      result.aboutThisEdition = {};
      let parentElement = headingElement.parentElement;
      if (parentElement) {
        let nextSib = parentElement.nextSibling;
        if (nextSib) {
          let editionElements = nextSib.querySelectorAll(":scope > div > div > div > div > div");
          for (let editionElement of editionElements) {
            let spanElements = editionElement.querySelectorAll(":scope > span");
            if (spanElements.length == 2) {
              let label = spanElements[0].textContent;
              if (label) {
                label = label.trim();
                label = label.replace(/\:$/, "");
              }
              let value = spanElements[1].textContent;
              if (value) {
                value = value.trim();
              }
              if (label && value) {
                result.aboutThisEdition[label] = value;
              }
              let linkElements = spanElements[1].querySelectorAll("a");
              if (linkElements.length > 1) {
                let array = [];
                result.aboutThisEdition[label + "_array"] = [];
                for (let linkElement of linkElements) {
                  let text = linkElement.textContent;
                  if (text) {
                    array.push(text.trim());
                  }
                }
                result.aboutThisEdition[label + "_array"] = array;
              }
            }
          }
        }
      }
    } else {
      let ariaLevel = headingElement.getAttribute("aria-level");
      if (ariaLevel == 1) {
        let titleElement = headingElement;
        let text = headingElement.textContent.trim();
        result.title = text;

        let subtitle = titleElement.nextSibling;
        if (subtitle && subtitle.textContent) {
          result.subtitle = subtitle.textContent.trim();
        }

        let parentNodeOfTitle = titleElement.parentElement;
        if (parentNodeOfTitle) {
          let publishedElement = parentNodeOfTitle.nextSibling;
          if (publishedElement) {
            const authorLinks = publishedElement.querySelectorAll("a");
            if (authorLinks.length == 1) {
              let authorLink = authorLinks[0];
              let author = authorLink.textContent;
              if (author) {
                result.author = author;
              }
              let dateElement = authorLink.nextSibling;
              if (dateElement && dateElement.textContent) {
                let date = dateElement.textContent;
                date = date.replace(/[\s·]+/, " ").trim();
                result.date = date;
              }
            } else if (authorLinks.length == 0) {
              let dateString = publishedElement.textContent;
              if (dateString && /^.*\d\d\d\d$/.test(dateString)) {
                let withNoPunct = dateString.replace(/[\,\.\\s]*/g, "");
                if (withNoPunct) {
                  result.date = dateString;
                }
              }
            } else {
              // multiple authors
              result.authors = [];
              for (let authorLink of authorLinks) {
                let author = authorLink.textContent;
                if (author) {
                  result.authors.push(author);
                }
              }
              let lastAuthorLink = authorLinks[authorLinks.length - 1];
              let dateElement = lastAuthorLink.nextSibling;
              if (dateElement && dateElement.textContent) {
                let date = dateElement.textContent;
                date = date.replace(/[\s·]+/, " ").trim();
                result.date = date;
              }
            }
          }
        }
      }
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
