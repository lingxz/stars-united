import React, { useState, useEffect } from 'react';
import { EVOLUTION } from './Constants';

const PlayerCard = (props) => {
  const isCurrentPlayer = props.player.id === props.gameProps.ctx.currentPlayer;
  const clientPlayer = props.gameProps.playerID;
  const showChallengeButtons = props.player.id !== props.gameProps.playerID && props.gameProps.ctx.activePlayers[clientPlayer] === "challenge" && props.gameProps.G.challenger === null; // Only show if challenge has not started.
  const showFeedButtons = props.player.id === props.gameProps.playerID && props.gameProps.ctx.activePlayers[clientPlayer] === "play";
  const showFeedHydrogenButtons = showFeedButtons && props.player.hydrogen > 0;
  const showFeedNonHydrogenButtons = showFeedButtons && props.player.nonHydrogen > 0;
  const showFreezeCheckbox = props.player.id === props.gameProps.playerID && props.gameProps.ctx.activePlayers[clientPlayer] === "freeze";

  let [checkedState, setCheckedState] = useState(
    new Array(props.player.stars.length).fill(false)
  );
  const handleOnChange = (position) => {
    if ((props.player.stars.length) !== checkedState.length) {
      checkedState = new Array(props.player.stars.length).fill(false)
    }
    console.log("position", position);
    const updatedCheckedState = checkedState.map((item, index) =>
      index === position ? !item : item
    );
    console.log("check state", checkedState, updatedCheckedState);
    setCheckedState(updatedCheckedState);
  };
  const freezeStars = () => {
    props.gameProps.moves.freezeStars(checkedState.flatMap((bool, index) => bool ? index : []));
    setCheckedState(new Array(props.player.stars.length).fill(false));
  };

  if (showFreezeCheckbox) {
    return (
      <div className={`card ${isCurrentPlayer ? "active" : ""}`}>
        <p><b>{props.player.name}</b></p>
        <p>
          Score: {props.player.score} <br/>
          Hydrogen: {props.player.hydrogen}<br/>
          Non-hydrogen: {props.player.nonHydrogen}<br/><br/>
        </p>
        Stars:
        <ul>
          {props.player.stars.map((star, i) =>  {
            return <label className="checkbox"><input type="checkbox" checked={checkedState[i]} onChange={() => handleOnChange(i)}/> <b>{EVOLUTION[star.path][star.stage]}</b> [path={star.path}, stage={star.stage}, accelerate={star.accelerate}]</label>
            })}
        </ul>
        <button onClick={freezeStars}>Freeze</button>
      </div>
    );
  }

  return (
    <div className={`card ${isCurrentPlayer ? "active" : ""}`}>
      <p><b>{props.player.name}</b></p>
      <p>
        Score: {props.player.score} <br/>
        Hydrogen: {props.player.hydrogen}<br/>
        Non-hydrogen: {props.player.nonHydrogen}<br/><br/>
      </p>
      Stars:
      <ul>
        {props.player.stars.map((star, i) =>  {
          let nextStageText = "";
          if (star.stage === EVOLUTION[star.path].length - 1) {
            nextStageText = "end of its life"
          } else {
            let steps = 0;
            for (let i2 = star.stage; i2 < EVOLUTION[star.path].length; i2++) {
              const nextStage = EVOLUTION[star.path][i2];
              if (nextStage !== EVOLUTION[star.path][star.stage]) {
                nextStageText = `${steps} steps to ${nextStage}`;
                break;
              }
              steps += 1;
            }
          }
          return <li><b>{EVOLUTION[star.path][star.stage]}</b> [path={star.path}, stage={star.stage} ({nextStageText}), accelerate={star.accelerate}]
          {showChallengeButtons ? <button onClick={() => props.gameProps.moves.challenge(props.player.id, i)}>Challenge</button> : ""}
          {showFeedHydrogenButtons ? <button onClick={() => props.gameProps.moves.feedMassToStar(i, true)}>Feed hydrogen</button> : ""}
          {showFeedNonHydrogenButtons ? <button onClick={() => props.gameProps.moves.feedMassToStar(i, false)}>Feed non-hydrogen</button> : ""}
          </li>
          })}
      </ul>
    </div>
  );
};

const ActionsBar = (props, stage) => {
  switch(stage) {
    case "play":
      return (
        <div className="actions">
          <button className="button is-light is-large" onClick={() => props.moves.makeStar("small")}>Make star (small)</button>
          <button className="button is-light is-large" onClick={() => props.moves.makeStar("large")}>Make star (large)</button>
          <button className="button is-light is-large" onClick={() => props.events.setStage("challenge")}>Challenge</button>
          <button className="button is-light is-large" onClick={() => props.events.setStage("freeze")}>Freeze stars</button>
          <button className="button is-light is-large" onClick={() => props.moves.drawCards()}>Draw cards (ends the turn)</button>
        </div>
      );
    case "challenged":
      return (
        <div className="actions">
          <button className="button is-light is-large" onClick={() => props.moves.acceptChallenge()}>Accept challenge</button>
        </div>
      );
    case "challenge":
      return (
        <div className="actions">
          <button className="button is-light is-large" onClick={() => props.moves.abortChallenge()}>Abort challenge</button>
        </div>
      );
    case "freeze":
      return (
        <div className="actions">
          <button className="button is-light is-large" onClick={() => props.events.setActivePlayers({currentPlayer: "play"})}>Finish freeze</button>
        </div>
      )
  }
};

export const StarsUnitedBoard = (props) => {
  const currentStage = props.ctx.activePlayers[props.playerID];

  // player 0 has to set the player's actual screen names due to the way boardgame.io works
  useEffect(() => {
    if (props.playerID === "0") {
      props.moves.changeNames(props.matchData);
    }
  }, [props.playerID, props.moves, props.matchData]);

  return (
    <div className="main-container">
      <div>
      {Object.entries(props.G.players).map((item, i) => {
        return <PlayerCard key={item[0]} gameProps={props} player={item[1]}></PlayerCard>
      })}
      </div>
      <div className="actions">
        {ActionsBar(props, currentStage)}
      </div>
      <div className="chatLog">
        <div className="logHeader is-size-1 has-text-centered">Logs</div>
        <div className="log">
          {props.G.logs.map((msg, index) => {
            return <div className="msg">{msg}</div>
          })}
        </div>
      </div>
    </div>
  )
};
