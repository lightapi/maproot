import React from 'react';
import { useApiGet } from '../../hooks/useApiGet';
//import useStyles from "./styles";
import StatusContainer from './StatusContainer';
import CircularProgress from '@material-ui/core/CircularProgress';

// This is for other users to view the current readonly status by userId regardless if he/she logs in

export default function PeerStatus(props) {
  //const classes = useStyles();
  const userId = props.location.state.data.userId;
  const cmd = {
    host: 'lightapi.net',
    service: 'covid',
    action: 'getStatusByUserId',
    version: '0.1.0',
    data: { userId: userId }
  }

  const url = '/portal/query?cmd=' + encodeURIComponent(JSON.stringify(cmd));
  const headers = {};

  const { isLoading, data } = useApiGet({url, headers});
  let subjects = data || {};

  let wait;
  if(isLoading) {
    wait = <div><CircularProgress/></div>;
  } else {
    wait = (
      <StatusContainer {...props} subjects = {subjects} isReadonly={true}/>
    )
  }

  return (
    <div className="App">
      {wait}
    </div>
  );
}

