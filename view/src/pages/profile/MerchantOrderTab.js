import React, { useState } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useApiGet } from '../../hooks/useApiGet';
import { useUserState } from "../../context/UserContext";
import MerchantOrderList from "./MerchantOrderList";

export default function MerchantOrdersTab(props) {
    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(25);
    const [orders, setOrders] = useState();
    const { email } = useUserState();
    const { status } = props;
    const cmd = {
        host: 'lightapi.net',
        service: 'user',
        action: 'getMerchantOrder',
        version: '0.1.0',
        data: { email, offset, limit, status }
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
            <MerchantOrderList {...props} orders={orders}/>
          </div>
        )
    }
    
    return (
        <div className="App">
          {wait}
        </div>
    );
}
