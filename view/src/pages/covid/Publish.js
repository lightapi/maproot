import React from 'react';
import { useApiGet } from '../../hooks/useApiGet';
import { useUserState } from "../../context/UserContext";
import CircularProgress from '@material-ui/core/CircularProgress';
import FormDispatcher from './FormDispatcher';

// This is the status entry point for users to update his/her status after logging in.

export default function Publish(props) {
  const { email } = useUserState();
  const statusCmd = {
    host: 'lightapi.net',
    service: 'covid',
    action: 'getStatusByEmail',
    version: '0.1.0',
    data: { email }
  }
  var url = '/portal/query?cmd=' + encodeURIComponent(JSON.stringify(statusCmd));
  var headers = {};
  var { isLoading, data } = useApiGet({url, headers});

  let subjects = data || {};

  const entityCmd = {
    host: 'lightapi.net',
    service: 'covid',
    action: 'getEntity',
    version: '0.1.0',
    data: { email }
  }
  var url = '/portal/query?cmd=' + encodeURIComponent(JSON.stringify(entityCmd));
  var headers = {};
  var { isLoading, data, error } = useApiGet({url, headers});
  let entity = data;
  console.log("entity = ", entity);

  let wait;
  if(isLoading) {
    wait = <div><CircularProgress/></div>;
  } else if(error) {
    wait = (      
      <div>
        <h2>Failure</h2>
      <pre>{ JSON.stringify(error, null, 2) }</pre>
      </div>
    )  
  } else {
    wait = (
      <FormDispatcher {...props} category={entity.category} subcategory={entity.subcategory} subjects = {subjects}/>
    )
  }

  return (
    <div className="App">
      {wait}
    </div>
  );
}
