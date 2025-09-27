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

function cleanText(text) {
  if (!text) {
    return "";
  }

  text = text.replace(/\s+/g, " "); // eliminate nbsp and multiple spaces etc

  // sometimes the text is something like "Zachariah Davey[Zechariah Pavey]"
  // in that case add a space before the [
  text = text.replace(/([^\s])\[/, "$1 [");

  text = text.trim();

  return text;
}

function cleanLabel(text) {
  if (!text) {
    return "";
  }

  text = text.replace(/\s+/g, " "); // eliminate nbsp etc
  text = text.trim();

  // remove trailing :
  text = text.replace(/\s*\:+$/, "");

  return text;
}

function cleanPlaceName(text) {
  let result = text;
  if (result) {
    result = result.trim();
    // replace multiple spaces with one space
    result = result.replace(/\s+/g, " ");
  }

  return result;
}

function getAbsoluteLinkUrl(linkNode, document, result) {
  if (!linkNode || !document || !result) {
    return "";
  }

  // We used .getAttribute("href") rather than .href because sometimes the link node
  // is in a document that we fetched and .href could give a URL starting with something like
  // chrome-extension://
  let url = linkNode.getAttribute("href");

  if (!url) {
    return url;
  }

  //console.log("getAbsoluteLinkUrl, url = " + url);
  //console.log("getAbsoluteLinkUrl, result is");
  //console.log(result);

  if (url.startsWith("http")) {
    return url;
  }

  // These two should never happen. There was a brief time (in version 2.6.6) when it could
  // leave these here for one release in case of things in the fetch cache
  const extensionUrlMatch = /^extension\:\/\/[^\/]+/;
  if (extensionUrlMatch.test(url)) {
    url = url.replace(extensionUrlMatch, "");
  }
  const chromeExtensionUrlMatch = /^chrome-extension\:\/\/[^\/]+/;
  if (chromeExtensionUrlMatch.test(url)) {
    url = url.replace(chromeExtensionUrlMatch, "");
  }

  let documentUrl = result.url;
  if (!document.URL) {
    document.URL = document.URL;
  }

  // around 10 October 2024 Ancestry started having relative URLs like
  // href="/discoveryui-content/view/7707468:2101"
  // That broke things. This fixes it.
  if (url.startsWith("/")) {
    if (result.domain) {
      let site = "https://www." + result.domain;
      let newUrl = site + url;
      //console.log("getAbsoluteLinkUrl, newUrl = " + newUrl);
      return newUrl;
    } else {
      if (documentUrl) {
        let site = documentUrl.replace(/^(https?:\/\/[^\/]+)\/.*$/, "$1");
        if (site && site != documentUrl) {
          // replace search.ancestry with www.ancestry
          site = site.replace("//search.ancestry", "//www.ancestry");
          let newUrl = site + url;
          //console.log("getAbsoluteLinkUrl, newUrl = " + newUrl);
          return newUrl;
        }
      }
    }
  } else {
    // should never get here. Only happens if this is a relative URL that doesn't start with /
    //console.log("getAbsoluteLinkUrl, relative URL not starting with /");
    if (URL.canParse(url, documentUrl)) {
      const urlObject = new URL(url, documentUrl);
      return urlObject.href;
    }
  }

  //console.log("getAbsoluteLinkUrl, could not fix url: " + url);

  return url;
}

function setSourceCitation(result, sourceTextNode) {
  let sourceText = cleanText(sourceTextNode.textContent);
  result.sourceCitation = sourceText;
}

function setSourceCitationDescription(result, sourceTextNode) {
  let sourceText = cleanText(sourceTextNode.textContent);
  result.sourceCitationDescription = sourceText;
}

function setSourceInformation(result, sourceTextNode) {
  let sourceText = cleanText(sourceTextNode.textContent);
  result.sourceInformation = sourceText;

  let originalData = "";

  const origDataStr = "Original data:";
  // first see if there are child paragraphs
  let paragraphNodes = sourceTextNode.querySelectorAll("p");
  if (paragraphNodes.length > 1) {
    for (let para of paragraphNodes) {
      let paraText = cleanText(para.textContent);
      if (paraText.startsWith(origDataStr)) {
        originalData = paraText.substring(origDataStr.length).trim();
        break;
      }
    }
  } else {
    if (sourceText.startsWith(origDataStr)) {
      originalData = sourceText.substring(origDataStr.length).trim();
    }
  }

  if (originalData) {
    result.originalData = cleanText(originalData);
  }
}

function setSourceDescription(result, sourceTextNode) {
  let sourceText = cleanText(sourceTextNode.textContent);
  result.sourceDescription = sourceText;
}

function extractDbAndRecordId(result, url) {
  //console.log("location href is");
  //console.log(url);

  if (!url) {
    return;
  }

  let dbId = "";
  let recordId = "";
  const dbIdStr = "dbid="; // could have & or ? before dbid
  const dbStr = "db="; // On some records (like Birth Registrations) it is db rather than dbid

  const discoveryRegex = /.*\/discoveryui-content\/view\/([^:]+)(?:\:|%3A)(\d+).*/i;
  const searchCollectionsRegex = /^.*\/collections\/([^\/]+)\/records\/([^\/\?]+).*$/i;
  const viewRecordsRecordCollectionRegex =
    /^.*\/discoveryui-content\/view\/records\?.*recordId=([^&]+).*&collectionId=([^&]+).*$/i;
  const viewRecordsCollectionRecordRegex =
    /^.*\/discoveryui-content\/view\/records\?.*collectionId=([^&]+).*&recordId=([^&]+).*$/i;

  if (url.includes(dbIdStr) || url.includes(dbStr)) {
    var dbIdOrDbStr = url.includes(dbIdStr) ? dbIdStr : dbStr;
    let dbIdIndex = url.indexOf(dbIdOrDbStr);
    dbIdIndex += dbIdOrDbStr.length;
    let dbEndIndex = url.indexOf("&", dbIdIndex);
    if (dbEndIndex != -1) {
      dbId = url.substring(dbIdIndex, dbEndIndex);
      const recStr = "&h=";
      let recIndex = url.indexOf(recStr, dbEndIndex);
      if (recIndex != -1) {
        recIndex += recStr.length;
        let ampIndex = url.indexOf("&", recIndex);
        if (ampIndex != -1) {
          recordId = url.substring(recIndex, ampIndex);
        } else {
          recordId = url.substring(recIndex);
        }
      }
    }
  } else if (discoveryRegex.test(url)) {
    let rec = url.replace(discoveryRegex, "$1");
    let db = url.replace(discoveryRegex, "$2");
    if (db != "" && db != url && rec != "" && rec != url) {
      dbId = db;
      recordId = rec;
    }
  } else if (searchCollectionsRegex.test(url)) {
    let db = url.replace(searchCollectionsRegex, "$1");
    let rec = url.replace(searchCollectionsRegex, "$2");
    if (db != "" && db != url && rec != "" && rec != url) {
      dbId = db;
      recordId = rec;
    }
  } else if (viewRecordsRecordCollectionRegex.test(url)) {
    let db = url.replace(viewRecordsRecordCollectionRegex, "$2");
    let rec = url.replace(viewRecordsRecordCollectionRegex, "$1");
    if (db != "" && db != url && rec != "" && rec != url) {
      dbId = db;
      recordId = rec;
    }
  } else if (viewRecordsCollectionRecordRegex.test(url)) {
    let db = url.replace(viewRecordsCollectionRecordRegex, "$1");
    let rec = url.replace(viewRecordsCollectionRecordRegex, "$2");
    if (db != "" && db != url && rec != "" && rec != url) {
      dbId = db;
      recordId = rec;
    }
  }

  //console.log("dbId = " + dbId + ", recordId = " + recordId);

  if (dbId && recordId) {
    result.dbId = dbId;
    result.recordId = recordId;
    // Note this is overidden in buildCitation using use options
    result.ancestryTemplate = "{{Ancestry Record|" + result.dbId + "|" + result.recordId + "}}";
  }

  let domainRegex = /.*\.(ancestry[^\/]+)\/.*/;
  let domain = url.replace(domainRegex, "$1");
  result.domain = domain;
}

function extractRecordPageTitle(document, result) {
  let titleName = "";
  let titleCollection = "";

  let pageTitle = document.querySelector("h1.pageTitle > span");
  if (pageTitle) {
    // This is the normal case when there is a name and a title/link
    titleName = pageTitle.textContent;
    let pageIntro = document.querySelector("h1.pageTitle > p.pageIntro > a");
    titleCollection = pageIntro.textContent;
  } else {
    let pageTitleLink = document.querySelector("h1.pageTitle > a");

    if (pageTitleLink) {
      titleCollection = pageTitleLink.textContent;
    } else {
      // this is a case that only seems to happen when fetching the page rather than opening it
      // in a tab.
      // There is a script that generates the span node we try to read above.
      // In the old style the script is the next sibling to the pageTitleNode but starting on
      // 25 Apr 2023 there is a template = so use that iff possible
      let pageTitleTemplate = document.querySelector("#pageTitleTemplate");
      if (pageTitleTemplate) {
        //console.log("pageTitleTemplate found, numChildren = " + pageTitleTemplate.children.length);
        //console.log(pageTitleTemplate);
        // It looks like this:
        // 		<template id="pageTitleTemplate">
        // 			<span id="pageNameTemplate">William H Pavey</span>
        // 			<span id="collectionLearnMoreTemplate">Learn more about the 1871 England Census</span>
        // 			<span id="collectionTitleTemplate">1871 England Census</span>
        // 		</template>
        let nameNode = pageTitleTemplate.content.querySelector("#pageNameTemplate");
        if (nameNode) {
          //console.log("nameNode found, textContent = " + nameNode.textContent);
          titleName = nameNode.textContent;
        }
        let collectionNode = pageTitleTemplate.content.querySelector("#collectionTitleTemplate");
        if (collectionNode) {
          //console.log("collectionNode found, textContent = " + collectionNode.textContent);
          titleCollection = collectionNode.textContent;
        }
      } else {
        let pageTitleNode = document.querySelector("h1.pageTitle");
        if (pageTitleNode) {
          //console.log("pageTitle found, numChildren = " + pageTitleNode.children.length);
          let nextNode = pageTitleNode.nextElementSibling;
          if (nextNode && nextNode.tagName.toLowerCase() == "script") {
            let scriptNode = nextNode;
            // we could evaluate the script but that might has security risks.
            // since we know what the script looks like we could just search it for the string we want.
            let scriptText = scriptNode.textContent;
            //console.log("scriptText = ");
            //console.log(scriptText);
            const titleNamePrefix = 'nameSpanEl.textContent = "';
            let startIndex = scriptText.indexOf(titleNamePrefix);
            if (startIndex != -1) {
              startIndex += titleNamePrefix.length;
              let endIndex = scriptText.indexOf('"', startIndex);
              if (endIndex != -1) {
                titleName = scriptText.substring(startIndex, endIndex);
              }
            }
            const titleCollectionPrefix = 'collectionAnchorEl.textContent = "';
            startIndex = scriptText.indexOf(titleCollectionPrefix);
            if (startIndex != -1) {
              startIndex += titleCollectionPrefix.length;
              let endIndex = scriptText.indexOf('"', startIndex);
              if (endIndex != -1) {
                titleCollection = scriptText.substring(startIndex, endIndex);
              }
            }
            //console.log("titleName = " + titleName);
            //console.log("titleCollection = " + titleCollection);
          }
        }
      }
    }
  }

  result.titleName = titleName;
  result.titleCollection = titleCollection;
}

function extractRecordData(document, result) {
  result.recordData = Object.create(null);

  var recordDataRows = document.querySelectorAll("#recordData > table > tbody > tr");

  for (let row of recordDataRows.values()) {
    // Get the label of the row (must be immediate child)
    let labelNode = row.querySelector(":scope > th");
    let label = labelNode ? labelNode.textContent : "";
    if (label != "") {
      label = cleanLabel(label);
      let rowData = row.querySelector("td");
      let numChildren = rowData.children.length;

      if (numChildren == 0) {
        let value = rowData.textContent;
        value = value.replace(/\s+/g, " ").trim();

        // clean up height field
        if (label == "Height") {
          // example: https://www.ancestry.com/search/collections/2238/records/303556213
          // has height of: 5''8 1/2 "
          // which should be: 5' 8 1/2"
          if (value.includes("''") && value.includes('"')) {
            value = value.replace(/''/g, "'");
            value = value.replace(/ "/g, '"');
          }
        }

        if (!value.startsWith("Search for")) {
          //console.log(label + " " + value);
          result.recordData[label] = value;
        }
      } else {
        // there are children. There are several cases to handle here
        if (rowData.classList.contains("p_embedTableTd")) {
          // Sub-tables are used for Household Members in census and Records on page in Marriage Reg
          // If possible put each of the rows of the sub-table in the recordData with line breaks
          if (label.includes("Household")) {
            result.household = {};
            let headings = row.querySelectorAll("td.p_embedTableTd th.p_embedTableHead");
            if (headings.length > 0) {
              result.household.headings = [];
              result.household.members = [];
              for (let heading of headings) {
                result.household.headings.push(cleanText(heading.textContent));
              }
            }
          }

          let subTableRows = row.querySelectorAll("td.p_embedTableTd tr.p_embedTableRow");
          let value = "";
          for (let subRow of subTableRows) {
            if (value) {
              value += "<br/>";
            }
            value += cleanText(subRow.textContent);

            if (result.household !== undefined && result.household.members !== undefined) {
              let member = {};
              let subRowCells = subRow.querySelectorAll("td");
              if (subRowCells.length > 0) {
                for (let cellIndex = 0; cellIndex < subRowCells.length; cellIndex++) {
                  let cell = subRowCells[cellIndex];
                  let memberText = cleanText(cell.textContent);
                  let heading = result.household.headings[cellIndex];
                  member[heading] = memberText;
                  let linkNode = cell.querySelector("a");
                  if (linkNode) {
                    let link = getAbsoluteLinkUrl(linkNode, document, result);
                    let extractResult = {};
                    extractDbAndRecordId(extractResult, link);
                    member.dbId = extractResult.dbId;
                    member.recordId = extractResult.recordId;
                    member.link = link; // used to fetch additional records if needed
                  }
                }
              }

              result.household.members.push(member);
            }
          }
          if (value) {
            result.recordData[label] = value;
          }
        } else {
          // for now just get the text of all the children.
          // there can be multiple children for "Name:" in death reg
          // It can also happen for "Inferred Spouse:" in 1939 reg.
          // We used to have code to handle more than one child and one child
          // differently but now we threat then the same
          // An example where this does not work is:
          // https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=61311&h=2913
          let value = rowData.textContent;
          value = cleanText(value);
          if (value) {
            if (!value.startsWith("Search for") && !value.startsWith("View ")) {
              // extra test - sometime the text includes a script. We definitely don't want to include that
              let scriptNode = rowData.querySelector("script");
              if (!scriptNode) {
                // If this is a link we also store the link - this is case we need to read that
                // additional record (e.g. for a child baptism)
                let linkNode = rowData.querySelector("a");
                if (linkNode) {
                  // there are some links that are for viewing maps or ordering copies
                  // It seems that these links have 'class="link"' so if that is there ignore
                  // this row
                  if (linkNode.className != "link") {
                    result.recordData[label] = value;

                    let linkText = linkNode.textContent;
                    // ignore links for alternate names
                    if (!linkText || !linkText.startsWith("[")) {
                      let link = getAbsoluteLinkUrl(linkNode, document, result);
                      if (!result.linkData) {
                        result.linkData = {};
                      }
                      result.linkData[label] = link;
                    }
                  }
                } else {
                  // no link just use all child text
                  result.recordData[label] = value;
                }
              }
            }
          }
        }
      }
    } else {
      // this row doesn't have a <th> label. Could be something like "Household members"
      if (row.classList.contains(`tableContainerRow`)) {
        let table = row.querySelector("table");

        // collect all the headings and put them in a string with line breaks between them
        let headings = table.querySelectorAll(":scope thead tr th");
        let label = "";
        for (let heading of headings) {
          if (label) {
            label += "<br/>";
          }
          label += cleanText(heading.textContent);
        }

        // now get each row of data and put them all in one string with line breaks between rows
        let subTableRows = table.querySelectorAll(":scope tbody tr");
        let value = "";
        for (let subRow of subTableRows) {
          if (value) {
            value += "<br/>";
          }
          value += cleanText(subRow.textContent);
        }
        if (value) {
          result.recordData[label] = value;
        }

        if (label.includes("Household") || label.includes("Others Listed")) {
          result.household = {};
          if (headings.length > 0) {
            result.household.headings = [];
            result.household.members = [];
            for (let heading of headings) {
              result.household.headings.push(cleanText(heading.textContent));
            }
          }

          for (let subRow of subTableRows.values()) {
            if (result.household !== undefined && result.household.members !== undefined) {
              let member = {};
              let subRowCells = subRow.querySelectorAll("td");
              if (subRowCells.length > 0) {
                for (let cellIndex = 0; cellIndex < subRowCells.length; cellIndex++) {
                  let cell = subRowCells[cellIndex];
                  let memberText = cleanText(cell.textContent);

                  if (cellIndex == 0) {
                    // check for a closed record
                    let lcText = memberText.toLowerCase();

                    if (
                      lcText == "this record is officially closed." ||
                      (lcText.includes("record") && lcText.includes("closed"))
                    ) {
                      member.isClosed = true;
                      memberText = "Closed Record";
                    }
                  }

                  let heading = result.household.headings[cellIndex];
                  member[heading] = memberText;

                  let linkNode = cell.querySelector("a");
                  if (linkNode) {
                    let link = getAbsoluteLinkUrl(linkNode, document, result);
                    let extractResult = {};
                    extractDbAndRecordId(extractResult, link);
                    member.dbId = extractResult.dbId;
                    member.recordId = extractResult.recordId;
                    member.link = link; // used to fetch additional records if needed
                  }
                }
              }

              result.household.members.push(member);
            }
          }
        }
      }
    }
  }
}

function extractRecordSourceCitation(document, result) {
  // test is there are contentViewTabs, this allow you to select between Detail and Source
  let contentViewTabs = document.querySelector("#contentViewTabs");

  if (contentViewTabs) {
    // example electoral registers
    let sourceCitationChildren = document.querySelector("#sourceCitation").children;

    if (sourceCitationChildren.length > 0) {
      let lastCitationTitle = "";

      for (let index = 0; index < sourceCitationChildren.length; index++) {
        let div = sourceCitationChildren[index];

        let childCitationTitle = div.querySelector("h4.citationTitle");
        if (childCitationTitle) {
          let citationTitle = childCitationTitle.textContent;
          let sourceTextNode = div.querySelector("div.sourceText");
          if (sourceTextNode) {
            if (citationTitle == "Source Citation") {
              setSourceCitation(result, sourceTextNode);
            } else if (citationTitle == "Source Information") {
              setSourceInformation(result, sourceTextNode);
            } else if (citationTitle == "Description") {
              setSourceDescription(result, sourceTextNode);
            }
          }
        } else {
          if (div.classList.contains("citationTitle")) {
            lastCitationTitle = cleanText(div.textContent);
            //console.log("lastCitationTitle = " + lastCitationTitle);
          } else if (div.classList.contains("sourceText")) {
            if (lastCitationTitle == "Source Information") {
              setSourceInformation(result, div);
            } else if (lastCitationTitle == "Description") {
              setSourceDescription(result, div);
            }
          }
        }
      }
    }
  } else {
    let sourceAreaDivs = document.querySelectorAll("#sourceCitation > div.conBody > div");

    if (sourceAreaDivs.length > 0) {
      for (let index = 0; index < sourceAreaDivs.length; index++) {
        let div = sourceAreaDivs[index];
        let citationTitleNode = div.querySelector("h4.citationTitle");
        let sourceTextNode = div.querySelector("div.sourceText");
        if (citationTitleNode && sourceTextNode) {
          let citationTitle = citationTitleNode.textContent;
          if (citationTitle == "Source Citation") {
            setSourceCitation(result, sourceTextNode);
          } else if (citationTitle == "Source Information") {
            setSourceInformation(result, sourceTextNode);
          } else if (citationTitle == "Description") {
            setSourceDescription(result, sourceTextNode);
          }
        }
      }
    }
  }
}

function extractImageSourceCitation(document, result) {
  // test is there is an info panel, this is the sidebar
  let infoPanelContainer = document.querySelector("div.info-panel-container");

  if (infoPanelContainer) {
    let sourceContainer = document.querySelector("div.sourceDescription");

    if (sourceContainer) {
      let sourceCitationChildren = sourceContainer.children;

      if (sourceCitationChildren.length > 0) {
        let lastCitationTitle = "";

        for (let index = 0; index < sourceCitationChildren.length; index++) {
          let child = sourceCitationChildren[index];

          //console.log("child is:");
          //console.log(child);

          if (child.tagName == "H6") {
            lastCitationTitle = cleanText(child.textContent);
            //console.log("lastCitationTitle = " + lastCitationTitle);
          } else if (child.tagName == "P") {
            if (lastCitationTitle == "Source Citation") {
              setSourceCitation(result, child);
            } else if (lastCitationTitle == "Description") {
              setSourceCitationDescription(result, child);
            } else if (lastCitationTitle == "Source Information") {
              setSourceInformation(result, child);
            } else if (lastCitationTitle == "Source Description") {
              setSourceDescription(result, child);
            }
          }
        }
      }
    }
  }
}

function extractImageThumb(document, result) {
  // Note (4 Sep 2021): Ancestry changed the web page to put an extra 2 div between
  // imageThumb and the "a"
  let thumbNode = document.querySelector("#thumbnailTools > div.imageThumb");
  //console.log("extractImageThumb, thumbNode = ");
  //console.log(thumbNode);

  if (thumbNode) {
    let linkNode = thumbNode.querySelector("a");
    //console.log("extractImageThumb, linkNode = ");
    //console.log(linkNode);

    if (linkNode) {
      let url = getAbsoluteLinkUrl(linkNode, document, result);

      //console.log("extractImageThumb, url = " + url);

      if (url) {
        // Example:
        // "https://www.ancestry.com/imageviewer/collections/7814/images/LNDRG13_157_158-0095?pid=2229789&amp;backurl=https://search.ancestry.com/cgi-bin/sse.dll?dbid%3D7814%26h%3D2229789%26indiv%3Dtry%26o_vc%3DRecord:OtherRecord%26rhSource%3D8753&amp;treeid=&amp;personid=&amp;hintid=&amp;usePUB=true&amp;usePUBJs=true"

        let dbId = url.replace(/.*imageviewer\/collections\/([^\/]+)\/images\/.*/, "$1");
        let recordId = url.replace(/.*\/images\/([^?]+).*/, "$1");

        result.imageUrl = url;
        if (dbId && dbId != url) {
          result.imageDbId = dbId;
        }
        if (recordId && recordId != url) {
          result.imageRecordId = recordId;
        }
      }
    } else {
      // Sometimes in some browsers the linkNode is not there. This happens more when ther user is on the
      // factEdit modal, especially in Firefox. It seems to be because the link node is generated by a script.
      // This is a backup that gets the image id from the "Report a problem" link.
      let reportProblemNode = document.querySelector("#thumbnailTools a.iconWarning");
      if (reportProblemNode) {
        //console.log("extractImageThumb, reportProblemNode = ");
        //console.log(reportProblemNode);

        // Report problem node looks like:
        // <a href="https://www.ancestry.com/feedback/reportissue?rp=RD&amp;pid=1903047&amp;dbid=2352&amp;imageId=rg14_00802_0395_03&amp;indexOnly=false&amp;backurl=http%3a%2f%2fsearch.ancestry.com%2fcgi-bin%2fsse.dll%3findiv%3d1%26dbid%3d2352%26h%3d1903047%26ssrc%3dpt%26tid%3d86808578%26pid%3d46552199708%26usePUB%3dtrue%26_gl%3d1*vivebz*_ga*MTA5NTMwNjUwOS4xNTg3ODQ4ODc3*_ga_4QT8FMEX30*MTY1MTYwMzE2NS4zMi4xLjE2NTE2MDYzNzkuMA.." class="link icon iconWarning"><span>Report a problem</span></a>

        let url = getAbsoluteLinkUrl(reportProblemNode, document, result);

        //console.log("extractImageThumb, reportProblemNode URL = ");
        //console.log(url);

        if (url) {
          let imageRecordId = "";
          const imagePrefix = "imageId=";
          let imageIndex = url.indexOf(imagePrefix);
          if (imageIndex != -1) {
            let endIndex = url.indexOf("&", imageIndex);
            if (endIndex != -1) {
              imageRecordId = url.substring(imageIndex + imagePrefix.length, endIndex);
              //console.log("extractImageThumb, imageRecordId = " + imageRecordId);
            }
          }

          let personId = "";
          const personPrefix = "pid=";
          let personIndex = url.indexOf(personPrefix);
          if (personIndex != -1) {
            let endIndex = url.indexOf("&", personIndex);
            if (endIndex != -1) {
              personId = url.substring(personIndex + personPrefix.length, endIndex);
              //console.log("extractImageThumb, personId = " + personId);
            }
          }

          if (result.domain && result.dbId && imageRecordId) {
            result.imageRecordId = imageRecordId;
            result.imageDbId = result.dbId;

            if (imageRecordId && personId) {
              // https://www.ancestry.com/imageviewer/collections/61596/images/tna_r39_0773_0773a_021?pid=10189262&treeid=113369578&personid=222372269795&usePUB=true&usePUBJs=true
              result.imageUrl =
                "https://www." +
                result.domain +
                "/imageviewer/collections/" +
                result.dbId +
                "/images/" +
                imageRecordId +
                "?pid=" +
                personId;
            } else if (imageRecordId) {
              result.imageUrl =
                "https://www." + result.domain + "/imageviewer/collections/" + result.dbId + "/images/" + imageRecordId;
            }
          }
        }
      }
    }
  }
}

function extractImagePageTitle(document, result) {
  let titleCollection = "";
  let titleName = "";

  let titleCollectionNode = document.querySelector("div.collectionTitle > h1 > a");
  if (titleCollectionNode) {
    titleCollection = titleCollectionNode.textContent;
  }

  let titleForNameNode = document.querySelector("div.collectionTitle > h1 > span");
  if (titleForNameNode) {
    let titleForName = titleForNameNode.textContent;
    titleForName = titleForName.replace(/^\s*for\s+/, "");
    titleName = titleForName;
  }

  result.titleCollection = titleCollection;
  result.titleName = titleName;
}

function extractImageBrowsePath(document, result) {
  var wrapperNode = document.querySelector("div.browse-path-header > div.breadcrumbWrapper");
  let browsePath = "";
  if (wrapperNode) {
    let children = wrapperNode.children;
    for (let index = 0; index < children.length; index++) {
      let child = children[index];
      if (child.classList.contains("breadcrumbItem")) {
        browsePath += child.textContent;
      } else if (child.classList.contains("iconArrowRight")) {
        browsePath += " > ";
      }
    }
  }

  if (browsePath) {
    result.imageBrowsePath = browsePath;
  }
}

function extractImageHasIndex(document, result) {
  let indexButton = document.querySelector(
    "div.image-viewer-wrapper > div.container-space > div.bottom-container > div.paging-panel.panelTopHeight > div > button.indexToggle"
  );

  if (indexButton) {
    if (indexButton.classList.contains("disabled")) {
      result.imageHasIndex = false;
    } else {
      result.imageHasIndex = true;
    }
  }
}

function extractImageIndex(document, result) {
  // During dev only do this for a certain collection (England 1881 census)
  if (result.dbId != "7572") {
    return;
  }

  let indexPanelContent = document.querySelector("div.image-viewer-wrapper div.index-panel div.index-panel-content");

  if (indexPanelContent) {
    let rows = indexPanelContent.querySelectorAll("div.grid-row");
    if (rows.length > 1) {
      let headerRow = rows[0];
      let tableHeadings = [];
      let tableRows = [];
      let headerCells = headerRow.querySelectorAll("div.grid-cell");
      for (let cell of headerCells) {
        let text = cell.textContent;
        tableHeadings.push(text);
      }

      for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
        let row = rows[rowIndex];
        let cells = row.querySelectorAll("div.grid-cell");
        if (cells.length == headerCells.length) {
          let rowData = {};
          for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
            let cell = cells[cellIndex];
            let text = cell.textContent;
            rowData[tableHeadings[cellIndex]] = text;
          }
          tableRows.push(rowData);
        }
      }

      result.indexHeadings = tableHeadings;
      result.indexRows = tableRows;
    }
  }
}

