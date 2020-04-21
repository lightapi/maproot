import React from 'react';
import { useApiPost } from '../../hooks/useApiPost';
import CircularProgress from '@material-ui/core/CircularProgress';


export default function DeleteEntity(props) {
	console.log(props.location.state.data);
	const email = props.location.state.data.email;
	const body = {
		host: 'lightapi.net',
		service: 'covid',
		action: 'deleteEntity',
		version: '0.1.0',
		data: { email }
	};
	const url = '/portal/command';
	const headers = {};
	const { isLoading, data, error } = useApiPost({url, headers, body});
  	console.log(isLoading, data, error);
	let wait;
	if(isLoading) {
		wait = <div><CircularProgress/></div>;
	} else {
		wait = (
		<div>
	    	<pre>{ data ? JSON.stringify(data, null, 2) : 'Unauthorized' }</pre>
		</div>
		)  
	}	

	return (
	<div>
		{wait}
	</div>
	);
}
