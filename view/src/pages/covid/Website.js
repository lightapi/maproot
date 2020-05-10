import React from 'react';
import { useApiGet } from '../../hooks/useApiGet';
//import useStyles from "./styles";
import StatusContainer from './StatusContainer';
import CircularProgress from '@material-ui/core/CircularProgress';
import ComRender from '../../ComRender';
// This is for other users to view the current readonly status by userId regardless if he/she logs in

export default function Website(props) {
  //const classes = useStyles();
  const cmd = {
    host: 'lightapi.net',
    service: 'covid',
    action: 'getWebsiteByUserId',
    version: '0.1.0',
    data: { userId: props.userId }
  }

  const url = '/portal/query?cmd=' + encodeURIComponent(JSON.stringify(cmd));
  const headers = {};

  const { isLoading, data, error } = useApiGet({url, headers});
  let site = data || {};

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
      <div>
	    	<ComRender {...props} site={site}/>
      </div>
    )
  }

  return (
    <div className="App">
      {wait}
    </div>
  );
}

