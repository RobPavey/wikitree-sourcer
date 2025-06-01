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
              person.relation = "sibling";
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

  let sourceReference = census.parsedRef.sourceReference;
  let relSourceReference = relativeCensus.parsedRef.sourceReference;
  if (sourceReference && sourceReference == relSourceReference) {
    let householdTable = census.householdTable;
    let relHouseholdTable = relativeCensus.householdTable;
    if (householdTable && relHouseholdTable) {
      let fields = householdTable.fields;
      let relFields = relHouseholdTable.fields;
      if (fields && relFields && fields.length == relFields.length) {
        for (let i = 0; i < fields.length; i++) {
          if (fields[i] != relFields[i]) {
            console.log("censusTablesMatch: names of fields do not match");
            return false;
          }
        }

        return true;
      }
    }
  }

  return false;
}

function findExistingCensusFieldDiff(diffs, census, personIndex, field) {
  for (let index = 0; index < diffs.length; index++) {
    let diff = diffs[index];
    if (diff.census.year == census.year) {
      if (diff.census.parsedRef.sourceReference == census.parsedRef.sourceReference) {
        if (diff.personIndex == personIndex) {
          if (diff.field == field) {
            return index;
          }
        }
      }
    }
  }

  return -1;
}

function addDiff(diffs, census, relative, relativeCensus, personIndex, field) {
  let existingIndex = findExistingCensusFieldDiff(diffs, census, personIndex, field);

  let table = census.householdTable;
  let person = table.people[personIndex];
  let relTable = relativeCensus.householdTable;
  let relPerson = relTable.people[personIndex];

  if (existingIndex == -1) {
    let diff = {
      census: census,
      person: person,
      personIndex: personIndex,
      field: field,
      relatives: [relative],
      relativeCensuses: [relativeCensus],
      values: [relPerson[field]],
    };
    diffs.push(diff);
    return diff;
  } else {
    let diff = diffs[existingIndex];
    diff.relatives.push(relative);
    diff.relativeCensuses.push(relativeCensus);
    diff.values.push(relPerson[field]);
    return diff;
  }
}

function compareTableWithRelatives(census, relativesData, diffs) {
  // we know that all the censuses have householdTables and the fields match at this point
  let table = census.householdTable;

  let fields = table.fields;
  for (let personIndex = 0; personIndex < table.people.length; personIndex++) {
    let person = table.people[personIndex];
    for (let field of fields) {
      for (let relativeData of relativesData) {
        let relative = relativeData.relative;
        let relativeCensus = relativeData.census;
        let relTable = relativeCensus.householdTable;
        let relPerson = relTable.people[personIndex];

        let value = person[field];
        let relValue = relPerson[field];

        if (value != relValue) {
          let diff = addDiff(diffs, census, relative, relativeCensus, personIndex, field);

          if (value) {
            if (relValue) {
              diff.hasDifferentValueForCell = true;
            } else {
              diff.relativeHasEmptyCellWeDont = true;
            }
          } else {
            // relValue can't be empty string here or it would equal value
            diff.hasNewValueForEmptyCell = true;
          }
        }
      }
    }
  }
}

function doCompares(result) {
  result.diffs = [];
  for (let census of result.parsedBio.censusTables) {
    let year = census.year;
    if (year) {
      let relativesData = [];
      for (let relative of result.relatives) {
        if (relative.parsedBio) {
          for (let relativeCensus of relative.parsedBio.censusTables) {
            if (censusTablesMatch(census, relativeCensus)) {
              let relativeName = relative.firstName + " " + relative.lnab;
              console.log("Found match, relative is " + relativeName + ", year is " + census.year);
              relativesData.push({ relative: relative, census: relativeCensus });
            }
          }
        }
      }

      if (relativesData.length) {
        compareTableWithRelatives(census, relativesData, result.diffs);
      }
    }
  }

  result.numDiffValues = 0;
  result.numValuesForEmptyCells = 0;
  result.numCellsWhereRelativesAreEmpty = 0;
  for (let diff of result.diffs) {
    if (diff.hasDifferentValueForCell) {
      result.numDiffValues++;
    } else if (diff.hasNewValueForEmptyCell) {
      console.log("doCompares: incrementing diff.hasNewValueForEmptyCell");
      result.numValuesForEmptyCells++;
    } else if (diff.relativeHasEmptyCellWeDont) {
      result.numCellsWhereRelativesAreEmpty++;
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

function buildImprovedTableString(censusTable) {
  // the improvements should already be in householdTable
  let improvedHouseholdTable = censusTable.householdTable;
  if (!improvedHouseholdTable) {
    return;
  }

  let tableString = "{| " + censusTable.parsedTable.options + "\n";

  for (let rowIndex = 0; rowIndex < censusTable.parsedTable.rows.length; rowIndex++) {
    let row = censusTable.parsedTable.rows[rowIndex];
    tableString += "|-";
    if (row.options) {
      tableString += " " + row.options;
    }
    tableString += "\n";

    if (rowIndex == 0) {
      tableString += "|";
      for (let cellIndex = 0; cellIndex < improvedHouseholdTable.fields.length; cellIndex++) {
        tableString += " ";
        let value = improvedHouseholdTable.fields[cellIndex];
        if (value) {
          tableString += value;
        }
        if (cellIndex != improvedHouseholdTable.fields.length - 1) {
          tableString += " ||";
        } else {
          tableString += "\n";
        }
      }
    } else {
      tableString += "|";
      let person = improvedHouseholdTable.people[rowIndex - 1];
      for (let cellIndex = 0; cellIndex < improvedHouseholdTable.fields.length; cellIndex++) {
        tableString += " ";
        let field = improvedHouseholdTable.fields[cellIndex];
        let value = person[field];
        if (value) {
          if (person.isSelected) {
            tableString += "'''";
          }
          tableString += value;
          if (person.isSelected) {
            tableString += "'''";
          }
        }
        if (cellIndex != improvedHouseholdTable.fields.length - 1) {
          tableString += " ||";
        } else {
          tableString += "\n";
        }
      }
    }
  }

  tableString += "|}";

  return tableString;
}

function updateBiography(compareResults, biography) {
  let newBiography = biography;

  // any resolution of the census cell values should now have updated these values
  // in the householdTable object within each census table.

  // go through censusTables and generate an improvedTable string for each one from
  // the improvedHouseholdTable
  let censusTables = compareResults.parsedBio.censusTables;
  for (let censusTable of censusTables) {
    let tableString = buildImprovedTableString(censusTable);
    if (tableString && tableString != censusTable.table) {
      let matches = newBiography.match(censusTable.table);
      if (matches && matches.length == 1) {
        newBiography = newBiography.replace(censusTable.table, tableString);
      }
    }
  }

  return newBiography;
}

export { compareCensusTables, updateBiography };
