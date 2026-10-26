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

// IMDb names people by the name they work under, which is often not their birth name. For example the
// actor David Tennant was born David John McDonald and a search for the birth name finds nothing. So the
// search can use any of the variants of the name that the profile has.

function splitNames(value) {
  if (!value) {
    return [];
  }
  return String(value)
    .split(/[,;]/)
    .map((name) => name.trim())
    .filter((name) => name);
}

// Returns an array of { label, name } with the first entry the best default search (the preferred name, if there is
// one, with the current last name). Names are not repeated.
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

  // The preferred name is the name the person went by, e.g. Jon rather than John Pertwee, so it is the best
  // guess for the name IMDb knows them by.
  for (let preferredName of preferredNames) {
    add("preferred name", preferredName, currentLastName);
  }
  add("current last name", first, currentLastName);
  add("last name at birth", first, birthLastName);
  add("middle names and current last name", forenames, currentLastName);
  add("middle names and last name at birth", forenames, birthLastName);
  for (let preferredName of preferredNames) {
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
