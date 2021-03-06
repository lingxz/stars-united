
import { INVALID_MOVE } from 'boardgame.io/core';
import { GAME_NAME } from "../config";
import { START_REQ, EVOLUTION, DRAW_CARDS, SCORING_COMBOS, INITIAL_CHALLENGES, INDIV_STAR_SCORES } from "./Constants";


/* ---- Setup ---- */
const setup = ({ numPlayers }) => {
  const players = {};
  for (let i = 0; i < numPlayers; i++) {
    players[`${i}`] = {
      name: `Player ${i}`,
      hydrogen: 7,
      nonHydrogen: 0,
      stars: [],
      finishedStars: [],
      id: `${i}`,
      score: 0,
      challenges: INITIAL_CHALLENGES,
    };
  };
  return {
    players: players,
    challenger: null,
    winner: { name: "", id: "-1" },
    logs: ["Game created"],
  };
};

const changeNames = (G, ctx, playerList) => {
  for (let i = 0; i < playerList.length; i++) {
    G.players[`${i}`].name = playerList[i].name;
  }
};

/* ---- Actions ---- */
const makeStar = (G, ctx, path) => {
  const currentPlayer = G.players[ctx.currentPlayer];
  if (currentPlayer.hydrogen < START_REQ[path]) {
    return INVALID_MOVE;    
  }
  G.logs.push(`${currentPlayer.name} is making a new ${path} star`);
  currentPlayer.hydrogen -= START_REQ[path];
  currentPlayer.stars.push({
    stage: 0,
    path: path,
    accelerate: 0,
  });
};

const challenge = (G, ctx, otherPlayerId, otherPlayerStarIndex) => {
  // Out of challenges
  if (G.players[ctx.currentPlayer] === 0) {
    G.logs.push(`${G.players[ctx.currentPlayer].name} is out of challenges`);
    return INVALID_MOVE;
  }

  // Cannot challenge yourself
  if (otherPlayerId === ctx.currentPlayer) {
    return INVALID_MOVE;
  }
  G.logs.push(`${G.players[ctx.currentPlayer].name} challenges ${G.players[otherPlayerId].name}`);
  G.challenger = ctx.currentPlayer;
  G.challengedStar = otherPlayerStarIndex;
  ctx.events.setActivePlayers({value: {[ctx.currentPlayer]: "challenge", [otherPlayerId]: "challenged"}});
};

const acceptChallenge = (G, ctx) => {
  if (G.challenger === null) {
    // No challenge has started yet.
    return INVALID_MOVE;
  }

  const challengerPlayerName = G.players[ctx.currentPlayer].name;
  const challengedPlayerName = G.players[ctx.playerID].name;
  const challengedStarObj = G.players[ctx.playerID].stars[G.challengedStar];
  const challengerDieRoll = ctx.random.Die(6);
  G.logs.push(`${challengerPlayerName} rolls ${challengerDieRoll} for the show down`);

  const dieRoll = ctx.random.Die(6);
  if (dieRoll <= challengerDieRoll) {
    G.logs.push(`${challengedPlayerName} rolls ${dieRoll}, challenge is successful`);
    // Challenge success
    G.players[G.challenger].hydrogen += 1;
    G.players[ctx.playerID].stars[G.challengedStar].accelerate += 1;
  } else {
    G.logs.push(`${challengedPlayerName} rolls ${dieRoll}, challenge is unsuccessful`);
    // Challenge is unsuccessful, so deduct challenge from challenges and add to challengee.
    G.players[ctx.currentPlayer].challenges -= 1;
    G.players[ctx.playerID].challenges += 1;
  }

  // Clear all the challenge related values.
  G.challenger = null;
  G.challengerDieRoll = null;
  G.challengedStar = null;
  ctx.events.setActivePlayers({value: {[ctx.currentPlayer]: "play"}});
};

const abortChallenge = (G, ctx) => {
  if (Object.keys(ctx.activePlayers).length !== 1) {
    // Challenge already accepted.
    return INVALID_MOVE;
  }
  G.logs.push(`${G.players[ctx.currentPlayer].name} aborted the challenge`);
  G.challenger = null;
  G.challengerDieRoll = null;
  G.challengedStar = null;
  ctx.events.setActivePlayers({currentPlayer: "play"});
}

