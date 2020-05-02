import React from "react";
import {
  Route,
  Switch,
  Redirect,
  withRouter,
} from "react-router-dom";
import classnames from "classnames";

// styles
import useStyles from "./styles";

// components
import Header from "../Header";
import Sidebar from "../Sidebar";
import Form from "../Form/Form";

// pages
import Dashboard from "../../pages/dashboard";
import Notifications from "../../pages/notifications";
import Failure from "../../pages/failure";
import Success from "../../pages/success";
import Profile from "../../pages/profile";
import DeleteProfile from "../../pages/profile/DeleteProfile";
import CityRegistry from "../../pages/covid/CityRegistry";
import CityProfile from "../../pages/covid/CityProfile";
import DeleteCity from "../../pages/covid/DeleteCity";
import EntityProfile from "../../pages/entity/EntityProfile";
import DeleteEntity from "../../pages/entity/DeleteEntity";
import LiveMap from "../../pages/covid/LiveMap";
import Status from "../../pages/covid/Status";
import PeerStatus from "../../pages/covid/UserIdStatus";

// context
import { useLayoutState } from "../../context/LayoutContext";

function Layout(props) {
  var classes = useStyles();

  // global
  var layoutState = useLayoutState();

  return (
    <div className={classes.root}>
        <>
          <Header history={props.history} />
          <Sidebar />
          <div
            className={classnames(classes.content, {
              [classes.contentShift]: layoutState.isSidebarOpened,
            })}
          >
            <div className={classes.fakeToolbar} />
            <Switch>
              <Route path="/app/dashboard" component={Dashboard} />
              <Route exact path="/app/form/:formId" component={Form} />
              <Route path="/app/notifications" component={Notifications} />
              <Route path="/app/failure" component={Failure} />
              <Route path="/app/success" component={Success} />
              <Route path="/app/profile" component={Profile} />
              <Route path="/app/deleteProfile" component={DeleteProfile} />

              <Route path="/app/covid/cityRegistry" component={CityRegistry} />
              <Route path="/app/covid/cityProfile" component={CityProfile} />
              <Route path="/app/covid/deleteCity" component={DeleteCity} />
              <Route path="/app/covid/entity" component={EntityProfile} />
              <Route path="/app/covid/deleteEntity" component={DeleteEntity} />
              <Route path="/app/covid/map" component={LiveMap} />
              <Route path="/app/covid/status" component={Status} />
              <Route path="/app/covid/peerStatus" component={PeerStatus} />
              <Route
                exact
                path="/app/ui"
                render={() => <Redirect to="/app/ui/icons" />}
              />
            </Switch>
          </div>
        </>
    </div>
  );
}

export default withRouter(Layout);
