import React from 'react';
import { useApiPost } from '../../hooks/useApiPost';
import CircularProgress from '@material-ui/core/CircularProgress';


export default function DeleteCity(props) {
	console.log(props.location.state.data);
	const country = props.location.state.data.country;
	const province = props.location.state.data.province;
	const city = props.location.state.data.city;
	const body = {
		host: 'lightapi.net',
		service: 'covid',
		action: 'deleteCityMap',
		version: '0.1.0',
		data: { country, province, city }
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
