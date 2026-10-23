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
  let result = string.match(msa_header_citation);
  console.log("isMsaCitation: " + string + " " + result);
  return result;
}
function isMsaFilenameCitation(string) {
  const mdsa_filename_citation = /^mdsa_([A-Za-z0-9\-_]{3,12})\.(:?pdf|html)$/;  // mdsa_AA1234-5.pdf
  const other_filename_citation = /^([a-z]{2,4}[0-9\-_]{3,12})\.(:?pdf|html)$/;  // sc1234-5678-9.html
  let match = string.match(mdsa_filename_citation);
  let result = null;
  if (match) {
    //console.log("isMsaFilenameCitation: hasMatch");
    if (match[1]) {
      //console.log("isMsaFilenameCitation: hasGroups");
      result = match[1].replace("_", "-").toUpperCase();
    } 
  } else if (match = string.match(other_filename_citation)) {
    if (match[1]) {
      result = "MSA " + match[1].toUpperCase();
    }
  }
  //console.log("isMsaFilenameCitation: " + string + " " + result);
  return result;
}
function searchDOMNode(domNodeText) {
  const msa_citation_a = ".*(MSA [A-Z]{2,4}[0-9]{2,6}\-[0-9]{1,4}).*";
  const msa_citation_b = "^MSA [A-Z0-9\-]{3,12}$";  // MSA 1234-56
  let result = domNodeText.match(msa_citation_a);
  if (result) {
    console.log("searchDOMNode: " + " " + result[1]);
    return result[1];
  } else
  if (!result) {
    result = domNodeText.match(msa_citation_b);
    if (result) 
      console.log("searchDOMNode: " + node + " " + result[1]);
  }
  //console.log("searchDOMNode: " + node + " " + result);
  return result;
}
function searchDOMNodeForPage(domNodeText) {
  // const msa_page_num = ".*\<option selected=\"selected\" value=\"([0-9]{1,5})\>.*"
  const msa_page_num = ".*option selected.*";
  let result = domNodeText.match(msa_page_num);
  //console.log("searchDOMNodeForPage: " + result);
  if (result) {
    console.log("searchDOMNodeForPage: " + " " + result[1]);
    return result[1];
  }
  //console.log("searchDOMNode: " + node + " " + result);
  return result;
}

function searchDOMNodeForRecordType(text, result) {
  //console.log("LookforRT: " + text);
  if (text.indexOf("(Biographical Series)") != -1) {
    //result.msaRecordType = RT.Biography;
  }
}

function parseHtmlHeader (headTitle, result) {
  // Archives.., Volume  0002, Page 1234 - Title
  if ( htmlHdrTxt.match(/Archives of Maryland,\s+Volume\s+\d{1,7},\s+Page\s+\d{1,9}\s+\-.*/)) {
    //result.msaHeadTitle = htmlHdrTxt;
    console.log("parseHtmlHeader 2: " + htmlHdrTxt);
    let dashParts = headTitle.textContent.split("-");
    if (dashParts.length > 1) {
      result.msaTitle += dashParts[2];
    }
  }
}

function checkTitleForCitation(headTitle, result) {
  let parts = headTitle.textContent.split(",");
  if (parts.length > 0) {
    for (i=0; i<parts.length; i++) {
      part = parts[i].trim();
      if (isMsaCitation(part)) {
        result.msaCitation = part;
        return result; 
      }
    }
  }
  return null;
}

function extractData(document, url) {
  //let result = { url: url, success: false };
  console.log("MSA extractData DOC");
  console.log(document);
  //console.log("MSA extractData URL");
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
    //parseHtmlHeader(headTitle.textContent, result); 
  }
  if(!result.msaCitation) {     
    console.log("No Citation yet");
    // No Citation yet, sometimes the .pdf filename is the MSA citation
    let maybeCitation = isMsaFilenameCitation(url.split('/').pop());
    if (maybeCitation) {
      console.log("MSA extractData filename : " + maybeCitation);
      result.msaCitation = maybeCitation;
    }
  }
  if(!result.msaCitation) {
    console.log("Still No Citation yet, searching DOM");
    let n =0;
    const root = document.getRootNode();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let currentNode;
    while(( currentNode = walker.nextNode())) {
      if (!result.msaCitation) {
        let citation = searchDOMNode(currentNode.wholeText);
        if (citation) {
  	    result.msaCitation = citation;
        }
      }
      if (!result.msaPageNum) {
        let page = searchDOMNodeForPage(currentNode.wholeText);
        if (page) {
	  result.msaPage = page;
          console.log(" Found Page " + result.msaPage);
        }
      }
      if (!result.msaRecordType) {
        let rt = searchDOMNodeForRecordType(currentNode.wholeText);
      }
      n++;
    }
  console.log(" checked " + n + " nodes");
  if (result.msaCitation) {
    console.log(" Found citation " + result.msaCitation)
  }
  }

  result.success = true;
  return result;
}

// No exports allowed. See docs/dev_notes/extract_data_design
