import React, { Component } from "react";
import Card from "./card";

class CardDeck extends Component {
  render() {
    return (
      <div ref={this.props.innerRef} className="piles">
        <Card
          playCard={() => this.props.drawCard("draw")}
          extraClass={this.props.deck.cards[0] ? "draw" : ""}
          card={
            this.props.deck.cards[0] || { name: "", fileName: "", house: "" }
          }
        />
        <Card
          playCard={() => this.props.drawCard("discard")}
          extraClass="discard"
          card={
            this.props.deck.discards[0] || { name: "", fileName: "", house: "" }
          }
        />
      </div>
    );
  }
}

export default CardDeck;
