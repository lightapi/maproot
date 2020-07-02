import React, { useEffect } from "react";
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
import Restaurant from "./com/Restaurant";
import { useSiteDispatch, updateSite } from "./context/SiteContext";

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
  realEstate: RealEstate,
  restaurant: Restaurant
};

export default props => {
  console.log(props);
  const siteDispatch = useSiteDispatch();

  useEffect(() => {
    updateSite(siteDispatch, props.site, props.userId);
    if(props.instruction) {
      siteDispatch({ type: "UPDATE_INSTRUCTION", instruction: props.instruction});            
    }  
  });

  const pm = (id) => {
    //console.log("private message is called", id);
    props.history.push({pathname: '/app/form/privateMessage', state: { data: { userId: id }}});
  };
  
  if (typeof Components[props.site.co] !== "undefined") {
    return React.createElement(Components[props.site.co], {
      userId: props.userId,
      pm: pm,
      site: props.site
    });
  }
  return React.createElement(
    () => <div>The component {props.site.co} has not been created yet.</div>
  );
};
