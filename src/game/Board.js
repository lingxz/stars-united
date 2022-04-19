import React, { useState, useEffect } from 'react';
import { parseCommand } from './CommandParser';
import { EVOLUTION, STAR_NAMES, START_REQ, SCORING_COMBOS } from './Constants';

const PlayerCard = (props) => {
  const isCurrentPlayer = props.player.id === props.gameProps.ctx.currentPlayer;
  const clientPlayer = props.gameProps.playerID;
  const isClientPlayer = clientPlayer === props.player.id;
  return (
    <div className={isCurrentPlayer ? "card player-card card-outline" : "card player-card"}>
      <div className="card-header">{props.player.name} {isClientPlayer ? "(you)" : ""}</div>
      <div className="card-body">
        <p>
          Score: {props.player.score} <br/>
          Hydrogen: {props.player.hydrogen}<br/>
          Non-hydrogen: {props.player.nonHydrogen}<br/>
          Challenges left: {props.player.challenges}<br/><br/>
        </p>
        Stars:
        <ol>
          {props.player.stars.map((star, i) =>  {
            let nextStageText = "";
            if (star.stage === EVOLUTION[star.path].length - 1) {
              nextStageText = "end of its life"
            } else {
              let steps = 0;
              for (let i2 = star.stage; i2 < EVOLUTION[star.path].length; i2++) {
                const nextStage = EVOLUTION[star.path][i2];
                if (nextStage !== EVOLUTION[star.path][star.stage]) {
                  nextStageText = `${steps} steps to ${STAR_NAMES[nextStage]}`;
                  break;
                }
                steps += 1;
              }
            }
            return <li key={i}><b>{STAR_NAMES[EVOLUTION[star.path][star.stage]]}</b> [path={star.path}, stage={star.stage} ({nextStageText}), accelerate={star.accelerate}]</li>
            })}
        </ol>
      </div>
    </div>
  );
};

const ActionsBar = (stage) => {

  const addCommand = (command) => {
    const inputBox = document.getElementById("command-input");
    inputBox.value = command;
    inputBox.focus();
  }
  switch(stage) {
    case "play":
      return (
        <div className="actions">
          <button className="button is-light" onClick={() => addCommand("make small")}>Make star (small)</button>
          <button className="button is-light" onClick={() => addCommand("make large")}>Make star (large)</button>
          <button className="button is-light" onClick={() => addCommand("challenge ")}>Challenge</button>
          <button className="button is-light" onClick={() => addCommand("freeze ")}>Freeze stars</button>
          <button className="button is-light" onClick={() => addCommand("draw")}>Draw cards (ends the turn)</button>
        </div>
      );
    case "challenged":
      return (
        <div className="actions">
          <button className="button is-light" onClick={() => addCommand("accept")}>Accept challenge</button>
        </div>
      );
  }
};

const HelpButton = () => {
  // TODO write a better help page
  return <div>
<label className="paper-btn margin" id="help-button" htmlFor="modal-1">?</label>
<input className="modal-state" id="modal-1" type="checkbox"/>
<div className="modal">
  <label className="modal-bg" for="modal-1"></label>
  <div className="modal-body">
    <label className="btn-close" for="modal-1">X</label>
    <h4 className="modal-title">Info</h4>
    <p className="modal-text">
      <b>Start requirements</b>: {JSON.stringify(START_REQ)}<br/>
      <b>Evolution paths</b>: {JSON.stringify(EVOLUTION)}<br/>
      <b>Scoring combos</b>: {JSON.stringify(SCORING_COMBOS, null, 2)}
    </p>
  </div>
</div>
  </div>
}

export const StarsUnitedBoard = (props) => {
  const currentStage = props.ctx.activePlayers[props.playerID];
  

  // player 0 has to set the player's actual screen names due to the way boardgame.io works
  useEffect(() => {
    if (props.playerID === "0") {
      props.moves.changeNames(props.matchData);
    }
  }, [props.playerID, props.moves, props.matchData]);

  const [showCommandError, setShowCommandError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const submitCommand = (e) => {
    e.preventDefault();
    const inputBox = document.getElementById("command-input");
    const error = parseCommand(inputBox.value.trim(), props);
    if (error) {
      console.log(error);
      setShowCommandError(true);
      setErrorMsg(error);
    } else {
      setShowCommandError(false);
      inputBox.value = ""
    }
  }

  return (
    <div className="container-lg main-container">
      <div className="row cards-row">
      {Object.entries(props.G.players).map((item, i) => {
        return <PlayerCard key={item[0]} gameProps={props} player={item[1]}></PlayerCard>
      })}
      </div>
      <div className="card chatLog margin">
        <div className="card-header"> Logs</div>
        <div className="log">
          {props.G.logs.map((msg, index) => {
            return <div className="msg">{msg}</div>
          })}
        </div>
        <div className="actions">
          {ActionsBar(currentStage)}
        </div>
        {showCommandError ? 
          <div className="alert alert-danger">
            {errorMsg}
          </div> : ""
        }
        <form className="form-group command" onSubmit={submitCommand}>
          <input id="command-input" type="text" autocomplete="off"/><button>Submit</button>
        </form>
      </div>
      <HelpButton/>
    </div>
  )
};
