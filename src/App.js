import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
  Link
} from "react-router-dom";
import './css/bulma.css';
import './css/custom.css';
import Rooms from "./components/Room/Index.jsx";
import Room from "./components/Room/Show.jsx";
import Login from "./components/User/Login.jsx";
import SignUp from "./components/User/SignUp.jsx";
import Form from "./components/Room/Form.jsx";

export default function App() {
  return (
    <div className="App">
        <Router>
      <Switch>
        <Route path="/" exact component={Rooms} />
        <Route path="/rooms" exact component={Rooms} />
        <Route path="/rooms/new" exact component={Form} />
        <Route path="/rooms/:id" exact component={Room} />
        <Route path="/login" exact component={Login} />
        <Route path="/signup" exact component={SignUp} />
        
      </Switch>
      </Router>
    </div>
  );
}