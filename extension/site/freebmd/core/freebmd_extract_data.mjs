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

function extractData2025(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  // get the line with the person's name on it
  const heading = document.querySelector("main h1");
  if (!heading) {
    return result;
  }

  // heading should be of the form
  //  Henry Alfred PAVEY's record
  //  MARY GREENFIELD's record
  let headingText = heading.textContent.trim();
  if (!headingText) {
    return result;
  }

  const headingRegEx = /^(.+)\'s\s+(?:\w+\s)?record$/;
  if (!headingRegEx.test(headingText)) {
    return result;
  }

  const nameText = headingText.replace(headingRegEx, "$1");
  result.name = nameText;

  const citationSection = document.querySelector("#citation_section");
  if (citationSection) {
    const inlineCitationSection = document.querySelector("#wikitree_inline_citation_container");
    if (inlineCitationSection) {
      let citationPara = inlineCitationSection.querySelector("p.citation_container");
      if (citationPara) {
        result.inlineCitationText = citationPara.textContent.trim();
      }
    }
  }

  const entries = document.querySelectorAll("table.table--data > tbody > tr");
  if (entries.length < 1) {
    return result;
  }

  result.recordData = {};

  for (let entry of entries) {
    let th = entry.querySelector("th");
    let td = entry.querySelector("td");
    if (th && td) {
      let label = th.textContent.trim();
      let value = {};
      let link = td.querySelector("a");
      let divs = td.querySelectorAll("div");
      if (!link && divs.length == 0) {
        // simple text value
        value.text = td.textContent.trim();
      } else if (link && divs.length == 0) {
        value.text = link.textContent.trim();
        value.href = link.getAttribute("href");
        value.linkId = link.id;
      } else {
        if (label == "Page") {
          // there should be three links if there are previous and next pages
          let link = undefined;
          let links = td.querySelectorAll("div > div > a");
          if (links.length == 3) {
            link = links[1];
          } else if (links.length == 2) {
            // there could be either a previous or next
            let link0Text = links[0].textContent.trim();
            if (link0Text.startsWith("Prev")) {
              link = links[1];
            } else {
              link = links[0];
            }
          } else if (links.length == 1) {
            link = links[0];
          }
          if (link) {
            value.text = link.textContent.trim();
            value.href = link.getAttribute("href");
          }
        }
      }

      result.recordData[label] = value;
    }
  }

  let metas = document.querySelectorAll("meta[name^='freebmd.']");
  if (metas.length) {
    result.metadata = {};
    for (let meta of metas) {
      let name = meta.getAttribute("name");
      let content = meta.getAttribute("content");
      result.metadata[name] = content;
    }
  }

  result.success = true;

  //console.log(result);

  result.format = "v2025";

  return result;
}

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

  // if something like ORA is installed and enabled there could be multiple tables
  // to be sure we use the right one we start off searching for the entry rows since they are
  // the only thing with a good class name to search on

  const entries = document.querySelectorAll("table > tbody > tr[class^=entrybmd_]");
  //console.log("entriesQuery size is: " + entriesQuery.length);
  if (entries.length < 1) {
    return extractData2025(document, url);
  }

  let firstEntry = entries[0];

  // Find the centered row that looks like "Deaths Mar 1914"
  const bmdTypeHeading = document.querySelector("table > tbody > tr > th[align=center]");
  if (bmdTypeHeading) {
    let bmdText = bmdTypeHeading.textContent.trim();
    //console.log("bmdText is: " + bmdText);

    const birthsStr = "Births";
    const marriagesStr = "Marriages";
    const deathsStr = "Deaths";
    if (bmdText.startsWith(birthsStr)) {
      result.eventType = "birth";
      bmdText = bmdText.substring(birthsStr.length);
    } else if (bmdText.startsWith(marriagesStr)) {
      result.eventType = "marriage";
      bmdText = bmdText.substring(marriagesStr.length);
    } else if (bmdText.startsWith(deathsStr)) {
      result.eventType = "death";
      bmdText = bmdText.substring(deathsStr.length);
    } else {
      return result;
    }

    bmdText = bmdText.trim();
    let quarter = undefined;
    let spaceIndex = bmdText.indexOf(" ");
    if (spaceIndex != -1) {
      quarter = bmdText.substring(0, spaceIndex).trim();
      bmdText = bmdText.substring(spaceIndex + 1).trim();
    }
    if (quarter) {
      result.eventQuarter = quarter; // deaths after 1984 have no quarter
    }
    result.eventYear = bmdText;
  } else {
    // it could be modified by ORA
    const oraTable = document.querySelector("table.ora-generic-table");
    if (!oraTable) {
      return false;
    }
  }

  // We want the first row in the tbody (nth-child is 1 based)
  const headingsNodes = document.querySelectorAll("table > tbody > tr:nth-child(1) > th");
  if (headingsNodes.length < 1) {
    return result;
  }

  let dataCols = firstEntry.querySelectorAll("td");
  //console.log("dataCols size is: " + dataCols.length);

  if (dataCols.length < 1 || dataCols.length < headingsNodes.length) {
    return result;
  }

  for (let colIndex = 0; colIndex < headingsNodes.length; colIndex++) {
    let heading = headingsNodes[colIndex].textContent.trim().toLowerCase();
    let entryValue = dataCols[colIndex].textContent.trim();

    switch (heading) {
      case "surname":
        result.surname = entryValue;
        break;
      case "given name":
        result.givenNames = entryValue;
        break;
      case "age":
        result.ageAtDeath = entryValue;
        break;
      case "dob":
        result.birthDate = entryValue;
        break;
      case "spouse":
        result.spouse = entryValue;
        break;
      case "mother":
        result.mothersMaidenName = entryValue;
        break;
      case "district":
        result.registrationDistrict = entryValue;
        break;
      case "volume":
        result.referenceVolume = entryValue;
        break;
      case "page":
        result.referencePage = entryValue;
        break;
      case "stype": // For ORA only
        {
          let type = entryValue.toLowerCase();
          result.eventType = type;
        }
        break;
      case "sdate": // For ORA only
        {
          let quarterYear = entryValue.trim();
          let spaceIndex = quarterYear.indexOf(" ");
          if (spaceIndex != -1) {
            let quarter = quarterYear.substring(0, spaceIndex);
            let year = quarterYear.substring(spaceIndex).trim();
            result.eventQuarter = quarter;
            result.eventYear = year;
          }
        }
        break;
      case "transcriber":
      case "transcribers":
        break;
      default:
        console.log("Unknown heading: " + heading);
        break;
    }
  }

  // find the citation URL, it is hard to find - we rely on the fact that the td before
  // it has the textContent "URL"
  const allTableDataCells = document.querySelectorAll("table > tbody > tr > td");
  for (let cellIndex = 0; cellIndex < allTableDataCells.length; cellIndex++) {
    let cell = allTableDataCells[cellIndex];
    if (cell.textContent == "URL" && cellIndex < allTableDataCells.length - 1) {
      const urlNode = cell.nextElementSibling;
      if (urlNode) {
        const url = urlNode.textContent.trim();
        result.citationUrl = url;
        result.success = true;
        break;
      }
    }
  }

  //console.log(result);

  return result;
}

export { extractData };