function extractImageNumberAndTotal(document, result) {
  let pageCountWrap = document.querySelector(
    "div.image-viewer-wrapper > div.container-space > div.bottom-container > div.paging-panel.panelTopHeight > div > div.imageNum.pageCountWrapInner"
  );

  if (pageCountWrap) {
    let pageNum = pageCountWrap.querySelector("input.page-input");
    if (pageNum) {
      result.imageNumber = pageNum.value;
    }

    let imageCount = pageCountWrap.querySelector("span.imageCountText");
    if (imageCount) {
      result.totalImages = imageCount.textContent;
    }
  }
}

function extractImageTemplate(result, url) {
  // https://www.ancestry.com/imageviewer/collections/7814/images/LNDRG13_157_158-0095?treeid=&personid=&hintid=&usePUB=true&usePUBJs=true&_ga=2.91252573.636488732.1621444272-1095306509.1587848877&pId=2229789

  let db = url.replace(/.*\/imageviewer\/collections\/(\w+)\/.*/, "$1");
  let rec = url.replace(/.*\/images\/([\w\d\-_.]+).*/, "$1");
  let pid = url.replace(/.*[\?\&]pId\=(\d+).*/, "$1");
  let domain = url.replace(/.*\.(ancestry[^\/]+)\/.*/, "$1");

  if (db != "" && db != url && rec != "" && rec != url) {
    result.dbId = db;
    result.recordId = rec;
    result.ancestryTemplate = "{{Ancestry Image|" + result.dbId + "|" + result.recordId + "}}";
  }

  if (pid != "" && pid != url) {
    result.pid = pid;
  }

  if (domain != "" && domain != url) {
    result.domain = domain;
  }
}

