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

function buildSearchData(input) {
  //console.log("buildSearchData, input is:");
  //console.log(input);

  const data = input.generalizedData;
  const options = input.options;

  let parameters = undefined;

  if (input.typeOfSearch == "SpecifiedParameters") {
    parameters = input.searchParameters;
  }

  let fieldData = {
    utf8: true,
    simpleIdFields: {},
    simpleNameFields: {},
    radioFields: [],
    options: {},
  };

  let firstName = data.inferFirstName();
  if (firstName) {
    fieldData.simpleIdFields["wpFirst"] = firstName;
  }

  let lastName = data.inferLastNameGivenParametersAndCollection(parameters, undefined);
  if (lastName) {
    fieldData.simpleIdFields["wpLast"] = lastName;
  }

  let birthDate = data.inferBirthDate();
  if (birthDate) {
    fieldData.simpleNameFields["wpBirthDate"] = birthDate;
  }

  let deathDate = data.inferDeathDate();
  if (deathDate) {
    fieldData.simpleNameFields["wpDeathDate"] = deathDate;
  }

  let birthPlace = "";
  if (parameters) {
    birthPlace = parameters.birthPlace;
  } else {
    birthPlace = data.inferBirthPlace();
  }
  if (birthPlace) {
    fieldData.simpleNameFields["birth_location"] = birthPlace;
  }

  let deathPlace = "";
  if (parameters) {
    deathPlace = parameters.deathPlace;
  } else {
    deathPlace = data.inferDeathPlace();
  }
  if (deathPlace) {
    fieldData.simpleNameFields["death_location"] = deathPlace;
  }

  let parents = data.parents;
  if (parents) {
    if (!parameters || parameters.father) {
      let father = parents.father;
      if (father && father.name) {
        let firstName = father.name.inferFirstName();
        let lastName = father.name.inferLastName();
        if (firstName) {
          fieldData.simpleNameFields["father_first_name"] = firstName;
        }
        if (lastName) {
          fieldData.simpleNameFields["father_last_name"] = lastName;
        }
      }
    }
    if (!parameters || parameters.mother) {
      let mother = parents.mother;
      if (mother && mother.name) {
        let firstName = mother.name.inferFirstName();
        let lastName = mother.name.inferLastName();
        if (firstName) {
          fieldData.simpleNameFields["mother_first_name"] = firstName;
        }
        if (lastName) {
          fieldData.simpleNameFields["mother_last_name"] = lastName;
        }
      }
    }
  }

  let sex = data.personGender;
  if (sex && sex != "-") {
    if (sex == "male") {
      fieldData.radioFields.push({ name: "gender", value: "Male" });
    } else if (sex == "female") {
      fieldData.radioFields.push({ name: "gender", value: "Female" });
    }
  }

  let dateExactness = options.search_wikitree_dateExactness;
  if (dateExactness) {
    if (dateExactness == "auto") {
      if (data.sourceOfData == "wikitree") {
        dateExactness = "exactDate";
      } else {
        dateExactness = "2";
      }
    }
    let value = "";
    if (dateExactness == "exactDate") {
      value = "-1";
    } else if (dateExactness == "exactYear") {
      value = "0";
    } else if (dateExactness == "2") {
      value = "2";
    } else if (dateExactness == "12") {
      value = "12";
    } else if (dateExactness == "30") {
      value = "30";
    }

    if (value) {
      fieldData.radioFields.push({ name: "date_spread", value: value });
    }
  }

  let nameExactness = options.search_wikitree_nameExactness;
  if (nameExactness) {
    let value = "";
    if (nameExactness == "bothVariant") {
      value = "0";
    } else if (nameExactness == "firstVariant") {
      value = "2";
    } else if (nameExactness == "lastVariant") {
      value = "3";
    } else if (nameExactness == "exact") {
      value = "1";
    }

    if (value) {
      fieldData.radioFields.push({ name: "skip_variants", value: value });
    }
  }

  // More exact census place involves generating a special place ID. This is too much effort.
  // search_query[freecen2_place_ids][]: 5fc6db0ef4040beff4813f18
  // Only allowed if an exact census place specified
  // search_query[search_nearby_places]: true

  //console.log("fieldData is:");
  //console.log(fieldData);

  var result = {
    fieldData: fieldData,
  };

  return result;
}

export { buildSearchData };
