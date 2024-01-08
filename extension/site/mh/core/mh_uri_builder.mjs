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

import { StringUtils } from "../../../base/core/string_utils.mjs";

// Example search for last name "Smith"
// https://www.myheritage.com/research?s=1&formId=master&formMode=1&useTranslation=1&exactSearch=&p=1&action=query&view_mode=card&qname=Name+fnmo.1+ln.Smith+lnmsrs.false
// Refined to census & voter lists:
// https://www.myheritage.com/research/category-1000/census-voter-lists?action=query&formId=census&formMode=1&useTranslation=1&qname=Name+fnmo.1+ln.Smith+lnmsrs.false&view_mode=card&initialFormIds=master
// Further refined to U.K. & Ireland Census:
// https://www.myheritage.com/research/category-1200/uk-ireland-census?action=query&formId=census&formMode=1&useTranslation=1&qname=Name+fnmo.1+ln.Smith+lnmsrs.false&view_mode=card&initialFormIds=master,census
// Further refined to 1901 England & Wales Census:
// https://www.myheritage.com/research/collection-10156/1901-england-wales-census?action=query&formId=census-uk-2&formMode=1&useTranslation=1&view_mode=card&initialFormIds=master,census,census-uk-2&qname=Name+fnmo.1+ln.Smith+lnmsrs.false

// Refined to MyHeritage Family Trees:
// https://www.myheritage.com/research/collection-1/myheritage-family-trees?action=query&formId=trees&formMode=1&useTranslation=1&qname=Name+fnmo.1+ln.Smith+lnmsrs.false&view_mode=card&initialFormIds=master,census,census-uk-2,trees

// Most simplified search for "Smith" that works:
// https://www.myheritage.com/research?formId=master&action=query&qname=Name+fnmo.1+ln.Smith+lnmsrs.false

// formId changes for categories and collections

// Adding more details:
// https://www.myheritage.com/research?s=1&formId=master&formMode=1&useTranslation=1
//  &exactSearch=&p=1&action=query&view_mode=card
//  &qname=Name+fn.John%2F3William+fnmo.1+ln.Smith+lnmsrs.false
//  &qevents-event1=Event+et.birth+ey.1843
//  &qevents-any/1event_1=Event+et.any+ep.Plymouth%2C%2F3Devon%2C%2F3England+epmo.similar
//  &qevents=List

// Note the %2F3 occurrences, %2F is "/" but if URL is is changed to just %2f it searches for
// "John/William" but %2F3 seems to be what it uses instead of space which is normally %20 or +

// Adding more details to top level search:
// https://www.myheritage.com/research?s=1&formId=master&formMode=1&useTranslation=1
//  &exactSearch=&p=1&action=query&view_mode=card
//  &qname=Name+fn.John%2FWilliam+fnmo.1+ln.Smith+lnmsrs.false
//  &qevents-event1=Event+et.birth+ey.1843
//  &qevents-any/1event_1=Event+et.any+ep.Plymouth%2C%2F3Devon%2C%2F3England+epmo.similar
//  &qevents-any/1event_2=Event+et.death+ed.10+em.3+ey.1875+ep.London%2C%2F3England+epmo.similar
//  &qevents=List
//  &qrelatives-relative=Relative+rt.father+rn.*qrelative_relativeName
//  &qrelative_relativeName=Name+fn.Michael%2F3Fred+ln.Smith+lnmo.3
//  &qrelatives-addRelative_1=Relative+rt.mother+rn.*qaddRelative_1_addRelativeName
//  &qaddRelative_1_addRelativeName=Name+fn.Jane+ln.Jones+lnmsrs.false
//  &qrelatives-addRelative_2=Relative+rt.spouse+rn.*qaddRelative_2_addRelativeName
//  &qaddRelative_2_addRelativeName=Name+fn.Ann+ln.Taylor+lnmsrs.false
//  &qrelatives=List
//
// Father name was specifies as exact which seems to be: +lnmo.3
// Other names were not which seems to be: +lnmsrs.false

// Specified gender and it just adds "+g.M" to name part
// https://www.myheritage.com/research?s=1&formId=master&formMode=1&useTranslation=1
//  &exactSearch=&p=1&action=query&view_mode=card
//  &qname=Name+fn.John%2FWilliam+fnmo.1+ln.Smith+lnmsrs.false+g.M

// Added marriage:
//  &qevents-any/1event_2=Event+et.death+ed.10+em.3+ey.1875+ep.London%2C%2F3England+epmo.similar

