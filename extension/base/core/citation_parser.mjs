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

class CitationParser {
  constructor(text) {
    this.text = text;
  }

  extractYearAndRegistrationNumberFromText(extractInput) {
    if (!this.text) {
      return undefined;
    }

    let lcText = this.text.toLowerCase();

    let defaultToYearFirst = extractInput.defaultToYearFirst;
    let startYear = extractInput.startYear;

    //console.log("extractYearAndRegistrationNumberFromText, lcText is:");
    //console.log(lcText);

    let regNum = "";
    let regYear = "";

    function handleTwoExtractedNumbers(num1, num2) {
      //console.log("num1 is '" + num1 + "'");
      //console.log("num2 is '" + num2 + "'");

      if (!num1 || !num2 || num1 == lcText || num2 == lcText) {
        return false;
      }

      if (num1.length == 4 || num2.length == 4) {
        let number1 = Number(num1);
        let number2 = Number(num2);
        if (defaultToYearFirst) {
          regYear = num1;
          regNum = num2;
        } else {
          regYear = num2;
          regNum = num1;
        }
        if (!(num2.length == 4 && number2 >= startYear && number2 < 2050)) {
          if (num1.length == 4 && number1 >= startYear && number1 < 2050) {
            regYear = num1;
            regNum = num2;
          }
        }
        return true;
      }
      return false;
    }

    function lookForWellSeparatedNumSlashNum() {
      //console.log("lcText is '" + lcText + "'");

      const regex = /(?:^.*[^\d\/]|^)(\d+)\s?\/\s?(\d+)(?:[^\d\/].*$|$)/;
      if (!regex.test(lcText)) {
        return false;
      }

      let num1 = lcText.replace(regex, "$1");
      let num2 = lcText.replace(regex, "$2");

      return handleTwoExtractedNumbers(num1, num2);
    }

    function lookForNormalNumSlashNum() {
      let startIndex = lcText.search(/\d+ ?\/ ?\d+/);
      //console.log("startIndex is: " + startIndex);
      if (startIndex == -1) {
        return false;
      }
      let refText = lcText.substring(startIndex);
      let endIndex = refText.search(/[^\d\s\/]/);
      //console.log("endIndex is: " + endIndex);
      if (endIndex == -1) {
        endIndex = refText.length;
      }
      refText = refText.substring(0, endIndex).trim();

      //console.log("refText is '" + refText + "'");

      // Note: there could be an extra number on end. e.g.:
      // victoria (australia) death 1972/29190 79y
      // refText is '1972/29190 79'

      let num1 = refText.replace(/^(\d+) ?\/ ?\d+\s*\d*$/, "$1");
      let num2 = refText.replace(/^\d+ ?\/ ?(\d+)\s*\d*$/, "$1");

      return handleTwoExtractedNumbers(num1, num2);
    }

    function lookForOtherNumSepNum() {
      // Examples:
      // Victorian marriage registration 1873,03483,F,Grant,Annie,Box,Alfred John,Edinburgh, 1873,03483,M,Box,Alfred John,Grant,Annie,Gloucestershire,
      // Victorian death registration 1909,09716,,Box,Annie Cooper,Grant George,Beaton Jane,Melbourne East,60,
      // Victorian birth registration 1876: 00759,,Smith,Walter,Cornelius,Osullivan Johanna,Br Ea,
      // Victorian death registration 1876: 00493,,Smith,Walter,Cornelius,Osullivan Johanna,,24D,birth(Gren)

      let startIndex = lcText.search(/registration \d+\s*[:,]\s*\d+/);
      //console.log("startIndex is: " + startIndex);
      if (startIndex == -1) {
        return false;
      }
      let refText = lcText.substring(startIndex);
      let numStartIndex = refText.search(/\d/);
      if (numStartIndex == -1) {
        return false;
      }
      refText = refText.substring(numStartIndex);

      let endIndex = refText.search(/[^\d\s:,]/);
      //console.log("endIndex is: " + endIndex);
      if (endIndex == -1) {
        endIndex = refText.length;
      }
      refText = refText.substring(0, endIndex).trim();

      // refText should now contain the year number, a separator and ref number

      //console.log("refText is '" + refText + "'");

      let num1 = refText.replace(/^[:,\s]*(\d+)\s*[:,]\s*\d+[:,\s]*$/, "$1");
      let num2 = refText.replace(/^[:,\s]*\d+\s*[:,]\s*(\d+)$/, "$1");

      return handleTwoExtractedNumbers(num1, num2);
    }

    function lookForSeparateYearAndRefNum() {
      let regNumIndex = lcText.search(/reg[^\s:.]*[:.\s]*\d+/);
      if (regNumIndex == -1) {
        regNumIndex = lcText.search(/reg[^\s:.]*[:.\s]*num[^\s:.]*[:.\s]*\d+/);
      }
      if (regNumIndex == -1) {
        regNumIndex = lcText.search(/ref[^\s:.]*[:.\s]*\d+/);
      }
      if (regNumIndex == -1) {
        regNumIndex = lcText.search(/ref[^\s:.]*[:.\s]*num[^\s:.]*[:.\s]*\d+/);
      }
      if (regNumIndex == -1) {
        return false;
      }
      let regNumPart = lcText.substring(regNumIndex);
      let regNumStartIndex = regNumPart.search(/\d/);
      if (regNumStartIndex == -1) {
        return false;
      }
      regNumPart = regNumPart.substring(regNumStartIndex);
      let regNumEndIndex = regNumPart.search(/[^\d]+/);
      if (regNumEndIndex == -1) {
        regNumEndIndex = regNumPart.length;
      }
      regNum = regNumPart.substring(0, regNumEndIndex);

      // now try to find year
      let regYearIndex = lcText.search(/reg[^\s:.]*[:.\s]*date[^\s:.]*[:.\s]*\d\d\d\d/);
      if (regYearIndex == -1) {
        regYearIndex = lcText.search(/reg[^\s:.]*[:.\s]*year[^\s:.]*[:.\s]*\d\d\d\d/);
      }
      if (regYearIndex == -1) {
        regYearIndex = lcText.search(/year[:.\s]*[\sa-z]*\d\d\d\d/);
      }

      // try to find year in a narrative type string or data string
      if (regYearIndex == -1) {
        regYearIndex = lcText.search(/born[:.\s]*[\sa-z]*\d\d\d\d/);
      }
      if (regYearIndex == -1) {
        regYearIndex = lcText.search(/birth[:.\s]*[\sa-z]*\d\d\d\d/);
      }
      if (regYearIndex == -1) {
        regYearIndex = lcText.search(/died[:.\s]*[\sa-z]*\d\d\d\d/);
      }
      if (regYearIndex == -1) {
        regYearIndex = lcText.search(/death[:.\s]*[\sa-z]*\d\d\d\d/);
      }
      if (regYearIndex == -1) {
        regYearIndex = lcText.search(/married[:.\s]*[\sa-z]*\d\d\d\d/);
      }
      if (regYearIndex == -1) {
        regYearIndex = lcText.search(/marriage[:.\s]*[\sa-z]*\d\d\d\d/);
      }

      if (regYearIndex == -1) {
        return false;
      }
      let regYearPart = lcText.substring(regYearIndex);
      let regYearStartIndex = regYearPart.search(/\d/);
      if (regYearStartIndex == -1) {
        return false;
      }
      regYearPart = regYearPart.substring(regYearStartIndex);
      let regYearEndIndex = regYearPart.search(/[^\d]+/);
      if (regYearEndIndex == -1) {
        regYearEndIndex = regYearPart.length;
      }
      regYear = regYearPart.substring(0, regYearEndIndex);
      return true;
    }

    let foundYearAndNum = lookForWellSeparatedNumSlashNum();

    if (!foundYearAndNum) {
      foundYearAndNum = lookForNormalNumSlashNum();
    }

    if (!foundYearAndNum) {
      foundYearAndNum = lookForOtherNumSepNum();
    }

    if (!foundYearAndNum) {
      foundYearAndNum = lookForSeparateYearAndRefNum();
    }

    //console.log("regNum is '" + regNum + "'");
    //console.log("regYear is '" + regYear + "'");

    if (!foundYearAndNum) {
      return undefined;
    }

    return { regYear: regYear, regNum: regNum };
  }

