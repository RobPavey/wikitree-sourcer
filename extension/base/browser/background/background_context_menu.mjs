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

import { callFunctionWithStoredOptions } from "../options/options_loader.mjs";

function openAncestryLink(link, options) {
  //console.log("openAncestryLink, link is: " + link);
  if (link.startsWith("https://click.linksynergy")) {
    // NOTE: Ancestry switched from Partnerize to Rakuten on 18 Apr 2023. Partnerize used the
    // "prf.hn" format, Rakuten uses this new click.linksynergy format.
    // And example link in this format:
    // https://click.linksynergy.com/deeplink?id=Xib7NfnK11s&amp;mid=50138&amp;murl=https%3A%2F%2Fsearch.ancestry.com%2Fcgi-bin%2Fsse.dll%3Findiv%3D1%26db%3D61596%26h%3D8900762
    let linkStartText = "https%3A%2F%2Fsearch.ancestry";
    let realLinkIndex = link.indexOf(linkStartText);
    if (realLinkIndex == -1) {
      linkStartText = "https%3A%2F%2Fwww.ancestry";
      realLinkIndex = link.indexOf(linkStartText);
    }
    //console.log("openAncestryLink, realLinkIndex is: " + realLinkIndex);
    if (realLinkIndex != -1) {
      let domainEndIndex = link.indexOf("%2F", realLinkIndex + linkStartText.length);
      if (domainEndIndex != -1) {
        let linkStart = link.substring(realLinkIndex, domainEndIndex);
        // linkStart = https%3A%2F%2Fsearch.ancestry.com for example
        let ancestryStartIndex = linkStart.indexOf("ancestry");
        if (ancestryStartIndex != -1) {
          let domain = linkStart.substring(ancestryStartIndex);
          //console.log("openAncestryLink, domain is: " + domain);

          let desiredDomain = options.search_ancestry_domain;
          //console.log("openAncestryLink, desiredDomain is: " + desiredDomain);

          if (desiredDomain != "none" && desiredDomain != domain) {
            // we want to change the link, first decide if we are changing to a domain supported by
            // the Rakuten links
            const rukutenSupportedDomains = [
              { domain: "ancestry.com", mid: "50138" },
              { domain: "ancestry.co.uk", mid: "50140" },
              { domain: "ancestry.ca", mid: "50139" },
              { domain: "ancestry.com.au", mid: "50142" },
            ];
            let mid = "";
            for (let entry of rukutenSupportedDomains) {
              if (entry.domain == desiredDomain) {
                mid = entry.mid;
                break;
              }
            }
            if (mid) {
              // it is a supported domain to modify the mid and domain in link
              let newLink = link.replace(domain, desiredDomain);
              if (newLink && newLink != link) {
                link = newLink;
                //console.log("openAncestryLink, new link is: " + newLink);
              }
              newLink = link.replace(/([&;])mid=\d+/, "$1mid=" + mid);
              if (newLink && newLink != link) {
                link = newLink;
                //console.log("openAncestryLink, new link is: " + newLink);
              }
            } else {
              // not one of the supported domains - change to a non-referral link
              let encodedPlainLink = link.substring(realLinkIndex);
              //console.log("openAncestryLink, encodedPlainLink is: " + encodedPlainLink);
              let plainLink = decodeURIComponent(encodedPlainLink);
              //console.log("openAncestryLink, plainLink is: " + plainLink);
              let newLink = plainLink.replace(domain, desiredDomain);
              if (newLink && newLink != plainLink) {
                link = newLink;
                //console.log("openAncestryLink, new link is: " + newLink);
              }
            }
          }
        }
      }
    }
  } else if (link.startsWith("https://ancestry.prf.hn/")) {
    // NOTE: Ancestry switched from Partnerize to Rakuten on 18 Apr 2023. Partnerize used the
    // "prf.hn" format. So this is no longer used.
    let linkStartText = "https://search.ancestry";
    let realLinkIndex = link.indexOf(linkStartText);
    if (realLinkIndex == -1) {
      linkStartText = "https://www.ancestry";
      realLinkIndex = link.indexOf(linkStartText);
    }
    //console.log("openAncestryLink, realLinkIndex is: " + realLinkIndex);
    if (realLinkIndex != -1) {
      let domainEndIndex = link.indexOf("/", realLinkIndex + linkStartText.length);
      if (domainEndIndex != -1) {
        let linkStart = link.substring(realLinkIndex, domainEndIndex);
        // linkStart = https://search.ancestry.com for example
        let ancestryStartIndex = linkStart.indexOf("ancestry");
        if (ancestryStartIndex != -1) {
          let domain = linkStart.substring(ancestryStartIndex);
          //console.log("openAncestryLink, domain is: " + domain);

          let desiredDomain = options.search_ancestry_domain;
          //console.log("openAncestryLink, desiredDomain is: " + desiredDomain);

          if (desiredDomain != "none" && desiredDomain != domain) {
            let newLink = link.replace(domain, desiredDomain);
            if (newLink && newLink != link) {
              link = newLink;
              //console.log("openAncestryLink, new link is: " + newLink);
            }
          }
        }
      }
    }
  } else {
    // could of form:
    // https://www.ancestry.co.uk/discoveryui-content/view/19270862:1623?tid=&pid=&queryId=126e8ebdb5f54d54f60534d57389787f&_phsrc=Vww4&_phstart=successSource
    // or:
    // https://search.ancestry.co.uk/cgi-bin/sse.dll?db=uki1861&indiv=try&h=19053031

    let domain = link.replace(/^https?\:\/\/[^\.]+\.(ancestry[^\/]+)\/.*/, "$1");
    //console.log("openAncestryLink, domain is: " + domain);
    if (domain && domain != link) {
      let desiredDomain = options.search_ancestry_domain;
      //console.log("openAncestryLink, desiredDomain is: " + desiredDomain);

      if (desiredDomain != "none" && desiredDomain != domain) {
        let newLink = link.replace(domain, desiredDomain);
        if (newLink && newLink != link) {
          link = newLink;
          //console.log("openAncestryLink, new link is: " + newLink);
        }
      }
    }
  }

  chrome.tabs.create({ url: link });
}

