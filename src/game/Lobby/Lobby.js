import React from "react";
import "./Lobby.scss";
import { GAME_NAME } from "../../config";

// Lobby is the parent component. Home and Room are the children components.
const Lobby = (props) => {
  return (
    <div className="lobby-container">
      <div className="game-title">Hydrogen Heroes</div>
      {props.children}
      <div className="game-info">
        Developed by lingxz
      </div>
    </div>
  );
};

export default Lobby;