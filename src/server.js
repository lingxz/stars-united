// src/server.js
const { Server, Origins } = require('boardgame.io/server');
const { StarsUnited } = require('./game/Game');
const { WEB_URL } = require('./config');

const server = Server({
  games: [StarsUnited],
  origins: [Origins.LOCALHOST, WEB_URL],
});

server.run(8000);