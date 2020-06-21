import React, { Component, useRef } from "react";
import Player from "./player";
import CardDeck from "./card-deck";
import { Deck } from "../javascripts/deck";
import { CardRules } from "./card-rules";
import { resolveEvent } from "./utils/resolve-event";
import { protegoOptions } from "./utils/character-events";
import SideBar from "./sidebar";
import Alert from "./alert";
import Action from "./action";
import Table from "./table";
import socketIOClient from "socket.io-client";
import { ef } from "../javascripts/event-functions";
const ENDPOINT =
  process.env.NODE_ENV !== "development"
    ? window.location.origin
    : window.location.origin.replace(window.location.port, "4001");
// const ENDPOINT = window.location.origin "http://127.0.0.1:4001";
const socket = socketIOClient(ENDPOINT);

const emptyReaction = {
  instigator: false,
  card: [],
  targets: [],
  effects: "",
  location: "",
};

const thisPlayeri = (oplayers, id) => {
  return oplayers.findIndex((player) => {
    return player.id === Number(id);
  });
};
const initialPlayers = (oplayers, id, turn) => {
  const players = [...oplayers];
  const playerIndex = oplayers.findIndex((player) => {
    return player.id === Number(id);
  });

  const beforePlayer = players.splice(0, playerIndex);

  if (
    turn === id &&
    players[0].tableau.some((card) => {
      return card.name === "azkaban";
    })
  ) {
    players[0]["my-turn"] = "azkaban";
  } else {
    players[0]["my-turn"] = turn === id;
  }

  return [...players, ...beforePlayer];
};

class Board extends Component {
  state = {
    players: initialPlayers(
      this.props.players,
      this.props.query.id,
      this.props.turn
    ),
    deck: this.props.deck,
    reaction: emptyReaction,
    actions: {
      message: "",
      options: [],
    },
    events: this.props.events,
    alerts: [
      // "Welcome " +
      //   this.props.players[thisPlayeri(this.props.players, this.state.player_id)]
      //     .name +
      //   "!",
    ],
    table: this.props.table,
    turn: this.props.turn,
    freeze: false,
    player_id: this.props.query.id,
    player_room: this.props.query.room,
  };

  nextTurn = () => {
    let turn = this.state.turn;
    turn++;
    if (turn >= this.state.players.length) turn = 0;

    // this.setState({ turn });
    this.emitEvent({ turn });
  };

  componentDidUpdate(pprops, pstate) {
    if (pstate.turn !== this.state.turn) this.startTurn();
  }

  handleActionResponse = (action, index) => {
    console.log(action);
    console.log(index);
    if (action === "" || ef[action](this, index)) {
      console.log("made it through!");
    }
  };

