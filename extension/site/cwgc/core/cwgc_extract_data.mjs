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

function extractRankAndName(result, el) {
  let rankAndName = cleanText(el.textContent);
  const rankSpan = el.querySelector("span");
  if (rankSpan) {
    result.rank = cleanText(rankSpan.textContent);
    result.fullName = rankAndName.slice(result.rank.length + 1);
  } else {
    result.fullName = rankAndName;
  }
}

function extractServiceNumber(result, el) {
  const serviceNumDiv = el.querySelector("div.service-num");
  if (serviceNumDiv) {
    const serviceNumberText = cleanText(serviceNumDiv.textContent);
    result.serviceNumber = serviceNumberText.slice(16);
  }
}

function extractUnit(result, unitNode) {
  if (unitNode) {
    const params = unitNode.querySelectorAll("p");
    let unitTexts = [];
    if (params) {
      // So in order of Unit, Regiment
      for (var i = params.length - 1; i > -1; i -= 1) {
        unitTexts.push(cleanText(params[i].textContent));
      }
      result.unit = unitTexts.join(", ");
    }
  }
}

function extractPlot(result, plotNode) {
  if (plotNode) {
    const params = plotNode.querySelectorAll("p");
    if (params.length === 3) {
      let plot = cleanText(params[1].textContent);
      if (plot.endsWith(".")) {
        plot = plot.slice(0, -1);
      }
      result.plot = plot;
    }
  }
}

function extractDeath(result, deathNode) {
  if (deathNode) {
    const params = deathNode.querySelectorAll("p");
    if (params) {
      for (var i = 0; i < params.length; i += 1) {
        let text = cleanText(params[i].textContent);
        let deathDate = "";
        if (text.startsWith("Died ")) {
          deathDate = text.slice(5);
          if (deathDate.startsWith("0")) {
            deathDate = deathDate.slice(1);
          }
          result.deathDate = deathDate;
        }
        if (text.startsWith("Age ")) {
          result.ageAtDeath = /^(?:Age )(\d+)(?: years old)$/.exec(text)[1];
        }
      }
    }
  }
}

function extractCemetery(result, memorialNode) {
  if (memorialNode) {
    const cemeteryNameElement = memorialNode.parentNode.querySelector("div.title.h3");
    if (cemeteryNameElement) {
      result.cemeteryName = cleanText(cemeteryNameElement.textContent);
    }
    const cemeteryLocation = memorialNode.parentNode.querySelector("div.location");
    if (cemeteryLocation) {
      let location = cleanText(cemeteryLocation.textContent);
      let locationTownSpan = cemeteryLocation.querySelector("span");
      if (locationTownSpan) {
        const locationTown = cleanText(locationTownSpan.textContent);
        location = locationTown + ", " + location.substring(locationTown.length + 1);
      }
      result.cemeteryAddress = location;
    }
  }
}

function extractCountryAndAddionalInfo(result, detailsNode) {
  if (detailsNode) {
    const detailsLis = detailsNode.querySelectorAll("li");
    for (var i = 0; i < detailsLis.length; i += 1) {
      let detailsText = cleanText(detailsLis[i].textContent);
      if (detailsText.startsWith("Country of Service ")) {
        result.serviceCountry = detailsText.slice(19);
      }
      if (detailsText.startsWith("Additional Info ")) {
        result.info = detailsText.slice(16);
      }
    }
  }
}

function hasImage(result, document) {
  const imageNode = document.querySelector("figure[itemprop='associatedMedia']");
  if (imageNode) {
    result.hasImage = true;
  }
}

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  const casualtyDetailsDiv = document.querySelector("div.casualty-details");
  if (!casualtyDetailsDiv) {
    return result;
  }

  const personalDiv = casualtyDetailsDiv.querySelector("div.personal");
  if (!personalDiv) {
    return result;
  }

  const rankAndNameH1 = personalDiv.querySelector("h1");
  if (!rankAndNameH1) {
    return result;
  }

  extractRankAndName(result, rankAndNameH1);
  extractServiceNumber(result, personalDiv);

  const detailBlocks = personalDiv.querySelectorAll("div.detail-block");
  for (let i = 0; i < detailBlocks.length; i += 1) {
    let titleDiv = detailBlocks[i].querySelector("div.title");
    if (titleDiv && titleDiv.textContent) {
      switch (cleanText(titleDiv.textContent)) {
        case "Regiment & Unit/Ship":
          extractUnit(result, detailBlocks[i]);
          break;
        case "Date of Death":
          extractDeath(result, detailBlocks[i]);
          break;
        case "Buried or commemorated at":
          extractPlot(result, detailBlocks[i]);
          break;
      }
    }
  }

  extractCemetery(result, document.querySelector("h2.blue"));
  extractCountryAndAddionalInfo(result, casualtyDetailsDiv.querySelector("ul.details-list"));
  hasImage(result, document);

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
