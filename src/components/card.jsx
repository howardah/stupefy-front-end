import React, { Component } from "react";

class Card extends Component {
  isEmpty = (checker) => {
    return checker === "";
  };

  playCard = () => {
    this.props.playCard(this.props.player, this.props.card);
  };

  render() {
    return (
      <div
        onClick={this.playCard}
        cardname={this.props.card.fileName}
        className={
          this.props.card.fileName +
          " card " +
          this.props.extraClass +
          " " +
          (this.isEmpty(this.props.card.house)
            ? ""
            : this.props.card.house + " ") +
          (this.isEmpty(this.props.card.fileName) ? " empty" : "")
        }
        style={
          this.props.card.fileName === ""
            ? {}
            : {
                backgroundImage:
                  "url('/images/stupefy/" + this.props.card.fileName + ".jpg')",
              }
        }
      ></div>
    );
  }
}

export default Card;
