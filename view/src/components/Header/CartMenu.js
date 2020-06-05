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
import InputLabel from '@material-ui/core/InputLabel';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import SchemaForm from 'react-schema-form/lib/SchemaForm';
import utils from 'react-schema-form/lib/utils';
import { ShoppingCart, VerifiedUser, DeleteForever } from "@material-ui/icons";
import DropIn from "braintree-web-drop-in-react";
import { useSiteState, useSiteDispatch } from "../../context/SiteContext";
import { useUserState } from "../../context/UserContext";
import { useApiGet } from '../../hooks/useApiGet';
import { useApiPost } from '../../hooks/useApiPost';
import { Badge } from "../Wrappers/Wrappers";
import forms from '../../data/Forms';

function Braintree(props) {
  const [instance, setInstance] = useState();
  const [nonce, setNonce] = useState();
  const [clientToken, setClientToken] = useState(null);
  const { owner, payment } = useSiteState();

  const { step, classes, completePayment, proceedPayment, summarizeOrder } = props;

  // get clientToken with useApiGet hook.
  const cmd = {
    host: 'lightapi.net',
    service: 'user',
    action: 'getClientToken',
    version: '0.1.0',
    data: { userId: owner, merchantId: payment.merchantId }
  }
  const url = '/portal/query?cmd=' + encodeURIComponent(JSON.stringify(cmd));
  const headers = {};
  const callback = (data) => {
    console.log("data = ", data);
    setClientToken(data.clientToken);
  }
  let { isLoading, data, error } = useApiGet({url, headers, callback});

  const onBuy = async () => {
    console.log("Buy is clicked");
    const { nonce } = await instance.requestPaymentMethod();
    console.log("nonce = ", nonce);
    setNonce(nonce);
    // send to server with a command API call.
    completePayment();
  }

  if(step !==5) {
    return null;
  }

  if (!clientToken) {
    return (
      <div><CircularProgress/></div>
    );
  } else {
    return (
      <div>
        <DropIn
          options={{ authorization: clientToken }}
          onInstance={(inst) => (setInstance(inst))}
        />
        <Button variant="contained" className={classes.button} color="primary" onClick={e => proceedPayment()}>PAYMENT OPTIONS</Button>
        {nonce? null : <Button variant="contained" className={classes.button} color="primary" onClick={e => onBuy()}>BUY</Button>}
        {nonce? <Button variant="contained" className={classes.button} color="primary" onClick={e => summarizeOrder()}>SUMMARY</Button> : null}
      </div>
    );
  }
}

function Summary(props) {
  const { step, classes, proceedPayment, cleanCart } = props;
  const { owner, cart, delivery, payment } = useSiteState();
  const { email, userId } = useUserState();

  // save the order through API
	const body = {
		host: 'lightapi.net',
		service: 'user',
		action: 'createOrder',
		version: '0.1.0',
		data: { 
      userId: owner,
      order: {
        merchantUserId: owner,
        customerEmail: email,
        customerUserId: userId,
        delivery: delivery,
        items: cart,
        payment: payment
      }
    }
  };
  console.log("body = ", body);
	const url = '/portal/command';
	const headers = {};
	const { isLoading, data, error } = useApiPost({url, headers, body});
  console.log(isLoading, data, error);

  if(step !==4) {
    return null;
  }

	let wait;
  if(isLoading) {
		wait = <div><CircularProgress/></div>;
	} else {
		wait = (
      <React.Fragment>
        <div className={classes.emptyCart}>
            <h4>Order Summary</h4>
            <p>Order Id: {data.orderId}</p>
            <p>Pass Code: {data.passCode}</p>
        </div>
        <Button variant="contained" className={classes.button} color="primary" onClick={e => cleanCart()}>Close</Button>
      </React.Fragment>
		)  
	}	

	return (
	<div>
		{wait}
	</div>
	);
}

