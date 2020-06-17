import React, { Component, useRef } from "react";
import Player from "./player";
import CardDeck from "./card-deck";
import { Deck } from "../javascripts/deck";
import { CardRules, resolveEvent } from "./card-rules";
import SideBar from "./sidebar";
import Alert from "./alert";
import Action from "./action";
import Table from "./table";
import socketIOClient from "socket.io-client";
import { deck } from "../javascripts/card-setup";
const ENDPOINT = "http://127.0.0.1:4001";
const socket = socketIOClient(ENDPOINT);

const emptyReaction = {
  instigator: false,
  card: false,
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

  players[0]["my-turn"] = turn === id;

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
    table: [],
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

  handleActionResponse = (action) => {
    if (action === "" || this[action]()) {
      this.setState({ actions: { message: "", options: [] } });
      const events = [...this.state.events];
      events.shift();
      this.emitEvent(events);
    }
  };

  takeHit = () => {
    const players = [...this.state.players],
      thisIndex = this.findMe(this.state.player_id);

    players[thisIndex].character.health--;

    // this.setState(players);
    this.emitEvent({ players: players });
    return true;
  };

  playProtego = () => {
    if (
      this.state.players[this.findMe(this.state.player_id)].hand.findIndex(
        (card) => {
          return card.name === "protego";
        }
      ) === -1
    ) {
      this.addAlert("Sorry, you don't have a Protego!");
    } else {
      console.log("protected!");
      return true;
    }
  };

  componentDidMount() {
    // this.state.player_id = this.props.query.id;
    // this.state.player_room = this.props.query.room;

    socket.on("FromAPI", (data) => {
      if (data.room === this.state.player_room) {
        this.catchSocket(data);
      }
    });
    this.props.onRef(this);
    console.log("only this once");

    if (this.state.events.length > 0) {
      if (this.state.events[0].target === this.state.player_id) {
        if (this.state.events[[0]].popup) {
          this.setState({ actions: this.state.events[0].popup });
        }
      }
    }
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  handleCardPlay = (player, card) => {
    let reaction;
    //check if card is in hand or an tableau
    const cardIndex = player.hand.indexOf(card);

    //see if the target is the discard
    let discard = cardIndex === -1;

    if (!this.state.reaction || card?.id !== this.state.reaction?.card?.id) {
      const rule = CardRules(card.name, player);

      reaction = {
        instigator: player,
        card: Object.assign(card),
        location: cardIndex === -1 ? "tableau" : "hand",
        effects: rule.effect,
        targets: discard ? ["discard"] : rule.targets,
      };
    } else {
      reaction = emptyReaction;
    }

    this.setState({ reaction });
  };

  handleCharacterPlay = (player, character) => {
    const players = [...this.state.players],
      playerId = player.id;

    //Most cards will require a response from the target
    const cardReturn = this.state.reaction.effects(
      playerId,
      this.state.reaction.instigator
    );

    const dObj = this.discardCard(
      players,
      this.state.reaction.instigator,
      this.state.reaction.card
    );

    this.emitEvent({
      players: dObj.players,
      deck: dObj.deck,
      reaction: emptyReaction,
      events: cardReturn.events,
    });
  };

  handleTableauPlay = (player, card) => {
    console.log(player);
    console.log(this.state.reaction.instigator);
    const players = [...this.state.players],
      instaIndex = players.indexOf(this.state.reaction.instigator),
      cardIndex = players[instaIndex].hand.indexOf(this.state.reaction.card),
      playerIndex = players.indexOf(player);
    players[playerIndex].tableau.push(
      players[instaIndex].hand.splice(cardIndex, 1)[0]
    );

    const dObj = this.state.reaction.effects(
      players[instaIndex],
      this.state.deck
    ) || { player: players[instaIndex], deck: this.state.deck };

    players[instaIndex].tableau = [...dObj["player"].tableau];

    this.emitEvent({
      players: players,
      deck: dObj.deck,
      reaction: emptyReaction,
    });
  };

  discardCard = (players, player, card) => {
    const index = players.indexOf(player),
      cardIndex = players[index][this.state.reaction.location].indexOf(card);

    let deck = new Deck(this.state.deck.cards, this.state.deck.discards);

    deck.serveCard(players[index].hand.splice(cardIndex, 1)[0]);
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

    if (!this.state.reaction.card && discard && deck.discards.length === 0)
      return;

    if (this.state.reaction.card) {
      deck.serveCard(
        players[playerIndex][this.state.reaction.location].splice(
          cardIndex,
          1
        )[0]
      );
      let reaction = emptyReaction;
      this.emitEvent({ players, deck, reaction });
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

    console.log(this.state.player_id);
    console.log(playerIndex);

    const beforePlayer = players.splice(0, playerIndex);

    return [...players, ...beforePlayer];
  };

  updateTurnOrder = () => {
    const players = this.turnOrder();

    this.setState({ players });
  };

  startTurn = () => {
    const players = [...this.state.players],
      currentIndex = this.findMe(this.state.turn);

    players[currentIndex].character.draw = 2;
    players[currentIndex].character.shots = 1;

    players.forEach((v) => {
      v["my-turn"] = this.state.turn === v.id;
    });

    //Check is player is in jail
    if (players[currentIndex].tableau.some((e) => e.name === "azkaban"))
      players[currentIndex]["my-turn"] = "azkaban";

    console.log(players[currentIndex]["my-turn"]);

    this.setState({ players });
  };

  azkabanEndTurn = () => {
    const currentIndex = this.findMe(this.state.turn),
      players = [...this.state.players],
      player = players[currentIndex];

    player["my-turn"] = false;

    this.clearTable();

    if (player.hand.length > player.character.health) {
      this.addAlert(
        "You must discard until you have at most the same number of cards as you do health"
      );
    } else {
      this.endTurn();
    }

    this.setState({ players });
    return true;
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
    const actions = action;
    this.setState({ actions });
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

  checkAzkaban = () => {
    const players = [...this.state.players],
      thisPlayer = this.findMe(this.state.player_id),
      topCard = this.checkTopCard([players[thisPlayer].character.house]);

    if (topCard.gotit) {
      players[thisPlayer]["my-turn"] = true;
      this.setState({ players });
      this.addAction({
        message: "Hooray! You drew a " + topCard.house,
        options: [{ label: "Take my turn", function: "clearTable" }],
      });
    } else {
      this.addAction({
        message: "Bummer, you drew a " + topCard.house,
        options: [{ label: "End my turn", function: "azkabanEndTurn" }],
      });
    }
  };

  clearTable = () => {
    const table = [...this.state.table],
      deck = new Deck(this.state.deck.cards, this.state.deck.discards),
      players = [...this.state.players];

    for (let i = 0; i < table.length; i++) {
      deck.serveCard(table[i]);
    }

    if (players[this.findMe(this.state.player_id)]["my-turn"] === "azkaban") {
      players[this.findMe(this.state.player_id)]["my-turn"] = true;
    }

    this.emitEvent({ table: [], deck: deck, players: players });
    return true;
  };

  catchSocket = (data) => {
    console.log(data);
    if (data.events && data.events.length > 0) {
      if (data.events[0].target === this.state.player_id) {
        if (data.events[0].popup) {
          this.setState({ actions: data.events[[0]].popup });
        }
      }
    }

    this.setState(data);
  };

  emitEvent = (state) => {
    this.setState(state);
    socket.emit(
      "player change",
      Object.assign({ room: this.state.player_room }, state)
    );
  };

  render() {
    // this.props.emitEvent(this.state.player_id);
    // if (this.findMe(this.state.player_id) !== 0) this.updateTurnOrder();
    // console.log("every change?");
    const orderedPlayers = this.turnOrder();
    console.log(orderedPlayers);
    return (
      <React.Fragment>
        <div className="alert-holder">
          {this.state.actions.options.length > 0 ? (
            <Action
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
            azkaban={this.checkAzkaban}
            deck={this.state.deck}
            players={orderedPlayers}
          ></CardDeck>
          <Table
            reaction={this.state.reaction}
            players={orderedPlayers}
            table={this.state.table}
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
              playCard={this.handleCardPlay}
              player={player}
              allPlayers={orderedPlayers}
            ></Player>
          ))}
        </div>
        <SideBar
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
