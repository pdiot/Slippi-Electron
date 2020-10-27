const EXTERNALCHARACTERS = [
    {
      id: 2,
      name: "Captain Falcon",
      shortName: "Falcon",
      colors: ["Default", "Black", "Red", "White", "Green", "Blue"],
    },
    {
      id: 3,
      name: "Donkey Kong",
      shortName: "DK",
      colors: ["Default", "Black", "Red", "Blue", "Green"],
    },
    {
      id: 1,
      name: "Fox",
      shortName: "Fox",
      colors: ["Default", "Red", "Blue", "Green"],
    },
    {
      id: 24,
      name: "Mr. Game & Watch",
      shortName: "G&W",
      colors: ["Default", "Red", "Blue", "Green"],
    },
    {
      id: 4,
      name: "Kirby",
      shortName: "Kirby",
      colors: ["Default", "Yellow", "Blue", "Red", "Green", "White"],
    },
    {
      id: 5,
      name: "Bowser",
      shortName: "Bowser",
      colors: ["Default", "Red", "Blue", "Black"],
    },
    {
      id: 6,
      name: "Link",
      shortName: "Link",
      colors: ["Default", "Red", "Blue", "Black", "White"],
    },
    {
      id: 17,
      name: "Luigi",
      shortName: "Luigi",
      colors: ["Default", "White", "Blue", "Red"],
    },
    {
      id: 0,
      name: "Mario",
      shortName: "Mario",
      colors: ["Default", "Yellow", "Black", "Blue", "Green"],
    },
    {
      id: 18,
      name: "Marth",
      shortName: "Marth",
      colors: ["Default", "Red", "Green", "Black", "White"],
    },
    {
      id: 16,
      name: "Mewtwo",
      shortName: "Mewtwo",
      colors: ["Default", "Red", "Blue", "Green"],
    },
    {
      id: 8,
      name: "Ness",
      shortName: "Ness",
      colors: ["Default", "Yellow", "Blue", "Green"],
    },
    {
      id: 9,
      name: "Peach",
      shortName: "Peach",
      colors: ["Default", "Daisy", "White", "Blue", "Green"],
    },
    {
      id: 12,
      name: "Pikachu",
      shortName: "Pikachu",
      colors: ["Default", "Red", "Party Hat", "Cowboy Hat"],
    },
    {
      id: 10,
      name: "Ice Climbers",
      shortName: "ICs",
      colors: ["Default", "Green", "Orange", "Red"],
    },
    {
      id: 15,
      name: "Jigglypuff",
      shortName: "Puff",
      colors: ["Default", "Red", "Blue", "Headband", "Crown"],
    },
    {
      id: 13,
      name: "Samus",
      shortName: "Samus",
      colors: ["Default", "Pink", "Black", "Green", "Purple"],
    },
    {
      id: 14,
      name: "Yoshi",
      shortName: "Yoshi",
      colors: ["Default", "Red", "Blue", "Yellow", "Pink", "Cyan"],
    },
    {
      id: 19,
      name: "Zelda",
      shortName: "Zelda",
      colors: ["Default", "Red", "Blue", "Green", "White"],
    },
    {
      id: 7,
      name: "Sheik",
      shortName: "Sheik",
      colors: ["Default", "Red", "Blue", "Green", "White"],
    },
    {
      id: 22,
      name: "Falco",
      shortName: "Falco",
      colors: ["Default", "Red", "Blue", "Green"],
    },
    {
      id: 20,
      name: "Young Link",
      shortName: "YLink",
      colors: ["Default", "Red", "Blue", "White", "Black"],
    },
    {
      id: 21,
      name: "Dr. Mario",
      shortName: "Doc",
      colors: ["Default", "Red", "Blue", "Green", "Black"],
    },
    {
      id: 26,
      name: "Roy",
      shortName: "Roy",
      colors: ["Default", "Red", "Blue", "Green", "Yellow"],
    },
    {
      id: 23,
      name: "Pichu",
      shortName: "Pichu",
      colors: ["Default", "Red", "Blue", "Green"],
    },
    {
      id: 25,
      name: "Ganondorf",
      shortName: "Ganon",
      colors: ["Default", "Red", "Blue", "Green", "Purple"],
    },
];

