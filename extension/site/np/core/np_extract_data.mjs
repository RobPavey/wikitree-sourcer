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
    }
  }

  //console.log(result);

  return result;
}

export { extractData };