// An example search from RootsSearch:
// https://www.myheritage.com/research?formId=master&formMode=1&action=query&catId=1
// &qname=Name+fn.Charles+ln.Kimberlin
// &qevents-event1=Event+et.birth+ey.1859+ep.Nether%2F3Whitacre,%2F3Warwickshire,%2F3England,%2F3United%2F3Kingdom+epmo.similar
// &qevents-any%2F1event_1=Event+et.death+ey.1954+ep.Highgate,%2F3Middlesex,%2F3England,%2F3United%2F3Kingdom+epmo.similar
// &qevents=List
// &qrelative_relativeName=Name+fn.Charles+ln.Kimberlin+lnmsrs.false
// &qrelatives-relative=Relative+rt.father+rn.*qrelative_relativeName
// &qaddRelative_1_addRelativeName=Name+fn.Emily+ln.Mason+lnmsrs.false
// &qrelatives-addRelative_1=Relative+rt.mother+rn.*qaddRelative_1_addRelativeName
// &qaddRelative_2_addRelativeName=Name+fn.Eliza+ln.Broadey+lnmsrs.false
// &qrelatives-addRelative_2=Relative+rt.spouse+rn.*qaddRelative_2_addRelativeName
// &qrelatives=List

// Failing one I generate:
// https://www.myheritage.com/research?s=1&formId=master&formMode=1&useTranslation=1&exactSearch=&p=1&action=query&view_mode=card&qname=Name+fn.Charles+fnmo.1+ln.Kimberlin+lnmsrs.false+g.M
// &qevents-event1=Event+et.birth+ey.1859
// &qevents-any/1event_1=Event+et.any+ep.Nether%2F3Whitacre%2C%2F3Warwickshire%2C%2F3England%2C%2F3United%2F3Kingdom+epmo.similar
// &qevents-event2=Event+et.death+ey.1954
// &qevents-any/2event_2=Event+et.any+ep.Highgate%2C%2F3Middlesex%2C%2F3England%2C%2F3United%2F3Kingdom+epmo.similar
// &qevents=List

// Produced by MH:
// https://www.myheritage.com/research?s=1&formId=master&formMode=1&useTranslation=1&exactSearch=&p=1&action=query&view_mode=card&qname=Name+fn.Charles+fnmo.1+ln.Kimberlin+lnmsrs.false+g.M
// &qevents-event1=Event+et.birth+ey.1859
// &qevents-any/1event_1=Event+et.any+ep.Whitacre+epmo.similar
// &qevents-any/1event_2=Event+et.death+ey.1954+ep.Highgate+epmo.similar
// &qevents=List

// https://www.myheritage.com/research?s=1&formId=master&formMode=1&useTranslation=1&exactSearch=&p=1&action=query&view_mode=card&qname=Name+fn.Charles+fnmo.1+ln.Kimberlin+lnmsrs.false+g.M
// &qevents-event1=Event+et.birth+ey.1859
// &qevents-any/1event_1=Event+et.any+ep.Whitacre+epmo.similar
// &qevents-any/1event_2=Event+et.death+ey.1954+ep.Highgate+epmo.similar
// &qevents-any/1event_3=Event+et.livedin+ey.1900+ep.London+epmo.similar
// &qevents=List

// Refined to US census:
// https://www.myheritage.com/research/
//  category-1100/us-census
//  ?s=1
//  &formId=census
//  &formMode=1&useTranslation=1&exactSearch=&action=query&view_mode=card&initialFormIds=master,census&p=1&qname=Name+fn.Charles+fnmo.1+ln.Kimberlin+lnmsrs.false+g.M&qbirth=Event+et.birth+ey.1859&qevents-event1=Event+et.any+ep.Nether%2F3Whitacre%2C%2F3Warwickshire%2C%2F3England%2C%2F3United%2F3Kingdom+epmo.similar&qevents-any/1event_1=Event+et.death+ey.1954+ep.Highgate%2C%2F3Middlesex%2C%2F3England%2C%2F3United%2F3Kingdom+epmo.similar&qevents=List&qrelatives-relative=Relative+rt.father+rn.*qrelative_relativeName&qrelative_relativeName=Name+fn.Charles&qrelatives-addRelative_1=Relative+rt.mother+rn.*qaddRelative_1_addRelativeName&qaddRelative_1_addRelativeName=Name+fn.Emily&qrelatives-addRelative_2=Relative+rt.spouse+rn.*qaddRelative_2_addRelativeName&qaddRelative_2_addRelativeName=Name+fn.Eliza%2F3Jane&qrelatives=List

// https://www.myheritage.com/research/category-15000/public-records
// https://www.myheritage.com/research/category-2000/birth-marriage-death
// https://www.myheritage.com/research/category-2020/marriage-divorce

function encodeNameString(nameString) {
  let result = StringUtils.removeExtendedAsciiCharacters(nameString);

  result = result.trim();
  result = result.replace(/\s+/g, "%2F3");
  return result;
}

