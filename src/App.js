import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import * as setup from "./javascripts/card-setup";
import { Deck } from "./javascripts/deck";
import Board from "./components/board";
import queryString from "query-string";
// import socketIOClient from "socket.io-client";
// const ENDPOINT = "http://127.0.0.1:4001";

// const socket = io();
// const { room } = Qs.parse(location.search, {
//   ignoreQueryPrefix: true,
// });

// const thisPlayer = players[0];

// initialDeck.shuffle();
// characterDeck.shuffle();

class Stupefy extends Component {
  getQueryObj = () => {
    return queryString.parse(this.props.location.search.toLowerCase());
  };

  state = {
    setupDeck: new Deck(setup.initialDeck.cards, setup.initialDeck.discards),
    setupPlayers: setup.players,
    q: this.getQueryObj(),
    turn: 0,
    isLoaded: false,
  };

  componentDidMount() {
    fetch(
      "http://127.0.0.1:4001/database/players/" +
        this.props.location.search.toLowerCase()
    )
      .then((res) => res.json())
      .then(
        (result) => {
          console.log(result);
          this.setState({
            setupDeck: new Deck(
              result.initialDeck.cards,
              result.initialDeck.discards
            ),
            setupPlayers: result.players,
            isLoaded: true,
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );
  }

  nextTurn = () => {
    let turn = this.state.turn;
    turn++;
    if (turn >= setup.players.length) turn = 0;

    this.setState({ turn });
  };

  render() {
    const { error, isLoaded, items } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div className="loading">Loading...</div>;
    } else {
      if (typeof this.state.q.id === "string") {
        let q = Object.assign(this.state.q);
        q.id = Number(q.id);
      }

      return (
        <div className="container">
          <div className="row">
            <Board
              onRef={(ref) => (this.board = ref)}
              query={this.state.q}
              players={this.state.setupPlayers}
              deck={this.state.setupDeck}
              turn={this.state.turn}
              stopTurn={this.nextTurn}
              emitEvent={this.props.emitFunction}
            />
          </div>
        </div>
      );
    }
  }
}

// class App extends Component {
//   render() {
//     return (
//       <Router>
//         <Route path="/" component={Stupefy} />
//       </Router>
//     );
//   }
// }

// export default App;

// const socket = socketIOClient(ENDPOINT);
function App() {
  // const [response, setResponse] = useState("");

  // useEffect(() => {
  //   socket.on("FromAPI", (data) => {
  //     console.log(data);
  //   });
  // }, []);

  const emit = (data) => {
    // console.log(data);
    // socket.emit(data);
    // useEffect(()=>{
    // socket = socketIOClient(ENDPOINT);
    // socket.emit("player change", data);
    // }
  };

  return (
    <Router>
      <Route
        path="/"
        render={(props) => <Stupefy {...props} emitFunction={emit} />}
      />
    </Router>
  );
}

export default App;
