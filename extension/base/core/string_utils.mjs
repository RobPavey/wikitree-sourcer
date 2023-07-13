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
      return "";
    }
    if (/[aeiou]/i.test(word[0])) {
      return "an";
    }
    return "a";
  },

  getPrepositionForPlaceString: function (placeString) {
    if (!placeString) {
      return "";
    }

    let firstChar = placeString[0];
    if (firstChar >= "0" && firstChar <= "9") {
      return "at";
    } else {
      // if it is a town we want "in" but if it is a house or building then we want "at"
      // so we get last word or first part and compare it to a set of strings
      let preposition = "in";
      let firstPart = placeString;
      let firstCommaIndex = placeString.indexOf(",");
      if (firstCommaIndex != -1) {
        firstPart = placeString.substring(0, firstCommaIndex);
      }
      let lastSpaceIndex = firstPart.lastIndexOf(" ");
      if (lastSpaceIndex != -1) {
        let lastWord = firstPart.substring(lastSpaceIndex + 1);
        const onEndings = [
          "street",
          "st",
          "st.",
          "road",
          "rd",
          "rd.",
          "lane",
          "ln",
          "ln.",
          "avenue",
          "ave",
          "ave.",
          "av",
          "av.",
        ];
        const atEndings = ["workhouse", "house", "manor", "farm", "church", "hospital", "apartments", "apts", "apts."];
        lastWord = lastWord.toLowerCase();
        if (onEndings.includes(lastWord)) {
          preposition = "on";
        } else if (atEndings.includes(lastWord)) {
          preposition = "at";
        }
      }
      return preposition;
    }
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
};

export { StringUtils };
