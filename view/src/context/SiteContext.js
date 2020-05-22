import React from "react";

var SiteStateContext = React.createContext();
var SiteDispatchContext = React.createContext();

function siteReducer(state, action) {
  console.log("state = ", state);
  console.log("action = ", action);
  switch (action.type) {
    case "UPDATE_SITE":
      return { ...state, site: action.site, owner: action.owner };
    case "UPDATE_MENU":
      return { ...state, menu: action.menu };
    case "UPDATE_FILTER":
      return { ...state, filter: action.filter.toLowerCase() };
    case "UPDATE_CART":
      return { ...state, cart: action.cart };
    case "UPDATE_DELIVERY":
      return { ...state, delivery: action.delivery };
    case "UPDATE_PAYMENT":
      return { ...state, payment: action.payment };
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function SiteProvider({ children }) {
  console.log("SiteProvider is called...");
  var [state, dispatch] = React.useReducer(siteReducer, {
    site: null,
    owner: null,
    cart: [],
    delivery: {},
    payment: {},
    filter: null,
    menu: 'home'
  });

  return (
    <SiteStateContext.Provider value={state}>
      <SiteDispatchContext.Provider value={dispatch}>
        {children}
      </SiteDispatchContext.Provider>
    </SiteStateContext.Provider>
  );
}

function useSiteState() {
  var context = React.useContext(SiteStateContext);
  if (context === undefined) {
    throw new Error("useSiteState must be used within a SiteProvider");
  }
  return context;
}

function useSiteDispatch() {
  var context = React.useContext(SiteDispatchContext);
  if (context === undefined) {
    throw new Error("useSiteDispatch must be used within a SiteProvider");
  }
  return context;
}

export { SiteProvider, useSiteState, useSiteDispatch, updateSite, addToCart, deleteFromCart };

function updateSite(dispatch, site, owner) {
    dispatch({ type: "UPDATE_SITE", site, owner });
}


function addToCart(dispatch, sku) {
    dispatch({ type: "ADD_TO_CART",  });
}

function deleteFromCart(dispatch, sku) {
    dispatch({ type: "DELETE_FROM_CART" });
}

