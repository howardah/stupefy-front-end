import React, { Component } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

class Card extends Component {
  isEmpty = (checker) => {
    return checker === "";
  };
  render() {
    return (
      // <div></div>
      <Draggable
        draggableId={String(Math.ceil(Math.random() * 10000))}
        index={this.props.index}
      >
        {(provided) => (
          <div
            {...provided.dragHandleProps}
            {...provided.draggableProps}
            ref={provided.innerRef}
            onClick={() =>
              this.props.playCard(this.props.player, this.props.card)
            }
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
                      "url('/images/stupefy/" +
                      this.props.card.fileName +
                      ".jpg')",
                  }
            }
          ></div>
        )}
      </Draggable>
    );
  }
}

export default Card;