class MhUriBuilder {
  constructor() {
    this.uri = "https://www.myheritage.com/research";
    this.searchTermAdded = false;
    this.eventCount = 0;
    this.relativeCount = 0;
  }

  setCategory(urlPart) {
    this.uri += "/" + urlPart;
  }

  addSearchTerm(string) {
    const stdQueryStart = "?s=1&formId=master&formMode=1&useTranslation=1&exactSearch=&p=1&action=query&view_mode=card";

    if (string == undefined || string == "") {
      return;
    }
    if (!this.searchTermAdded) {
      this.uri = this.uri.concat(stdQueryStart, "&", string);
      this.searchTermAdded = true;
    } else {
      this.uri = this.uri.concat("&", string);
    }
  }

  addSearchParameter(parameter, value) {
    const stdQueryStart = "?s=1&formId=master&formMode=1&useTranslation=1&exactSearch=&p=1&action=query&view_mode=card";

    if (value == undefined || value == "") {
      return;
    }

    if (!this.searchTermAdded) {
      this.uri = this.uri.concat(stdQueryStart, "&", parameter, "=", value);
      this.searchTermAdded = true;
    } else {
      this.uri = this.uri.concat("&", parameter, "=", value);
    }
  }

  addNameAndGender(forenames, lastName, gender) {
    let fn = "";
    let ln = "";
    if (forenames) {
      fn = encodeNameString(forenames);
    }

    if (lastName) {
      ln = encodeNameString(lastName);
    }

    let value = "Name+fn." + fn + "+fnmo.1+ln." + ln + "+lnmsrs.false";
    if (gender) {
      let genderLetter = gender[0].toUpperCase();
      value += "+g." + genderLetter;
    }

    this.addSearchParameter("qname", value);
  }

  addEvent(eventType, eventYear, eventPlace) {
    // &qevents-event1=Event+et.birth+ey.1860
    // &qevents-any/1event_1=Event+et.any+ep.Plymouth%2C%2F3Devon%2C%2F3England+epmo.similar

    // If no eventYear, it doesn't event say "birth" which is odd
    // &qevents-event1=Event+et.any+ep.Plymouth%2C%2F3Devon%2C%2F3England+epmo.similar
    // &qevents-event1=Event+et.any+ep.Plymouth+epmo.similar

    // If no eventPlace:
    // &qevents-event1=Event+et.birth+ey.1856

    // &qevents-event1=Event+et.birth+ey.1859&qevents-any/1event_1=Event+et.any+ep.Nether%2F3Whitacre%2C%2F3Warwickshire%2C%2F3England%2C%2F3United%2F3Kingdom+epmo.similar

    // https://www.myheritage.com/research?s=1&formId=master&formMode=1&useTranslation=1&exactSearch=&p=1&action=query&view_mode=card&qname=Name+fn.Charles+fnmo.1+ln.Kimberlin+lnmsrs.false+g.M
    // &qevents-event1=Event+et.birth+ey.1859
    // &qevents-any/1event_1=Event+et.any+ep.Whitacre+epmo.similar
    // &qevents-any/1event_2=Event+et.death+ey.1954+ep.Highgate+epmo.similar
    // &qevents-any/1event_3=Event+et.livedin+ey.1900+ep.London+epmo.similar
    // &qevents=List

    // https://www.myheritage.com/research?s=1&formId=master&formMode=1&useTranslation=1&exactSearch=&p=1&action=query&view_mode=card&qname=Name+fn.Charles+fnmo.1+ln.Kimberlin+lnmsrs.false+g.M
    // &qevents-event1=Event+et.any+ep.Plymouth+epmo.similar
    // &qevents-any/1event_1=Event+et.death+ep.Bristol+epmo.similar&qevents=List

    if (!eventType) {
      return;
    }

    let ey = "";
    let ep = "";
    if (eventYear) {
      ey = eventYear;
    }
    if (eventPlace) {
      ep = StringUtils.removeExtendedAsciiCharacters(eventPlace);
      ep = encodeURIComponent(ep);

      ep = ep.trim();
      ep = ep.replace(/%20/g, "%2F3");
      ep = ep.replace(/\./g, "%2F2");
    }

    if (ey || ep) {
      this.eventCount++;

      if (this.eventCount == 1) {
        let eyValue = "Event+et." + eventType + "+ey." + ey;
        let epValue = "Event+et.any+ep." + ep + "+epmo.similar";
        if (ey) {
          let value = "qevents-event" + this.eventCount + "=" + eyValue;
          this.addSearchTerm(value);
          if (ep) {
            value = "qevents-any/" + this.eventCount + "event_" + this.eventCount + "=";
            value += epValue;
            this.addSearchTerm(value);
          }
        } else if (ep) {
          let value = "qevents-event" + this.eventCount + "=" + epValue;
          this.addSearchTerm(value);
        }
      } else {
        let eyValue = "+ey." + ey;
        let epValue = "+ep." + ep + "+epmo.similar";
        let value = "qevents-any/1event_" + this.eventCount + "=Event+et." + eventType;
        if (ey) {
          value += eyValue;
        }
        if (ep) {
          value += epValue;
        }
        this.addSearchTerm(value);
      }
    }
  }

