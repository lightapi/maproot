import React from "react";
import SearchIcon from '@material-ui/icons/Search';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
  noResult: {
    textAlign: "center"
  },  
})

const NoResult = () => {
  var classes = useStyles();
  return (
    <div>
      <div className={classes.noResult}>
        <SearchIcon/>
        <h2>Sorry, no products matched your search!</h2>
        <p>Enter a different keyword and try.</p>
      </div>
    </div>
  );
};

export default NoResult;
