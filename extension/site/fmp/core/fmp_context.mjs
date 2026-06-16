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

function transformLink(linkText, phase, options) {
  // linkUrl: "https://search.findmypast.co.uk/record/browse?id=GBC/1881/4362252/00449&parentid=GBC/1881/0023259406"

  if (phase != 1) {
    return "";
  }

  if (!link.includes("findmypast")) {
    return "";
  }

  let link = linkText;

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
        return newLink;
      }
    }
  }

  return "";
}

export { transformLink };
