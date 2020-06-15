import { Deck } from "./deck";

export const cardRules = {
  stupefy: () => {
    console.log("Shot ye!");
  },
  protego: () => {
    console.log("no you didn't!");
  },
};

export const randomSkin = {
  expelliarmus: () => {
    return "expelliarmus_" + Math.ceil(Math.random() * 3);
  },
};

export const mainDeck = () => {
  let houses = Array(82)
    .fill("G", 0, 20)
    .fill("R", 20, 41)
    .fill("S", 41, 61)
    .fill("H", 61, 82);
  let accio = Array(4).fill("accio"),
    stupefy = Array(25).fill("stupefy"),
    protego = Array(12).fill("protego"),
    azkaban = Array(3).fill("azkaban"),
    beer = Array(6).fill("butterbeer"),
    expelliarmus = Array(4).fill("expelliarmus"),
    others = [
      "larch_wand",
      "holly_wand",
      "yew_wand",
      "elder_wand",
      "aspen_wand",
      "fiendfyre",
      "broomstick",
      "broomstick",
      "polyjuice_potion",
      "resurrection_stone",
      "expecto_patronum",
      "wizards_duel",
      "wizards_duel",
      "wizards_duel",
      "weasleys_wizard_weezes",
      "vanishing_cabinet",
      "vanishing_cabinet",
      "invisibility_cloak",
      "felix_felicis",
      "dementors",
      "dementors",
      "apparate",
      "three_broomsticks",
      "honeydukes",
      "honeydukes",
      "garroting_gas",
      "diagon_alley",
      "diagon_alley",
    ],
    deck = [
      ...accio,
      ...stupefy,
      ...protego,
      ...azkaban,
      ...beer,
      ...others,
      ...expelliarmus,
    ];

  deck.forEach((v, i) => {
    deck[i] = {
      name: v,
      fileName: v in randomSkin ? randomSkin[v]() : v,
      house: houses.splice(Math.floor(Math.random() * houses.length), 1)[0],
    };
  });

  return deck;
};

export const characters = [
  {
    fileName: "albus_dumbledore",
    name: "Albus Dumbledore",
    house: "G",
    health: 4,
  },
  {
    fileName: "arthur_weasley",
    name: "Arthur Weasley",
    house: "G",
    health: 4,
  },
  {
    fileName: "bellatrix_lestrange",
    name: "Bellatrix Lestrange",
    house: "S",
    health: 4,
  },
  {
    fileName: "cedric_diggory",
    name: "Cedric Diggory",
    house: "H",
    health: 4,
  },
  {
    fileName: "dobby",
    name: "Dobby",
    house: "",
    health: 4,
  },
  {
    fileName: "dolores_umbridge",
    name: "Dolores Umbridge",
    house: "S",
    health: 4,
  },
  {
    fileName: "draco_malfoy",
    name: "Draco Malfoy",
    house: "S",
    health: 3,
  },
  {
    fileName: "fenrir_greyback",
    name: "Fenrir Greyback",
    house: "S",
    health: 4,
  },
  {
    fileName: "fred_and_george",
    name: "Fred & George Weasley",
    house: "G",
    health: 4,
  },
  {
    fileName: "gilderoy_lockhart",
    name: "Gilderoy Lockhart",
    house: "R",
    health: 4,
  },
  {
    fileName: "ginny_weasley",
    name: "Ginny Weasley",
    house: "G",
    health: 4,
  },
  {
    fileName: "harry_potter",
    name: "Harry Potter",
    house: "G",
    health: 3,
  },
  {
    fileName: "hermione_granger",
    name: "Hermione Granger",
    house: "G",
    health: 4,
  },
  {
    fileName: "james_potter",
    name: "James Potter",
    house: "G",
    health: 4,
  },
  {
    fileName: "lily_potter",
    name: "Lily Potter",
    house: "G",
    health: 4,
  },
  {
    fileName: "lucius_malfoy",
    name: "Lucius Malfoy",
    house: "S",
    health: 4,
  },
  {
    fileName: "luna_lovegood",
    name: "Luna Lovegood",
    house: "R",
    health: 3,
  },
  {
    fileName: "mad-eye_moody",
    name: 'Alastor "Mad-Eye" Moody',
    house: "R",
    health: 4,
  },
  {
    fileName: "minerva_mchonagall",
    name: "Minerva McGonagall",
    house: "G",
    health: 4,
  },
  {
    fileName: "molly_weasley",
    name: "Molly Weasley",
    house: "G",
    health: 4,
  },
  {
    fileName: "mundungus_fletcher",
    name: "Mundungus Fletcher",
    house: "S",
    health: 4,
  },
  {
    fileName: "neville_longbottom",
    name: "Neville Longbottom",
    house: "G",
    health: 4,
  },
  {
    fileName: "nymphadora_tonks",
    name: "Nymphadora Tonks",
    house: "H",
    health: 4,
  },
  {
    fileName: "peeves",
    name: "Peeves",
    house: "",
    health: 3,
  },
  {
    fileName: "peter_pettigrew",
    name: "Peter Pettigrew",
    house: "G",
    health: 3,
  },
  {
    fileName: "remus_lupin",
    name: "Remus Lupin",
    house: "G",
    health: 4,
  },
  {
    fileName: "ron_weasley",
    name: "Ron Weasley",
    house: "G",
    health: 4,
  },
  {
    fileName: "rubeus_hagrid",
    name: "Rubeus Hagrid",
    house: "G",
    health: 4,
  },
  {
    fileName: "severus_snape",
    name: "Severus Snape",
    house: "S",
    health: 3,
  },
  {
    fileName: "sirius_black",
    name: "Sirius Black",
    house: "G",
    health: 4,
  },
  {
    fileName: "voldemort",
    name: "Voldemort",
    house: "S",
    health: 3,
  },
];

