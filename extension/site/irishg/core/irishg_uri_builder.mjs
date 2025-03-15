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

// An example search:
// https://churchrecords.irishgenealogy.ie/churchrecords/search.jsp?namefm=mary&namel=malone&location=&yyfrom=&yyto=&submit=Search
// https://civilrecords.irishgenealogy.ie/churchrecords/civil-perform-search.jsp?namefm=John&namel=Smith&location=Dublin&yyfrom=1850&yyto=1890&submit=Search

// https://civilrecords.irishgenealogy.ie/churchrecords/civil-perform-search.jsp?namefm=John&namel=O%27Connor&location=&yyfrom=&yyto=&submit=Search&sort=&pageSize=&century=&decade=&exact=&ddBfrom=&ddMfrom=&ddDfrom=&ddPfrom=&mmBfrom=&mmMfrom=&mmDfrom=&mmPfrom=&yyBfrom=&yyMfrom=&yyDfrom=&yyPfrom=&ddBto=&ddMto=&ddDto=&ddPto=&mmBto=&mmMto=&mmDto=&mmPto=&yyBto=&yyMto=&yyDto=&yyPto=&locationB=&locationM=&locationD=&locationP=&keywordb=&keywordm=&keywordd=&keywordp=&event=&district=
// https://civilrecords.irishgenealogy.ie/churchrecords/civil-perform-search.jsp?namel=O%27Connor&namefm=John

// Basic search for Civil Record, births. With Name, place and dates:
// https://civilrecords.irishgenealogy.ie/churchrecords/civil-perform-search.jsp
//   ?namefm=Mary&namel=O%27Donnel&location=Donegal&yyfrom=1866&yyto=1868
//   &type=B&submit=Search

// https://civilrecords.irishgenealogy.ie/churchrecords/civil-perform-search.jsp
// ?namefm=Mary&namel=O%27Donnel&location=&yyfrom=1867&yyto=1929
// &type=B&submit=Search
// &sort=&pageSize=100&century=&decade=&exact=
// &ddBfrom=&ddMfrom=&ddDfrom=&ddPfrom=
// &mmBfrom=&mmMfrom=&mmDfrom=&mmPfrom=
// &yyBfrom=&yyMfrom=&yyDfrom=&yyPfrom=
// &ddBto=&ddMto=&ddDto=&ddPto=
// &mmBto=&mmMto=&mmDto=&mmPto=
// &yyBto=&yyMto=&yyDto=&yyPto=
// &locationB=&locationM=&locationD=&locationP=
// &keywordb=&keywordm=&keywordd=&keywordp=&event=&district=
//
// Church records, advanced search with all options:
// https://churchrecords.irishgenealogy.ie/churchrecords/search.jsp
// ?namefm=John&namel=Smith&exact=true
// &type=B&ddBfrom=1&mmBfrom=2&yyBfrom=1803&ddBto=4&mmBto=5&yyBto=1806&locationB=Dublin
// &type=M&ddMfrom=7&mmMfrom=8&yyMfrom=1809&ddMto=10&mmMto=11&yyMto=1812&locationM=Cork
// &type=D&ddDfrom=13&mmDfrom=1&yyDfrom=1814&ddDto=15&mmDto=2&yyDto=1816&locationD=Waterford
// &member0=s&namef0=Ruby&namel0=Taylor
// &keyword=My+key+words
// &submit=Search

// You can specify multiple other people on Church Records advanced search even though the UI doesn't allow it:
// https://churchrecords.irishgenealogy.ie/churchrecords/search.jsp
// ?namefm=John+Alfred&namel=Smith
// &type=B&ddBfrom=&mmBfrom=10&yyBfrom=1880&ddBto=&mmBto=12&yyBto=1880&locationB=
// &ddMfrom=&mmMfrom=&yyMfrom=&ddMto=&mmMto=&yyMto=&locationM=
// &ddDfrom=&mmDfrom=&yyDfrom=&ddDto=&mmDto=&yyDto=&locationD=
// &member0=p&namef0=John&namel0=Smith
// &member1=p&namef1=Catherine&namel0=Carroll
// &keyword=&submit=Search

