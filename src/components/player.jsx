import React, { Component } from "react";
import Character from "./character";
import Card from "./card";
import { emptyCard } from "../javascripts/card-setup";
import "../stylesheets/players.css";

class Player extends Component {
  state = {};

  jailed = () => {
    return (
      this.props.allPlayers[0]["my-turn"] === "azkaban" || this.handleEvent()
    );
  };
  handleEvent = () => {
    return (
      (this.props.events[0] &&
        !this.props.events[0]?.target.includes(this.props.player_id)) ||
      (this.props.events[0]?.cardType === "resolution" &&
        !this.props.allPlayers[0]["my-turn"]) ||
      (!this.props.allPlayers[0]["my-turn"] && !this.props.events[0])
    );
  };

  checkDistance = (rangeOverride) => {
    if (
      !this.props.events[0] &&
      this.props.reaction.targets.indexOf("range") === -1
    )
      return true;

    let range = 0;

    //Range override for things that are always a distance of 1
    if (rangeOverride) range = rangeOverride;

    //Check player's range of attack
    for (let i = 0; i < this.props.allPlayers[0].tableau.length; i++) {
      //Check for polyjuice potions
      if (this.props.allPlayers[0].tableau[i].power?.distance !== undefined) {
        let distance = this.props.allPlayers[0].tableau[i].power.distance;
        range += distance > 0 ? 0 : -distance;
      }
      if (rangeOverride) continue;

      //Count wands only when range isn't overridden.
      if (this.props.allPlayers[0].tableau[i].power?.range !== undefined)
        range += this.props.allPlayers[0].tableau[i].power.range;
    }

    //Range of one unless of powerups
    if (range === 0) range = 1;

    //check if the opponent has distancing powers
    for (let i = 0; i < this.props.player.tableau.length; i++) {
      //Check for brooms
      if (this.props.player.tableau[i].power?.distance !== undefined) {
        let distance = this.props.player.tableau[i].power.distance;
        range -= distance > 0 ? distance : 0;
      }
    }

    //Range cannot be less than 0
    if (range < 0) range = 0;

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

  handClickable = (card, location) => {
    const thisPlayer = this.props.pindex === 0;
    //====== SPECIAL CASES ===========//

    //Expelliarmus event
    if (
      this.props.events[0]?.cardType === "expelliarmus" &&
      !thisPlayer &&
      card.fileName !== ""
    )
      return "expelliarmus";

    //Accio event
    if (
      this.props.events[0]?.cardType === "accio" &&
      this.checkDistance(1) &&
      !thisPlayer &&
      card.fileName !== ""
    ) {
      console.log("accio");
      return "accio";
    }

    //Diagon Alley event
    if (this.props.events[0]?.cardType === "diagon_alley") return false;

    //====== END SPECIAL CASES ===========//

    if (card?.name === "azkaban" && location === "tableau") return false;
    //if there's an event that's not for me, it's not my turn
    //or if I'm in jail, don't move on
    if (this.handleEvent()) return false;

    if (
      this.props.allPlayers[0]["my-turn"] === false &&
      this.props.events.length === 0
    )
      return false;

    //If it's my hand
    if (thisPlayer && card.fileName !== "") return true;
    //If it's the blank spot on my tableau
    //and I'm adding a card to it
    if (card.fileName === "" && this.tableauClickable()) {
      return true;
    }

    // //If an attack targets another players hand
    // if (
    //   !thisPlayer &&
    //   this.props.reaction.targets.includes("hand") &&
    //   location !== "tableau"
    // )
    //   return true;
    // //If an attack targets another players tableau
    // if (
    //   !thisPlayer &&
    //   this.props.reaction.targets.includes("tableau-card") &&
    //   location === "tableau" &&
    //   card.fileName !== ""
    // )
    //   return true;

    return false;
  };

  tableauClickable = (card) => {
    // const thisPlayer = this.props.pindex === 0;
    // if (!thisPlayer) return false;
    if (card?.name === "azkaban") return false;
    //if there's an event that's not for me, it's not my turn
    //or if I'm in jail, don't move on
    if (this.jailed()) return false;
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
    if (!this.props.allPlayers[0]["my-turn"]) return false;
    if (this.jailed()) return false;
    if (this.tableauClickable()) return true;
    if (
      this.props.reaction.targets.indexOf("others") !== -1 &&
      this.props.pindex !== 0 &&
      this.checkDistance()
    )
      return true;

    if (
      this.props.reaction.targets.indexOf("self") !== -1 &&
      this.props.pindex === 0
    )
      return true;

    return false;
  };

  apparate = (index) => {
    let clickable = false;
    if (this.props.reaction.card[0]?.name === "apparate") clickable = true;
    if (clickable && this.props.reaction.card.length > 1) clickable = false;
    if (
      clickable &&
      (index === 0 || index === this.props.allPlayers.length - 1)
    )
      clickable = false;
    return clickable;
  };

  render() {
    console.log(this.props.reaction);
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
                (this.handClickable(card, "tableau") ? "clickable " : "") +
                (this.props.reaction.card.some((arrcard) => {
                  return arrcard.id === card.id;
                })
                  ? "selected "
                  : "")
              }
              player={this.props.player}
              card={card}
              playCard={
                typeof this.handClickable(card) === "string"
                  ? (player, cardClicked) => {
                      this.props.eventFunctions(
                        player,
                        cardClicked,
                        this.handClickable(card)
                      );
                    }
                  : this.tableauClickable(card) || this.handClickable(card)
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
                (this.props.reaction.card.some((arrcard) => {
                  return arrcard.id === card.id;
                })
                  ? "selected "
                  : "")
              }
              player={this.props.player}
              card={card}
              playCard={
                typeof this.handClickable(card) === "string"
                  ? (player, cardClicked) => {
                      this.props.eventFunctions(
                        player,
                        cardClicked,
                        this.handClickable(card)
                      );
                    }
                  : this.handClickable(card)
                  ? this.props.playCard
                  : () => {}
              }
            />
          ))}
        </div>
        <div
          className={
            "between-characters" +
            (this.apparate(this.props.pindex) ? " hasclickable" : "")
          }
        >
          <div
            className={
              "inner-after" +
              (this.apparate(this.props.pindex) ? " clickable" : "")
            }
            onClick={
              this.apparate(this.props.pindex)
                ? () => {
                    this.props.eventFunctions(
                      this.props.allPlayers[0],
                      this.props.pindex,
                      "apparate"
                    );
                  }
                : () => {}
            }
          ></div>
        </div>
      </div>
    );
  }
}
export default Player;
