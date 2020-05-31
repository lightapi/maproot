import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/styles';
import Footer from './catalog/Footer';
import Products from './catalog/Products';
import { useSiteDispatch, useSiteState } from "../../context/SiteContext";
import { useUserState } from "../../context/UserContext";

const useStyles = makeStyles({
  container: {
    "display": "flex",
    "maxWidth": "960px",
    "margin": "0 auto",
    "padding": "0 32px",
    '@media (max-width: 991px)': {
      padding: "0",
    },  
  },
})

export default function Catalog(props) {
    //var classes = useStyles();
    const { products, storeName } = props;
    //console.log("products = ", products)
    //console.log("storeName = ", storeName);

    const { cart } = useSiteState();
    const siteDispatch = useSiteDispatch();
    const { isAuthenticated } = useUserState();

    /*
    const [totalItems, setTotalItems] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    */
    const onAddToCart = (selectedProduct) => {
      // check if the user is authenticated. If not, popup a warning window.
      if(!isAuthenticated) {
        window.alert("An anonymous user cannot checkout and receive notifications. Please log in first.");
      } else {
        let sku = selectedProduct.sku;
        let qty = selectedProduct.quantity;
        if(checkProduct(sku)) {
          let index = cart.findIndex(x => x.sku === sku);
          cart[index].quantity = Number(cart[index].quantity) + Number(qty);
              siteDispatch({ type: "UPDATE_CART", cart: [...cart] }); 
        } else {
          siteDispatch({ type: "UPDATE_CART", cart: [...cart, selectedProduct] }); 
        }
      }
    }

    const checkProduct = (sku) => {
      console.log("cart = ", cart);
      return Array.isArray(cart) && cart.some(item => item.sku === sku);
    }

    /*
    const sumTotalAmount = () => {
      let total = 0;
      for (var i = 0; i < cart.length; i++) {
        total += cart[i].price * parseInt(cart[i].quantity);
      }
      return total;
    }
    */

    return (
      <div>
        <Products onAddToCart={onAddToCart} products={products}/>
        <Footer storeName={storeName}/>
      </div>
    );
}
