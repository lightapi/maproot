import React from 'react';
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import Layout from "./components/Layout";
import Error from "./pages/error";

// this history doesn't work. remove it later.
//export const history = createBrowserHistory();

const App = () => {
  return (
    <HashRouter>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/app/dashboard" />} />
        <Route path="/app" component={Layout} />
        <Route component={Error} />
      </Switch>
    </HashRouter>
  );
}

export default App;
