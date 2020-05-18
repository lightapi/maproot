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
import { useSiteState, useSiteDispatch } from "../../context/SiteContext";
import { Badge } from "../Wrappers/Wrappers";

function CartTotal(props) {
  const { step, classes, cart, deleteFromCart, checkOut, taxRate } = props;

  const ccyFormat = (num) => {
    return `${num.toFixed(2)}`;
  }

  const subtotal = (items) => {
    let total = 0;
    for(var i = 0; i < items.length; i++) {
      total += items[i].price * parseInt(cart[i].quantity);
    }
    return total;
  }

  const invoiceSubtotal = subtotal(cart);
  const invoiceTaxes = taxRate * invoiceSubtotal / 100;
  const invoiceTotal = invoiceSubtotal + invoiceTaxes;

  let view = null;
  if(step !== 1) {
    return null;
  }

  if(cart && cart.length > 0) {
    view = 
    <div>
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
              <TableCell align="left">{ccyFormat(invoiceSubtotal)}</TableCell>
              <TableCell/>
            </TableRow>
            <TableRow>
              <TableCell>Tax - {`${(taxRate).toFixed(0)} %`}</TableCell>
            <TableCell align="left">{ccyFormat(invoiceTaxes)}</TableCell>
              <TableCell/>
            </TableRow>
            <TableRow>
              <TableCell>Total</TableCell>
            <TableCell align="left">{ccyFormat(invoiceTotal)}</TableCell>
              <TableCell/>
            </TableRow>  
          </TableBody>
        </Table>
      </TableContainer>
      <Fab
        variant="extended"
        color="primary"
        aria-label="Checkout"
        onClick={checkOut}
        className={classes.sendMessageButton}
      >
        CHECKOUT
        <VerifiedUser className={classes.sendButtonIcon} />
      </Fab> 
    </div>
  } else {
    view = <div className={classes.emptyCart}>Empty Cart!</div>
  }

  return (
    <React.Fragment>
      {view}
    </React.Fragment>
  )
}

export default function CartMenu(props) {
    var classes = props.classes;
    const [cartMenu, setCartMenu] = useState(false);
    const [step, setStep] = useState(1);
    var siteDispatch = useSiteDispatch();
    const { cart, menu, site } = useSiteState();
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

    const taxRate = site && site.catalog ? site.catalog.taxRate : 0;

    const checkOut = () => {
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
            <CartTotal {...props} step={step} taxRate={taxRate} cart={cart} deleteFromCart={deleteFromCart} checkOut={checkOut} classes = {classes} />
          </Menu>          
          </React.Fragment>
        )
        : null
      }
      </React.Fragment>
    );
}