  addBirth(eventYear, eventPlace) {
    this.addEvent("birth", eventYear, eventPlace);
  }

  addDeath(eventYear, eventPlace) {
    this.addEvent("death", eventYear, eventPlace);
  }

  endEventList() {
    if (this.eventCount) {
      this.addSearchTerm("qevents=List");
    }
  }

  addRelative(relativeType, forenames, lastName) {
    //  &qrelatives-relative=Relative+rt.father+rn.*qrelative_relativeName
    //  &qrelative_relativeName=Name+fn.Michael%2F3Fred+ln.Smith+lnmo.3
    //  &qrelatives-addRelative_1=Relative+rt.mother+rn.*qaddRelative_1_addRelativeName
    //  &qaddRelative_1_addRelativeName=Name+fn.Jane+ln.Jones+lnmsrs.false
    //  &qrelatives-addRelative_2=Relative+rt.spouse+rn.*qaddRelative_2_addRelativeName
    //  &qaddRelative_2_addRelativeName=Name+fn.Ann+ln.Taylor+lnmsrs.false
    //  &qrelatives=List

    //  https://www.myheritage.com/research?s=1&formId=master&formMode=1&useTranslation=1&exactSearch=&p=1&action=query&view_mode=card&qname=Name+fn.Charles+fnmo.1+ln.Kimberlin+lnmsrs.false+g.M&qevents-event1=Event+et.birth+ey.1859&qevents-any/1event_1=Event+et.any+ep.Nether%2F3Whitacre%2C%2F3Warwickshire%2C%2F3England%2C%2F3United%2F3Kingdom+epmo.similar&qevents-any/1event_2=Event+et.death+ey.1954+ep.Highgate%2C%2F3Middlesex%2C%2F3England%2C%2F3United%2F3Kingdom+epmo.similar&qevents=List
    //  &qrelatives-relative=Relative+rt.father+rn.*qrelative_relativeName
    //  &qrelative_relativeName=Name+fn.Name+fn.Charles+lnmo.3
    //  &qrelatives-addRelative_1=Relative+rt.mother+rn.*qaddRelative_1_addRelativeName
    //  &qaddRelative_1_addRelativeName=Name+fn.Name+fn.Emily+lnmo.3
    //  &qrelatives-addRelative_1=Relative+rt.spouse+rn.*qaddRelative_1_addRelativeName
    //  &qaddRelative_1_addRelativeName=Name+fn.Name+fn.Eliza%2F3Jane+lnmo.3
    //  &qrelatives=List

    if (!(forenames || lastName)) {
      return;
    }

    let nameString = "Name";
    if (forenames) {
      let fn = encodeNameString(forenames);
      nameString += "+fn." + fn;
    }
    if (lastName) {
      let ln = encodeNameString(lastName);
      nameString += "+ln." + ln;
    }
    nameString += "+lnmo.3";

    this.relativeCount++;

    if (this.relativeCount == 1) {
      let term1 = "qrelatives-relative=Relative+rt." + relativeType + "+rn.*qrelative_relativeName";
      this.addSearchTerm(term1);
      let term2 = "qrelative_relativeName=Name+fn." + nameString;
      this.addSearchTerm(term2);
    } else {
      let term1 = "qrelatives-addRelative_" + this.relativeCount;
      term1 += "=Relative+rt." + relativeType;
      term1 += "+rn.*qaddRelative_" + this.relativeCount + "_addRelativeName";
      this.addSearchTerm(term1);
      let term2 = "qaddRelative_" + this.relativeCount + "_addRelativeName=Name+fn." + nameString;
      this.addSearchTerm(term2);
    }
  }

  addFather(forenames, lastName) {
    this.addRelative("father", forenames, lastName);
  }

  addMother(forenames, lastName) {
    this.addRelative("mother", forenames, lastName);
  }

  addSpouse(forenames, lastName) {
    this.addRelative("spouse", forenames, lastName);
  }

  endRelativeList() {
    if (this.relativeCount) {
      this.addSearchTerm("qrelatives=List");
    }
  }
  getUri() {
    return this.uri;
  }
}

export { MhUriBuilder };
