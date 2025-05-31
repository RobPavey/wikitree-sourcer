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

function createPerson(jsonPerson) {
  let person = {
    wikiId: jsonPerson.Name,
    gender: jsonPerson.Gender,
    biography: jsonPerson.bio,
    firstName: jsonPerson.FirstName,
    middleName: jsonPerson.MiddleName,
    lnab: jsonPerson.LastNameAtBirth,
    cln: jsonPerson.LastNameCurrent,
  };

  return person;
}

function parseRef(ref) {
  let separatorRe = /(<br\/>\n|<br\/>|\n)/;
  let lines = ref.split(separatorRe);
  let parsedRef = {};

  console.log("parseRef: lines.length = " + lines.length);
  console.log(lines);

  let realLines = [];
  for (let line of lines) {
    if (!separatorRe.test(line)) {
      realLines.push(line);
    }
  }

  console.log("parseRef: realLines.length = " + realLines.length);
  console.log(realLines);

  // simple hack
  if (realLines.length >= 3) {
    parsedRef.sourceReference = realLines[2];
  }

  return parsedRef;
}

function parseTable(table) {
  let lines = table.split("\n");
  let parsedTable = {};

  console.log("parseTable: lines.length = " + lines.length);

  if (lines.length < 6) {
    console.log("parseTable: returning, not enough lines");
    return;
  }
  if (!lines[0].startsWith("{|")) {
    console.log("parseTable: returning, lines[0] start wrong");
    return;
  }
  if (!lines[lines.length - 1].startsWith("|}")) {
    console.log("parseTable: returning, lines[" + lines.length - 1 + "] start wrong");
    return;
  }

  parsedTable.options = lines[0].substring(2).trim();
  parsedTable.rows = [];
  for (let i = 1; i < lines.length - 1; i += 2) {
    let lineA = lines[i];
    let lineB = lines[i + 1];
    if (!lineA || !lineA.startsWith("|-")) {
      console.log("parseTable: returning, lineA start wrong");
      console.log(lineA);
      return;
    }
    if (!lineB || !lineB.startsWith("| ")) {
      console.log("parseTable: returning, lineB start wrong");
      console.log(lineB);
      return;
    }
    let row = {};
    row.options = lineA.substring(2).trim();
    let rowData = lineB.substring(2).trim();
    let cells = rowData.split("||");
    row.cells = [];
    for (let cell of cells) {
      let cellText = cell.trim();
      row.cells.push(cellText);
    }
    parsedTable.rows.push(row);
  }

  return parsedTable;
}

function buildHouseholdTable(parsedTable) {
  if (!parsedTable || parsedTable.rows.length < 2) {
    return;
  }

  let householdTable = {};
  householdTable.fields = [];
  for (let cell of parsedTable.rows[0].cells) {
    householdTable.fields.push(cell);
  }

  householdTable.people = [];

  let numSelected = 0;
  for (let i = 1; i < parsedTable.rows.length; i++) {
    let row = parsedTable.rows[i];
    let person = {};
    if (row.cells.length != householdTable.fields.length) {
      console.log("buildHouseholdTable: returning, row " + i + "num cells doesn't match heading row");
      return;
    }
    let isSelected = false;
    for (let cellIndex = 0; cellIndex < householdTable.fields.length; cellIndex++) {
      let cellData = row.cells[cellIndex];
      if (cellData.startsWith("'''") || cellData.endsWith("'''")) {
        isSelected = true;
        cellData = cellData.substring(3, cellData.length - 3);
      }

      person[householdTable.fields[cellIndex]] = cellData;
    }
    if (isSelected && !numSelected) {
      person.isSelected = true;
      numSelected++;
    }

    householdTable.people.push(person);
  }

  return householdTable;
}

function determineCensusYear(censusTable) {
  const narrativeRe = /^In the (\d\d\d\d) (census|register).*$/;
  if (narrativeRe.test(censusTable.narrative)) {
    censusTable.year = censusTable.narrative.replace(narrativeRe, "$1");
    return;
  }
}

