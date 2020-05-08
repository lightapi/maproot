import React from "react";

export default props => (
  <div>
    <hr />
    <h2>Services</h2>
    <pre>{JSON.stringify(props.ss, null, 2)}</pre>
  </div>
);
