import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import Product from './Product';
import NoResult from './NoResult';
import { useSiteState } from "../../../context/SiteContext";

const useStyles = makeStyles({
  productsWrapper: {
    "paddingTop": "98px",
    "animation": "slideUp 300ms linear",
    "animationDelay": "150ms",
    '@media (max-width: 991px)': {
      "paddingTop": "68px",
    },
    '@media (max-width: 480px)': {
      "paddingTop": "52px",
    }
  },
})

export default function Products(props) {
    var classes = useStyles();
    const { products, onAddToCart } = props;
    const { filter } = useSiteState();

    const ProductsView = ({products}) => (
      <>
        {products
          .filter(product => product.name.toLowerCase().includes(filter) || !filter )
          .map(product => (
          <Product
            key={product.sku}
            price={product.price}
            name={product.name}
            image={product.image}
            sku={product.sku}
            maxOrderQty={product.maxOrderQty}
            onAddToCart={onAddToCart}
          />
        ))}
      </>
    );

    let view;
    if (products.length <= 0) {
      view = <NoResult />;
    } else {
      view = (
        <ProductsView products={products}/>
      );
    }
    return <div className={classes.productsWrapper}>{view}</div>;
}
