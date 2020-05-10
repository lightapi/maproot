import React from "react";
import Common from "../pages/sites/Common";
import Header from "../pages/sites/Header";

export default props => (
  <div>
    <Header {...props} title="To Buy Real Estate"/>
    <Common {...props}/>
  </div>
);
