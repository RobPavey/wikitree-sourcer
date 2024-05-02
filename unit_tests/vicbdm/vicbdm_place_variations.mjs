// created from https://web.archive.org/web/20230328031046/https://bdmabbreviations.steveparker.id.au/

const vicbdmPlaceVariations = {
  alberton: ["Alburton"],
};

// proposed new format
const places = [
  {
    name: "Coongulmerang",
    clarification: "Parish of Coongulmerang",
    variations: [
      {
        name: "Co On",
        uses: {
          births: ["1882", "1885", "1893"],
        },
      },
      {
        name: "Coon",
      },
    ],
  },
  {
    name: "Codrington",
    variations: [
      {
        name: "Coor",
        clarification: "Parish of Coongulmerang",
        uses: {
          births: ["1862-64", "1870", "1887"],
        },
        isTransciptionError: true,
      },
    ],
  },
  {
    name: "Cooriemungle",
    variations: [
      {
        name: "Coor",
        uses: {
          deaths: ["1958-83"],
        },
      },
    ],
  },
];

export { vicbdmPlaceVariations };
