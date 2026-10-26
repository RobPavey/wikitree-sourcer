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

class GenquebecUriBuilder {
  constructor() {
    this.uri = "https://www.genealogiequebec.com/en/search";
    this.searchTermAdded = false;
    this.advanced = false;
  }

  addSearchParameter(parameter, value) {
    if (value == undefined || value === "") {
      return;
    }

    const encodedValue = encodeURIComponent(value);

    this.uri = this.uri.concat(this.searchTermAdded ? "&" : "?", parameter, "=", encodedValue);
    this.searchTermAdded = true;
  }

  addAdvancedParameter(parameter, value) {
    if (value == undefined || value === "") {
      return;
    }
    this.advanced = true;
    this.addSearchParameter(parameter, value);
  }

  addFirstName(string) {
    this.addSearchParameter("prenom", string);
  }

  addLastName(string) {
    this.addSearchParameter("nom", string);
  }

  // eventType is one of "birth", "marriage" or "death"
  addEventYear(eventType, year, range) {
    if (!year) {
      return;
    }
    this.addAdvancedParameter(eventType + "Year", year);
    // The site's default range is 2 and it is omitted from the URL when it is the default
    if (range != undefined && range !== "" && String(range) != "2") {
      this.addAdvancedParameter(eventType + "YearRange", range);
    }
  }

  addEventLocation(eventType, location) {
    this.addAdvancedParameter(eventType + "Location", location);
  }

  addFatherName(forenames, lastName) {
    this.addAdvancedParameter("fatherPrenom", forenames);
    this.addAdvancedParameter("fatherNom", lastName);
  }

  addMotherName(forenames, lastName) {
    this.addAdvancedParameter("motherPrenom", forenames);
    this.addAdvancedParameter("motherNom", lastName);
  }

  addSpouseName(forenames, lastName) {
    this.addAdvancedParameter("spousePrenom", forenames);
    this.addAdvancedParameter("spouseNom", lastName);
  }

  getUri() {
    if (this.advanced) {
      return this.uri.concat("&isAdvancedSearch=true");
    }
    return this.uri;
  }
}

export { GenquebecUriBuilder };
