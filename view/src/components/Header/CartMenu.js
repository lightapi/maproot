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
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextField from '@material-ui/core/TextField';
import Form from "@material-ui/core/FormControl";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from "@material-ui/core/Grid";
import SchemaForm from 'react-schema-form/lib/SchemaForm';
import utils from 'react-schema-form/lib/utils';
import { ShoppingCart, VerifiedUser, DeleteForever } from "@material-ui/icons";
import { useSiteState, useSiteDispatch } from "../../context/SiteContext";
import { Badge } from "../Wrappers/Wrappers";
import forms from '../../data/Forms';

function Payment(props) {
  const {step, classes}  = props;
  const [model, setModel] = useState({});
  const [showErrors, setShowErrors]  = useState(false);

  if(step !==3) {
    return null;
  }

  const onModelChange = (key, val, type) => {
    utils.selectOrSet(key, model, val, type);
    setModel({...model});  // here we must create a new object to force re-render.
  };

  let formData = forms['paymentForm'];
  let title = <h2>{formData.schema.title}</h2>

  return (
    <div>
      {title}    
      <SchemaForm schema={formData.schema} form={formData.form} model={model} showErrors={showErrors} onModelChange={onModelChange} />
    </div>
  )  

}

function Delivery(props) {
  const { step, classes, reviewCart, proceedPayment, schema } = props;
  const [model, setModel] = useState({});
  const [showErrors, setShowErrors]  = useState(false);

  if(step !== 2) {
    return null;
  }

  let formData = forms['pickupForm'];
  var buttons = [];

  let defaultDelivery = 'pickup';

  const onModelChange = (key, val, type) => {
    utils.selectOrSet(key, model, val, type);
    setModel({...model});  // here we must create a new object to force re-render.
  };

  const onButtonClick = (item) => {
    console.log("item = ", item);
    if(item.action === 'cart') {
      reviewCart();
    } else {
      let validationResult = utils.validateBySchema(formData.schema, model);
      if(!validationResult.valid) {
          setShowErrors(true);
      } else {
        proceedPayment();
      }   
    }
  }

  
  formData.actions.map((item, index) => {
      buttons.push(<Button variant="contained" className={classes.button} color="primary" key={index} onClick={e => onButtonClick(item)}>{item.title}</Button>)
      return buttons;
  });
  let title = <h2>{formData.schema.title}</h2>

  return (
    <div>
      {title}    
      <SchemaForm schema={formData.schema} form={formData.form} model={model} showErrors={showErrors} onModelChange={onModelChange} />
      {buttons}
    </div>
  )  
}

const CartTotal = (props) => {
  const { step, classes, cart, deleteFromCart, selectDelivery, continueShopping, taxRate } = props;

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
      <Button variant="contained" className={classes.button} color="primary" onClick={e => continueShopping()}>Continue Shopping</Button>
      <Button variant="contained" className={classes.button} color="primary" onClick={e => selectDelivery()}>CHECKOUT</Button>
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

    const selectDelivery = () => {
      setStep(2);
    }

    const reviewCart = () => {
      setStep(1);
    }

    const proceedPayment = () => {
      setStep(3);
    }
    const confirmOrder = () => {
      setStep(4);
    }
    const continueShopping = () => {
      setCartMenu(null);
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
            onClick={(e) => {setCartMenu(e.currentTarget); setStep(1);}}
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
            <div>
              <CartTotal step={step} taxRate={taxRate} cart={cart} deleteFromCart={deleteFromCart} selectDelivery={selectDelivery} continueShopping={continueShopping} classes = {classes} />
              <Delivery {...props} step={step} classes={classes} reviewCart={reviewCart} proceedPayment={proceedPayment}/>
              <Payment {...props} step={step} classes={classes} selectDelivery={selectDelivery} confirmOrder={confirmOrder}/>
            </div>
          </Menu>          
          </React.Fragment>
        )
        : null
      }
      </React.Fragment>
    );
}

