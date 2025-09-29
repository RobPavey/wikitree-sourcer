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
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";

// See https://en.wikipedia.org/wiki/List_of_family_name_affixes for a subsset of these
// To be better this could take country names into account
const lastNamePrefixes = [
  "ab ",
  "ap ",
  "da ",
  "de ",
  "di ",
  "du ",
  "ibn ",
  "janse van ",
  "janse v ",
  "jansen van ",
  "jansen v ",
  "la ",
  "le ",
  "lu ",
  "te ",
  "ter ",
  "ten ",
  "van den ",
  "van der ",
  "van de ",
  "van ",
  "von ",
  "vd ",
  "v ",
  "zu ",
];

const logit = false;
const EggsaCommon = {
  /**
   * If str starts with a multi-word surname prefix, (e.g. "van der " of "van der Merwe"), return the prefix,
   * else return false
   * @param {*} str
   */
  multiWordSurnamePrefixAtStart: function (str) {
    const lcName = str.toLowerCase();
    for (const prefix of lastNamePrefixes) {
      if (lcName.startsWith(prefix)) {
        return prefix;
      }
    }
    return false;
  },

  /**
   * If str ends with a multi-word surname prefix (including a trailing space), return the prefix,
   * else return false
   * @param {*} str
   */
  multiWordSurnamePrefixAtEnd: function (str) {
    const lcName = str.toLowerCase();
    for (const prefix of lastNamePrefixes) {
      if (lcName.endsWith(" " + prefix)) {
        return prefix;
      }
    }
    return false;
  },

  splitAndFixLastnameCapitalisation: function (name) {
    // Assuming name is of the form "<first names><last name>" where <firt names> may be absent
    // and <last name> can be a multi-word last names in the normal order and could be ALL CAPPS,
    // return: [<first names>, <mixed case last name> }, where <first names> is unchanged and
    // <mixed case last name> has the firt letter capitalised, except for any standard last name
    // prefixes. e.g. Piet VAN DER MERWE will return ["Pieter", "van der Merwe"].
    // Otherwise return []. We cater for "First Names" possibly being empty.

    if (!name.includes(" ")) return NameUtils.convertNameFromAllCapsToMixedCase(name);

    const theName = " " + name.replaceAll(/\s?\(\?\)/g, ""); // remove any "(?)"
    let lcName = theName.toLowerCase();
    let firstNames, lastName;

    let mcName = NameUtils.convertNameFromAllCapsToMixedCase(theName);
    const lastWord = StringUtils.getLastWord(mcName);

    lcName = lcName.slice(0, -lastWord.length);
    for (const prefix of lastNamePrefixes) {
      // Check if the last word is preceded by a last name prefix and include the latter in
      // the last name if so.
      if (lcName.endsWith(prefix)) {
        lastName = (prefix.startsWith("janse") ? StringUtils.toInitialCaps(prefix) : prefix) + lastWord;
        firstNames = theName.slice(0, -lastName.length).trim();
        return [firstNames, lastName];
      }
    }
    firstNames = theName.slice(0, -lastWord.length).trim();
    return [firstNames, lastName];
  },

  toMixedCaseWithPossiblePrefix: function (lastName) {
    if (lastName == "") return lastName;
    if (!lastName.includes(" ")) return NameUtils.convertNameFromAllCapsToMixedCase(lastName);
    let prefix = EggsaCommon.multiWordSurnamePrefixAtStart(lastName);
    if (prefix) {
      prefix = prefix.startsWith("janse") ? StringUtils.toInitialCaps(prefix) : prefix;
      return prefix + NameUtils.convertNameFromAllCapsToMixedCase(lastName.substring(prefix.length));
    } else {
      return NameUtils.convertNameFromAllCapsToMixedCase(lastName);
    }
  },

  // If lastName has a prefix and it is at the end, move it to the front
  movePrefixToStart: function (lastName) {
    if (!lastName.includes(" ")) return lastName;

    const lcName = lastName.toLowerCase() + " ";
    for (const prefix of lastNamePrefixes) {
      // Make sure we know where the last name of multi-word last names start.
      if (lcName.endsWith(" " + prefix)) {
        return prefix + lastName.substring(0, lastName.length - prefix.length);
      }
    }
    return lastName;
  },

  removePatronymicFromArray: function (lastNameParts) {
    // We can only remove a patronymic if we have more than one last name part
    if (lastNameParts.length == 1) return lastNameParts[0];
    logit && console.log("removePatronymicFromArray", lastNameParts);

    let oldParts = lastNameParts;

    // Look for any of the following complete last words and remove the last 2 words if found
    // "zoon", "zoon)", "znX", "znX)", "dgX", "dgX)", "dochter" "z", zX or "zX)" where X is any of ".", ":", or empty
    const lastWord = oldParts[oldParts.length - 1].toLowerCase();
    if (oldParts.length > 2 && /^(zoon|zn[:.]?|dg[:.]?|dochter|z[:.]|[:.]z)\)?$/i.test(lastWord)) {
      // remove the last 2 words
      logit && console.log(`patronymic: ${oldParts.slice(-2).join(" ")}`);
      oldParts = oldParts.slice(0, -2);
    } else if (oldParts.length >= 2 && /(zoon|zn[:.]?|z[:.]|[:.]z)\)?$/i.test(lastWord)) {
      // Assume any last word ending in any of the above z-patronymic variations except z on its own (as in e.g. Mentz),
      // but also ".z" or ":z" is a patronymic
      logit && console.log(`patronymic: ${oldParts[oldParts.length - 1]}`);
      oldParts = oldParts.slice(0, -1);
    }
    const lastName = oldParts.join(" ").replace(/ (?:[Dd]e |d'\s?)(?:[Jj]onge|[Oo]ude)/, "");
    logit && console.log(`removePatronymicFromArray result=${lastName}`);
    return lastName;
  },

  extractFirstLastSplitAtAllCaps: function (nameString) {
    const str = nameString.replaceAll(/[^\s],[^\s]/g, " "); // replace all commas in middel of words, with spaces
    // const parts = str.split(" ").filter(Boolean);
    const parts = str.split(" "); // assuma extra spaces have already been stripped
    let lastName = "";
    let firstNames = "";
    if (parts.length) {
      // Find the position of the first all caps word, ignoring single letter initials and ones like
      //  "F.",  "F.J.", "(F.", "(F", "F.)", or "F)"
      for (var i = 0; i < parts.length; ++i) {
        const word = parts[i];
        if (
          word.length !== 1 &&
          !word.includes(".") &&
          !/^\(?.[.:]?\)?$/.test(word) &&
          StringUtils.isWordAllUpperCase(word)
        )
          break;
      }
      if (i < parts.length) {
        const allCapsParts = parts.slice(i);
        lastName = EggsaCommon.removePatronymicFromArray(allCapsParts);
        // move prefix from end to beginning if required
        lastName = EggsaCommon.movePrefixToStart(lastName);
        // Sometimes the prefix is not capitalised, e.g. "van der MERWE", so cater for that
        const allCapsStr = allCapsParts.join(" ");
        const strSansAllCaps = str.slice(0, -allCapsStr.length);
        let prefix = EggsaCommon.multiWordSurnamePrefixAtEnd(strSansAllCaps);
        if (prefix) {
          prefix = prefix.startsWith("janse") ? StringUtils.toInitialCaps(prefix) : prefix;
          lastName = prefix + lastName;
          firstNames = strSansAllCaps.slice(0, -prefix.length).trim();
          return [firstNames, lastName];
        }
      }
      firstNames = parts.slice(0, i).join(" ");
    }
    return [firstNames, lastName.replaceAll(/[.,;]$/g, "")];
  },

  deriveFirstLastFromLastWord: function (sansPatronymic) {
    const lastWord = StringUtils.getLastWord(sansPatronymic);
    logit && console.log(`DFL:lastWord: '${lastWord}' in ${sansPatronymic}`);
    const prefix = EggsaCommon.multiWordSurnamePrefixAtEnd(sansPatronymic.slice(0, -lastWord.length));
    logit && console.log(`DFL: found parent prefix = '${prefix}' in ${sansPatronymic}`);
    let firstName, lastName;
    if (prefix) {
      lastName = prefix + lastWord;
      firstName = sansPatronymic.slice(0, -lastName.length).trim();
    } else {
      // Assume the last word is the lastname.
      // This might be taking a guess and I might have to remove it again, but let's see
      // how many bad results we get.
      lastName = lastWord;
      firstName = sansPatronymic.slice(0, -lastName.length).trim();
    }
    lastName = lastName.replace(/,$/, ""); // remove any stray comma at the end
    logit && console.log(`parent first name: '${firstName}', last name: '${lastName}'`);
    return [firstName, lastName];
  },

  getFirstAndLastNames: function (nameStr) {
    // first remove any words in parentheses at the end of the string
    const name = nameStr.replace(/\([^)]*\)$/, "").trim();
    let [firstNames, lastName] = EggsaCommon.extractFirstLastSplitAtAllCaps(name);
    if (!lastName && firstNames.includes(" ")) {
      // There were no all caps last name, let's take a stab at getting a last name.
      // This might not alwasy be correct, but so be it.
      const sansPatronymic = EggsaCommon.removePatronymicFromArray(firstNames.split(" "));
      [firstNames, lastName] = EggsaCommon.deriveFirstLastFromLastWord(sansPatronymic);
    }
    firstNames = EggsaCommon.removePatronymicFromArray(firstNames.split(" "));
    lastName = EggsaCommon.toMixedCaseWithPossiblePrefix(lastName);
    return [firstNames, lastName];
  },
};
export { EggsaCommon };
