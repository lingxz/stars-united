import { Route, Switch, Redirect, useHistory } from "react-router-dom";
import Home from "./game/Home/Home";
import Room from "./game/Room/Room";
import './App.css';


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