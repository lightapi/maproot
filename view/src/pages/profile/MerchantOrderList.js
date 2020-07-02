import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CheckIcon from '@material-ui/icons/Check';
import ReplyIcon from '@material-ui/icons/Reply'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import Box from '@material-ui/core/Box';
import Cookies from 'universal-cookie'
import { timeConversion } from '../../Utils';
import { useUserState } from "../../context/UserContext";

const useRowStyles = makeStyles({
    root: {
      '& > *': {
        borderBottom: 'unset',
      },
    },
  });

function Row(props) {
    console.log(props);
    const [fetching, setFetching] = useState(false);
    const { row } = props;
    const [open, setOpen] = React.useState(false);
    const classes = useRowStyles();
    var { email } = useUserState();

    const replyMessage = (userId, subject) => {
        props.history.push({pathname: '/app/form/privateMessage', state: { data : { userId, subject}}});
    };

    const deliverOrder = (customerUserId, orderId) => {
        if (window.confirm("Are you sure you want to mark the order delivered?")) {
          const body = {
            host: 'lightapi.net',
            service: 'user',
            action: 'deliverOrder',
            version: '0.1.0',
            data: { email, customerUserId, orderId }
          };
          // use the path defined in the action, default to /portal/command.
          const url = '/portal/command';
          const headers = {
              'Content-Type': 'application/json'
          };
          postApi(url, headers, body);
        } 
    };

    const postApi = async (url, headers, action) => {
      setFetching(true);
      try {
        const cookies = new Cookies();
        Object.assign(headers, {'X-CSRF-TOKEN': cookies.get('csrf')})
        const response = await fetch(url, { method: 'POST', body: JSON.stringify(action), headers, credentials: 'include'});
        // we have tried out best to response json from our APIs; however, some services return text instead like light-oauth2.
        const s = await response.text();
        console.log("submit error", s);
        const data = JSON.parse(s);
        setFetching(false);
        if (!response.ok) {
            // code is not OK.
            props.history.push({pathname: action.failure, state: { error: data }});  
        } else {
            props.history.push({pathname: action.success, state: { data }});
        }
      } catch (e) {
        // network error here.
        console.log(e);
        // convert it to json as the failure component can only deal with JSON.
        const error = { error: e };
        props.history.push({pathname: action.failure, state: { error }});
      }
    };

    return (
      <React.Fragment>
        <TableRow className={classes.root}>
          <TableCell>
            <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">{timeConversion((new Date()).getTime() - row.timestamp)}</TableCell>
          <TableCell align="left"><ReplyIcon onClick={() => replyMessage(row.merchantUserId, row.orderId)}/>{row.merchantUserId}</TableCell>
          <TableCell align="left">{row.orderId}</TableCell>
          <TableCell align="left">{row.passCode}</TableCell>
          <TableCell align="left">{row.delivery.pickupTime} {row.delivery.instruction} </TableCell>
          <TableCell align="left">{row.payment.method}</TableCell>
          <TableCell align="right">
              <CheckIcon onClick={() => deliverOrder(row.customerUserId, row.orderId)} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box margin={1}>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sku</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Qty.</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.items.map((item) => (
                      <TableRow key={item.sku}>
                        <TableCell component="th" scope="row">{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{item.price}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>        
      </React.Fragment>
    );
}

export default function MerchantOrderList(props) {
    const { orders } = props;
    console.log("props = ", props);
    return (
      <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
          <TableHead>
          <TableRow>
              <TableCell/>
              <TableCell>Time</TableCell>
              <TableCell align="left">Merchant</TableCell>
              <TableCell align="left">Order Id</TableCell>
              <TableCell align="left">Pass Code</TableCell>
              <TableCell align="left">Delivery</TableCell>
              <TableCell align="left">Payment</TableCell>
              <TableCell align="right">Deliver</TableCell>
          </TableRow>
          </TableHead>
          <TableBody>
          {orders.map((order, index) => (
              <Row history={props.history} key={index} row={order} />
          ))}
          </TableBody>
      </Table>
    </TableContainer>
  );
}
