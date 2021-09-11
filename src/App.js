import { Client } from 'boardgame.io/react';
import { StarsUnited } from './game/Game';
import { StarsUnitedBoard } from './game/Board';
import { SocketIO } from 'boardgame.io/multiplayer'
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch, Redirect, useHistory } from "react-router-dom";
import Home from "./game/Home/Home";
import Room from "./game/Room/Room";
import './App.css';

const StarsUnitedClient = Client({ 
  game: StarsUnited, 
  board: StarsUnitedBoard,
  multiplayer: SocketIO({server: 'localhost:8000'})
});

const App = () => {
  const history = useHistory(); // remember the history of user navigation

  // defining the routing: (so far) homepage, lobby/room page. else redirect to home page for simplicity
  return (
    <Switch>
      <Route exact path="/">
        <Home history={history} />
      </Route>
      <Route exact path="/rooms/:id">
        <Room history={history} />
      </Route>
      <Redirect to="/" />
    </Switch>
  );
};
export default App;