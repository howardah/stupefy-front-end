import { Deck } from "../javascripts/deck";
import { titleCase } from "./utils/tools";

const contains = (tableau, items) => {
  if (tableau.some((item) => items.includes(item.name))) {
    for (let i = 0; i < tableau.length; i++) {
      if (items.includes(tableau[i].name)) return i;
    }
  }

  return -1;
};

export const CardRules = (key, player) => {
  if (player["my-turn"] === "azkaban") return { targets: [] };

  switch (key) {
    //=========== ====================== ===========//
    //=========== ====================== ===========//
    //=========== CHARACTER TARGET CARDS ===========//
    //=========== ====================== ===========//
    //=========== ====================== ===========//

    // These are cards that are handled by the
    // handleCharacterPlay() function. The effect inputs
    // are the ”Subject”, ie the player that is being
    // effected and the “Instigator”, ie the person playing
    // the card.

    case "stupefy":
      return {
        targets: player.character.shots > 0 ? ["others", "range"] : [],
        effect: (subject, instigator) => {
          instigator.character.shots--;
          let tableau = [],
            popupOptions = [
              { label: "Take a hit", function: "takeHit" },
              { label: "Play Protego", function: "playProtego" },
            ];

          const events = [
            {
              popup: {
                message:
                  instigator.character.shortName +
                  " has fired a stupefy at you!",
                options: [...popupOptions],
              },
              instigator: instigator,
              cardType: "stupefy",
              target: [subject.id],
            },
          ];

          return { events };
        },
      };
    case "wizards_duel":
      return {
        targets: ["others"],
        effect: (subject, instigator) => {
          let waitMessage =
            subject.character.shortName +
            " and " +
            instigator.character.shortName +
            " are fighting in a wizard’s dual!";
          const events = [
            {
              popup: {
                message:
                  instigator.character.shortName +
                  " has challanged you to a Wizard’s dual!",
                options: [
                  { label: "Take a hit", function: "takeHit" },
                  { label: "Play Stupefy", function: "dual" },
                ],
              },
              bystanders: {
                popupType: "subtle",
                message: waitMessage,
                options: [],
              },
              instigator: instigator,
              cardType: "wizards_duel",
              target: [subject.id],
            },
          ];

          return { events };
        },
      };
    case "butterbeer":
      return {
        targets: ["self"],
        effect: (subject, instigator, addAlert) => {
          if (subject.character.health >= subject.character["max-health"]) {
            addAlert("you're already at max-health!");
            return false;
          }
          subject.character.health++;

          // return false;
          return true;
        },
      };

    //=========== ====================== ===========//
    //=========== ====================== ===========//
    //=========== = TABLE TARGET CARDS = ===========//
    //=========== ====================== ===========//
    //=========== ====================== ===========//

    // These are cards that are handled by the
    // handleTablePlay() function. The effect inputs
    // are the Instigator, ie the player that is
    // playing the card.

    case "expelliarmus":
    case "expelliarmus_1":
    case "expelliarmus_2":
    case "expelliarmus_3":
      return {
        targets: ["table"],
        effect: (instigator, that) => {
          const players = [...that.state.players];
          let possibleCards = [];
          for (let i = 0; i < players.length; i++) {
            let player = players[i];
            if (player.id === instigator.id) continue;
            possibleCards.push(...player.hand);
            possibleCards.push(...player.tableau);
          }

          if (possibleCards.length === 0) {
            that.addAlert("No one has any cards!");
            return false;
          }

          const events = [
            {
              popup: {
                popupType: "subtle",
                message: "Choose another player’s card to discard",
                options: [],
              },
              instigator: instigator,
              cardType: "expelliarmus",
              bystanders: {
                popupType: "subtle",
                message:
                  instigator.character.shortName +
                  " is choosing a card to discard.",
                options: [],
              },
              target: [instigator.id],
            },
          ];

          that.addAction(events[0].popup);
          return { events };
        },
      };
    case "accio":
      return {
        targets: ["table"],
        effect: (instigator, that) => {
          //Check that you can steal something first.
          const players = [...that.state.players],
            instaIndex = that.findMe(instigator.id),
            range = players[instaIndex].tableau.some(
              (card) => card.name === "polyjuice_potion"
            )
              ? 2
              : 1;

          let possibleCards = [];

          for (let i = 0; i < players.length; i++) {
            let localrange = range,
              adjustedIndexP = i,
              adjustedIndexN = i;

            players[i].tableau.forEach((card) => {
              if (card.power?.distance !== undefined) {
                let distance = card.power.distance;
                localrange -= distance > 0 ? distance : 0;
              }
            });

            adjustedIndexP = i + localrange;
            adjustedIndexN = i - localrange;

            if (adjustedIndexP > players.length - 1)
              adjustedIndexP = adjustedIndexP - players.length;
            if (adjustedIndexN < 0)
              adjustedIndexN = players.length + adjustedIndexN;

            if (
              adjustedIndexP === instaIndex ||
              adjustedIndexN === instaIndex
            ) {
              possibleCards.push(...players[i].hand);
              possibleCards.push(...players[i].tableau);
            }
          }

          if (possibleCards.length === 0) {
            that.addAlert(
              "There are no cards within range than you can steal!"
            );
            return false;
          }

          const events = [
            {
              popup: {
                popupType: "subtle",
                message: "Choose a player’s card to steal",
                options: [],
              },
              instigator: instigator,
              cardType: "accio",
              target: [instigator.id],
              bystanders: {
                popupType: "subtle",
                message:
                  instigator.character.shortName +
                  " is choosing a card to steal.",
                options: [],
              },
            },
          ];

          that.addAction(events[0].popup);
          return { events };
        },
      };
    case "three_broomsticks":
      return {
        targets: ["table"],
        effect: (instigator, that) => {
          const players = [...that.state.players];

          for (let i = 0; i < players.length; i++) {
            if (
              players[i].character.health < players[i].character["max-health"]
            ) {
              players[i].character.health++;
            }
          }

          that.emitEvent({ players });

          return "discard";
        },
      };
    case "weasleys_wizard_weezes":
      return {
        targets: ["table"],
        effect: (instigator, that) => {
          const players = [...that.state.players],
            player = players[that.findMe(instigator.id)];

          player.character.draw += 3;
          that.emitEvent({ players });
          return "discard";
        },
      };
    case "honeydukes":
      return {
        targets: ["table"],
        effect: (instigator, that) => {
          const players = [...that.state.players],
            player = players[that.findMe(instigator.id)];

          player.character.draw += 2;
          that.emitEvent({ players });
          return "discard";
        },
      };
    case "diagon_alley":
      return {
        targets: ["table"],
        effect: (instigator, that, table, deck) => {
          const players = [...that.state.players],
            instaIndex = that.findMe(instigator.id),
            // table = [...that.state.table],
            // deck = new Deck(that.state.deck.cards, that.state.deck.discards),
            events = [...that.state.events];

          table.push(...deck.drawCards(5));

          for (let i = 0; i < that.turnOrder; i++) {
            let adjustedIndex = i + that.state.turnOrder.indexOf(instigator.id);

            if (adjustedIndex >= that.state.turnOrder.length)
              adjustedIndex = adjustedIndex - that.state.turnOrder.length;

            let mainMessage =
              i === instaIndex
                ? "Diagon Alley! Take a card from the table!"
                : instigator.character.shortName +
                  " has played Diagon Alley! Your turn to take a card!";

            let waitMessage =
              i === instaIndex
                ? "Everyone else is choosing their cards."
                : instigator.character.shortName + " has played Diagon Alley!";

            events.push({
              popup: {
                popupType: "subtle",
                message: mainMessage,
                options: [],
              },
              bystanders: {
                popupType: "subtle",
                message: waitMessage,
                options: [],
              },
              instigator: instigator,
              cardType: "diagon_alley",
              target: [that.state.turnOrder[adjustedIndex]],
            });
          }

          // that.addAction(events[0].popup);
          that.emitEvent({ events });

          // that.emitEvent({ table, deck, events });
          // return false;
          return "discard";
        },
      };
    case "dementors":
      return {
        targets: ["table"],
        effect: (instigator, that) => {
          const instaIndex = that.findMe(instigator.id);
          let targets = [];
          // let waitMessage = "Demontor attack! You’re safe.";
          that.state.players.forEach((player, i) => {
            if (i === instaIndex) return;
            if (
              !player.tableau.some((card) => card.name === "expecto_patronum")
            ) {
              targets.push(player.id);
            }
          });

          const events = [...that.state.events],
            dementorEvent = {
              popup: {
                message:
                  "Dementors attack! Play a Stupefy card to fight them off!",
                options: [
                  {
                    label: "Take a hit",
                    function: "takeHit",
                  },
                  {
                    label: "Play a stupefy",
                    function: "playStupefy",
                  },
                ],
              },
              bystanders: {
                popupType: "subtle",
                message: "Whoosh, you’re past the Dementors now!",
                options: [],
              },
              instigator: instigator,
              cardType: "wizards_duel",
              target: [...targets],
            };

          events.push(dementorEvent);

          that.emitEvent({ events });

          return true;
        },
      };
    case "garroting_gas":
      return {
        targets: ["table"],
        effect: (instigator, that) => {
          const targets = [...that.state.turnOrder];

          const events = [...that.state.events],
            garroting_gas = {
              popup: {
                message:
                  instigator.character.shortName +
                  " played Garroting Gas! Eveyone must cast a protego card or take a hit.",
                options: [
                  {
                    label: "Take a hit",
                    function: "takeHit",
                  },
                  {
                    label: "Cast a protego",
                    function: "playProtego",
                  },
                ],
              },
              bystanders: {
                popupType: "subtle",
                message: "Whoosh, you’re safe now!",
                options: [],
              },
              instigator: instigator,
              cardType: "garroting_gas",
              target: [...targets],
            };

          events.push(garroting_gas);

          that.emitEvent({ events });

          return true;
        },
      };

    //=========== ====================== ===========//
    //=========== ====================== ===========//
    //===========  TABLEAU TARGET CARDS  ===========//
    //=========== ====================== ===========//
    //=========== ====================== ===========//

    // These are cards that are handled by the
    // handleTableauPlay() function. The effect inputs
    // are the Instigator, ie the player that is
    // playing the card.
    case "aspen_wand":
    case "yew_wand":
    case "holly_wand":
    case "elder_wand":
    case "larch_wand":
    case "blackthorn_wand":
      return {
        targets: ["my-tableau"],
        effect: (player, that) => {
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

          if (overlap !== -1) {
            that.addAlert(
              "You cannot hold more than one wand! Discard your current one to add another."
            );
            return false;
          }

          return true;
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
        effect: (player, that) => {
          // let deck = new Deck(odeck.cards, odeck.discards);
          const overlap = contains(player.tableau, [key]);

          // if (overlap !== -1 && overlap !== player.tableau.length - 1)
          // deck.serveCard(player.tableau.splice(overlap, 1)[0]);

          if (overlap !== -1) {
            that.addAlert(
              "You cannot hold more than one “" +
                titleCase(key.replace("_", " ")) +
                "”!"
            );
            return false;
          }

          return true;
        },
      };
    case "azkaban":
      return {
        targets: ["tableau"],
        effect: (player, that) => {
          const overlap = contains(player.tableau, [key]);

          console.log(player);
          if (overlap !== -1) {
            that.addAlert("They’re already in Azkaban!");
            return false;
          }

          return true;
        },
      };
    case "fiendfyre":
      return {
        targets: ["tableau"],
        effect: (player, that) => {
          const players = [...that.state.players],
            subject = players[that.findMe(player.id)],
            instigator =
              players[that.findMe(that.state.reaction.instigator.id)],
            cardIndex = instigator.hand.findIndex(
              (card) => card.id === that.state.reaction.card.id
            ),
            deck = new Deck(that.state.deck.cards, that.state.deck.discards);

          console.log(player);

          const events = [...that.state.events],
            fiendfyreEvent = {
              popup: {
                message:
                  instigator.character.shortName +
                  " has played Fiendfyre! Draw a card to see if you make it past",
                options: [
                  // {
                  //   label: "Draw to see if you make it past",
                  //   function: "fiendfyre",
                  // },
                ],
                popupType: "subtle",
              },
              bystanders: {
                popupType: "subtle",
                message:
                  instigator.character.shortName +
                  " has played Fiendfyre! It’s " +
                  subject.character.shortName +
                  "’s turn to draw.",
                options: [],
              },
              instigator: instigator,
              cardType: "fiendfyre",
              target: [subject.id],
            };

          events.push(fiendfyreEvent);

          deck.serveCard(instigator.hand.splice(cardIndex, 1)[0]);

          that.emitEvent({ events, players });

          return false;
        },
      };
    default:
      return { targets: [], effect: "" };
  }
};