function Payment(props) {
  const { step, classes, summarizeOrder, startBraintree, completePayment, selectDelivery }  = props;
  const { owner } = useSiteState();
  const [payment, setPayment] = useState({method: ""});
  let siteDispatch = useSiteDispatch();

  // retrieve payment options
  const cmd = {
    host: 'lightapi.net',
    service: 'user',
    action: 'getPaymentById',
    version: '0.1.0',
    data: { userId: owner }
  }

  const url = '/portal/query?cmd=' + encodeURIComponent(JSON.stringify(cmd));
  const headers = {};
  const { isLoading, data, error } = useApiGet({url, headers});
  
  //console.log("data = ", data);
  
  if(step !==3) {
    return null;
  }

  const onPayment = () => {
    switch (payment.method) {
      case 'OnPickup': 
        completePayment();
        summarizeOrder();
        break;
      case 'Braintree':
        startBraintree();
        break;
      default: 
        window.alert("Please select a payment method.");
        break;
    }
  }

  const onChange = (event, child) => {
    console.log("onChange is called", event.target.value, child.key);
    let method = event.target.value;
    switch (method) {
      case 'OnPickup': 
        setPayment({method: 'OnPickup'});
        siteDispatch({ type: "UPDATE_PAYMENT", payment: {method: 'OnPickup'}});      
        break;
      case 'Braintree': 
        // find the merchantId
        setPayment({method: 'Braintree', merchantId: data[child.key].merchantId })
        siteDispatch({ type: "UPDATE_PAYMENT", payment: {method: 'Braintree', merchantId: data[child.key].merchantId }});      
        break;
    }
  }

  let title = <h2>Payment Option</h2>
  if(isLoading) {
    return <CircularProgress className={classes.progress} />
  } else if(data) {
    let menuItems = [];
    data.map((payment, index) => {
      menuItems.push(<MenuItem key={index} value={payment.method}>{payment.method + (payment.sandbox ? '-Sandbox' : '')}</MenuItem>);
      return menuItems;
    })
    return (
      <div>
        {title}    
        <FormControl className={classes.formControl}>
          <div>
          <InputLabel id="demo-simple-select-label">Method</InputLabel>        
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={payment.method}
            onChange={onChange}
          >
            { menuItems }
          </Select>
          </div>
          <p/>
          <div>
          <Button variant="contained" className={classes.button} color="primary" onClick={e => selectDelivery()}>Delivery</Button>
          <Button variant="contained" className={classes.button} color="primary" onClick={e => onPayment()}>Payment</Button>
          </div>
        </FormControl>
      </div>
    )  
  } else {
    // error
    return <div>{ error }</div>
  }
}

function Delivery(props) {
  const { step, classes, reviewCart, proceedPayment, schema } = props;
  const [model, setModel] = useState({});
  const [showErrors, setShowErrors]  = useState(false);
  const [delivery, setDelivery] = useState();
  let siteDispatch = useSiteDispatch();

  useEffect(() => {
    console.log("calling useEffect", delivery);
    siteDispatch({ type: "UPDATE_DELIVERY", delivery: delivery }); 
  }, [delivery]);

  if(step !== 2) {
    return null;
  }

  let formData = forms['pickupForm'];
  var buttons = [];

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
        setDelivery(model)
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
  const { step, classes, cart, deleteFromCart, selectDelivery, closeCart, taxRate } = props;

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
      <Button variant="contained" className={classes.button} color="primary" onClick={e => closeCart()}>Continue Shopping</Button>
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
    const [completedPayment, setCompletedPayment] = useState(false);

    var siteDispatch = useSiteDispatch();
    const { cart, menu, site } = useSiteState();

    const deleteFromCart = (sku) => {
      console.log("deleteFromCart is called", sku);
      let newCart = cart.filter( item => item.sku !== sku);
      siteDispatch({ type: "UPDATE_CART", cart: newCart }); 
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
    
    const summarizeOrder = () => {
      setStep(4);
    }

    const startBraintree = () => {
      setStep(5);
    }

    const closeCart = () => {
      setCartMenu(null);
    }

    const cleanCart = () => {
      siteDispatch({ type: "UPDATE_CART", cart: [] }); 
      setCartMenu(null);
    }

    const completePayment = () => {
      setCompletedPayment(true);
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
              <CartTotal step={step} taxRate={taxRate} cart={cart} deleteFromCart={deleteFromCart} selectDelivery={selectDelivery} closeCart={closeCart} classes = {classes} />
              <Delivery {...props} step={step} classes={classes} reviewCart={reviewCart} proceedPayment={proceedPayment}/>
              <Payment {...props} step={step} classes={classes} selectDelivery={selectDelivery} summarizeOrder={summarizeOrder} startBraintree={startBraintree} completePayment={completePayment}/>
              { step === 5 ? <Braintree {...props} step={step} classes={classes} proceedPayment={proceedPayment} completePayment={completePayment} summarizeOrder={summarizeOrder}/> : null }
              { completedPayment? <Summary {...props} step={step} classes={classes} cleanCart={cleanCart}/> : null }
            </div>
          </Menu>          
          </React.Fragment>
        )
        : null
      }
      </React.Fragment>
    );
}