  componentDidMount() {
    // const players = [...this.state.players],
    //   thisIndex = this.findMe(this.state.player_id);
    // console.log(thisIndex);
    // players[0].hand[1] = players[0].hand[1][0];

    // this.emitEvent({ players });
    // this.state.player_id = this.props.query.id;
    // this.state.player_room = this.props.query.room;

    if (
      this.state.players[this.findMe(this.state.player_id)]["my-turn"] ===
      "azkaban"
    )
      this.addAlert(
        "You’re in Azkaban! Draw the top card of the deck to see if you escape."
      );

    socket.on("FromAPI", (data) => {
      this.catchSocket(data);
    });

    socket.emit("join-room", this.state.player_room);

    this.props.onRef(this);
    // console.log("only this once");
    const popup = this.popUp(this.state),
      actions = popup ? popup : this.state.actions;

    this.setState({ actions });
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  selectCard = (player, card) => {
    console.log(this.state.turn);
    console.log(this.state.events);
    console.log(this.state.actions);
    // console.log(card);
    if (card.name === "") return;
    let reaction;
    //check if card is in hand or an tableau
    const cardIndex = player.hand.indexOf(card);

    //see if the target is the discard
    let discard = cardIndex === -1;

    //If this is the first card they're clicking on
    //or if they've changed from their hand to their tableau
    //or vice versa
    if (
      this.state.reaction.card.length === 0 ||
      !((cardIndex === -1) === (this.state.reaction.location === "tableau"))
    ) {
      const rule = CardRules(card.name, player);

      reaction = {
        instigator: player,
        card: [Object.assign(card)],
        location: cardIndex === -1 ? "tableau" : "hand",
        effects: rule.effect,
        targets: discard ? ["discard"] : rule.targets,
      };

      console.log(reaction);
    }
    //If they've already selected a card
    else {
      reaction = Object.assign(this.state.reaction);
      //is it a card that they didn't already have selected?
      if (
        !reaction.card?.some((arrcard) => {
          return arrcard.id === card?.id;
        })
      ) {
        //add the new card and change the targets
        reaction.card.push(Object.assign(card));
        reaction.targets = ["discard", "special"];
      } else {
        //If they didn't select a new card, then we want
        //to de-select the old card
        const cardIndex = reaction?.card?.findIndex((arrcard) => {
          return arrcard.id === card.id;
        });

        reaction.card.splice(cardIndex, 1);

        //If they only have one card selected now, we need to
        //set the object to reflect that card's actions
        if (reaction.card.length === 1) {
          const rule = CardRules(reaction.card[0].name, player);

          reaction.effects = rule.effect;
          reaction.targets = discard ? ["discard"] : rule.targets;
        }
        //if they removed the last card, then the reaction
        //object should be cleared
        reaction.card.length === 0 && (reaction = emptyReaction);
      }
      // console.log(reaction);
      // console.log(player.hand);
    }
    this.setState({ reaction });
  };

  handleCharacterPlay = (player, character) => {
    const players = [...this.state.players],
      subject = players[this.findMe(player.id)];

    //Most cards will require a response from the target
    const cardReturn = this.state.reaction.effects(
      subject,
      this.state.reaction.instigator,
      this.addAlert
    );

    if (!cardReturn) return;

    const dObj = this.discardCard(
      players,
      this.state.reaction.instigator,
      this.state.reaction.card
    );

    let returnEvent = {
      players: dObj.players,
      deck: dObj.deck,
      reaction: emptyReaction,
    };

    if (cardReturn.events !== undefined) returnEvent.events = cardReturn.events;

    this.emitEvent(returnEvent);
  };

  handleTableauPlay = (player, card) => {
    const players = [...this.state.players],
      instaIndex = players.indexOf(this.state.reaction.instigator),
      cardIndex = players[instaIndex].hand.indexOf(this.state.reaction.card[0]),
      playerIndex = players.indexOf(player);

    //Most cards will require a response from the target
    const cardReturn = this.state.reaction.effects(players[playerIndex], this);

    if (!cardReturn) return;

    players[playerIndex].tableau.push(
      players[instaIndex].hand.splice(cardIndex, 1)[0]
    );

    // players[instaIndex].tableau = [...dObj["player"].tableau];

    this.emitEvent({
      players: players,
      reaction: emptyReaction,
    });
  };

  handleTablePlay = (player, card) => {
    const players = [...this.state.players],
      instaIndex = players.indexOf(this.state.reaction.instigator),
      cardIndex = players[instaIndex].hand.indexOf(this.state.reaction.card[0]),
      deck = new Deck(this.state.deck.cards, this.state.deck.discards),
      table = [...this.state.table];

    //Most cards will require a response from the target
    const cardReturn = this.state.reaction.effects(
      players[instaIndex],
      this,
      table,
      deck
    );

    if (!cardReturn) return;

    if (cardReturn !== "discard") {
      table.push(players[instaIndex].hand.splice(cardIndex, 1)[0]);
    } else {
      deck.serveCard(players[instaIndex].hand.splice(cardIndex, 1)[0]);
    }

    if (cardReturn.events) this.emitEvent({ events: cardReturn.events });

    this.emitEvent({
      table: table,
      players: players,
      deck: deck,
      reaction: emptyReaction,
    });
  };

  handleEventFunctions = (player, card, event) => {
    const index = this.state.events[0] ? 0 : -1;

    if (ef[event](this, index, player, card)) {
      this.clearEvent();
      // if (this.state.events.length > 0) {
      // } else {
      //   this.setState({ actions: { message: "", options: [] } });
      // }
    }
  };

  clearEvent = () => {
    const events = [...this.state.events];

    if (events[0].target.length > 1) {
      console.log(1);
      events[0].target.splice(
        events[0].target.indexOf(this.state.player_id),
        1
      );
    } else {
      console.log("last player in the event!");
      if (events.length === 1) {
        let eventResolution = resolveEvent(this, events[0].cardType);
        this.clearTable();
        if (eventResolution) {
          console.log(eventResolution);
          events.push(eventResolution);

          console.log(events);
          setTimeout(() => {
            events.shift();
            this.emitEvent({ events });
          }, 3000);
        }
      }
      events.shift();
    }

    this.emitEvent({ events });
  };

  discardCard = (players, player, cards) => {
    const index = players.indexOf(player),
      deck = new Deck(this.state.deck.cards, this.state.deck.discards),
      cardArr = players[index][this.state.reaction.location];

    let removed = [];

    for (let i = 0; i < cards.length; i++) {
      let index = cardArr.findIndex((c) => {
        return c.id === cards[i].id;
      });
      deck.serveCard(cardArr.splice(index, 1)[0]);
    }

    return { players, deck };
  };

  handleDraw = (pile) => {
    const players = [...this.state.players],
      discard = pile === "discard",
      playerIndex = players.findIndex((player) => {
        return player.id === Number(this.state.player_id);
      }),
      cardIndex = players[playerIndex][this.state.reaction.location]?.indexOf(
        this.state.reaction.card
      );

    let deck = new Deck(this.state.deck.cards, this.state.deck.discards);

    //If someone just clicks the empty discard, don't do anything
    if (!this.state.reaction.card[0] && discard && deck.discards.length === 0)
      return;

    if (this.state.reaction.card[0]) {
      let discardObject = this.discardCard(players, players[playerIndex], [
        ...this.state.reaction.card,
      ]);
      let reaction = emptyReaction;
      this.emitEvent({
        players: discardObject.players,
        deck: discardObject.deck,
        reaction,
      });
    } else {
      if (deck.cards.length > 0 || (discard && deck.discards.length > 0)) {
        players[playerIndex].hand.unshift(deck.drawCards(1, discard)[0]);
        players[playerIndex].character.draw--;
        this.emitEvent({ players, deck });
      } else if (!discard) {
        deck.shuffle();
        this.emitEvent({ deck });
      }
    }
  };

  findMe = (id) => {
    const playerIndex = this.state.players.findIndex((player) => {
      return player.id === Number(id);
    });

    return playerIndex;
  };

  turnOrder = () => {
    const players = [...this.state.players];
    const playerIndex = this.findMe(this.state.player_id);

    const beforePlayer = players.splice(0, playerIndex);

    return [...players, ...beforePlayer];
  };

  updateTurnOrder = () => {
    const players = this.turnOrder();

    this.setState({ players });
  };

  startTurn = () => {
    console.log("starting turn!!");
    const players = [...this.state.players],
      currentIndex = this.findMe(this.state.turn);

    let infiniteShots = false;

    if (
      players[currentIndex].tableau.some((card) => {
        return card.name === "elder_wand";
      })
    )
      infiniteShots = true;
    if (players[currentIndex].character.name === "sirius_black")
      infiniteShots = true;
    if (
      players[currentIndex].tableau.some((c) => {
        return c.name === "elder_wand";
      })
    )
      infiniteShots = true;

    players[currentIndex].character.draw = 2;
    players[currentIndex].character.shots = infiniteShots ? 9999 : 1;

    players.forEach((v) => {
      v["my-turn"] = this.state.turn === v.id;
    });

    //Check is player is in jail
    if (players[currentIndex].tableau.some((e) => e.name === "azkaban")) {
      players[currentIndex]["my-turn"] = "azkaban";
      if (this.state.turn === this.state.player_id)
        this.addAlert(
          "You’re in Azkaban! Draw the top card of the deck to see if you escape."
        );
    }

    // console.log(players[currentIndex]["my-turn"]);

    this.setState({ players });
  };

  endTurn = () => {
    const players = [...this.state.players],
      currentIndex = this.findMe(this.state.turn),
      player = players[currentIndex];

    //If player ends their turn in Jail, they're now free!
    if (player.tableau.some((e) => e.name === "azkaban")) {
      const jailLocation = player.tableau.findIndex(
          (e) => e.name === "azkaban"
        ),
        deck = new Deck(this.state.deck.cards, this.state.deck.discards);

      deck.serveCard(player.tableau.splice(jailLocation, 1)[0]);
      this.emitEvent({ players, deck });
    }
    this.clearTable();

    if (player.hand.length > player.character.health) {
      this.addAlert(
        "You must discard until you have at most the same number of cards as you do health"
      );
    } else {
      this.nextTurn();
    }
  };

  addAlert = (alert) => {
    const alerts = [...this.state.alerts, alert];
    this.setState({ alerts });
  };

  addAction = (action) => {
    if (action.options.length === 0) action.popupType = "subtle";
    const event = {
        popup: action,
        instigator: this.state.players[this.findMe(this.state.player_id)],
        cardType: "none",
        target: [this.state.player_id],
      },
      events = [...this.state.events];

    events.push(event);

    this.emitEvent({ events });
  };

  deleteAlert = (i) => {
    let alerts = [...this.state.alerts];
    alerts.splice(i, 1);
    this.setState({ alerts });
  };

  checkTopCard = (house) => {
    const deck = new Deck(this.state.deck.cards, this.state.deck.discards),
      houses = {
        G: "Griffindor",
        S: "Slytherine",
        H: "Hufflepuff",
        R: "Ravenclaw",
      },
      table = [...this.state.table];

    table.push(deck.drawCards(1)[0]);

    let gotit = false,
      checked = houses[table[table.length - 1].house];

    house.forEach((h) => {
      if (table[table.length - 1].house === h) {
        gotit = true;
        checked = houses[h];
      }
    });

    this.emitEvent({ table, deck });
    return { gotit: gotit, house: checked };
  };

  clearTable = (number) => {
    const table = [...this.state.table],
      deck = new Deck(this.state.deck.cards, this.state.deck.discards),
      players = [...this.state.players];

    if (number === undefined) number = table.length;
    for (let i = number - 1; i >= 0; i--) {
      deck.serveCard(table[i]);
    }

    players[this.findMe(this.state.turn)]["my-turn"] = true;

    this.emitEvent({ table: [], deck: deck, players: players });
    return true;
  };
  popUp = (data) => {
    let actions = false;
    if (data.events && data.events[0]) {
      if (
        data.events[0].target.includes(this.state.player_id) &&
        data.events[0].popup
      ) {
        let cardType = data.events[0].cardType;

        actions = data.events[0].popup;

        if (
          (cardType === "stupefy" || cardType === "garroting_gas") &&
          this.state.actions.state !== "exhausted"
        ) {
          actions.options = protegoOptions(
            this.state.players[this.findMe(this.state.player_id)],
            actions.options
          );
        }
      } else if (data.events[0].bystanders) {
        actions = data.events[0].bystanders;
      }
    } else if (data.events !== undefined) {
      actions = { message: "", options: [] };
    }

    return actions;
  };

  catchSocket = (data) => {
    const popup = this.popUp(data);
    if (popup) data.actions = popup;

    console.log(data);
    this.setState(data);
  };

  emitEvent = (state) => {
    const popup = this.popUp(state);
    if (popup) state.actions = popup;

    console.log(state);

    this.setState(state);
    socket.emit(
      "player change",
      Object.assign({ room: this.state.player_room }, state)
    );
  };

  render() {
    const orderedPlayers = this.turnOrder();

    return (
      <React.Fragment>
        <div className="alert-holder">
          {this.state.actions.message !== "" ? (
            <Action
              player_id={this.state.player_id}
              players={orderedPlayers}
              actions={this.state.actions}
              acFunction={this.handleActionResponse}
            />
          ) : (
            ""
          )}
          {this.state.alerts.map((alert, i) => (
            <Alert
              deleteMe={this.deleteAlert}
              index={i}
              key={i}
              message={alert}
            />
          ))}
        </div>
        <div className="col-md-8">
          <CardDeck
            player_id={this.state.player_id}
            events={this.state.events}
            reaction={this.state.reaction}
            drawCard={this.handleDraw}
            checkTopCard={this.checkTopCard}
            azkaban={() => ef["checkAzkaban"](this)}
            deck={this.state.deck}
            players={orderedPlayers}
          ></CardDeck>
          <Table
            player_id={this.state.player_id}
            events={this.state.events}
            reaction={this.state.reaction}
            players={orderedPlayers}
            table={this.state.table}
            playCard={this.handleTablePlay}
            eventFunctions={this.handleEventFunctions}
          />
          {orderedPlayers.map((player, i) => (
            <Player
              player_id={this.state.player_id}
              events={this.state.events}
              reaction={this.state.reaction}
              key={i}
              pindex={i}
              characterPlay={this.handleCharacterPlay}
              tableauPlay={this.handleTableauPlay}
              playCard={this.selectCard}
              player={player}
              allPlayers={orderedPlayers}
              eventFunctions={this.handleEventFunctions}
            ></Player>
          ))}
        </div>
        <SideBar
          player_id={this.state.player_id}
          events={this.state.events}
          endTurn={this.endTurn}
          boardDeets={this.board}
          query={this.props.query}
          players={orderedPlayers}
          turn={this.state.turn}
        />
      </React.Fragment>
    );
  }
}

export default Board;
