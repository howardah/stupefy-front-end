const cardObj = {
  accio: "bow",
};

class Card extends React.Component {
  render() {
    return (
      <div
        onClick={() => this.props.playCard(this.props.player, this.props.card)}
        cardName={this.props.card.fileName}
        className={this.props.card.fileName + " card " + this.props.extraClass}
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

class CardDeck extends React.Component {
  render() {
    return (
      <div className="piles">
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

class Character extends Card {
  state = {};

  render() {
    return (
      <div className="character">
        <div
          className="card"
          style={{
            backgroundImage:
              "url('/images/stupefy/characters/" +
              this.props.character.fileName +
              ".jpg')",
          }}
        ></div>
        <div className="health card">
          {Array.from(Array(this.props.character.health).keys())
            .reverse()
            .map((v, i) => (
              <div className={"health wands wands_" + (v + 1)}></div>
            ))}
        </div>
      </div>
    );
  }
}
