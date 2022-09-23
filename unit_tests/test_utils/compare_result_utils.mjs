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

function findFirstDiffPos(a, b) {
  var i = 0;
  if (a === b) return -1;
  while (a[i] === b[i]) i++;
  return i;
}

function isObject(object) {
  return object != null && typeof object === 'object';
}

function deepObjectEquals(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    console.log("Failed compare: diff number of keys. object1 has " + keys1.length + " and object2 has " + keys2.length);

    let outputHeading = false;
    for (let key of keys1) {
      if (!keys2.includes(key)) {
        if (!outputHeading) {
          console.log("object1 has these extra keys:");
          outputHeading = true;
        }
        console.log(key);
      }
    }
    outputHeading = false;
    for (let key of keys2) {
      if (!keys1.includes(key)) {
        if (!outputHeading) {
          console.log("object2 has these extra keys:");
          outputHeading = true;
        }
        console.log(key);
      }
    }
    return false;
  }

  for (let keyIndex = 0; keyIndex < keys1.length; keyIndex++) {
    let key1 = keys1[keyIndex];
    let key2 = keys2[keyIndex];
    if (key1 != key2) {
      console.log("keys are in different order");
      return false;
    }
    let key = key1;

    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      areObjects && !deepObjectEquals(val1, val2) ||
      !areObjects && val1 !== val2
    ) {
      console.log("Failed compare: key:" + key);
      return false;
    }
  }

  return true;
}

function reportStringDiff(refString, actualString) {
  let firstDiffIndex = findFirstDiffPos(actualString, refString);

  console.log("Reference string is length " + refString.length + " :");
  console.log(refString);
  console.log("Actual string is length " + actualString.length + " :");
  console.log(actualString);
  console.log("First difference is at index " + firstDiffIndex);
  let actualEndIndex = firstDiffIndex + 20;
  if (actualEndIndex > actualString.length) {
    actualEndIndex = actualString.length;
  }
  let actualSnip = actualString.substring(firstDiffIndex, actualEndIndex);
  let refEndIndex = firstDiffIndex + 20;
  if (refEndIndex > refString.length) {
    refEndIndex = refString.length;
  }
  let refSnip = refString.substring(firstDiffIndex, refEndIndex);
  console.log("Ref: '" + refSnip + "' versus Actual: '" + actualSnip + "'");
}

export { deepObjectEquals, reportStringDiff };