import React, { Component } from "react";
import Character from "./character";
import Card from "./card";
import { emptyCard } from "../javascripts/card-setup";

class Player extends Component {
  state = {};

  checkDistance = (rangeOverride) => {
    let range = 0;
    //Check player's range of attack
    for (let i = 0; i < this.props.allPlayers[0].tableau.length; i++) {
      if (this.props.allPlayers[0].tableau[i].power?.range !== undefined)
        range += this.props.allPlayers[0].tableau[i].power.range;
    }
    //Range of one unless of powerups
    if (range === 0) range = 1;

    //check if the opponent has distancing powers
    for (let i = 0; i < this.props.player.tableau.length; i++) {
      if (this.props.player.tableau[i].power?.distance !== undefined)
        range -= this.props.player.tableau[i].power.distance;
    }

    //Range cannot be less than 0
    if (range < 0) range = 0;

    //Range override for things that are always a distance of 1
    if (rangeOverride) range = rangeOverride;

    if (
      this.props.pindex <= range ||
      this.props.allPlayers.length - this.props.pindex <= range
    )
      return true;
    return false;
  };

  playerClasses = () => {
    return this.props.pindex === 0
      ? "player this-player"
      : "player other-player";
  };

  handClickable = (card) => {
    const thisPlayer = this.props.pindex === 0;

    //if there's an event that's not for me, it's not my turn
    //or if I'm in jail, don't move on
    if (
      this.props.events[0]?.target === this.props.player_id ||
      !this.props.allPlayers[0]["my-turn"] ||
      this.props.allPlayers[0]["my-turn"] === "azkaban"
    )
      return false;
    if (thisPlayer && card.fileName !== "") return true;
    if (card.fileName === "" && this.tableauClickable()) {
      return true;
    }
    return false;
  };

  tableauClickable = () => {
    //if there's an event that's not for me, it's not my turn
    //or if I'm in jail, don't move on
    if (
      this.props.events[0]?.target === this.props.player_id ||
      !this.props.allPlayers[0]["my-turn"] ||
      this.props.allPlayers[0]["my-turn"] === "azkaban"
    )
      return false;
    if (
      this.props.reaction.targets.indexOf("my-tableau") !== -1 &&
      this.props.player.id === this.props.player_id
    ) {
      return true;
    } else if (
      this.props.reaction.targets.indexOf("tableau") !== -1 &&
      this.props.player.id !== this.props.player_id
    ) {
      return true;
    }
    return false;
  };

  characterClickable = () => {
    //if there's an event that's not for me, it's not my turn
    //or if I'm in jail, don't move on
    if (
      this.props.events[0]?.target === this.props.player_id ||
      !this.props.allPlayers[0]["my-turn"] ||
      this.props.allPlayers[0]["my-turn"] === "azkaban"
    )
      return false;
    if (this.tableauClickable()) return true;
    if (
      this.props.reaction.targets.indexOf("others") !== -1 &&
      this.props.pindex !== 0 &&
      this.checkDistance()
    ) {
      return true;
    }
    return false;
  };

  render() {
    const tableau = [...this.props.player.tableau, emptyCard];
    return (
      <div className={this.playerClasses()} ref={this.props.innerRef}>
        <h1 className="name-card">{this.props.player.name}</h1>

        <Character
          reaction={this.props.reaction}
          player={this.props.player}
          character={this.props.player.character}
          extraClass={this.characterClickable() ? "clickable " : ""}
          playCard={
            this.tableauClickable()
              ? this.props.tableauPlay
              : this.characterClickable()
              ? this.props.characterPlay
              : () => {}
          }
        />
        <div
          onClick={() => {
            this.tableauClickable() &&
              this.props.tableauPlay(this.props.player);
          }}
          className="tableau"
        >
          {tableau.map((card, i) => (
            <Card
              key={i}
              index={i}
              extraClass={
                (this.handClickable(card) ? "clickable " : "") +
                (this.props.reaction.card?.id === card.id ? "selected " : "")
              }
              player={this.props.player}
              card={card}
              playCard={
                this.tableauClickable() || this.handClickable(card)
                  ? this.props.playCard
                  : () => {}
              }
            />
          ))}
        </div>
        <div className={"hand"}>
          {this.props.player.hand.map((card, i) => (
            <Card
              key={i}
              index={i}
              extraClass={
                (this.handClickable(card) ? "clickable " : "") +
                (this.props.reaction.card?.id === card.id ? "selected " : "")
              }
              player={this.props.player}
              card={card}
              playCard={
                this.handClickable(card) ? this.props.playCard : () => {}
              }
            />
          ))}
        </div>
      </div>
    );
  }
}
export default Player;
