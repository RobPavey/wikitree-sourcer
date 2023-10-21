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

  const metaTitleElement = document.querySelector("head > meta[property='og:title']");
  if (metaTitleElement) {
    let metaTitle = metaTitleElement.getAttribute("content");
    if (metaTitle) {
      result.metaTitle = metaTitle.trim();
    }
  }

  const titleElement = document.querySelector("head > title");
  if (titleElement && titleElement.textContent) {
    result.title = titleElement.textContent.trim();
  }

  const dcTitleElement = document.querySelector("body h1 > span[property='dc:title']");
  if (dcTitleElement && dcTitleElement.textContent) {
    result.dcTitle = dcTitleElement.textContent.trim();
  }

  const dcCreatorElement = document.querySelector("span[property='dc:creator']");
  if (dcCreatorElement) {
    let creator = dcCreatorElement.getAttribute("content");
    if (creator) {
      result.creator = creator.trim();
    }
  }

  const dcPublisherElement = document.querySelector("span[property='dc:publisher']");
  if (dcPublisherElement) {
    let publisher = dcPublisherElement.getAttribute("content");
    if (publisher) {
      result.publisher = publisher.trim();
    }
  }

  const schemaElement = document.querySelector("div[itemtype='http://schema.org/Book']");
  if (schemaElement) {
    let nameElement = schemaElement.querySelector("span[itemprop='name']");
    if (nameElement && nameElement.textContent) {
      result.name = nameElement.textContent.trim();
    }
    let authorElement = schemaElement.querySelector("span[itemprop='author']");
    if (authorElement && authorElement.textContent) {
      result.author = authorElement.textContent.trim();
    }
  }

  let seqPrefix = "&seq=";
  let urlSeqIndex = url.indexOf(seqPrefix);
  if (urlSeqIndex != -1) {
    let seq = url.substring(urlSeqIndex + seqPrefix.length);
    let extraQueryIndex = seq.indexOf("&");
    if (extraQueryIndex != -1) {
      seq = seq.substring(0, extraQueryIndex);
    }
    if (seq) {
      result.sequenceNumber = seq;

      const pageSeqElements = document.querySelectorAll("details.page-menu span.seq");
      for (let seqElement of pageSeqElements) {
        let text = seqElement.textContent;
        if (text) {
          if (text.startsWith("#" + seq)) {
            let openParenIndex = text.indexOf("(");
            let closeParenIndex = text.indexOf(")");
            if (openParenIndex != -1 && closeParenIndex != -1 && openParenIndex < closeParenIndex) {
              let page = text.substring(openParenIndex + 1, closeParenIndex);
              if (page) {
                if (page.startsWith("p.")) {
                  page = page.substring(2).trim();
                }
                result.pageNumber = page;
                break;
              }
            }
          }
        }
      }
    }
  }

  const shareHandleElement = document.querySelector("#share-handle");
  if (shareHandleElement) {
    let permalink = shareHandleElement.value;
    if (permalink) {
      result.permalink = permalink;
    }
  }

  const shareHandleSeqElement = document.querySelector("#share-handle-seq");
  if (shareHandleSeqElement) {
    let permalinkSeq = shareHandleSeqElement.value;
    if (permalinkSeq) {
      result.permalinkSeq = permalinkSeq;
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
