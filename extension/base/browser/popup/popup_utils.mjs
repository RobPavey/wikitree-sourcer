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

function separateUrlIntoParts(url) {
  if (!url) {
    return undefined;
  }

  const schemeSuffix = "://";
  let schemeSuffixIndex = url.indexOf(schemeSuffix);
  if (schemeSuffixIndex == -1) {
    return undefined;
  }
  let scheme = url.substring(0, schemeSuffixIndex);
  let remainder = url.substring(schemeSuffixIndex + schemeSuffix.length);

  let dotIndex = remainder.indexOf(".");
  if (dotIndex == -1) {
    return undefined;
  }
  let subdomain = remainder.substring(0, dotIndex);
  remainder = remainder.substring(dotIndex + 1);

  let slashIndex = remainder.indexOf("/");
  if (slashIndex == -1) {
    slashIndex = remainder.length;
  }
  let domain = remainder.substring(0, slashIndex);
  let subdirectory = remainder.substring(slashIndex + 1);

  return {
    scheme: scheme,
    subdomain: subdomain,
    domain: domain,
    subdirectory: subdirectory,
  };
}

function convertTimestampDiffToText(timeStamp) {
  if (!timeStamp) {
    return "";
  }

  let now = Date.now();
  let diffInMs = now - timeStamp;
  let diffInSecs = Math.floor(diffInMs / 1000);
  let timeText = "";
  if (diffInSecs < 60) {
    timeText += diffInSecs + " second";
    if (diffInSecs > 1) {
      timeText += "s";
    }
  } else {
    let diffInMins = Math.floor(diffInSecs / 60);
    if (diffInMins < 60) {
      timeText += diffInMins + " minute";
      if (diffInMins > 1) {
        timeText += "s";
      }
    } else {
      let diffInHours = Math.floor(diffInMins / 60);
      if (diffInHours < 24) {
        timeText += diffInHours + " hour";
        if (diffInHours > 1) {
          timeText += "s";
        }
      } else {
        return ""; // ignore saved data that is more than 24 hours old
      }
    }
  }

  return timeText;
}

function getPersonDataSubtitleText(gd, timeText) {
  let name = gd.inferFullName();
  if (!name) {
    name = "Unknown";
  }

  let subtitleText = name;

  let birthYear = gd.inferBirthYear();
  if (!birthYear) {
    birthYear = "";
  }
  let deathYear = gd.inferDeathYear();
  if (!deathYear) {
    deathYear = "";
  }
  if (birthYear || deathYear) {
    subtitleText += " (" + birthYear + "-" + deathYear + ")";
  }

  subtitleText += "\nSaved " + timeText + " ago";

  return subtitleText;
}

function getCitationObjectSubtitleText(gd, timeText) {
  let name = gd.inferFullName();
  if (!name) {
    name = "Unknown";
  }

  let subtitleText = name;

  let birthYear = gd.inferBirthYear();
  if (!birthYear) {
    birthYear = "";
  }
  let deathYear = gd.inferDeathYear();
  if (!deathYear) {
    deathYear = "";
  }
  if (birthYear || deathYear) {
    subtitleText += " (" + birthYear + "-" + deathYear + ")";
  }

  subtitleText += "\nRecord type: " + gd.recordType;
  subtitleText += "\nSaved " + timeText + " ago";

  return subtitleText;
}

export { separateUrlIntoParts, convertTimestampDiffToText, getPersonDataSubtitleText, getCitationObjectSubtitleText };
