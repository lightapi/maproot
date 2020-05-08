import React from "react";

export default props => (
  <div>
    <hr />
    <h2>Goods</h2>
    <pre>{JSON.stringify(props.ss, null, 2)}</pre>
  </div>
);
