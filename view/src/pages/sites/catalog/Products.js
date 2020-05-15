import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import Grid from "@material-ui/core/Grid";
import Product from './Product';
import NoResult from './NoResult';
import { useSiteState } from "../../../context/SiteContext";

const useStyles = makeStyles({
  productsWrapper: {
    "paddingTop": "8px",
    "animation": "slideUp 300ms linear",
    "animationDelay": "150ms",
  },
})

export default function Products(props) {
    var classes = useStyles();
    const { products, onAddToCart } = props;
    const { filter } = useSiteState();
    const filteredProducts = products.filter(product => product.name.toLowerCase().includes(filter) || !filter)
    const ProductsView = ({products}) => (
      <>
        {products
          .map(product => (
          <Grid key={product.sku} item>
          <Product
            key={product.sku}
            price={product.price}
            name={product.name}
            image={product.image}
            sku={product.sku}
            maxOrderQty={product.maxOrderQty}
            onAddToCart={onAddToCart}
          />
          </Grid>
        ))}
      </>
    );

    let view;
    if (filteredProducts.length <= 0) {
      view = <NoResult />;
    } else {
      view = (
        <ProductsView products={filteredProducts}/>
      );
    }
    return <Grid container className={classes.productsWrapper}>{view}</Grid>;
}
