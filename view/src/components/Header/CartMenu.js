import React, { useState, useEffect } from "react";
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
    const [ cartItems, setCartItems] = useState([]);

    useEffect(() => {
      console.log("calling useEffect");
      siteDispatch({ type: "UPDATE_CART", cart: cartItems }); 
    }, [cartItems.length]);

    const deleteFromCart = (sku) => {
      console.log("deleteFromCart is called", sku);
      console.log("cart = ", cart);
      setCartItems(cart.filter( item => item.sku !== sku))
      console.log("cartItems = ", cartItems);
    }

    const checkout = () => {
      console.log("Checkout is called");
    }
    const TAX_RATE = 0.13;

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
            { cart && cart.length > 0 ? 
            <React.Fragment>
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
                  <TableRow>
                    <TableCell rowSpan={3}/>
                    <TableCell>Subtotal</TableCell>
                    <TableCell align="left">{12}</TableCell>
                    <TableCell/>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tax - {`${(TAX_RATE * 100).toFixed(0)} %`}</TableCell>
                    <TableCell align="left">7.49</TableCell>
                    <TableCell/>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total</TableCell>
                    <TableCell align="left">200</TableCell>
                    <TableCell/>
                  </TableRow>  
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
            </React.Fragment>
            : <div className={classes.emptyCart}>Empty Cart!</div>
          }
          </Menu>          
          </React.Fragment>
        )
        : null
      }
      </React.Fragment>
    );
}

