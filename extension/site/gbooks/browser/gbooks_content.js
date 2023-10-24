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

// This additional message handler is used to extract some data from the iframe that
// is used to view the actial pages.
// This relies on the manifest having:
//       "all_frames": true,
// for "*://*.google.com/books*", (and other country variants)
// Note that this is not "*://*.google.com/books/*" because the iframe URL is something like:
// https://books.google.com/books?id=Qw4SAAAAYAAJ&printsec=frontcover ...

// from https://medium.com/swlh/how-to-build-a-roman-numeral-to-integer-function-in-javascript-8298657a26f7
const romanHash = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};
// s = 1989
function romanToInt(romanString) {
  if (!romanString) {
    return;
  }
  let s = romanString.toUpperCase();
  let accumulator = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "I" && s[i + 1] === "V") {
      accumulator += 4;
      i++;
    } else if (s[i] === "I" && s[i + 1] === "X") {
      accumulator += 9;
      i++;
    } else if (s[i] === "X" && s[i + 1] === "L") {
      accumulator += 40;
      i++;
    } else if (s[i] === "X" && s[i + 1] === "C") {
      accumulator += 90;
      i++;
    } else if (s[i] === "C" && s[i + 1] === "D") {
      accumulator += 400;
      i++;
    } else if (s[i] === "C" && s[i + 1] === "M") {
      accumulator += 900;
      i++;
    } else {
      accumulator += romanHash[s[i]];
    }
  }
  return accumulator;
}

function additionalMessageHandler(request, sender, sendResponse) {
  //console.log("gbooks, additionalMessageHandler, request is:");
  //console.log(request);
  if (request.type == "getPageViewerInfo") {
    //console.log("gbooks, additionalMessageHandler, getPageViewerInfo, document is:");
    //console.log(document);
    let pageLabelElement = document.querySelector("#entity-page-toc-label");
    if (pageLabelElement) {
      //console.log("gbooks, additionalMessageHandler, found #entity-page-toc-label");
      let response = {
        success: true,
      };

      let pageLabel = pageLabelElement.textContent;
      response.pageLabel = pageLabel;

      let shareInputElement = document.querySelector("#entity-page-share-input");
      if (shareInputElement) {
        let shareLink = shareInputElement.value;
        if (shareLink) {
          response.shareLink = shareLink;
        }
      }

      if (pageLabel) {
        console.log("pageLabel is: " + pageLabel);

        let parts = pageLabel.split(" ");
        let pageNumber = parts[parts.length - 1];
        response.pageNumber = pageNumber;

        const isPageNumberDecimal = /^\d+$/.test(pageNumber);
        let decimalPageNumber = pageNumber;
        if (!isPageNumberDecimal) {
          decimalPageNumber = romanToInt(pageNumber);
        }
        response.decimalPageNumber = decimalPageNumber;

        let pageElements = document.querySelectorAll("img[aria-label='Page'");
        for (let pageElement of pageElements) {
          console.log("");
          let src = pageElement.getAttribute("src");
          console.log("pageElement src is: " + src);

          // example, pageLabel = "Page 709"
          // https://books.google.com/books/content?id=Qw4SAAAAYAAJ&pg=PA709&img=1&zoom=3&hl=en&bul=1&sig=ACfU3U2LI7dyXgYSCcMbnI7PjGzP_x8-AQ&w=1025
          const pagePrefix = "&pg=";
          if (src.includes(pagePrefix)) {
            let pageIndex = src.indexOf(pagePrefix);
            if (pageIndex != -1) {
              let pageEndIndex = src.indexOf("&", pageIndex + pagePrefix.length);
              if (pageEndIndex != -1) {
                let pageString = src.substring(pageIndex + pagePrefix.length, pageEndIndex);
                let isRoman = false;
                let urlPageNumber = "";
                if (pageString.startsWith("PR")) {
                  isRoman = true;
                  urlPageNumber = pageString.substring(2);
                } else if (pageString.startsWith("PA")) {
                  urlPageNumber = pageString.substring(2);
                }

                if (urlPageNumber) {
                  let thisIsThePage = false;
                  if (isRoman && !isPageNumberDecimal) {
                    if (decimalPageNumber == urlPageNumber) {
                      thisIsThePage = true;
                    }
                  } else if (!isRoman && isPageNumberDecimal) {
                    if (decimalPageNumber == urlPageNumber) {
                      thisIsThePage = true;
                    }
                  }

                  if (thisIsThePage) {
                    response.pageLink = src;
                    response.urlPageNumber = pageString;
                  }
                }
              }
            }
          }
        }
      }

      console.log("response is:");
      console.log(response);

      sendResponse(response);

      return { wasHandled: true, returnValue: false };
    }
  }
  return { wasHandled: false };
}

siteContentInit(`gbooks`, `site/gbooks/core/gbooks_extract_data.mjs`, undefined, additionalMessageHandler);
