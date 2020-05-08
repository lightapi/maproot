import React from "react";
import Generic from "./com/Generic";
import Ask from "./com/Ask";
import Give from "./com/Give";
import Offer from "./com/Offer";
import Want from "./com/Want";
import Goods from "./com/Goods";
import Services from "./com/Services";
import Buy from "./com/Buy";
import Sell from "./com/Sell";
import ToRent from "./com/ToRent";
import ToBuy from "./com/ToBuy";
import RealEstate from "./com/RealEstate";

const Components = {
  generic: Generic,
  ask: Ask,
  give: Give,
  offer: Offer,
  want: Want,
  goods: Goods,
  services: Services,
  buy: Buy,
  sell: Sell,
  toRent: ToRent,
  toBuy: ToBuy,
  realEstate: RealEstate
};

export default props => {
  if (typeof Components[props.site.co] !== "undefined") {
    return React.createElement(Components[props.site.co], {
      ss: props.site.ss
    });
  }
  return React.createElement(
    () => <div>The component {props.site.co} has not been created yet.</div>
  );
};
