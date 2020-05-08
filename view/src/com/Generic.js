import React from "react";

export default props => (
  <div>
    <hr />
    <h2>Generic</h2>
    <pre>{JSON.stringify(props.site, null, 2)}</pre>
  </div>
);