  extractValueFromText(extractInput) {
    let text = this.text;

    if (extractInput.preClean) {
      let clean = extractInput.preClean;
      if (clean.removeMatches) {
        for (let regex of clean.removeMatches) {
          text = text.replace(regex, "");
        }
      }
    }

    if (extractInput.individual) {
      for (let regex of extractInput.individual.matches) {
        if (regex.test(text)) {
          let value = text.replace(regex, "$1");
          if (value && value != text) {
            return value;
          }
        }
      }
    }

    if (extractInput.combined) {
      for (let regex of extractInput.combined.matches) {
        if (regex.test(text)) {
          let combinedValue = text.replace(regex, "$1");
          if (combinedValue && combinedValue != text) {
            for (let partRegex of extractInput.combined.partMatches) {
              if (partRegex.test(combinedValue)) {
                let value = combinedValue.replace(partRegex, "$1");
                if (value && value != text) {
                  return value;
                }
              }
            }
          }
        }
      }
    }

    if (extractInput.noKey) {
      for (let regex of extractInput.noKey.matches) {
        if (regex.test(text)) {
          let value = text.replace(regex, "$1");
          if (value && value != text) {
            return value;
          }
        }
      }
    }
  }

  extractMatchingValueFromText(extractInput) {
    let text = this.text;

    if (!text) {
      return;
    }

    if (extractInput.preClean) {
      let clean = extractInput.preClean;
      if (clean.removeMatches) {
        for (let regex of clean.removeMatches) {
          text = text.replace(regex, "");
        }
      }
    }

    if (extractInput.individual) {
      for (let regex of extractInput.individual.matches) {
        let matches = text.match(regex);
        if (matches && matches.length > 1) {
          let value = matches[1];
          if (value) {
            return value;
          }
        }
      }
    }
  }
}

export { CitationParser };
