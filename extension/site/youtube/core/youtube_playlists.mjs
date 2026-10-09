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

// The playlist keys understood by the WikiTree YouTube template (https://www.wikitree.com/wiki/Template:YouTube).
// The template's playlist=<key> parameter is mapped to a YouTube playlist ID by a #switch in the template.
// This is the reverse of that mapping, used to work out the playlist=<key> parameter from the list=<id>
// parameter of a YouTube URL. If the template gains new playlists regenerate the array below with
// scripts/update_youtube_playlists.mjs rather than editing it by hand.
//
// Note that the template uses the first matching case of its #switch, so if two keys ever share an ID
// the one listed first here wins in findWikiTreePlaylistKey.
const wikiTreePlaylists = [
  { key: "DD", id: "PLEqK4ICkQWXRxxQj3EBXoOh-3NOS5HH4R" },
  { key: "AskAles", id: "PLEqK4ICkQWXRdLaXhPTR9VrP6PNUhIx0D" },
  { key: "USBH", id: "PLEqK4ICkQWXQhA2IH_OT-vbFhmHhP39lc" },
  { key: "SpotlightProfileShorts", id: "PLEqK4ICkQWXRAd3T3hEAch0yAO9UL8plB" },
  { key: "ConnectionFinderShorts", id: "PLEqK4ICkQWXS4zor0WM0ce2eSIOk3R5v5" },
  { key: "SaturdayRoundupShorts", id: "PLEqK4ICkQWXS_45Q-lpKoP4XuHKvtKP7d" },
  { key: "SaturdayRoundup", id: "PLEqK4ICkQWXQjQv8KdgZx94hFl0eWN9l3" },
  { key: "FridayNightBingo", id: "PLEqK4ICkQWXTlPqarokRHM_q-tk64yXUN" },
  { key: "TreeTours", id: "PLEqK4ICkQWXTwGVlOi3PmLFywwAIL9N3s" },
  { key: "15Nations", id: "PLEqK4ICkQWXRXNnUpab51rzQf_at9mvDJ" },
  { key: "NewMemberQA", id: "PLEqK4ICkQWXSDUTl5g3sN8r7aqi4bXa0k" },
  { key: "MOTW", id: "PLEqK4ICkQWXT9V8stCNiiaHxTUwm0w_ip" },
  { key: "WikiGames", id: "PLEqK4ICkQWXS8nzfQzidCIpavlhQX3Huw" },
  { key: "WTChallenge2023", id: "PLEqK4ICkQWXSEeWHo1cnBLBcMiXiHT8ZA" },
  { key: "2023SourceAThon", id: "PLEqK4ICkQWXQ4lzml9XPruHphb7z93Aby" },
  { key: "WikiTreeSymposium2023", id: "PLEqK4ICkQWXTcHb2eaLFDq-T2z-mCMuUW" },
  { key: "WikiTreeDay2023", id: "PLEqK4ICkQWXTAEbh6rNizagtJTP8kACDI" },
  { key: "Hacktoberfest2023", id: "PLEqK4ICkQWXQNFAnUW0ZZuMMN7GU-we7s" },
  { key: "GlobalSpotlight", id: "PLEqK4ICkQWXS3EGC9Q4uoL32Jlv-70hXC" },
  { key: "CemeterySpotlight", id: "PLEqK4ICkQWXS8bY36HXAxsrsHM4qK0v8f" },
  { key: "QuestionOfTheWeek", id: "PLEqK4ICkQWXQXODTRG6UGGZ4cmXiMRmD4" },
  { key: "January2024ConnectAThon", id: "PLEqK4ICkQWXRHy82aqus6Jr1qBe0guIBl" },
  { key: "WTC2024", id: "PLEqK4ICkQWXT4kwLj9-k-CydpZjq8yhfK" },
  { key: "April2024ConnectAThon", id: "PLEqK4ICkQWXRTEI9Kya5QwnXmw9Sz6NJn" },
  { key: "July2024ConnectAThon", id: "PLEqK4ICkQWXTUuAm8CTUk4dQGgaYaJ76k" },
  { key: "WikiGames2024", id: "PLEqK4ICkQWXRZMjdNX6epqA92_xHAvI95" },
  { key: "SourceAThon2024", id: "PLEqK4ICkQWXThKfkGDPxI8cjM17ah3Xaf" },
  { key: "WikiTreeDay2024", id: "PLEqK4ICkQWXT66wnFSHdEEHdh6uiYP95v" },
  { key: "WikiTreeSymposium2024", id: "PLEqK4ICkQWXSeQ7C5KdIfRrwfHZMR3spW" },
  { key: "ConnectionCombat", id: "PLEqK4ICkQWXRVpB7mRZ9YVB9kYHGSt9Vh" },
  { key: "Hacktoberfest2024", id: "PLEqK4ICkQWXSF4_QdQkpdQyywl3d7_Xgr" },
  { key: "WatchlistWeevils", id: "PLEqK4ICkQWXTwzJ6d-nJBQoAxvg-TPauT" },
  { key: "Auschwitz2025", id: "PLEqK4ICkQWXT6g6CWeZheMhC8F4GfM6On" },
  { key: "2024SymposiumCountdown", id: "PLEqK4ICkQWXQbJ5aw1jjE9TyRFTsnpBBA" },
  { key: "2024WTDayCountdown", id: "PLEqK4ICkQWXRjyQTOCh8GfFaiKw0XmFQn" },
  { key: "LinkBuilders", id: "PLEqK4ICkQWXRoJeTYrJ0fgAahtz_bdMn-" },
  { key: "ElfMas2024", id: "PLEqK4ICkQWXTr0lgeVw4pPy8VvQS8CMcc" },
  { key: "ConnectAThonXIII", id: "PLEqK4ICkQWXSZuiSYtKt3aoY_boEYOHgH" },
  { key: "ConnectAThonXIV", id: "PLEqK4ICkQWXSh_8W2h0H2L_cLRkHnAqgl" },
  { key: "ConnectAThonXV", id: "PLEqK4ICkQWXSonqLwn5zaGXGxAcTsmyTJ" },
  { key: "SourceAThonX", id: "PLEqK4ICkQWXSIToIKieukXc2MoRE4cGXh" },
  { key: "Hacktoberfest2025", id: "PLEqK4ICkQWXSzXKKtSffOiIEqpaCPykK6" },
  { key: "WikiTreeWeek2025", id: "PLEqK4ICkQWXQc9gNzdsCSXfQ7b43cJo3Y" },
  { key: "WikiTreeSymposium2025", id: "PLEqK4ICkQWXR03qkpUEODzxD2Tb0V26D_" },
  { key: "WTC2025", id: "PLEqK4ICkQWXQ8S9e2ZInhxgMZPT54E6YE" },
  { key: "AcademyStepOne", id: "PLbpyNhZ3GAlErTYma8WwaZu46bpJr_f99" },
  { key: "AcademyStepTwo", id: "PLbpyNhZ3GAlEpIRKIj-tR55BvSNJDeHS6" },
  { key: "AcademyStepThree", id: "PLbpyNhZ3GAlE50bqcRrY2264mCPX1T2mR" },
  { key: "AcademyStepFour", id: "PLbpyNhZ3GAlFieP2AfcR4aOUFIplmsqqg" },
  { key: "AcademyStepFive", id: "PLbpyNhZ3GAlFmy7eh4g2QQu7FEJjkj326" },
  { key: "AcademyStepSix", id: "PLbpyNhZ3GAlFKHLyGgp66ppHn-dRRMuP8" },
  { key: "TechTalk", id: "PLEqK4ICkQWXTZM7UsCJdQKUPOBC-FN7IW" },
  { key: "RootsTech2025", id: "PLEqK4ICkQWXQ4Zko0ic3b0J-xsuqNHUYe" },
  { key: "ElfMas2025", id: "PLEqK4ICkQWXQSlVu_n0Hmb-F7eqgW2ztZ" },
  { key: "ConnectAThonXVI", id: "PLEqK4ICkQWXRN13h6Ektsc-VkOe9Kb2YF" },
  { key: "ConnectAThonXVII", id: "PLEqK4ICkQWXTckn0iSMsVzT3j0qt91GvY" },
  { key: "ConnectAThonXVIII", id: "PLEqK4ICkQWXTPsckkfJp7vlIAJY02j08f" },
  { key: "SourceAThonXI", id: "PLEqK4ICkQWXSlKbq0xEvy0WKSHeToyHrZ" },
  { key: "Hacktoberfest2026", id: "PLEqK4ICkQWXRBBVI7xaL0AIIPck_x0TcC" },
  { key: "WikiTreeDay2026", id: "PLEqK4ICkQWXTKlctPvH74UJLzgnEhkpdF" },
  { key: "WTC2026", id: "PLEqK4ICkQWXT4Ko23lB2MKMx7AqZVU-d0" },
  { key: "ResearchPty", id: "PLEqK4ICkQWXSqUlME6i1riL7iJRA-l2kj" },
  { key: "1776", id: "PLEqK4ICkQWXTnWnAR8wmImqKg3G0MTf9i" },
  { key: "ProfileImprovement", id: "PLEqK4ICkQWXRIDMBST7Ng8M-F0uPLSg_e" },
  { key: "NewMbrHowTo", id: "PLEqK4ICkQWXS00osaNKPJSenUnPQtELeL" },
  { key: "EggHunt2026", id: "PLEqK4ICkQWXQPKfrI9wEwlfauUBDWyxCW" },
  { key: "A&E_AE", id: "PLALrLzRfbwvY" },
  { key: "HowTo", id: "PLEqK4ICkQWXRbdS1a3qzjOZCPL1X4V_1J" },
  { key: "ElfMas2026", id: "PLArAiVihsvPw" },
  { key: "WTC2027", id: "PLPnOe6e5b-Qg" },
  { key: "RootsTech2027", id: "PLJRAaIsRLmb8" },
  { key: "ConnectAThonXIX", id: "PLKOCYfYJvRrA" },
  { key: "ConnectAThonXX", id: "PLC60S8dL8-wY" },
  { key: "ConnectAThonXXI", id: "PLenJo5cX98Dg" },
  { key: "Hacktoberfest2027", id: "PLYbL07doq8Ec" },
  { key: "SourceAThonXII", id: "PLGZ-pzrwnMkY" },
  { key: "WikiTreeDay2027", id: "PLSXqX0y8Ogq0" },
];

// Given the "list" parameter from a YouTube URL, return the template playlist key or undefined.
function findWikiTreePlaylistKey(playlistId) {
  if (!playlistId) {
    return undefined;
  }
  const match = wikiTreePlaylists.find((playlist) => playlist.id == playlistId);
  return match ? match.key : undefined;
}

export { wikiTreePlaylists, findWikiTreePlaylistKey };
