import { INVALID_MOVE } from 'boardgame.io/core';

const PLAYER_NOT_EXIST = "Player does not exist";

export const parseCommand = (command, props) => {
    const splitString = command.trim().toLowerCase().split(" ");
    const action = splitString[0];
    const args = splitString.slice(1);
    switch (action) {
        case "make":
            if (args.length !== 1) {
                return INVALID_MOVE;
            }
            if (args[0] !== "small" && args[0] !== "large") {
                return INVALID_MOVE;
            }
            return props.moves.makeStar(args[0]);
        case "freeze":
            if (args.length === 0) {
                return INVALID_MOVE;
            }
            // TODO Validate the numbers
            return props.moves.freezeStars(args.map((item) => parseInt(item) - 1));
        case "draw":
            if (args.length !== 0) {
                return INVALID_MOVE;
            }
            return props.moves.drawCards();
        case "challenge":
            // First argument is player name, second argument is the star index of that player
            if (args.length !== 2) {
                return INVALID_MOVE;
            }
            const challengedPlayerName = args[0];
            const challengedPlayerStar = parseInt(args[1]) - 1;
            let challengedPlayerId = null;
            for (let playerId of Object.keys(props.G.players)) {
                if (props.G.players[playerId].name === challengedPlayerName) {
                    challengedPlayerId = playerId;
                    break;
                }
            }
            if (challengedPlayerId === null) {
                return PLAYER_NOT_EXIST;
            }
            return props.moves.challenge(challengedPlayerId, challengedPlayerStar)
        case "accept":
            if (args.length !== 0) {
                return INVALID_MOVE;
            }
            return props.moves.acceptChallenge();
        default:
            return INVALID_MOVE;
    }
}