function openFmpLink(link, options) {
  let domain = "";
  // FMP can be accessed through NLS
  // https://www-findmypast-co-uk.nls.idm.oclc.org/transcript?id=R_693518389
  const nlsDomain = "www-findmypast-co-uk.nls.idm.oclc.org";
  if (link.includes("nls.idm.oclc.org")) {
    domain = nlsDomain;
  } else {
    domain = link.replace(/^https?\:\/\/[^\.]+\.(findmypast[^\/]+)\/.*/, "$1");
  }
  //console.log("openFmpLink, domain is: " + domain);
  if (domain && domain != link) {
    let desiredDomain = options.search_fmp_domain;
    //console.log("openFmpLink, desiredDomain is: " + desiredDomain);

    if (desiredDomain != "none" && desiredDomain != domain) {
      let newLink = "";
      if (domain == nlsDomain) {
        newLink = link.replace(domain, "www." + desiredDomain);
      } else {
        if (desiredDomain == nlsDomain) {
          newLink = link.replace("www." + domain, desiredDomain);
        } else {
          newLink = link.replace(domain, desiredDomain);
        }
      }

      if (newLink && newLink != link) {
        link = newLink;
        //console.log("openFmpLink, new link is: " + newLink);
      }
    }
  }

  chrome.tabs.create({ url: link });
}

function openLink(info) {
  // linkUrl: "https://search.findmypast.co.uk/record/browse?id=GBC/1881/4362252/00449&parentid=GBC/1881/0023259406"
  // linkUrl: "https://ancestry.prf.hn/click/camref:1011l4xx5/type:cpc/destination:https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=2352&h=1903048"

  // In preview mode:
  // linkUrl: "https://search.ancestry.co.uk/cgi-bin/sse.dll?indiv=1&db=7619&h=4576311"
  // when saved:
  // linkUrl: "https://ancestry.prf.hn/click/camref:1011l4JYM/type:cpc/destination:https://search.ancestry.co.uk/cgi-bin/sse.dll?indiv=1&db=7619&h=4576311"
  // In preview mode:
  // linkUrl: "https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=7619&h=4576311"
  // When saved:
  // linkUrl: "https://ancestry.prf.hn/click/camref:1011l4xx5/type:cpc/destination:https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=7619&h=4576311"

  let link = info.linkUrl;
  if (link) {
    //console.log("openLink, orig link is: " + link);

    if (link.includes("ancestry")) {
      callFunctionWithStoredOptions(function (options) {
        openAncestryLink(link, options);
      });
    } else if (link.includes("findmypast")) {
      callFunctionWithStoredOptions(function (options) {
        openFmpLink(link, options);
      });
    } else {
      // open unchanged link
      chrome.tabs.create({ url: link });
    }
  }
}

