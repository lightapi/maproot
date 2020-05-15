import React, { useState } from "react";
import { makeStyles } from '@material-ui/styles';
import { Close } from "@material-ui/icons";
import { ShoppingCart } from "@material-ui/icons";
import { IconButton } from "@material-ui/core";
import { Badge, Typography } from "../../../components/Wrappers/Wrappers";


//import CartScrollBar from "./CartScrollBar";
import Counter from "./Counter";
import EmptyCart from "./EmptyCart";
//import { PayPalButton } from "react-paypal-button-v2";

const useStyles = makeStyles({
  header: {
    "background": "#fff",
    "padding": "30px 32px",
    "boxShadow": "0px 8px 18px rgba(0, 0, 0, 0.033)",
    "position": "fixed",
    "top": "1",
    "width": "100%",
    "zIndex": "100",
    "animation": "slideUp 300ms linear",
    '@media (max-width: 991px)': {
      "padding": "16px",
    },
    '@media (max-width: 480px)': {
      "padding": "8px 12px"    	
    },
  },
  container: {
    "display": "flex",
    "maxWidth": "960px",
    "margin": "0 auto",
    "padding": "0 32px",
    '@media (max-width: 991px)': {
      padding: "0",
    },  
  },
  logo: {
    "width": "123px",
    '@media (max-width: 480px)': {
      "width": "102px",
      "margin": "2px 0"
    },
  },
  search: {
    "marginLeft": "64px",
    "flexGrow": "1",
    '@media (max-width: 767px)': {
      "marginLeft": "32px",
    },
    '@media (max-width: 480px)': {
      "flexGrow": "initial",
      "marginLeft": "auto",
    },
  },
  searchForm: {
  	"display": "flex",
  },
  cart: {
    "display": "flex",
    "marginLeft": "64px",
    "position": "relative",
    "zIndex": "99",
    '@media (max-width: 991px)': {
      "marginLeft": "16px",
    },
  },
  cartInfo: {
  	'@media (max-width: 991px)': {
      "display": "none",
  	},
    "& table": {
      "fontSize": "14px",
      "color": "#077915",
      "textAlign": "right",
      "& tr": {
        "padding": "0",
        "margin": "0",
      },
      "& td": {
        "padding": "0 4px",
        "lineHeight": "16px"      	
      },
    },
  },
  cartIcon: {
    "marginLeft": "16px",
    "zIndex": "99",
    "position": "relative",
  },
})


const Header = props => {
  const { onDeleteFromCart, onSearch } = props;
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState(props.cart);
  const [mobileSearch, setMobileSearch] = useState(false);

  var classes = useStyles();

  const CartView = ({cart}) => (
    <>
      {cart
        .map(product => (
        <li className="cart-item" key={product.name}>
          <img className="product-image" src={product.image} />
          <div className="product-info">
            <p className="product-name">{product.name}</p>
            <p className="product-price">{product.price}</p>
          </div>
          <div className="product-total">
            <p className="quantity">
              {product.quantity} {product.quantity > 1 ? "Nos." : "No."}{" "}
            </p>
            <p className="amount">{product.quantity * product.price}</p>
          </div>
          <Close className={classes.productRemove} onClick={() => onDeleteFromCart(product.sku)}/>
        </li>          
      ))}
    </>
  );

  let view;
  if (cart.length <= 0) {
    view = <EmptyCart />;
  } else {
    view = (
       <CartView cart={cart}/>
    );
  }

  const client = {
    sandbox: "Ac_G0luBCvsK6CiHlToWw925Km4yGmI3yIVj2bimXpiRv4dyP8-ROCyJazzNe0g0u3J1M278U2DXyEEi",
    production: "YOUR-PRODUCTION-APP-ID"
  };


  return (
      <header className={classes.header}>
        <div className={classes.container}>
          <div>
            <img className={classes.logo}
              src="https://res.cloudinary.com/sivadass/image/upload/v1493547373/dummy-logo/Veggy.png"
              alt="Veggy Brand Logo"
            />
          </div>

          <div className={classes.search}>
            <form
              action="#"
              method="get"
              className={classes.searchForm}
            >
              <input
                type="search"
                placeholder="Search Keyword"
                className={classes.searchKeyWord}
                onChange={onSearch}
              />
            </form>
          </div>  

          <div className={classes.cart}>
            <div className={classes.cartInfo}>
              <table>
                <tbody>
                  <tr>
                    <td>No. of items</td>
                    <td>:</td>
                    <td>
                      <strong>{props.totalItems}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Sub Total</td>
                    <td>:</td>
                    <td>
                      <strong>{props.total}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
	        <IconButton
	          color="inherit"
	          aria-haspopup="true"
	          aria-controls="mail-menu"
	          onClick={() => setShowCart(!showCart)}
	          className={classes.cartIcon}
	        >
	          <Badge
	            badgeContent={props.totalItems ? props.totalItems : null}
	            color="secondary"
	          >
	            <ShoppingCart/>
	          </Badge>
	        </IconButton>
            <div
              className={
                showCart ? "cart-preview active" : "cart-preview"
              }
            >
              {view}
            </div>
          </div>
        </div>
      </header>

  );
};

export default Header;