function parseBio(biography) {
  let result = {};
  result.censusTables = [];

  let bioHeadingRe = /==\s*Biography\s*==\s*\n/;
  let rnHeadingRe = /==\s*Research\s+Notes\s*==\s*\n/;
  let sourcesHeadingRe = /==\s*Sources\s*==\s*\n/;

  let bioHeadingResult = bioHeadingRe.exec(biography);
  let rnHeadingResult = rnHeadingRe.exec(biography);
  let sourcesHeadingResult = sourcesHeadingRe.exec(biography);

  if (!bioHeadingResult || bioHeadingResult.length != 1) {
    return;
  }
  if (!sourcesHeadingResult || sourcesHeadingResult.length != 1) {
    return;
  }

  let coreBioTextStart = bioHeadingResult.index + bioHeadingResult[0].length;

  let coreBioTextEnd = sourcesHeadingResult.index;
  if (rnHeadingResult) {
    coreBioTextEnd = rnHeadingResult.index;
  }

  let coreBioText = biography.substring(coreBioTextStart, coreBioTextEnd).trim();

  let paras = coreBioText.split("\n\n");

  console.log("parseBio: paras.length = " + paras.length);

  for (let para of paras) {
    if (para.includes("{|")) {
      console.log("parseBio: found para with table");
      console.log(para);
      para = para.trim();
      let censusParaRe = /^(.+)\<ref\>(.+)\<\/ref\>.*(\{\|.*\|\})$/s;
      if (censusParaRe.test(para)) {
        console.log("parseBio: found census table para");
        let censusTable = {};
        censusTable.fullText = para;
        censusTable.narrative = para.replace(censusParaRe, "$1").trim();
        censusTable.ref = para.replace(censusParaRe, "$2").trim();
        censusTable.parsedRef = parseRef(censusTable.ref);
        censusTable.table = para.replace(censusParaRe, "$3").trim();
        censusTable.parsedTable = parseTable(censusTable.table);
        censusTable.householdTable = buildHouseholdTable(censusTable.parsedTable);
        determineCensusYear(censusTable);
        result.censusTables.push(censusTable);
      }
    }
  }

  //console.log("parseBio: result is:");
  //console.log(result);

  return result;
}

function buildRelatives(data, jsonData) {
  let relatives = [];

  if (jsonData.length == 1) {
    let jsonRecord = jsonData[0];
    if (jsonRecord.items) {
      let items = jsonRecord.items;
      for (let item of items) {
        if (item.person) {
          let parents = item.person.Parents;
          if (parents) {
            for (let parentId in parents) {
              let parent = parents[parentId];
              let person = createPerson(parent);
              person.relation = "parent";
              person.parsedBio = parseBio(person.biography);
              relatives.push(person);
            }
          }

          let spouses = item.person.Spouses;
          if (spouses) {
            for (let spouseId in spouses) {
              let spouse = spouses[spouseId];
              let person = createPerson(spouse);
              person.relation = "spouse";
              person.parsedBio = parseBio(person.biography);
              relatives.push(person);
            }
          }

          let children = item.person.Children;
          if (children) {
            for (let childId in children) {
              let child = children[childId];
              let person = createPerson(child);
              person.relation = "child";
              person.parsedBio = parseBio(person.biography);
              relatives.push(person);
            }
          }

          let siblings = item.person.Siblings;
          if (siblings) {
            for (let siblingId in siblings) {
              let sibling = siblings[siblingId];
              let person = createPerson(sibling);
              person.relation = "parent";
              person.parsedBio = parseBio(person.biography);
              relatives.push(person);
            }
          }
        }
      }
    }
  }

  return relatives;
}

function censusTablesMatch(census, relativeCensus) {
  if (census.year != relativeCensus.year) {
    return false;
  }

  if (
    census.parsedRef.sourceReference &&
    census.parsedRef.sourceReference == relativeCensus.parsedRef.sourceReference
  ) {
    return true;
  }

  return false;
}

function handleNewValueForBlankField(improvements, census, relative, relativeCensus, personIndex, field) {
  let improvedHouseholdTable = census.improvedHouseholdTable;
  let improvedPerson = improvedHouseholdTable.people[personIndex];
  let relTable = relativeCensus.householdTable;
  let relPerson = relTable.people[personIndex];

  improvedPerson[field] = relPerson[field];

  let improvement = {
    census: census,
    relative: relative,
    relativeCensus: relativeCensus,
    improvedPerson: improvedPerson,
    personIndex: personIndex,
    field: field,
    value: relPerson[field],
  };
  improvements.auto.push(improvement);
}

function findExistingAutoImprovement(improvements, census, personIndex, field) {
  for (let index = 0; index < improvements.auto.length; index++) {
    let improvement = improvements.auto[index];
    if (improvement.census.year == census.year) {
      if (improvement.census.parsedRef.sourceReference == census.parsedRef.sourceReference) {
        if (improvement.personIndex == personIndex) {
          if (improvement.field == field) {
            return index;
          }
        }
      }
    }
  }

  return -1;
}

function findExistingConflictImprovement(improvements, census, personIndex, field) {
  for (let index = 0; index < improvements.conflicts.length; index++) {
    let improvement = improvements.conflicts[index];
    if (improvement.census.year == census.year) {
      if (improvement.census.parsedRef.sourceReference == census.parsedRef.sourceReference) {
        if (improvement.personIndex == personIndex) {
          if (improvement.field == field) {
            return index;
          }
        }
      }
    }
  }

  return -1;
}

