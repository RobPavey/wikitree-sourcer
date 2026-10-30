/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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

// No imports or requires allowed. See docs/dev_notes/extract_data_design

function isMsaCitation(string) {
  const msa_header_citation = "^MSA [A-Z]+ [A-Z0-9\-]{3,12}$";  // MSA ZZ 1234-56
  let citation = string.match(msa_header_citation);
  console.log("isMsaCitation: " + string + " " + citation);
  return citation;
}
function isMsaFilenameCitation(string) {
  let result = null;
  //console.log("Check  for Filename citation: " +string);
  const mdsa_filename_citation = /^(:?mdsa_)([A-Za-z0-9\-]{3,14})(\.pdf)$/;  // mdsa_AA1234-5.pdf
  const non_mdsa_filename_citation = /^([A-Za-z0-9\-]{3,14})(\.pdf)$/;  // AA1234-5.pdf
  const match = string.match(mdsa_filename_citation);
  if (match && match[1]) {
    result = match[1].toUpperCase();
  } else {
    const match = string.match(non_mdsa_filename_citation);
    if (match && match[1]) {
      result = match[1].toUpperCase();
    }
  }
  return result;
}
function searchDOMNode(domNodeText) {
  const msa_citation_a = ".*(MSA [A-Z]{1,4}[0-9]{2,6}\-[0-9]{1,4}).*";
  const msa_citation_b = "^MSA [A-Z0-9\-]{3,12}$";  // MSA 1234-56
  let result = domNodeText.match(msa_citation_a);
  if (result) {
    console.log("searchDOMNode A: " + " " + result[1]);
    return result[1];
  } else
  if (!result) {
    result = domNodeText.match(msa_citation_b);
    if (result)  {
      console.log("searchDOMNode B: " + " " + result[0]);
      return result[0];
    }
  }
  return result;
}

function checkTitleForCitation(headTitle, result) {
  if (headTitle.textContent.includes("Archives of Maryland, Volume")) {
    result.success = true;
    return result;
  }
  let parts = headTitle.textContent.split(",");
  if (parts.length > 0) {
    for (i=0; i<parts.length; i++) {
      part = parts[i].trim();
      //if (part.includes("Archives of Maryland")) {
      //  console.log(" IS The Part: " + part);
      //  result.success = true;
      //}
      if (isMsaCitation(part)) {
        result.msaCitation = part;
        result.success = true; 
        return result; 
      }
    }
  }
  return null;
}

function searchDomNodes(document, result) {
  result.msaDomNodes = [];
  let n = 0;
  const root = document.getRootNode();
  //const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const walker = document.createTreeWalker(root, 4, null);
  let currentNode;
  while(( currentNode = walker.nextNode())) {
    let txt = currentNode.wholeText.trim();
    // heuristics, drop empty txt and scripts 
    if ((txt.length > 3) && (txt.length < 100) && (result.msaDomNodes.length < 100)) {
      if (txt.match(/^\d+$/)) {
        ;
      } else {
        result.msaDomNodes.push(txt);
      }
    } 
    if (!result.msaCitation) {
      let citation = searchDOMNode(currentNode.wholeText);
      if (citation) {
        result.msaCitation = citation;
      }
    }
    if (result.msaDomNodes.length >= 100) {
      break;
    }
    n++;
  }
}

function extractData(document, url) {
  console.log("MSA extractData DOM: ");
  console.log(document);
  //console.log("URL: " + url);
  //console.log(url);
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;
  const headTitle = document.querySelector("head > title");
  if (headTitle) {
    result.msaRawHeadTitle = headTitle.textContent;
    checkTitleForCitation(headTitle, result);
  }
  if(!result.msaCitation) {
    // sometimes the .pdf filename is the MSA citation
    let maybeCitation = isMsaFilenameCitation(url.split('/').pop());
    if (maybeCitation) {
    console.log("Got Citation yet, searching Filename: " + maybeCitation);
      result.msaCitation = "MSA " + maybeCitation;
      result.success = true;
    }
  }
  if(!result.msaCitation) {
    console.log("Still No Citation yet, searching DOM");
    const body = document.querySelector('body');
    result.msaDomNodes = [];
    searchDomNodes(document, result);
    // try to dig out the page # from the html
    //  -- currently in in the (div id="optionsViewer") "option selected="selected"
    const optionNodes = document.querySelectorAll('div[id=\"optionsViewer\"] select option[selected=\"selected\"]');
    for (const onode of optionNodes) {
      if (onode.value.match(/\d{1,5}/)) {
        result.msaPageViewerPage = onode.value;
        //console.log("ONode Len: " + onode.outerHTML + " " +  result.msaPageViewerPage);
      }
    }

    if (result.msaCitation) {
      result.success = true;
      console.log(" Found citation " + result.msaCitation)
    }
  }

  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
