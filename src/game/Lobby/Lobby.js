import React from "react";

// Lobby is the parent component. Home and Room are the children components.
const Lobby = (props) => {
  return (
    <div className="container">
      <h1><span class="badge secondary">Hydrogen heroes</span></h1>
      {props.children}
      <p>Developed by lingxz</p>
    </div>
  );
};

export default Lobby;