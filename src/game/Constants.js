export const START_REQ = {
  "small": 2,
  "large": 5
};
  
export const EVOLUTION = {
  "small": ["proto", "proto", "msq", "msq", "red", "red", "white"],
  "large": ["proto", "msq", "redsuper", "supernova", "bh"]
};

export const STAR_NAMES = {
  "proto": "Protostar",
  "msq": "Main sequence star",
  "red": "Red giant",
  "white": "White dwarf",
  "redsuper": "Red supergiant",
  "supernova": "Supernova",
  "bh": "Black hole"
}

export const ACTION_NAMES = {
  makeStar: "Make star",
  freezeStars: "Freeze stars",
  getHydrogen: "Get hydrogen",
  challenge: "Challenge"
}

export const DRAW_CARDS = 3;

export const Combo = (name, cards, score) => ({
  name, 
  cards,
  score
});

export const SCORING_COMBOS = [
  Combo("Pleiades", {"msq": 7}, 15),
  Combo("Life cycle 2", {"proto": 1, "msq": 1, "redsuper": 1, "supernova": 1}, 10),
  Combo("Life cycle 1", {"proto": 1, "msq": 1, "red": 1, "white": 1}, 8),
  Combo("Summer triangle", {"msq": 2, "redsuper": 1}, 6),
  Combo("Explosions", {"supernova": 2}, 6),
  Combo("Triple star", {"msq": 3}, 5),
  Combo("Beginning and end", {"proto": 1, "white": 1}, 3),
  Combo("Binary star", {"msq": 2}, 2),
];

export const INITIAL_CHALLENGES = 5;