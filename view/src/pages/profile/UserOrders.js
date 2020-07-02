import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import TablePagination from '@material-ui/core/TablePagination';  
import { useUserState } from "../../context/UserContext";
import UserOrderList from "./UserOrderList";
import Cookies from 'universal-cookie'

const useRowStyles = makeStyles({
    root: {
      '& > *': {
        borderBottom: 'unset',
      },
    },
  });

export default function UserOrders(props) {
    // load customerOrders from the API with email from UserContext. 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [count, setCount] = useState(0);
    const [orders, setOrders] = useState([]);
    const { email } = useUserState();

    const cmd = {
      host: 'lightapi.net',
      service: 'user',
      action: 'getCustomerOrder',
      version: '0.1.0',
      data: { email, offset: page * rowsPerPage, limit: rowsPerPage }
    };

    const url = '/portal/query?cmd=' + encodeURIComponent(JSON.stringify(cmd));
    const headers = {};

    const queryOrders = async (url, headers) => {
      try {
        setLoading(true);
        const response = await fetch(url, { headers, credentials: 'include'});
        if (!response.ok) {
          const error = await response.json();
          setError(error.description);
          setOrders([]);
        } else {
          const data = await response.json();
          setOrders(data.orders);
          setCount(data.total)
        }
        setLoading(false);
      } catch (e) {
        console.log(e);
        setError(e);
        setOrders([]);
        setLoading(false);
      }
    };

    useEffect(() => {
      const cookies = new Cookies();
      const headers = {'X-CSRF-TOKEN': cookies.get('csrf')};
      queryOrders(url, headers);
    }, [page, rowsPerPage]);
    
    const handleChangePage = (event, newPage) => {  
      setPage(newPage);  
    };  

    const handleChangeRowsPerPage = event => {  
      setRowsPerPage(+event.target.value);  
      setPage(0);  
    };      

    let wait;
    if(loading) {
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
            <UserOrderList {...props} orders={orders}/>
            <TablePagination  
              rowsPerPageOptions={[10, 25, 100]}  
              component="div"  
              count={count}  
              rowsPerPage={rowsPerPage}  
              page={page}  
              onChangePage={handleChangePage}  
              onChangeRowsPerPage={handleChangeRowsPerPage}  
            />  
          </div>
        )
    }
    
    return (
        <div className="App">
          {wait}
        </div>
    );
}
