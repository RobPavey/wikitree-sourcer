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

function getChildTerm(gender) {
  if (!gender) {
    return "child";
  } else if (gender == "male") {
    return "son";
  } else if (gender == "female") {
    return "daughter";
  }
}

function getPrimaryPersonChildTerm(gd) {
  let childGender = "";
  if (gd.primaryPerson) {
    childGender = gd.primaryPerson.gender;
  }
  return getChildTerm(childGender);
}

function getParentTerm(gender) {
  if (!gender) {
    return "parent";
  } else if (gender == "male") {
    return "father";
  } else if (gender == "female") {
    return "mother";
  }
}

function getPrimaryPersonParentTerm(gd) {
  let parentGender = "";
  if (gd.primaryPerson) {
    parentGender = gd.primaryPerson.gender;
  }
  return getParentTerm(parentGender);
}

function getSpouseTerm(gender) {
  if (!gender) {
    return "spouse";
  } else if (gender == "male") {
    return "husband";
  } else if (gender == "female") {
    return "wife";
  }
}

function getPrimaryPersonSpouseTerm(gd) {
  let spouseGender = "";
  if (gd.primaryPerson) {
    spouseGender = gd.primaryPerson.gender;
  }
  return getSpouseTerm(spouseGender);
}

export {
  getChildTerm,
  getPrimaryPersonChildTerm,
  getParentTerm,
  getPrimaryPersonParentTerm,
  getSpouseTerm,
  getPrimaryPersonSpouseTerm,
};