function extractTreeTemplate(result, url) {
  // e.g. "https://www.ancestry.com/family-tree/person/tree/86808578/person/260133535006/facts"
  // becomes: {{Ancestry Tree|86808578|260133535006}}
  const treePrefix = "/family-tree/person/tree/";
  const personPrefix = "/person/";
  let treePrefixIndex = url.indexOf(treePrefix);
  if (treePrefixIndex != -1) {
    let treeIndex = treePrefixIndex + treePrefix.length;
    let personPrefixIndex = url.indexOf(personPrefix, treeIndex);
    if (personPrefixIndex != -1) {
      let tree = url.substring(treeIndex, personPrefixIndex);
      let personIndex = personPrefixIndex + personPrefix.length;
      let personEndIndex = url.indexOf("/", personIndex);
      if (personEndIndex != -1) {
        let person = url.substring(personIndex, personEndIndex);
        result.ancestryTemplate = "{{Ancestry Tree|" + tree + "|" + person + "}}";
      }
    }
  }
}

function extractTreeMediaTemplate(result, url) {
  // There are various URL forms:
  // https://www.ancestry.com/family-tree/tree/86808578/media/d69a7d6a-c773-48b1-ab09-19100cd55c14
  // https://www.ancestry.com/family-tree/tree/86808578/person/46552198684/media/d69a7d6a-c773-48b1-ab09-19100cd55c14
  // https://www.ancestry.com/mediaui-viewer/tree/86808578/media/d69a7d6a-c773-48b1-ab09-19100cd55c14
  // https://www.ancestry.com/mediaui-viewer/tree/86808578/person/46552198684/media/d69a7d6a-c773-48b1-ab09-19100cd55c14?usePUBJs=true

  // becomes: {{Ancestry Tree Media|86808578|d69a7d6a-c773-48b1-ab09-19100cd55c14}}

  // Occasionally one can get to a URL like this through a redirect:
  // https://www.ancestry.com/family-tree/tree/15648882/media/c611543e32ea44fe973fc479bb82369c
  // In that case we should add the missing dashes.

  const treePrefix = "/tree/";
  const mediaPrefix = "/media/";
  let treePrefixIndex = url.indexOf(treePrefix);
  if (treePrefixIndex != -1) {
    let treeIndex = treePrefixIndex + treePrefix.length;
    let endTreeIndex = url.indexOf("/", treeIndex);
    if (endTreeIndex != -1) {
      let tree = url.substring(treeIndex, endTreeIndex);

      let mediaPrefixIndex = url.indexOf(mediaPrefix, endTreeIndex);
      if (mediaPrefixIndex != -1) {
        let mediaIndex = mediaPrefixIndex + mediaPrefix.length;
        let mediaEndIndex = url.indexOf("/", mediaIndex);
        if (mediaEndIndex == -1) {
          mediaEndIndex = url.indexOf("?", mediaIndex);
        }
        if (mediaEndIndex == -1) {
          mediaEndIndex = url.length;
        }
        if (mediaEndIndex != -1) {
          let media = url.substring(mediaIndex, mediaEndIndex);
          if (media.length == 32 && media.indexOf("-") == -1) {
            // the dashes are missing, this can cause a suggestion
            let withDashes = media.replace(/(........)(....)(....)(....)(............)/, "$1-$2-$3-$4-$5");
            if (withDashes) {
              media = withDashes;
            }
          }
          result.ancestryTemplate = "{{Ancestry Tree Media|" + tree + "|" + media + "}}";
        }
      }
    }
  }
}

