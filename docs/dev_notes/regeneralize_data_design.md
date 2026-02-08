# Re-generalize design

In some cases, after doing generalizeData, it is necessary to update the generatized data.

There are two main cases currently:

1. When the main Sourcer menu has yellow selectors at the top. Examples for for selecting the primary person, the spouse or multiple options for data fields in the original record.
2. Then the record doesn't have enough information to build a good citation and a popup comes up when a build citation menu item is used. The most common case is if the record type cannot be determined. But there are some sites that ask the user to type in more information at this point (nli and psuk for example)

The data from these user selections need to be passed to a regeneralize function. One question is whether this data should be an extra parameter to the regeneralize (in addition to ed and gd) or if it should be added to the gd in a `userInput` subobject.

In theory, both of these user input could happen for a single record. E.g in the main Sourcer menu the user can select the primary person and then, when they build a citation, a popup could ask for more information. In each case the generalizedData is updated using some kind of regeneralize function (or by constructing a new generalizedData from scratch). It is up to the site what this function is and whether the same function is used in both cases. But if this did happen it is possible that, in the second regeneralize, it will need access to the selections from the main popup - e.g. the primaryPerson index. This could be an argument for storing the `userInput` in the gd object.

Work in progress:

- In `popup_menu_building` the buildCitation regeneralizeFunction can take diff params depending on whether userInputFunction is set!

  - This confused me for a while. Maybe I should make this consistent?
  - If userInputFunction is set it takes:
    - let input = { extractedData: data.extractedData, generalizedData: gd, newData: resultData };
    - regeneralizeFunction(input);
      - newData could be renamed userInput or something like that
  - If not it takes:
    - regeneralizeFunction(data.extractedData, gd);
  - To make it consistent I need to find all the uses:
    - popupSimpleBase clients:
      - mh: no userInputFunction, fn called generalizeDataGivenRecordType (uses edReader, edReader constructor has record type param)
      - nli: HAS userInputFunction, fn called regeneralizeData (does NOT use edReader)
      - noda: no userInputFunction, fn called regeneralizeData (uses edReader, NOTE: regeneralizeData does nothing currently)
      - openarch: no userInputFunction, fn called regeneralizeData (uses edReader, NOTE: regeneralizeData does nothing currently)
      - psuk: HAS userInputFunction, fn called regeneralizeData (does NOT use edReader)
      - wiewaswie: no userInputFunction, fn called regeneralizeData (uses edReader, NOTE: regeneralizeData does nothing currently)
    - other clients:
      - ancestry: no userInputFunction, fn called generalizeDataGivenRecordType
      - fmp: no userInputFunction, fn called generalizeDataGivenRecordType
      - fs: no userInputFunction, fn called generalizeDataGivenRecordType

- The regeneralize after selecting the primaryPerson is done by just doing the normal generalize again (at least for simple popup)
  - The primaryPersonIndex and spousePersonIndex are passed in as separate parameters to generalize
    - For the alternate field values we should change to put them all in a userInput or userSelections object
  - In theory the user input in this case could change something that would affect the calculation of the record type
    - So can't necessarily use a generalizeDataGivenRecordType type function (though this may never be the case)
    - The only way I can imagine this happening is if the Event Type or Record Type fields has a user correction. This seems unlikely.
  - ??? If there is a case where there is a menu selector (like primary person) AND there is a popup after build Citation then it is possible that the userInput from the
    primary person selection also has to be passed into the regeneralize after Build Citation???
    - Not sure but this could be an argument for storing the userInput in the gd itself.

It seems clear that the regeneralize function should always take an `input` object - just like `generalizeData` does. The `userInput` could be passed in as part of this `input` function. It can be up to the site whether it stores this `userInput` in the gd.

Also, other code like buildCitation can get data from ed directly currently. If there were alternate values selected then it should use gd code to do that and if the `userInput` was embedded in the gd it would avoid having to pass extra stuff into buildCitation.

## Test cases

### Ancestry

- https://www.ancestry.com/search/collections/61311/records/2913
  - Prompts for record type, does have an alternate value for gender but it is identical to main value
- https://www.ancestry.com/search/collections/7163/records/39054256
  - Has 3 name values, original, alternate and user submitted, the last 3 being the same
- https://www.ancestry.com/discoveryui-content/view/8614064:8991
  - has alt occupation
- https://www.ancestry.com/search/collections/8860/records/5626136
  - all of the name are user submitted
- https://www.ancestry.com/search/collections/8767/records/8067946
  - Four different fields with corrections
  - Has square brackets actually in names so breaks my parsing code
- https://www.ancestry.com/search/collections/7667/records/40917603
  - 7 name variants, 4 unique

### FMP

### FS

## MyHeritage

- I no longer have a subscription
- https://www.myheritage.com/research/record-30261-278584/james-johnson-in-jamaica-church-of-england-parish-register-transcripts
  - Can't access to see if it is classified

### nli

### noda

### openarch

### psuk

### wiewaswie
