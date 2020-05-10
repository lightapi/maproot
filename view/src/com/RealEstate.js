import React from "react";
import SaleRent from "../pages/sites/SaleRent";
import Header from "../pages/sites/Header";

export default props => (
  <div>
    <Header {...props} title="Real Estate Sale or Rent"/>
    <SaleRent {...props}/>
  </div>
);
