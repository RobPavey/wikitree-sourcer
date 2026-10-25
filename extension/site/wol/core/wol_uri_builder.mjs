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

// The libraries of the Watchtower Online Library. Each language has its own library, with its own path, e.g.
// https://wol.jw.org/en/wol/s/r1/lp-e?q=%22max+liebster%22&p=par&r=occ&st=a
// https://wol.jw.org/de/wol/s/r10/lp-x?q=%22max+liebster%22&p=par&r=occ&st=a
// The "rsconf" and "lib" are not derivable from the language code. They are listed on https://wol.jw.org/en/wol/li/r1/lp-e
const libraries = {
  af: { rsconf: "r52", lib: "lp-af" },
  cs: { rsconf: "r29", lib: "lp-b" },
  da: { rsconf: "r9", lib: "lp-d" },
  de: { rsconf: "r10", lib: "lp-x" },
  el: { rsconf: "r11", lib: "lp-g" },
  en: { rsconf: "r1", lib: "lp-e" },
  es: { rsconf: "r4", lib: "lp-s" },
  fi: { rsconf: "r16", lib: "lp-fi" },
  fr: { rsconf: "r30", lib: "lp-f" },
  hu: { rsconf: "r17", lib: "lp-h" },
  it: { rsconf: "r6", lib: "lp-i" },
  ja: { rsconf: "r7", lib: "lp-j" },
  ko: { rsconf: "r8", lib: "lp-ko" },
  nl: { rsconf: "r18", lib: "lp-o" },
  no: { rsconf: "r3", lib: "lp-n" },
  pl: { rsconf: "r12", lib: "lp-p" },
  pt: { rsconf: "r5", lib: "lp-t" },
  ro: { rsconf: "r34", lib: "lp-m" },
  ru: { rsconf: "r2", lib: "lp-u" },
  sv: { rsconf: "r14", lib: "lp-z" },
  uk: { rsconf: "r15", lib: "lp-k" },
};

class WolUriBuilder {
  constructor(language) {
    let locale = libraries[language] ? language : "en";
    const library = libraries[locale];
    this.uri = "https://wol.jw.org/" + locale + "/wol/s/" + library.rsconf + "/" + library.lib;
    this.searchTermAdded = false;
  }

  addSearchParameter(parameter, value) {
    if (value == undefined || value == "") {
      return;
    }

    const encodedValue = encodeURIComponent(value).replace(/%20/g, "+");

    if (!this.searchTermAdded) {
      this.uri = this.uri.concat("?", parameter, "=", encodedValue);
      this.searchTermAdded = true;
    } else {
      this.uri = this.uri.concat("&", parameter, "=", encodedValue);
    }
  }

  // The query. The library treats text inside double quotes as an exact phrase and "|" as OR,
  // e.g. "max liebster" | "max liebster-smith"
  addQuery(string) {
    this.addSearchParameter("q", string);
  }

  // Where the words of the query have to be: "sen" the same sentence, "par" the same paragraph, "doc" the same article
  addProximity(string) {
    this.addSearchParameter("p", string);
  }

  // How the results are sorted: "occ" most occurrences, "newest" or "oldest"
  addSort(string) {
    this.addSearchParameter("r", string);
  }

  // The search scope. "a" is all publications.
  addScope(string) {
    this.addSearchParameter("st", string);
  }

  getUri() {
    return this.uri;
  }
}

export { WolUriBuilder, libraries };