// export const Deck = class {
//   constructor(cards, discards) {
//     this.cards = cards || [];
//     this.discards = discards || [];
//   }

//   getLength() {
//     return this.cards.length;
//   }

//   drawCards(number, discard) {
//     if (discard) return this.discards.splice(0, number);
//     if (this.cards.length === 0) this.shuffle();
//     return this.cards.splice(0, number);
//   }

//   backToTheTop(cards) {
//     this.cards.unshift(cards);
//   }

//   serveCard(inCard) {
//     this.discards.unshift(inCard);
//   }

//   shuffle() {
//     let toShuffle = [...this.cards, ...this.discards];

//     for (let i = toShuffle.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * i);
//       const temp = toShuffle[i];
//       toShuffle[i] = toShuffle[j];
//       toShuffle[j] = temp;
//     }

//     this.cards = toShuffle;
//     this.discards = [];
//   }
// };

const initialDeck = new Deck(mainDeck()),
  characterDeck = new Deck(characters);

initialDeck.shuffle();
characterDeck.shuffle();

export const players = [
    {
      id: 0,
      name: "Adam",
      character: characterDeck.drawCards(1)[0],
      tableau: [{ fileName: "aspen_wand", house: "R", name: "aspen_wand" }],
      hand: [
        initialDeck.drawCards(1)[0],
        initialDeck.drawCards(1)[0],
        initialDeck.drawCards(1)[0],
      ],
    },
    {
      id: 1,
      name: "Eleven",
      character: characterDeck.drawCards(1)[0],
      tableau: [],
      hand: [initialDeck.drawCards(1)[0], initialDeck.drawCards(1)[0]],
    },
    {
      id: 2,
      name: "Doug",
      character: characterDeck.drawCards(1)[0],
      tableau: [],
      hand: [initialDeck.drawCards(1)[0], initialDeck.drawCards(1)[0]],
    },
    {
      id: 3,
      name: "Kurt",
      character: characterDeck.drawCards(1)[0],
      tableau: [],
      hand: [initialDeck.drawCards(1)[0], initialDeck.drawCards(1)[0]],
    },
    {
      id: 4,
      name: "Velcro",
      character: characterDeck.drawCards(1)[0],
      tableau: [],
      hand: [initialDeck.drawCards(1)[0], initialDeck.drawCards(1)[0]],
    },
  ],
  theDeck = initialDeck;

export const emptyCard = { fileName: "", house: "", name: "" };

export { initialDeck, characterDeck };
