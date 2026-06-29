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

const StringUtils = {
  isWordAllUpperCase: function (string) {
    if (!string) {
      return false;
    }
    return string.toUpperCase() == string;
  },

  isWordAllLowerCase: function (string) {
    if (!string) {
      return false;
    }
    return string.toLowerCase() == string;
  },

  toInitialCapsEachWord: function (string, isName = false) {
    if (!string || string.length == 0) {
      return;
    }

    if (string.length == 1) {
      return string[0].toUpperCase();
    }

    string = string.toLowerCase().trim();

    var index = 0;
    do {
      string = string.substring(0, index) + string[index].toUpperCase() + string.substring(index + 1);
      index = string.indexOf(" ", index);
      if (index != -1) {
        index++;
      }
      // it might not be on a letter, move to next letter
      while (index < string.length && (string[index] < "a" || string[index] > "z")) {
        index++;
      }
    } while (index != -1 && index < string.length);

    // certain words should not be initial caps
    string = string.replace(/ In /g, " in ");
    string = string.replace(/ Of /g, " of ");
    string = string.replace(/ With /g, " with ");
    string = string.replace(/ At /g, " at ");
    string = string.replace(/ The /g, " the ");
    string = string.replace(/ And /g, " and ");

    // a letter after a . should be uppercase (e.g. "Surrey S.E.")
    string = string.replace(/(\.[a-z])/g, function (m) {
      return m.toUpperCase();
    });

    if (!isName) {
      string = string.replace(/ A /g, " a ");
    }

    return string;
  },

  changeAllCapsWordsToInitialCaps: function (string) {
    if (!string || string.length == 0) {
      return;
    }

    let newString = "";
    let words = string.split(" ");
    for (let word of words) {
      if (word.length > 0) {
        let newWord = word;
        if (word.length > 1) {
          let ucWord = word.toUpperCase();
          if (word == ucWord) {
            let lcWord = word.toLowerCase();
            newWord = ucWord[0] + lcWord.substring(1);
          }
        }

        if (newString) {
          newString += " ";
        }
        newString += newWord;
      }
    }

    return newString;
  },

  toInitialCaps: function (string) {
    if (string) {
      if (string.length > 1) {
        return string[0].toUpperCase() + string.substring(1).toLowerCase();
      } else {
        return string[0].toUpperCase();
      }
    } else {
      return "";
    }
  },

  removeExtendedAsciiCharacters: function (string) {
    const extendedAsciiArray = [
      ["Š", "S"],
      ["š", "s"],
      ["Ž", "Z"],
      ["ž", "z"],
      ["À", "A"],
      ["Á", "A"],
      ["Â", "A"],
      ["Ã", "A"],
      ["Ä", "A"],
      ["Å", "A"],
      ["Æ", "A"],
      ["Ç", "C"],
      ["È", "E"],
      ["É", "E"],
      ["Ê", "E"],
      ["Ë", "E"],
      ["Ì", "I"],
      ["Í", "I"],
      ["Î", "I"],
      ["Ï", "I"],
      ["Ñ", "N"],
      ["Ò", "O"],
      ["Ó", "O"],
      ["Ô", "O"],
      ["Õ", "O"],
      ["Ö", "O"],
      ["Ø", "O"],
      ["Ù", "U"],
      ["Ú", "U"],
      ["Û", "U"],
      ["Ü", "U"],
      ["Ý", "Y"],
      ["Þ", "B"],
      ["ß", "Ss"],
      ["à", "a"],
      ["á", "a"],
      ["â", "a"],
      ["ã", "a"],
      ["ä", "a"],
      ["å", "a"],
      ["æ", "a"],
      ["ç", "c"],
      ["è", "e"],
      ["é", "e"],
      ["ê", "e"],
      ["ë", "e"],
      ["ì", "i"],
      ["í", "i"],
      ["î", "i"],
      ["ï", "i"],
      ["ð", "o"],
      ["ñ", "n"],
      ["ò", "o"],
      ["ó", "o"],
      ["ô", "o"],
      ["õ", "o"],
      ["ö", "o"],
      ["ø", "o"],
      ["ù", "u"],
      ["ú", "u"],
      ["û", "u"],
      ["ý", "y"],
      ["þ", "b"],
      ["ÿ", "y"],
      ["’", "'"],
      ["”", '"'],
      ["“", '"'],
      ["●", "*"],
    ];
    if (string == undefined || string == "") {
      return "";
    }

    var replaceString = string;
    for (var i = 0; i < extendedAsciiArray.length; i++) {
      var extChar = extendedAsciiArray[i];
      const regex = new RegExp(extChar[0], "g");
      replaceString = replaceString.replace(regex, extChar[1]);
    }
    return replaceString;
  },

  getFirstWord: function (string) {
    if (string == undefined || string == null) {
      return string;
    }
    let spaceIndex = string.search(/\s/);
    if (spaceIndex == -1) {
      return string;
    }
    return string.substring(0, spaceIndex);
  },

  getLastWord: function (string) {
    if (string == undefined || string == null) {
      return string;
    }
    let lastSpaceIndex = string.lastIndexOf(" ");
    if (lastSpaceIndex == -1) {
      return string;
    }
    return string.substring(lastSpaceIndex + 1);
  },

  getSecondWord: function (string) {
    if (string == undefined || string == null) {
      return string;
    }
    let spaceIndex = string.search(/\s/);
    if (spaceIndex == -1) {
      return "";
    }

    let secondSpaceIndex = string.indexOf(" ", spaceIndex + 1);
    if (secondSpaceIndex == -1) {
      return string.substring(spaceIndex + 1);
    }

    return string.substring(spaceIndex + 1, secondSpaceIndex);
  },

  getMiddleWord: function (string) {
    // if there are 2 spaces or more, return the word between the first and second space
    if (string == undefined || string == null) {
      return string;
    }
    let spaceIndex = string.search(/\s/);
    if (spaceIndex == -1) {
      return "";
    }

    let secondSpaceIndex = string.indexOf(" ", spaceIndex + 1);
    if (secondSpaceIndex == -1) {
      return "";
    }

    return string.substring(spaceIndex + 1, secondSpaceIndex).trim();
  },

  getMiddleWords: function (string) {
    // if there are 2 spaces or more, return the word between the first and second space
    if (string == undefined || string == null) {
      return string;
    }
    let spaceIndex = string.search(/\s/);
    if (spaceIndex == -1) {
      return "";
    }

    let lastSpaceIndex = string.lastIndexOf(" ");
    if (lastSpaceIndex == -1 || lastSpaceIndex == spaceIndex) {
      return "";
    }

    return string.substring(spaceIndex + 1, lastSpaceIndex).trim();
  },

  getWordsAfterFirstWord: function (string) {
    if (string == undefined || string == null) {
      return string;
    }
    let spaceIndex = string.search(/\s/);
    if (spaceIndex == -1) {
      return undefined;
    }
    return string.substring(spaceIndex + 1);
  },

  getWordsBeforeLastWord: function (string) {
    if (string == undefined || string == null) {
      return string;
    }
    let lastSpaceIndex = string.lastIndexOf(" ");
    if (lastSpaceIndex == -1) {
      return undefined;
    }
    return string.substring(0, lastSpaceIndex);
  },

  countWords: function (string) {
    return string.trim().split(/\s+/).length;
  },

  getIndefiniteArticle: function (word) {
    if (!word || !word.length) {
      return "a"; // should never happen
    }

    function isVowel(letter) {
      const vowels = "aeiou";
      return vowels.includes(letter);
    }

    function matchSpecialCase(word) {
      // more could be added, see https://www.scribbr.com/commonly-confused-words/a-vs-an
      const specialCases = [
        { startsWith: "uni", useAn: false },
        { startsWith: "hour", useAn: true },
      ];

      for (let entry of specialCases) {
        if (entry.startsWith && word.startsWith(entry.startsWith)) {
          return entry;
        }
      }
    }

    function shouldUseAn(word) {
      let specialCase = matchSpecialCase(word);
      if (specialCase) {
        return specialCase.useAn;
      }

      let firstLetter = word[0];
      if (isVowel(firstLetter)) {
        return true;
      }
      return false;
    }

    if (shouldUseAn(word)) {
      return "an";
    }
    return "a";
  },

  highlightString: function (string, highlightOption) {
    let newString = string;
    if (highlightOption == "bold") {
      newString = "'''" + newString + "'''";
    } else if (highlightOption == "italic") {
      newString = "''" + newString + "''";
    }
    return newString;
  },

  isAllUppercase: function (string) {
    if (!string) {
      return false;
    }

    let upperString = string.toUpperCase();
    if (upperString == string) {
      return true;
    }

    return false;
  },

  isAllLowercase: function (string) {
    if (!string) {
      return false;
    }

    let lowerString = string.toLowerCase();
    if (lowerString == string) {
      return true;
    }

    return false;
  },

  convertHtmlTagsToWikiMarkup(htmlString) {
    if (!htmlString) return "";

    //console.log("convertHtmlTagsToWikiMarkup: htmlString:", htmlString);

    let wikiText = htmlString;

    // 1. Bold: <b> or <strong> -> '''text'''
    wikiText = wikiText.replace(/<(?:b|strong)>(.*?)<\/(?:b|strong)>/gi, "'''$1'''");

    // 2. Italics: <i> or <em> -> ''text''
    wikiText = wikiText.replace(/<(?:i|em)>(.*?)<\/(?:i|em)>/gi, "''$1''");

    // 3. Headings: <h1> -> = text =, <h2> -> == text ==, etc.
    wikiText = wikiText.replace(/<h1>(.*?)<\/h1>/gi, "= $1 =");
    wikiText = wikiText.replace(/<h2>(.*?)<\/h2>/gi, "== $1 ==");
    wikiText = wikiText.replace(/<h3>(.*?)<\/h3>/gi, "=== $1 ===");

    // 4. Links: <a href="url">text</a> -> [url text]
    wikiText = wikiText.replace(/<a\s+[^>]*href="\s*([^"]*)\s*"[^>]*>\s*(.*?)\s*<\/a>/gi, "[$1 $2]");

    // 5. Lists: <li> -> * (Basic implementation)
    wikiText = wikiText.replace(/<li>(.*?)<\/li>/gi, "* $1");

    // 6. Line Breaks: <br> or <br /> -> (WikiTree supports <br>, but often uses double newline)
    // Keeping <br> is usually safer for exact formatting, but we'll clean up the tags.
    wikiText = wikiText.replace(/<br\s*\/?>/gi, "<br>");

    // 7. Strip structural tags that don't have direct equivalents (ul, ol, p, div)
    // This leaves the content but removes the containers.
    wikiText = wikiText.replace(/<\/?(?:ul|ol|p|div|span)>/gi, "");

    //console.log("convertHtmlTagsToWikiMarkup: wikiText:", wikiText);

    return wikiText.trim();
  },
};

export { StringUtils };
