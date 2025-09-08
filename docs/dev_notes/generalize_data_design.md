# More details on the Generalize Data step

This gives more details on the design of the generalizedData structure and on implementing the generalize data phase.

## The goal for the GeneralizedData structure

The idea is that the generalized data represents the data from the current web page in a standardized form.
At the same time it should be representing what is on the web page - not too much of an interpretation of it.

For example some web site records has the forenames and last name as separate data fields. Some have only a full name field.
In the former case the GeneralizedData will keep them as separate fields but in standard field names, same for the latter case.
The name is stored as a single full name field in generalizedData. The GeneralizedData class then provides functions to infer values from the fields.
Like `inferFullName` or `inferLastName`.

The reasoning here is that we don't want to fill the GeneralizedData structure with all the inferred values.
This structure gets passed around and stored a lot so we don't want it to bloat too much.
Also, clients of the GeneralizedData structure (or internal functions in the class) may occasionally want to know what data actually came from the web page vs being inferred.

## Sub-objects used in GeneralizedData

The `eventDate` property in GeneralizedData is not a string. It is a `DateObj` object. It is mostly the same for names (`NameObj`) and places (`PlaceObj`).

Beware of adding nume sub-objects. Extra support needs to be added for copying or serializes/deserialized the GeneralizedData struture for each new sub-object.

## The ed_reader

As the first few sites were implemented in Sourcer the generalizeData code became the most complicated function for each site.
To make it easier to add new sites we wanted a way to provide a skeleton structure that could be filled in for each site.
The approach taken was the `EdReader`. This is a class named `<Site>EdReader` in the `<site>_ed_reader.mjs` file for each site. Some older sites don't use this but all new sites do.

I site using the ed_reader the `<site>_generalize_data.mjs` file is just a simple boilerplate file that created the EdReader and uses the function `commonGeneralizeData` to build the `GeneralizedData` object using the `EdReader`.

The `EdReader` will have a constructor that is passed the extracted_data. The constructor will determinr the record type and store it in the recordType property (if needed it will also set the recordSubtype and role properties).

The function `commonGeneralizeData` then called methods on the `EdReader` to get each field that `GeneralizedData` supports. E.g. `getEventDateObj`.

The `<Site>EdReader` class is derived from a common base class `ExtractedDataReader`. This provides default implementations of each function and also provides helper functions (e.g. `makeParentsFromForenamesAndLastNames`).

Using the ed_reader can make the code slightly less efficient since the same work might need to be done in several of the get functions. But it makes things easier to write and maintain. The run time of `generalizeData` is not an issue.




