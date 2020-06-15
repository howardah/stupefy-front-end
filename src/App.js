import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as setup from "./javascripts/card-setup";
import { Deck } from "./javascripts/deck";
import Board from "./components/board";
import SideBar from "./components/sidebar";

// const socket = io();
// const { room } = Qs.parse(location.search, {
//   ignoreQueryPrefix: true,
// });

// const thisPlayer = players[0];

// initialDeck.shuffle();
// characterDeck.shuffle();

class App extends Component {
  state = {
    deck: new Deck(setup.initialDeck.cards, setup.initialDeck.discards),
  };
  render() {
    return (
      <div className="container">
        <div className="row">
          <Board characters={setup.players} deck={this.state.deck} />
          <SideBar players={setup.players} />
        </div>
      </div>
    );
  }
}

export default App;
