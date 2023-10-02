import React, { PureComponent } from "react";

export default class CrosswordTypeToggle extends PureComponent {
  render() {
    const { crosswordType, setCrosswordType } = this.props;
    return (
      <div className="type-toggles">
        <button
          disabled={crosswordType == "mini"}
          onClick={() =>
            crosswordType == "normal" ? setCrosswordType("mini") : null
          }
        >
          mini
        </button>
        <button
          disabled={crosswordType == "normal"}
          onClick={() =>
            crosswordType == "mini" ? setCrosswordType("normal") : null
          }
        >
          normal
        </button>
      </div>
    );
  }
}