const STAGES = [
    {
        id: 32,
        name: "Final Destination"
    },
    {
        id: 2,
        name: "Fountain of Dreams"
    },
    {
        id: 28,
        name: "Dream Land"
    },
    {
        id: 31,
        name: "Battlefield"
    },
    {
        id: 8,
        name: "Yoshi's story"
    },
    {
        id: 3,
        name: "Pokemon Stadium"
    }
];

const EXTERNALMOVES = {
    1: {
      // This includes all thrown items, zair, luigi's taunt, samus bombs, etc
      id: 1,
      name: "Miscellaneous",
      shortName: "misc",
    },
    2: {
      id: 2,
      name: "Jab",
      shortName: "jab",
    },
    3: {
      id: 3,
      name: "Jab",
      shortName: "jab",
    },
    4: {
      id: 4,
      name: "Jab",
      shortName: "jab",
    },
    5: {
      id: 5,
      name: "Rapid Jabs",
      shortName: "rapid-jabs",
    },
    6: {
      id: 6,
      name: "Dash Attack",
      shortName: "dash",
    },
    7: {
      id: 7,
      name: "Forward Tilt",
      shortName: "ftilt",
    },
    8: {
      id: 8,
      name: "Up Tilt",
      shortName: "utilt",
    },
    9: {
      id: 9,
      name: "Down Tilt",
      shortName: "dtilt",
    },
    10: {
      id: 10,
      name: "Forward Smash",
      shortName: "fsmash",
    },
    11: {
      id: 11,
      name: "Up Smash",
      shortName: "usmash",
    },
    12: {
      id: 12,
      name: "Down Smash",
      shortName: "dsmash",
    },
    13: {
      id: 13,
      name: "Neutral Air",
      shortName: "nair",
    },
    14: {
      id: 14,
      name: "Forward Air",
      shortName: "fair",
    },
    15: {
      id: 15,
      name: "Back Air",
      shortName: "bair",
    },
    16: {
      id: 16,
      name: "Up Air",
      shortName: "uair",
    },
    17: {
      id: 17,
      name: "Down Air",
      shortName: "dair",
    },
    18: {
      id: 18,
      name: "Neutral B",
      shortName: "neutral-b",
    },
    19: {
      id: 19,
      name: "Side B",
      shortName: "side-b",
    },
    20: {
      id: 20,
      name: "Up B",
      shortName: "up-b",
    },
    21: {
      id: 21,
      name: "Down B",
      shortName: "down-b",
    },
    50: {
      id: 50,
      name: "Getup Attack",
      shortName: "getup",
    },
    51: {
      id: 51,
      name: "Getup Attack (Slow)",
      shortName: "getup-slow",
    },
    52: {
      id: 52,
      name: "Grab Pummel",
      shortName: "pummel",
    },
    53: {
      id: 53,
      name: "Forward Throw",
      shortName: "fthrow",
    },
    54: {
      id: 54,
      name: "Back Throw",
      shortName: "bthrow",
    },
    55: {
      id: 55,
      name: "Up Throw",
      shortName: "uthrow",
    },
    56: {
      id: 56,
      name: "Down Throw",
      shortName: "dthrow",
    },
    61: {
      id: 61,
      name: "Edge Attack (Slow)",
      shortName: "edge-slow",
    },
    62: {
      id: 62,
      name: "Edge Attack",
      shortName: "edge",
    },
};

module.exports = {
  EXTERNALCHARACTERS: EXTERNALCHARACTERS,
  STAGES: STAGES,
  EXTERNALMOVES: EXTERNALMOVES
}