import React from 'react';
import { useApiGet } from '../../hooks/useApiGet';
import { useUserState } from "../../context/UserContext";
import Widget from "../../components/Widget";
import useStyles from "./styles";
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';

export default function EntityProfile(props) {
  const classes = useStyles();
  const { email } = useUserState();
  //console.log("isAuthenticated = " + isAuthenticated + " userId = " + userId);
  const cmd = {
    host: 'lightapi.net',
    service: 'covid',
    action: 'getEntity',
    version: '0.1.0',
    data: { email }
  }

  const url = '/portal/query?cmd=' + encodeURIComponent(JSON.stringify(cmd));
  const headers = {};

  const { isLoading, data, error } = useApiGet({url, headers});

  const deleteEntity = () => {
    if (window.confirm("Are you sure you want to delete the entity?")) {
      //console.log("confirmed");
      props.history.push({pathname: '/app/covid/deleteEntity', state: { data }});
    } 
  };

  const updateEntity = () => {
    //console.log("updateEntity is called");
    props.history.push({pathname: '/app/form/updateCovidEntity', state: { data }});
  };

  const createEntity = () => {
    //console.log("createEntity is called");
    props.history.push('/app/form/createCovidEntity');
  };

  let buttons;
  if(data) {
    buttons = (
        <div className={classes.button}>
          <Button variant="contained" color="primary" onClick={updateEntity}>
            Update
          </Button>
          <Button variant="contained" color="primary" onClick={deleteEntity}>
            Delete
          </Button>
        </div>  
      )
  } else {
    buttons = (
        <div className={classes.button}>
          <Button variant="contained" color="primary" onClick={createEntity}>
            Create
          </Button>
        </div>  
      )
  }

  let wait;
  if(isLoading) {
    wait = <div><CircularProgress/></div>;
  } else {
    wait = (
      <Widget
        title="Entity Profile"
        upperTitle
        bodyClass={classes.fullHeightBody}
        className={classes.card}
      >
        { buttons }
        <pre>{ data ? JSON.stringify(data, null, 2) : error }</pre>
      </Widget>
    )
  }

  return (
    <div className="App">
      {wait}
    </div>
  );
}