function openAncestryTemplate(text, options) {
  //console.log("openAncestryTemplate, text is: " + text);

  let desiredDomain = options.search_ancestry_domain;
  if (!desiredDomain || desiredDomain == "none") {
    desiredDomain = "ancestry.com";
  }

  let link = "";

  if (text.includes("Ancestry Record")) {
    // {{Ancestry Record|1989|219120}}
    let dbId = text.replace(/\{\{Ancestry Record\|([^|]+)\|[^}]+[^|}]*\}\}/, "$1");
    let recordId = text.replace(/\{\{Ancestry Record\|[^|]+\|([^|}]+)[^}]*\}\}/, "$1");
    if (dbId && dbId != text && recordId && recordId != text) {
      if (/^\d+$/.test(dbId)) {
        // This only works when the dbId is a number
        // https://www.ancestry.com/discoveryui-content/view/219120:1989
        link = "https://www." + desiredDomain + "/discoveryui-content/view/" + recordId + ":" + dbId;
      } else {
        // https://search.ancestry.com/cgi-bin/sse.dll?indiv=1&db=uki1851&h=9872118
        link = "https://search." + desiredDomain + "/cgi-bin/sse.dll?indiv=1&db=" + dbId + "&h=" + recordId;
      }
    }
  } else if (text.includes("Ancestry Image")) {
    // {{Ancestry Image|1234|5678}}
    let num1 = text.replace(/\{\{Ancestry Image\|([^|]+)\|[^|}]+[^}]*\}\}/, "$1");
    let num2 = text.replace(/\{\{Ancestry Image\|[^|]+\|([^|}]+)[^}]*\}\}/, "$1");
    if (num1 && num1 != text && num2 && num2 != text) {
      // https://www.ancestry.com/interactive/1234/5678
      link = "https://www." + desiredDomain + "/interactive/" + num1 + "/" + num2;
    }
  } else if (text.includes("Ancestry Sharing")) {
    // {{Ancestry Sharing|26032935|f25069}}
    // or
    // {{Ancestry Sharing|360708|45105e24a959143273cc624d7eeb616ab4e5002d2c58dca23a9a27d6088b2a7b}}
    let num1 = text.replace(/\{\{Ancestry Sharing\|([^|]+)\|[^}|]+[^}]*\}\}/, "$1");
    let num2 = text.replace(/\{\{Ancestry Sharing\|[^|]+\|([^}|]+)[^}]*\}\}/, "$1");
    if (num1 && num1 != text && num2 && num2 != text) {
      if (num2.length > 10) {
        // https://www.ancestry.com/sharing/360708?token=45105e24a959143273cc624d7eeb616ab4e5002d2c58dca23a9a27d6088b2a7b
        link = "https://www." + desiredDomain + "/sharing/" + num1 + "?token=" + num2;
      } else {
        // https://www.ancestry.com/sharing/26032935?h=f25069
        link = "https://www." + desiredDomain + "/sharing/" + num1 + "?h=" + num2;
      }
    }
  } else if (text.includes("Ancestry Tree Media")) {
    // {{Ancestry Tree Media|86808578|d69a7d6a-c773-48b1-ab09-19100cd55c14}}
    let num1 = text.replace(/\{\{Ancestry Tree Media\|([^|]+)\|[^}|]+[^}]*\}\}/, "$1");
    let num2 = text.replace(/\{\{Ancestry Tree Media\|[^|]+\|([^}|]+)[^}]*\}\}/, "$1");
    if (num1 && num1 != text && num2 && num2 != text) {
      // https://www.ancestry.com/family-tree/tree/86808578/media/d69a7d6a-c773-48b1-ab09-19100cd55c14
      link = "https://www." + desiredDomain + "/family-tree/tree/" + num1 + "/media/" + num2;
    }
  } else if (text.includes("Ancestry Tree")) {
    // {{Ancestry Tree|1234|5678}}
    let num1 = text.replace(/\{\{Ancestry Tree\|([^|]+)\|[^}|]+[^}]*\}\}/, "$1");
    let num2 = text.replace(/\{\{Ancestry Tree\|[^|]+\|([^}|]+)[^}]*\}\}/, "$1");
    if (num1 && num1 != text && num2 && num2 != text) {
      // https://www.ancestry.com/family-tree/person/tree/1234/person/19531917216/facts
      link = "https://www." + desiredDomain + "/family-tree/person/tree/" + num1 + "/person/" + num2 + "/facts";
    }
  }

  if (link) {
    chrome.tabs.create({ url: link });
  }
}

