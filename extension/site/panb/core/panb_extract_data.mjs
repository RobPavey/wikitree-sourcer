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

//!!!!!!!!!! CHANGES NEEDED HERE AFTER RUNNING create_new_site SCRIPT !!!!!!!!!!
// insert code here to do detect the selected row by looking for the styling that
// was added in the content script when the row was clicked. Code below is an example.
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function getSelectedRow(document) {
  const highlightStyle = "font-weight: bold; font-style: italic";
  const elResultsTable = document.querySelector("table.Details");
  if (elResultsTable) {
    const selectedRow = elResultsTable.querySelector("div.detail-columns[style='" + highlightStyle + "']");
    alert("Selected row:", selectedRow);
    return selectedRow;
  }
}

function extractData(document, url) {
  var result = {};

  if (url) {
    result.url = url;
  }
  result.success = false;

// At this time we will restrict data extraction to NB Vital Statistics from Government Records (RS141)
// It may have to be moved to and/or duplicated in the panb_content.js file
//      TODO:  Make this test broader to support more of the Federated Database

  let indexName = "";
  result.databaseID = "this is not";
  let startIndexName = url.indexOf("141");
   if(startIndexName < 0) {
	//alert("This is not a New Brunswick Provincial Archives Vital Statistics Database.");
    return result;
  }
  else {
	  let endSuffix = url.indexOf(".aspx");
 	  indexName = "RS" + url.slice(startIndexName, endSuffix);
  }

/*   console.log("Expected RS141 found:", indexName);
  if(indexName == "Wrong Database") {    
    return result;
  } */
  	
  const choices = new Set(["A1b","A5","A2/2","A2_2","B5","B7","C4","C5", "C1","C6"]);  // more to be added later
  let suffix = indexName.slice(5);
 
  if(suffix == "A2_2") {
	suffix = "A2/2" 
  }

  // RS141C6 has a different structure for its Url
  if(suffix == "C6/Details") {
	suffix = "C6" 
  }

  if (!choices.has(suffix)) {
    alert(indexName +" not yet a supported New Brunswick Provincial Archives Federated Database site.");
    result.databaseID = indexName +" is not yet a supported"
    return result;
  }
  
  let recordTableTitle = "";
  switch (suffix) {
	case "A5":
		recordTableTitle = "Index to Provincial Registrations of Births";	
		break;
    case "A1b":
		recordTableTitle = "Index to Late Registration of Births";	
		break; 
    case "A1c":
		recordTableTitle = "Index to Late Registration of Births: County Series";	
		break;
    case "A2/2":
		recordTableTitle = "Index to County Birth Registers";	
		break;
	case "B7":
		recordTableTitle = "Index to New Brunswick Marriages";	
		break;
    case "B5":
		recordTableTitle = "Index to Late Registration of Marriages";	
		break;
	case "C4":
		recordTableTitle = "Provincial Returns of Deaths";	
		break;
	case "C5":
		recordTableTitle = "Index to Death Certificates";
    break;    
	case "C1":
		recordTableTitle = "Index to County Death Registers";
    break;    
	case "C6":
		recordTableTitle = "Index to Death registration of soldiers, 1941-1947";
  }
  console.log("Database", recordTableTitle);
  result.tableTitle = recordTableTitle;

// We expect to find a single table of 2 to 3 columns and up to 12 rows
  let directTables = document.querySelector("table.Details");

  if (!directTables) {
    alert("No record tables were found.\nNB Provincial Archive may have been changed.");
    return result;
  }
  const tableCount = directTables.length + 1;
  if (tableCount > 1) {
    alert("Unexpected number of record tables were found.\nNB Provincial Archive may have been changed, will still attempt to use first table.");
  }

  const tables = Array.from(document.body.querySelectorAll("table"));
	const embededTable = tables[0];
	
	// If the first row starts with "Name" we will recognize the table as from a standard RS141 Vital Record
	const firstRow = embededTable.rows[0];
	const tableRowLength = firstRow.cells.length;
	const firstCell = firstRow.cells[0].textContent.trim();
 	if( firstCell !="Name") {
	  alert("This table does not have the expected RS141 record construction.\nNB Provincial Archive may have been changed.");
	  return result;
	}

//  Here we have the new approach of the working table being created as a pair of arrays
//  of length equal to the number of rows in the first 2 columns in the table on the web page
  const columnLength = embededTable.rows.length;
	//console.log('Columns:', columnLength);
	console.log('Has caption:', embededTable.caption);
	console.log('Classes:', embededTable.className);
///	console.log('Table text:', embededTable.textContent);

  result.recordData = {};

  for (let index = 0; index < columnLength; index++) {
    let nextRow = embededTable.rows[index];
    let headingNode = nextRow.cells[0];
    let valueNode = nextRow.cells[1];
    let heading = headingNode.textContent.trim();
    let value = valueNode.textContent.trim();
    console.log( "extract=", heading, value);

    if (heading) {
      result.recordData[heading] = value;
    }
  }
  
  console.log("recordData", "Date", result.recordData["Date"] );

  // finally check if an image is attached
  //const imageUrl = `N/A`;
  const elems = Array.from(document.body.querySelectorAll('a[href$="jpg"]'));
  
  result.hasImage = false;
  for (let elem of elems) {
    if (elem.matches('a[href$="jpg"]')) {
 	  let frontIndex = elem.href.indexOf("App_Handler");
	  let backIndex = elem.href.indexOf("Digit");	  
	  result.imageUrl = elem.href.slice(0,frontIndex) + elem.href.slice(backIndex);
//	  console.log(result.imageUrl);
	  result.hasImage = true;	  
	  break;
    }
  }
  
 //			This is where we load the return results
 
  if(!result.hasImage) result.imageUrl = "";
  result.numberTableEntries = columnLength;
  result.databaseID = "RS141"+suffix;
  const suffixType = suffix.slice(0,1);
  if(suffixType == "A") {
	  result.eventType = "Birth";
  } else if(suffixType == "B") {
	  result.eventType = "Marriage";
    result.recordData["Sex"] = "";
  } else if(suffixType == "C") {
	  result.eventType = "Death";
  } else  {
	  result.eventType = "Unclassified";
  }	  
  result.success = true;

  return result;
}
export { extractData };
