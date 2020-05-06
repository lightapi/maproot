import React from 'react';
import { useApiGet } from '../../hooks/useApiGet';
//import useStyles from "./styles";
import StatusContainer from './StatusContainer';
import CircularProgress from '@material-ui/core/CircularProgress';

// This is for other users to view the current readonly status by userId regardless if he/she logs in

export default function Website(props) {
  //const classes = useStyles();
  const cmd = {
    host: 'lightapi.net',
    service: 'covid',
    action: 'getStatusByUserId',
    version: '0.1.0',
    data: { userId: props.userId }
  }

  const url = '/portal/query?cmd=' + encodeURIComponent(JSON.stringify(cmd));
  const headers = {};

  const { isLoading, data, error } = useApiGet({url, headers});
  let subjects = data || {};

  let wait;
  if(isLoading) {
    wait = <div><CircularProgress/></div>;
  } else if(error) {
		wait = (
      <div>
	    	<pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    )  
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