function handleConflictForOriginallyBlankField(improvements, census, relative, relativeCensus, personIndex, field) {
  // there should be an improvement recorded
  let autoIndex = findExistingAutoImprovement(improvements, census, relative, relativeCensus, personIndex, field);
  if (autoIndex == -1) {
    console.log("handleConflictForOriginallyBlankField: could not find existing auto improvement");
    return;
  }

  // get the auto improvement
  let oldAutoImprovement = improvements.auto[autoIndex];

  // remove this improvement from the auto array.
  improvements.auto.splice(autoIndex, 1);

  let improvedHouseholdTable = census.improvedHouseholdTable;
  let improvedPerson = improvedHouseholdTable.people[personIndex];
  let relTable = relativeCensus.householdTable;
  let relPerson = relTable.people[personIndex];

  let conflict = {
    census: census,
    relatives: [oldAutoImprovement.relative, relative],
    relativeCensuses: [oldAutoImprovement.relativeCensus, relativeCensus],
    improvedPerson: improvedPerson,
    personIndex: personIndex,
    field: field,
    value: relPerson[(oldAutoImprovement.value, field)],
  };
  improvements.conflicts.push(conflict);
}

function handleConflictForOriginallyFilledField(improvements, census, relative, relativeCensus, personIndex, field) {
  let improvedHouseholdTable = census.improvedHouseholdTable;
  let improvedPerson = improvedHouseholdTable.people[personIndex];
  let relTable = relativeCensus.householdTable;
  let relPerson = relTable.people[personIndex];

  // there should be an improvement recorded
  let existingIndex = findExistingConflictImprovement(improvements, census, personIndex, field);
  if (existingIndex != -1) {
    let existingConflict = improvements.conflicts[existingIndex];
    existingConflict.relatives.push(relative);
    existingConflict.relativeCensuses.push(relativeCensus);
    existingConflict.values.push(relPerson[field]);
    return;
  }

  let conflict = {
    census: census,
    relatives: [relative],
    relativeCensuses: [relativeCensus],
    improvedPerson: improvedPerson,
    personIndex: personIndex,
    field: field,
    values: [relPerson[field]],
  };
  improvements.conflicts.push(conflict);
}

function compareTableWithRelative(census, relativeCensus, relative, improvements) {
  let table = census.householdTable;
  let relTable = relativeCensus.householdTable;
  if (!(table && relTable)) {
    console.log("compareTableWithRelative: missing householdTable");
    return;
  }

  if (!table.fields || table.fields.length != relTable.fields.length) {
    console.log("compareTableWithRelative: num fields differ");
    return;
  }

  if (!table.people || table.people.length != relTable.people.length) {
    console.log("compareTableWithRelative: num people differ");
    return;
  }

  for (let i = 0; i < table.fields.length; i++) {
    if (table.fields[i] != relTable.fields[i]) {
      console.log("compareTableWithRelative: fields differ");
      return;
    }
  }

  // make a deep copy of houseHoldTable
  let improvedHouseholdTable = JSON.parse(JSON.stringify(table));
  census.improvedHouseholdTable = improvedHouseholdTable;

  let fields = improvedHouseholdTable.fields;
  for (let personIndex = 0; personIndex < table.people.length; personIndex++) {
    let person = table.people[personIndex];
    let improvedPerson = improvedHouseholdTable.people[personIndex];
    let relPerson = relTable.people[personIndex];
    for (let field of fields) {
      if (!improvedPerson[field] && relPerson[field]) {
        console.log(
          "compareTableWithRelative: found extra field value, field: " + field + ", value : " + relPerson[field]
        );

        handleNewValueForBlankField(improvements, census, relative, relativeCensus, personIndex, field);
      } else if (improvedPerson[field] != relPerson[field]) {
        // they differ, see if already improved
        if (!person[field]) {
          // it was originally blank
          handleConflictForOriginallyBlankField(improvements, census, relative, relativeCensus, personIndex, field);
        } else {
          handleConflictForOriginallyFilledField(improvements, census, relative, relativeCensus, personIndex, field);
        }
      }
    }
  }
}

function doCompares(result) {
  result.improvements = {
    auto: [],
    conflicts: [],
  };
  for (let census of result.parsedBio.censusTables) {
    let year = census.year;
    if (year) {
      for (let relative of result.relatives) {
        if (relative.parsedBio) {
          for (let relativeCensus of relative.parsedBio.censusTables) {
            if (censusTablesMatch(census, relativeCensus)) {
              let relativeName = relative.firstName + " " + relative.lnab;
              console.log("Found match, relative is " + relativeName + ", year is " + census.year);

              compareTableWithRelative(census, relativeCensus, relative, result.improvements);
            }
          }
        }
      }
    }
  }
}

function compareCensusTables(data, biography, jsonData) {
  let relatives = buildRelatives(data, jsonData);

  let parsedBio = parseBio(biography);

  let result = {
    parsedBio: parsedBio,
    relatives: relatives,
  };

  doCompares(result);

  return result;
}

export { parseBio, buildRelatives, compareCensusTables };
