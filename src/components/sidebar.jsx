import React, { Component } from "react";
import "../stylesheets/sidebar.css";
import { players } from "../javascripts/card-setup";

class SideBar extends Component {
  state = {};

  classes = (v) => {
    if (v.id === this.props.turn) return "current-player";
    return "";
  };

  myTurn = () => {
    return this.props.turn === this.props.query.id;
  };

  render() {
    return (
      <div className="sidebar col-md-4">
        <div className="sidebar-inner">
          <div className="room-name">{this.props.query.room}</div>
          <div className="players">
            {this.props.players.map((v, i) => (
              <div key={v.id} className={this.classes(v)}>
                {v.name}
              </div>
            ))}
          </div>

          <button disabled={!this.myTurn()} onClick={this.props.endTurn}>
            End Turn
          </button>
          <button onClick={this.props.endTurn}>Next</button>
        </div>
      </div>
    );
  }
}

export default SideBar;
