# Re-generalize design

In some cases, after doing generalizeData, it is necessary to update the generalized data.

There are four main cases currently:

* During building menu:
1. When the main Sourcer menu has yellow selectors at the top. Examples are for selecting the primary person, the spouse or multiple options for data fields in the original record.
2. In Ancestry, after the first generalize it can fetch linked records and then regeneralize with the linked record information
* During build citation:
3. Then the record doesn't have enough information to build a good citation and a popup comes up when a build citation menu item is used. The most common case is if the record type cannot be determined. But there are some sites that ask the user to type in more information at this point (nli and psuk for example)
4. If the recordType after first generalize is Unclassified then the user can be asked to select a recordType when build citation is done

Cases 1, 3 and 4 involve user input. The data from this user input needs to be passed to a regeneralize function. One question is whether this data should be an extra parameter to the regeneralize (in addition to ed and gd) or if it should be added to the gd in a `userInput` subobject.

In theory, several of these user inputs could happen for a single record. E.g in the main Sourcer menu the user can select the primary person and then, when they build a citation, a popup could ask for more information. In each case the generalizedData is updated using some kind of regeneralize function (or by constructing a new generalizedData from scratch). It is up to the site what this function is and whether the same function is used in both cases. But if this did happen it is possible that, in the second regeneralize, it will need access to the selections from the main popup - e.g. the primaryPerson index. This could be an argument for storing the `userInput` in the gd object.

Work in progress:

- In `popup_menu_building` the buildCitation regeneralizeFunction can take diff params depending on whether userInputFunction is set!

  - This confused me for a while. Maybe I should make this consistent?
  - If userInputFunction is set it takes:
    - let input = { extractedData: data.extractedData, generalizedData: gd, newData: resultData };
    - regeneralizeFunction(input);
      - newData could be renamed userInput or something like that
  - If not it takes:
    - regeneralizeFunction(data.extractedData, gd);
    - so in this case the user input is set in the gd before calling the regeneralizeFunction
    - Only MH uses this currently and I'm not sure if `gd.overrideRefTitle` would work in this case
  - To make it consistent I need to find all the uses:
    - popupSimpleBase clients:
      - mh: no userInputFunction, fn called generalizeDataGivenRecordType (uses edReader, edReader constructor has record type param)
      - nli: HAS userInputFunction, fn called regeneralizeData (does NOT use edReader)
      - psuk: HAS userInputFunction, fn called regeneralizeData (does NOT use edReader)
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

- Has a `generalizeDataGivenRecordType` function used after user selects record type
- This is passed into `addBuildCitationMenuItems`
- This `generalizeDataGivenRecordType` seems to duplicate a lot of `generalizeData`


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
 
### arolsenarchives

- Has `getPrimaryPersonOptions`
- There can be a large number of people to chose from

- https://collections.arolsen-archives.org/de/document/71022005

### ecpp

- Has `getPrimaryPersonOptions` to select between bride or groom in a marriage

- https://ecpp.ucr.edu/ecpp/app/user/view/records/marriage/121?defaultTab=groom

### eggsabdm

- Has `getPrimaryPersonOptions`

### eggsagrvs

- Has `getPrimaryPersonOptions`

### FMP

- Has a `generalizeDataGivenRecordType` function used after user selects record type
- This is passed into `addBuildCitationMenuItems`

### freebmd

- Has `getSpousePersonOptions`

### FS

- Has a `generalizeDataGivenRecordType` function used after user selects record type
- This is passed into `addBuildCitationMenuItems`

## MyHeritage

- User can select a record type and it then regeneralizes by calling `generalizeDataGivenRecordType`
- This `generalizeDataGivenRecordType` is passed into `setupSimplePopupMenu` as `regeneralizeFunction`
- I no longer have a subscription

- https://www.myheritage.com/research/record-30261-278584/james-johnson-in-jamaica-church-of-england-parish-register-transcripts
  - Can't access to see if it is classified

### nli

- Has a `regeneralizeData` function which is passed as the `regeneralizeFunction` into `setupSimplePopupMenu`
- Passes a `userInputFunction` into `setupSimplePopupMenu`

- https://registers.nli.ie/registers/vtls000632197#page/22/mode/1up

### nsvr

- Has `getPrimaryPersonOptions`

### nzbdm

- Has `getPrimaryPersonOptions`

- https://www.bdmhistoricalrecords.dia.govt.nz/Search/Search?Path=querySubmit.m%3fReportName%3dMarriageSearch%26recordsPP%3d30#SearchResults

### panb

- Has `getPrimaryPersonOptions`

### psuk

- Has a `regeneralizeData` function which is passed as the `regeneralizeFunction` into `setupSimplePopupMenu`
- Passes a `userInputFunction` into `setupSimplePopupMenu`

### thegen

- I no longer have a subscription
- Has `getPrimaryPersonOptions`
- Has `getSpousePersonOptions`


