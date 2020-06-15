import React, { Component } from "react";
import Player from "./player";
import Decks from "./draw-piles";
import { Deck } from "../javascripts/deck";
import CardRules from "./card-rules";

class Board extends Component {
  state = {
    players: this.props.characters,
    theDeck: this.props.deck,
    reaction: false,
  };

  handleCardPlay = (player, card) => {
    // if (cardPlay) {
    let rule =
      CardRules[card.name] ||
      ((player) => {
        console.log("no rule");
        return true;
      });
    // }

    const discard = rule(player);

    discard && this.discardCard(player, card);
  };

  discardCard = (player, card) => {
    const players = [...this.state.players],
      index = players.indexOf(player),
      cardIndex = players[index].hand.indexOf(card);

    let theDeck = new Deck(
      this.state.theDeck.cards,
      this.state.theDeck.discards
    );

    theDeck.serveCard(players[index].hand.splice(cardIndex, 1)[0]);

    this.setState({ players, theDeck });
  };

  handleDraw = (pile) => {
    const players = [...this.state.players],
      discard = pile === "discard" ? true : false;

    let theDeck = new Deck(
      this.state.theDeck.cards,
      this.state.theDeck.discards
    );

    if (theDeck.cards.length > 0 || (discard && theDeck.discards.length > 0)) {
      players[0].hand.unshift(theDeck.drawCards(1, discard)[0]);
      this.setState({ players, theDeck });
    } else if (!discard) {
      theDeck.shuffle();
      this.setState({ theDeck });
    }
  };

  render() {
    return (
      <div className="col-md-8">
        <Decks drawCard={this.handleDraw} theDeck={this.state.theDeck}></Decks>
        {this.state.players.map((player, i) => (
          <Player
            key={i}
            playCard={this.handleCardPlay}
            player={player}
          ></Player>
        ))}
      </div>
    );
  }
}

export default Board;
