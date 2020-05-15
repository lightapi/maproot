import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import Counter from './Counter';

const useStyles = makeStyles({
  product: {
    "background": "#fff",
    "margin": "16px",
    "width": "200px",
    "borderRadius": "2px",
    '&:hover': {
      "boxShadow": "0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)"
    },
  },
  productImage: {
    "overflow": "hidden",
    "borderRadius": "2px 2px 0 0",
    "maxHeight": "200px",
    "& img": {
      "cursor": "zoom-in",
      "width": "100%",
      "height": "auto",
      "transition": "transform 300ms ease-in",
      "transform": "scale(1)",
      '@media (min-width: 991px)': {
        "minHeight": "200px",
      },
      '&:hover': {
        "transform": "scale(1.1)",
      },
    },
  },
  productName: {
    "fontWeight": "normal",
    "fontSize": "16px",
    "lineHeight": "20px",
    "marginBottom": "8px",    
    "color": "#666",
    "padding": "0 16px",
    "textAlign": "center",
  },
  productPrice: {
    "fontSize": "22px",
    "fontWeight": "700",
    "lineHeight": "22px",
    "marginBottom": "16px",
    "color": "#666",
    "padding": "0 16px",
    "textAlign": "center",
    '&:before': {
        "content": "\"$ \""
    },        
  },
  productAction: {
    "padding": "16px",
    "& button": {
      "width": "100%",
      "transition": "all 300ms ease-in",
    },
  },
})

export default function Product(props) {
    const [selectedProduct, setSelectedProduct] = useState({});
    const [quantity, setQuantity] = useState(0);
    let { image, name, price, sku, maxOrderQty, onAddToCart } = props;

    const onQuantity = (quantity) => {
      setQuantity(quantity);
    }

    var classes = useStyles();
    return (
      <div className={classes.product}>
        <div className={classes.productImage}>
          <img
            src={image}
            alt={name}
          />
        </div>
        <h4 className={classes.productName}>{name}</h4>
        <p className={classes.productPrice}>{price}</p>
        <Counter maxOrderQty={maxOrderQty} onQuantity={onQuantity}
        />
        <div className={classes.productAction}>
          <button             
            type="button"
            onClick={() => onAddToCart({image, name, price, sku, quantity})}
          >
            ADD TO CART
          </button>
        </div>
      </div>
    );
}

