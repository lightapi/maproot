import React, { useState } from "react";
import { IconButton, Menu, MenuItem } from "@material-ui/core";
import { ShoppingCart } from "@material-ui/icons";
import classNames from "classnames";
import { useSiteState, useSiteDispatch } from "../../context/SiteContext";
import { Badge } from "../Wrappers/Wrappers";


export default function CartMenu(props) {
    var classes = props.classes;
    const [cartOpen, setCartOpen] = useState(false);
    var siteDispatch = useSiteDispatch();
    const { cart, menu } = useSiteState();
    //console.log("site = ", site);
    const updateCart = (cart) => {
       siteDispatch({ type: "UPDATE_CART", cart }); 
    }

    return (
      <React.Fragment>
        { 'catalog' === menu ? (
          <React.Fragment>
          <IconButton
            aria-haspopup="true"
            color="inherit"
            className={classes.headerMenuButton}
            aria-controls="home-menu"
            onClick={() => setCartOpen(!cartOpen)}
          >
            <Badge
              badgeContent={cart && cart.length > 0 ? cart.length : null}
              color="secondary"
            >
              <ShoppingCart classes={{ root: classes.headerIcon }} />
            </Badge>
          </IconButton>
          </React.Fragment>
        )
        : null
      }
      </React.Fragment>
    );
}

