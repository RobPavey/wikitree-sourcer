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

function cleanText(inputText) {
  let text = inputText;
  if (text) {
    text = text.trim();
    text = text.replace(/\s+/g, " ");
    text = text.replace(/\s([,;.])/g, "$1");
  }
  return text;
}

function extractFromNeededNodes(result, publisherNode, locationNode, dateNode, pageNode, titleNode) {
  if (publisherNode && locationNode && dateNode && pageNode) {
    result.newspaperTitle = publisherNode.textContent;
    result.location = locationNode.textContent;
    result.publicationDate = dateNode.textContent;

    let pageString = pageNode.textContent;
    pageString = pageString.replace(/^page\s*/i, ""); // remove "Page " from start
    result.pageNumber = pageString;

    let date = dateNode.getAttribute("datetime");
    if (date) {
      result.eventDate = date;
    } else {
      result.eventDate = result.publicationDate;
    }

    if (result.location && result.location.indexOf("•") != -1) {
      let index = result.location.indexOf("•");
      result.location = result.location.substring(0, index).trim();
    }

    if (titleNode) {
      let title = titleNode.textContent.trim();
      if (title) {
        result.articleTitle = title;
      }
    }

    result.success = true;
  }
}

function extractData(document, url) {
  var result = {};
  result.url = url;

  result.success = false;

  let titleElement = document.querySelector("[itemprop='name']");
  let locationElement = document.querySelector("[itemprop='locationCreated']");
  let dateElement = document.querySelector("[itemprop='dateCreated']");
  let pageNumberElement = document.querySelector("[itemprop='position']");

  if (titleElement && locationElement && dateElement && pageNumberElement) {
    // This is the old format page. It changed around the end of March 2023
    result.newspaperTitle = titleElement.innerHTML;
    result.location = locationElement.innerHTML;
    result.publicationDate = dateElement.innerHTML.split(",")[0];
    result.pageNumber = pageNumberElement.innerHTML.split(" ")[1];

    result.eventDate = result.publicationDate;

    result.success = true;
  } else {
    // could be new format page
    let mainContentNode = document.querySelector("#mainContent");
    if (mainContentNode) {
      let aNode = mainContentNode.querySelector("div > div.hideMobile > a[href^='https://www.newspapers.com/paper/']");
      if (!aNode) {
        // Oct 2023: seems to have changed to have a relative URL here
        aNode = mainContentNode.querySelector("div > div.hideMobile > a[href^='/paper/']");
      }
      if (aNode) {
        let publisherNode = aNode.querySelector("h2");
        let locationNode = aNode.querySelector("p");
        let dateNode = aNode.querySelector("time");
        let pageNode = aNode.querySelector("span");
        let titleNode = mainContentNode.querySelector("h1");
        extractFromNeededNodes(result, publisherNode, locationNode, dateNode, pageNode, titleNode);
      }

      // format changed in December 2025
      if (!result.success) {
        // #mainContent > div > div.page_Container__q8aOX > div > div.d-flex.flex-column.flex-md-row.justify-content-md-between.gap-3.p-3.pt-4.position-relative.overflow-hidden.ClippingFooter_Container__4KTsX > span > span:nth-child(1)

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

                result.newspaperTitle = listItems[3].textContent.trim();

                let country = listItems[0].textContent.trim();
                let state = listItems[1].textContent.trim();
                let town = listItems[2].textContent.trim();
                if (country && state && town) {
                  result.location = town + ", " + state + ", " + country;
                }

                let pageString = listItems[7].textContent.trim();
                if (pageString) {
                  pageString = pageString.replace(/^page\s*/i, ""); // remove "Page " from start
                  result.pageNumber = pageString;
                }

                let articleTitleFromBreadCrumbs = listItems[8].textContent.trim();
                if (!articleTitleFromBreadCrumbs.startsWith("Article clipped from")) {
                  result.articleTitle = articleTitleFromBreadCrumbs;
                }

                result.success = true;
              }
            }
          }
        }

        if (!result.articleTitle) {
          let headingNode = mainContentNode.querySelector("h1[data-cy='articleTitle']");
          if (headingNode) {
            let title = headingNode.textContent.trim();
            if (title && !title.startsWith("Article clipped from")) {
              result.articleTitle = title;
            }
          }
        }
      }

      // backup code in case layout changes again, this uses class names, which didn't used to
      // exist when this was first written
      if (!result.success) {
        aNode = mainContentNode.querySelector("a[class*='PublicationInfo_Container']");

        if (aNode) {
          let publisherNode = aNode.querySelector("[class*='PublicationInfo_Publisher']");
          let locationNode = aNode.querySelector("[class*='PublicationInfo_Location']");
          let dateNode = aNode.querySelector("time");
          let pageNode = aNode.querySelector("[class*='PublicationInfo_Page']");
          let titleNode = mainContentNode.querySelector("h1");

          extractFromNeededNodes(result, publisherNode, locationNode, dateNode, pageNode, titleNode);
        }
      }

      // Still failing, if the URL looks like a clipping set success to true and the build citation can at
      // least create the template
      if (!result.success) {
        // Can be of various forms:
        // https://www.newspapers.com/article/116219279/tom-turners-sons-visit/
        // https://www.newspapers.com/article/daily-gazette/121899396/
        // https://www.newspapers.com/article/111420722/

        let regex1 = /^.*newspapers\.com\/article\/.*$/;
        if (regex1.test(url)) {
          result.success = true;
        }
      }
    }
  }

  //console.log(result);

  return result;
}

export { extractData };
