import React, { Component } from "react";
import Card from "./card";

class CardDeck extends Component {
  isClickable = (pile) => {
    //if it's not my turn or if I'm in jail, don't move on
    if (
      !this.props.players[0]["my-turn"] ||
      (this.props.players[0]["my-turn"] === "azkaban" && pile === "discard")
    )
      return false;
    const thisChar = this.props.players[0].character;
    if (pile === "draw" && thisChar.draw > 0) return true;

    if (
      pile === "discard" &&
      (this.props.reaction.card !== false ||
        (thisChar.power.discard && thisChar.draw > 1))
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
              : this.isClickable("draw")
              ? () => this.props.drawCard("draw")
              : () => {}
          }
          extraClass={
            (this.props.deck.cards[0] ? "draw" : "") +
            (this.isClickable("draw") ? " clickable" : "")
          }
          card={
            this.props.deck.cards[0] || { name: "", fileName: "", house: "" }
          }
        />
        <Card
          playCard={
            this.isClickable("discard")
              ? () => this.props.drawCard("discard")
              : () => {}
          }
          extraClass={
            "discard " + (this.isClickable("discard") ? "clickable" : "")
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