function openFamilySearchTemplate(text) {
  //console.log("openFamilySearchTemplate, text is: " + text);

  let link = "";

  if (text.includes("FamilySearch Record")) {
    // {{FamilySearch Record|XWLT-M8X}}
    let id = text.replace(/\{\{FamilySearch Record\|([^}|]+)[^}]*\}\}/, "$1");
    if (id && id != text) {
      // https://www.familysearch.org/ark:/61903/1:1:XHLN-69H
      link = "https://www.familysearch.org/ark:/61903/1:1:" + id;
    }
  } else if (text.includes("FamilySearch Image")) {
    // {{FamilySearch Image|33S7-9BSH-9W9B}}
    let id = text.replace(/\{\{FamilySearch Image\|([^}|]+)[^}]*\}\}/, "$1");
    if (id && id != text) {
      // https://www.familysearch.org/ark:/61903/3:1:33S7-9BSH-9W9B
      link = "https://www.familysearch.org/ark:/61903/3:1:" + id;
    }
  }

  if (link) {
    chrome.tabs.create({ url: link });
  }
}

function openFindAGraveTemplate(text) {
  //console.log("openFindAGraveTemplate, text is: " + text);

  let link = "";

  if (text.includes("FindAGrave")) {
    // {{FindAGrave| 158706349}}
    let id = text.replace(/\{\{FindAGrave\|([^}|]+)[^}]*\}\}/, "$1");
    if (id && id != text) {
      // https://www.findagrave.com/memorial/158706349
      link = "https://www.findagrave.com/memorial/" + id;
    }
  }

  if (link) {
    chrome.tabs.create({ url: link });
  }
}

function openTemplate(info) {
  let text = info.selectionText;

  //console.log("openTemplate, text is: " + text);

  let templateStartIndex = text.indexOf("{{");
  if (templateStartIndex == -1) return;

  let templateEndIndex = text.indexOf("}}", templateStartIndex);
  if (templateEndIndex == -1) return;

  text = text.substring(templateStartIndex, templateEndIndex + 2);

  //console.log("openTemplate, template is: " + text);

  if (text.includes("Ancestry")) {
    callFunctionWithStoredOptions(function (options) {
      openAncestryTemplate(text, options);
    });
  } else if (text.includes("FamilySearch")) {
    openFamilySearchTemplate(text);
  } else if (text.includes("FindAGrave")) {
    openFindAGraveTemplate(text);
  } else {
    // open unchanged link
    chrome.tabs.create({ url: text });
  }
}

function openSelectionText(info) {
  let text = info.selectionText;

  //console.log("openTemplate, text is: " + text);

  let templateStartIndex = text.indexOf("{{");
  if (templateStartIndex != -1) {
    openTemplate(info);
  }

  // not a template, could be a Wiki-Id
  if (/^\s*[^\-\[\]]+\-\d+\s*$/.test(text)) {
    // looks like a Wiki-Id.
    let wikiId = text.trim();

    // Want something line this: https://www.wikitree.com/wiki/Pavey-451
    let link = "https://www.wikitree.com/wiki/" + wikiId;

    chrome.tabs.create({ url: link });
  }
}

function contextClick(info, tab) {
  //console.log("contextTest, info is:");
  //console.log(info);

  //console.log("contextTest, tab is:");
  //console.log(tab);

  if (info.menuItemId == "openLink") {
    if (info.linkUrl) {
      openLink(info);
    } else if (info.selectionText) {
      openSelectionText(info);
    }
  }
}

function setupContextMenu() {
  //console.log("setupContextMenu");

  chrome.contextMenus.onClicked.addListener(contextClick);

  let title = "Sourcer: Open Link in New Tab";

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      title: title,
      contexts: ["link", "selection"],
      id: "openLink",
    });
  });
}

export { setupContextMenu };
