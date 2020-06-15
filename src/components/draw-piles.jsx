import React, { Component } from "react";
import CardDeck from "./card-deck";
class Decks extends Component {
  state = {};
  render() {
    return (
      <React.Fragment>
        <CardDeck
          innerRef={this.props.innerRef}
          drawCard={this.props.drawCard}
          deck={this.props.theDeck}
        />
      </React.Fragment>
    );
  }
}

export default Decks;
