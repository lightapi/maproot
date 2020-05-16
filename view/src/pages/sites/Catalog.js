import React, {useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/styles';
import Header from './catalog/Header';
import Footer from './catalog/Footer';
import Products from './catalog/Products';
import { useSiteDispatch } from "../../context/SiteContext";

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

    const [cart, setCart] = useState([]);
    const siteDispatch = useSiteDispatch();
    console.log("cart =", cart);
    
    useEffect(() => {
      siteDispatch({ type: "UPDATE_CART", cart }); 
    }, [cart.length]);

    /*
    const [totalItems, setTotalItems] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    */
    const onAddToCart = (selectedProduct) => {
      let sku = selectedProduct.sku;
      let qty = selectedProduct.quantity;
      if(checkProduct(sku)) {
        let index = cart.findIndex(x => x.sku === sku);
        cart[index].quantity = Number(cart[index].quantity) + Number(qty);
        setCart(cart => [...cart]);
      } else {
        setCart(cart => [...cart, selectedProduct]);
      }
    }

    const onDeleteFromCart = (sku) => {
      setCart(cart.filter(item => item.sku !== sku));
    }

    const checkProduct = (sku) => {
      return cart.some(item => item.sku === sku);
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
