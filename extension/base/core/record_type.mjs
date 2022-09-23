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

// NOTE: If a new record type is added the rtToRefTitle object in popup_menu_building should also be updated
// Also getRefTitle in generalize_data_utils
const RT = {
  Unclassified: `Unclassified`,
  BirthRegistration: `BirthRegistration`,
  Birth: `Birth`, // not a birth registration or a baptism (could be Quaker record for example)
  MarriageRegistration: `MarriageRegistration`,
  DeathRegistration: `DeathRegistration`,
  Death: `Death`,
  Baptism: `Baptism`,
  Marriage: `Marriage`,
  Burial: `Burial`,
  Cremation: `Cremation`,
  BirthOrBaptism: `BirthOrBaptism`,
  DeathOrBurial: `DeathOrBurial`,
  Census: `Census`,
  NonpopulationCensus: `NonpopulationCensus`,
  ElectoralRegister: `ElectoralRegister`,
  Probate: `Probate`,
  Will: `Will`,
  Divorce: `Divorce`,
  Memorial: `Memorial`,

  CriminalRegister: `CriminalRegister`,
  FreemasonMembership: `FreemasonMembership`,
  Directory: `Directory`,
  Employment: `Employment`,
  WorkhouseRecord: `WorkhouseRecord`,
  CrewList: `CrewList`,
  PassengerList: `PassengerList`,
  ConvictTransportation: `ConvictTransportation`,
  Military: `Military`,
  MedicalPatient: `MedicalPatient`,
  QuarterSession: `QuarterSession`,
  LandTax: `LandTax`,
  Tax: `Tax`,
  ValuationRoll: `ValuationRoll`,
  Apprenticeship: `Apprenticeship`,
  Certificate: `Certificate`,
  SocialSecurity: `SocialSecurity`,
  SchoolRecords: `SchoolRecords`,
  Residence: `Residence`,
  Obituary: `Obituary`,
  Immigration: `Immigration`,
  Emigration: `Emigration`,
  Naturalization: `Naturalization`,
  Pension: `Pension`,
  PassportApplication: `PassportApplication`,
  Newspaper: `Newspaper`,
  LegalRecord: `LegalRecord`,
  RateBook: `RateBook`,
  FamHistOrPedigree: `FamHistOrPedigree`,
  OtherChurchEvent: `OtherChurchEvent`, // other than baptism, marriage, burial etc. e.g. Confirmation, Seat Rents
  Heraldry: `Heraldry`,
};

const RecordSubtype = {
  Banns: `Banns`,
  MarriageOrBanns: `MarriageOrBanns`,
}

const Role = {
  Primary: `Primary`,
  Parent: `Parent`,
  Child: `Child`,
  Sibling: `Sibling`,
  Spouse: `Spouse`,
  Witness: `Witness`,
}

export { RT, RecordSubtype, Role };
