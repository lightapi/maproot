import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import ReplyIcon from '@material-ui/icons/Reply'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';

import { timeConversion } from '../../Utils';
import { useApiGet } from '../../hooks/useApiGet';
import { useUserState } from "../../context/UserContext";
import OrderList from "./OrderList";

const useRowStyles = makeStyles({
    root: {
      '& > *': {
        borderBottom: 'unset',
      },
    },
  });

export default function UserOrders(props) {
    // load customerOrders from the API with email from UserContext. 
    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(25);
    const [orders, setOrders] = useState([]);
    const { email } = useUserState();
    const cmd = {
        host: 'lightapi.net',
        service: 'user',
        action: 'getCustomerOrder',
        version: '0.1.0',
        data: { email, offset, limit }
    }
    console.log("cmd = ", cmd);
    const url = '/portal/query?cmd=' + encodeURIComponent(JSON.stringify(cmd));
    const headers = {};
      
    const callback = (data) => {
        console.log("data = ", data);
        setOrders(data);
    }
    const { isLoading, data, error } = useApiGet({url, headers, callback});
    
    let wait;
    if(isLoading) {
        wait = <div><CircularProgress/></div>;
    } else if(error) {
        wait = (
          <div>
              <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        )  
    } else {
        wait = (
          <div>
            <OrderList {...props} orders={orders}/>
          </div>
        )
    }
    
    return (
        <div className="App">
          {wait}
        </div>
    );
}
