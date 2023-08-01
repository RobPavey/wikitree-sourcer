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

const prefixes = [
  "de ",
  "den ",
  "der ",
  "'t ",
  "t' ",
  "te ",
  "ten ",
  "ter ",
  "van ",
  "ver ",
  "von ",
  "Klein ",
  "Groot ",
];

const noSpacePrefixes = ["de", "den", "der", "d'", "ten", "ter", "'t", "t'", "van", "ver", "von", "klein", "droot"];

function separateLastNameIntoParts(inputName) {
  let lastNamePrefix = "";
  let lastName = "";
  let patronym = "";

  if (!inputName) {
    return { lastName: lastName, lastNamePrefix: lastNamePrefix, patronym: patronym };
  }

  lastName = inputName.trim();

  let possiblePrefixes = true;
  while (possiblePrefixes) {
    let foundPrefix = false;
    for (let prefix of prefixes) {
      if (lastName.startsWith(prefix)) {
        lastName = lastName.substring(prefix.length);
        lastNamePrefix += prefix;
        foundPrefix = true;
      }
    }

    if (!foundPrefix) {
      possiblePrefixes = false;
    }
  }

  possiblePrefixes = true;
  while (possiblePrefixes) {
    let foundPrefix = false;
    for (let prefix of noSpacePrefixes) {
      if (lastName.toLowerCase().startsWith(prefix)) {
        if (lastName.length > prefix.length) {
          let nextLetter = lastName[prefix.length];
          if (nextLetter == nextLetter.toUpperCase()) {
            let previousLetter = lastName[prefix.length - 1];
            if (previousLetter == previousLetter.toLowerCase()) {
              lastName = lastName.substring(prefix.length);
              lastNamePrefix += prefix + " ";
              foundPrefix = true;
            }
          }
        }
      }
    }

    if (!foundPrefix) {
      possiblePrefixes = false;
    }
  }

  lastNamePrefix = lastNamePrefix.trim();

  return { lastName: lastName, lastNamePrefix: lastNamePrefix, patronym: patronym };
}

function separateFullNameIntoParts(fullName) {
  let lastNameStartIndex = -1;

  for (let prefix of prefixes) {
    const prefixWithSpace = " " + prefix;
    let index = fullName.indexOf(prefixWithSpace);
    if (index != -1 && index != 0) {
      if (lastNameStartIndex == -1) {
        lastNameStartIndex = index;
      } else if (index < lastNameStartIndex) {
        lastNameStartIndex = index;
      }
    }
  }

  let result = undefined;
  if (lastNameStartIndex != -1) {
    result = {};
    result.forenames = fullName.substring(0, lastNameStartIndex).trim();
    result.lastName = fullName.substring(lastNameStartIndex).trim();
  }

  return result;
}

export { separateLastNameIntoParts, separateFullNameIntoParts };
