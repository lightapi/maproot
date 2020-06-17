import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import MerchantOrderTab from "./MerchantOrderTab";

export default function MerchantOrders(props) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    console.log(newValue);
    setValue(newValue);
  };

  return (
    <>
    <Paper square>
      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
        aria-label="tabs order"
      >
        <Tab label="Confirmed" />
        <Tab label="Delivered" />
        <Tab label="Cancelled" />
      </Tabs>
    </Paper>
    {value === 0 ? <MerchantOrderTab {...props} status="Confirmed" /> : null}
    {value === 1 ? <MerchantOrderTab {...props} status="Delivered" /> : null}
    {value === 2 ? <MerchantOrderTab {...props} status="Cancelled" /> : null}
    </>
  );

}