const feedMassToStar = (G, ctx, starIndex, hydrogen) => {
  const currentPlayer = G.players[ctx.currentPlayer];
  G.logs.push(`${currentPlayer.name} feeds ${hydrogen ? "hydrogen" : "non-hydrogen"} mass to his star`);
  if (hydrogen) {
    if (currentPlayer.hydrogen === 0) {
      return INVALID_MOVE;
    }
    currentPlayer.hydrogen -= 1;
    currentPlayer.stars[starIndex].accelerate -= 1;
  } else {
    if (currentPlayer.nonHydrogen === 0) {
      return INVALID_MOVE;
    }
    currentPlayer.nonHydrogen -= 1;
    currentPlayer.stars[starIndex].accelerate += 1;
  }
};

const evolveStar = (G, ctx) => {
  if (G.players[ctx.currentPlayer].stars.length === 0) {
    return;
  }
  G.logs.push(`${G.players[ctx.currentPlayer].name}'s stars have evolved`);
  for (const star of G.players[ctx.currentPlayer].stars) {
    if (star.accelerate === 0) {
      star.stage += 1;
    } else if (star.accelerate > 0) {
      star.stage += 2;
      star.accelerate -= 1;
    } else {
      // remain at the current stage
      star.accelerate += 1;
    }
    // Check stars that have reached the end of their lives.
    if (star.stage > EVOLUTION[star.path].length - 1) {
      star.stage = EVOLUTION[star.path].length - 1;
    }
  }
};

const scoreStars = (stars) => {
  const counts = {};
  for (const star of stars) {
    counts[star] = counts[star] ? counts[star] + 1 : 1;
  }
  for (const combo of SCORING_COMBOS) {
    // Check if this combo is present
    if (JSON.stringify(combo.cards, Object.keys(combo.cards).sort()) === JSON.stringify(counts, Object.keys(counts).sort())) {
      return [combo.name, combo.score];
    }
  }

  // No combo, try to score individually
  let score = 0;
  for (const s of stars) {
    score += INDIV_STAR_SCORES[s];
  }
  return ["no combo", score];
}

const freezeStars = (G, ctx, starIndices) => {
  const currentPlayer = G.players[ctx.currentPlayer];
  const frozenStars = [];
  const frozenStarNames = [];
  console.log("freeze stars", starIndices);
  for (const i of starIndices) {
    const currentStar = currentPlayer.stars[i];
    frozenStars.push(currentStar);
    frozenStarNames.push(EVOLUTION[currentStar.path][currentStar.stage]);
  }
  // Remove frozen stars from active stars to stop evolving it
  // Star indices must work in ascending order so that splice doesn't mess with other index.
  starIndices.sort(function(a, b) {
    return a - b;
  });
  for (let i = starIndices.length - 1; i >= 0; i--) {
    currentPlayer.stars.splice(starIndices[i], 1);
  }
  currentPlayer.finishedStars.push(frozenStars);
  const [comboName, comboScore] = scoreStars(frozenStarNames);
  currentPlayer.score += comboScore;
  G.logs.push(`${currentPlayer.name} got a ${comboName} combo and scored ${comboScore} points!`);
};

const drawCards = (G, ctx) => {
  G.logs.push(`${G.players[ctx.currentPlayer].name} draws ${DRAW_CARDS} hydrogen cards`);
  G.players[ctx.currentPlayer].hydrogen += DRAW_CARDS;
  ctx.events.endTurn();
};

export const StarsUnited = {
  name: GAME_NAME,
  setup: setup,
  moves: { changeNames },
  turn: {
    // Called at the beginning of a turn.
    onBegin: (G, ctx) => {
      evolveStar(G, ctx);
      ctx.events.setActivePlayers({ currentPlayer: "play" });
    },
    stages: {
      play: { 
        moves: { makeStar, feedMassToStar, drawCards, changeNames, freezeStars, challenge }
      },
      challenge: {
        moves: {}
      },
      challenged: {
        moves: { acceptChallenge }
      },
    }
  },
  minPlayers: 2,
  maxPlayers: 5,
  disableUndo: true,
};