function extractSharingUrlTemplate(document, result) {
  let bandidoModal = document.querySelector("#modal > #modalFixed .bandido-modal-post-share .share-url");
  if (bandidoModal) {
    let urlNode = bandidoModal.querySelector(".url-input");

    if (urlNode) {
      let url = urlNode.value;
      // https://www.ancestry.com/sharing/24274440?h=95cf5c&utm_campaign=bandido-webparts&utm_source=post-share-modal&utm_medium=copy-url
      let num1 = url.replace(/.*\/sharing\/(\w+)\?h\=\w+\&.*/, "$1");
      let num2 = url.replace(/.*\/sharing\/\w+\?h\=(\w+)\&.*/, "$1");

      result.ancestryTemplate = "{{Ancestry Sharing|" + num1 + "|" + num2 + "}}";

      result.sharingUrl = url.replace(/(^.*\/sharing\/\w+\?h\=\w+)\&.*/, "$1");
    }
  }
}

function extractSharingImageFullSizeLink(document, result) {
  //console.log("extractSharingImageFullSizeLink");

  let attachmentContainer = document.querySelector("div.main-container > div.attachment-container");
  if (attachmentContainer) {
    let zoomImg = attachmentContainer.querySelector("#zoomModal > #zoomContent > #zoomImg");

    let imageUrl = "";

    if (zoomImg) {
      imageUrl = zoomImg.getAttribute("src");
    } else {
      let img = attachmentContainer.querySelector("img.attachment-image");
      if (img) {
        imageUrl = img.getAttribute("src");
      }
    }

    //console.log("imageUrl is " + imageUrl);

    if (imageUrl) {
      let maxParamIndex = imageUrl.toLowerCase().indexOf("&maxwidth=");
      if (maxParamIndex != -1) {
        imageUrl = imageUrl.substring(0, maxParamIndex);
      }
      result.fullSizeSharingImageUrl = imageUrl;
    }
  }
}

function extractSharingImageFullSizeLinkV2(document, result) {
  //console.log("extractSharingImageFullSizeLinkV2");

  let imageUrl = "";

  let img = document.querySelector("#landingPageContent div.photo > img");
  if (img) {
    imageUrl = img.getAttribute("src");
  }

  //console.log("imageUrl is " + imageUrl);

  if (imageUrl) {
    let maxParamIndex = imageUrl.toLowerCase().indexOf("&maxwidth=");
    if (maxParamIndex != -1) {
      imageUrl = imageUrl.substring(0, maxParamIndex);
    }
    result.fullSizeSharingImageUrl = imageUrl;
  }
}

function extractSharingImageFullSizeLinkDiscoveries(document, result) {
  //console.log("extractSharingImageFullSizeLinkV2");

  let imageUrl = "";

  let img = document.querySelector("#interactiveImageWidgetContainer > div > img");
  if (img) {
    imageUrl = img.getAttribute("src");

    //console.log("imageUrl is " + imageUrl);

    // Example imageURL:
    // https://mediasvc.ancestry.com/v2/image/namespaces/2442/media/m-t0627-02314-00441.jpg?securitytoken=xwf0ad4ee289f5eb0ebc4290c1c3a06f8ae8dac110959bce00&download=True&client=discoveryui-contentservice

    // we want to remove the "&download=True" and onwards
    if (imageUrl) {
      let downloadParamIndex = imageUrl.toLowerCase().indexOf("&download=");
      if (downloadParamIndex != -1) {
        imageUrl = imageUrl.substring(0, downloadParamIndex);
      }
      result.fullSizeSharingImageUrl = imageUrl;

      const altString = img.getAttribute("alt");
      if (altString) {
        result.titleCollection = altString;
      }
    }
  } else {
    // head > meta:nth-child(18)
    let meta = document.querySelector("head > meta[content^='https://mediasvc.ancestry.']");

    if (meta) {
      let imageUrl = meta.getAttribute("content");

      if (imageUrl) {
        let maxParamIndex = imageUrl.toLowerCase().indexOf("&maxwidth=");
        if (maxParamIndex != -1) {
          imageUrl = imageUrl.substring(0, maxParamIndex);
        }
        result.fullSizeSharingImageUrl = imageUrl;
      }
    }
  }
}

function extractSharingImageOrRecordDetails(document, result) {
  //console.log("extractSharingImageOrRecordDetails");

  if (result.fullSizeSharingImageUrl) {
    // extract the dbId and imageId from image URL
    // https://mediasvc.ancestry.com/v2/image/namespaces/6598/media/LNDRG12_136_137-0719.jpg?securityToken=xw9176821728cabb787654ce65368a763ae9313f7a99db0000&NamespaceId=6598&Client=Share

    const dbId = result.fullSizeSharingImageUrl.replace(
      /https?\:\/\/[^\/]+\/v2\/image\/namespaces\/([^\/]+)\/media\/([^\?\.]+).*/,
      "$1"
    );
    const imageId = result.fullSizeSharingImageUrl.replace(
      /https?\:\/\/[^\/]+\/v2\/image\/namespaces\/([^\/]+)\/media\/([^\?\.]+).*/,
      "$2"
    );

    if (dbId && dbId != result.fullSizeSharingImageUrl) {
      result.dbId = dbId;
    }

    if (imageId && imageId != result.fullSizeSharingImageUrl) {
      result.recordId = imageId;
    }
  }

  const titleElement = document.querySelector("title");
  if (titleElement) {
    let title = titleElement.textContent;
    const prefix = "discovered in ";
    const prefixIndex = title.indexOf(prefix);
    if (prefixIndex != -1) {
      let remainder = title.substring(prefixIndex + prefix.length);
      const suffix = " collection";
      if (remainder.endsWith(suffix)) {
        remainder = remainder.substring(0, remainder.length - suffix.length);
      }

      if (remainder) {
        result.titleCollection = remainder;
      }
    }
  }

  const titleName = document.querySelector("h1.subject-name");
  if (titleName && titleName.textContent) {
    result.titleName = titleName.textContent.trim();
  }

  const personNarrative = document.querySelector("p.content-caption");
  if (personNarrative && personNarrative.textContent) {
    result.personNarrative = personNarrative.textContent.trim();
  }

  // https://www.ancestry.com/sharing/26032858?h=db10de&clickref=1011lwhmEYYb%2C1011lwhmEYYb&adref=&o_xid=01011l4xx5&o_lid=01011l4xx5&o_sch=Affiliate+External
  let num1 = result.url.replace(/.*\.ancestry[^\/]+\/sharing\/([^\?]+)\?.*/, "$1");
  let num2 = result.url.replace(/.*\.ancestry[^\/]+\/sharing\/[^\?]+\?h\=([^\?\&]+).*/, "$1");

  if (num1 && num2) {
    result.ancestryTemplate = "{{Ancestry Sharing|" + num1 + "|" + num2 + "}}";
  }
}

