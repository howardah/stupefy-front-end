import { Deck } from "../javascripts/deck";

const contains = (tableau, items) => {
  if (tableau.some((item) => items.includes(item.name))) {
    for (let i = 0; i < tableau.length; i++) {
      if (items.includes(tableau[i].name)) return i;
    }
  }

  return -1;
};

export const CardRules = (key, player) => {
  switch (key) {
    case "stupefy":
      return {
        targets: player.character.shots > 0 ? ["others", "reach"] : [],
        "require-reaction": ["target"],
        effect: (playerId, instigator) => {
          instigator.character.shots--;
          const attack = {
            popup: {
              message:
                instigator.character.name + " has fired a stupefy at you!",
              options: [
                { label: "Take a hit", function: "takeHit" },
                { label: "Play Protego", function: "playProtego" },
              ],
            },
            cardType: "stupefy",
            target: playerId,
          };

          return { attack };
        },
      };
    case "aspen_wand":
    case "yew_wand":
    case "holly_wand":
    case "elder_wand":
    case "larch_wand":
    case "blackthorn_wand":
      return {
        targets: ["my-tableau"],
        effect: (player, deck) => {
          let theDeck = new Deck(deck.cards, deck.discards);

          let otherwands = [
            "aspen_wand",
            "yew_wand",
            "holly_wand",
            "elder_wand",
            "larch_wand",
            "blackthorn_wand",
          ];

          otherwands.splice(otherwands.indexOf(key), 1);
          const overlap = contains(player.tableau, otherwands);

          overlap !== -1 &&
            theDeck.serveCard(player.tableau.splice(overlap, 1)[0]);

          return { player, theDeck };
        },
      };
    case "broomstick":
    case "expecto_patronum":
    case "invisibility_cloak":
    case "polyjuice_potion":
    case "resurrection_stone":
    case "vanishing_cabinet":
      return {
        targets: ["my-tableau"],
        effect: (player, deck) => {
          let theDeck = new Deck(deck.cards, deck.discards);
          const overlap = contains(player.tableau, [key]);

          if (overlap !== -1 && overlap !== player.tableau.length - 1)
            theDeck.serveCard(player.tableau.splice(overlap, 1)[0]);

          return { player, theDeck };
        },
      };
    case "azkaban":
      return {
        targets: ["tableau"],
        effect: (player, deck) => {
          console.log(player);
        },
      };
    case "fiendfyre":
      return {
        targets: ["tableau"],
        effect: (player) => {
          console.log(player);
        },
      };
    case "dementors":
      return {
        targets: ["table"],
        effect: (oplayers) => {
          console.log(oplayers);
        },
      };
    default:
      return { targets: [], effect: "" };
  }
};

export const resolveAttack = (key, player) => {
  switch (key) {
    case "stupefy":
      return {
        targets: player.character.shots > 0 ? ["others", "reach"] : [],
        "require-reaction": ["target"],
        effect: (oPlayers, playerIndex) => {
          let players = [...oPlayers],
            instigator = players.findIndex((player) => {
              return player["my-turn"];
            });

          players[playerIndex].character.health--;
          players[instigator].character.shots--;

          let newOrder = players.splice(0, 3);

          return { players: [...players, ...newOrder] };
        },
      };
    case "aspen_wand":
    case "yew_wand":
    case "holly_wand":
    case "elder_wand":
    case "larch_wand":
    case "blackthorn_wand":
      return {
        targets: ["my-tableau"],
        effect: (player, deck) => {
          let theDeck = new Deck(deck.cards, deck.discards);

          let otherwands = [
            "aspen_wand",
            "yew_wand",
            "holly_wand",
            "elder_wand",
            "larch_wand",
            "blackthorn_wand",
          ];

          otherwands.splice(otherwands.indexOf(key), 1);
          const overlap = contains(player.tableau, otherwands);

          overlap !== -1 &&
            theDeck.serveCard(player.tableau.splice(overlap, 1)[0]);

          return { player, theDeck };
        },
      };
    case "broomstick":
    case "expecto_patronum":
    case "invisibility_cloak":
    case "polyjuice_potion":
    case "resurrection_stone":
    case "vanishing_cabinet":
      return {
        targets: ["my-tableau"],
        effect: (player, deck) => {
          let theDeck = new Deck(deck.cards, deck.discards);
          const overlap = contains(player.tableau, [key]);

          if (overlap !== -1 && overlap !== player.tableau.length - 1)
            theDeck.serveCard(player.tableau.splice(overlap, 1)[0]);

          return { player, theDeck };
        },
      };
    case "azkaban":
      return {
        targets: ["tableau"],
        effect: (player, deck) => {
          console.log(player);
        },
      };
    case "fiendfyre":
      return {
        targets: ["tableau"],
        effect: (player) => {
          console.log(player);
        },
      };
    case "dementors":
      return {
        targets: ["table"],
        effect: (oplayers) => {
          console.log(oplayers);
        },
      };
    default:
      return { targets: [], effect: "" };
  }
};

// export default CardRules, resolveAttack;
