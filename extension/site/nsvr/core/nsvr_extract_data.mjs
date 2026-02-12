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

  // find the h5 element, which contains the event text - there is only one on the page
  const h5Element = document.getElementsByTagName("h5")[0];
  var re = new RegExp(String.fromCharCode(160), "g");
  if (h5Element) {
    let eventText = h5Element.textContent.replace(re, " ").trim();

    // find the p element immediately following the h5 element, which contains the citation text
    let citePara = h5Element.nextElementSibling;
    let citeText = "";
    if (citePara && citePara.tagName == "P") {
      citeText = citePara.textContent.replace(re, " ").trim();
    }

    // parse the citation text
    if (citeText) {
      result.regYear = citeText.substring(citeText.indexOf("Year:") + 6, citeText.indexOf("Year:") + 10).trim();
      // some records do not have a book or page reference, only year and number
      if (citeText.includes("book")) {
        result.regBook = citeText.substring(citeText.indexOf("book:") + 6, citeText.indexOf("page:")).trim();
      }
      if (citeText.includes("page")) {
        result.regPage = citeText.substring(citeText.indexOf("page:") + 6, citeText.indexOf("number:")).trim();
      }
      result.regNumber = citeText.substring(citeText.indexOf("number:") + 8).trim();
    }

    // parse the event text
    if (eventText) {
      let eventLoc;
      const birthStr = "birth";
      const marriageStr = "married";
      const deathStr = "death";
      if (eventText.includes(birthStr)) {
        // the current birth record syntax is: [name] [birthStr] [location] [in/on] [date/year]
        result.eventType = "birth";

        if (!citeText && eventText.includes("birth number:")) {
          const re = /^birth number\:\s+(.+)$/;
          if (re.test(eventText)) {
            result.regNumber = eventText.replace(re, "$1");
          }
        } else {
          result.childName = eventText.substring(0, eventText.indexOf(birthStr)).trim();
          // some records contain an exact date, designated by "on" - others just have a year, designated by "in"
          // birth records omit the "at" designator for locations for some reason
          if (eventText.includes(" on ")) {
            eventLoc = eventText
              .substring(eventText.indexOf(birthStr) + birthStr.length + 1, eventText.indexOf(" on "))
              .trim();
            result.eventDate = eventText.substring(eventText.indexOf(" on ") + 4).trim();
          } else {
            eventLoc = eventText
              .substring(eventText.indexOf(birthStr) + birthStr.length + 1, eventText.indexOf(" in "))
              .trim();
            result.eventYear = eventText.substring(eventText.indexOf(" in ") + 4).trim();
          }
        }
      } else if (eventText.includes(marriageStr)) {
        // the current marriage record syntax is: [groom] and [bride] [marriageStr] [in/on] [date/year] at [location]
        result.eventType = "marriage";
        if (!citeText && eventText.includes("marriage number:")) {
          const re = /^marriage number\:\s+(.+)$/;
          if (re.test(eventText)) {
            result.regNumber = eventText.replace(re, "$1");
          }
        } else {
          result.groomName = eventText.substring(0, eventText.indexOf(" and ")).trim();
          result.brideName = eventText.substring(eventText.indexOf(" and ") + 5, eventText.indexOf(marriageStr)).trim();
          // some records contain an exact date, designated by "on" - others just have a year, designated by "in"
          if (eventText.includes(" on ")) {
            result.eventDate = eventText.substring(eventText.indexOf(" on ") + 4, eventText.indexOf(" at ")).trim();
          } else {
            result.eventYear = eventText.substring(eventText.indexOf(" in ") + 4, eventText.indexOf(" in ") + 8).trim();
          }
          eventLoc = eventText.substring(eventText.indexOf(" at ") + 4).trim();
        }
      } else if (eventText.includes(deathStr)) {
        // the current death record syntax is: [name] [deathStr] at [location] [in/on] [date/year]
        result.eventType = "death";

        if (!citeText && eventText.includes("death number:")) {
          const re = /^death number\:\s+(.+)$/;
          if (re.test(eventText)) {
            result.regNumber = eventText.replace(re, "$1");
          }
        } else {
          result.deceasedName = eventText.substring(0, eventText.indexOf(deathStr)).trim();
          // some records contain an exact date, designated by "on" - others just have a year, designated by "in"
          if (eventText.includes(" on ")) {
            eventLoc = eventText.substring(eventText.indexOf(" at ") + 4, eventText.indexOf(" on ")).trim();
            result.eventDate = eventText.substring(eventText.indexOf(" on ") + 4).trim();
          } else {
            eventLoc = eventText.substring(eventText.indexOf(" at ") + 4, eventText.indexOf(" in ")).trim();
            result.eventYear = eventText.substring(eventText.indexOf(" in ") + 4).trim();
          }
        }
      }

      // parse the event location
      // WikiTree location suggestions omit "County" from county names
      if (eventLoc) {
        if (eventLoc.includes(", ")) {
          result.town = eventLoc.substring(0, eventLoc.indexOf(", ")).trim();
          result.county = eventLoc
            .substring(eventLoc.indexOf(", ") + 2)
            .replace(" County", "")
            .trim();
        } else {
          result.county = eventLoc.replace(" County", "").trim();
        }
      }
    }
  }

  result.success = true;

  //console.log(result);

  return result;
}

export { extractData };
