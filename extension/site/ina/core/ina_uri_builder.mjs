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

// Example search URL (the site also adds a long "e=" parameter holding display settings, which is not needed):
// https://irishnewsarchive.com/?a=q&hs=1&r=1&results=1&txq=%22John+Power%22&yefq=1850&yetq=1920&sf=byDA
//   txq        search text. Supports "exact phrase", "near words"~N, OR and NOT
//   yefq/yetq  from/to year
//   sf         sort order: blank = relevance, byDA = oldest first, byDA.rev = newest first

class InaUriBuilder {
  constructor() {
    this.uri = "https://irishnewsarchive.com/?a=q&hs=1&r=1&results=1";
  }

  addSearchParameter(parameter, value) {
    if (value == undefined || value === "") {
      return;
    }
    this.uri += "&" + parameter + "=" + encodeURIComponent(value).replace(/%20/g, "+");
  }

  addSearchText(text) {
    this.addSearchParameter("txq", text);
  }

  addStartYear(year) {
    this.addSearchParameter("yefq", year);
  }

  addEndYear(year) {
    this.addSearchParameter("yetq", year);
  }

  addSortOrder(sortOrder) {
    if (sortOrder == "oldest") {
      this.addSearchParameter("sf", "byDA");
    } else if (sortOrder == "newest") {
      this.addSearchParameter("sf", "byDA.rev");
    }
  }

  getUri() {
    return this.uri;
  }
}

export { InaUriBuilder };
