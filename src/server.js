// src/server.js
const { Server, Origins } = require('boardgame.io/server');
const { StarsUnited } = require('./game/Game');

const server = Server({
  games: [StarsUnited],
  origins: [Origins.LOCALHOST],
});

server.run(8000);