function extractSharingImageOrRecordDetailsV2(document, result) {
  //console.log("extractSharingImageOrRecordDetailsV2");

  const contentDiv = document.querySelector("#landingPageContent");
  if (contentDiv) {
    const dataObjectId = contentDiv.getAttribute("data-object-id");
    if (dataObjectId) {
      // example: "7163-38659916"
      const dashIndex = dataObjectId.indexOf("-");
      if (dashIndex != -1) {
        const dbId = dataObjectId.substring(0, dashIndex);
        const recordId = dataObjectId.substring(dashIndex + 1);
        if (dbId && recordId) {
          result.dbId = dbId;
          result.recordId = recordId;
        }
      }
    }
  }

  const titleElement = document.querySelector("title");
  if (titleElement) {
    let title = titleElement.textContent;
    const prefix = "Discovered by ";
    if (title.startsWith(prefix)) {
      const collectionIndex = title.indexOf(" in ", prefix.length);
      let remainder = title.substring(collectionIndex + 4);
      const suffix = " collection";
      if (remainder.endsWith(suffix)) {
        remainder = remainder.substring(0, remainder.length - suffix.length);
      }

      if (remainder) {
        result.titleCollection = remainder;
      }
    }
  }

  const titleName = document.querySelector("h2.conTitle");
  if (titleName && titleName.textContent) {
    result.titleName = titleName.textContent.trim();
  }

  const personNarrative = document.querySelector("div.conBody > p");
  if (personNarrative && personNarrative.textContent) {
    result.personNarrative = personNarrative.textContent.trim();
  }

  let num1 = result.url.replace(/.*\.ancestry[^\/]+\/sharing\/([^\?]+)\?.*/, "$1");
  let num2 = "";
  if (result.url.includes("?token=")) {
    // https://www.ancestry.com/sharing/236392?token=3832226f2908014024cae3a4bbf644cc019539bca23c8b7133f0affb1529385c
    num2 = result.url.replace(/.*\.ancestry[^\/]+\/sharing\/[^\?]+\?token\=([^\?\&]+).*/, "$1");
  } else if (result.url.includes("?mark=")) {
    // https://www.ancestry.com/sharing/9157607?mark=7b22746f6b656e223a226e5462303635657a394764346a583745615a47496d354f6f454248484d42363242684c65696742534a5a493d222c22746f6b656e5f76657273696f6e223a225632227d
    num2 = result.url.replace(/.*\.ancestry[^\/]+\/sharing\/[^\?]+\?mark\=([^\?\&]+).*/, "$1");
  }

  if (num1 && num2 && num1 != result.url && num2 != result.url) {
    result.ancestryTemplate = "{{Ancestry Sharing|" + num1 + "|" + num2 + "}}";
  }
}

function extractSharingImageOrRecordDetailsDiscoveries(document, result) {
  //console.log("extractSharingImageOrRecordDetailsDiscoveries");

  function getQueryField(regex) {
    let value = result.url.replace(regex, "$1");

    if (value && value != result.url) {
      return value;
    }
  }

  function setFromQueryField(regex, resultField) {
    let value = getQueryField(regex);

    if (value) {
      result[resultField] = value;
    }
  }

  // url contains dbid and recordid:
  // https://www.ancestry.com/census-search/discoveries
  // ?matchdbid=2442&matchrecordid=130891334
  // &matchrelative=relative&share=1&matchgid=ZKaJzrJ3pquxvoYavEO5Hka1nA1QpAf5Wb
  // &matchfirstname=Leslie%20R&matchlastname=Cox&matchbirthdate=1931&matchgender=male
  setFromQueryField(/^.*[&?]matchdbid\=([^&]+).*/, "dbId");
  setFromQueryField(/^.*[&?]matchrecordid\=([^&]+).*/, "recordId");

  let fullName = "";
  const firstNames = getQueryField(/^.*[&?]matchfirstname\=([^&]+).*/);
  const lastNames = getQueryField(/^.*[&?]matchlastname\=([^&]+).*/);
  if (firstNames) {
    fullName = decodeURIComponent(firstNames);
  }
  if (lastNames) {
    if (fullName) {
      fullName += " ";
    }
    fullName += decodeURIComponent(lastNames);
  }
  if (fullName) {
    result.titleName = fullName;
  }

  // div.app-card-content > p.text2xlrg.textalt.topSpacing

  const personNarrative = document.querySelector("div.app-card-content > p.text2xlrg.textalt.topSpacing");
  if (personNarrative && personNarrative.textContent) {
    result.personNarrative = personNarrative.textContent.trim();
  }
}

function detectPageType(document, result, url) {
  if (url.includes("/imageviewer/collections/")) {
    let bandidoModal = document.querySelector("#modal > #modalFixed .bandido-modal-post-share .share-url");
    if (bandidoModal) {
      result.pageType = "sharingUrl";
    } else {
      result.pageType = "image";
    }
  } else if (url.includes("/person/") && url.includes("/facts")) {
    result.pageType = "personFacts";

    let citationRecord = document.querySelector(".modalContents #FactEditComponent section.citationRecord");
    if (citationRecord) {
      result.pageType = "personSourceCitation";
    }
  } else if (url.includes("/discoveries") || url.includes("matchdbid=")) {
    result.pageType = "sharingImageOrRecord";
    result.sharingType = "discoveries";
  } else if (url.includes("dbid=") || url.includes("db=") || url.includes("discoveryui-content")) {
    result.pageType = "record";
  } else if (url.includes("/collections/") && url.includes("/records/")) {
    result.pageType = "record";
  } else if (url.includes("/sharing/") && url.includes("?h=")) {
    result.pageType = "sharingImageOrRecord";
    result.sharingType = "v1";
  } else if (url.includes("/sharing/") && url.includes("?token=")) {
    result.pageType = "sharingImageOrRecord";
    result.sharingType = "v2";
  } else if (url.includes("/sharing/") && url.includes("?mark=")) {
    result.pageType = "sharingImageOrRecord";
    result.sharingType = "v2";
  } else if (url.includes("/media/") && url.includes("/tree/")) {
    result.pageType = "treeMedia";
  } else if (url.includes("/person/") && url.includes("/citation/create")) {
    result.pageType = "createCitation";
  } else if (url.includes("/person/") && url.includes("/source/create")) {
    result.pageType = "createSource";
  } else if (url.includes("/person/") && url.includes("/repository/create")) {
    result.pageType = "createRepository";
  } else {
    result.pageType = "unknown";
  }

  //console.log("detectPageType, result.pageType = " + result.pageType);
}

function handlePersonSourceCitation(document, result) {
  // This saves the extra click of having to click on "View record"

  let modalContents = document.querySelector(".modalContents");
  if (modalContents) {
    let factEdit = modalContents.querySelector("#FactEditComponent");
    if (factEdit) {
      let link = modalContents.querySelector("#viewRecordLink");
      if (link) {
        let recordUrl = getAbsoluteLinkUrl(link, document, result);

        // for the normal case this is all we need since we will extract the rest of the data
        // with a fetch using this. This gets us better data (mainly the link data)
        result.recordUrl = recordUrl;

        // However, if someones subscription doesn't allow acess to this record we may as well
        // extract what we can.
        extractDbAndRecordId(result, recordUrl);
      }

      let imageLink = modalContents.querySelector("#viewRecordImageLink");
      if (imageLink) {
        let url = getAbsoluteLinkUrl(imageLink, document, result);

        //console.log("handlePersonSourceCitation, url = " + url);

        if (url) {
          // Example:

          // "https://www.ancestry.com/interactive/2352/rg14_14817_0059_03/55565824
          //    ?backurl=https://www.ancestry.com/family-tree/person/tree/86808578/person/46548439562/facts/citation/323635602069/edit/record"
          // clicking on this goes to:
          // https://www.ancestry.com/imageviewer/collections/2352/images/rg14_14817_0059_03?pId=55565824

          let dbId = "";
          let recordId = "";

          if (url.includes("/imageviewer/")) {
            dbId = url.replace(/.*imageviewer\/collections\/([^\/]+)\/images\/.*/, "$1");
            recordId = url.replace(/.*\/images\/([^?]+).*/, "$1");
          } else if (url.includes("/interactive/")) {
            dbId = url.replace(/.*interactive\/([^\/]+)\/[^\/]+\/.*/, "$1");
            recordId = url.replace(/.*interactive\/[^\/]+\/([^\/]+)\/.*/, "$1");
            let base = url.replace(/(.*)\/interactive\/[^\/]+\/[^\/]+\/.*/, "$1");
            url = base + "/imageviewer/collections/" + dbId + "/images/" + recordId;
          }

          result.imageUrl = url;
          if (dbId && dbId != url) {
            result.imageDbId = dbId;
          }
          if (recordId && recordId != url) {
            result.imageRecordId = recordId;
          }
        }
      }

      let citationRecord = factEdit.querySelector("section.citationRecord");
      if (citationRecord) {
        result.recordData = {};

        let titleNode = citationRecord.querySelector("h3.conTitle");
        if (titleNode) {
          result.titleCollection = titleNode.textContent;
        }

        let displayFields = citationRecord.querySelectorAll("tr[id^='displayFields']");
        for (let displayField of displayFields) {
          let header = displayField.querySelector("th");
          let data = displayField.querySelector("td");
          if (header && data) {
            let key = header.textContent;
            let value = data.textContent;
            if (key && value) {
              // Marital Status can be "Marital Status" if no subscription etc
              // That would be interpreted as "Married" if we set it
              if (key != value) {
                const placeholderValues = ["city", "location", "gender"];
                if (!placeholderValues.includes(value)) {
                  result.recordData[key] = value;
                }
              }
            }
          }
        }

        let householdMembers = citationRecord.querySelectorAll("tr[id^='householdMembers']");
        if (householdMembers && householdMembers.length > 0) {
          result.household = {};
          let tbody = householdMembers[0].parentElement;
          if (tbody) {
            let thead = tbody.previousElementSibling;
            if (thead) {
              let headingRow = thead.querySelector("tr");
              if (headingRow) {
                result.household.headings = [];
                result.household.members = [];
                let headings = headingRow.querySelectorAll("th");
                for (let heading of headings) {
                  result.household.headings.push(cleanText(heading.textContent));
                }

                let rows = tbody.querySelectorAll("tr");
                for (let row of rows) {
                  let member = {};
                  let subRowCells = row.querySelectorAll("th, td");
                  if (subRowCells.length > 0) {
                    for (let cellIndex = 0; cellIndex < subRowCells.length; cellIndex++) {
                      let cell = subRowCells[cellIndex];
                      let memberText = cleanText(cell.textContent);
                      member[result.household.headings[cellIndex]] = memberText;
                    }
                  }
                  result.household.members.push(member);
                }
              }
            }
          }
        }
      }

      let citationInfo = factEdit.querySelector("section.citationInformation");
      if (citationInfo) {
        let body = citationInfo.querySelector("div.conBody");
        if (body) {
          let dtNodes = body.querySelectorAll("dt");
          let ddNodes = body.querySelectorAll("dd");
          if (dtNodes.length == 1 && ddNodes.length == 1) {
            let sourceText = cleanText(ddNodes[0].textContent);
            result.sourceCitation = sourceText;
          } else {
            let sourceText = cleanText(body.textContent);
            result.sourceCitation = sourceText;
          }
        }
      }

      let sourceInfo = factEdit.querySelector("section.sourceInformation");
      if (sourceInfo) {
        let body = sourceInfo.querySelector("div.conBody");
        if (body) {
          let sourceText = cleanText(body.textContent);
          result.sourceInformation = sourceText;
        }
      }
    }
  }

  // In addition extract the person facts page data, this can be useful to get gender etc
  let personResult = {};
  personResult.url = result.url;
  handlePersonFacts(document, personResult);
  result.personExtractedData = personResult;

  //console.log("handleFactEdit, recordUrl is: " + result.recordUrl);
}

