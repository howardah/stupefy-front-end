import React, { Component } from "react";
import Card from "./card";

class CardDeck extends Component {
  jailed = () => {
    return (
      !this.props.players[0]["my-turn"] ||
      (this.props.events[0] &&
        !this.props.events[0]?.target.includes(this.props.player_id))
    );
  };
  isDrawClickable = () => {
    //if it's not my turn or if I'm in jail, don't move on
    if (this.jailed()) return false;
    const thisChar = this.props.players[0].character;
    if (thisChar.draw > 0) return true;

    if (this.props.players[0]["my-turn"] === "azkaban") return true;

    return false;
  };
  isDiscardClickable = () => {
    //if it's not my turn or if I'm in jail, don't move on
    if (this.jailed()) return false;

    const thisChar = this.props.players[0].character;
    if (
      this.props.reaction.card[0] ||
      (thisChar.power.discard && thisChar.draw > 1)
    )
      return true;

    return false;
  };
  render() {
    return (
      <div className="piles">
        <Card
          playCard={
            this.props.players[0]["my-turn"] === "azkaban"
              ? () => this.props.azkaban()
              : this.isDrawClickable()
              ? () => this.props.drawCard("draw")
              : () => {}
          }
          extraClass={
            (this.props.deck.cards[0] ? "draw" : "") +
            (this.isDrawClickable() ? " clickable" : "")
          }
          card={
            this.props.deck.cards[0] || { name: "", fileName: "", house: "" }
          }
        />
        <Card
          playCard={
            this.isDiscardClickable()
              ? () => this.props.drawCard("discard")
              : () => {}
          }
          extraClass={
            "discard " + (this.isDiscardClickable() ? "clickable" : "")
          }
          card={
            this.props.deck.discards[0] || {
              name: "",
              fileName: "",
              house: "",
            }
          }
        />
      </div>
    );
  }
}

export default CardDeck;
