import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { IndeterminateCheckBox, AddBox, } from "@material-ui/icons";

const useStyles = makeStyles({
  stepperInput: {
    display: "flex",
    color: "#666",
    maxWidth: "120px",
    margin: "0 auto",
  },
  stepperButton: {
    height: "24px",
    width: "24px",
    border: "1px solid #ccc",
    textAlign: "center",
    boxSizing: "border-box",
    borderRadius: "50%",
    textDecoration: "none",
    color: "inherit",
    fontSize: "24px",
    lineHeight: "22px",
    '&:hover': {
      color: "#077915",
      borderColor: "#077915",
    },
    '&:active': {
      color: "#fff",
      borderColor: "#077915",
      background: "#0bc122",
    },
  },
  quantity: {
    height: "24px",
    width: "48px",
    textAlign: "center",
    margin: "0 12px",
    borderRadius: "2px",
    border: "1px solid #ccc",
    '&:focus': {
      outline: "none",
      borderColor: "#077915",
    },
  },
})

export default function Counter(props) {
    const { onQuantity, maxOrderQty } = props;
    const [value, setValue] = useState(1);

    // update the parent if value is changed.
    useEffect(() => {
      onQuantity(value);
    }, [value, onQuantity]);

    const onChange = (e) => {
      setValue(e.target.value);
    }

    var classes = useStyles();
    return (
      <div className={classes.stepperInput}>
        <IndeterminateCheckBox className={classes.stepperButton} onClick={() => setValue(value > 1 ?  value - 1 : value)} />
        <input
          type="number"
          className={classes.quantity}
          value={value}
          onChange={onChange}
        />
        <AddBox className={classes.stepperButton} onClick={() => setValue(value >= maxOrderQty ? value : value + 1)} />
      </div>
    );
}