function parseHtmlEscapeCodes(str) {
  str = str.replace(/&#([0-9]{1,3});/gi, function (match, numStr) {
    var num = parseInt(numStr, 10); // read num as normal number
    return String.fromCharCode(num);
  });

  str = str.replace(/\\u([0-9a-f]+)/gi, function (match, numStr) {
    var num = parseInt(numStr, 16); // read num as normal number
    return String.fromCharCode(num);
  });

  // the below two replaces were needed for:
  // https://www.ancestry.com/family-tree/person/tree/86808578/person/260140894818/facts
  str = str.replace(/&quot;/gi, '"');
  str = str.replace(/\\/gi, "");
  return str;
}

// Extracting the HTML elements is working but I am unable to get the given name
// and last name separately that way. There may be a way via a fetch.
// This request:
// https://www.ancestry.com/api/treesui-list/trees/11748183/recentlyviewedperson?expires=1667171853706
// Gets this response:
// {"pid":"12992988602","gname":"Fannie L.","sname":"(Kemper) Money Barber","isLiving":false}
// The pid can be compared with the pid of the page to make sure it is the right person.
function handlePersonFactsPreJune2024(document, result) {
  let personCardContainer = document.querySelector("#personCardContainer");
  if (personCardContainer) {
    // There is no way that I have found to find the given name and surname separated in the
    // HTML elements. But it can be found in a script.
    let scriptElements = personCardContainer.querySelectorAll("script");
    for (let scriptElement of scriptElements) {
      let text = scriptElement.textContent;
      let fullNameIndex = text.indexOf("fullName:");
      if (fullNameIndex != -1) {
        let endIndex = text.indexOf("}", fullNameIndex);
        if (endIndex != -1) {
          let fullNameText = text.substring(fullNameIndex, endIndex);
          let givenName = fullNameText.replace(/fullName: { given: '([^']*)', surname: '(([^']*))',.*/, "$1");
          let surname = fullNameText.replace(/fullName: { given: '([^']*)', surname: '(([^']*))',.*/, "$2");
          if (givenName && givenName != fullNameText) {
            result.givenName = parseHtmlEscapeCodes(givenName);
          }
          if (surname && surname != fullNameText) {
            result.surname = parseHtmlEscapeCodes(surname);
          }
          let suffix = fullNameText.replace(/fullName: {.*\ssuffix:\s*'([^']*)'.*/, "$1");
          if (suffix && suffix != fullNameText) {
            result.suffix = parseHtmlEscapeCodes(suffix);
          }
        }
      }
    }

    let userCardTitle = personCardContainer.querySelector(".userCardTitle");
    if (userCardTitle) {
      let fullName = userCardTitle.textContent;
      if (fullName) {
        result.titleName = fullName;
      }
    }

    let userCardEvents = personCardContainer.querySelector(".userCardEvents");
    if (userCardEvents) {
      let userCardEventArray = userCardEvents.querySelectorAll("span.userCardEvent");
      for (let userCardEvent of userCardEventArray) {
        let type = userCardEvent.textContent; // not safe to test this as it is language specific
      }

      let birthDateSpan = userCardEvents.querySelector("span.birthDate");
      if (!birthDateSpan) {
      }
      if (birthDateSpan) {
        result.birthDate = birthDateSpan.textContent;
      }

      let birthPlaceSpan = userCardEvents.querySelector("span.birthPlace");
      if (birthPlaceSpan && birthPlaceSpan.textContent) {
        result.birthPlace = cleanPlaceName(birthPlaceSpan.textContent);
      }

      let deathDateSpan = userCardEvents.querySelector("span.deathDate");
      if (deathDateSpan) {
        result.deathDate = deathDateSpan.textContent;
      }
      let deathPlaceSpan = userCardEvents.querySelector("span.deathPlace");
      if (deathPlaceSpan && deathPlaceSpan.textContent) {
        result.deathPlace = cleanPlaceName(deathPlaceSpan.textContent);
      }
    }
  }

  let researchListFacts = document.querySelector("#researchListFacts");
  if (researchListFacts) {
    let factList = researchListFacts.querySelectorAll("li.researchListItem");
    for (let fact of factList) {
      if (fact.classList.contains("researchListItemGender")) {
        let valueNode = fact.querySelector("h4");
        if (valueNode) {
          let gender = valueNode.textContent;
          if (gender) {
            result.gender = gender;
          }
        }
      } else {
        let factItem = fact.querySelector("div.factItemFact");
        if (factItem) {
          if (factItem.classList.contains("preferredEventMarriage")) {
            let marriage = {};
            let dateNode = factItem.querySelector("span.factItemDate");
            if (dateNode) {
              let date = dateNode.textContent;
              if (date) {
                marriage.date = date;
              }
            }
            let placeNode = factItem.querySelector("span.factItemLocation");
            if (placeNode) {
              let place = placeNode.textContent;
              if (place) {
                marriage.place = cleanPlaceName(place);
              }
            }
            let spouseNode = factItem.querySelector("h5.userCardTitle");
            if (spouseNode) {
              let spouseName = spouseNode.textContent;
              if (spouseName) {
                marriage.spouseName = spouseName;
              }
            }

            // add the marriage
            if (!result.marriages) {
              result.marriages = [];
            }
            result.marriages.push(marriage);
          }
        }
      }
    }
  }

  let familySection = document.querySelector("#familySection");
  if (familySection) {
    // there can be multiple research lists but parents should always be first one
    let parentResearchList = familySection.querySelector("ul.researchList");

    let parentItems = parentResearchList.querySelectorAll("li.researchListItem");

    if (parentItems.length == 2) {
      let fatherItem = parentItems[0];
      let fatherTitle = fatherItem.querySelector("h4.userCardTitle");
      if (fatherTitle && fatherTitle.textContent != "Unknown father") {
        result.father = { name: fatherTitle.textContent };
      }

      let motherItem = parentItems[1];
      let motherTitle = motherItem.querySelector("h4.userCardTitle");
      if (motherTitle && motherTitle.textContent != "Unknown mother") {
        result.mother = { name: motherTitle.textContent };
      }
    }
  }

  // Get the list of sources
  let sourcesSection = document.querySelector("section.factsSectionSources");
  if (sourcesSection) {
    let conBody = sourcesSection.querySelector("div > div.conBody");
    let researchListHeadings = conBody.querySelectorAll("h3");
    let researchLists = conBody.querySelectorAll("ul.researchList");

    let ancestrySourcesList = undefined;
    let otherSourcesList = undefined;
    let webLinksList = undefined;
    if (researchListHeadings.length == researchLists.length) {
      for (let index = 0; index < researchLists.length; index++) {
        let heading = researchListHeadings[index];
        let list = researchLists[index];
        let type = undefined;
        if (list.classList.contains("researchListWebLinks")) {
          type = "webLinks";
        } else if (heading.textContent == "Ancestry sources") {
          type = "ancestrySources";
        } else if (heading.textContent == "Other sources") {
          type = "otherSources";
        } else if (heading.textContent == "Web links") {
          type = "webLinks";
        }

        if (type == "ancestrySources") {
          ancestrySourcesList = list;
        } else if (type == "otherSources") {
          otherSourcesList = list;
        } else if (type == "webLinks") {
          webLinksList = list;
        }
      }
    }

    if (ancestrySourcesList) {
      let researchListItems = ancestrySourcesList.querySelectorAll("li.researchListItem");
      if (researchListItems.length > 0) {
        result.sources = [];
        let numExcludedSources = 0;
        for (let researchListItem of researchListItems) {
          let dbIdInput = researchListItem.querySelector("input.dbId");
          let recordIdInput = researchListItem.querySelector("input.recordId");
          let titleInput = researchListItem.querySelector("input.title");

          if (dbIdInput && recordIdInput) {
            let dbId = dbIdInput.value;
            let recordId = recordIdInput.value;
            if (dbId && recordId) {
              // exclude "Ancestry Family Trees" sources
              if (dbId == "1030") {
                numExcludedSources++;
                continue;
              }

              let source = { dbId: dbId, recordId: recordId };

              if (titleInput) {
                let title = titleInput.value;
                if (title) {
                  title = title.replace("&amp;", "&");
                  title = title.trim();
                  source.title = title;
                }
              }
              result.sources.push(source);
            }
          }
        }
        if (numExcludedSources) {
          result.numExcludedSources = numExcludedSources;
        }
      }
    }

    if (otherSourcesList) {
      let researchListItems = otherSourcesList.querySelectorAll("li.researchListItem");
      if (researchListItems.length > 0) {
        result.otherSources = [];
        for (let researchListItem of researchListItems) {
          let titleInput = researchListItem.querySelector("input.title");
          let viewRecordLinkInput = researchListItem.querySelector("input.viewRecordLink");

          if (titleInput && viewRecordLinkInput) {
            let title = titleInput.value;
            let viewRecordLink = viewRecordLinkInput.value;
            if (title && viewRecordLink) {
              title = title.replace("&amp;", "&");
              title = title.trim();

              let source = { title: title, viewRecordLink: viewRecordLink };
              result.otherSources.push(source);
            }
          }
        }
      }
    }

    if (webLinksList) {
      let researchListItems = webLinksList.querySelectorAll("li.researchListItem");
      if (researchListItems.length > 0) {
        result.webLinks = [];
        for (let researchListItem of researchListItems) {
          let titleElement = researchListItem.querySelector("h4.webLinkTitle");
          let webLinkElement = researchListItem.querySelector("p.webLinkHref > a");

          if (titleElement && webLinkElement) {
            let title = titleElement.textContent;
            let webLink = getAbsoluteLinkUrl(webLinkElement, document, result);
            if (title && webLink) {
              title = title.replace("&amp;", "&");
              title = title.trim();

              let source = { title: title, webLink: webLink };
              result.webLinks.push(source);
            }
          }
        }
      }
    }
  }

  // #family46552199474 > div.noTopSpacing.userCard.userCardSize2 > div.userCardContent.textWrap > h4

  //console.log("handleFactEdit, recordUrl is: " + result.recordUrl);
}

function getPersonCardScriptText(document) {
  let personCardContainer = document.querySelector("#personCardContainer");
  if (personCardContainer) {
    let scriptElements = personCardContainer.querySelectorAll("script");
    for (let scriptElement of scriptElements) {
      let text = scriptElement.textContent;
      let personCardIndex = text.indexOf("var PersonCard =");
      if (personCardIndex != -1) {
        return text;
      }
    }
  }

  let personViewDiv = document.querySelector("#personView");
  if (personViewDiv) {
    let scriptElements = personViewDiv.querySelectorAll("script");
    for (let scriptElement of scriptElements) {
      let text = scriptElement.textContent;
      let personCardIndex = text.indexOf("var PersonCard =");
      if (personCardIndex != -1) {
        return text;
      }
    }
  }
}

function extractPersonCardSimpleValue(result, text, pcKey, resultKey) {
  let startString = pcKey + ": '";
  let keyIndex = text.indexOf(startString);
  if (keyIndex != -1) {
    let valueStartIndex = keyIndex + startString.length;
    let endIndex = text.indexOf("'", valueStartIndex);
    if (endIndex != -1) {
      let valueText = text.substring(valueStartIndex, endIndex);
      valueText = valueText.replace(/\s+/g, " ");
      if (valueText) {
        result[resultKey] = parseHtmlEscapeCodes(valueText);
      }
    }
  }
}

function handlePersonFactsJune2024(document, result) {
  let personCardScript = getPersonCardScriptText(document);
  if (personCardScript) {
    // There is no way that I have found to find the given name and surname separated in the
    // HTML elements. But it can be found in a script.

    let fullNameIndex = personCardScript.indexOf("fullName:");
    if (fullNameIndex != -1) {
      let endIndex = personCardScript.indexOf("}", fullNameIndex);
      if (endIndex != -1) {
        let fullNameText = personCardScript.substring(fullNameIndex, endIndex);
        fullNameText = fullNameText.replace(/\s+/g, " ");
        const regex = /fullName: { given: '([^']*)', surname: '([^']*)'.*$/;
        if (regex.test(fullNameText)) {
          let givenName = fullNameText.replace(regex, "$1");
          let surname = fullNameText.replace(regex, "$2");
          if (givenName && givenName != fullNameText) {
            result.givenName = parseHtmlEscapeCodes(givenName);
          }
          if (surname && surname != fullNameText) {
            result.surname = parseHtmlEscapeCodes(surname);
          }
          let suffix = fullNameText.replace(/fullName: {.*\ssuffix:\s*'([^']*)'.*/, "$1");
          if (suffix && suffix != fullNameText) {
            result.suffix = parseHtmlEscapeCodes(suffix);
          }
        }
      }
    }

    extractPersonCardSimpleValue(result, personCardScript, "birthDate", "birthDate");
    extractPersonCardSimpleValue(result, personCardScript, "birthPlace", "birthPlace");
    extractPersonCardSimpleValue(result, personCardScript, "deathDate", "deathDate");
    extractPersonCardSimpleValue(result, personCardScript, "deathPlace", "deathPlace");
    extractPersonCardSimpleValue(result, personCardScript, "gender", "gender");
  }

  let personCardContainer = document.querySelector("#personCardContainer");
  if (personCardContainer) {
    let userCardTitle = personCardContainer.querySelector(".userCardTitle");
    if (userCardTitle) {
      let fullName = userCardTitle.textContent;
      if (fullName) {
        result.titleName = fullName;
      }
    }

    let userCardEvents = personCardContainer.querySelector(".userCardEvents");
    if (userCardEvents) {
      let birthDateSpan = userCardEvents.querySelector("span.birthDate");
      if (birthDateSpan) {
        result.birthDate = birthDateSpan.textContent;
      }
      let birthPlaceSpan = userCardEvents.querySelector("span.birthPlace");
      if (birthPlaceSpan && birthPlaceSpan.textContent) {
        result.birthPlace = cleanPlaceName(birthPlaceSpan.textContent);
      }

      let deathDateSpan = userCardEvents.querySelector("span.deathDate");
      if (deathDateSpan) {
        result.deathDate = deathDateSpan.textContent;
      }
      let deathPlaceSpan = userCardEvents.querySelector("span.deathPlace");
      if (deathPlaceSpan && deathPlaceSpan.textContent) {
        result.deathPlace = cleanPlaceName(deathPlaceSpan.textContent);
      }
    }
  }

  let researchListFacts = document.querySelector("#researchListFacts");
  if (researchListFacts) {
    let factList = researchListFacts.querySelectorAll("li.researchListItem");
    for (let fact of factList) {
      let titleHeading = fact.querySelector("h3.userCardTitle");
      if (!titleHeading) {
        continue;
      }

      let title = "";
      for (let childNode of titleHeading.childNodes) {
        // 3 is Node.TEXT_NODE
        if (childNode.nodeType === 3) {
          title += childNode.textContent;
        }
      }

      if (!title) {
        continue;
      }
      title = title.trim();
      let lcTitle = title.toLowerCase();

      if (lcTitle == "gender") {
        let valueNode = fact.querySelector("h4");
        // In September 2024 this change from an h4 to a para
        if (!valueNode) {
          valueNode = fact.querySelector("p.userCardSubTitle");
        }
        if (valueNode) {
          let gender = valueNode.textContent;
          if (gender) {
            result.gender = gender;
          }
        }
      } else if (lcTitle == "marriage") {
        let factContentDiv = fact.querySelector("div.userCard > div.userCardContent");
        let factItemDateSpan = factContentDiv.querySelector("span.factItemDate");
        let factItemLocationSpan = factContentDiv.querySelector("span.factItemLocation");
        let marriage = {};
        if (factItemDateSpan) {
          let date = factItemDateSpan.textContent;
          if (date) {
            marriage.date = date;
          }
        }
        if (factItemLocationSpan) {
          let place = factItemLocationSpan.textContent;
          if (place) {
            marriage.place = cleanPlaceName(place);
          }
        }
        let spouseNode = factContentDiv.querySelector("div.userCard > div.userCardContent > h4.userCardTitle");
        if (spouseNode) {
          let spouseLinkNode = spouseNode.querySelector("a");
          if (spouseLinkNode) {
            let spouseName = spouseLinkNode.textContent;
            if (spouseName) {
              marriage.spouseName = spouseName;
            }
          }

          let spouseBirthDeathNode = spouseNode.nextElementSibling;
          if (spouseBirthDeathNode) {
            let spouseBirthDeath = spouseBirthDeathNode.textContent;
            // Sometimes 1704-1764 comes through as 1704â€“1764
            if (spouseBirthDeath) {
              const regex = /^(\d\d\d\d)?[\–\-â€\“]+(\d\d\d\d)?$/;
              if (regex.test(spouseBirthDeath)) {
                let birthYear = spouseBirthDeath.replace(regex, "$1");
                let deathYear = spouseBirthDeath.replace(regex, "$2");
                if (birthYear) {
                  marriage.spouseBirthYear = birthYear;
                }
                if (deathYear) {
                  marriage.spouseDeathYear = deathYear;
                }
              }
            }
          }
        }

        // add the marriage
        if (!result.marriages) {
          result.marriages = [];
        }
        result.marriages.push(marriage);
      }
    }
  }

  let familySection = document.querySelector("#familySection");
  if (familySection) {
    // there are multiple ur.researchList elements, each one should have an h3
    // preceding it which identifies it
    let researchLists = familySection.querySelectorAll("ul.researchList");
    let parentResearchList = undefined;
    let siblingResearchList = undefined;
    let halfSiblingResearchList = undefined;
    let spouseResearchLists = [];
    for (let researchList of researchLists) {
      let prevElement = researchList.previousElementSibling;
      if (prevElement) {
        if (prevElement.tagName == "H3") {
          if (prevElement.textContent == "Biological parents") {
            parentResearchList = researchList;
          } else if (prevElement.textContent == "Siblings") {
            siblingResearchList = researchList;
          } else if (prevElement.textContent == "Half siblings") {
            halfSiblingResearchList = researchList;
          } else if (prevElement.textContent == "Spouse and children") {
            spouseResearchLists.push(researchList);
          }
        } else if (prevElement.tagName == "UL") {
          if (spouseResearchLists.length > 0) {
            spouseResearchLists.push(researchList);
          }
        }
      } else {
        let parentElement = researchList.parentElement;
        if (parentElement && parentElement.id == "toggleSiblingsFacts") {
          siblingResearchList = researchList;
        }
      }
    }

    // there can be multiple research lists but parents should always be first one
    if (!parentResearchList) {
      parentResearchList = familySection.querySelector("ul.researchList");
    }

    if (parentResearchList) {
      let parentItems = parentResearchList.querySelectorAll("li.researchListItem");

      if (parentItems.length == 2) {
        let fatherItem = parentItems[0];
        let fatherTitle = fatherItem.querySelector("h4.userCardTitle");
        if (fatherTitle && fatherTitle.textContent != "Unknown father") {
          result.father = {};
          result.father.name = fatherTitle.textContent;
          let fatherSubtitle = fatherItem.querySelector("p.userCardSubTitle");
          if (fatherSubtitle) {
            result.father.subtitle = fatherSubtitle.textContent;
          }
        }

        let motherItem = parentItems[1];
        let motherTitle = motherItem.querySelector("h4.userCardTitle");
        if (motherTitle && motherTitle.textContent != "Unknown mother") {
          result.mother = {};
          result.mother.name = motherTitle.textContent;
          let motherSubtitle = motherItem.querySelector("p.userCardSubTitle");
          if (motherSubtitle) {
            result.mother.subtitle = motherSubtitle.textContent;
          }
        }
      }
    }

    if (siblingResearchList) {
      let siblingElements = siblingResearchList.querySelectorAll("li.researchListItem");
      result.siblings = [];

      for (let siblingElement of siblingElements) {
        let sibling = {};
        let titleElement = siblingElement.querySelector("h4.userCardTitle");
        let subtitleElement = siblingElement.querySelector("p.userCardSubTitle");
        if (titleElement) {
          sibling.name = titleElement.textContent;
        }
        if (subtitleElement) {
          sibling.subtitle = subtitleElement.textContent;
        }
        result.siblings.push(sibling);
      }
    }

    if (halfSiblingResearchList) {
      let halfSiblingElements = halfSiblingResearchList.querySelectorAll("li.researchListItem");
      result.halfSiblings = [];
      for (let halfSiblingElement of halfSiblingElements) {
        let halfSibling = {};
        let titleElement = halfSiblingElement.querySelector("h4.userCardTitle");
        let subtitleElement = halfSiblingElement.querySelector("p.userCardSubTitle");
        if (titleElement) {
          halfSibling.name = titleElement.textContent;
        }
        if (subtitleElement) {
          halfSibling.subtitle = subtitleElement.textContent;
        }
        result.halfSiblings.push(halfSibling);
      }
    }

    if (spouseResearchLists.length > 0) {
      result.spousesAndChildren = [];
      for (let spouseResearchList of spouseResearchLists) {
        let spouseElement = spouseResearchList.querySelector("li.researchListItem");
        let spouseChildElements = spouseResearchList.querySelectorAll("li.researchListItem.researchListItemIndented");
        if (spouseElement) {
          let spouse = {};
          result.spousesAndChildren.push(spouse);

          let titleElement = spouseElement.querySelector("h4.userCardTitle");
          let subtitleElement = spouseElement.querySelector("p.userCardSubTitle");

          if (titleElement) {
            spouse.name = titleElement.textContent;
          }
          if (subtitleElement) {
            spouse.subtitle = subtitleElement.textContent;
          }

          if (spouseChildElements.length > 0) {
            spouse.children = [];
            for (let spouseChildElement of spouseChildElements) {
              let child = {};
              spouse.children.push(child);

              let titleElement = spouseChildElement.querySelector("h5.userCardTitle");
              let subtitleElement = spouseChildElement.querySelector("p.userCardSubTitle");

              if (titleElement) {
                child.name = titleElement.textContent;
              }
              if (subtitleElement) {
                child.subtitle = subtitleElement.textContent;
              }
            }
          }
        }
      }
    }
  }

  // Get the list of sources
  let sourcesSection = document.querySelector("#sourcesSection");
  if (sourcesSection) {
    let conBody = sourcesSection.querySelector("div > div.conBody");
    if (!conBody) {
      // On iPhone15 sim there is no extra div
      conBody = sourcesSection.querySelector("div.conBody");
    }
    if (conBody) {
      let researchListHeadings = conBody.querySelectorAll("h3");
      let researchLists = conBody.querySelectorAll("ul.researchList");

      let ancestrySourcesList = undefined;
      let otherSourcesList = undefined;
      let webLinksList = undefined;
      if (researchListHeadings.length == researchLists.length) {
        for (let index = 0; index < researchLists.length; index++) {
          let heading = researchListHeadings[index];
          let list = researchLists[index];
          let lcHeading = "";
          if (heading && heading.textContent) {
            lcHeading = heading.textContent.toLowerCase();
          }
          let type = undefined;
          if (list.classList.contains("researchListWebLinks")) {
            type = "webLinks";
          } else if (lcHeading == "ancestry sources") {
            type = "ancestrySources";
          } else if (lcHeading == "other sources") {
            type = "otherSources";
          } else if (lcHeading == "web links") {
            type = "webLinks";
          }

          if (type == "ancestrySources") {
            ancestrySourcesList = list;
          } else if (type == "otherSources") {
            otherSourcesList = list;
          } else if (type == "webLinks") {
            webLinksList = list;
          }
        }
      }

      if (ancestrySourcesList) {
        let researchListItems = ancestrySourcesList.querySelectorAll("li.researchListItem");
        if (researchListItems.length > 0) {
          result.sources = [];
          let numExcludedSources = 0;

          for (let researchListItem of researchListItems) {
            let dbId = "";
            let recordId = "";
            let title = "";

            let cardDiv = researchListItem.querySelector("div.card");
            if (cardDiv) {
              for (let className of cardDiv.classList) {
                if (className.startsWith("record_")) {
                  let classNameDbId = className.replace(/^record_([^_]+)_(\d+)$/, "$1");
                  let classNameRecordId = className.replace(/^record_([^_]+)_(\d+)$/, "$2");
                  if (
                    classNameDbId &&
                    classNameRecordId &&
                    classNameDbId != className &&
                    classNameRecordId != className
                  ) {
                    dbId = classNameDbId;
                    recordId = classNameRecordId;
                    break;
                  }
                }
              }

              let titleHeading = researchListItem.querySelector("div > h4");
              if (!titleHeading) {
                // changed to p in Sep 2024
                titleHeading = researchListItem.querySelector("div > p");
              }
              if (titleHeading) {
                title = titleHeading.textContent;
              }
            }

            if (dbId && recordId) {
              // exclude "Ancestry Family Trees" sources
              if (dbId == "1030") {
                numExcludedSources++;
                continue;
              }

              let source = { dbId: dbId, recordId: recordId };

              if (title) {
                title = title.replace("&amp;", "&");
                title = title.trim();
                source.title = title;
              }

              result.sources.push(source);
            } else {
              // sometimes Ancestry Family Tree sources have no dbid or recordid
              numExcludedSources++;
            }
          }
          if (numExcludedSources) {
            result.numExcludedSources = numExcludedSources;
          }
        }
      }

      if (otherSourcesList) {
        let researchListItems = otherSourcesList.querySelectorAll("li.researchListItem");
        if (researchListItems.length > 0) {
          result.otherSources = [];
          for (let researchListItem of researchListItems) {
            let titleInput = researchListItem.querySelector("input.title");
            let viewRecordLinkInput = researchListItem.querySelector("input.viewRecordLink");

            if (titleInput && viewRecordLinkInput) {
              let title = titleInput.value;
              let viewRecordLink = viewRecordLinkInput.value;
              if (title && viewRecordLink) {
                title = title.replace("&amp;", "&");
                title = title.trim();

                let source = { title: title, viewRecordLink: viewRecordLink };
                result.otherSources.push(source);
              }
            }
          }
        }
      }

      if (webLinksList) {
        let researchListItems = webLinksList.querySelectorAll("li.researchListItem");
        if (researchListItems.length > 0) {
          result.webLinks = [];
          for (let researchListItem of researchListItems) {
            let titleElement = researchListItem.querySelector("h4.webLinkTitle");
            let webLinkElement = researchListItem.querySelector("p.webLinkHref > a");

            if (titleElement && webLinkElement) {
              let title = titleElement.textContent;
              let webLink = getAbsoluteLinkUrl(webLinkElement, document, result);
              if (title && webLink) {
                title = title.replace("&amp;", "&");
                title = title.trim();

                let source = { title: title, webLink: webLink };
                result.webLinks.push(source);
              }
            }
          }
        }
      }
    }
  }

  // #family46552199474 > div.noTopSpacing.userCard.userCardSize2 > div.userCardContent.textWrap > h4

  //console.log("handleFactEdit, recordUrl is: " + result.recordUrl);
}

function handlePersonFacts(document, result) {
  // The format changed in June 2024.
  // There may be no reason to keep the old code around but it keeps the unit tests working and
  // the old format could come back (seems unlikely)

  // Some checks to see which format to use.
  let format = "june2024";

  let sourcesSection = document.querySelector("section.factsSectionSources");
  if (sourcesSection) {
    format = "preJune2024";
  }

  if (format == "preJune2024") {
    handlePersonFactsPreJune2024(document, result);
  } else {
    handlePersonFactsJune2024(document, result);
  }
}

// Used by background for extracting a referenced record
function extractRecord(document, url, result) {
  extractDbAndRecordId(result, url);
  extractRecordPageTitle(document, result);
  extractRecordData(document, result);
  extractImageThumb(document, result);
  extractRecordSourceCitation(document, result);
}

function extractData(document, url) {
  var result = {};

  result.url = url; // useful to know what domain this record is from

  //console.log("Ancestry extractData, url = " + url);

  // first determine what kind of page we are in.
  // - Record page
  // - Image page
  // - Image page with sharing url up

  detectPageType(document, result, url);

  //console.log("Ancestry pageType is " + result.pageType);

  if (result.pageType == "record") {
    //console.log("This is an Ancestry record page");
    extractDbAndRecordId(result, url);
    extractRecordPageTitle(document, result);
    extractRecordData(document, result);
    extractImageThumb(document, result);
    extractRecordSourceCitation(document, result);
  } else if (result.pageType == "image") {
    extractImagePageTitle(document, result);
    extractImageTemplate(result, url);
    extractImageBrowsePath(document, result);
    extractImageNumberAndTotal(document, result);
    extractImageHasIndex(document, result);
    extractImageSourceCitation(document, result);
    extractImageIndex(document, result);
  } else if (result.pageType == "sharingUrl") {
    extractImagePageTitle(document, result);
    extractSharingUrlTemplate(document, result);
  } else if (result.pageType == "sharingImageOrRecord") {
    if (result.sharingType == "v1") {
      extractSharingImageFullSizeLink(document, result);
      extractSharingImageOrRecordDetails(document, result);
    } else if (result.sharingType == "v2") {
      extractSharingImageFullSizeLinkV2(document, result);
      extractSharingImageOrRecordDetailsV2(document, result);
    } else if (result.sharingType == "discoveries") {
      extractSharingImageFullSizeLinkDiscoveries(document, result);
      extractSharingImageOrRecordDetailsDiscoveries(document, result);
    }
  } else if (result.pageType == "personSourceCitation") {
    handlePersonSourceCitation(document, result);
  } else if (result.pageType == "personFacts") {
    handlePersonFacts(document, result);
    extractTreeTemplate(result, url);
  } else if (result.pageType == "treeMedia") {
    extractTreeMediaTemplate(result, url);
  }

  //console.log("result of extractData on Ancestry");
  //console.log(result);

  return result;
}

export { extractData, detectPageType, extractRecord };
