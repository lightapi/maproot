import React from 'react';

export default function NotificationDetail(props) {
	console.log("props = ", props);
	console.log("data = ", props.location.state.data);
	const data = props.location.state.data;
    return (
        <div>
            <h2>Notification Detail</h2>
			<pre>{ JSON.stringify(data, null, 2) }</pre>
        </div>
    );
}
