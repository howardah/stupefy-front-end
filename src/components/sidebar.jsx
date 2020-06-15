import React, { Component } from "react";

class SideBar extends Component {
  state = {};
  render() {
    return (
      <div className="sidebar col-md-4">
        <div className="sidebar-inner">
          <div className="players">
            {this.props.players.map((v, i) => (
              <div key={v.id}>{v.name}</div>
            ))}
          </div>

          <button>End Turn</button>
        </div>
      </div>
    );
  }
}

export default SideBar;
