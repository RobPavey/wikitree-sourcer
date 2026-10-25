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

// Publications of Jehovah's Witnesses name a person in various ways, e.g. "Simone Arnold Liebster" for a woman born
// Arnold who married a Liebster. So the search can use any of the names that the profile could be known by.

function splitNames(value) {
  if (!value) {
    return [];
  }
  return String(value)
    .split(/[,;]/)
    .map((name) => name.trim())
    .filter((name) => name);
}

// Returns an array of { label, name }. The first entry is the best default, the first name and the current last name.
// Names are not repeated.
function buildNameVariants(gd) {
  let variants = [];

  function add(label, forenames, lastName) {
    if (!forenames || !lastName) {
      return;
    }
    const name = forenames.trim() + " " + lastName.trim();
    if (!variants.some((variant) => variant.name.toLowerCase() == name.toLowerCase())) {
      variants.push({ label: label, name: name });
    }
  }

  const first = gd.inferFirstName();
  const forenames = gd.inferForenames();
  const birthLastName = gd.inferLastNameAtBirth();

  let currentLastName = gd.lastNameAtDeath ? gd.lastNameAtDeath : gd.inferLastName();
  if (!currentLastName) {
    currentLastName = birthLastName;
  }

  const nameObj = gd.name;
  const preferredNames = nameObj ? splitNames(nameObj.prefNames ? nameObj.prefNames : nameObj.prefName) : [];
  const nicknames = nameObj ? splitNames(nameObj.nicknames) : [];
  const otherLastNames = nameObj ? splitNames(nameObj.otherLastNames) : [];

  add("current last name", first, currentLastName);
  add("last name at birth", first, birthLastName);
  add("all forenames and current last name", forenames, currentLastName);
  add("all forenames and last name at birth", forenames, birthLastName);
  for (let preferredName of preferredNames) {
    add("preferred name", preferredName, currentLastName);
    add("preferred name and last name at birth", preferredName, birthLastName);
  }
  for (let nickname of nicknames) {
    add("nickname", nickname, currentLastName);
    add("nickname and last name at birth", nickname, birthLastName);
  }
  for (let otherLastName of otherLastNames) {
    add("other last name", first, otherLastName);
  }

  return variants;
}

export { buildNameVariants };
