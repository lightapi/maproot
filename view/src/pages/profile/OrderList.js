import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CancelIcon from '@material-ui/icons/Cancel';
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

const useRowStyles = makeStyles({
    root: {
      '& > *': {
        borderBottom: 'unset',
      },
    },
  });

function Row(props) {
    console.log(props);
    const { row } = props;
    const classes = useRowStyles();

    const replyMessage = (userId, subject) => {
        props.history.push({pathname: '/app/form/privateMessage', state: { data : { userId, subject}}});
    };

    const deleteMessage = () => {
        if (window.confirm("Are you sure you want to delete the message?")) {
          console.log("delete the entry here");
        } 
    };

    return (
      <React.Fragment>
        <TableRow className={classes.root}>
          <TableCell component="th" scope="row">{timeConversion((new Date()).getTime() - row.timestamp)}</TableCell>
          <TableCell align="left"><ReplyIcon onClick={() => replyMessage(row.merchantUserId, row.orderId)}/>{row.merchantUserId}</TableCell>
          <TableCell align="left">{row.orderId}</TableCell>
          <TableCell align="left">{row.passCode}</TableCell>
          <TableCell align="left">{row.delivery.pickupTime}</TableCell>
          <TableCell align="left">{row.payment.method}</TableCell>
          <TableCell align="right">
              <CancelIcon onClick={() => console.log("cancel is clicked", row.timestamp, row.merchantUserId, row.orderId)} />
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
}

export default function OrderList(props) {
    const { orders } = props;
    console.log("orders = ", orders);
    return (
        <div>
            <h2>Orders</h2>
            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                    <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell align="left">Merchant</TableCell>
                        <TableCell align="left">Order Id</TableCell>
                        <TableCell align="left">Pass Code</TableCell>
                        <TableCell align="left">Delivery</TableCell>
                        <TableCell align="left">Payment</TableCell>
                        <TableCell/>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {props.orders.map((order, index) => (
                        <Row history={props.history} key={index} row={order} />
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}
