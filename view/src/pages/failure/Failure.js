import React from 'react';

export default function Failure(props) {
	console.log("props = ", props);
	console.log("error = ", props.location.state.error);
	const error = props.location.state.error;
    return (
        <div>
            <h2>Failure</h2>
			<pre>{ JSON.stringify(error, null, 2) }</pre>
        </div>
    );
}
