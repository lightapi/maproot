import React from 'react';
import { useApiGet } from '../../hooks/useApiGet';
import { useUserState } from "../../context/UserContext";
import Widget from "../../components/Widget";
import useStyles from "./styles";

import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';

export default function Profile(props) {
  const classes = useStyles();
  const { userId } = useUserState();
  //console.log("isAuthenticated = " + isAuthenticated + " userId = " + userId);
  const cmd = {
    host: 'lightapi.net',
    service: 'user',
    action: 'queryUserByEmail',
    version: '0.1.0',
    data: { email: userId }
  }

  const url = '/portal/query?cmd=' + encodeURIComponent(JSON.stringify(cmd));
  const headers = {};

  const { isLoading, data } = useApiGet({url, headers});

  const deleteProfile = () => {
    if (window.confirm("Are you sure you want to delete your profile?")) {
      //console.log("confirmed");
      props.history.push({pathname: '/app/deleteProfile', state: { data }});
    } 
  };

  const editProfile = () => {
    //console.log("editProfile is called");
    props.history.push({pathname: '/app/form/updateProfile', state: { data }});
  };

  let wait;
  if(isLoading) {
    wait = <div><CircularProgress/></div>;
  } else {
    wait = (
      <Widget
        title="User Profile"
        upperTitle
        bodyClass={classes.fullHeightBody}
        className={classes.card}
      >
        <div className={classes.button}>
          <Button variant="contained" color="primary" onClick={editProfile}>
            Edit
          </Button>
          <Button variant="contained" color="primary" onClick={deleteProfile}>
            Delete
          </Button>
        </div>  
        <pre>{ data ? JSON.stringify(data, null, 2) : 'Unauthorized' }</pre>
      </Widget>
    )
  }

  return (
    <div className="App">
      {wait}
    </div>
  );
}

