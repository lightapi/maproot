import React, { useState } from "react";
import { IconButton, Menu, MenuItem, Fab } from "@material-ui/core";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import { ShoppingCart, VerifiedUser, DeleteForever } from "@material-ui/icons";
import classNames from "classnames";
import { useSiteState, useSiteDispatch } from "../../context/SiteContext";
import { Badge } from "../Wrappers/Wrappers";


export default function CartMenu(props) {
    var classes = props.classes;
    const [cartMenu, setCartMenu] = useState(false);
    var siteDispatch = useSiteDispatch();
    const { cart, menu } = useSiteState();
    //console.log("site = ", site);
    const updateCart = (cart) => {
       siteDispatch({ type: "UPDATE_CART", cart }); 
    }

    const deleteFromCart = (sku) => {
      console.log("deleteFromCart is called", sku);
    }
    const checkout = () => {
      console.log("Checkout is called");
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
            onClick={(e) => setCartMenu(e.currentTarget)}
          >
            <Badge
              badgeContent={cart && cart.length > 0 ? cart.length : null}
              color="secondary"
            >
              <ShoppingCart classes={{ root: classes.headerIcon }} />
            </Badge>
          </IconButton>
          <Menu
            id="mail-menu"
            open={Boolean(cartMenu)}
            anchorEl={cartMenu}
            onClose={() => setCartMenu(null)}
            MenuListProps={{ className: classes.headerMenuList }}
            className={classes.headerMenu}
            classes={{ paper: classes.profileMenu }}
            disableAutoFocusItem
          >
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="spanning table">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell align="left">Name/Price</TableCell>
                    <TableCell align="right">Qty./Sum</TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart && cart.map((row) => (
                    <TableRow key={row.sku}>
                      <TableCell><img className={classes.cartImage} src={row.image}/></TableCell>
                      <TableCell>{row.name}<Divider/>{row.price}</TableCell>
                      <TableCell>{row.quantity}<Divider/>{row.quantity * row.price}</TableCell>
                      <TableCell><DeleteForever onClick={() => deleteFromCart(row.sku)}/></TableCell>
                    </TableRow>  
                  ))}                
                </TableBody>
              </Table>
            </TableContainer>
            <Fab
              variant="extended"
              color="primary"
              aria-label="Checkout"
              onClick={checkout}
              className={classes.sendMessageButton}
            >
              CHECKOUT
              <VerifiedUser className={classes.sendButtonIcon} />
            </Fab>

          </Menu>          
          </React.Fragment>
        )
        : null
      }
      </React.Fragment>
    );
}