// 2025 site redesign of IrishGenealogy:
//
// https://www.irishgenealogy.ie/search/
// ?church-or-civil=all&firstname=Mary&lastname=Slade
// &location=Belfast&yearStart=1880&yearEnd=1890
// &event-birth=1&_day=&month=&mothers-surname=&age-at-death=&relation-0=
//
// https://www.irishgenealogy.ie/search/
// ?church-or-civil=civil&firstname=John&lastname=Walters
// &location=Dublin&yearStart=1860&yearEnd=1870
// &event-birth=1&event-death=1&_day=&month=&mothers-surname=&age-at-death=&relation-0=

// https://www.irishgenealogy.ie/search/
// ?church-or-civil=church&firstname=John&lastname=Walters
// &location=Dublin&yearStart=1860&yearEnd=1870&event-marriage=1&_day=&month=
// &mothers-surname=&age-at-death=&relation-0=witness&relation-first-0=Fred&relation-last-0=Smith

// https://www.irishgenealogy.ie/search/?church-or-civil=all
// &firstname=Mary&lastname=Pavey&location=Belfast&yearStart=1880&yearEnd=1890
// &event-marriage=1&_day=&month=&mothers-surname=&age-at-death=
// &relation-0=spouse&relation-first-0=Fred&relation-last-0=Smith
// &relation-1=parent&relation-first-1=John&relation-last-1=Wilson

// https://www.irishgenealogy.ie/search/?church-or-civil=civil&firstname=Margaret&lastname=Kearney&event-marriage=1&yearStart=1907&yearEnd=1908&relation-0=spouse&relation-first-0=John&relation-last-0=Long&submit=Search
// https://www.irishgenealogy.ie/search/?church-or-civil=civil&firstname=Margaret&lastname=Kearney&location=&yearStart=1907&yearEnd=1908&event-marriage=1&_day=&month=&mothers-surname=&age-at-death=&relation-0=spouse&relation-first-0=John&relation-last-0=Long

class IrishgUriBuilder {
  constructor(churchOrCivil) {
    this.uri = "https://www.irishgenealogy.ie/search/?church-or-civil=" + churchOrCivil;
    this.searchTermAdded = true;
    this.membersAdded = 0;
  }

  addSearchTerm(string) {
    if (string == undefined || string == "") {
      return;
    }
    if (!this.searchTermAdded) {
      this.uri = this.uri.concat("?", string);
      this.searchTermAdded = true;
    } else {
      this.uri = this.uri.concat("&", string);
    }
  }

  addSearchParameter(parameter, value) {
    if (value == undefined || value == "") {
      return;
    }

    const encodedValue = encodeURIComponent(value);

    if (!this.searchTermAdded) {
      this.uri = this.uri.concat("?", parameter, "=", encodedValue);
      this.searchTermAdded = true;
    } else {
      this.uri = this.uri.concat("&", parameter, "=", encodedValue);
    }
  }

  addSurname(string) {
    this.addSearchParameter("lastname", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addGivenNames(string) {
    this.addSearchParameter("firstname", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addLocation(string) {
    this.addSearchParameter("location", StringUtils.removeExtendedAsciiCharacters(string));
  }

  addLocation(string) {
    this.addSearchParameter("location", string);
  }

  addStartYear(string) {
    this.addSearchParameter("yearStart", string);
  }

  addEndYear(string) {
    this.addSearchParameter("yearEnd", string);
  }

  addType(string) {
    const mapString = {
      births: "event-birth",
      deaths: "event-death",
      marriages: "event-marriage",
      baptism: "event-baptisms",
      burials: "event-burials",
    };

    let paramName = mapString[string];
    if (paramName) {
      this.addSearchParameter(paramName, "1");
    }
  }

  addMothersMaidenName(string) {
    this.addSearchParameter("mothers-surname", string);
  }

  addSpouseKeywords(string) {
    this.addSearchParameter("keywordm", string);
  }

  addAgeAtDeath(string) {
    this.addSearchParameter("age-at-death", string);
  }

  addOtherPerson(relation, forenames, lastName) {
    if (forenames || lastName) {
      this.addSearchParameter("relation-" + this.membersAdded, relation);
      this.addSearchParameter("relation-first-" + this.membersAdded, forenames);
      this.addSearchParameter("relation-last-" + this.membersAdded, lastName);
      this.membersAdded++;
    }
  }

  getUri() {
    return this.uri;
  }
}

export { IrishgUriBuilder };
