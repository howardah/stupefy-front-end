import React, { Component } from "react";
import Character from "./character";
import Card from "./card";
import { emptyCard } from "../javascripts/card-setup";

class Player extends Component {
  state = {};

  playerClasses = () => {
    return this.props.player.id === 0
      ? "player this-player"
      : "player other-player";
  };

  render() {
    const tableau =
      this.props.player.tableau.length > 0
        ? this.props.player.tableau
        : [emptyCard];
    return (
      <div className={this.playerClasses()} ref={this.props.innerRef}>
        <h1 className="name-card">{this.props.player.name}</h1>

        <Character character={this.props.player.character} />
        <div className="tableau">
          {tableau.map((card, i) => (
            <Card
              key={i}
              index={i}
              extraClass=""
              player={this.props.player}
              card={card}
              playCard={this.props.playCard}
            />
          ))}
        </div>
        <div className="hand">
          {this.props.player.hand.map((card, i) => (
            <Card
              key={i}
              index={i}
              extraClass=""
              player={this.props.player}
              card={card}
              playCard={this.props.playCard}
            />
          ))}
        </div>
      </div>
    );
  }
}
export default Player;
