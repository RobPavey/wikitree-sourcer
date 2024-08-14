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

  const clippingTitleH1 = document.querySelector("div.clippingViewContainer > div.title h1");
  if (clippingTitleH1) {
    result.clippingTitle = clippingTitleH1.textContent.trim();
  }

  const clippingViewDiv = document.querySelector("div.clippingView");
  if (!clippingViewDiv) {
    return result;
  }

  const clippingViewRightDiv = clippingViewDiv.querySelector("div.clippingViewRight");
  if (!clippingViewRightDiv) {
    return result;
  }

  // There are multiple sections: "Newspaper details", Full Page, Clipped by, Other pubs
  const rightViewSectionDivs = clippingViewRightDiv.querySelectorAll("div.right-sb-section ");
  for (let rightViewSectionDiv of rightViewSectionDivs) {
    let h5 = rightViewSectionDiv.querySelector("h5");
    if (h5) {
      let headingText = h5.textContent.trim();

      if (headingText == "Newspaper Details") {
        let paras = rightViewSectionDiv.querySelectorAll("p");
        if (paras.length == 4) {
          let paperNamePara = paras[0];
          let placePara = paras[1];
          let datePara = paras[2];
          let pagePara = paras[3];

          result.newspaperTitle = paperNamePara.textContent.trim();
          result.newspaperPlace = placePara.textContent.trim();
          result.issueDate = datePara.textContent.trim();
          result.page = pagePara.textContent.trim();
        }
      }
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
