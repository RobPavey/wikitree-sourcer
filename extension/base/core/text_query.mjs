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

function setDefaultTextQueryParameters(parameters, gd, options) {
  parameters.proximity = "exact";

  parameters.includeFirstName = true;
  parameters.includeGivenNames = true;
  parameters.includePrefName = true;

  const lnab = gd.inferLastNameAtBirth();
  const cln = gd.inferLastNameAtDeath(options);
  parameters.includeLnab = true;
  parameters.includeCln = lnab != cln;

  parameters.includeLnabAtStart = false;
  parameters.includeClnAtStart = false;
}

function buildQueryString(searchSiteName, gd, parameters, options) {
  let query = "";

  let givenNameVariants = [];
  let lastNameVariants = [];
  let lastNameAtStartVariants = [];

  function addNameVariant(nameArray, name, parameterName) {
    if (name && parameters[parameterName]) {
      if (!nameArray.includes(name)) {
        nameArray.push(name);
      }
    }
  }

  function addNameWordVariants(nameArray, names, parameterName) {
    if (names) {
      names = names.trim();
      let splitNames = names.split(" ");
      let suffix = 1;
      for (let name of splitNames) {
        if (!nameArray.includes(name)) {
          let newParameterName = parameterName + suffix;
          if (parameters[newParameterName]) {
            nameArray.push(name);
          }
        }
        suffix++;
      }
    }
  }

  function getInitials(names) {
    if (!names) {
      return "";
    }

    let words = names.split(" ");
    let initials = "";
    for (let word of words) {
      if (initials) {
        initials += " ";
      }
      initials += word[0];
    }
    return initials;
  }

  const proximityMap = {
    exact: 0,
    1: 1,
    2: 2,
    3: 3,
    5: 5,
    10: 10,
    20: 20,
  };

  let proximity = proximityMap[parameters.proximity];

  addNameVariant(givenNameVariants, gd.inferFirstName(), "includeFirstName");
  addNameVariant(givenNameVariants, gd.inferForenames(), "includeGivenNames");

  addNameVariant(givenNameVariants, getInitials(gd.inferFirstName()), "includeFirstNameInitial");
  addNameVariant(givenNameVariants, getInitials(gd.inferForenames()), "includeGivenNameInitials");

  addNameVariant(lastNameVariants, gd.inferLastNameAtBirth(), "includeLnab");
  addNameVariant(lastNameVariants, gd.inferLastNameAtDeath(options), "includeCln");

  if (proximity == 0) {
    addNameVariant(lastNameAtStartVariants, gd.inferLastNameAtBirth(), "includeLnabAtStart");
    addNameVariant(lastNameAtStartVariants, gd.inferLastNameAtDeath(options), "includeClnAtStart");
  }

  if (gd.name) {
    addNameVariant(givenNameVariants, gd.name.prefName, "includePrefName");
    addNameVariant(givenNameVariants, gd.name.prefNames, "includePrefName");

    addNameVariant(givenNameVariants, getInitials(gd.name.prefName), "includePrefNameInitials");
    addNameVariant(givenNameVariants, getInitials(gd.name.prefNames), "includePrefNameInitials");

    addNameWordVariants(givenNameVariants, gd.name.nicknames, "includeNickname");
    addNameWordVariants(lastNameVariants, gd.name.otherLastNames, "includeOtherLastName");

    if (proximity == 0) {
      addNameWordVariants(lastNameAtStartVariants, gd.name.otherLastNames, "includeOtherLastNameAtStart");
    }
  }

  let phrases = [];

  function addPhrase(phrase) {
    let wordCount = phrase.split(" ").length;
    let stringToAdd = "";
    if (wordCount == 1) {
      stringToAdd = phrase;
    } else {
      let proximityString = "";
      if (proximity != 0) {
        proximityString = "~" + proximity;
      } else if (searchSiteName == "trove") {
        proximityString = "~0";
      }
      stringToAdd = `"${phrase}"${proximityString}`;
    }

    if (searchSiteName == "trove") {
      stringToAdd = "fulltext:" + stringToAdd;
    }

    if (!phrases.includes(stringToAdd)) {
      phrases.push(stringToAdd);
    }
  }

  function buildPhrases() {
    if (givenNameVariants.length > 0) {
      for (let name1 of givenNameVariants) {
        if (lastNameVariants.length > 0 || lastNameAtStartVariants.length > 0) {
          for (let name2 of lastNameVariants) {
            addPhrase(`${name1} ${name2}`);
          }
          for (let name2 of lastNameAtStartVariants) {
            addPhrase(`${name2} ${name1}`);
          }
        } else {
          addPhrase(`${name1}`);
        }
      }
    } else {
      if (lastNameVariants.length > 0) {
        for (let name2 of lastNameVariants) {
          addPhrase(`${name2}`);
        }
      }
      if (lastNameAtStartVariants.length > 0) {
        for (let name2 of lastNameAtStartVariants) {
          addPhrase(`${name2}`);
        }
      }
    }
  }

  // main person phrases
  buildPhrases();

  if (phrases.length == 1) {
    query += phrases[0];
  } else if (phrases.length > 1) {
    query = "(";
    for (let phrase of phrases) {
      if (query.length > 1) {
        query += " OR ";
      }
      query += phrase;
    }
    query += ")";
  }

  // spouse names. example:
  // "John Subritzky" (("Hannah Smith" OR "H Smith") OR ("Mary McCarthy" OR "M McCarthy"))
  if (gd.spouses && gd.spouses.length > 0) {
    let suffix = 1;
    let spouseQueries = [];
    for (let spouse of gd.spouses) {
      if (spouse.name) {
        let lnab = spouse.lastNameAtBirth;
        if (!lnab) {
          lnab = spouse.name.inferLastName();
        }
        let givenNames = spouse.name.inferForenames();
        let firstName = spouse.name.inferFirstName();

        givenNameVariants = [];
        lastNameVariants = [];
        lastNameAtStartVariants = [];

        addNameVariant(givenNameVariants, firstName, "includeFirstNameSpouse" + suffix);
        addNameVariant(givenNameVariants, givenNames, "includeGivenNamesSpouse" + suffix);
        addNameVariant(lastNameVariants, lnab, "includeLnabSpouse" + suffix);

        phrases = [];
        buildPhrases();

        let spouseQuery = "";
        if (phrases.length == 1) {
          spouseQuery += phrases[0];
        } else if (phrases.length > 1) {
          spouseQuery = "(";
          for (let phrase of phrases) {
            if (spouseQuery.length > 1) {
              spouseQuery += " OR ";
            }
            spouseQuery += phrase;
          }
          spouseQuery += ")";
        }

        if (spouseQuery) {
          spouseQueries.push(spouseQuery);
        }
      }
      suffix++;
    }

    let spousesQuery = "";
    if (spouseQueries.length == 1) {
      spousesQuery += spouseQueries[0];
    } else if (spouseQueries.length > 1) {
      spousesQuery += "(";
      for (let spouseQuery of spouseQueries) {
        if (spousesQuery.length > 1) {
          spousesQuery += " OR ";
        }
        spousesQuery += spouseQuery;
      }
      spousesQuery += ")";
    }
    if (spousesQuery) {
      query += " " + spousesQuery;
    }
  }

  return query.trim();
}

export { buildQueryString, setDefaultTextQueryParameters };
